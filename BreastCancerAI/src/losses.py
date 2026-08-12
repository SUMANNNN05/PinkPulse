"""
Loss functions for segmentation (Dice, BCE, hybrid) and
classification (Focal loss for class imbalance).
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

from src.config import DICE_BCE_ALPHA


class DiceLoss(nn.Module):
    def __init__(self, smooth: float = 1.0):
        super().__init__()
        self.smooth = smooth

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        probs = torch.sigmoid(logits)
        probs = probs.view(probs.size(0), -1)
        targets = targets.view(targets.size(0), -1)

        intersection = (probs * targets).sum(dim=1)
        dice = (2.0 * intersection + self.smooth) / (
            probs.sum(dim=1) + targets.sum(dim=1) + self.smooth
        )
        return 1.0 - dice.mean()


class HybridDiceBCELoss(nn.Module):
    """alpha * Dice + (1 - alpha) * BCE-with-logits. Used for U-Net training."""

    def __init__(self, alpha: float = DICE_BCE_ALPHA):
        super().__init__()
        self.alpha = alpha
        self.dice = DiceLoss()
        self.bce = nn.BCEWithLogitsLoss()

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        dice_loss = self.dice(logits, targets)
        bce_loss = self.bce(logits, targets)
        return self.alpha * dice_loss + (1 - self.alpha) * bce_loss


class FocalLoss(nn.Module):
    """Multi-class focal loss, useful when Benign/Malignant/Normal are imbalanced."""

    def __init__(self, gamma: float = 2.0, weight: torch.Tensor = None):
        super().__init__()
        self.gamma = gamma
        self.weight = weight

    def forward(self, logits: torch.Tensor, targets: torch.Tensor) -> torch.Tensor:
        ce_loss = F.cross_entropy(logits, targets, weight=self.weight, reduction="none")
        pt = torch.exp(-ce_loss)
        focal_loss = ((1 - pt) ** self.gamma) * ce_loss
        return focal_loss.mean()


def get_segmentation_loss(alpha: float = DICE_BCE_ALPHA) -> nn.Module:
    return HybridDiceBCELoss(alpha=alpha)


def get_classification_loss(class_weights: torch.Tensor = None, use_focal: bool = True) -> nn.Module:
    if use_focal:
        return FocalLoss(gamma=2.0, weight=class_weights)
    return nn.CrossEntropyLoss(weight=class_weights)

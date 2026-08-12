"""
Metric functions used by trainer.py / evaluator.py.
Segmentation: Dice, IoU
Classification: Accuracy, Precision, Recall, Specificity, Sensitivity, F1
"""

import torch
import numpy as np
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)


# ---------------------------------------------------------------------
# Segmentation metrics
# ---------------------------------------------------------------------
@torch.no_grad()
def dice_coefficient(logits: torch.Tensor, targets: torch.Tensor, threshold: float = 0.5, smooth: float = 1e-6) -> float:
    probs = torch.sigmoid(logits)
    preds = (probs > threshold).float()
    preds = preds.view(preds.size(0), -1)
    targets = targets.view(targets.size(0), -1)

    intersection = (preds * targets).sum(dim=1)
    dice = (2.0 * intersection + smooth) / (preds.sum(dim=1) + targets.sum(dim=1) + smooth)
    return dice.mean().item()


@torch.no_grad()
def iou_score(logits: torch.Tensor, targets: torch.Tensor, threshold: float = 0.5, smooth: float = 1e-6) -> float:
    probs = torch.sigmoid(logits)
    preds = (probs > threshold).float()
    preds = preds.view(preds.size(0), -1)
    targets = targets.view(targets.size(0), -1)

    intersection = (preds * targets).sum(dim=1)
    union = preds.sum(dim=1) + targets.sum(dim=1) - intersection
    iou = (intersection + smooth) / (union + smooth)
    return iou.mean().item()


# ---------------------------------------------------------------------
# Classification metrics
# ---------------------------------------------------------------------
def classification_metrics(y_true, y_pred, num_classes: int = 3) -> dict:
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)

    acc = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average="macro", zero_division=0)
    recall = recall_score(y_true, y_pred, average="macro", zero_division=0)  # == sensitivity
    f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)

    cm = confusion_matrix(y_true, y_pred, labels=list(range(num_classes)))
    specificities = []
    for i in range(num_classes):
        tp = cm[i, i]
        fn = cm[i, :].sum() - tp
        fp = cm[:, i].sum() - tp
        tn = cm.sum() - tp - fn - fp
        spec = tn / (tn + fp) if (tn + fp) > 0 else 0.0
        specificities.append(spec)
    specificity = float(np.mean(specificities))

    return {
        "accuracy": acc,
        "precision": precision,
        "recall_sensitivity": recall,
        "specificity": specificity,
        "f1": f1,
        "confusion_matrix": cm.tolist(),
    }

"""
CNN classifier: Benign / Malignant / Normal.

Uses a torchvision ResNet18 backbone (adapted to 1-channel grayscale
input) with a dropout layer before the final FC head. The dropout
layer is what MC Dropout (src/uncertainty.py) exploits at inference
time by keeping it active across multiple forward passes.
"""

import torch
import torch.nn as nn
import torchvision.models as models

from src.config import NUM_CLASSES, CLASSIFIER_DROPOUT_P, CLASSIFIER_BACKBONE


class BreastCancerClassifier(nn.Module):
    def __init__(
        self,
        num_classes: int = NUM_CLASSES,
        backbone_name: str = CLASSIFIER_BACKBONE,
        dropout_p: float = CLASSIFIER_DROPOUT_P,
        pretrained: bool = True,
        in_channels: int = 1,
    ):
        super().__init__()

        if backbone_name == "resnet18":
            weights = models.ResNet18_Weights.DEFAULT if pretrained else None
            backbone = models.resnet18(weights=weights)
            feat_dim = backbone.fc.in_features
        elif backbone_name == "resnet34":
            weights = models.ResNet34_Weights.DEFAULT if pretrained else None
            backbone = models.resnet34(weights=weights)
            feat_dim = backbone.fc.in_features
        else:
            raise ValueError(f"Unsupported backbone: {backbone_name}")

        # Adapt first conv layer for 1-channel (grayscale) ultrasound input
        if in_channels != 3:
            old_conv = backbone.conv1
            new_conv = nn.Conv2d(
                in_channels, old_conv.out_channels,
                kernel_size=old_conv.kernel_size, stride=old_conv.stride,
                padding=old_conv.padding, bias=False,
            )
            if pretrained:
                # average the pretrained 3-channel weights into 1 channel
                with torch.no_grad():
                    new_conv.weight[:] = old_conv.weight.mean(dim=1, keepdim=True)
            backbone.conv1 = new_conv

        # Feature extractor = everything except the original fc layer
        self.features = nn.Sequential(*list(backbone.children())[:-1])  # up to avgpool
        self.dropout = nn.Dropout(p=dropout_p)
        self.fc = nn.Linear(feat_dim, num_classes)

        self.backbone_name = backbone_name
        self._target_layer_name = "layer4"  # used by Grad-CAM

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        feats = self.features(x)          # (B, C, 1, 1)
        feats = torch.flatten(feats, 1)   # (B, C)
        feats = self.dropout(feats)
        logits = self.fc(feats)           # (B, num_classes)
        return logits

    def get_target_layer(self) -> nn.Module:
        """Returns the last conv block, used as the Grad-CAM target layer."""
        for name, module in self.features.named_children():
            pass  # noop; features is Sequential of backbone children
        # backbone order: conv1,bn1,relu,maxpool,layer1,layer2,layer3,layer4,avgpool
        return self.features[7]  # layer4


if __name__ == "__main__":
    model = BreastCancerClassifier()
    dummy = torch.randn(4, 1, 256, 256)
    out = model(dummy)
    print("Output shape:", out.shape)  # (4, 3)
    n_params = sum(p.numel() for p in model.parameters())
    print(f"Params: {n_params:,}")

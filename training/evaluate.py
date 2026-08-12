"""
Evaluate both trained models on the held-out test set and generate
all report artifacts (confusion matrix, ROC, PR, calibration, dice/iou).

Usage:
    python -m training.evaluate
"""

import numpy as np
import torch
from torch.utils.data import DataLoader
import torch.nn.functional as F

from src.config import (
    DEVICE, TEST_CSV, BEST_UNET_PATH, BEST_CLASSIFIER_PATH,
    UNET_BATCH_SIZE, CLASSIFIER_BATCH_SIZE, NUM_CLASSES,
)
from src.dataset import BUSIDataset
from src.transforms import get_val_transforms
from src.unet import UNet
from src.classifier import BreastCancerClassifier
from src.metrics import dice_coefficient, iou_score, classification_metrics
from src.evaluator import (
    plot_confusion_matrix, plot_roc_curves, plot_pr_curves,
    plot_calibration_curve, plot_dice_iou_distribution,
)
from src.utils import get_logger

logger = get_logger("evaluate")


def evaluate_unet():
    ds = BUSIDataset(TEST_CSV, transforms=get_val_transforms(), return_mask=True)
    loader = DataLoader(ds, batch_size=UNET_BATCH_SIZE, shuffle=False, num_workers=4)

    model = UNet().to(DEVICE)
    model.load_state_dict(torch.load(BEST_UNET_PATH, map_location=DEVICE)["model_state_dict"])
    model.eval()

    dice_scores, iou_scores = [], []
    with torch.no_grad():
        for batch in loader:
            images = batch["image"].to(DEVICE)
            masks = batch["mask"].to(DEVICE)
            logits = model(images)

            for i in range(images.size(0)):
                d = dice_coefficient(logits[i:i+1], masks[i:i+1])
                iou = iou_score(logits[i:i+1], masks[i:i+1])
                dice_scores.append(d)
                iou_scores.append(iou)

    mean_dice = float(np.mean(dice_scores))
    mean_iou = float(np.mean(iou_scores))
    logger.info(f"U-Net Test Dice: {mean_dice:.4f} | Test IoU: {mean_iou:.4f}")

    plot_dice_iou_distribution(dice_scores, iou_scores, filename="unet_test_dice_iou.png")
    return {"mean_dice": mean_dice, "mean_iou": mean_iou}


def evaluate_classifier():
    ds = BUSIDataset(TEST_CSV, transforms=get_val_transforms(), return_mask=False)
    loader = DataLoader(ds, batch_size=CLASSIFIER_BATCH_SIZE, shuffle=False, num_workers=4)

    model = BreastCancerClassifier().to(DEVICE)
    model.load_state_dict(torch.load(BEST_CLASSIFIER_PATH, map_location=DEVICE)["model_state_dict"])
    model.eval()

    all_labels, all_preds, all_probs = [], [], []
    with torch.no_grad():
        for batch in loader:
            images = batch["image"].to(DEVICE)
            labels = batch["label"].to(DEVICE)
            logits = model(images)
            probs = F.softmax(logits, dim=1)
            preds = probs.argmax(dim=1)

            all_labels.extend(labels.cpu().numpy().tolist())
            all_preds.extend(preds.cpu().numpy().tolist())
            all_probs.extend(probs.cpu().numpy().tolist())

    all_labels = np.array(all_labels)
    all_preds = np.array(all_preds)
    all_probs = np.array(all_probs)

    metrics = classification_metrics(all_labels, all_preds, num_classes=NUM_CLASSES)
    logger.info(f"Classifier Test metrics: {metrics}")

    cm = np.array(metrics["confusion_matrix"])
    plot_confusion_matrix(cm, filename="classifier_test_confusion_matrix.png")
    plot_roc_curves(all_labels, all_probs, filename="classifier_test_roc.png")
    plot_pr_curves(all_labels, all_probs, filename="classifier_test_pr.png")

    # calibration curve for the "malignant" class (index 1) as the clinically critical one
    malignant_idx = 1
    y_true_binary = (all_labels == malignant_idx).astype(int)
    y_prob_positive = all_probs[:, malignant_idx]
    plot_calibration_curve(y_true_binary, y_prob_positive, filename="classifier_test_calibration_malignant.png")

    return metrics


if __name__ == "__main__":
    unet_metrics = evaluate_unet()
    clf_metrics = evaluate_classifier()
    logger.info("Evaluation complete. Artifacts saved under outputs/.")

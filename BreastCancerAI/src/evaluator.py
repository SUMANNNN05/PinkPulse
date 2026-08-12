"""
Generates evaluation artifacts saved into outputs/:
  - confusion_matrix/
  - roc/
  - calibration/
  - training_curves/
Used by training/evaluate.py after training completes.
"""

import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import roc_curve, auc, precision_recall_curve
from sklearn.calibration import calibration_curve

from src.config import (
    CLASS_NAMES, CONFUSION_MATRIX_OUT, ROC_OUT, CALIBRATION_OUT, TRAINING_CURVES_OUT,
)


def plot_confusion_matrix(cm: np.ndarray, filename: str = "confusion_matrix.png") -> str:
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES, ax=ax,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("True")
    ax.set_title("Confusion Matrix")
    path = os.path.join(CONFUSION_MATRIX_OUT, filename)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return path


def plot_roc_curves(y_true: np.ndarray, y_probs: np.ndarray, filename: str = "roc_curve.png") -> str:
    """y_true: (N,) int labels. y_probs: (N, num_classes) softmax probabilities."""
    n_classes = y_probs.shape[1]
    y_true_onehot = np.eye(n_classes)[y_true]

    fig, ax = plt.subplots(figsize=(6, 5))
    for i in range(n_classes):
        fpr, tpr, _ = roc_curve(y_true_onehot[:, i], y_probs[:, i])
        roc_auc = auc(fpr, tpr)
        ax.plot(fpr, tpr, label=f"{CLASS_NAMES[i]} (AUC={roc_auc:.2f})")

    ax.plot([0, 1], [0, 1], "k--", linewidth=1)
    ax.set_xlabel("False Positive Rate")
    ax.set_ylabel("True Positive Rate")
    ax.set_title("ROC Curves (One-vs-Rest)")
    ax.legend(loc="lower right")
    path = os.path.join(ROC_OUT, filename)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return path


def plot_pr_curves(y_true: np.ndarray, y_probs: np.ndarray, filename: str = "pr_curve.png") -> str:
    n_classes = y_probs.shape[1]
    y_true_onehot = np.eye(n_classes)[y_true]

    fig, ax = plt.subplots(figsize=(6, 5))
    for i in range(n_classes):
        precision, recall, _ = precision_recall_curve(y_true_onehot[:, i], y_probs[:, i])
        ax.plot(recall, precision, label=CLASS_NAMES[i])

    ax.set_xlabel("Recall")
    ax.set_ylabel("Precision")
    ax.set_title("Precision-Recall Curves")
    ax.legend(loc="lower left")
    path = os.path.join(ROC_OUT, filename)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return path


def plot_calibration_curve(y_true_binary: np.ndarray, y_prob_positive: np.ndarray,
                            filename: str = "calibration_curve.png", n_bins: int = 10) -> str:
    """For a single class treated as binary (one-vs-rest)."""
    prob_true, prob_pred = calibration_curve(y_true_binary, y_prob_positive, n_bins=n_bins)

    fig, ax = plt.subplots(figsize=(6, 5))
    ax.plot(prob_pred, prob_true, marker="o", label="Model")
    ax.plot([0, 1], [0, 1], "k--", label="Perfectly calibrated")
    ax.set_xlabel("Mean predicted probability")
    ax.set_ylabel("Fraction of positives")
    ax.set_title("Calibration Curve")
    ax.legend()
    path = os.path.join(CALIBRATION_OUT, filename)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return path


def plot_training_curves(history: dict, filename: str = "training_curves.png") -> str:
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5))

    axes[0].plot(history["train_loss"], label="train_loss")
    axes[0].plot(history["val_loss"], label="val_loss")
    axes[0].set_title("Loss")
    axes[0].set_xlabel("Epoch")
    axes[0].legend()

    axes[1].plot(history["val_metric"], label="val_metric", color="green")
    axes[1].set_title("Validation Metric")
    axes[1].set_xlabel("Epoch")
    axes[1].legend()

    path = os.path.join(TRAINING_CURVES_OUT, filename)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return path


def plot_dice_iou_distribution(dice_scores: list, iou_scores: list, filename: str = "dice_iou_dist.png") -> str:
    fig, axes = plt.subplots(1, 2, figsize=(10, 4))
    axes[0].hist(dice_scores, bins=20, color="steelblue")
    axes[0].set_title("Dice Score Distribution")
    axes[0].set_xlabel("Dice")

    axes[1].hist(iou_scores, bins=20, color="indianred")
    axes[1].set_title("IoU Score Distribution")
    axes[1].set_xlabel("IoU")

    path = os.path.join(TRAINING_CURVES_OUT, filename)
    fig.tight_layout()
    fig.savefig(path, dpi=150)
    plt.close(fig)
    return path

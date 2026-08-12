"""
Visualization helpers used in notebooks (EDA, experiments) and to
build the "Download Report" image grids for the frontend.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import cv2


def show_sample_grid(images, masks=None, titles=None, cols: int = 4, figsize=(14, 8)):
    n = len(images)
    rows = int(np.ceil(n / cols))
    fig, axes = plt.subplots(rows, cols, figsize=figsize)
    axes = np.array(axes).reshape(-1)

    for i in range(len(axes)):
        ax = axes[i]
        if i < n:
            ax.imshow(images[i], cmap="gray")
            if masks is not None and masks[i] is not None:
                ax.imshow(masks[i], cmap="jet", alpha=0.3)
            if titles is not None:
                ax.set_title(titles[i], fontsize=10)
        ax.axis("off")

    fig.tight_layout()
    return fig


def build_report_panel(original_bgr, mask_overlay_bgr, gradcam_overlay_bgr, prediction: str, confidence: float) -> np.ndarray:
    """Stitches original / segmentation / Grad-CAM side by side with a title bar,
    used to build the downloadable PDF/PNG report shown in the frontend."""
    h, w = original_bgr.shape[:2]
    panel = np.hstack([
        cv2.resize(original_bgr, (w, h)),
        cv2.resize(mask_overlay_bgr, (w, h)),
        cv2.resize(gradcam_overlay_bgr, (w, h)),
    ])

    header = np.full((50, panel.shape[1], 3), 255, dtype=np.uint8)
    text = f"Prediction: {prediction}  |  Confidence: {confidence*100:.1f}%"
    cv2.putText(header, text, (15, 32), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (20, 20, 20), 2)

    labels = np.full((30, panel.shape[1], 3), 255, dtype=np.uint8)
    for i, label in enumerate(["Original", "Segmentation", "Grad-CAM"]):
        cv2.putText(labels, label, (15 + i * w, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (60, 60, 60), 1)

    return np.vstack([header, labels, panel])

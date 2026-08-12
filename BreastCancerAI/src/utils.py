"""
Shared utility functions: seeding, checkpointing, logging helpers,
and small image conversion helpers reused across the codebase.
"""

import os
import random
import logging

import numpy as np
import torch
import cv2


def set_seed(seed: int = 42) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s | %(name)s | %(levelname)s | %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


def save_checkpoint(state: dict, path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(state, path)


def load_checkpoint(model, path: str, device, optimizer=None) -> dict:
    checkpoint = torch.load(path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    if optimizer is not None and "optimizer_state_dict" in checkpoint:
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])
    return checkpoint


class EarlyStopping:
    """Stops training when monitored metric stops improving."""

    def __init__(self, patience: int = 10, mode: str = "min", min_delta: float = 1e-4):
        self.patience = patience
        self.mode = mode
        self.min_delta = min_delta
        self.best_score = None
        self.counter = 0
        self.should_stop = False

    def step(self, score: float) -> bool:
        if self.best_score is None:
            self.best_score = score
            return True  # first epoch counts as improvement

        improved = (
            score < self.best_score - self.min_delta
            if self.mode == "min"
            else score > self.best_score + self.min_delta
        )

        if improved:
            self.best_score = score
            self.counter = 0
            return True

        self.counter += 1
        if self.counter >= self.patience:
            self.should_stop = True
        return False


def tensor_to_numpy_image(tensor: torch.Tensor) -> np.ndarray:
    """Denormalize a (C,H,W) tensor (mean=0.5,std=0.5) back to uint8 HxWxC."""
    img = tensor.detach().cpu().numpy()
    img = (img * 0.5 + 0.5) * 255.0
    img = np.clip(img, 0, 255).astype(np.uint8)
    if img.shape[0] == 1:
        img = img[0]
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    else:
        img = np.transpose(img, (1, 2, 0))
    return img


def overlay_mask_on_image(image: np.ndarray, mask: np.ndarray, color=(0, 0, 255), alpha=0.4) -> np.ndarray:
    """Overlay a binary mask (0/1 or 0/255) on a BGR image."""
    mask_bin = (mask > 0).astype(np.uint8)
    colored = np.zeros_like(image)
    colored[mask_bin == 1] = color
    return cv2.addWeighted(image, 1.0, colored, alpha, 0)


def overlay_heatmap_on_image(image: np.ndarray, heatmap: np.ndarray, alpha: float = 0.45) -> np.ndarray:
    """Overlay a normalized (0-1) Grad-CAM heatmap on a BGR image."""
    heatmap_uint8 = np.uint8(255 * np.clip(heatmap, 0, 1))
    colored_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    return cv2.addWeighted(image, 1 - alpha, colored_heatmap, alpha, 0)

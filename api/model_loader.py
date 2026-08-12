"""
Loads the U-Net + Classifier once at API startup and exposes them
(and the shared InferencePipeline) to routes.py via app.state.
"""

import os

from src.config import BEST_UNET_PATH, BEST_CLASSIFIER_PATH, DEVICE
from src.inference import InferencePipeline
from src.utils import get_logger

logger = get_logger("model_loader")


def load_pipeline() -> InferencePipeline:
    if not os.path.exists(BEST_UNET_PATH):
        raise FileNotFoundError(
            f"U-Net checkpoint not found at {BEST_UNET_PATH}. Run training/train_unet.py first."
        )
    if not os.path.exists(BEST_CLASSIFIER_PATH):
        raise FileNotFoundError(
            f"Classifier checkpoint not found at {BEST_CLASSIFIER_PATH}. Run training/train_classifier.py first."
        )

    logger.info("Loading models onto device: %s", DEVICE)
    pipeline = InferencePipeline(
        unet_ckpt=BEST_UNET_PATH,
        classifier_ckpt=BEST_CLASSIFIER_PATH,
        device=DEVICE,
    )
    logger.info("Models loaded successfully.")
    return pipeline

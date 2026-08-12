"""
End-to-end inference pipeline:
  image -> preprocess -> U-Net -> mask -> classifier -> GradCAM -> MC Dropout -> result dict

This is the single entry point used by inference/predict.py and by
the FastAPI routes, so the API and CLI never diverge in behaviour.
"""

import base64
from typing import Optional

import cv2
import numpy as np
import torch

from src.config import (
    DEVICE, IMAGE_SIZE, BEST_UNET_PATH, BEST_CLASSIFIER_PATH,
    CLASSIFIER_USE_SEGMENTED_INPUT, MC_DROPOUT_PASSES,
)
from src.unet import UNet
from src.classifier import BreastCancerClassifier
from src.transforms import get_inference_transforms
from src.gradcam import generate_gradcam_for_image
from src.uncertainty import mc_dropout_predict
from src.utils import tensor_to_numpy_image, overlay_mask_on_image, get_logger

logger = get_logger("inference")


def _encode_image_base64(image_bgr: np.ndarray) -> str:
    success, buffer = cv2.imencode(".png", image_bgr)
    if not success:
        raise RuntimeError("Failed to encode image")
    return base64.b64encode(buffer).decode("utf-8")


class InferencePipeline:
    """Loads both models once and exposes a single .predict(image) call."""

    def __init__(
        self,
        unet_ckpt: str = BEST_UNET_PATH,
        classifier_ckpt: str = BEST_CLASSIFIER_PATH,
        device: torch.device = DEVICE,
    ):
        self.device = device

        self.unet = UNet().to(device)
        self.unet.load_state_dict(torch.load(unet_ckpt, map_location=device)["model_state_dict"])
        self.unet.eval()

        self.classifier = BreastCancerClassifier().to(device)
        self.classifier.load_state_dict(
            torch.load(classifier_ckpt, map_location=device)["model_state_dict"]
        )
        self.classifier.eval()

        self.transforms = get_inference_transforms()

        logger.info("InferencePipeline loaded U-Net + Classifier on %s", device)

    def _preprocess(self, image_gray: np.ndarray) -> torch.Tensor:
        augmented = self.transforms(image=image_gray, mask=np.zeros_like(image_gray))
        tensor = augmented["image"].unsqueeze(0).to(self.device)  # (1,1,H,W)
        return tensor

    @torch.no_grad()
    def _segment(self, input_tensor: torch.Tensor) -> np.ndarray:
        logits = self.unet(input_tensor)
        probs = torch.sigmoid(logits)
        mask = (probs > 0.5).float()[0, 0].cpu().numpy()  # (H,W) in {0,1}
        return mask

    def predict(self, image_gray: np.ndarray, mc_passes: int = MC_DROPOUT_PASSES) -> dict:
        """
        image_gray: single-channel numpy array (raw ultrasound, any size).
        Returns a dict matching the API's PredictionResponse schema.
        """
        input_tensor = self._preprocess(image_gray)

        # 1. Segmentation
        mask = self._segment(input_tensor)

        # 2. Build classifier input (raw image or masked ROI depending on config)
        if CLASSIFIER_USE_SEGMENTED_INPUT:
            mask_tensor = torch.from_numpy(mask).unsqueeze(0).unsqueeze(0).to(self.device)
            classifier_input = input_tensor * mask_tensor
        else:
            classifier_input = input_tensor

        # 3. Grad-CAM (single deterministic pass, dropout off)
        self.classifier.eval()
        gradcam_result = generate_gradcam_for_image(self.classifier, classifier_input)

        # 4. MC Dropout uncertainty (stochastic passes, dropout on)
        uncertainty_result = mc_dropout_predict(self.classifier, classifier_input, n_passes=mc_passes)

        # 5. Build visual outputs
        base_image_bgr = tensor_to_numpy_image(input_tensor[0])
        mask_uint8 = (mask * 255).astype(np.uint8)
        mask_resized = cv2.resize(mask_uint8, (base_image_bgr.shape[1], base_image_bgr.shape[0]))
        segmentation_overlay = overlay_mask_on_image(base_image_bgr, mask_resized)

        tumor_area_px = int((mask > 0).sum())
        total_px = mask.size
        tumor_area_pct = round(100.0 * tumor_area_px / total_px, 2)

        return {
            "prediction": uncertainty_result["predicted_class_name"],
            "confidence": round(uncertainty_result["confidence"], 4),
            "class_probabilities": uncertainty_result["class_probs"],
            "uncertainty": {
                "predictive_entropy": round(uncertainty_result["predictive_entropy"], 4),
                "mutual_information": round(uncertainty_result["mutual_information"], 4),
                "label": uncertainty_result["uncertainty_label"],
                "n_passes": uncertainty_result["n_passes"],
            },
            "segmentation": {
                "tumor_area_px": tumor_area_px,
                "tumor_area_pct": tumor_area_pct,
                "mask_base64": _encode_image_base64(mask_resized),
                "overlay_base64": _encode_image_base64(segmentation_overlay),
            },
            "gradcam": {
                "overlay_base64": _encode_image_base64(gradcam_result["overlay"]),
            },
            "original_image_base64": _encode_image_base64(base_image_bgr),
        }


_pipeline_singleton: Optional[InferencePipeline] = None


def get_pipeline() -> InferencePipeline:
    """Lazily instantiate a single shared pipeline (used by FastAPI)."""
    global _pipeline_singleton
    if _pipeline_singleton is None:
        _pipeline_singleton = InferencePipeline()
    return _pipeline_singleton

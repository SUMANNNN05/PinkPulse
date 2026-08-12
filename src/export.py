"""
Export trained checkpoints to TorchScript (.pt) and ONNX (.onnx)
for faster / cross-platform deployment. Run as a script after training.
"""

import torch

from src.config import (
    DEVICE, IMAGE_SIZE, BEST_UNET_PATH, BEST_CLASSIFIER_PATH,
    UNET_TS_PATH, CLASSIFIER_TS_PATH, UNET_ONNX_PATH, CLASSIFIER_ONNX_PATH,
)
from src.unet import UNet
from src.classifier import BreastCancerClassifier
from src.utils import get_logger

logger = get_logger("export")


def export_torchscript(model: torch.nn.Module, dummy_input: torch.Tensor, out_path: str) -> None:
    model.eval()
    traced = torch.jit.trace(model, dummy_input)
    traced.save(out_path)
    logger.info(f"Saved TorchScript model to {out_path}")


def export_onnx(model: torch.nn.Module, dummy_input: torch.Tensor, out_path: str, input_names, output_names) -> None:
    model.eval()
    torch.onnx.export(
        model,
        dummy_input,
        out_path,
        input_names=input_names,
        output_names=output_names,
        dynamic_axes={input_names[0]: {0: "batch"}, output_names[0]: {0: "batch"}},
        opset_version=17,
    )
    logger.info(f"Saved ONNX model to {out_path}")


def export_unet():
    model = UNet().to(DEVICE)
    model.load_state_dict(torch.load(BEST_UNET_PATH, map_location=DEVICE)["model_state_dict"])
    dummy = torch.randn(1, 1, IMAGE_SIZE, IMAGE_SIZE).to(DEVICE)
    export_torchscript(model, dummy, UNET_TS_PATH)
    export_onnx(model, dummy, UNET_ONNX_PATH, ["ultrasound_image"], ["segmentation_mask"])


def export_classifier():
    model = BreastCancerClassifier().to(DEVICE)
    model.load_state_dict(torch.load(BEST_CLASSIFIER_PATH, map_location=DEVICE)["model_state_dict"])
    dummy = torch.randn(1, 1, IMAGE_SIZE, IMAGE_SIZE).to(DEVICE)
    export_torchscript(model, dummy, CLASSIFIER_TS_PATH)
    export_onnx(model, dummy, CLASSIFIER_ONNX_PATH, ["ultrasound_image"], ["class_logits"])


if __name__ == "__main__":
    export_unet()
    export_classifier()
    logger.info("Export complete.")

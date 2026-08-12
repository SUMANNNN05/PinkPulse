"""
Grad-CAM implementation for the CNN classifier.
Produces a class-discriminative heatmap highlighting the image
regions that most influenced the predicted class, and an overlay
image combining the original ultrasound with the heatmap.
"""

import cv2
import numpy as np
import torch
import torch.nn.functional as F

from src.utils import tensor_to_numpy_image, overlay_heatmap_on_image


class GradCAM:
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module = None):
        self.model = model
        self.model.eval()
        self.target_layer = target_layer or model.get_target_layer()

        self.activations = None
        self.gradients = None

        self._fwd_handle = self.target_layer.register_forward_hook(self._save_activation)
        self._bwd_handle = self.target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output.detach()

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def remove_hooks(self):
        self._fwd_handle.remove()
        self._bwd_handle.remove()

    def generate(self, input_tensor: torch.Tensor, target_class: int = None) -> tuple:
        """
        input_tensor: (1, C, H, W)
        Returns: (heatmap [H,W] in 0-1, predicted_class:int, confidence:float)
        """
        self.model.zero_grad()
        logits = self.model(input_tensor)                 # (1, num_classes)
        probs = F.softmax(logits, dim=1)

        if target_class is None:
            target_class = int(torch.argmax(probs, dim=1).item())
        confidence = float(probs[0, target_class].item())

        score = logits[0, target_class]
        score.backward(retain_graph=True)

        gradients = self.gradients[0]      # (C, h, w)
        activations = self.activations[0]  # (C, h, w)

        weights = gradients.mean(dim=(1, 2))  # (C,) global average pooling of gradients
        cam = torch.zeros(activations.shape[1:], dtype=torch.float32, device=activations.device)
        for c, w in enumerate(weights):
            cam += w * activations[c]

        cam = F.relu(cam)
        cam = cam - cam.min()
        if cam.max() > 0:
            cam = cam / cam.max()

        # resize to input resolution
        cam = cam.cpu().numpy()
        h, w = input_tensor.shape[2], input_tensor.shape[3]
        cam_resized = cv2.resize(cam, (w, h))

        return cam_resized, target_class, confidence

    def generate_overlay(self, input_tensor: torch.Tensor, target_class: int = None) -> tuple:
        """Returns (overlay_bgr_image, predicted_class, confidence, raw_heatmap)."""
        heatmap, pred_class, confidence = self.generate(input_tensor, target_class)
        base_image = tensor_to_numpy_image(input_tensor[0])
        overlay = overlay_heatmap_on_image(base_image, heatmap)
        return overlay, pred_class, confidence, heatmap


def generate_gradcam_for_image(model, input_tensor: torch.Tensor) -> dict:
    """Convenience wrapper used by inference.py / api routes."""
    cam = GradCAM(model)
    overlay, pred_class, confidence, heatmap = cam.generate_overlay(input_tensor)
    cam.remove_hooks()
    return {
        "overlay": overlay,
        "heatmap": heatmap,
        "predicted_class": pred_class,
        "confidence": confidence,
    }

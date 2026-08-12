"""
Monte Carlo Dropout uncertainty estimation.

At inference time, dropout layers are normally disabled (model.eval()).
MC Dropout keeps dropout ACTIVE and runs N stochastic forward passes,
treating the spread of predictions as an approximation of the model's
epistemic (knowledge) uncertainty - see Gal & Ghahramani, 2016.
"""

from typing import Dict

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from src.config import MC_DROPOUT_PASSES, IDX_TO_CLASS


def _enable_dropout(model: nn.Module) -> None:
    """Set only Dropout layers to train mode; keep BatchNorm etc. in eval mode."""
    for module in model.modules():
        if isinstance(module, nn.Dropout):
            module.train()


@torch.no_grad()
def mc_dropout_predict(
    model: nn.Module,
    input_tensor: torch.Tensor,
    n_passes: int = MC_DROPOUT_PASSES,
) -> Dict:
    """
    Runs n_passes stochastic forward passes with dropout active.

    Returns dict with:
      mean_probs      : (num_classes,) averaged softmax probabilities
      predicted_class  : int, argmax of mean_probs
      confidence       : float, mean_probs[predicted_class]
      variance         : (num_classes,) per-class variance across passes
      predictive_entropy: float, entropy of mean_probs (total uncertainty)
      mean_entropy     : float, average per-pass entropy (aleatoric component)
      mutual_information: float, predictive_entropy - mean_entropy (epistemic component)
      uncertainty_label : "Low" | "Medium" | "High"
    """
    model.eval()          # BatchNorm/etc. stay in eval mode
    _enable_dropout(model)  # ...but dropout layers are forced back to train mode

    all_probs = []
    for _ in range(n_passes):
        logits = model(input_tensor)
        probs = F.softmax(logits, dim=1)
        all_probs.append(probs.cpu().numpy())

    all_probs = np.concatenate(all_probs, axis=0)  # (n_passes, num_classes)

    mean_probs = all_probs.mean(axis=0)
    variance = all_probs.var(axis=0)
    predicted_class = int(np.argmax(mean_probs))
    confidence = float(mean_probs[predicted_class])

    eps = 1e-12
    predictive_entropy = float(-np.sum(mean_probs * np.log(mean_probs + eps)))
    per_pass_entropy = -np.sum(all_probs * np.log(all_probs + eps), axis=1)
    mean_entropy = float(per_pass_entropy.mean())
    mutual_information = predictive_entropy - mean_entropy

    uncertainty_label = _categorize_uncertainty(predictive_entropy)

    return {
        "mean_probs": mean_probs.tolist(),
        "class_probs": {IDX_TO_CLASS[i]: float(p) for i, p in enumerate(mean_probs)},
        "predicted_class": predicted_class,
        "predicted_class_name": IDX_TO_CLASS[predicted_class],
        "confidence": confidence,
        "variance": variance.tolist(),
        "predictive_entropy": predictive_entropy,
        "mean_entropy": mean_entropy,
        "mutual_information": float(mutual_information),
        "uncertainty_label": uncertainty_label,
        "n_passes": n_passes,
    }


def _categorize_uncertainty(entropy: float) -> str:
    """Rough thresholds for a 3-class problem (max entropy = ln(3) ~= 1.0986)."""
    if entropy < 0.35:
        return "Low"
    elif entropy < 0.75:
        return "Medium"
    return "High"

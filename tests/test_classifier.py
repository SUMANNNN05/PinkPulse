import torch
from src.classifier import BreastCancerClassifier
from src.uncertainty import mc_dropout_predict
from src.gradcam import GradCAM


def test_classifier_output_shape():
    model = BreastCancerClassifier(pretrained=False)
    x = torch.randn(4, 1, 256, 256)
    out = model(x)
    assert out.shape == (4, 3)


def test_mc_dropout_predict_structure():
    model = BreastCancerClassifier(pretrained=False)
    x = torch.randn(1, 1, 256, 256)
    result = mc_dropout_predict(model, x, n_passes=5)

    assert "predicted_class_name" in result
    assert result["predicted_class_name"] in ("benign", "malignant", "normal")
    assert 0.0 <= result["confidence"] <= 1.0
    assert result["uncertainty_label"] in ("Low", "Medium", "High")
    assert len(result["mean_probs"]) == 3


def test_gradcam_produces_valid_heatmap():
    model = BreastCancerClassifier(pretrained=False)
    x = torch.randn(1, 1, 256, 256, requires_grad=False)
    cam = GradCAM(model)
    heatmap, pred_class, confidence = cam.generate(x)
    cam.remove_hooks()

    assert heatmap.shape == (256, 256)
    assert heatmap.min() >= 0.0
    assert heatmap.max() <= 1.0 + 1e-5
    assert pred_class in (0, 1, 2)

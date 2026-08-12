import torch
from src.unet import UNet
from src.losses import get_segmentation_loss
from src.metrics import dice_coefficient, iou_score


def test_unet_output_shape():
    model = UNet()
    x = torch.randn(2, 1, 256, 256)
    out = model(x)
    assert out.shape == (2, 1, 256, 256)


def test_unet_loss_is_finite():
    model = UNet()
    x = torch.randn(2, 1, 256, 256)
    y = torch.randint(0, 2, (2, 1, 256, 256)).float()
    logits = model(x)
    loss_fn = get_segmentation_loss()
    loss = loss_fn(logits, y)
    assert torch.isfinite(loss)


def test_dice_and_iou_bounds():
    logits = torch.randn(4, 1, 64, 64)
    targets = torch.randint(0, 2, (4, 1, 64, 64)).float()
    dice = dice_coefficient(logits, targets)
    iou = iou_score(logits, targets)
    assert 0.0 <= dice <= 1.0
    assert 0.0 <= iou <= 1.0


def test_perfect_prediction_gives_dice_one():
    targets = torch.ones(1, 1, 8, 8)
    logits = torch.full((1, 1, 8, 8), 10.0)  # sigmoid(10) ~= 1
    dice = dice_coefficient(logits, targets)
    assert dice > 0.99

"""
Basic sanity tests for the dataset pipeline. Run with: pytest tests/
Requires the BUSI dataset to be present at data/raw/Dataset_BUSI_with_GT
and train.csv/val.csv/test.csv to already be built via src/dataset.py.
"""

import os
import pytest
import torch

from src.config import TRAIN_CSV, IMAGE_SIZE
from src.dataset import BUSIDataset
from src.transforms import get_val_transforms


@pytest.mark.skipif(not os.path.exists(TRAIN_CSV), reason="train.csv not built yet")
def test_dataset_returns_expected_shapes():
    ds = BUSIDataset(TRAIN_CSV, transforms=get_val_transforms(), return_mask=True)
    sample = ds[0]

    assert sample["image"].shape == (1, IMAGE_SIZE, IMAGE_SIZE)
    assert sample["mask"].shape == (1, IMAGE_SIZE, IMAGE_SIZE)
    assert sample["label"].item() in (0, 1, 2)
    assert isinstance(sample["image"], torch.Tensor)


@pytest.mark.skipif(not os.path.exists(TRAIN_CSV), reason="train.csv not built yet")
def test_mask_values_are_binary():
    ds = BUSIDataset(TRAIN_CSV, transforms=get_val_transforms(), return_mask=True)
    sample = ds[0]
    unique_vals = torch.unique(sample["mask"])
    assert set(unique_vals.tolist()).issubset({0.0, 1.0})

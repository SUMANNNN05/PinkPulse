"""
BUSI (Breast Ultrasound Images) dataset loader.

Expected raw layout (as distributed on Kaggle):

    Dataset_BUSI_with_GT/
        benign/
            benign (1).png
            benign (1)_mask.png
            benign (1)_mask_1.png      <- some images have >1 mask (multiple lesions)
            ...
        malignant/
            ...
        normal/
            normal (1).png
            normal (1)_mask.png        <- all-zero mask, no lesion

This module builds a flat index (image_path, [mask_paths], label),
merges multiple masks per image via logical OR, and returns
(image_tensor, mask_tensor, label_int) triples.
"""

import os
import glob
from dataclasses import dataclass
from typing import List, Optional

import cv2
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from sklearn.model_selection import train_test_split

from src.config import (
    RAW_DATA_DIR, CLASS_NAMES, CLASS_TO_IDX, SEED,
    TRAIN_SPLIT, VAL_SPLIT, TEST_SPLIT,
    TRAIN_CSV, VAL_CSV, TEST_CSV,
)


@dataclass
class Sample:
    image_path: str
    mask_paths: List[str]
    label: int
    class_name: str


def _collect_samples(raw_dir: str = RAW_DATA_DIR) -> List[Sample]:
    """Scan the raw BUSI folder and build a list of Sample objects,
    grouping every '<name>_mask*.png' under its base image."""
    samples: List[Sample] = []

    for class_name in CLASS_NAMES:
        class_dir = os.path.join(raw_dir, class_name)
        if not os.path.isdir(class_dir):
            raise FileNotFoundError(
                f"Expected class folder not found: {class_dir}. "
                f"Check that BUSI dataset is extracted under {raw_dir}"
            )

        all_pngs = sorted(glob.glob(os.path.join(class_dir, "*.png")))
        # base images do NOT contain "_mask" in the filename
        base_images = [p for p in all_pngs if "_mask" not in os.path.basename(p)]

        for img_path in base_images:
            stem = os.path.splitext(os.path.basename(img_path))[0]  # e.g. "benign (12)"
            mask_glob = os.path.join(class_dir, f"{stem}_mask*.png")
            mask_paths = sorted(glob.glob(mask_glob))

            samples.append(
                Sample(
                    image_path=img_path,
                    mask_paths=mask_paths,
                    label=CLASS_TO_IDX[class_name],
                    class_name=class_name,
                )
            )

    return samples


def build_splits_csv(raw_dir: str = RAW_DATA_DIR, seed: int = SEED) -> None:
    """Create train/val/test CSVs (stratified by class) from the raw folder.
    Run this once before training; downstream code reads the CSVs."""
    samples = _collect_samples(raw_dir)
    rows = [
        {
            "image_path": s.image_path,
            "mask_paths": ";".join(s.mask_paths),
            "label": s.label,
            "class_name": s.class_name,
        }
        for s in samples
    ]
    df = pd.DataFrame(rows)

    train_df, temp_df = train_test_split(
        df, test_size=(1 - TRAIN_SPLIT), stratify=df["label"], random_state=seed
    )
    relative_val = VAL_SPLIT / (VAL_SPLIT + TEST_SPLIT)
    val_df, test_df = train_test_split(
        temp_df, test_size=(1 - relative_val), stratify=temp_df["label"], random_state=seed
    )

    os.makedirs(os.path.dirname(TRAIN_CSV), exist_ok=True)
    train_df.to_csv(TRAIN_CSV, index=False)
    val_df.to_csv(VAL_CSV, index=False)
    test_df.to_csv(TEST_CSV, index=False)

    print(f"Train: {len(train_df)}  Val: {len(val_df)}  Test: {len(test_df)}")


def _merge_masks(mask_paths: List[str], shape) -> np.ndarray:
    """Logical-OR merge of all mask files belonging to one image.
    Returns a single-channel uint8 mask (0/255). If no masks exist
    (shouldn't happen for benign/malignant, common for 'normal'),
    returns an all-zero mask."""
    merged = np.zeros(shape[:2], dtype=np.uint8)
    for mp in mask_paths:
        if not mp or not os.path.exists(mp):
            continue
        m = cv2.imread(mp, cv2.IMREAD_GRAYSCALE)
        if m is None:
            continue
        if m.shape[:2] != shape[:2]:
            m = cv2.resize(m, (shape[1], shape[0]), interpolation=cv2.INTER_NEAREST)
        merged = np.maximum(merged, (m > 127).astype(np.uint8) * 255)
    return merged


class BUSIDataset(Dataset):
    """PyTorch Dataset returning (image, mask, label) for joint
    segmentation + classification training, or just (image, label)
    when segmentation is not needed (set return_mask=False)."""

    def __init__(self, csv_path: str, transforms=None, return_mask: bool = True):
        self.df = pd.read_csv(csv_path)
        self.transforms = transforms
        self.return_mask = return_mask

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int):
        row = self.df.iloc[idx]
        image = cv2.imread(row["image_path"], cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise FileNotFoundError(row["image_path"])

        label = int(row["label"])

        if self.return_mask:
            mask_paths = str(row["mask_paths"]).split(";") if pd.notna(row["mask_paths"]) else []
            mask = _merge_masks(mask_paths, image.shape)
        else:
            mask = np.zeros(image.shape[:2], dtype=np.uint8)

        if self.transforms is not None:
            augmented = self.transforms(image=image, mask=mask)
            image_t = augmented["image"]           # (1,H,W) float tensor
            mask_t = augmented["mask"]
        else:
            image_t = torch.from_numpy(image).unsqueeze(0).float() / 255.0
            mask_t = torch.from_numpy(mask)

        mask_t = (mask_t > 0).float()
        if mask_t.ndim == 2:
            mask_t = mask_t.unsqueeze(0)            # (1,H,W)

        return {
            "image": image_t,
            "mask": mask_t,
            "label": torch.tensor(label, dtype=torch.long),
            "image_path": row["image_path"],
        }


def get_class_weights(csv_path: str = TRAIN_CSV) -> torch.Tensor:
    """Inverse-frequency class weights, useful for imbalanced CrossEntropyLoss."""
    df = pd.read_csv(csv_path)
    counts = df["label"].value_counts().sort_index()
    weights = 1.0 / counts.values
    weights = weights / weights.sum() * len(counts)
    return torch.tensor(weights, dtype=torch.float32)


if __name__ == "__main__":
    build_splits_csv()

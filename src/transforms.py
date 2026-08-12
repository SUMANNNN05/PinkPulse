"""
Albumentations-based transforms shared by training and inference.
Image + mask are transformed jointly so spatial augmentations
(flip, rotate, elastic) stay aligned between the two.
"""

import albumentations as A
from albumentations.pytorch import ToTensorV2

from src.config import IMAGE_SIZE


def get_train_transforms(image_size: int = IMAGE_SIZE) -> A.Compose:
    return A.Compose(
        [
            A.Resize(image_size, image_size),
            A.HorizontalFlip(p=0.5),
            A.VerticalFlip(p=0.2),
            A.RandomRotate90(p=0.3),
            A.Affine(
                scale=(0.9, 1.1),
                translate_percent=(-0.05, 0.05),
                rotate=(-15, 15),
                p=0.5,
            ),
            A.RandomBrightnessContrast(
                brightness_limit=0.15, contrast_limit=0.15, p=0.4
            ),
            A.GaussNoise(std_range=(0.05, 0.2), p=0.2),
            A.ElasticTransform(alpha=1, sigma=20, p=0.15),
            A.Normalize(mean=(0.5,), std=(0.5,)),
            ToTensorV2(),
        ]
    )


def get_val_transforms(image_size: int = IMAGE_SIZE) -> A.Compose:
    return A.Compose(
        [
            A.Resize(image_size, image_size),
            A.Normalize(mean=(0.5,), std=(0.5,)),
            ToTensorV2(),
        ]
    )


def get_inference_transforms(image_size: int = IMAGE_SIZE) -> A.Compose:
    """Same as validation - deterministic, no augmentation."""
    return get_val_transforms(image_size)
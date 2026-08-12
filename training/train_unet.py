"""
Train the U-Net segmentation model.

Usage:
    python -m training.train_unet
"""

import sys
import torch
from torch.utils.data import DataLoader

from src.config import (
    DEVICE, TRAIN_CSV, VAL_CSV, UNET_BATCH_SIZE, UNET_LR, UNET_EPOCHS,
    UNET_EARLY_STOP_PATIENCE, BEST_UNET_PATH, LAST_UNET_PATH, SEED,
)
from src.dataset import BUSIDataset
from src.transforms import get_train_transforms, get_val_transforms
from src.unet import UNet
from src.losses import get_segmentation_loss
from src.trainer import Trainer
from src.evaluator import plot_training_curves
from src.utils import set_seed, get_logger

logger = get_logger("train_unet")


def main():
    set_seed(SEED)
    
    # Device and worker configuration for macOS / CUDA
    use_pin_memory = torch.cuda.is_available()
    num_workers = 0 if sys.platform == "darwin" else 4  # 0 prevents deadlocks on macOS

    train_ds = BUSIDataset(TRAIN_CSV, transforms=get_train_transforms(), return_mask=True)
    val_ds = BUSIDataset(VAL_CSV, transforms=get_val_transforms(), return_mask=True)

    # pin_memory belongs HERE in DataLoader
    train_loader = DataLoader(
        train_ds, 
        batch_size=UNET_BATCH_SIZE, 
        shuffle=True, 
        num_workers=num_workers, 
        pin_memory=use_pin_memory
    )
    val_loader = DataLoader(
        val_ds, 
        batch_size=UNET_BATCH_SIZE, 
        shuffle=False, 
        num_workers=num_workers, 
        pin_memory=use_pin_memory
    )

    model = UNet().to(DEVICE)
    loss_fn = get_segmentation_loss()
    optimizer = torch.optim.Adam(model.parameters(), lr=UNET_LR, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=5)

    # pin_memory is REMOVED from Trainer
    trainer = Trainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        loss_fn=loss_fn,
        optimizer=optimizer,
        device=DEVICE,
        task="segmentation",
        scheduler=scheduler,
        early_stop_patience=UNET_EARLY_STOP_PATIENCE,
        best_ckpt_path=BEST_UNET_PATH,
        last_ckpt_path=LAST_UNET_PATH,
        use_amp=False,
    )

    history = trainer.fit(epochs=UNET_EPOCHS)
    plot_training_curves(history, filename="unet_training_curves.png")
    logger.info("U-Net training complete. Best model saved to %s", BEST_UNET_PATH)


if __name__ == "__main__":
    main()
"""
Train the CNN classifier (Benign / Malignant / Normal).

Usage:
    python -m training.train_classifier
"""

import torch
from torch.utils.data import DataLoader

from src.config import (
    DEVICE, TRAIN_CSV, VAL_CSV, CLASSIFIER_BATCH_SIZE, CLASSIFIER_LR,
    CLASSIFIER_EPOCHS, CLASSIFIER_EARLY_STOP_PATIENCE,
    BEST_CLASSIFIER_PATH, LAST_CLASSIFIER_PATH, SEED,
)
from src.dataset import BUSIDataset, get_class_weights
from src.transforms import get_train_transforms, get_val_transforms
from src.classifier import BreastCancerClassifier
from src.losses import get_classification_loss
from src.trainer import Trainer
from src.evaluator import plot_training_curves
from src.utils import set_seed, get_logger

logger = get_logger("train_classifier")


def main():
    set_seed(SEED)

    train_ds = BUSIDataset(TRAIN_CSV, transforms=get_train_transforms(), return_mask=False)
    val_ds = BUSIDataset(VAL_CSV, transforms=get_val_transforms(), return_mask=False)

    train_loader = DataLoader(train_ds, batch_size=CLASSIFIER_BATCH_SIZE, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=CLASSIFIER_BATCH_SIZE, shuffle=False, num_workers=4, pin_memory=True)

    class_weights = get_class_weights(TRAIN_CSV).to(DEVICE)

    model = BreastCancerClassifier().to(DEVICE)
    loss_fn = get_classification_loss(class_weights=class_weights, use_focal=True)
    optimizer = torch.optim.AdamW(model.parameters(), lr=CLASSIFIER_LR, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=CLASSIFIER_EPOCHS)

    trainer = Trainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        loss_fn=loss_fn,
        optimizer=optimizer,
        device=DEVICE,
        task="classification",
        scheduler=scheduler,
        early_stop_patience=CLASSIFIER_EARLY_STOP_PATIENCE,
        best_ckpt_path=BEST_CLASSIFIER_PATH,
        last_ckpt_path=LAST_CLASSIFIER_PATH,
    )

    history = trainer.fit(epochs=CLASSIFIER_EPOCHS)
    plot_training_curves(history, filename="classifier_training_curves.png")
    logger.info("Classifier training complete. Best model saved to %s", BEST_CLASSIFIER_PATH)


if __name__ == "__main__":
    main()

"""
Generic trainer used by both training/train_unet.py and
training/train_classifier.py. Handles the training loop, validation,
checkpointing, LR scheduling, early stopping and optional mixed precision.
"""

import time
from typing import Callable, Optional

import torch
from torch.utils.data import DataLoader
from torch.amp import autocast, GradScaler

from src.utils import EarlyStopping, save_checkpoint, get_logger
from src.metrics import dice_coefficient, iou_score

logger = get_logger("trainer")


class Trainer:
    def __init__(
        self,
        model: torch.nn.Module,
        train_loader: DataLoader,
        val_loader: DataLoader,
        loss_fn: torch.nn.Module,
        optimizer: torch.optim.Optimizer,
        device: torch.device,
        task: str = "segmentation",          # "segmentation" | "classification"
        scheduler: Optional[torch.optim.lr_scheduler._LRScheduler] = None,
        early_stop_patience: int = 15,
        use_amp: bool = True,
        best_ckpt_path: str = "checkpoints/best_model.pth",
        last_ckpt_path: str = "checkpoints/last_model.pth",
    ):
        self.model = model.to(device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.loss_fn = loss_fn
        self.optimizer = optimizer
        self.device = device
        self.task = task
        self.scheduler = scheduler
        self.early_stopper = EarlyStopping(patience=early_stop_patience, mode="min")
        
        # Enable AMP only on CUDA GPUs (Mac MPS & CPU will safely run in FP32)
        self.use_amp = use_amp and (device.type == "cuda")
        self.scaler = GradScaler("cuda", enabled=self.use_amp)
        
        self.best_ckpt_path = best_ckpt_path
        self.last_ckpt_path = last_ckpt_path

        self.history = {"train_loss": [], "val_loss": [], "val_metric": []}

    def _forward_batch(self, batch):
        images = batch["image"].to(self.device, non_blocking=True)
        if self.task == "segmentation":
            targets = batch["mask"].to(self.device, non_blocking=True)
        else:
            targets = batch["label"].to(self.device, non_blocking=True)
        return images, targets

    def _run_epoch(self, loader: DataLoader, train: bool) -> tuple:
        self.model.train() if train else self.model.eval()
        total_loss = 0.0
        total_metric = 0.0
        n_batches = 0

        context = torch.enable_grad() if train else torch.no_grad()
        with context:
            for batch in loader:
                images, targets = self._forward_batch(batch)

                if train:
                    self.optimizer.zero_grad()

                # Autocast automatically defaults to float32 on CPU/MPS when disabled
                with autocast(device_type=self.device.type if self.device.type == "cuda" else "cpu", enabled=self.use_amp):
                    logits = self.model(images)
                    loss = self.loss_fn(logits, targets)

                if train:
                    if self.use_amp:
                        self.scaler.scale(loss).backward()
                        self.scaler.step(self.optimizer)
                        self.scaler.update()
                    else:
                        loss.backward()
                        self.optimizer.step()

                total_loss += loss.item()

                # Detach logits when calculating metrics to prevent memory accumulation
                detached_logits = logits.detach()
                if self.task == "segmentation":
                    total_metric += dice_coefficient(detached_logits, targets)
                else:
                    preds = detached_logits.argmax(dim=1)
                    total_metric += (preds == targets).float().mean().item()

                n_batches += 1

        return total_loss / n_batches, total_metric / n_batches

    def fit(self, epochs: int) -> dict:
        for epoch in range(1, epochs + 1):
            start = time.time()

            train_loss, train_metric = self._run_epoch(self.train_loader, train=True)
            val_loss, val_metric = self._run_epoch(self.val_loader, train=False)

            if self.scheduler is not None:
                if isinstance(self.scheduler, torch.optim.lr_scheduler.ReduceLROnPlateau):
                    self.scheduler.step(val_loss)
                else:
                    self.scheduler.step()

            self.history["train_loss"].append(train_loss)
            self.history["val_loss"].append(val_loss)
            self.history["val_metric"].append(val_metric)

            metric_name = "Dice" if self.task == "segmentation" else "Acc"
            elapsed = time.time() - start
            logger.info(
                f"Epoch {epoch}/{epochs} | train_loss={train_loss:.4f} "
                f"val_loss={val_loss:.4f} val_{metric_name}={val_metric:.4f} "
                f"({elapsed:.1f}s)"
            )

            save_checkpoint(
                {
                    "epoch": epoch,
                    "model_state_dict": self.model.state_dict(),
                    "optimizer_state_dict": self.optimizer.state_dict(),
                    "val_loss": val_loss,
                    "val_metric": val_metric,
                },
                self.last_ckpt_path,
            )

            is_best = self.early_stopper.step(val_loss)
            if is_best:
                save_checkpoint(
                    {
                        "epoch": epoch,
                        "model_state_dict": self.model.state_dict(),
                        "optimizer_state_dict": self.optimizer.state_dict(),
                        "val_loss": val_loss,
                        "val_metric": val_metric,
                    },
                    self.best_ckpt_path,
                )
                logger.info(f"  -> New best model saved (val_loss={val_loss:.4f})")

            if self.early_stopper.should_stop:
                logger.info(f"Early stopping triggered at epoch {epoch}")
                break

        return self.history
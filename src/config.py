"""
Central configuration for the BreastCancerAI pipeline.
All paths, hyperparameters, and constants live here so every
other module (dataset, training, inference, api) imports from
a single source of truth.
"""

import os
import torch

# ---------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_DIR = os.path.join(ROOT_DIR, "data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "raw", "Dataset_BUSI_with_GT")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")

TRAIN_CSV = os.path.join(DATA_DIR, "train.csv")
VAL_CSV = os.path.join(DATA_DIR, "val.csv")
TEST_CSV = os.path.join(DATA_DIR, "test.csv")

CHECKPOINT_DIR = os.path.join(ROOT_DIR, "checkpoints")
BEST_UNET_PATH = os.path.join(CHECKPOINT_DIR, "best_unet.pth")
LAST_UNET_PATH = os.path.join(CHECKPOINT_DIR, "last_unet.pth")
BEST_CLASSIFIER_PATH = os.path.join(CHECKPOINT_DIR, "best_classifier.pth")
LAST_CLASSIFIER_PATH = os.path.join(CHECKPOINT_DIR, "last_classifier.pth")

MODELS_DIR = os.path.join(ROOT_DIR, "models")
UNET_ONNX_PATH = os.path.join(MODELS_DIR, "unet.onnx")
CLASSIFIER_ONNX_PATH = os.path.join(MODELS_DIR, "classifier.onnx")
UNET_TS_PATH = os.path.join(MODELS_DIR, "unet.pt")
CLASSIFIER_TS_PATH = os.path.join(MODELS_DIR, "classifier.pt")

OUTPUTS_DIR = os.path.join(ROOT_DIR, "outputs")
SEGMENTATION_OUT = os.path.join(OUTPUTS_DIR, "segmentation")
GRADCAM_OUT = os.path.join(OUTPUTS_DIR, "gradcam")
PREDICTIONS_OUT = os.path.join(OUTPUTS_DIR, "predictions")
CONFUSION_MATRIX_OUT = os.path.join(OUTPUTS_DIR, "confusion_matrix")
ROC_OUT = os.path.join(OUTPUTS_DIR, "roc")
CALIBRATION_OUT = os.path.join(OUTPUTS_DIR, "calibration")
TRAINING_CURVES_OUT = os.path.join(OUTPUTS_DIR, "training_curves")

for d in [
    CHECKPOINT_DIR, MODELS_DIR, OUTPUTS_DIR, SEGMENTATION_OUT, GRADCAM_OUT,
    PREDICTIONS_OUT, CONFUSION_MATRIX_OUT, ROC_OUT, CALIBRATION_OUT,
    TRAINING_CURVES_OUT, PROCESSED_DATA_DIR,
]:
    os.makedirs(d, exist_ok=True)

# ---------------------------------------------------------------------
# Device
# ---------------------------------------------------------------------
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ---------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------
CLASS_NAMES = ["benign", "malignant", "normal"]
NUM_CLASSES = len(CLASS_NAMES)
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASS_NAMES)}
IDX_TO_CLASS = {i: c for c, i in CLASS_TO_IDX.items()}

IMAGE_SIZE = 256          # H = W after resize
IN_CHANNELS = 1           # ultrasound images are grayscale
SEED = 42

TRAIN_SPLIT = 0.70
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15

# ---------------------------------------------------------------------
# U-Net hyperparameters
# ---------------------------------------------------------------------
UNET_BASE_CHANNELS = 32
UNET_DEPTH = 4
UNET_LR = 1e-4
UNET_EPOCHS = 100
UNET_BATCH_SIZE = 16
UNET_EARLY_STOP_PATIENCE = 15
DICE_BCE_ALPHA = 0.5      # weight between Dice and BCE in hybrid loss

# ---------------------------------------------------------------------
# Classifier hyperparameters
# ---------------------------------------------------------------------
CLASSIFIER_BACKBONE = "resnet18"     # torchvision backbone name
CLASSIFIER_LR = 1e-4
CLASSIFIER_EPOCHS = 60
CLASSIFIER_BATCH_SIZE = 32
CLASSIFIER_EARLY_STOP_PATIENCE = 10
CLASSIFIER_DROPOUT_P = 0.3            # needed for MC Dropout at inference
CLASSIFIER_USE_SEGMENTED_INPUT = False  # True -> classifier sees masked ROI

# ---------------------------------------------------------------------
# MC Dropout (uncertainty)
# ---------------------------------------------------------------------
MC_DROPOUT_PASSES = 50

# ---------------------------------------------------------------------
# Grad-CAM
# ---------------------------------------------------------------------
GRADCAM_TARGET_LAYER = "layer4"   # last conv block of resnet18 backbone

# ---------------------------------------------------------------------
# API
# ---------------------------------------------------------------------
API_HOST = "0.0.0.0"
API_PORT = 8000
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]
MAX_UPLOAD_MB = 15

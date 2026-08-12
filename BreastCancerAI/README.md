# BreastCancerAI

A web-based AI Clinical Decision Support System (CDSS) for breast cancer
detection using BUSI ultrasound images. Segments the tumor (U-Net),
classifies it as Benign / Malignant / Normal (CNN), explains the decision
(Grad-CAM), and reports prediction uncertainty (Monte Carlo Dropout) — all
served through a FastAPI backend and a React frontend.

## Pipeline

```
BUSI Dataset -> Preprocessing -> U-Net (segmentation) -> CNN (classification)
             -> Grad-CAM (explainability) -> MC Dropout (uncertainty)
             -> FastAPI -> React
```

## Setup

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Download the BUSI dataset ("Dataset_BUSI_with_GT") and place it at:

```
data/raw/Dataset_BUSI_with_GT/
    benign/
    malignant/
    normal/
```

## 1. Build train/val/test splits

```bash
python -m src.dataset
```

This scans the raw folder, merges multi-lesion masks per image, and
writes `data/train.csv`, `data/val.csv`, `data/test.csv`.

## 2. Train the models

```bash
python -m training.train_unet          # saves checkpoints/best_unet.pth
python -m training.train_classifier     # saves checkpoints/best_classifier.pth
```

## 3. Evaluate

```bash
python -m training.evaluate
```

Generates confusion matrix, ROC/PR curves, calibration curve, and Dice/IoU
distributions under `outputs/`.

## 4. Run inference

```bash
# Single image
python -m inference.predict --image path/to/image.png

# Batch over a folder
python -m inference.batch_predict --input-dir data/raw/Dataset_BUSI_with_GT/benign

# Compare two cases
python -m inference.compare_predictions --image-a caseA.png --image-b caseB.png
```

## 5. Export for deployment (optional)

```bash
python -m src.export
```

Produces TorchScript (`models/*.pt`) and ONNX (`models/*.onnx`) versions
of both models.

## 6. Run the API

```bash
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

Docs available at `http://localhost:8000/docs`.

Endpoints:
- `GET  /api/health`   — model/device status
- `POST /api/predict`  — full pipeline (segmentation + classification + Grad-CAM + uncertainty)
- `POST /api/segment`  — segmentation only
- `POST /api/classify` — classification only (single deterministic pass)

## 7. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`, proxying `/api` calls to the FastAPI
backend on port 8000.

## Project structure

See the folder tree in the original project spec — `src/` holds all
reusable modules, `training/` and `inference/` hold runnable scripts,
`api/` is the FastAPI service, and `frontend/` is the React client.

## Notes on the reference screenshot

The reference UI screenshot shows a "Clinical Pathology Classification
Types" selector for **IDC / ILC / DCIS** — those are *histopathology*
subtypes (from biopsy slide datasets), which is a different label set
than this project's BUSI classes (**Benign / Malignant / Normal**, from
ultrasound). `frontend/src/components/ClassTypeCards.jsx` mirrors that
card layout and styling but uses the BUSI classes so it matches what the
trained model actually predicts. If your model should instead classify
IDC/ILC/DCIS, that requires a different dataset (e.g., the BreakHis or
IDC histology datasets) and a different label set throughout `src/config.py`.

## Tests

```bash
pytest tests/
```

Model/shape tests run without trained weights; dataset and full-`/predict`
tests skip automatically until you've built the CSVs / trained checkpoints.

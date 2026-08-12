"""
API routes: /predict, /segment, /classify, /health
"""

import cv2
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException, Request

from src.config import MAX_UPLOAD_MB
from src.utils import overlay_mask_on_image, tensor_to_numpy_image, get_logger
from api.schemas import (
    HealthResponse, PredictionResponse, SegmentOnlyResponse, ClassifyOnlyResponse,
)

logger = get_logger("api.routes")
router = APIRouter()


def _read_upload_as_grayscale(file_bytes: bytes) -> np.ndarray:
    array = np.frombuffer(file_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image. Upload a valid PNG/JPG ultrasound image.")
    return image


async def _validate_and_read(file: UploadFile) -> np.ndarray:
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(status_code=413, detail=f"File too large ({size_mb:.1f} MB). Max is {MAX_UPLOAD_MB} MB.")
    return _read_upload_as_grayscale(contents)


@router.get("/health", response_model=HealthResponse)
async def health(request: Request):
    pipeline = getattr(request.app.state, "pipeline", None)
    return HealthResponse(
        status="ok" if pipeline is not None else "models_not_loaded",
        unet_loaded=pipeline is not None,
        classifier_loaded=pipeline is not None,
        device=str(pipeline.device) if pipeline is not None else "n/a",
    )


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: Request, file: UploadFile = File(...)):
    """Full pipeline: segmentation + classification + Grad-CAM + MC Dropout uncertainty."""
    pipeline = request.app.state.pipeline
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Models are not loaded yet.")

    image = await _validate_and_read(file)
    try:
        result = pipeline.predict(image)
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    return PredictionResponse(**result)


@router.post("/segment", response_model=SegmentOnlyResponse)
async def segment(request: Request, file: UploadFile = File(...)):
    """Segmentation-only endpoint (U-Net mask, no classification)."""
    pipeline = request.app.state.pipeline
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Models are not loaded yet.")

    image = await _validate_and_read(file)
    input_tensor = pipeline._preprocess(image)
    mask = pipeline._segment(input_tensor)

    base_image_bgr = tensor_to_numpy_image(input_tensor[0])
    mask_uint8 = (mask * 255).astype("uint8")
    mask_resized = cv2.resize(mask_uint8, (base_image_bgr.shape[1], base_image_bgr.shape[0]))
    overlay = overlay_mask_on_image(base_image_bgr, mask_resized)

    tumor_area_px = int((mask > 0).sum())
    tumor_area_pct = round(100.0 * tumor_area_px / mask.size, 2)

    from src.inference import _encode_image_base64
    return SegmentOnlyResponse(
        tumor_area_px=tumor_area_px,
        tumor_area_pct=tumor_area_pct,
        mask_base64=_encode_image_base64(mask_resized),
        overlay_base64=_encode_image_base64(overlay),
    )


@router.post("/classify", response_model=ClassifyOnlyResponse)
async def classify(request: Request, file: UploadFile = File(...)):
    """Classification-only endpoint (single deterministic pass, no Grad-CAM/uncertainty)."""
    pipeline = request.app.state.pipeline
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Models are not loaded yet.")

    import torch
    import torch.nn.functional as F

    image = await _validate_and_read(file)
    input_tensor = pipeline._preprocess(image)

    pipeline.classifier.eval()
    with torch.no_grad():
        logits = pipeline.classifier(input_tensor)
        probs = F.softmax(logits, dim=1)[0].cpu().numpy()

    from src.config import IDX_TO_CLASS
    predicted_idx = int(probs.argmax())

    return ClassifyOnlyResponse(
        prediction=IDX_TO_CLASS[predicted_idx],
        confidence=round(float(probs[predicted_idx]), 4),
        class_probabilities={IDX_TO_CLASS[i]: float(p) for i, p in enumerate(probs)},
    )

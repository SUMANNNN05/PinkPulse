"""
Pydantic schemas for the FastAPI request/response bodies.
Keeping these separate from routes.py makes the API contract easy
for the React frontend team to read on its own.
"""

from typing import Dict, Optional
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    unet_loaded: bool
    classifier_loaded: bool
    device: str


class UncertaintyInfo(BaseModel):
    predictive_entropy: float
    mutual_information: float
    label: str
    n_passes: int


class SegmentationInfo(BaseModel):
    tumor_area_px: int
    tumor_area_pct: float
    mask_base64: str
    overlay_base64: str


class GradCamInfo(BaseModel):
    overlay_base64: str


class PredictionResponse(BaseModel):
    prediction: str = Field(..., description="benign | malignant | normal")
    confidence: float
    class_probabilities: Dict[str, float]
    uncertainty: UncertaintyInfo
    segmentation: SegmentationInfo
    gradcam: GradCamInfo
    original_image_base64: str


class SegmentOnlyResponse(BaseModel):
    tumor_area_px: int
    tumor_area_pct: float
    mask_base64: str
    overlay_base64: str


class ClassifyOnlyResponse(BaseModel):
    prediction: str
    confidence: float
    class_probabilities: Dict[str, float]


class ErrorResponse(BaseModel):
    detail: str

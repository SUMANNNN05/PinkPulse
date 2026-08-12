"""
API smoke tests using FastAPI's TestClient. Health endpoint works
without trained checkpoints; predict/segment/classify are skipped
if checkpoints aren't present (CI without trained weights).
"""

import io
import os

import numpy as np
import cv2
import pytest
from fastapi.testclient import TestClient

from api.main import app
from src.config import BEST_UNET_PATH, BEST_CLASSIFIER_PATH

client = TestClient(app)

MODELS_TRAINED = os.path.exists(BEST_UNET_PATH) and os.path.exists(BEST_CLASSIFIER_PATH)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert "status" in body
    assert "device" in body


def _make_dummy_png_bytes():
    img = np.random.randint(0, 255, (256, 256), dtype=np.uint8)
    success, buf = cv2.imencode(".png", img)
    assert success
    return io.BytesIO(buf.tobytes())


@pytest.mark.skipif(not MODELS_TRAINED, reason="Trained checkpoints not available")
def test_predict_endpoint():
    files = {"file": ("test.png", _make_dummy_png_bytes(), "image/png")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 200
    body = response.json()
    assert body["prediction"] in ("benign", "malignant", "normal")
    assert 0.0 <= body["confidence"] <= 1.0

"""
FastAPI application entrypoint.

Usage:
    uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import CORS_ORIGINS
from api.model_loader import load_pipeline
from api.routes import router
from src.utils import get_logger

logger = get_logger("api.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load models once and attach to app state
    try:
        app.state.pipeline = load_pipeline()
    except FileNotFoundError as e:
        logger.warning(f"Models not loaded at startup: {e}")
        app.state.pipeline = None
    yield
    # Shutdown: nothing to clean up explicitly (GC handles tensors)
    logger.info("Shutting down API.")


app = FastAPI(
    title="Breast Cancer AI - Clinical Decision Support System",
    description="U-Net segmentation + CNN classification + Grad-CAM + MC Dropout uncertainty for BUSI ultrasound images.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api", tags=["cdss"])


@app.get("/")
async def root():
    return {"message": "Breast Cancer AI CDSS API is running. See /docs for the interactive API reference."}

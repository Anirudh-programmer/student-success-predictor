"""
FastAPI Main Application
Student Success Predictor API
"""

import os
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import (
    HealthResponse,
    ModelInfoResponse,
    PredictRequest,
    PredictResponse,
    FeatureImportanceResponse,
    MetricsResponse,
    DistributionResponse,
    DatasetSummaryResponse
)
from app.ml_service import ml_service

app = FastAPI(
    title="Student Success Predictor API",
    description="Machine Learning API for predicting student exam performance and providing academic advisory support.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# -------------------------------------------------------------
# CORS Configuration
# -------------------------------------------------------------
# Default development and production origins
default_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://student-success-predictor-ruby.vercel.app",
    "https://student-success-predictor.vercel.app",
]

cors_env = os.getenv("CORS_ORIGINS", "")
if cors_env.strip():
    env_origins = [origin.strip().rstrip("/") for origin in cors_env.split(",") if origin.strip()]
    allowed_origins = list(dict.fromkeys(default_origins + env_origins))
else:
    allowed_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------

@app.get(
    "/",
    summary="Root status and navigation",
    tags=["System"]
)
def root():
    """Root endpoint verifying API availability and linking to interactive docs."""
    return {
        "status": "ok",
        "service": "Student Success Predictor API",
        "version": "1.0.0",
        "model_ready": ml_service.is_ready,
        "docs": "/docs",
        "health": "/health"
    }

@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    tags=["System"]
)
def health_check():
    """Returns API operational readiness and model load status."""
    return HealthResponse(
        status="ok" if ml_service.is_ready else "degraded",
        model_ready=ml_service.is_ready,
        version="1.0.0",
        environment=os.getenv("ENVIRONMENT", "development")
    )


@app.get(
    "/api/v1/model-info",
    response_model=ModelInfoResponse,
    summary="Model specification & metadata",
    tags=["Model"]
)
def get_model_info():
    """Returns trained model architecture, evaluation metrics, and feature constraints."""
    try:
        info = ml_service.get_model_info()
        return ModelInfoResponse(**info)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model info: {str(e)}"
        )


@app.post(
    "/api/v1/predict",
    response_model=PredictResponse,
    summary="Predict exam score",
    tags=["Inference"]
)
def predict_score(payload: PredictRequest):
    """
    Accepts student performance factors, runs inference via fitted Ridge pipeline,
    and returns estimated score, cohort benchmark, and actionable recommendations.
    """
    try:
        input_data = payload.model_dump()
        result = ml_service.predict(input_data)
        return PredictResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference execution failed: {str(e)}"
        )


@app.get(
    "/api/v1/feature-importance",
    response_model=FeatureImportanceResponse,
    summary="Permutation feature importance",
    tags=["Model"]
)
def get_feature_importance():
    """Returns empirical permutation importance measured on held-out test data."""
    try:
        importance_data = ml_service.get_feature_importance()
        return FeatureImportanceResponse(**importance_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve feature importance: {str(e)}"
        )


@app.get(
    "/api/v1/metrics",
    response_model=MetricsResponse,
    summary="Model evaluation metrics and comparison benchmark",
    tags=["Model"]
)
def get_metrics():
    """Returns held-out test metrics and benchmark comparison across all candidate algorithms."""
    try:
        metrics_data = ml_service.get_metrics()
        return MetricsResponse(**metrics_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model metrics: {str(e)}"
        )


@app.get(
    "/api/v1/distribution",
    response_model=DistributionResponse,
    summary="Exam score distribution bins and statistics",
    tags=["Dataset"]
)
def get_distribution():
    """Returns histogram bins and cohort metrics for exam score distribution."""
    try:
        dist_data = ml_service.get_distribution()
        return DistributionResponse(**dist_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve score distribution: {str(e)}"
        )


@app.get(
    "/api/v1/dataset-summary",
    response_model=DatasetSummaryResponse,
    summary="Dataset metadata and preview sample",
    tags=["Dataset"]
)
def get_dataset_summary():
    """Returns column metadata, missing counts, and a representative preview sample."""
    try:
        summary_data = ml_service.get_dataset_summary()
        return DatasetSummaryResponse(**summary_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve dataset summary: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

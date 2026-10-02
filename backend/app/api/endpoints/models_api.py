"""
SkyPredict AI - Model Comparison & Metrics API Endpoints
"""

from fastapi import APIRouter, HTTPException
from ml.inference import load_metrics
from app.services.ml_service import get_active_model_key, set_active_model_key
from app.schemas.model_schema import ModelMetadataResponse, SelectModelRequest

router = APIRouter()

@router.get("/models")
def get_models_overview():
    """
    Returns available classification & regression models and currently active default model.
    """
    metrics = load_metrics()
    if not metrics:
        raise HTTPException(
            status_code=404,
            detail="Models not yet evaluated or trained. Please run 'python -m ml.train'."
        )

    classification_keys = list(metrics.get("classification_models", {}).keys())
    regression_keys = list(metrics.get("regression_models", {}).keys())

    return {
        "active_classification_model": get_active_model_key(),
        "available_classification_models": classification_keys,
        "available_regression_models": regression_keys,
        "trained_at": metrics.get("trained_at"),
        "dataset_records": metrics.get("dataset_records")
    }

@router.get("/models/metrics", response_model=ModelMetadataResponse)
def get_model_metrics():
    """
    Returns authentic evaluated metrics for all models:
    - Accuracy, Precision, Recall, F1, ROC-AUC
    - Confusion Matrix counts
    - ROC Curve coordinate samples
    - Feature Importance breakdowns
    - Regression metrics (MAE, RMSE, R2)
    """
    metrics = load_metrics()
    if not metrics:
        raise HTTPException(
            status_code=404,
            detail="Model evaluation artifacts not found. Please train models first."
        )
    return metrics

@router.post("/models/select")
def select_active_model(payload: SelectModelRequest):
    """
    Switches the globally active classification model pipeline for subsequent predictions.
    """
    try:
        active_key = set_active_model_key(payload.model_key)
        return {
            "status": "success",
            "message": f"Active prediction model updated to '{active_key}'.",
            "active_model": active_key
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to activate model: {str(e)}")

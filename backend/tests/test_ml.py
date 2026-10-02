"""
SkyPredict AI - Machine Learning Pipeline Tests
"""

import os
import pytest
from ml.preprocess import load_and_prepare_data, split_data
from ml.inference import get_model, predict_flight, load_metrics
from app.core.config import settings

def test_dataset_integrity():
    assert os.path.exists(settings.DATA_PATH), "Dataset file flights.csv must exist"
    df, X, y_class, y_reg = load_and_prepare_data(settings.DATA_PATH)
    assert len(X) >= 10000
    assert len(y_class) == len(X)
    assert len(y_reg) == len(X)

def test_model_loading_and_artifacts():
    metrics = load_metrics()
    assert metrics is not None
    assert "classification_models" in metrics
    for model_key in ["logistic_regression", "decision_tree", "random_forest", "xgboost"]:
        assert model_key in metrics["classification_models"]
        model = get_model(model_key)
        assert model is not None

def test_inference_pipeline():
    sample_flight = {
        "airline": "AA",
        "origin": "ORD",
        "dest": "LAX",
        "flight_date": "2024-07-20",
        "sched_dep_hour": 18,
        "weather_condition": "Clear",
        "distance_miles": 1744.0,
        "sched_elapsed_min": 260.0
    }
    result = predict_flight(sample_flight, model_key="xgboost")
    assert result["prediction_label"] in ["Likely Delayed", "Likely On-Time"]
    assert 0.0 <= result["delay_probability"] <= 1.0
    assert isinstance(result["estimated_delay_minutes"], float)
    assert len(result["contributions"]) > 0

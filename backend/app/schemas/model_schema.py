"""
SkyPredict AI - Model Comparison & Evaluation Schemas
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class ConfusionMatrixData(BaseModel):
    true_negatives: int
    false_positives: int
    false_negatives: int
    true_positives: int
    matrix: List[List[int]]
    total_tested: int

class ROCCurvePoint(BaseModel):
    fpr: float
    tpr: float

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class ModelMetrics(BaseModel):
    model_key: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None
    confusion_matrix: ConfusionMatrixData
    roc_curve: List[ROCCurvePoint]

class ClassificationModelDetail(BaseModel):
    key: str
    display_name: str
    model_type: str
    metrics: ModelMetrics
    feature_importance: List[FeatureImportanceItem]
    artifact_path: str

class RegressionModelDetail(BaseModel):
    key: str
    display_name: str
    metrics: Dict[str, Any]
    artifact_path: str

class ModelMetadataResponse(BaseModel):
    trained_at: str
    dataset_records: int
    train_samples: int
    test_samples: int
    default_classification_model: str
    default_regression_model: str
    classification_models: Dict[str, ClassificationModelDetail]
    regression_models: Dict[str, RegressionModelDetail]

class SelectModelRequest(BaseModel):
    model_key: str

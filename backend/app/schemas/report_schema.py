"""
SkyPredict AI - Report Generation Schemas
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ReportRequest(BaseModel):
    report_type: str = Field(..., example="overall", description="overall, route, prediction, or model_evaluation")
    title: Optional[str] = "SkyPredict AI Flight Analytics Report"
    route_origin: Optional[str] = None
    route_dest: Optional[str] = None
    prediction_id: Optional[str] = None
    model_key: Optional[str] = "xgboost"
    include_disclaimer: bool = True

class ReportSummaryResponse(BaseModel):
    report_type: str
    generated_at: str
    total_samples: int
    summary_metrics: Dict[str, Any]
    preview_highlights: List[str]

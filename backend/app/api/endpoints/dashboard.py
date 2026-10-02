"""
SkyPredict AI - Dashboard API Endpoint
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import PredictionRecord
from app.services.analytics_service import get_dashboard_overview
from app.schemas.analytics_schema import DashboardOverviewResponse

router = APIRouter()

@router.get("/dashboard", response_model=DashboardOverviewResponse)
def get_dashboard_data(db: Session = Depends(get_db)):
    """
    Returns high-level aviation analytics summary, delay distributions,
    hourly trends, and recent saved predictions.
    """
    data = get_dashboard_overview()

    # Query recent predictions from SQLite database
    recent_db_records = (
        db.query(PredictionRecord)
        .order_by(PredictionRecord.created_at.desc())
        .limit(10)
        .all()
    )
    data["recent_predictions"] = [r.to_dict() for r in recent_db_records]

    return data

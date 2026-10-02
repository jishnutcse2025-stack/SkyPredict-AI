"""
SkyPredict AI - Prediction History API Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import PredictionRecord
from pydantic import BaseModel

router = APIRouter()

class ReconcileOutcomeRequest(BaseModel):
    actual_delay_min: float
    actual_outcome: str  # "Delayed" or "On-Time"

@router.get("/history")
def get_prediction_history(
    origin: Optional[str] = Query(None),
    dest: Optional[str] = Query(None),
    airline: Optional[str] = Query(None),
    is_delayed: Optional[bool] = Query(None),
    model_used: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Searchable and filterable table of persistent flight predictions.
    """
    query = db.query(PredictionRecord)

    if origin:
        query = query.filter(PredictionRecord.origin == origin.upper())
    if dest:
        query = query.filter(PredictionRecord.dest == dest.upper())
    if airline:
        query = query.filter(PredictionRecord.airline == airline.upper())
    if is_delayed is not None:
        query = query.filter(PredictionRecord.is_delayed == is_delayed)
    if model_used:
        query = query.filter(PredictionRecord.model_used == model_used)

    total_count = query.count()
    records = query.order_by(PredictionRecord.created_at.desc()).offset(offset).limit(limit).all()

    return {
        "total": total_count,
        "offset": offset,
        "limit": limit,
        "items": [r.to_dict() for r in records]
    }

@router.get("/history/{prediction_id}")
def get_single_prediction_history(prediction_id: str, db: Session = Depends(get_db)):
    """
    Fetches full prediction audit record including explainability contribution array.
    """
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    return record.to_dict()

@router.delete("/history/{prediction_id}")
def delete_prediction_history(prediction_id: str, db: Session = Depends(get_db)):
    """
    Deletes an individual prediction record.
    """
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    db.delete(record)
    db.commit()
    return {"status": "success", "message": f"Prediction record {prediction_id} deleted successfully."}

@router.patch("/history/{prediction_id}/reconcile")
def reconcile_flight_outcome(prediction_id: str, payload: ReconcileOutcomeRequest, db: Session = Depends(get_db)):
    """
    Reconciles prediction against verified post-departure delay outcome.
    Allows comparing predicted vs actual.
    """
    record = db.query(PredictionRecord).filter(PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction record not found.")

    record.actual_delay_min = payload.actual_delay_min
    record.actual_outcome = payload.actual_outcome
    record.evaluation_status = "Reconciled"
    db.commit()
    db.refresh(record)

    return {"status": "success", "record": record.to_dict()}

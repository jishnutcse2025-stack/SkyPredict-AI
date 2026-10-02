"""
SkyPredict AI - Prediction & What-If Simulator API Endpoints
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import PredictionRecord
from app.schemas.flight import (
    FlightPredictionRequest,
    FlightPredictionResponse,
    WhatIfScenarioRequest,
    WhatIfComparisonResponse
)
from app.services.ml_service import run_flight_prediction, run_what_if_simulation

router = APIRouter()

@router.post("/predict", response_model=FlightPredictionResponse)
def predict_flight_endpoint(payload: FlightPredictionRequest, db: Session = Depends(get_db)):
    """
    Executes trained ML pipeline prediction on user flight parameters,
    persists prediction into database history, and returns explainability breakdown.
    """
    try:
        req_dict = payload.model_dump()
        result = run_flight_prediction(req_dict, model_key=payload.model_key)

        # Persist into database
        db_record = PredictionRecord(
            flight_number=result["flight_number"],
            airline=result["airline"],
            airline_name=result["airline_name"],
            origin=result["origin"],
            origin_city=result["origin_city"],
            dest=result["dest"],
            dest_city=result["dest_city"],
            flight_date=result["flight_date"],
            sched_dep_hour=result["sched_dep_hour"],
            day_of_week=req_dict.get("day_of_week", 4),
            month=req_dict.get("month", 7),
            weather_condition=req_dict.get("weather_condition", "Clear"),
            distance_miles=result["distance_miles"],
            prediction_label=result["prediction_label"],
            is_delayed=result["is_delayed"],
            delay_probability=result["delay_probability"],
            estimated_delay_minutes=result["estimated_delay_minutes"],
            risk_level=result["risk_level"],
            model_used=result["model_used"],
            explanation_json=json.dumps(result["contributions"]),
            evaluation_status="Pending Departure"
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        result["prediction_id"] = db_record.id
        return result
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.post("/predict/scenario", response_model=WhatIfComparisonResponse)
def what_if_simulator_endpoint(payload: WhatIfScenarioRequest):
    """
    Simulates departure time or weather changes using trained ML models.
    Returns delta in delay probability and estimated delay minutes.
    """
    try:
        orig_dict = payload.original.model_dump()
        comparison = run_what_if_simulation(
            original_req=orig_dict,
            scenario_hour=payload.scenario_sched_dep_hour,
            scenario_weather=payload.scenario_weather_condition,
            scenario_airline=payload.scenario_airline,
            scenario_model_key=payload.scenario_model_key
        )
        return comparison
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

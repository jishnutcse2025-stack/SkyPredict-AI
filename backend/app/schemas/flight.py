"""
SkyPredict AI - Flight Prediction Schemas
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class FlightPredictionRequest(BaseModel):
    airline: str = Field(..., example="DL", description="IATA Carrier Code")
    origin: str = Field(..., example="ATL", description="Origin Airport IATA")
    dest: str = Field(..., example="ORD", description="Destination Airport IATA")
    flight_date: str = Field(..., example="2024-07-15", description="Flight date in YYYY-MM-DD")
    sched_dep_hour: int = Field(..., ge=0, le=23, example=17, description="Scheduled Departure Hour (0-23)")
    flight_number: Optional[str] = Field(None, example="DL1248")
    weather_condition: Optional[str] = Field("Clear", example="Clear")
    temp_c: Optional[float] = Field(22.0, example=22.0)
    wind_speed_kts: Optional[float] = Field(10.0, example=10.0)
    visibility_miles: Optional[float] = Field(10.0, example=10.0)
    model_key: Optional[str] = Field("xgboost", example="xgboost")

class WhatIfScenarioRequest(BaseModel):
    original: FlightPredictionRequest
    scenario_sched_dep_hour: int = Field(..., ge=0, le=23, example=9)
    scenario_weather_condition: Optional[str] = Field(None, example="Clear")
    scenario_airline: Optional[str] = Field(None, example="DL")
    scenario_model_key: Optional[str] = Field(None, example="xgboost")

class FeatureContribution(BaseModel):
    feature: str
    display_name: str
    input_value: str
    contribution_score: float
    importance_pct: float
    direction: str  # "increases_delay_risk" or "supports_on_time"

class FlightPredictionResponse(BaseModel):
    prediction_id: Optional[str] = None
    flight_number: str
    airline: str
    airline_name: str
    origin: str
    origin_city: str
    dest: str
    dest_city: str
    flight_date: str
    sched_dep_hour: int
    distance_miles: float
    prediction_label: str  # "Likely Delayed" | "Likely On-Time"
    is_delayed: bool
    delay_probability: float
    estimated_delay_minutes: float
    risk_level: str  # "Low", "Moderate", "High"
    model_used: str
    contributions: List[FeatureContribution]
    disclaimer: str

class WhatIfComparisonResponse(BaseModel):
    original: FlightPredictionResponse
    scenario: FlightPredictionResponse
    hour_difference: int
    delay_probability_change: float
    delay_minutes_change: float
    summary_insight: str

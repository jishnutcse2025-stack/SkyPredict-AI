"""
SkyPredict AI - SQLAlchemy Database Models
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime
from app.database.database import Base

class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flight_number = Column(String(20), nullable=False)
    airline = Column(String(10), nullable=False)
    airline_name = Column(String(100), nullable=True)
    origin = Column(String(5), nullable=False)
    origin_city = Column(String(100), nullable=True)
    dest = Column(String(5), nullable=False)
    dest_city = Column(String(100), nullable=True)
    flight_date = Column(String(20), nullable=False)
    sched_dep_hour = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    weather_condition = Column(String(50), nullable=False, default="Clear")
    distance_miles = Column(Float, nullable=False)

    # Prediction outputs
    prediction_label = Column(String(50), nullable=False)  # "Likely Delayed" / "Likely On-Time"
    is_delayed = Column(Boolean, nullable=False)
    delay_probability = Column(Float, nullable=False)
    estimated_delay_minutes = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    model_used = Column(String(50), nullable=False)
    explanation_json = Column(Text, nullable=True)

    # Optional outcome reconciliation
    actual_delay_min = Column(Float, nullable=True)
    actual_outcome = Column(String(50), nullable=True)  # "Delayed", "On-Time", or None if pending
    evaluation_status = Column(String(50), nullable=True, default="Pending Observation")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        import json
        explanation = []
        if self.explanation_json:
            try:
                explanation = json.loads(self.explanation_json)
            except Exception:
                explanation = []

        return {
            "id": self.id,
            "flight_number": self.flight_number,
            "airline": self.airline,
            "airline_name": self.airline_name,
            "origin": self.origin,
            "origin_city": self.origin_city,
            "dest": self.dest,
            "dest_city": self.dest_city,
            "flight_date": self.flight_date,
            "sched_dep_hour": self.sched_dep_hour,
            "day_of_week": self.day_of_week,
            "month": self.month,
            "weather_condition": self.weather_condition,
            "distance_miles": self.distance_miles,
            "prediction_label": self.prediction_label,
            "is_delayed": self.is_delayed,
            "delay_probability": self.delay_probability,
            "estimated_delay_minutes": self.estimated_delay_minutes,
            "risk_level": self.risk_level,
            "model_used": self.model_used,
            "contributions": explanation,
            "actual_delay_min": self.actual_delay_min,
            "actual_outcome": self.actual_outcome,
            "evaluation_status": self.evaluation_status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

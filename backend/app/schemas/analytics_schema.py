"""
SkyPredict AI - Analytics & Dashboard Schemas
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_flights_analyzed: int
    delayed_flights: int
    on_time_flights: int
    delay_rate_pct: float
    average_delay_minutes: float
    dataset_type: str  # "Historical Aviation Benchmark"

class HourlyDelayTrend(BaseModel):
    hour: int
    hour_label: str
    total_flights: int
    delayed_flights: int
    delay_rate_pct: float
    avg_delay_min: float

class AirlineDelayStat(BaseModel):
    airline: str
    airline_name: str
    total_flights: int
    delayed_flights: int
    delay_rate_pct: float
    avg_delay_min: float

class RouteDelayStat(BaseModel):
    origin: str
    dest: str
    route: str
    total_flights: int
    delayed_flights: int
    delay_rate_pct: float
    avg_delay_min: float
    distance_miles: int

class DelayCauseBreakdown(BaseModel):
    cause: str
    flights: int
    pct: float
    avg_minutes: float

class DashboardOverviewResponse(BaseModel):
    stats: DashboardStats
    hourly_trends: List[HourlyDelayTrend]
    airline_delays: List[AirlineDelayStat]
    top_delayed_routes: List[RouteDelayStat]
    delay_causes: List[DelayCauseBreakdown]
    recent_predictions: List[Dict[str, Any]]

class RouteInsightsResponse(BaseModel):
    route_stats: List[RouteDelayStat]
    origin_stats: List[Dict[str, Any]]
    dest_stats: List[Dict[str, Any]]
    dataset_avg_delay_rate: float
    dataset_avg_delay_min: float
    insights: List[str]

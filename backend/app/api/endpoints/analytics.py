"""
SkyPredict AI - Route Intelligence & Delay Analytics Endpoints
"""

from typing import Optional
from fastapi import APIRouter, Query
from app.services.analytics_service import get_route_analytics, get_dashboard_overview
from app.schemas.analytics_schema import RouteInsightsResponse

router = APIRouter()

@router.get("/analytics/routes", response_model=RouteInsightsResponse)
def get_routes_analysis(
    origin: Optional[str] = Query(None, description="Origin Airport Code (e.g. ATL)"),
    dest: Optional[str] = Query(None, description="Destination Airport Code (e.g. ORD)"),
    airline: Optional[str] = Query(None, description="Airline Carrier Code (e.g. DL)")
):
    """
    Computes route statistics, delay frequencies, and dynamic data-backed route insights.
    """
    data = get_route_analytics(origin=origin, dest=dest, airline=airline)
    return data

@router.get("/analytics/delays")
def get_delays_breakdown():
    """
    Returns delay patterns by departure hour, carrier distributions, and root cause distributions.
    """
    data = get_dashboard_overview()
    return {
        "hourly_trends": data["hourly_trends"],
        "airline_delays": data["airline_delays"],
        "delay_causes": data["delay_causes"],
        "top_routes": data["top_delayed_routes"]
    }

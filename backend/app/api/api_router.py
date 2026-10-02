"""
SkyPredict AI - Unified API Router
"""

from fastapi import APIRouter
from app.api.endpoints import (
    dashboard,
    predict,
    models_api,
    analytics,
    history,
    reports
)

api_router = APIRouter()

api_router.include_router(dashboard.router, tags=["Dashboard"])
api_router.include_router(predict.router, tags=["Prediction & Simulation"])
api_router.include_router(models_api.router, tags=["Model Comparison & Metrics"])
api_router.include_router(analytics.router, tags=["Route Analytics"])
api_router.include_router(history.router, tags=["Prediction History"])
api_router.include_router(reports.router, tags=["Reports"])

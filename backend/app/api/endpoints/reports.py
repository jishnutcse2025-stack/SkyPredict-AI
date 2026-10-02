"""
SkyPredict AI - Report Generation API Endpoints
Generates downloadable PDF and CSV analytics reports.
"""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Response, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import PredictionRecord
from app.schemas.report_schema import ReportRequest, ReportSummaryResponse
from app.services.analytics_service import get_dashboard_overview, get_route_analytics
from app.services.report_service import generate_pdf_report, generate_csv_report
from ml.inference import load_metrics

router = APIRouter()

@router.get("/reports/summary", response_model=ReportSummaryResponse)
def get_reports_summary_preview(
    report_type: str = Query("overall", description="overall, route, prediction, or model_evaluation"),
    origin: Optional[str] = Query(None),
    dest: Optional[str] = Query(None)
):
    """
    Returns high-level summary metrics and dynamic highlights for report preview.
    """
    overview = get_dashboard_overview()
    stats = overview["stats"]

    highlights = [
        f"Corpus analyzes {stats['total_flights_analyzed']:,} historical flight operations.",
        f"Overall industry delay frequency observed at {stats['delay_rate_pct']}%.",
        f"Mean flight departure delay stands at {stats['average_delay_minutes']} minutes.",
        f"Operational models evaluated on 3,000 independent test operations."
    ]

    if report_type == "route" and origin and dest:
        route_data = get_route_analytics(origin=origin, dest=dest)
        if route_data["insights"]:
            highlights = route_data["insights"]

    return {
        "report_type": report_type,
        "generated_at": datetime.now().isoformat(),
        "total_samples": stats["total_flights_analyzed"],
        "summary_metrics": stats,
        "preview_highlights": highlights
    }

@router.post("/reports/pdf")
def download_pdf_report_endpoint(payload: ReportRequest, db: Session = Depends(get_db)):
    """
    Generates and downloads a real PDF report styled with SkyPredict AI branding.
    """
    try:
        overview = get_dashboard_overview()
        metrics = load_metrics()

        pred_record = None
        if payload.prediction_id:
            record_obj = db.query(PredictionRecord).filter(PredictionRecord.id == payload.prediction_id).first()
            if record_obj:
                pred_record = record_obj.to_dict()

        route_info = None
        if payload.route_origin and payload.route_dest:
            route_info = get_route_analytics(origin=payload.route_origin, dest=payload.route_dest)

        pdf_bytes = generate_pdf_report(
            report_type=payload.report_type,
            title=payload.title or "SkyPredict AI Flight Analytics & Operations Report",
            data_summary=overview,
            prediction_record=pred_record,
            model_metrics=metrics,
            route_details=route_info,
            disclaimer=payload.include_disclaimer
        )

        filename = f"SkyPredict_AI_Report_{payload.report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {str(e)}")

@router.get("/reports/csv")
def download_csv_report_endpoint(
    data_type: str = Query("history", description="'history' or 'routes'"),
    db: Session = Depends(get_db)
):
    """
    Exports tabular data as CSV for offline analysis.
    """
    try:
        if data_type == "history":
            records = [r.to_dict() for r in db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(1000).all()]
            csv_content = generate_csv_report("history", records)
            filename = f"SkyPredict_Prediction_History_{datetime.now().strftime('%Y%m%d')}.csv"
        else:
            routes = get_route_analytics()["route_stats"]
            csv_content = generate_csv_report("routes", routes)
            filename = f"SkyPredict_Route_Analytics_{datetime.now().strftime('%Y%m%d')}.csv"

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate CSV: {str(e)}")

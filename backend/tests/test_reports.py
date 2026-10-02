"""
SkyPredict AI - Report Generation Unit Tests
"""

from app.services.report_service import generate_pdf_report, generate_csv_report

def test_generate_pdf_report_bytes():
    sample_summary = {
        "stats": {
            "total_flights_analyzed": 15000,
            "delayed_flights": 3120,
            "on_time_flights": 11880,
            "delay_rate_pct": 20.8,
            "average_delay_minutes": 18.2,
            "dataset_type": "Historical Benchmark"
        }
    }
    pdf_bytes = generate_pdf_report(
        report_type="overall",
        title="SkyPredict AI Comprehensive Test Report",
        data_summary=sample_summary
    )
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 2000
    assert pdf_bytes.startswith(b"%PDF")

def test_generate_csv_report_string():
    records = [
        {
            "id": "test-1",
            "flight_number": "DL101",
            "airline": "DL",
            "origin": "ATL",
            "dest": "ORD",
            "flight_date": "2024-08-01",
            "sched_dep_hour": 14,
            "prediction_label": "Likely On-Time",
            "is_delayed": False,
            "delay_probability": 0.15,
            "estimated_delay_minutes": 0.0,
            "risk_level": "Low",
            "model_used": "xgboost",
            "created_at": "2024-08-01T12:00:00"
        }
    ]
    csv_str = generate_csv_report("history", records)
    assert "Prediction_ID" in csv_str
    assert "DL101" in csv_str

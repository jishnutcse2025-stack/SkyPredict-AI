"""
SkyPredict AI - Backend API Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["dataset_ready"] is True
    assert data["models_trained"] is True

def test_dashboard_overview(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert data["stats"]["total_flights_analyzed"] >= 1000
    assert len(data["hourly_trends"]) > 0
    assert len(data["airline_delays"]) > 0
    assert len(data["top_delayed_routes"]) > 0

def test_predict_flight(client):
    payload = {
        "airline": "DL",
        "origin": "ATL",
        "dest": "ORD",
        "flight_date": "2024-09-20",
        "sched_dep_hour": 17,
        "flight_number": "DL9999",
        "weather_condition": "Clear",
        "model_key": "xgboost"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction_label" in data
    assert data["prediction_label"] in ["Likely Delayed", "Likely On-Time"]
    assert "delay_probability" in data
    assert 0.0 <= data["delay_probability"] <= 1.0
    assert "estimated_delay_minutes" in data
    assert len(data["contributions"]) > 0
    assert data["prediction_id"] is not None

def test_what_if_scenario(client):
    payload = {
        "original": {
            "airline": "AA",
            "origin": "ORD",
            "dest": "DFW",
            "flight_date": "2024-09-21",
            "sched_dep_hour": 19,
            "weather_condition": "Rain"
        },
        "scenario_sched_dep_hour": 8,
        "scenario_weather_condition": "Clear",
        "scenario_airline": "AA"
    }
    response = client.post("/api/predict/scenario", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "original" in data
    assert "scenario" in data
    assert "delay_probability_change" in data
    assert "summary_insight" in data

def test_models_and_metrics(client):
    res_models = client.get("/api/models")
    assert res_models.status_code == 200
    models_data = res_models.json()
    assert "active_classification_model" in models_data
    assert "xgboost" in models_data["available_classification_models"]

    res_metrics = client.get("/api/models/metrics")
    assert res_metrics.status_code == 200
    metrics_data = res_metrics.json()
    assert "classification_models" in metrics_data
    assert "xgboost" in metrics_data["classification_models"]
    xgb = metrics_data["classification_models"]["xgboost"]["metrics"]
    assert xgb["accuracy"] > 0.5
    assert len(xgb["roc_curve"]) > 0
    assert xgb["confusion_matrix"]["total_tested"] == 3000

def test_route_analytics(client):
    response = client.get("/api/analytics/routes?origin=ATL&dest=ORD")
    assert response.status_code == 200
    data = response.json()
    assert "route_stats" in data
    assert "insights" in data
    assert len(data["insights"]) > 0

def test_prediction_history_flow(client):
    # Query history
    response = client.get("/api/history?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    first_id = data["items"][0]["id"]

    # Get single item
    single_res = client.get(f"/api/history/{first_id}")
    assert single_res.status_code == 200
    assert single_res.json()["id"] == first_id

def test_report_generation(client):
    # Summary
    sum_res = client.get("/api/reports/summary?report_type=overall")
    assert sum_res.status_code == 200

    # CSV
    csv_res = client.get("/api/reports/csv?data_type=history")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]

    # PDF
    pdf_res = client.post("/api/reports/pdf", json={"report_type": "overall"})
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

def test_cors_production_vercel_origin(client):
    """
    Verifies that requests from the production Vercel domain receive the correct
    Access-Control-Allow-Origin and Access-Control-Allow-Credentials headers.
    """
    prod_origin = "https://sky-predict-ai.vercel.app"

    # Test GET request
    response = client.get("/api/health", headers={"Origin": prod_origin})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == prod_origin
    assert response.headers.get("access-control-allow-credentials") == "true"

    # Test OPTIONS preflight request
    options_res = client.options(
        "/api/dashboard",
        headers={
            "Origin": prod_origin,
            "Access-Control-Request-Method": "GET"
        }
    )
    assert options_res.status_code == 200
    assert options_res.headers.get("access-control-allow-origin") == prod_origin
    assert options_res.headers.get("access-control-allow-credentials") == "true"

def test_cors_vercel_preview_origin(client):
    """
    Verifies that requests from Vercel preview deployment domains are safely allowed.
    """
    preview_origin = "https://sky-predict-ai-preview-branch.vercel.app"
    response = client.get("/api/health", headers={"Origin": preview_origin})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == preview_origin
    assert response.headers.get("access-control-allow-credentials") == "true"

def test_cors_arbitrary_origin_rejected(client):
    """
    Verifies that arbitrary external origins are not granted CORS access.
    """
    unauthorized_origin = "https://arbitrary-malicious-site.com"
    response = client.get("/api/health", headers={"Origin": unauthorized_origin})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") != unauthorized_origin

def test_cors_localhost_preserved(client):
    """
    Verifies that local development origins continue to function with CORS.
    """
    local_origin = "http://localhost:5173"
    response = client.get("/api/health", headers={"Origin": local_origin})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == local_origin


"""
SkyPredict AI - ML Service Layer
Bridges FastAPI request handling with ML inference and what-if simulation.
"""

import math
from datetime import datetime
from ml.inference import predict_flight, load_metrics, get_model
from ml.dataset_generator import AIRPORTS, AIRLINES, haversine_distance

_ACTIVE_MODEL_KEY = "xgboost"

def get_active_model_key():
    global _ACTIVE_MODEL_KEY
    return _ACTIVE_MODEL_KEY

def set_active_model_key(model_key: str):
    global _ACTIVE_MODEL_KEY
    valid_models = ["logistic_regression", "decision_tree", "random_forest", "xgboost"]
    if model_key not in valid_models:
        raise ValueError(f"Invalid model key: {model_key}. Must be one of {valid_models}")
    # Verify model file can be loaded
    get_model(model_key)
    _ACTIVE_MODEL_KEY = model_key
    return _ACTIVE_MODEL_KEY

def enrich_flight_inputs(flight_req: dict) -> dict:
    """
    Enriches user input with airport metadata, distance, derived calendar properties.
    """
    origin = flight_req.get("origin", "ATL").upper()
    dest = flight_req.get("dest", "ORD").upper()
    airline = flight_req.get("airline", "AA").upper()

    orig_info = AIRPORTS.get(origin, {"name": origin, "city": origin, "lat": 35.0, "lon": -90.0})
    dest_info = AIRPORTS.get(dest, {"name": dest, "city": dest, "lat": 40.0, "lon": -85.0})
    airline_info = AIRLINES.get(airline, {"name": airline})

    # Distance calculation
    dist = haversine_distance(orig_info["lat"], orig_info["lon"], dest_info["lat"], dest_info["lon"])
    sched_elapsed = int(round(dist / 460.0 * 60.0 + 35.0))

    # Parse date for day of week and month
    date_str = flight_req.get("flight_date", datetime.now().strftime("%Y-%m-%d"))
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        dow = dt.isoweekday()
        month = dt.month
    except Exception:
        dow = 4
        month = 7

    flight_num = flight_req.get("flight_number")
    if not flight_num or flight_num.strip() == "":
        import random
        flight_num = f"{airline}{random.randint(100, 9999)}"

    enriched = {
        "flight_number": flight_num,
        "airline": airline,
        "airline_name": airline_info["name"],
        "origin": origin,
        "origin_city": orig_info["city"],
        "dest": dest,
        "dest_city": dest_info["city"],
        "flight_date": date_str,
        "sched_dep_hour": int(flight_req.get("sched_dep_hour", 14)),
        "day_of_week": dow,
        "month": month,
        "weather_condition": flight_req.get("weather_condition", "Clear"),
        "distance_miles": float(dist),
        "sched_elapsed_min": float(sched_elapsed),
        "temp_c": float(flight_req.get("temp_c", 22.0)),
        "wind_speed_kts": float(flight_req.get("wind_speed_kts", 10.0)),
        "visibility_miles": float(flight_req.get("visibility_miles", 10.0)),
    }
    return enriched

def run_flight_prediction(flight_req: dict, model_key: str = None):
    """
    Enriches flight features and executes ML prediction pipeline.
    """
    chosen_model = model_key or get_active_model_key()
    enriched = enrich_flight_inputs(flight_req)
    result = predict_flight(enriched, model_key=chosen_model)

    return {
        "flight_number": enriched["flight_number"],
        "airline": enriched["airline"],
        "airline_name": enriched["airline_name"],
        "origin": enriched["origin"],
        "origin_city": enriched["origin_city"],
        "dest": enriched["dest"],
        "dest_city": enriched["dest_city"],
        "flight_date": enriched["flight_date"],
        "sched_dep_hour": enriched["sched_dep_hour"],
        "distance_miles": enriched["distance_miles"],
        "prediction_label": result["prediction_label"],
        "is_delayed": result["is_delayed"],
        "delay_probability": result["delay_probability"],
        "estimated_delay_minutes": result["estimated_delay_minutes"],
        "risk_level": result["risk_level"],
        "model_used": result["model_used"],
        "contributions": result["contributions"],
        "disclaimer": result["disclaimer"]
    }

def run_what_if_simulation(
    original_req: dict,
    scenario_hour: int,
    scenario_weather: str = None,
    scenario_airline: str = None,
    scenario_model_key: str = None
):
    """
    Executes what-if comparison between original schedule and alternative scenario.
    """
    # 1. Base prediction
    orig_res = run_flight_prediction(original_req, model_key=scenario_model_key)

    # 2. Scenario prediction with modified parameters
    mod_req = original_req.copy()
    mod_req["sched_dep_hour"] = scenario_hour
    if scenario_weather:
        mod_req["weather_condition"] = scenario_weather
    if scenario_airline:
        mod_req["airline"] = scenario_airline

    scenario_res = run_flight_prediction(mod_req, model_key=scenario_model_key)

    prob_diff = round(scenario_res["delay_probability"] - orig_res["delay_probability"], 4)
    min_diff = round(scenario_res["estimated_delay_minutes"] - orig_res["estimated_delay_minutes"], 1)
    hour_diff = scenario_hour - orig_res["sched_dep_hour"]

    # Natural-language summary
    if prob_diff < -0.05:
        insight = (
            f"Rescheduling from {orig_res['sched_dep_hour']:02d}:00 to {scenario_hour:02d}:00 "
            f"decreases estimated delay probability by {abs(prob_diff) * 100:.1f}% "
            f"and reduces expected delay by {abs(min_diff):.1f} minutes based on trained historical patterns."
        )
    elif prob_diff > 0.05:
        insight = (
            f"Moving flight to {scenario_hour:02d}:00 increases estimated delay probability by "
            f"{prob_diff * 100:.1f}% due to peak operational congestion in the target time window."
        )
    else:
        insight = (
            f"Shifting departure to {scenario_hour:02d}:00 shows marginal impact "
            f"({prob_diff * 100:+.1f}% probability change, {min_diff:+.1f} min delay duration)."
        )

    return {
        "original": orig_res,
        "scenario": scenario_res,
        "hour_difference": hour_diff,
        "delay_probability_change": prob_diff,
        "delay_minutes_change": min_diff,
        "summary_insight": insight
    }

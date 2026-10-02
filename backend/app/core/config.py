"""
SkyPredict AI - Core Application Configuration
"""

import os

class Settings:
    PROJECT_NAME: str = "SkyPredict AI"
    TAGLINE: str = "Smarter Predictions. Smoother Journeys."
    APP_ENV: str = os.getenv("APP_ENV", "development")
    API_V1_PREFIX: str = "/api"
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./skypredict.db")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "xgboost")

    # Paths
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_PATH = os.path.join(BASE_DIR, "ml", "data", "flights.csv")
    ARTIFACTS_DIR = os.path.join(BASE_DIR, "ml", "artifacts")

settings = Settings()

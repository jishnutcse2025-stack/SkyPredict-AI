"""
SkyPredict AI - Preprocessing & Feature Engineering Pipeline
Handles data cleaning, feature definition, column transformations, and pipeline serialization.
"""

import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split

CATEGORICAL_FEATURES = [
    "airline",
    "origin",
    "dest",
    "weather_condition"
]

NUMERICAL_FEATURES = [
    "sched_dep_hour",
    "day_of_week",
    "month",
    "distance_miles",
    "sched_elapsed_min",
    "temp_c",
    "wind_speed_kts",
    "visibility_miles"
]

ALL_FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET_CLASSIFICATION = "is_delayed"
TARGET_REGRESSION = "dep_delay_min"

def get_preprocessor():
    """
    Constructs a scikit-learn ColumnTransformer.
    - OneHotEncoder for categorical features (handles unknown categories gracefully).
    - StandardScaler for numerical features.
    """
    categorical_transformer = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    numerical_transformer = StandardScaler()

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
            ("num", numerical_transformer, NUMERICAL_FEATURES)
        ],
        remainder="drop"
    )
    return preprocessor

def load_and_prepare_data(csv_path: str):
    """
    Loads dataset, validates required columns, and prepares X and targets.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Flight dataset not found at: {csv_path}")

    df = pd.read_csv(csv_path)

    # Validate essential columns
    missing_cols = [c for c in ALL_FEATURE_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing required feature columns in dataset: {missing_cols}")

    if TARGET_CLASSIFICATION not in df.columns:
        if "dep_delay_min" in df.columns:
            df[TARGET_CLASSIFICATION] = (df["dep_delay_min"] >= 15.0).astype(int)
        else:
            raise ValueError("Target column 'is_delayed' or 'dep_delay_min' missing.")

    # Drop any rows with NaN in features or targets
    df_clean = df.dropna(subset=ALL_FEATURE_COLUMNS + [TARGET_CLASSIFICATION, TARGET_REGRESSION]).copy()

    X = df_clean[ALL_FEATURE_COLUMNS]
    y_class = df_clean[TARGET_CLASSIFICATION].values
    y_reg = df_clean[TARGET_REGRESSION].values

    return df_clean, X, y_class, y_reg

def split_data(X, y_class, y_reg, test_size=0.20, random_state=42):
    """
    Chronological/stratified split into train and test sets.
    """
    indices = range(len(X))
    idx_train, idx_test = train_test_split(
        indices, test_size=test_size, random_state=random_state, stratify=y_class
    )

    X_train = X.iloc[idx_train].reset_index(drop=True)
    X_test = X.iloc[idx_test].reset_index(drop=True)

    y_train_class = y_class[idx_train]
    y_test_class = y_class[idx_test]

    y_train_reg = y_reg[idx_train]
    y_test_reg = y_reg[idx_test]

    return X_train, X_test, y_train_class, y_test_class, y_train_reg, y_test_reg

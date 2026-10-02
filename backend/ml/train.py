"""
SkyPredict AI - Complete Machine Learning Model Training Pipeline
Trains multiple classification & regression models, evaluates on held-out test data,
and persists serializable pipelines and evaluation artifacts.
"""

import os
import json
import joblib
from datetime import datetime
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from xgboost import XGBClassifier, XGBRegressor

from ml.preprocess import (
    get_preprocessor,
    load_and_prepare_data,
    split_data,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES
)
from ml.evaluate import (
    evaluate_classification_model,
    evaluate_regression_model,
    extract_feature_importances
)
from ml.dataset_generator import generate_benchmark_flight_dataset

def run_training_pipeline(
    data_path: str = None,
    artifacts_dir: str = None,
    random_state: int = 42
):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if data_path is None:
        data_path = os.path.join(base_dir, "data", "flights.csv")
    if artifacts_dir is None:
        artifacts_dir = os.path.join(base_dir, "artifacts")

    os.makedirs(artifacts_dir, exist_ok=True)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)

    # If dataset not present, automatically generate calibrated benchmark dataset
    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Generating benchmark flight dataset...")
        generate_benchmark_flight_dataset(num_records=15000, random_seed=random_state, output_path=data_path)

    print(f"Loading flight data from {data_path}...")
    df, X, y_class, y_reg = load_and_prepare_data(data_path)
    print(f"Total clean records: {len(X)}")

    # Train / test split (80% / 20%)
    X_train, X_test, y_train_class, y_test_class, y_train_reg, y_test_reg = split_data(
        X, y_class, y_reg, test_size=0.20, random_state=random_state
    )
    print(f"Training set: {len(X_train)} samples | Testing set: {len(X_test)} samples")

    # Define Classification Algorithms
    classifiers = {
        "logistic_regression": {
            "name": "Logistic Regression",
            "type": "Linear / Probabilistic",
            "estimator": LogisticRegression(max_iter=1000, random_state=random_state)
        },
        "decision_tree": {
            "name": "Decision Tree Classifier",
            "type": "Tree-based",
            "estimator": DecisionTreeClassifier(max_depth=7, min_samples_split=20, random_state=random_state)
        },
        "random_forest": {
            "name": "Random Forest Classifier",
            "type": "Ensemble (Bagging)",
            "estimator": RandomForestClassifier(
                n_estimators=100, max_depth=10, min_samples_split=15, random_state=random_state, n_jobs=-1
            )
        },
        "xgboost": {
            "name": "XGBoost Classifier",
            "type": "Gradient Boosted Trees",
            "estimator": XGBClassifier(
                n_estimators=100, max_depth=6, learning_rate=0.08, subsample=0.85,
                eval_metric="logloss", random_state=random_state
            )
        }
    }

    # Define Regression Algorithms (for delay minutes duration)
    regressors = {
        "linear_regression": {
            "name": "Linear Regression",
            "estimator": LinearRegression()
        },
        "rf_regressor": {
            "name": "Random Forest Regressor",
            "estimator": RandomForestRegressor(
                n_estimators=80, max_depth=10, random_state=random_state, n_jobs=-1
            )
        },
        "xgboost_regressor": {
            "name": "XGBoost Regressor",
            "estimator": XGBRegressor(
                n_estimators=80, max_depth=6, learning_rate=0.08, subsample=0.85, random_state=random_state
            )
        }
    }

    classification_results = {}
    regression_results = {}

    # Train and evaluate Classification models
    print("\n--- Training Classification Models ---")
    for key, info in classifiers.items():
        print(f"Training {info['name']}...")
        pipeline = Pipeline([
            ("preprocessor", get_preprocessor()),
            ("classifier", info["estimator"])
        ])
        pipeline.fit(X_train, y_train_class)

        # Authentic evaluation on test set
        metrics = evaluate_classification_model(pipeline, X_test, y_test_class, model_name=key)
        feature_imps = extract_feature_importances(pipeline, CATEGORICAL_FEATURES, NUMERICAL_FEATURES)

        # Save pipeline model artifact
        model_path = os.path.join(artifacts_dir, f"{key}_model.joblib")
        joblib.dump(pipeline, model_path)

        classification_results[key] = {
            "key": key,
            "display_name": info["name"],
            "model_type": info["type"],
            "metrics": metrics,
            "feature_importance": feature_imps,
            "artifact_path": f"{key}_model.joblib"
        }
        print(f"  -> Accuracy: {metrics['accuracy']:.4f} | F1: {metrics['f1_score']:.4f} | AUC: {metrics['roc_auc']}")

    # Train and evaluate Regression models
    print("\n--- Training Regression Models (Delay Duration) ---")
    for key, info in regressors.items():
        print(f"Training {info['name']}...")
        reg_pipeline = Pipeline([
            ("preprocessor", get_preprocessor()),
            ("regressor", info["estimator"])
        ])
        reg_pipeline.fit(X_train, y_train_reg)

        reg_metrics = evaluate_regression_model(reg_pipeline, X_test, y_test_reg, model_name=key)
        reg_model_path = os.path.join(artifacts_dir, f"{key}_model.joblib")
        joblib.dump(reg_pipeline, reg_model_path)

        regression_results[key] = {
            "key": key,
            "display_name": info["name"],
            "metrics": reg_metrics,
            "artifact_path": f"{key}_model.joblib"
        }
        print(f"  -> MAE: {reg_metrics['mae']} min | RMSE: {reg_metrics['rmse']} min | R2: {reg_metrics['r2_score']}")

    # Save summary metadata and metrics to JSON
    metadata = {
        "trained_at": datetime.now().isoformat(),
        "dataset_path": os.path.relpath(data_path, os.path.dirname(artifacts_dir)),
        "dataset_records": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "random_state": random_state,
        "categorical_features": CATEGORICAL_FEATURES,
        "numerical_features": NUMERICAL_FEATURES,
        "target_classification": "is_delayed (delay >= 15 min)",
        "target_regression": "dep_delay_min (minutes)",
        "default_classification_model": "xgboost",
        "default_regression_model": "xgboost_regressor",
        "classification_models": classification_results,
        "regression_models": regression_results
    }

    metrics_file = os.path.join(artifacts_dir, "model_metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nAll models and evaluation metrics successfully saved to {artifacts_dir}")
    return metadata

if __name__ == "__main__":
    run_training_pipeline()

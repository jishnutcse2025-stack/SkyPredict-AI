"""
SkyPredict AI - Model Evaluation & Metrics Computation
Calculates authentic evaluation metrics for classification and regression models.
No fabricated or mocked numbers - every value is computed from actual test set predictions.
"""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    confusion_matrix,
    mean_absolute_error,
    root_mean_squared_error,
    r2_score
)

def evaluate_classification_model(model, X_test, y_test, model_name=""):
    """
    Evaluates classification model against ground truth test set.
    Returns dictionary with all metrics, confusion matrix, and ROC curve samples.
    """
    y_pred = model.predict(X_test)
    y_prob = None
    if hasattr(model, "predict_proba"):
        y_prob = model.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))

    auc = None
    roc_data = []
    if y_prob is not None:
        try:
            auc = float(roc_auc_score(y_test, y_prob))
            fpr, tpr, _ = roc_curve(y_test, y_prob)
            # Sample down to ~25 points for smooth Recharts rendering in UI
            indices = np.linspace(0, len(fpr) - 1, min(25, len(fpr)), dtype=int)
            roc_data = [
                {"fpr": round(float(fpr[i]), 4), "tpr": round(float(tpr[i]), 4)}
                for i in indices
            ]
            # Ensure boundaries
            if roc_data[0]["fpr"] != 0:
                roc_data.insert(0, {"fpr": 0.0, "tpr": 0.0})
            if roc_data[-1]["fpr"] != 1.0:
                roc_data.append({"fpr": 1.0, "tpr": 1.0})
        except Exception:
            auc = None

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    total = tn + fp + fn + tp
    metrics = {
        "model_key": model_name,
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4) if auc is not None else None,
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
            "matrix": [[tn, fp], [fn, tp]],
            "total_tested": total
        },
        "roc_curve": roc_data
    }
    return metrics

def evaluate_regression_model(model, X_test, y_test, model_name=""):
    """
    Evaluates regression model for delay duration estimation.
    """
    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    return {
        "model_key": model_name,
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2_score": round(r2, 4)
    }

def extract_feature_importances(pipeline, categorical_features, numerical_features):
    """
    Extracts feature names and importance weights from a pipeline containing ColumnTransformer and estimator.
    """
    try:
        preprocessor = pipeline.named_steps["preprocessor"]
        classifier = pipeline.named_steps["classifier"]

        # Extract transformed feature names
        cat_encoder = preprocessor.named_transformers_["cat"]
        cat_cols = cat_encoder.get_feature_names_out(categorical_features).tolist()
        feature_names = cat_cols + numerical_features

        importances = None
        if hasattr(classifier, "feature_importances_"):
            importances = classifier.feature_importances_
        elif hasattr(classifier, "coef_"):
            importances = np.abs(classifier.coef_[0])

        if importances is not None:
            # Aggregate one-hot feature importances back to original top-level features for clean display
            aggregated = {}
            for fname, imp in zip(feature_names, importances):
                # Check which group it belongs to
                base = fname.split("_")[0] if "_" in fname else fname
                # Check if matches one of the category original names
                matched = None
                for cat in categorical_features:
                    if fname.startswith(cat + "_"):
                        matched = cat
                        break
                if matched:
                    aggregated[matched] = aggregated.get(matched, 0.0) + float(imp)
                else:
                    aggregated[fname] = aggregated.get(fname, 0.0) + float(imp)

            total_val = sum(aggregated.values())
            if total_val > 0:
                normalized = [
                    {"feature": k, "importance": round(v / total_val, 4)}
                    for k, v in sorted(aggregated.items(), key=lambda item: item[1], reverse=True)
                ]
                return normalized
    except Exception as e:
        print(f"Notice: Feature importance extraction note: {e}")
    return []

"""Inference module for the identity confidence engine."""

from __future__ import annotations

import os

import joblib

from app.ml.feature_builder import FEATURE_COLUMNS, features_to_dataframe


MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def load_model(model_type: str = "rf"):
    """Load a trained model. Supports Random Forest and XGBoost."""
    if model_type == "rf":
        path = os.path.join(MODEL_DIR, "rf_identity_score.joblib")
        if os.path.exists(path):
            return joblib.load(path)
    elif model_type == "xgb":
        try:
            import xgboost as xgb

            path = os.path.join(MODEL_DIR, "xgb_identity_score.json")
            if os.path.exists(path):
                model = xgb.XGBRegressor()
                model.load_model(path)
                return model
        except ImportError:
            pass
    return None


def predict_score(features: dict, model_type: str = "rf") -> dict:
    """Predict a score and attach explanation data."""
    model = load_model(model_type)
    if model is None:
        return rule_based_score(features)

    frame = features_to_dataframe(features)
    predicted = max(0.0, min(100.0, float(model.predict(frame)[0])))

    return {
        "predicted_score": round(predicted, 1),
        "confidence_band": score_to_band(predicted),
        "top_factors": get_top_factors(model, features),
        "blocking_constraints": get_blocking_constraints(features),
        "model_version": f"{model_type}-model-v1",
    }


def rule_based_score(features: dict) -> dict:
    """Fallback scoring for environments without saved model artifacts."""
    score = features.get("weighted_evidence_sum", 0) * 18
    score += features.get("accepted_official_count", 0) * 10
    score += features.get("accepted_corroborated_count", 0) * 6
    score += features.get("documents_verified_count", 0) * 5
    score -= features.get("disputed_count", 0) * 12
    score -= features.get("rejected_count", 0) * 8
    score = max(0, min(100, score))

    top_factors = []
    if features.get("biometric_match_present"):
        top_factors.append({"name": "Biometric match", "impact": 20.0})
    if features.get("government_record_present"):
        top_factors.append({"name": "Government record match", "impact": 16.0})
    if features.get("verified_ngo_record_present"):
        top_factors.append({"name": "Verified NGO record", "impact": 15.0})
    if features.get("verified_family_links_count", 0) > 0:
        top_factors.append({
            "name": f"{features['verified_family_links_count']} verified family link(s)",
            "impact": features["verified_family_links_count"] * 6.0,
        })
    if features.get("disputed_count", 0) > 0:
        top_factors.append({
            "name": "Disputed evidence lowered confidence",
            "impact": -features["disputed_count"] * 12.0,
        })

    return {
        "predicted_score": round(score, 1),
        "confidence_band": score_to_band(score),
        "top_factors": top_factors[:5],
        "blocking_constraints": get_blocking_constraints(features),
        "model_version": "rule-based-v1",
        "feature_snapshot": features,
    }


def get_top_factors(model, features: dict) -> list:
    """Extract a short explanation using model feature importances."""
    try:
        importances = model.feature_importances_
        factor_impacts = []
        for index, column in enumerate(FEATURE_COLUMNS):
            if importances[index] > 0.01 and features.get(column, 0) > 0:
                factor_impacts.append(
                    {
                        "name": column.replace("_", " ").title(),
                        "impact": round(importances[index] * features[column] * 100, 1),
                    }
                )
        factor_impacts.sort(key=lambda item: abs(item["impact"]), reverse=True)
        return factor_impacts[:5]
    except Exception:
        return []


def get_blocking_constraints(features: dict) -> list:
    """Apply governance constraints after scoring."""
    constraints = []
    if features.get("accepted_official_count", 0) == 0:
        constraints.append("No reviewed official evidence prevents verified status")
    if features.get("disputed_count", 0) > 0:
        constraints.append("Disputed evidence prevents high-confidence status")
    if features.get("total_evidence_count", 0) < 2:
        constraints.append("Fewer than 2 evidence items submitted")
    return constraints


def score_to_band(score: float) -> str:
    if score >= 80:
        return "high_confidence"
    if score >= 60:
        return "verified"
    if score >= 40:
        return "provisional"
    return "under_review"

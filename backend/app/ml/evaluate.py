"""Model evaluation utilities."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def evaluate_model(model, X_test: pd.DataFrame, y_test: pd.Series) -> dict:
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    return {
        "r2": round(r2_score(y_test, predictions), 4),
        "mae": round(mean_absolute_error(y_test, predictions), 4),
        "rmse": round(mse ** 0.5, 4),
    }


def save_metrics(metrics: dict, output_path: str | Path) -> Path:
    """Persist evaluation metrics to a JSON file."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2)
    return path

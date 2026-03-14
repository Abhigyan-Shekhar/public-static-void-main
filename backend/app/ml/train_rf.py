"""Train Random Forest model for identity confidence scoring."""

from __future__ import annotations

from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

from app.ml.evaluate import evaluate_model, save_metrics
from app.ml.feature_builder import FEATURE_COLUMNS
from app.ml.generate_synthetic_data import TARGET_COLUMN, load_or_generate_dataset


MODEL_DIR = Path(__file__).resolve().parent / "models"


def train_random_forest(
    n_samples: int = 3000,
    random_state: int = 42,
    dataset_path: str | Path | None = None,
) -> tuple[RandomForestRegressor, dict]:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    dataset = load_or_generate_dataset(
        dataset_path=dataset_path,
        n_samples=n_samples,
        random_state=random_state,
    )
    X = dataset[FEATURE_COLUMNS]
    y = dataset[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=random_state
    )

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=random_state,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    metrics = evaluate_model(model, X_test, y_test)
    metrics["model_type"] = "random_forest"
    metrics["n_samples"] = len(dataset)

    model_path = MODEL_DIR / "rf_identity_score.joblib"
    joblib.dump(model, model_path)
    save_metrics(metrics, MODEL_DIR / "rf_identity_score.metrics.json")

    print(f"RF metrics: {metrics}")
    print(f"Model saved to {model_path}")

    return model, metrics


if __name__ == "__main__":
    train_random_forest()

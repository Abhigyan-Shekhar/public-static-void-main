"""Train XGBoost model for identity confidence scoring."""

from __future__ import annotations

from pathlib import Path

from sklearn.model_selection import train_test_split

from app.ml.evaluate import evaluate_model, save_metrics
from app.ml.feature_builder import FEATURE_COLUMNS
from app.ml.generate_synthetic_data import TARGET_COLUMN, load_or_generate_dataset


MODEL_DIR = Path(__file__).resolve().parent / "models"


def train_xgboost(
    n_samples: int = 3000,
    random_state: int = 42,
    dataset_path: str | Path | None = None,
):
    import xgboost as xgb

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

    model = xgb.XGBRegressor(
        n_estimators=400,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        objective="reg:squarederror",
        random_state=random_state,
    )
    model.fit(X_train, y_train)

    metrics = evaluate_model(model, X_test, y_test)
    metrics["model_type"] = "xgboost"
    metrics["n_samples"] = len(dataset)

    model_path = MODEL_DIR / "xgb_identity_score.json"
    model.save_model(model_path)
    save_metrics(metrics, MODEL_DIR / "xgb_identity_score.metrics.json")

    print(f"XGB metrics: {metrics}")
    print(f"Model saved to {model_path}")

    return model, metrics


if __name__ == "__main__":
    train_xgboost()

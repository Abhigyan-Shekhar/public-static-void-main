"""Generate synthetic training data for identity scoring."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.ml.feature_builder import FEATURE_COLUMNS


ML_DIR = Path(__file__).resolve().parent
DATA_DIR = ML_DIR / "data"
DEFAULT_DATASET_PATH = DATA_DIR / "synthetic_identity_scores.csv"
TARGET_COLUMN = "identity_score"


def generate_dataset(n_samples: int = 3000, random_state: int = 42) -> pd.DataFrame:
    """Generate policy-consistent synthetic rows following Context.md."""
    rng = np.random.RandomState(random_state)
    rows = []

    for _ in range(n_samples):
        corroborated_extra = rng.choice([0, 1, 2], p=[0.45, 0.4, 0.15])

        features = {
            "biometric_match_present": rng.choice([0, 1], p=[0.72, 0.28]),
            "government_record_present": rng.choice([0, 1], p=[0.62, 0.38]),
            "verified_ngo_record_present": rng.choice([0, 1], p=[0.55, 0.45]),
            "family_confirmation_present": rng.choice([0, 1], p=[0.45, 0.55]),
            "verified_family_links_count": rng.choice([0, 1, 2, 3], p=[0.45, 0.3, 0.18, 0.07]),
            "documents_verified_count": rng.choice([0, 1, 2], p=[0.42, 0.4, 0.18]),
            "documents_rejected_count": rng.choice([0, 1], p=[0.88, 0.12]),
            "external_confirmed_matches": rng.choice([0, 1, 2], p=[0.65, 0.27, 0.08]),
            "self_declared_count": rng.randint(0, 5),
            "disputed_count": rng.choice([0, 1, 2], p=[0.82, 0.14, 0.04]),
            "rejected_count": rng.choice([0, 1, 2], p=[0.76, 0.18, 0.06]),
            "days_in_system": rng.randint(1, 365),
        }

        features["official_evidence_count"] = (
            features["biometric_match_present"]
            + features["government_record_present"]
            + features["verified_ngo_record_present"]
        )
        features["corroborated_evidence_count"] = (
            features["family_confirmation_present"] + corroborated_extra
        )
        features["accepted_official_count"] = max(
            features["official_evidence_count"] - min(features["disputed_count"], features["official_evidence_count"]),
            0,
        )
        features["accepted_corroborated_count"] = max(
            features["corroborated_evidence_count"] - rng.choice([0, 1], p=[0.75, 0.25]),
            0,
        )
        features["total_evidence_count"] = (
            features["official_evidence_count"]
            + features["corroborated_evidence_count"]
            + features["self_declared_count"]
        )

        features["weighted_evidence_sum"] = (
            features["biometric_match_present"] * 0.95
            + features["government_record_present"] * 0.90
            + features["verified_ngo_record_present"] * 0.85
            + features["family_confirmation_present"] * 0.70
            + features["verified_family_links_count"] * 0.40
            + features["documents_verified_count"] * 0.35
            + features["external_confirmed_matches"] * 0.45
            + features["self_declared_count"] * 0.20
            - features["disputed_count"] * 0.55
            - features["rejected_count"] * 0.35
        )

        score = (
            features["biometric_match_present"] * 28
            + features["government_record_present"] * 24
            + features["verified_ngo_record_present"] * 15
            + features["family_confirmation_present"] * 10
            + max(features["corroborated_evidence_count"] - features["family_confirmation_present"], 0) * 8
            + features["self_declared_count"] * rng.uniform(2.0, 3.0)
            + features["documents_verified_count"] * 7
            + features["external_confirmed_matches"] * 8
            + features["verified_family_links_count"] * 6
            - features["disputed_count"] * 18
            - features["rejected_count"] * 12
            + rng.normal(0, 3)
        )
        features[TARGET_COLUMN] = round(float(np.clip(score, 0, 100)), 1)

        rows.append(features)

    return pd.DataFrame(rows, columns=[*FEATURE_COLUMNS, TARGET_COLUMN])


def save_dataset(
    n_samples: int = 3000,
    random_state: int = 42,
    output_path: str | Path | None = None,
) -> Path:
    dataset = generate_dataset(n_samples=n_samples, random_state=random_state)
    path = Path(output_path) if output_path else DEFAULT_DATASET_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_csv(path, index=False)
    return path


def load_or_generate_dataset(
    dataset_path: str | Path | None = None,
    n_samples: int = 3000,
    random_state: int = 42,
) -> pd.DataFrame:
    path = Path(dataset_path) if dataset_path else DEFAULT_DATASET_PATH
    if path.exists():
        return pd.read_csv(path)
    return generate_dataset(n_samples=n_samples, random_state=random_state)


if __name__ == "__main__":
    saved_path = save_dataset()
    print(f"Synthetic dataset saved to {saved_path}")

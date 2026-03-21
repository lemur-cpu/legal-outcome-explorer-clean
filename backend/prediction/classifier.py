"""XGBoost outcome classifier — loads trained model and serves predictions."""

import pickle
from pathlib import Path

import numpy as np
from loguru import logger

from backend.prediction.features import FEATURE_NAMES

MODEL_PATH = Path("data/models/xgboost_calibrated.pkl")
THRESHOLD = 0.098  # optimal F1 threshold from evaluate.py


class OutcomeClassifier:
    def __init__(self) -> None:
        self._model = None
        self._load()

    def _load(self) -> None:
        if not MODEL_PATH.exists():
            logger.warning(f"Model not found at {MODEL_PATH}. Predictions will use fallback.")
            return
        self._model = pickle.load(open(MODEL_PATH, "rb"))
        logger.info(f"Loaded classifier from {MODEL_PATH}")

    def predict(self, features: dict) -> dict:
        if self._model is None:
            return {
                "outcome": "affirmed",
                "confidence": 0.5,
                "proba_affirmed": 0.5,
                "proba_reversed": 0.5,
            }

        X = np.array([[features[f] for f in FEATURE_NAMES]])
        proba = self._model.predict_proba(X)[0]
        proba_affirmed = float(proba[0])
        proba_reversed = float(proba[1])

        outcome = "reversed" if proba_reversed >= THRESHOLD else "affirmed"
        confidence = proba_reversed if outcome == "reversed" else proba_affirmed

        return {
            "outcome": outcome,
            "confidence": round(confidence, 4),
            "proba_affirmed": round(proba_affirmed, 4),
            "proba_reversed": round(proba_reversed, 4),
        }


# Singleton used by the query router
classifier = OutcomeClassifier()

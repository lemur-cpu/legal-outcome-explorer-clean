"""SHAP explainer for the XGBoost outcome classifier."""

import pickle
from pathlib import Path

import numpy as np
import shap
from loguru import logger

from backend.prediction.features import FEATURE_NAMES

MODEL_PATH = Path("data/models/xgboost_calibrated.pkl")


class SHAPExplainer:
    def __init__(self) -> None:
        self._explainer = None
        self._load()

    def _load(self) -> None:
        if not MODEL_PATH.exists():
            logger.warning(f"Model not found at {MODEL_PATH}. SHAP explanations will be empty.")
            return
        calibrated = pickle.load(open(MODEL_PATH, "rb"))
        # CalibratedClassifierCV(cv='prefit') stores the base estimator in
        # calibrated_classifiers_[0].estimator
        xgb_model = calibrated.calibrated_classifiers_[0].estimator
        self._explainer = shap.TreeExplainer(xgb_model)
        logger.info("SHAP TreeExplainer initialized")

    def explain(self, features: dict) -> list[dict]:
        if self._explainer is None:
            return []

        X = np.array([[features[f] for f in FEATURE_NAMES]])
        shap_vals = self._explainer.shap_values(X)

        # TreeExplainer on binary XGBoost returns (1, n_features) array
        # for the positive class (reversed=1)
        if isinstance(shap_vals, list):
            vals = shap_vals[1][0]
        else:
            vals = shap_vals[0]

        result = [
            {
                "feature": fname,
                "value": round(float(val), 6),
                "direction": "+" if val >= 0 else "-",
            }
            for fname, val in zip(FEATURE_NAMES, vals)
        ]

        # Return top 6 by absolute importance
        result.sort(key=lambda x: abs(x["value"]), reverse=True)
        return result[:6]


# Singleton used by the query router
explainer = SHAPExplainer()

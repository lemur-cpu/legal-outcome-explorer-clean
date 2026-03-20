"""Train XGBoost outcome classifier with logistic regression baseline."""

import json
import numpy as np
import pickle
from pathlib import Path

from imblearn.over_sampling import SMOTE
from loguru import logger
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

FEATURES_PATH = Path("data/processed/features.npz")
MODELS_DIR = Path("data/models")


def main() -> None:
    data = np.load(FEATURES_PATH, allow_pickle=True)
    X, y = data["X"], data["y"]
    feature_names = data["feature_names"].tolist()

    class_counts = dict(zip(*np.unique(y, return_counts=True)))
    logger.info(f"Dataset: {len(X)} samples, class distribution: {class_counts}")

    # Stratified splits: 70/15/15
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.30, random_state=42, stratify=y
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
    )
    logger.info(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # SMOTE oversampling on train set only — val/test remain untouched
    smote = SMOTE(random_state=42, k_neighbors=min(5, sum(y_train == 1) - 1))
    X_train_bal, y_train_bal = smote.fit_resample(X_train, y_train)
    logger.info(f"After SMOTE: {dict(zip(*np.unique(y_train_bal, return_counts=True)))}")

    # Logistic Regression baseline
    lr = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    lr.fit(X_train_bal, y_train_bal)
    pickle.dump(lr, open(MODELS_DIR / "logistic_regression.pkl", "wb"))
    logger.info("Logistic regression trained and saved")

    # XGBoost — trained on SMOTE-balanced data, early stopping on unbalanced val
    xgb = XGBClassifier(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        eval_metric="logloss",
        early_stopping_rounds=20,
        random_state=42,
        verbosity=0,
    )
    xgb.fit(X_train_bal, y_train_bal, eval_set=[(X_val, y_val)], verbose=False)

    # Calibrate on val set
    calibrated = CalibratedClassifierCV(xgb, method="sigmoid", cv="prefit")
    calibrated.fit(X_val, y_val)
    pickle.dump(calibrated, open(MODELS_DIR / "xgboost_calibrated.pkl", "wb"))

    # Save feature names and test set for evaluate.py
    json.dump(feature_names, open(MODELS_DIR / "feature_names.json", "w"))
    np.savez(MODELS_DIR / "test_set.npz", X_test=X_test, y_test=y_test)
    logger.info("XGBoost trained, calibrated, and saved")


if __name__ == "__main__":
    main()

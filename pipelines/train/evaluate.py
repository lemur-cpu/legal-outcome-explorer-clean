"""Evaluate trained classifier and emit metrics report."""

import json
import numpy as np
import pickle
import random
from pathlib import Path

from loguru import logger
from sklearn.calibration import calibration_curve
from sklearn.metrics import f1_score, precision_recall_curve, precision_score, recall_score, roc_auc_score

MODELS_DIR = Path("data/models")


def compute_ece(y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10) -> float:
    fraction_pos, mean_pred = calibration_curve(y_true, y_prob, n_bins=n_bins)
    counts, _ = np.histogram(y_prob, bins=n_bins, range=(0, 1))
    weights = counts[counts > 0] / len(y_prob)
    ece = float(np.sum(weights * np.abs(fraction_pos - mean_pred)))
    return round(ece, 4)


def find_best_threshold(y_true: np.ndarray, y_prob: np.ndarray) -> float:
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_prob)
    f1s = 2 * precisions * recalls / (precisions + recalls + 1e-9)
    best_idx = f1s.argmax()
    return float(thresholds[best_idx]) if best_idx < len(thresholds) else 0.5


def evaluate_model(name: str, model, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    probs = model.predict_proba(X_test)[:, 1]
    threshold = find_best_threshold(y_test, probs)
    preds = (probs >= threshold).astype(int)
    return {
        "model":         name,
        "f1_macro":      round(f1_score(y_test, preds, average="macro"), 4),
        "auc":           round(roc_auc_score(y_test, probs), 4),
        "precision":     round(precision_score(y_test, preds, zero_division=0), 4),
        "recall":        round(recall_score(y_test, preds, zero_division=0), 4),
        "ece":           compute_ece(y_test, probs),
        "threshold":     round(threshold, 3),
    }


def compute_recall_at_k(labeled_path, client, encode_fn, k=5, sample=100) -> float:
    cases = [json.loads(l) for l in Path(labeled_path).read_text().splitlines()]
    sample_cases = random.sample(cases, min(sample, len(cases)))
    hits = 0
    for case in sample_cases:
        vector = encode_fn(case["full_text"][:512])
        results = client.search(
            collection_name="precedents",
            query_vector=vector,
            limit=k,
            with_payload=True,
        )
        query_id = str(case["case_id"])
        retrieved_ids = [str(r.payload["case_id"]) for r in results]
        if query_id in retrieved_ids:
            hits += 1
    recall = hits / len(sample_cases)
    print(f"Recall@{k}: {recall:.4f} (over {len(sample_cases)} samples)")
    return recall


def main() -> None:
    data = np.load(MODELS_DIR / "test_set.npz")
    X_test = data["X_test"]
    y_test = data["y_test"]

    lr = pickle.load(open(MODELS_DIR / "logistic_regression.pkl", "rb"))
    xgb = pickle.load(open(MODELS_DIR / "xgboost_calibrated.pkl", "rb"))

    results = [
        evaluate_model("Logistic Regression", lr, X_test, y_test),
        evaluate_model("XGBoost + Platt", xgb, X_test, y_test),
    ]

    print("\n" + "=" * 75)
    print(f'{"Model":<25} {"F1":>6} {"AUC":>6} {"Prec":>6} {"Rec":>6} {"ECE":>6} {"Thresh":>7}')
    print("-" * 75)
    for r in results:
        print(
            f'{r["model"]:<25} {r["f1_macro"]:>6} {r["auc"]:>6} '
            f'{r["precision"]:>6} {r["recall"]:>6} {r["ece"]:>6} {r["threshold"]:>7}'
        )
    print("=" * 75 + "\n")

    (MODELS_DIR / "metrics.json").write_text(json.dumps(results, indent=2))
    logger.info("Metrics saved to data/models/metrics.json")


if __name__ == "__main__":
    main()

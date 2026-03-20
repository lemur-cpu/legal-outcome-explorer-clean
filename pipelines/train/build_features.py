"""Build feature matrix from labeled, embedded cases for classifier training."""

import json
import numpy as np
from pathlib import Path

from loguru import logger
from qdrant_client import QdrantClient
from tqdm import tqdm

from backend.config import settings
from backend.prediction.features import extract_features, FEATURE_NAMES
from backend.retrieval.embedder import encode

LABELED_PATH = Path("data/processed/labeled_cases.jsonl")
OUTPUT_PATH = Path("data/processed/features.npz")


def get_neighbors(case: dict, client: QdrantClient, top_k: int = 5) -> list[dict] | None:
    vector = encode(case["full_text"][:512])
    results = client.search(
        collection_name="precedents",
        query_vector=vector,
        limit=top_k + 1,
        with_payload=True,
    )
    neighbors = [r for r in results if r.payload["case_id"] != case["case_id"]][:top_k]
    if len(neighbors) == 0:
        return None
    return [
        {
            "case_id": n.payload["case_id"],
            "court": n.payload["court"],
            "year": n.payload["year"],
            "outcome": n.payload["outcome"],
            "rerank_score": n.score,
            "snippet": n.payload.get("snippet", ""),
        }
        for n in neighbors
    ]


def main() -> None:
    cases = [json.loads(l) for l in LABELED_PATH.read_text().splitlines() if l.strip()]

    # Binary classification only: affirmed=0, reversed=1 — drop remanded
    cases = [c for c in cases if c["outcome"] in ("affirmed", "reversed")]
    n_affirmed = sum(1 for c in cases if c["outcome"] == "affirmed")
    n_reversed = sum(1 for c in cases if c["outcome"] == "reversed")
    logger.info(f"Binary cases: {len(cases)} (affirmed: {n_affirmed}, reversed: {n_reversed})")

    client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)

    X, y, skipped = [], [], 0
    for case in tqdm(cases, desc="Building features"):
        neighbors = get_neighbors(case, client, top_k=5)
        if neighbors is None or len(neighbors) < 3:
            skipped += 1
            continue
        features = extract_features(case["full_text"], neighbors)
        X.append([features[f] for f in FEATURE_NAMES])
        y.append(0 if case["outcome"] == "affirmed" else 1)

    logger.info(f"Skipped {skipped} cases (insufficient neighbors)")
    logger.info(f"Final dataset: {len(X)} samples")

    X = np.array(X)
    y = np.array(y)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    np.savez(OUTPUT_PATH, X=X, y=y, feature_names=FEATURE_NAMES)
    logger.info(f"Saved to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

"""In-memory BM25 index over labeled cases."""

from __future__ import annotations

import json
from pathlib import Path

from loguru import logger
from rank_bm25 import BM25Okapi

_CASES_PATH = Path("data/processed/labeled_cases.jsonl")


class BM25Index:
    def __init__(self, cases_path: Path = _CASES_PATH) -> None:
        self.cases: list[dict] = []

        if not cases_path.exists():
            logger.warning(
                f"BM25: labeled cases file not found at {cases_path}. "
                "Index will be empty."
            )
            self.bm25: BM25Okapi | None = None
            return

        with cases_path.open() as f:
            for line in f:
                line = line.strip()
                if line:
                    self.cases.append(json.loads(line))

        corpus = [doc["full_text"].split() for doc in self.cases]
        self.bm25 = BM25Okapi(corpus)
        logger.info(f"BM25 index built: {len(self.cases)} documents.")

    def search(self, query: str, top_k: int = 50) -> list[dict]:
        if self.bm25 is None or not self.cases:
            return []

        tokens = query.split()
        scores = self.bm25.get_scores(tokens)
        top_indices = sorted(
            range(len(scores)), key=lambda i: scores[i], reverse=True
        )[:top_k]

        return [
            {
                **self.cases[i],
                "bm25_score": float(scores[i]),
            }
            for i in top_indices
        ]


# Singleton — loaded once at module import
index = BM25Index()

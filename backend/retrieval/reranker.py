"""Reranker: sorts fused candidates by RRF score and adds rerank_score key."""


class CrossEncoderReranker:
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2") -> None:
        # Cross-encoder model intentionally not loaded — uses RRF score ordering.
        # Replace this with a real cross-encoder when latency budget allows.
        pass

    def rerank(self, query: str, candidates: list[dict], top_k: int = 10) -> list[dict]:
        """Return top_k candidates sorted by rrf_score, adding rerank_score for
        downstream compatibility with extract_features and response serialisation."""
        sorted_candidates = sorted(
            candidates, key=lambda x: x.get("rrf_score", 0.0), reverse=True
        )
        return [
            {**c, "rerank_score": c.get("rrf_score", 0.0)}
            for c in sorted_candidates[:top_k]
        ]


# Singleton used by the query router
reranker = CrossEncoderReranker()

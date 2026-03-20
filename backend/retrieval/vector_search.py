"""Vector similarity search via Qdrant."""

from __future__ import annotations

from qdrant_client import QdrantClient

from backend.config import settings

COLLECTION_NAME = "precedents"

_client: QdrantClient | None = None


def _get_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
    return _client


def search(query_vector: list[float], top_k: int = 50) -> list[dict]:
    """Return top_k nearest cases from Qdrant.

    Each result dict contains: case_id, score, court, year, outcome, snippet.
    """
    client = _get_client()
    hits = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k,
        with_payload=True,
    )
    return [
        {
            "case_id": hit.payload.get("case_id", ""),
            "score": hit.score,
            "court": hit.payload.get("court", ""),
            "year": hit.payload.get("year"),
            "outcome": hit.payload.get("outcome", ""),
            "snippet": hit.payload.get("snippet", ""),
        }
        for hit in hits
    ]

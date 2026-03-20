"""Lazy-loaded sentence-transformer embedder."""

from __future__ import annotations

from sentence_transformers import SentenceTransformer

_MODEL_NAME = "all-MiniLM-L6-v2"
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(_MODEL_NAME)
    return _model


def _truncate(text: str, max_tokens: int = 512) -> str:
    tokens = text.split()
    return " ".join(tokens[:max_tokens])


def encode(text: str) -> list[float]:
    """Embed a single string. Model is loaded on first call."""
    model = _get_model()
    truncated = _truncate(text)
    return model.encode([truncated])[0].tolist()

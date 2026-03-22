import time
import uuid

from fastapi import APIRouter
from loguru import logger

from backend.api.schemas import QueryRequest, QueryResponse
from backend.cache.redis_client import get_cached, set_cached
from backend.prediction.classifier import classifier
from backend.prediction.explainer import explainer
from backend.prediction.features import extract_features
from backend.retrieval.bm25_search import index as bm25_index
from backend.retrieval.embedder import encode
from backend.retrieval.fusion import reciprocal_rank_fusion
from backend.retrieval.reranker import reranker
from backend.retrieval.vector_search import search as vector_search

router = APIRouter()

OPINION_MARKERS = [
    "Circuit Judges.\n", "Circuit Judge.\n", "District Judge.\n",
    "\nPER CURIAM\n", "\nMEMORANDUM\n",
]


def extract_snippet(text: str, length: int = 300) -> str:
    # Find the judge panel line, then skip ~800 chars to clear the counsel listing
    start = 0
    for marker in OPINION_MARKERS:
        idx = text.upper().find(marker.upper())
        if idx != -1 and idx < 3000:
            start = idx + len(marker) + 800
            break
    if start == 0 or start > len(text):
        start = 1200
    snippet = text[start:start + length].strip()
    snippet = " ".join(snippet.split())
    return snippet if len(snippet) > 50 else " ".join(text[1200:1200 + length].split())


@router.post("/query", response_model=QueryResponse)
async def run_query(req: QueryRequest) -> QueryResponse:
    start = time.time()

    # Check cache
    cached = get_cached(req.query)
    if cached:
        logger.info(f"Cache hit for query: {req.query[:50]}")
        return cached

    # Retrieval pipeline
    query_vector = encode(req.query)
    vector_results = vector_search(query_vector, top_k=50)
    bm25_results = bm25_index.search(req.query, top_k=50)
    fused = reciprocal_rank_fusion(vector_results, bm25_results, top_n=10)
    reranked = reranker.rerank(req.query, fused, top_k=5)

    # Prediction
    features = extract_features(req.query, reranked)
    prediction = classifier.predict(features)
    shap_values = explainer.explain(features)

    # Rank-based display scores — meaningful relative ranking, not raw cosine
    RANK_SCORES = [97, 91, 85, 79, 73]
    for i, case in enumerate(reranked):
        case["display_score"] = RANK_SCORES[i] if i < len(RANK_SCORES) else 60

    # Format response
    results = []
    for c in reranked:
        display_score = min(99, max(1, c["display_score"]))

        snippet = c.get("snippet", "").strip()

        results.append({
            "case_id": c["case_id"],
            "title": c.get("case_id", "Unknown v. Unknown"),
            "court": c["court"],
            "year": c["year"],
            "outcome": c["outcome"],
            "similarity_score": display_score,
            "highlighted_snippets": [snippet],
        })

    latency_ms = int((time.time() - start) * 1000)
    logger.info(f"Query completed in {latency_ms}ms")

    response = {
        "query_id": str(uuid.uuid4()),
        "prediction": prediction,
        "shap_values": shap_values,
        "results": results,
        "latency_ms": latency_ms,
    }

    set_cached(req.query, response)
    return response

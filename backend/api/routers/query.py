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

    # Format response
    results = [
        {
            "case_id": c["case_id"],
            "title": c.get("case_id", "Unknown v. Unknown"),
            "court": c["court"],
            "year": c["year"],
            "outcome": c["outcome"],
            "similarity_score": round(c.get("rerank_score", c.get("rrf_score", 0.0)), 3),
            "highlighted_snippets": [c.get("snippet", "")[:200]],
        }
        for c in reranked
    ]

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

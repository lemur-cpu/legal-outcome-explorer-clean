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

def extract_snippet(text: str, length: int = 600) -> str:
    if not text:
        return ''

    # Remove all leading whitespace/newlines
    text = text.strip()

    # Split into lines, drop blank lines
    lines = [l.strip() for l in text.split('\n') if l.strip()]

    # Drop lines that are clearly header/metadata:
    SKIP_PATTERNS = [
        lambda l: len(l) < 4,                          # too short
        lambda l: 'v.' == l[-2:],                      # party line ending
        lambda l: l.startswith('No.'),                 # docket number
        lambda l: l.startswith('Argued'),              # argument date
        lambda l: l.startswith('Decided'),             # decision date
        lambda l: l.startswith('Before'),              # judge listing
        lambda l: l.isupper() and len(l) < 60,        # ALL CAPS header
        lambda l: 'Circuit' in l and len(l) < 40,     # "For the Ninth Circuit"
        lambda l: 'CLERK' in l,                        # clerk line
        lambda l: 'Appellant' in l and len(l) < 50,   # party designation
        lambda l: 'Appellee' in l and len(l) < 50,    # party designation
        lambda l: 'Plaintiff' in l and len(l) < 50,
        lambda l: 'Defendant' in l and len(l) < 50,
        lambda l: l.startswith('FOR THE COURT'),
        lambda l: 'not appropriate for publication' in l.lower(),
        lambda l: 'not precedent' in l.lower(),
    ]

    substantive_lines = []
    for line in lines:
        if any(pattern(line) for pattern in SKIP_PATTERNS):
            continue
        # Line must be a real sentence (ends with . or contains spaces)
        if len(line) > 40 and (' ' in line):
            substantive_lines.append(line)

    # Join first substantive lines up to length chars
    result = ' '.join(substantive_lines)
    result = result[:length].strip()

    # Last resort fallback
    if len(result) < 40:
        # Just take text starting from 20% in
        offset = len(text) // 5
        result = ' '.join(text[offset:offset+length].split())

    return result


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

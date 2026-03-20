"""Reciprocal Rank Fusion for merging dense and sparse result lists."""

from __future__ import annotations


def reciprocal_rank_fusion(
    vector_results: list[dict],
    bm25_results: list[dict],
    k: int = 60,
    top_n: int = 20,
) -> list[dict]:
    """Merge two ranked lists using RRF and return the top_n fused results.

    Both input lists must contain dicts with a 'case_id' key.
    Each output dict merges the metadata from both lists and adds 'rrf_score'.
    """
    scores: dict[str, float] = {}

    for rank, result in enumerate(vector_results):
        cid = result["case_id"]
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)

    for rank, result in enumerate(bm25_results):
        cid = result["case_id"]
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (k + rank + 1)

    sorted_ids = sorted(scores, key=lambda cid: scores[cid], reverse=True)[:top_n]

    # Build lookup from both result sets; vector_results takes precedence on key
    # conflicts so the vector score is preserved in the merged dict.
    all_results: dict[str, dict] = {
        r["case_id"]: r for r in bm25_results + vector_results
    }

    return [
        {**all_results[cid], "rrf_score": scores[cid]}
        for cid in sorted_ids
        if cid in all_results
    ]

import pandas as pd

FEATURE_NAMES = [
    "frac_affirmed",
    "frac_reversed",
    "mean_score",
    "top_score",
    "score_gap",
    "mean_year",
    "year_spread",
    "n_neighbors",
    "any_reversed",
    "majority_affirmed",
]


def extract_features(query: str, retrieved_cases: list[dict]) -> dict:
    """Extract numeric features from a query and its retrieved neighbors.

    Returns a dict keyed by FEATURE_NAMES. Also callable from the API via
    FeatureBuilder.build(), which wraps the result in a single-row DataFrame.
    """
    if not retrieved_cases:
        return {f: 0.0 for f in FEATURE_NAMES}

    outcomes = [c.get("outcome", "unknown") for c in retrieved_cases]
    scores = [float(c.get("rerank_score", 0.0)) for c in retrieved_cases]
    years = [int(c["year"]) for c in retrieved_cases if c.get("year")]

    n = len(retrieved_cases)
    n_affirmed = sum(1 for o in outcomes if o == "affirmed")
    n_reversed = sum(1 for o in outcomes if o == "reversed")

    sorted_scores = sorted(scores, reverse=True)
    top_score = sorted_scores[0] if sorted_scores else 0.0
    score_gap = (sorted_scores[0] - sorted_scores[1]) if len(sorted_scores) > 1 else 0.0

    return {
        "frac_affirmed":    n_affirmed / n,
        "frac_reversed":    n_reversed / n,
        "mean_score":       sum(scores) / n if scores else 0.0,
        "top_score":        top_score,
        "score_gap":        score_gap,
        "mean_year":        sum(years) / len(years) if years else 0.0,
        "year_spread":      float(max(years) - min(years)) if len(years) > 1 else 0.0,
        "n_neighbors":      float(n),
        "any_reversed":     1.0 if n_reversed > 0 else 0.0,
        "majority_affirmed": 1.0 if n_affirmed > n / 2 else 0.0,
    }


class FeatureBuilder:
    def build(self, query: str, retrieved_cases: list[dict]) -> pd.DataFrame:
        features = extract_features(query, retrieved_cases)
        return pd.DataFrame([features], columns=FEATURE_NAMES)

import pandas as pd


class FeatureBuilder:
    def build(self, query: str, retrieved_cases: list[dict]) -> pd.DataFrame:
        pass


def extract_features(query: str, retrieved_cases: list[dict]) -> pd.DataFrame:
    """Module-level convenience wrapper around FeatureBuilder."""
    return FeatureBuilder().build(query, retrieved_cases)

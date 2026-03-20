import xgboost as xgb
import pandas as pd


class OutcomeClassifier:
    def __init__(self) -> None:
        pass

    def load(self, path: str) -> None:
        pass

    def predict(self, features: pd.DataFrame) -> dict:
        pass


# Singleton used by the query router
classifier = OutcomeClassifier()

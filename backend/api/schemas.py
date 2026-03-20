from typing import Literal

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=10, max_length=2000)


class ShapValue(BaseModel):
    feature: str
    value: float
    direction: Literal["+", "-"]


class CaseResult(BaseModel):
    case_id: str
    title: str
    court: str
    year: int
    outcome: str
    similarity_score: float
    highlighted_snippets: list[str]


class PredictionResult(BaseModel):
    outcome: Literal["affirmed", "reversed"]
    confidence: float
    proba_affirmed: float
    proba_reversed: float


class QueryResponse(BaseModel):
    query_id: str
    prediction: PredictionResult
    shap_values: list[ShapValue]
    results: list[CaseResult]
    latency_ms: int


class AnalyticsResponse(BaseModel):
    by_circuit: list[dict]
    by_year: list[dict]
    summary: dict

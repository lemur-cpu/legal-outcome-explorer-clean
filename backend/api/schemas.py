from pydantic import BaseModel
from typing import Literal


OutcomeType = Literal["affirmed", "reversed", "remanded", "settled"]


class QueryRequest(BaseModel):
    pass


class HighlightSpan(BaseModel):
    pass


class CaseResult(BaseModel):
    pass


class ShapValue(BaseModel):
    pass


class PredictionResult(BaseModel):
    pass


class QueryResponse(BaseModel):
    pass


class AnalyticsResponse(BaseModel):
    pass

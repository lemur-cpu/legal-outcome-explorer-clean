from fastapi import APIRouter

from backend.api.schemas import QueryRequest, QueryResponse

router = APIRouter(tags=["query"])


@router.post("/query", response_model=QueryResponse)
async def submit_query(body: QueryRequest) -> QueryResponse:
    pass

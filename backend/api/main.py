from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from backend.api.routers import analytics, query


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Warm up embedding model so first request is not penalised
    from backend.retrieval.embedder import encode
    logger.info("Warming up embedding model…")
    encode("warmup")
    logger.info("Embedding model ready.")
    yield


app = FastAPI(title="PrecedentIQ API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(query.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import analytics, query

app = FastAPI(title="PrecedentIQ API", version="1.0.0")

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

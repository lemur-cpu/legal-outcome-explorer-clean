"""Redis cache helpers for query results."""

import hashlib
import json

import redis

from backend.config import settings

r = redis.from_url(settings.redis_url, decode_responses=True)
TTL = 3600  # seconds


def _cache_key(query: str) -> str:
    return "query_v2:" + hashlib.sha256(query.encode()).hexdigest()


def get_cached(query: str) -> dict | None:
    val = r.get(_cache_key(query))
    return json.loads(val) if val else None


def set_cached(query: str, result: dict) -> None:
    r.setex(_cache_key(query), TTL, json.dumps(result))

"""Batch-embed labeled cases and upsert vectors into Qdrant."""

import argparse
import json
from pathlib import Path

from loguru import logger
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

from backend.config import settings

LABELED_FILE = Path("data/processed/labeled_cases.jsonl")
MODEL_NAME = "all-MiniLM-L6-v2"
COLLECTION_NAME = "precedents"
VECTOR_DIM = 384
BATCH_SIZE = 64


def _truncate(text: str, max_tokens: int = 512) -> str:
    """Return at most max_tokens whitespace-split tokens joined back to a string."""
    tokens = text.split()
    return " ".join(tokens[:max_tokens])


def create_collection(client: QdrantClient) -> None:
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
    )
    logger.info(f"Collection '{COLLECTION_NAME}' (re)created.")


def embed_and_upsert(
    cases: list[dict],
    model: SentenceTransformer,
    client: QdrantClient,
    batch_size: int = BATCH_SIZE,
) -> None:
    total_batches = (len(cases) + batch_size - 1) // batch_size

    for batch_idx in tqdm(range(total_batches), desc="Embedding batches", unit="batch"):
        batch_cases = cases[batch_idx * batch_size : (batch_idx + 1) * batch_size]
        texts = [_truncate(c["full_text"]) for c in batch_cases]

        vectors = model.encode(texts, batch_size=batch_size, show_progress_bar=False)

        points = [
            PointStruct(
                id=hash(case["case_id"]) % (10**15),
                vector=vector.tolist(),
                payload={
                    "case_id": case["case_id"],
                    "court": case.get("court", ""),
                    "year": case.get("year"),
                    "outcome": case["outcome"],
                    "label_confidence": case["label_confidence"],
                    "snippet": case["full_text"][:300],
                },
            )
            for case, vector in zip(batch_cases, vectors)
        ]

        client.upsert(collection_name=COLLECTION_NAME, points=points)

        if (batch_idx + 1) % 10 == 0:
            logger.info(f"Upserted {(batch_idx + 1) * batch_size} records so far…")


def main() -> None:
    parser = argparse.ArgumentParser(description="Batch-embed labeled cases into Qdrant.")
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Max cases to embed (0 = all).",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=MODEL_NAME,
        help=f"Sentence-transformer model name (default: {MODEL_NAME}).",
    )
    args = parser.parse_args()

    if not LABELED_FILE.exists():
        logger.error(f"Labeled cases not found at {LABELED_FILE}. Run label.py first.")
        raise SystemExit(1)

    logger.info(f"Loading cases from {LABELED_FILE}…")
    cases: list[dict] = []
    with LABELED_FILE.open() as f:
        for line in f:
            line = line.strip()
            if line:
                cases.append(json.loads(line))

    if args.limit:
        cases = cases[: args.limit]
    logger.info(f"Cases to embed: {len(cases)}")

    logger.info(f"Loading model '{args.model}'…")
    model = SentenceTransformer(args.model)

    client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)

    create_collection(client)
    embed_and_upsert(cases, model, client, batch_size=BATCH_SIZE)

    collection_info = client.get_collection(COLLECTION_NAME)
    vector_count = collection_info.vectors_count
    logger.info(
        f"Done. Total embedded: {len(cases)} | "
        f"Collection size: {vector_count} vectors"
    )


if __name__ == "__main__":
    main()

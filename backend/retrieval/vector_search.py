from qdrant_client import QdrantClient


class VectorSearch:
    def __init__(self, client: QdrantClient, collection: str = "cases") -> None:
        pass

    def search(self, query_vector: list[float], top_k: int = 20) -> list[dict]:
        pass

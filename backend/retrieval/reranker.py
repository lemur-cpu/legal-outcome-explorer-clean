class CrossEncoderReranker:
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2") -> None:
        pass

    def rerank(self, query: str, candidates: list[dict], top_k: int = 10) -> list[dict]:
        pass


# Singleton used by the query router
reranker = CrossEncoderReranker()

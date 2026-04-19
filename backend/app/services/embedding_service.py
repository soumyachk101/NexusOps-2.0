import json
import math
from typing import Optional
from openai import AsyncOpenAI
from app.config import settings


class EmbeddingService:
    """OpenAI text-embedding-3-small embeddings + cosine similarity search.

    Stores embeddings as JSON arrays (TEXT column) for SQLite/PostgreSQL compatibility.
    In production with PostgreSQL + pgvector, replace with native vector search.
    """

    EMBEDDING_DIM = 1536

    @staticmethod
    def _client() -> AsyncOpenAI:
        return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    @staticmethod
    async def generate_embedding(text: str) -> list[float] | None:
        """Generate a 1536-dim embedding for the given text.

        Returns None if OpenAI API key is not configured.
        """
        if not settings.OPENAI_API_KEY:
            return None

        try:
            client = EmbeddingService._client()
            response = await client.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=text[:8000],  # truncate to stay within token limits
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding generation error: {e}")
            return None

    @staticmethod
    def embedding_to_json(embedding: list[float]) -> str:
        return json.dumps(embedding)

    @staticmethod
    def embedding_from_json(json_str: str) -> list[float] | None:
        if not json_str:
            return None
        try:
            return json.loads(json_str)
        except Exception:
            return None

    @staticmethod
    def cosine_similarity(a: list[float], b: list[float]) -> float:
        """Compute cosine similarity between two embedding vectors."""
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        mag_a = math.sqrt(sum(x * x for x in a))
        mag_b = math.sqrt(sum(x * x for x in b))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    @staticmethod
    def search_similar_chunks(
        query_embedding: list[float],
        chunks: list[dict],
        threshold: float = 0.65,
        top_k: int = 5,
    ) -> list[dict]:
        """Find the most semantically similar chunks to the query.

        chunks: list of dicts with "embedding_json" key (plus any other fields)
        Returns: top_k chunks above threshold, sorted by similarity desc.
        Each returned dict includes a "similarity" score.
        """
        scored = []
        for chunk in chunks:
            emb_json = chunk.get("embedding_json")
            if not emb_json:
                continue
            emb = EmbeddingService.embedding_from_json(emb_json)
            if not emb:
                continue
            sim = EmbeddingService.cosine_similarity(query_embedding, emb)
            if sim >= threshold:
                scored.append({**chunk, "similarity": sim})

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:top_k]

    @staticmethod
    def chunk_text(text: str, chunk_size: int = 2000, overlap: int = 200) -> list[str]:
        """Split text into overlapping chunks (approx 512 tokens = ~2000 chars).

        Uses character-based chunking with sentence-boundary awareness.
        """
        if len(text) <= chunk_size:
            return [text]

        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            if end < len(text):
                # Try to break at sentence boundary
                boundary = text.rfind(". ", start, end)
                if boundary > start + chunk_size // 2:
                    end = boundary + 1
                else:
                    # Fall back to word boundary
                    boundary = text.rfind(" ", start, end)
                    if boundary > start:
                        end = boundary

            chunks.append(text[start:end].strip())
            start = end - overlap  # overlap for context continuity

        return [c for c in chunks if c]


embedding_service = EmbeddingService()

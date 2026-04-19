from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import time

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.document_chunk import DocumentChunk
from app.models.source import Source
from app.services.workspace_service import workspace_service
from app.services.ai_service import ai_service
from app.services.embedding_service import embedding_service
from app.schemas.memory import QueryResponse

router = APIRouter()


@router.get("/", response_model=QueryResponse)
async def memory_query(
    workspace_id: UUID,
    query: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Answer a question using semantic search over ingested team knowledge."""
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    start = time.time()

    # Generate query embedding for semantic search
    query_embedding = await embedding_service.generate_embedding(query)

    context_chunks = []
    sources_used = []

    if query_embedding:
        # Load all document chunks for this workspace
        chunks_result = await db.execute(
            select(DocumentChunk).where(
                DocumentChunk.workspace_id == workspace_id,
                DocumentChunk.embedding_json.isnot(None),
            )
        )
        all_chunks = chunks_result.scalars().all()

        chunk_dicts = [
            {
                "text": c.text,
                "embedding_json": c.embedding_json,
                "source_type": c.source_type or "document",
                "sender": c.sender,
                "timestamp": c.timestamp.isoformat() if c.timestamp else None,
                "channel_name": c.channel_name,
                "source_id": str(c.source_id),
            }
            for c in all_chunks
        ]

        # Semantic search: similarity threshold 0.65 per docs
        similar_chunks = embedding_service.search_similar_chunks(
            query_embedding,
            chunk_dicts,
            threshold=0.65,
            top_k=8,
        )
        context_chunks = similar_chunks

        # Gather unique source info for citation
        seen_source_ids = set()
        for chunk in similar_chunks:
            sid = chunk.get("source_id")
            if sid and sid not in seen_source_ids:
                seen_source_ids.add(sid)

        if seen_source_ids:
            sources_result = await db.execute(
                select(Source).where(Source.id.in_([UUID(s) for s in seen_source_ids]))
            )
            for s in sources_result.scalars().all():
                sources_used.append({"id": str(s.id), "name": s.name, "type": s.source_type})

    elif not query_embedding:
        # Fallback when OpenAI key not set: pass source names as light context
        sources_result = await db.execute(
            select(Source).where(
                Source.workspace_id == workspace_id,
                Source.status == "processed",
            )
        )
        sources = sources_result.scalars().all()
        context_chunks = [
            {"text": s.name or "", "source_type": s.source_type, "sender": None, "timestamp": None}
            for s in sources
            if s.name
        ]
        sources_used = [{"id": str(s.id), "name": s.name, "type": s.source_type} for s in sources[:5]]

    try:
        qa_result = await ai_service.memory_qa(
            question=query,
            context_chunks=context_chunks if context_chunks else None,
        )
        answer = qa_result["answer"]
    except Exception as e:
        print(f"Memory Q&A error: {e}")
        answer = f"Error processing query. Please ensure the AI service is configured."

    latency_ms = int((time.time() - start) * 1000)

    return QueryResponse(
        answer=answer,
        sources=sources_used[:5],
        latency_ms=latency_ms,
    )

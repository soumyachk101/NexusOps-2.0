from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
import time

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.source import Source
from app.services.workspace_service import workspace_service
from app.schemas.memory import QueryResponse
from app.services.ai_service import ai_service

router = APIRouter()


@router.get("/", response_model=QueryResponse)
async def memory_query(
    workspace_id: UUID,
    query: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    start = time.time()

    # Fetch all ingested sources as context chunks
    result = await db.execute(
        select(Source).where(Source.workspace_id == workspace_id, Source.status == "processed")
    )
    sources = result.scalars().all()

    context_chunks = [s.name for s in sources if s.name] if sources else None

    try:
        qa_result = await ai_service.memory_qa(
            question=query,
            context_chunks=context_chunks,
        )
        answer = qa_result["answer"]
    except Exception as e:
        print(f"Memory Q&A error: {e}")
        answer = (
            f"I searched through your team's records for: \"{query}\". "
            f"There was an issue processing this query. Please ensure the backend AI service is running."
        )

    latency_ms = int((time.time() - start) * 1000)

    return QueryResponse(
        answer=answer,
        sources=[
            {"name": s.name, "type": s.source_type, "id": str(s.id)}
            for s in (sources or [])[:5]
        ],
        latency_ms=latency_ms,
    )

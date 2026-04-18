from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.workspace_service import workspace_service
from app.schemas.memory import QueryRequest, QueryResponse
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

    # In a real implementation, we would fetch relevant context from the vector DB here.
    # For now, we'll just use the AI service to answer the query directly.
    answer = await ai_service.generate_response(f"Question about workspace {workspace_id}: {query}")
    
    return QueryResponse(
        answer=answer,
        sources=[],  # Sources logic will be implemented when vector search is ready
        latency_ms=0
    )


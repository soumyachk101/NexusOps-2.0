from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.workspace_service import workspace_service
from app.schemas.memory import QueryRequest, QueryResponse

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def memory_query(
    body: QueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, body.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    # MOCK implementation
    return QueryResponse(answer="Mock response: Query answered via Memory Engine API.", latency_ms=120)


@router.get("/search", response_model=QueryResponse)
async def memory_search(
    workspace_id: UUID,
    q: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    # MOCK implementation
    return QueryResponse(answer=f"Mock response: Searched for '{q}' via Memory Engine.", latency_ms=45)

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.source import Source
from app.services.workspace_service import workspace_service
from app.schemas.memory import SourceResponse
from pydantic import BaseModel

class IngestDocumentRequest(BaseModel):
    workspace_id: UUID
    name: str
    source_type: str = "document"

router = APIRouter()


@router.get("/", response_model=List[SourceResponse])
async def list_sources(
    workspace_id: UUID = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        return []

    stmt = select(Source).where(Source.workspace_id == workspace_id).order_by(Source.created_at.desc())
    result = await db.execute(stmt)
    return [SourceResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/telegram/connect")
async def connect_telegram():
    return {"status": "placeholder", "note": "Phase 4"}


@router.post("/audio")
async def ingest_audio():
    return {"status": "placeholder", "note": "Phase 4"}


@router.post("/document", response_model=SourceResponse)
async def ingest_document(
    body: IngestDocumentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, body.workspace_id, current_user.id)
    if not is_member:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    source = Source(
        workspace_id=body.workspace_id,
        name=body.name,
        source_type=body.source_type,
        status="processed" # Mocking immediate processing for hackathon
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return SourceResponse.model_validate(source)

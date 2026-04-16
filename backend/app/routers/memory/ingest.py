from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database import get_db
from app.models.source import Source
from app.schemas.memory import SourceResponse

router = APIRouter()


@router.get("/", response_model=List[SourceResponse])
async def list_sources(
    workspace_id: UUID = Query(...),
    db: Session = Depends(get_db)
):
    stmt = select(Source).where(Source.workspace_id == workspace_id).order_by(Source.created_at.desc())
    result = db.execute(stmt)
    return result.scalars().all()


@router.post("/telegram/connect")
async def connect_telegram():
    return {"status": "placeholder", "note": "Phase 4"}


@router.post("/audio")
async def ingest_audio():
    return {"status": "placeholder", "note": "Phase 4"}


@router.post("/document")
async def ingest_document():
    return {"status": "placeholder", "note": "Phase 4"}

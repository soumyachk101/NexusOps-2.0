from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.task import Problem
from app.services.workspace_service import workspace_service
from app.schemas.memory import ProblemResponse

router = APIRouter()


@router.get("/", response_model=list[ProblemResponse])
async def list_problems(
    workspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    result = await db.execute(select(Problem).where(Problem.workspace_id == workspace_id).order_by(Problem.last_seen.desc()))
    problems = result.scalars().all()
    return [ProblemResponse.model_validate(p) for p in problems]

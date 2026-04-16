from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.task import Task
from app.services.workspace_service import workspace_service
from app.schemas.memory import TaskResponse

router = APIRouter()


@router.get("/", response_model=list[TaskResponse])
async def list_tasks(
    workspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    result = await db.execute(select(Task).where(Task.workspace_id == workspace_id).order_by(Task.detected_at.desc()))
    tasks = result.scalars().all()
    return [TaskResponse.model_validate(t) for t in tasks]


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    status: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    is_member = await workspace_service.is_member(db, task.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    task.status = status
    await db.commit()
    await db.refresh(task)
    return TaskResponse.model_validate(task)


@router.post("/{task_id}/jira")
async def push_to_jira(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    is_member = await workspace_service.is_member(db, task.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    # MOCK implementation
    task.jira_ticket_key = f"NEX-{str(task.id)[:4]}"
    await db.commit()
    await db.refresh(task)
    
    return {"status": "success", "jira_key": task.jira_ticket_key}

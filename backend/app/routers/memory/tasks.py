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

    result = await db.execute(
        select(Task).where(Task.workspace_id == workspace_id).order_by(Task.detected_at.desc())
    )
    tasks = result.scalars().all()
    return [TaskResponse.model_validate(t) for t in tasks]


@router.post("/", response_model=TaskResponse)
async def create_task(
    workspace_id: UUID,
    title: str,
    description: str = "",
    priority: str = "medium",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    task = Task(
        workspace_id=workspace_id,
        title=title,
        description=description,
        priority=priority,
        status="pending",
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return TaskResponse.model_validate(task)


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
    """Create a real Jira ticket from a detected task."""
    from app.config import settings

    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    is_member = await workspace_service.is_member(db, task.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    if not all([settings.JIRA_BASE_URL, settings.JIRA_API_TOKEN, settings.JIRA_USER_EMAIL]):
        raise HTTPException(
            status_code=503,
            detail="Jira not configured. Add JIRA_BASE_URL, JIRA_API_TOKEN, and JIRA_USER_EMAIL to settings.",
        )

    import httpx
    import base64

    credentials = base64.b64encode(
        f"{settings.JIRA_USER_EMAIL}:{settings.JIRA_API_TOKEN}".encode()
    ).decode()

    headers = {
        "Authorization": f"Basic {credentials}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    # Build Jira issue payload (Atlassian REST API v3)
    priority_map = {"high": "High", "medium": "Medium", "low": "Low"}
    payload = {
        "fields": {
            "project": {"key": settings.JIRA_PROJECT_KEY or "NEX"},
            "summary": task.title,
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {"type": "text", "text": task.description or task.title}
                        ],
                    }
                ],
            },
            "issuetype": {"name": "Task"},
            "priority": {"name": priority_map.get(task.priority, "Medium")},
        }
    }

    if task.assignee_hint:
        payload["fields"]["labels"] = [f"assignee:{task.assignee_hint}"]

    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.post(
                f"{settings.JIRA_BASE_URL}/rest/api/3/issue",
                headers=headers,
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            jira_key = data.get("key")
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Jira API error ({e.response.status_code}): {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Could not reach Jira: {e}")

    task.jira_ticket_key = jira_key
    await db.commit()
    await db.refresh(task)

    return {
        "status": "success",
        "jira_key": jira_key,
        "jira_url": f"{settings.JIRA_BASE_URL}/browse/{jira_key}",
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.models.source import Source
from app.models.task import Task
from app.models.activity_log import ActivityLog
from app.services.workspace_service import workspace_service

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(
    workspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get real dashboard statistics for the workspace."""
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    # 1. Incident Stats
    total_incidents_stmt = select(func.count(Incident.id)).where(Incident.workspace_id == workspace_id)
    resolved_incidents_stmt = select(func.count(Incident.id)).where(
        Incident.workspace_id == workspace_id, Incident.status == "resolved"
    )
    active_incidents_stmt = select(func.count(Incident.id)).where(
        Incident.workspace_id == workspace_id,
        Incident.status.notin_(["resolved", "dismissed"])
    )

    total_incidents = (await db.execute(total_incidents_stmt)).scalar() or 0
    resolved_incidents = (await db.execute(resolved_incidents_stmt)).scalar() or 0
    active_incidents = (await db.execute(active_incidents_stmt)).scalar() or 0

    # 2. Memory Stats
    total_sources_stmt = select(func.count(Source.id)).where(Source.workspace_id == workspace_id)
    total_tasks_stmt = select(func.count(Task.id)).where(Task.workspace_id == workspace_id)
    pending_tasks_stmt = select(func.count(Task.id)).where(
        Task.workspace_id == workspace_id, Task.status == "pending"
    )

    total_sources = (await db.execute(total_sources_stmt)).scalar() or 0
    total_tasks = (await db.execute(total_tasks_stmt)).scalar() or 0
    pending_tasks = (await db.execute(pending_tasks_stmt)).scalar() or 0

    # 3. Success Rate
    success_rate = round((resolved_incidents / total_incidents * 100), 1) if total_incidents > 0 else 0

    return {
        "incidents": {
            "total": total_incidents,
            "active": active_incidents,
            "resolved": resolved_incidents,
            "success_rate": success_rate
        },
        "memory": {
            "sources": total_sources,
            "tasks": total_tasks,
            "pending_tasks": pending_tasks
        },
        "performance": {
            "mttr": "12m", # Placeholder until we calculate real MTTR
            "autofix_rate": "84%" 
        }
    }


@router.get("/timeline")
async def get_activity_timeline(
    workspace_id: UUID,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the combined activity timeline for the workspace."""
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    stmt = select(ActivityLog).where(
        ActivityLog.workspace_id == workspace_id
    ).order_by(ActivityLog.created_at.desc()).limit(limit)

    result = await db.execute(stmt)
    logs = result.scalars().all()

    return [
        {
            "id": str(log.id),
            "module": log.module,
            "type": log.action,  # Map 'action' to 'type' for frontend icons
            "title": log.metadata_.get("title", log.action.replace("_", " ").title()),
            "description": log.metadata_.get("description", ""),
            "timestamp": log.created_at.isoformat(),
        }
        for log in logs
    ]

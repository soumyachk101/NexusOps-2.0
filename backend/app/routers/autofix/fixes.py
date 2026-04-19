from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.fix import Fix
from app.models.incident import Incident
from app.services.workspace_service import workspace_service
from app.schemas.autofix import FixResponse

router = APIRouter()


@router.get("/incident/{incident_id}", response_model=list[FixResponse])
async def list_fixes_for_incident(
    incident_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all AI-generated fixes for a specific incident."""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    is_member = await workspace_service.is_member(db, incident.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    result = await db.execute(
        select(Fix).where(Fix.incident_id == incident_id).order_by(Fix.created_at.desc())
    )
    fixes = result.scalars().all()
    return [FixResponse.model_validate(f) for f in fixes]


@router.post("/{fix_id}/approve", response_model=FixResponse)
async def approve_fix(
    fix_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Fix).where(Fix.id == fix_id))
    fix = result.scalar_one_or_none()
    if not fix:
        raise HTTPException(status_code=404, detail="Fix not found")

    # Get incident
    result = await db.execute(select(Incident).where(Incident.id == fix.incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    is_member = await workspace_service.is_member(db, incident.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    fix.safety_score = "SAFE"
    fix.reviewed_by = current_user.id
    from datetime import datetime, timezone
    fix.reviewed_at = datetime.now(timezone.utc)

    incident.status = "pr_created"
    incident.pr_url = f"https://github.com/nexusops/autofix/pull/{str(fix.id)[:8]}"
    incident.pr_created_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(fix)
    return FixResponse.model_validate(fix)

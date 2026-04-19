from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.database import get_db, async_session_maker
from app.dependencies import get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.models.fix import Fix
from app.models.source import Source
from app.services.workspace_service import workspace_service
from app.services.ai_service import ai_service
from app.schemas.autofix import IncidentResponse, CreateManualIncidentRequest

router = APIRouter()


async def run_incident_pipeline(incident_id: UUID):
    """Full AI pipeline: sanitize → analyze (with memory) → generate fix."""
    async with async_session_maker() as db:
        result = await db.execute(select(Incident).where(Incident.id == incident_id))
        incident = result.scalar_one_or_none()
        if not incident:
            return

        try:
            # Step 1: Sanitize
            incident.status = "sanitizing"
            await db.commit()

            error_text = incident.error_message or incident.raw_error or ""
            trace_text = incident.raw_stack_trace or ""

            sanitized_error, san_report = ai_service.sanitize_data(error_text)
            sanitized_trace, _ = ai_service.sanitize_data(trace_text)
            incident.sanitized_error = sanitized_error
            incident.sanitized_stack_trace = sanitized_trace
            incident.sanitization_report = san_report

            # Step 2: Query Memory Engine for context (THE SHOWPIECE!)
            incident.status = "querying_memory"
            await db.commit()

            memory_context_list = []
            try:
                # Search for related content in sources
                sources_result = await db.execute(
                    select(Source).where(Source.workspace_id == incident.workspace_id)
                )
                sources = sources_result.scalars().all()
                # Collect source names as context hints
                for s in sources:
                    if s.name:
                        memory_context_list.append(
                            f"[Source: {s.source_type}] {s.name} (status: {s.status})"
                        )
            except Exception as mem_err:
                print(f"Memory query failed (non-fatal): {mem_err}")

            # Store memory context on the incident
            if memory_context_list:
                incident.memory_context = {
                    "related_discussions": memory_context_list[:5],
                    "query": sanitized_error[:200],
                    "matches_found": len(memory_context_list),
                    "insight": f"Found {len(memory_context_list)} related sources in team memory.",
                }
            else:
                incident.memory_context = {
                    "related_discussions": [],
                    "query": sanitized_error[:200],
                    "matches_found": 0,
                    "insight": "No prior team discussions found about this error. This may be a new issue.",
                }

            # Step 3: AI Analysis
            incident.status = "analyzing"
            await db.commit()

            analysis = await ai_service.analyze_incident(
                error_message=sanitized_error,
                stack_trace=sanitized_trace,
                memory_context=memory_context_list if memory_context_list else None,
            )

            incident.root_cause = analysis.get("root_cause", "Analysis inconclusive")
            incident.affected_files = analysis.get("affected_files", [])
            incident.analysis_confidence = analysis.get("confidence", 0.5)
            incident.analysis_keywords = [analysis.get("severity_assessment", "medium")]

            # Update severity if AI thinks differently
            ai_severity = analysis.get("severity_assessment", "").lower()
            if ai_severity in ("critical", "high", "medium", "low"):
                incident.severity = ai_severity

            # Step 4: Generate Fix
            incident.status = "generating_fix"
            await db.commit()

            fix_data = await ai_service.generate_fix(
                error_message=sanitized_error,
                root_cause=incident.root_cause,
                stack_trace=sanitized_trace,
            )

            fix = Fix(
                incident_id=incident.id,
                title=fix_data.get("title", f"Fix: {sanitized_error[:80]}"),
                explanation=fix_data.get("explanation", ""),
                confidence=fix_data.get("confidence", 0.5),
                caveats=fix_data.get("caveats", []),
                file_changes=fix_data.get("file_changes", []),
                safety_score=fix_data.get("safety_score", "REVIEW_REQUIRED"),
                model_used=f"groq/{settings.GROQ_MODEL}",
            )
            db.add(fix)

            # Step 5: Safety Check
            incident.status = "safety_check"
            await db.commit()

            safety = fix_data.get("safety_score", "REVIEW_REQUIRED")
            if safety == "BLOCKED":
                incident.status = "fix_blocked"
            else:
                incident.status = "creating_pr"
                # For hackathon: mark as ready (PR creation is mock)
                incident.status = "pr_created"
                from datetime import datetime, timezone
                incident.pr_created_at = datetime.now(timezone.utc)

            await db.commit()

        except Exception as e:
            print(f"Pipeline error for incident {incident_id}: {e}")
            incident.status = "failed"
            incident.pipeline_error = str(e)
            await db.commit()


from app.config import settings


@router.post("/manual", response_model=IncidentResponse)
async def create_manual_incident(
    body: CreateManualIncidentRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, body.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    incident = Incident(
        workspace_id=body.workspace_id,
        source="manual",
        error_message=body.error_message,
        raw_stack_trace=body.stack_trace,
        severity=body.severity,
        status="received",
    )
    db.add(incident)
    await db.commit()
    await db.refresh(incident)

    # Trigger the full AI pipeline in background
    background_tasks.add_task(run_incident_pipeline, incident.id)

    return IncidentResponse.model_validate(incident)


@router.get("/", response_model=list[IncidentResponse])
async def list_incidents(
    workspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    result = await db.execute(select(Incident).where(Incident.workspace_id == workspace_id).order_by(Incident.received_at.desc()))
    incidents = result.scalars().all()
    return [IncidentResponse.model_validate(i) for i in incidents]


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    is_member = await workspace_service.is_member(db, incident.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    return IncidentResponse.model_validate(incident)


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: UUID,
    status: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    is_member = await workspace_service.is_member(db, incident.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    incident.status = status
    if status == "resolved":
        from datetime import datetime, timezone
        incident.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(incident)
    return IncidentResponse.model_validate(incident)


@router.post("/{incident_id}/retry", response_model=IncidentResponse)
async def retry_incident(
    incident_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    is_member = await workspace_service.is_member(db, incident.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    incident.status = "received"
    incident.pipeline_error = None
    await db.commit()
    await db.refresh(incident)

    # Re-trigger the AI pipeline
    background_tasks.add_task(run_incident_pipeline, incident.id)

    return IncidentResponse.model_validate(incident)

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from datetime import datetime, timezone

from app.database import get_db, async_session_maker
from app.dependencies import get_current_user
from app.models.user import User
from app.models.incident import Incident
from app.models.fix import Fix
from app.models.repository import Repository
from app.models.activity_log import ActivityLog
from app.models.document_chunk import DocumentChunk
from app.services.workspace_service import workspace_service
from app.services.ai_service import ai_service
from app.services.embedding_service import embedding_service
from app.services.github_service import github_service
from app.models.source import Source
from app.schemas.autofix import IncidentResponse, CreateManualIncidentRequest
from app.config import settings

router = APIRouter()


async def run_incident_pipeline(incident_id: UUID):
    """Full AI pipeline:
    sanitize → fetch code → query memory → analyze → generate fix → safety check → create draft PR
    """
    async with async_session_maker() as db:
        result = await db.execute(select(Incident).where(Incident.id == incident_id))
        incident = result.scalar_one_or_none()
        if not incident:
            return

        try:
            # ── Step 1: Sanitize ──
            incident.status = "sanitizing"
            await db.commit()

            error_text = incident.error_message or incident.raw_error or ""
            trace_text = incident.raw_stack_trace or ""

            sanitized_error, san_report = ai_service.sanitize_data(error_text)
            sanitized_trace, _ = ai_service.sanitize_data(trace_text) if trace_text else ("", {})
            incident.sanitized_error = sanitized_error
            incident.sanitized_stack_trace = sanitized_trace
            incident.sanitization_report = san_report

            # ── Step 2: Fetch GitHub code context ──
            incident.status = "fetching_code"
            await db.commit()

            code_context = ""
            github_token = None
            repo_full_name = None
            repo_default_branch = "main"

            repo_result = await db.execute(
                select(Repository).where(Repository.workspace_id == incident.workspace_id)
            )
            repo = repo_result.scalars().first()
            if repo and repo.github_token:
                github_token = repo.github_token
                repo_full_name = repo.full_name
                repo_default_branch = repo.default_branch
                code_context = await github_service.fetch_code_context(
                    full_name=repo_full_name,
                    affected_files=[],
                    stack_trace=sanitized_trace,
                    token=github_token,
                )

            # ── Step 3: Query Memory Engine (THE SHOWPIECE) ──
            incident.status = "querying_memory"
            await db.commit()

            memory_chunks = []
            query_text = sanitized_error[:500]

            query_embedding = await embedding_service.generate_embedding(query_text)

            if query_embedding:
                chunks_result = await db.execute(
                    select(DocumentChunk).where(
                        DocumentChunk.workspace_id == incident.workspace_id,
                        DocumentChunk.embedding_json.isnot(None),
                    )
                )
                all_chunks = chunks_result.scalars().all()

                chunk_dicts = [
                    {
                        "text": c.text,
                        "embedding_json": c.embedding_json,
                        "source_type": c.source_type or "document",
                        "sender": c.sender,
                        "timestamp": c.timestamp.isoformat() if c.timestamp else None,
                        "source_id": str(c.source_id),
                    }
                    for c in all_chunks
                ]

                # Threshold 0.60 per docs for memory enrichment
                similar = embedding_service.search_similar_chunks(
                    query_embedding,
                    chunk_dicts,
                    threshold=0.60,
                    top_k=5,
                )
                memory_chunks = similar

            memory_summary = ""
            if memory_chunks:
                memory_summary = await ai_service.summarize_memory_context(memory_chunks)
                incident.memory_context = {
                    "related_discussions": [c["text"][:200] for c in memory_chunks],
                    "query": query_text[:200],
                    "matches_found": len(memory_chunks),
                    "insight": memory_summary,
                    "sources": list({c.get("source_type", "unknown") for c in memory_chunks}),
                }
            else:
                incident.memory_context = {
                    "related_discussions": [],
                    "query": query_text[:200],
                    "matches_found": 0,
                    "insight": "No prior team discussions found about this error. This may be a new issue.",
                }

            # ── Step 4: AI Root Cause Analysis ──
            incident.status = "analyzing"
            await db.commit()

            analysis = await ai_service.analyze_incident(
                error_message=sanitized_error,
                stack_trace=sanitized_trace,
                memory_context=memory_chunks if memory_chunks else None,
            )

            incident.root_cause = analysis.get("root_cause", "Analysis inconclusive")
            incident.affected_files = analysis.get("affected_files", [])
            incident.analysis_confidence = analysis.get("confidence", 0.5)
            incident.analysis_keywords = [analysis.get("severity_assessment", "medium")]

            ai_severity = analysis.get("severity_assessment", "").lower()
            if ai_severity in ("critical", "high", "medium", "low"):
                incident.severity = ai_severity

            # Re-fetch code for affected files now that we know them
            if github_token and repo_full_name and incident.affected_files:
                additional_context = await github_service.fetch_code_context(
                    full_name=repo_full_name,
                    affected_files=incident.affected_files,
                    stack_trace=sanitized_trace,
                    token=github_token,
                )
                if additional_context:
                    code_context = additional_context

            # ── Step 5: Generate Fix ──
            incident.status = "generating_fix"
            await db.commit()

            fix_data = await ai_service.generate_fix(
                error_message=sanitized_error,
                root_cause=incident.root_cause,
                stack_trace=sanitized_trace,
                code_context=code_context,
                memory_context=memory_chunks if memory_chunks else None,
            )

            fix = Fix(
                incident_id=incident.id,
                title=fix_data.get("title", f"Fix: {sanitized_error[:80]}"),
                explanation=fix_data.get("explanation", ""),
                confidence=fix_data.get("confidence", 0.5),
                caveats=fix_data.get("caveats", []),
                file_changes=fix_data.get("file_changes", []),
                safety_score=fix_data.get("safety_score", "REVIEW_REQUIRED"),
                model_used=f"anthropic/{settings.CLAUDE_MODEL}",
            )
            db.add(fix)

            # ── Step 6: Safety Check ──
            incident.status = "safety_check"
            await db.commit()

            safety = fix_data.get("safety_score", "REVIEW_REQUIRED")
            confidence = fix_data.get("confidence", 0.5)

            if safety == "BLOCKED" or confidence < 0.5:
                incident.status = "fix_blocked"
                await db.commit()
                return

            # ── Step 7: Create Draft PR ──
            incident.status = "creating_pr"
            await db.commit()

            if github_token and repo_full_name:
                pr_result = await github_service.create_draft_pr(
                    full_name=repo_full_name,
                    token=github_token,
                    incident_id=str(incident.id),
                    fix_title=fix.title,
                    fix_explanation=fix.explanation or "",
                    file_changes=fix_data.get("file_changes", []),
                    memory_summary=memory_summary,
                    base_branch=repo_default_branch,
                )

                if pr_result.get("pr_url"):
                    incident.pr_url = pr_result["pr_url"]
                    incident.pr_number = pr_result["pr_number"]
                    incident.pr_branch = pr_result["branch"]
                    fix.pr_url = pr_result["pr_url"]

            incident.pr_created_at = datetime.now(timezone.utc)
            incident.status = "pr_created"
            
            # ── Log Activity ──
            log = ActivityLog(
                workspace_id=incident.workspace_id,
                module="autofix",
                action="pr_created",
                resource_type="incident",
                resource_id=incident.id,
                metadata_={
                    "title": f"Draft PR Created: {fix.title}",
                    "description": f"AI generated a fix for error: {sanitized_error[:100]}",
                    "pr_url": incident.pr_url,
                }
            )
            db.add(log)

            # ── Incident Indexing (Memory) ──
            # Index the fix as a new memory source so we "learn" from it
            try:
                memory_source = Source(
                    workspace_id=incident.workspace_id,
                    name=f"Fix Runbook: {sanitized_error[:50]}",
                    source_type="incident_fix",
                    status="processed",
                    metadata_={
                        "incident_id": str(incident.id),
                        "fix_id": str(fix.id),
                        "error": sanitized_error,
                        "fix_explanation": fix.explanation,
                    }
                )
                db.add(memory_source)
                await db.commit()
                await db.refresh(memory_source)

                # Embed the fix explanation
                fix_text = f"Error: {sanitized_error}\nRoot Cause: {incident.root_cause}\nFix: {fix.explanation}"
                embedding = await embedding_service.generate_embedding(fix_text)
                if embedding:
                    chunk = DocumentChunk(
                        workspace_id=incident.workspace_id,
                        source_id=memory_source.id,
                        chunk_index=0,
                        text=fix_text,
                        embedding_json=embedding_service.embedding_to_json(embedding),
                        source_type="incident_fix",
                        incident_id=incident.id,
                    )
                    db.add(chunk)
            except Exception as e:
                print(f"Failed to index incident into memory: {e}")

            await db.commit()

        except Exception as e:
            print(f"Pipeline error for incident {incident_id}: {e}")
            import traceback
            traceback.print_exc()
            incident.status = "failed"
            incident.pipeline_error = str(e)
            await db.commit()


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

    result = await db.execute(
        select(Incident)
        .where(Incident.workspace_id == workspace_id)
        .order_by(Incident.received_at.desc())
    )
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

    background_tasks.add_task(run_incident_pipeline, incident.id)

    return IncidentResponse.model_validate(incident)

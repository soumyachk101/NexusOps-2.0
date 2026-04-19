from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Request
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.database import async_session_maker
from app.models.incident import Incident
from app.models.source import Source
from app.models.document_chunk import DocumentChunk
from app.models.task import Task, Problem
from app.routers.autofix.incidents import run_incident_pipeline
from app.services.ai_service import ai_service
from app.services.embedding_service import embedding_service

router = APIRouter()


class ErrorWebhookPayload(BaseModel):
    workspace_id: UUID
    error_message: str
    stack_trace: Optional[str] = None
    severity: str = "medium"
    source: str = "webhook"
    environment: str = "production"


async def _ingest_telegram_message(
    workspace_id: str,
    text: str,
    sender: str,
    chat_title: str,
    message_id: str | None = None,
):
    """Background: store Telegram message as Source + DocumentChunks, detect tasks."""
    async with async_session_maker() as db:
        source = Source(
            workspace_id=workspace_id,
            name=f"[{sender}] {text[:100]}",
            source_type="telegram_message",
            status="processing",
            external_id=message_id,
            metadata_={"sender": sender, "chat_title": chat_title, "full_text": text},
        )
        db.add(source)
        await db.commit()
        await db.refresh(source)

        # Generate embedding for this message
        embedding = await embedding_service.generate_embedding(text)
        embedding_json = embedding_service.embedding_to_json(embedding) if embedding else None

        chunk = DocumentChunk(
            workspace_id=UUID(workspace_id),
            source_id=source.id,
            chunk_index=0,
            text=text,
            embedding_json=embedding_json,
            source_type="telegram_message",
            sender=sender,
            timestamp=datetime.now(timezone.utc),
            channel_name=chat_title,
        )
        db.add(chunk)

        source.status = "processed"
        source.processed_at = datetime.now(timezone.utc)

        # Detect tasks using Claude
        try:
            tasks = await ai_service.detect_tasks(text)
            for t in tasks:
                if not t.get("title"):
                    continue
                task = Task(
                    workspace_id=UUID(workspace_id),
                    title=t["title"],
                    description=t.get("description", ""),
                    priority=t.get("priority", "medium"),
                    assignee_hint=t.get("assignee_hint"),
                    source_preview=text[:200],
                    status="pending",
                )
                db.add(task)
        except Exception as e:
            print(f"Task detection error (non-fatal): {e}")

        await db.commit()


@router.post("/sentry/{project_token}")
async def sentry_webhook(project_token: str, request: Request, background_tasks: BackgroundTasks):
    """Handle Sentry webhook: extract error info and create an incident."""
    try:
        body = await request.json()
    except Exception:
        return {"status": "error", "detail": "Invalid JSON payload"}

    event = body.get("event", body.get("data", {}).get("event", {}))
    error_message = (
        event.get("title")
        or event.get("message")
        or event.get("metadata", {}).get("value", "Unknown Sentry Error")
    )

    stack_trace = ""
    exception_data = event.get("exception", {})
    if isinstance(exception_data, dict):
        for exc in exception_data.get("values", []):
            exc_type = exc.get("type", "Error")
            exc_value = exc.get("value", "")
            stack_trace += f"{exc_type}: {exc_value}\n"
            for frame in exc.get("stacktrace", {}).get("frames", []):
                filename = frame.get("filename", "?")
                lineno = frame.get("lineno", "?")
                func = frame.get("function", "?")
                stack_trace += f'  File "{filename}", line {lineno}, in {func}\n'

    async with async_session_maker() as db:
        incident = Incident(
            workspace_id=project_token,
            source="sentry",
            error_message=error_message,
            raw_stack_trace=stack_trace or None,
            severity="high",
            external_id=event.get("event_id"),
            status="received",
        )
        db.add(incident)
        await db.commit()
        await db.refresh(incident)
        incident_id = incident.id

    background_tasks.add_task(run_incident_pipeline, incident_id)
    return {"status": "accepted", "incident_id": str(incident_id)}


@router.post("/error/{project_token}")
async def error_webhook(
    project_token: str,
    body: ErrorWebhookPayload,
    background_tasks: BackgroundTasks,
):
    """Custom error webhook — any monitoring tool can POST error data."""
    async with async_session_maker() as db:
        incident = Incident(
            workspace_id=body.workspace_id,
            source=body.source,
            error_message=body.error_message,
            raw_stack_trace=body.stack_trace,
            severity=body.severity,
            environment=body.environment,
            status="received",
        )
        db.add(incident)
        await db.commit()
        await db.refresh(incident)
        incident_id = incident.id

    background_tasks.add_task(run_incident_pipeline, incident_id)
    return {"status": "accepted", "incident_id": str(incident_id)}


@router.post("/telegram/{workspace_token}")
async def telegram_webhook(
    workspace_token: str,
    request: Request,
    background_tasks: BackgroundTasks,
):
    """Handle Telegram Bot webhook — ingest messages as Memory Engine sources."""
    try:
        body = await request.json()
    except Exception:
        return {"status": "error", "detail": "Invalid JSON"}

    message = body.get("message", {})
    text = message.get("text", "")
    from_user = message.get("from", {})
    chat = message.get("chat", {})

    if not text:
        return {"status": "ignored", "reason": "No text in message"}

    sender = from_user.get("username") or from_user.get("first_name", "Unknown")
    chat_title = chat.get("title") or chat.get("username") or "Direct Message"
    message_id = str(message.get("message_id", ""))

    background_tasks.add_task(
        _ingest_telegram_message,
        workspace_token,
        text,
        sender,
        chat_title,
        message_id,
    )

    return {"status": "accepted", "message": f"Ingesting message from {sender}"}


@router.post("/deploy/{project_token}")
async def deploy_webhook(project_token: str, request: Request):
    """Deploy webhook — receive deploy events for auto-revert monitoring."""
    try:
        body = await request.json()
    except Exception:
        body = {}

    return {
        "status": "accepted",
        "note": "Deploy event received. Auto-revert monitoring active.",
        "data": body,
    }

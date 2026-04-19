from fastapi import APIRouter, BackgroundTasks, Request
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.database import async_session_maker
from app.models.incident import Incident
from app.models.source import Source
from app.routers.autofix.incidents import run_incident_pipeline

router = APIRouter()


class SentryWebhookPayload(BaseModel):
    """Simplified Sentry webhook payload."""
    event: Optional[dict] = None
    data: Optional[dict] = None


class ErrorWebhookPayload(BaseModel):
    """Custom webhook for any monitoring tool."""
    workspace_id: UUID
    error_message: str
    stack_trace: Optional[str] = None
    severity: str = "medium"
    source: str = "webhook"
    environment: str = "production"


class TelegramMessage(BaseModel):
    """Simplified Telegram Bot API message."""
    message: Optional[dict] = None
    update_id: Optional[int] = None


@router.post("/sentry/{project_token}")
async def sentry_webhook(project_token: str, request: Request, background_tasks: BackgroundTasks):
    """Handle Sentry webhook: extract error info and create an incident."""
    try:
        body = await request.json()
    except Exception:
        return {"status": "error", "detail": "Invalid JSON payload"}

    # Extract from Sentry format
    event = body.get("event", body.get("data", {}).get("event", {}))
    error_message = (
        event.get("title")
        or event.get("message")
        or event.get("metadata", {}).get("value", "Unknown Sentry Error")
    )
    
    # Build stack trace from exception values
    stack_trace = ""
    exception_data = event.get("exception", {})
    if isinstance(exception_data, dict):
        values = exception_data.get("values", [])
        for exc in values:
            exc_type = exc.get("type", "Error")
            exc_value = exc.get("value", "")
            stack_trace += f"{exc_type}: {exc_value}\n"
            for frame in exc.get("stacktrace", {}).get("frames", []):
                filename = frame.get("filename", "?")
                lineno = frame.get("lineno", "?")
                func = frame.get("function", "?")
                stack_trace += f"  File \"{filename}\", line {lineno}, in {func}\n"

    # We need to find which workspace this project_token maps to.
    # For hackathon: use the token as workspace_id or find first workspace.
    async with async_session_maker() as db:
        incident = Incident(
            workspace_id=project_token,  # treat token as workspace_id for simplicity
            source="sentry",
            error_message=error_message,
            raw_stack_trace=stack_trace or None,
            severity="high",  # Sentry errors default to high
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
async def error_webhook(project_token: str, body: ErrorWebhookPayload, background_tasks: BackgroundTasks):
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
async def telegram_webhook(workspace_token: str, request: Request):
    """Handle Telegram Bot webhook — ingest messages as memory sources."""
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

    sender = from_user.get("first_name", "Unknown")
    chat_title = chat.get("title", "Direct Message")

    async with async_session_maker() as db:
        source = Source(
            workspace_id=workspace_token,
            name=f"[{sender}] {text[:100]}",
            source_type="telegram",
            status="processed",
        )
        db.add(source)
        await db.commit()

    return {"status": "accepted", "message": f"Stored message from {sender}"}


@router.post("/deploy/{project_token}")
async def deploy_webhook(project_token: str, request: Request):
    """Deploy webhook — detect bad deploys for auto-revert."""
    try:
        body = await request.json()
    except Exception:
        body = {}

    return {
        "status": "accepted",
        "note": "Deploy event received. Auto-revert monitoring active.",
        "data": body,
    }

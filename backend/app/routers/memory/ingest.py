import io
import tempfile
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db, async_session_maker
from app.dependencies import get_current_user
from app.models.user import User
from app.models.source import Source
from app.models.document_chunk import DocumentChunk
from app.models.task import Task
from app.services.workspace_service import workspace_service
from app.services.ai_service import ai_service
from app.services.embedding_service import embedding_service
from app.models.activity_log import ActivityLog
from app.schemas.memory import SourceResponse


class IngestDocumentRequest(BaseModel):
    workspace_id: UUID
    name: str
    content: str
    source_type: str = "document"


class TelegramConnectRequest(BaseModel):
    workspace_id: UUID
    bot_token: str
    chat_id: str
    chat_title: str | None = None


router = APIRouter()


async def _chunk_and_embed(
    source_id: UUID,
    workspace_id: UUID,
    text: str,
    source_type: str,
    sender: str | None = None,
    timestamp: datetime | None = None,
    channel_name: str | None = None,
):
    """Background task: chunk text, generate embeddings, store DocumentChunks."""
    chunks = embedding_service.chunk_text(text, chunk_size=2000, overlap=200)

    async with async_session_maker() as db:
        for i, chunk_text in enumerate(chunks):
            embedding = await embedding_service.generate_embedding(chunk_text)
            embedding_json = embedding_service.embedding_to_json(embedding) if embedding else None

            chunk = DocumentChunk(
                workspace_id=workspace_id,
                source_id=source_id,
                chunk_index=i,
                text=chunk_text,
                embedding_json=embedding_json,
                source_type=source_type,
                sender=sender,
                timestamp=timestamp,
                channel_name=channel_name,
            )
            db.add(chunk)

        # Mark source as processed
        result = await db.execute(select(Source).where(Source.id == source_id))
        source = result.scalar_one_or_none()
        if source:
            source.status = "processed"
            source.processed_at = datetime.now(timezone.utc)
            
            # ── Log Activity ──
            log = ActivityLog(
                workspace_id=workspace_id,
                module="memory",
                action="document_ingested" if source_type == "document" else "voice_transcribed",
                resource_type="source",
                resource_id=source_id,
                metadata_={
                    "title": f"Source Processed: {source.name}",
                    "description": f"New {source_type} indexed and ready for Q&A.",
                }
            )
            db.add(log)

        await db.commit()


@router.get("/", response_model=List[SourceResponse])
async def list_sources(
    workspace_id: UUID = Query(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        return []

    stmt = select(Source).where(Source.workspace_id == workspace_id).order_by(Source.created_at.desc())
    result = await db.execute(stmt)
    return [SourceResponse.model_validate(s) for s in result.scalars().all()]


@router.post("/document", response_model=SourceResponse)
async def ingest_document(
    body: IngestDocumentRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Ingest a text document: chunks it + generates embeddings in background."""
    is_member = await workspace_service.is_member(db, body.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    source = Source(
        workspace_id=body.workspace_id,
        name=body.name,
        source_type=body.source_type,
        status="processing",
        file_size_bytes=len(body.content.encode()),
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)

    background_tasks.add_task(
        _chunk_and_embed,
        source.id,
        body.workspace_id,
        body.content,
        body.source_type,
    )

    return SourceResponse.model_validate(source)


@router.post("/document/upload", response_model=SourceResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    workspace_id: UUID = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a PDF or DOCX document: extracts text, chunks, and embeds."""
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    file_bytes = await file.read()
    filename = file.filename or "uploaded_document"
    content_type = file.content_type or ""

    text = ""
    try:
        if "pdf" in content_type or filename.endswith(".pdf"):
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        elif filename.endswith(".docx") or "word" in content_type:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            text = "\n".join(p.text for p in doc.paragraphs)
        else:
            text = file_bytes.decode("utf-8", errors="ignore")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text from file: {e}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="No readable text found in document")

    source = Source(
        workspace_id=workspace_id,
        name=filename,
        source_type="document",
        status="processing",
        file_size_bytes=len(file_bytes),
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)

    background_tasks.add_task(
        _chunk_and_embed,
        source.id,
        workspace_id,
        text,
        "document",
    )

    return SourceResponse.model_validate(source)


@router.post("/telegram/connect")
async def connect_telegram(
    body: TelegramConnectRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register a Telegram chat for ingestion via the NexusOps Telegram bot."""
    is_member = await workspace_service.is_member(db, body.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    from app.config import settings
    from app.models.workspace import Workspace
    from sqlalchemy import select

    # Store Telegram config in workspace metadata
    ws_result = await db.execute(select(Workspace).where(Workspace.id == body.workspace_id))
    workspace = ws_result.scalar_one_or_none()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    webhook_url = f"{settings.FRONTEND_URL.replace(':3001', ':8000')}/webhook/telegram/{body.workspace_id}"

    # Set Telegram webhook via Bot API
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"https://api.telegram.org/bot{body.bot_token}/setWebhook",
                json={"url": webhook_url},
            )
            data = resp.json()
            if not data.get("ok"):
                raise HTTPException(status_code=400, detail=f"Telegram error: {data.get('description')}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not reach Telegram API: {e}")

    return {
        "status": "connected",
        "webhook_url": webhook_url,
        "chat_id": body.chat_id,
        "message": "Telegram bot webhook registered. Messages from this chat will be ingested.",
    }


@router.post("/audio", response_model=SourceResponse)
async def ingest_audio(
    background_tasks: BackgroundTasks,
    workspace_id: UUID = Form(...),
    file: UploadFile = File(...),
    sender: str = Form(default="Unknown"),
    channel: str = Form(default="voice_note"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Ingest an audio file: transcribes with Whisper, then chunks + embeds."""
    from app.config import settings

    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="OpenAI API key not configured (required for Whisper)")

    file_bytes = await file.read()
    filename = file.filename or "audio.ogg"

    # Transcribe with OpenAI Whisper
    from openai import AsyncOpenAI
    try:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        with tempfile.NamedTemporaryFile(suffix=f"_{filename}", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as audio_file:
            transcript = await client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text",
            )

        import os
        os.unlink(tmp_path)
        text = transcript if isinstance(transcript, str) else str(transcript)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Whisper transcription failed: {e}")

    if not text.strip():
        raise HTTPException(status_code=422, detail="Whisper returned empty transcription")

    source = Source(
        workspace_id=workspace_id,
        name=f"[Voice] {filename} by {sender}",
        source_type="voice_note",
        status="processing",
        file_size_bytes=len(file_bytes),
        metadata_={"sender": sender, "channel": channel, "transcription": text},
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)

    background_tasks.add_task(
        _chunk_and_embed,
        source.id,
        workspace_id,
        text,
        "voice_note",
        sender,
        datetime.now(timezone.utc),
        channel,
    )

    return SourceResponse.model_validate(source)

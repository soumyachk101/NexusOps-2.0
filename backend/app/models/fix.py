import uuid
from datetime import datetime

from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey, func, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Fix(Base):
    """AutoFix Engine: AI-generated code fixes."""
    __tablename__ = "fixes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    incident_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text)
    confidence: Mapped[float | None] = mapped_column(Float)
    caveats: Mapped[list | None] = mapped_column(JSON)
    file_changes: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    # [{path, original_code, fixed_code, diff, change_summary}]
    safety_score: Mapped[str | None] = mapped_column(String(30))  # 'SAFE', 'REVIEW_REQUIRED', 'BLOCKED'
    safety_issues: Mapped[dict] = mapped_column(JSON, default=list)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("users.id"))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    review_note: Mapped[str | None] = mapped_column(Text)
    model_used: Mapped[str | None] = mapped_column(String(100))
    prompt_tokens: Mapped[int | None] = mapped_column(Integer)
    completion_tokens: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    incident = relationship("Incident", back_populates="fixes")


class RevertEvent(Base):
    """AutoFix Engine: deployment revert log."""
    __tablename__ = "revert_events"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    incident_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("incidents.id"))
    trigger_type: Mapped[str | None] = mapped_column(String(50))  # 'auto', 'manual'
    reason: Mapped[str | None] = mapped_column(Text)
    bad_deploy_id: Mapped[str | None] = mapped_column(String(255))
    reverted_to: Mapped[str | None] = mapped_column(String(255))
    platform: Mapped[str | None] = mapped_column(String(50))  # 'vercel', 'railway'
    status: Mapped[str | None] = mapped_column(String(30))  # 'success', 'failed'
    error_message: Mapped[str | None] = mapped_column(Text)
    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ErrorRateSnapshot(Base):
    """AutoFix Engine: error rate snapshots for auto-revert threshold."""
    __tablename__ = "error_rate_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    rate: Mapped[float] = mapped_column(Float, nullable=False)
    deploy_id: Mapped[str | None] = mapped_column(String(255))
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


import uuid
from datetime import datetime

from sqlalchemy import String, Text, Float, Integer, DateTime, ForeignKey, func, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Incident(Base):
    """AutoFix Engine: crash incidents from Sentry, webhooks, or manual input."""
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    repository_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, ForeignKey("repositories.id"))

    # Raw data (PII may be present, encrypted at rest)
    raw_error: Mapped[str | None] = mapped_column(Text)
    raw_stack_trace: Mapped[str | None] = mapped_column(Text)

    # Sanitized (safe to display)
    sanitized_error: Mapped[str | None] = mapped_column(Text)
    sanitized_stack_trace: Mapped[str | None] = mapped_column(Text)
    sanitization_report: Mapped[dict] = mapped_column(JSON, default=dict)

    # Classification
    error_type: Mapped[str | None] = mapped_column(String(255))
    error_message: Mapped[str | None] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20), default="medium", index=True)
    environment: Mapped[str] = mapped_column(String(50), default="production")
    branch: Mapped[str] = mapped_column(String(100), default="main")

    # Source
    source: Mapped[str | None] = mapped_column(String(50))  # 'sentry', 'webhook', 'manual'
    external_id: Mapped[str | None] = mapped_column(String(255))

    # Analysis
    root_cause: Mapped[str | None] = mapped_column(Text)
    affected_files: Mapped[dict] = mapped_column(JSON, default=list)
    analysis_confidence: Mapped[float | None] = mapped_column(Float)
    analysis_keywords: Mapped[list | None] = mapped_column(JSON)

    # Memory Engine enrichment
    memory_context: Mapped[dict | None] = mapped_column(JSON)


    # PR info
    pr_url: Mapped[str | None] = mapped_column(Text)
    pr_number: Mapped[int | None] = mapped_column(Integer)
    pr_branch: Mapped[str | None] = mapped_column(String(255))
    pr_merged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Status — using string instead of PostgreSQL enum for easier migrations
    status: Mapped[str] = mapped_column(String(30), default="received", index=True)
    # 'received', 'sanitizing', 'sanitized', 'fetching_code', 'analyzing',
    # 'analyzed', 'querying_memory', 'generating_fix', 'creating_pr',
    # 'pr_created', 'fix_blocked', 'failed', 'resolved', 'dismissed'
    pipeline_error: Mapped[str | None] = mapped_column(Text)

    # Timing (for MTTR)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    pr_created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Meta
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="incidents")
    repository = relationship("Repository", back_populates="incidents")
    fixes = relationship("Fix", back_populates="incident", cascade="all, delete-orphan")

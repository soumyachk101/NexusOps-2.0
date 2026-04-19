import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Note: pgvector column type will be handled via raw SQL in migrations
# since SQLAlchemy pgvector support requires the pgvector Python package at runtime.


class DocumentChunk(Base):
    """Memory Engine: vector knowledge store — semantic chunks with embeddings."""
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)

    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    # embedding: VECTOR(1536) — added in migration, not in ORM (pgvector handles this at DB level)

    # Denormalized for fast retrieval
    sender: Mapped[str | None] = mapped_column(String(255))
    timestamp: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_type: Mapped[str | None] = mapped_column(String(50))
    channel_name: Mapped[str | None] = mapped_column(String(255))

    # Embedding stored as JSON array (TEXT) for SQLite/PostgreSQL compatibility.
    # In production with PostgreSQL + pgvector, migrate to VECTOR(1536) for performance.
    embedding_json: Mapped[str | None] = mapped_column(Text)

    # For incident_fix type: link back to incident
    incident_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    source = relationship("Source", back_populates="chunks")

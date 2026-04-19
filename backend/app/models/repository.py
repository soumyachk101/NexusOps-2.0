import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, BigInteger, DateTime, ForeignKey, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Repository(Base):
    """AutoFix Engine: connected GitHub repositories."""
    __tablename__ = "repositories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    github_repo_id: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)  # 'owner/repo'
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    default_branch: Mapped[str] = mapped_column(String(100), default="main")
    language: Mapped[str | None] = mapped_column(String(50))  # 'python', 'javascript', 'typescript'
    is_private: Mapped[bool] = mapped_column(Boolean, default=False)
    github_token: Mapped[str | None] = mapped_column(String(255))  # stored for PR creation
    webhook_id: Mapped[int | None] = mapped_column(BigInteger)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="repositories")
    incidents = relationship("Incident", back_populates="repository")

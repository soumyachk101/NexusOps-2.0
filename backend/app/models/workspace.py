import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Text, Float, Integer, DateTime, ForeignKey, UniqueConstraint, func, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)


    # Memory Engine config
    telegram_chat_id: Mapped[str | None] = mapped_column(String(100))
    jira_project_key: Mapped[str | None] = mapped_column(String(50))
    jira_base_url: Mapped[str | None] = mapped_column(Text)

    # AutoFix Engine config
    default_branch: Mapped[str] = mapped_column(String(100), default="main")
    auto_revert_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    error_rate_threshold: Mapped[float] = mapped_column(Float, default=3.0)
    revert_window_min: Mapped[int] = mapped_column(Integer, default=5)

    # Notifications
    notify_telegram_chat_id: Mapped[str | None] = mapped_column(String(100))
    notify_on_pr: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_on_revert: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_on_task: Mapped[bool] = mapped_column(Boolean, default=False)

    # Settings
    settings: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="owned_workspaces")
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")
    secrets = relationship("WorkspaceSecret", back_populates="workspace", cascade="all, delete-orphan")
    sources = relationship("Source", back_populates="workspace", cascade="all, delete-orphan")
    repositories = relationship("Repository", back_populates="workspace", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="workspace", cascade="all, delete-orphan")


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"
    __table_args__ = (UniqueConstraint("workspace_id", "user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="member")  # admin, member, viewer
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="memberships")


class WorkspaceSecret(Base):
    __tablename__ = "workspace_secrets"
    __table_args__ = (UniqueConstraint("workspace_id", "key"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)

    key: Mapped[str] = mapped_column(String(100), nullable=False)
    encrypted_value: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workspace = relationship("Workspace", back_populates="secrets")

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Text, DateTime, func, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    github_id: Mapped[str | None] = mapped_column(String(100), unique=True)
    github_username: Mapped[str | None] = mapped_column(String(100))
    github_access_token: Mapped[str | None] = mapped_column(Text)  # encrypted
    hashed_password: Mapped[str | None] = mapped_column(Text)
    provider: Mapped[str] = mapped_column(String(50), default="github")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    owned_workspaces = relationship("Workspace", back_populates="owner", cascade="all, delete-orphan")
    memberships = relationship("WorkspaceMember", back_populates="user", cascade="all, delete-orphan")

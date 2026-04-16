import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Request Models ──

class CreateWorkspaceRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-z0-9-]+$")


class UpdateWorkspaceRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    telegram_chat_id: Optional[str] = None
    jira_project_key: Optional[str] = None
    jira_base_url: Optional[str] = None
    default_branch: Optional[str] = None
    auto_revert_enabled: Optional[bool] = None
    error_rate_threshold: Optional[float] = None
    revert_window_min: Optional[int] = None
    notify_telegram_chat_id: Optional[str] = None
    notify_on_pr: Optional[bool] = None
    notify_on_revert: Optional[bool] = None
    notify_on_task: Optional[bool] = None


class AddMemberRequest(BaseModel):
    email: str = Field(..., max_length=255)
    role: str = Field(default="member", pattern=r"^(admin|member|viewer)$")


# ── Response Models ──

class WorkspaceMemberResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    role: str
    joined_at: datetime
    user_email: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    owner_id: uuid.UUID
    telegram_chat_id: Optional[str] = None
    default_branch: str
    auto_revert_enabled: bool
    notify_on_pr: bool
    notify_on_revert: bool
    created_at: datetime
    updated_at: datetime
    member_count: Optional[int] = None

    class Config:
        from_attributes = True


class WorkspaceListResponse(BaseModel):
    workspaces: List[WorkspaceResponse]
    total: int

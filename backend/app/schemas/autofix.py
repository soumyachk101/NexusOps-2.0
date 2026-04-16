from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class IncidentResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    repository_id: Optional[UUID] = None
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    severity: str
    environment: str
    status: str
    source: Optional[str] = None
    root_cause: Optional[str] = None
    raw_stack_trace: Optional[str] = None
    pr_url: Optional[str] = None
    pr_number: Optional[int] = None
    received_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreateManualIncidentRequest(BaseModel):
    workspace_id: UUID
    error_message: str
    stack_trace: Optional[str] = None
    severity: str = "medium"

class RepositoryResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    name: str
    url: str
    default_branch: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConnectRepoRequest(BaseModel):
    workspace_id: UUID
    repo_url: str
    name: str
    default_branch: str = "main"

class FixResponse(BaseModel):
    id: UUID
    incident_id: UUID
    status: str
    pr_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

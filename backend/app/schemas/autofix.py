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
    sanitized_error: Optional[str] = None
    affected_files: Optional[List[str]] = None
    analysis_confidence: Optional[float] = None
    memory_context: Optional[Dict[str, Any]] = None
    pr_url: Optional[str] = None
    pr_number: Optional[int] = None
    pr_created_at: Optional[datetime] = None
    pipeline_error: Optional[str] = None
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
    full_name: str
    default_branch: str
    language: Optional[str] = None
    is_private: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class ConnectRepoRequest(BaseModel):
    workspace_id: UUID
    full_name: str
    name: str
    default_branch: str = "main"
    github_token: Optional[str] = None

class FixResponse(BaseModel):
    id: UUID
    incident_id: UUID
    title: str
    explanation: Optional[str] = None
    confidence: Optional[float] = None
    caveats: Optional[List[str]] = None
    file_changes: Optional[List[Dict[str, Any]]] = None
    safety_score: Optional[str] = None
    model_used: Optional[str] = None
    pr_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

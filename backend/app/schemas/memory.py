from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class TaskResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assignee_hint: Optional[str] = None
    deadline_hint: Optional[str] = None
    source_preview: Optional[str] = None
    jira_ticket_key: Optional[str] = None
    detected_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProblemResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    title: str
    description: Optional[str] = None
    frequency: int
    severity: str
    status: str
    first_seen: datetime
    last_seen: datetime

    class Config:
        from_attributes = True

class QueryRequest(BaseModel):
    workspace_id: UUID
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    latency_ms: Optional[int] = None

class SourceResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    source_type: str
    name: Optional[str] = None
    status: str
    processed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

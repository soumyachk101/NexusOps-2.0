# Import all models so Alembic and SQLAlchemy can discover them
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceSecret
from app.models.source import Source
from app.models.document_chunk import DocumentChunk
from app.models.task import Task, Decision, Problem, QueryHistory
from app.models.repository import Repository
from app.models.incident import Incident
from app.models.fix import Fix, RevertEvent, ErrorRateSnapshot
from app.models.activity_log import ActivityLog

__all__ = [
    "User",
    "Workspace", "WorkspaceMember", "WorkspaceSecret",
    "Source",
    "DocumentChunk",
    "Task", "Decision", "Problem", "QueryHistory",
    "Repository",
    "Incident",
    "Fix", "RevertEvent", "ErrorRateSnapshot",
    "ActivityLog",
]

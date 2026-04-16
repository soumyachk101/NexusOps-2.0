import asyncio
from uuid import UUID, uuid4
from datetime import datetime, timedelta

from app.database import async_session_maker
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.models.incident import Incident
from app.models.task import Task, Problem
from app.models.repository import Repository


async def seed():
    async with async_session_maker() as session:
        # Create a test user
        user = User(
            id=uuid4(),
            email="test@nexusops.com",
            name="Test User",
            hashed_password="fakehash",
        )
        session.add(user)
        await session.flush()

        # Create a workspace
        workspace = Workspace(
            id=uuid4(),
            name="Test Workspace",
            slug="test-workspace",
            owner_id=user.id
        )
        session.add(workspace)
        await session.flush()

        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=user.id,
            role="admin"
        )
        session.add(member)

        # Add Repository
        repo = Repository(
            id=uuid4(),
            workspace_id=workspace.id,
            name="api-gateway",
            full_name="nexusops/api-gateway",
            default_branch="main"
        )
        session.add(repo)

        # Add Incidents
        inc1 = Incident(
            id=uuid4(),
            workspace_id=workspace.id,
            repository_id=repo.id,
            error_type="TypeError",
            error_message="Cannot read property 'id' of undefined",
            severity="critical",
            environment="production",
            status="analyzing",
            source="sentry",
            raw_stack_trace="TypeError: Cannot read property 'id' of undefined...",
            received_at=datetime.utcnow() - timedelta(minutes=5)
        )
        session.add(inc1)

        # Add Tasks
        task1 = Task(
            id=uuid4(),
            workspace_id=workspace.id,
            title="Migrate Redis to cluster mode",
            description="High priority migration",
            status="detected",
            priority="high",
            source_preview="we really need to move redis to cluster mode...",
            detected_at=datetime.utcnow() - timedelta(minutes=45)
        )
        session.add(task1)

        # Add Problems
        prob1 = Problem(
            id=uuid4(),
            workspace_id=workspace.id,
            title="Memory leak in worker processes",
            description="PMM reported out of memory repeatedly in celery workers",
            severity="high",
            frequency=12,
            status="investigating",
            first_seen=datetime.utcnow() - timedelta(days=2),
            last_seen=datetime.utcnow() - timedelta(hours=1)
        )
        session.add(prob1)

        await session.commit()
        print(f"Seeded DB! Workspace ID: {workspace.id}")
        
if __name__ == "__main__":
    asyncio.run(seed())

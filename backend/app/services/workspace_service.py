import uuid
from typing import Optional, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.workspace import Workspace, WorkspaceMember
from app.models.user import User


class WorkspaceService:
    """Workspace CRUD and member management."""

    async def create_workspace(
        self, db: AsyncSession, name: str, slug: str, owner_id: uuid.UUID
    ) -> Workspace:
        workspace = Workspace(name=name, slug=slug, owner_id=owner_id)
        db.add(workspace)
        await db.flush()

        # Auto-add owner as admin member
        member = WorkspaceMember(
            workspace_id=workspace.id, user_id=owner_id, role="admin"
        )
        db.add(member)
        await db.flush()
        return workspace

    async def get_workspace_by_id(
        self, db: AsyncSession, workspace_id: uuid.UUID
    ) -> Optional[Workspace]:
        result = await db.execute(
            select(Workspace).where(Workspace.id == workspace_id)
        )
        return result.scalar_one_or_none()

    async def get_workspace_by_slug(
        self, db: AsyncSession, slug: str
    ) -> Optional[Workspace]:
        result = await db.execute(
            select(Workspace).where(Workspace.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_user_workspaces(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> List[Workspace]:
        result = await db.execute(
            select(Workspace)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .where(WorkspaceMember.user_id == user_id)
            .order_by(Workspace.created_at.desc())
        )
        return list(result.scalars().all())

    async def update_workspace(
        self, db: AsyncSession, workspace: Workspace, updates: dict
    ) -> Workspace:
        for key, value in updates.items():
            if value is not None and hasattr(workspace, key):
                setattr(workspace, key, value)
        await db.flush()
        return workspace

    async def delete_workspace(self, db: AsyncSession, workspace: Workspace) -> None:
        await db.delete(workspace)
        await db.flush()

    # ── Members ──

    async def add_member(
        self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID, role: str = "member"
    ) -> WorkspaceMember:
        member = WorkspaceMember(
            workspace_id=workspace_id, user_id=user_id, role=role
        )
        db.add(member)
        await db.flush()
        return member

    async def remove_member(
        self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        result = await db.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id,
            )
        )
        member = result.scalar_one_or_none()
        if member:
            await db.delete(member)
            await db.flush()
            return True
        return False

    async def list_members(
        self, db: AsyncSession, workspace_id: uuid.UUID
    ) -> List[WorkspaceMember]:
        result = await db.execute(
            select(WorkspaceMember)
            .options(selectinload(WorkspaceMember.user))
            .where(WorkspaceMember.workspace_id == workspace_id)
        )
        return list(result.scalars().all())

    async def is_member(
        self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        result = await db.execute(
            select(WorkspaceMember).where(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def get_member_role(
        self, db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[str]:
        result = await db.execute(
            select(WorkspaceMember.role).where(
                WorkspaceMember.workspace_id == workspace_id,
                WorkspaceMember.user_id == user_id,
            )
        )
        row = result.scalar_one_or_none()
        return row


workspace_service = WorkspaceService()

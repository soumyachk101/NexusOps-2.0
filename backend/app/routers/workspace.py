from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.workspace import (
    CreateWorkspaceRequest,
    UpdateWorkspaceRequest,
    AddMemberRequest,
    WorkspaceResponse,
    WorkspaceListResponse,
    WorkspaceMemberResponse,
)
from app.services.auth_service import auth_service
from app.services.workspace_service import workspace_service

router = APIRouter()


@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    body: CreateWorkspaceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new workspace. The creating user becomes the owner/admin."""
    existing = await workspace_service.get_workspace_by_slug(db, body.slug)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Workspace slug already taken",
        )
    workspace = await workspace_service.create_workspace(db, body.name, body.slug, current_user.id)
    return WorkspaceResponse.model_validate(workspace)


@router.get("/", response_model=WorkspaceListResponse)
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all workspaces the current user belongs to."""
    workspaces = await workspace_service.list_user_workspaces(db, current_user.id)
    return WorkspaceListResponse(
        workspaces=[WorkspaceResponse.model_validate(ws) for ws in workspaces],
        total=len(workspaces),
    )


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get workspace details. Must be a member."""
    import uuid as _uuid
    try:
        ws_uuid = _uuid.UUID(workspace_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid workspace ID")

    ws = await workspace_service.get_workspace_by_id(db, ws_uuid)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    is_member = await workspace_service.is_member(db, ws.id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    return WorkspaceResponse.model_validate(ws)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
async def update_workspace(
    workspace_id: str,
    body: UpdateWorkspaceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update workspace settings. Admin only."""
    import uuid as _uuid
    ws_uuid = _uuid.UUID(workspace_id)
    ws = await workspace_service.get_workspace_by_id(db, ws_uuid)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    role = await workspace_service.get_member_role(db, ws.id, current_user.id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    updates = body.model_dump(exclude_none=True)
    ws = await workspace_service.update_workspace(db, ws, updates)
    return WorkspaceResponse.model_validate(ws)


@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a workspace. Owner only."""
    import uuid as _uuid
    ws_uuid = _uuid.UUID(workspace_id)
    ws = await workspace_service.get_workspace_by_id(db, ws_uuid)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    if ws.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the owner can delete a workspace")

    await workspace_service.delete_workspace(db, ws)
    return None


# ── Members ──

@router.get("/{workspace_id}/members", response_model=list[WorkspaceMemberResponse])
async def list_members(
    workspace_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List workspace members."""
    import uuid as _uuid
    ws_uuid = _uuid.UUID(workspace_id)

    is_member = await workspace_service.is_member(db, ws_uuid, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member")

    members = await workspace_service.list_members(db, ws_uuid)
    return [
        WorkspaceMemberResponse(
            id=m.id,
            user_id=m.user_id,
            role=m.role,
            joined_at=m.joined_at,
            user_email=m.user.email if m.user else None,
            user_name=m.user.name if m.user else None,
        )
        for m in members
    ]


@router.post("/{workspace_id}/members", response_model=WorkspaceMemberResponse, status_code=201)
async def add_member(
    workspace_id: str,
    body: AddMemberRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a member to the workspace by email. Admin only."""
    import uuid as _uuid
    ws_uuid = _uuid.UUID(workspace_id)

    role = await workspace_service.get_member_role(db, ws_uuid, current_user.id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = await auth_service.get_user_by_email(db, body.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found with that email")

    already_member = await workspace_service.is_member(db, ws_uuid, user.id)
    if already_member:
        raise HTTPException(status_code=409, detail="User is already a member")

    member = await workspace_service.add_member(db, ws_uuid, user.id, body.role)
    return WorkspaceMemberResponse(
        id=member.id,
        user_id=member.user_id,
        role=member.role,
        joined_at=member.joined_at,
        user_email=user.email,
        user_name=user.name,
    )


@router.delete("/{workspace_id}/members/{user_id}", status_code=204)
async def remove_member(
    workspace_id: str,
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a member from the workspace. Admin only."""
    import uuid as _uuid
    ws_uuid = _uuid.UUID(workspace_id)
    target_uuid = _uuid.UUID(user_id)

    role = await workspace_service.get_member_role(db, ws_uuid, current_user.id)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    removed = await workspace_service.remove_member(db, ws_uuid, target_uuid)
    if not removed:
        raise HTTPException(status_code=404, detail="Member not found")
    return None

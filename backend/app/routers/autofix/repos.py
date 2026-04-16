from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.repository import Repository
from app.services.workspace_service import workspace_service
from app.schemas.autofix import RepositoryResponse, ConnectRepoRequest

router = APIRouter()


@router.post("/connect", response_model=RepositoryResponse)
async def connect_repo(
    body: ConnectRepoRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, body.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    repo = Repository(
        workspace_id=body.workspace_id,
        name=body.name,
        url=body.repo_url,
        default_branch=body.default_branch,
    )
    db.add(repo)
    await db.commit()
    await db.refresh(repo)
    return RepositoryResponse.model_validate(repo)


@router.get("/", response_model=list[RepositoryResponse])
async def list_repos(
    workspace_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_member = await workspace_service.is_member(db, workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    result = await db.execute(select(Repository).where(Repository.workspace_id == workspace_id).order_by(Repository.created_at.desc()))
    repos = result.scalars().all()
    return [RepositoryResponse.model_validate(r) for r in repos]


@router.delete("/{repo_id}", status_code=204)
async def delete_repo(
    repo_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Repository).where(Repository.id == repo_id))
    repo = result.scalar_one_or_none()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    is_member = await workspace_service.is_member(db, repo.workspace_id, current_user.id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this workspace")

    await db.delete(repo)
    await db.commit()
    return None

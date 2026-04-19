"""Auto-revert: roll back a bad deploy on Vercel or Railway."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from uuid import UUID

from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


class RevertRequest(BaseModel):
    workspace_id: UUID
    platform: str          # 'vercel' or 'railway'
    deployment_id: str     # ID of the bad deployment to roll back from
    project_id: str        # Vercel project ID or Railway service ID
    token: Optional[str] = None  # override workspace token if needed


class RevertResponse(BaseModel):
    status: str
    platform: str
    message: str
    rollback_deployment_id: Optional[str] = None
    dashboard_url: Optional[str] = None


@router.post("/trigger", response_model=RevertResponse)
async def trigger_revert(
    body: RevertRequest,
    current_user: User = Depends(get_current_user),
):
    """Trigger an auto-revert on Vercel or Railway.

    Vercel: cancels current deployment and promotes the previous successful one.
    Railway: redeploys the last successful deployment snapshot.
    """
    from app.config import settings

    token = body.token or (
        settings.VERCEL_TOKEN if body.platform == "vercel" else settings.RAILWAY_TOKEN
    )

    if not token:
        raise HTTPException(
            status_code=503,
            detail=f"{body.platform.title()} token not configured. Add it in Settings > Integrations.",
        )

    if body.platform == "vercel":
        return await _revert_vercel(token, body.deployment_id, body.project_id)
    elif body.platform == "railway":
        return await _revert_railway(token, body.deployment_id, body.project_id)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown platform: {body.platform}")


async def _revert_vercel(token: str, deployment_id: str, project_id: str) -> RevertResponse:
    """Roll back on Vercel by canceling the bad deployment and finding the previous one."""
    import httpx

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Cancel the bad deployment
        try:
            cancel_resp = await client.patch(
                f"https://api.vercel.com/v13/deployments/{deployment_id}/cancel",
                headers=headers,
            )
            if cancel_resp.status_code not in (200, 204, 409):
                raise HTTPException(
                    status_code=502,
                    detail=f"Vercel cancel failed ({cancel_resp.status_code}): {cancel_resp.text}",
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Vercel API error: {e}")

        # Step 2: Find the last READY deployment before the bad one
        try:
            list_resp = await client.get(
                f"https://api.vercel.com/v6/deployments",
                headers=headers,
                params={
                    "projectId": project_id,
                    "state": "READY",
                    "limit": 5,
                },
            )
            list_resp.raise_for_status()
            deployments = list_resp.json().get("deployments", [])
            previous = next(
                (d for d in deployments if d["uid"] != deployment_id), None
            )
        except Exception as e:
            return RevertResponse(
                status="partial",
                platform="vercel",
                message=f"Bad deployment canceled but could not find previous: {e}",
            )

        if not previous:
            return RevertResponse(
                status="partial",
                platform="vercel",
                message="Bad deployment canceled. No previous READY deployment found to promote.",
            )

        # Step 3: Promote previous deployment (instant rollback)
        try:
            promote_resp = await client.post(
                f"https://api.vercel.com/v10/projects/{project_id}/promote/{previous['uid']}",
                headers=headers,
                json={},
            )
            promote_resp.raise_for_status()
        except Exception as e:
            return RevertResponse(
                status="partial",
                platform="vercel",
                message=f"Bad deployment canceled but promotion failed: {e}",
                rollback_deployment_id=previous["uid"],
            )

        return RevertResponse(
            status="success",
            platform="vercel",
            message=f"Rolled back to deployment {previous['uid'][:8]}.",
            rollback_deployment_id=previous["uid"],
            dashboard_url=f"https://vercel.com/dashboard",
        )


async def _revert_railway(token: str, deployment_id: str, service_id: str) -> RevertResponse:
    """Roll back on Railway by redeploying the previous snapshot."""
    import httpx

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    query = """
    mutation DeploymentRedeploy($id: String!) {
        deploymentRedeploy(id: $id) { id status }
    }
    """

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Get deployments for the service to find the previous one
        list_query = """
        query Deployments($serviceId: String!) {
            deployments(input: { serviceId: $serviceId }, first: 5) {
                edges { node { id status createdAt } }
            }
        }
        """
        try:
            list_resp = await client.post(
                "https://backboard.railway.app/graphql/v2",
                headers=headers,
                json={"query": list_query, "variables": {"serviceId": service_id}},
            )
            list_resp.raise_for_status()
            edges = list_resp.json().get("data", {}).get("deployments", {}).get("edges", [])
            previous = next(
                (e["node"] for e in edges if e["node"]["id"] != deployment_id and e["node"]["status"] == "SUCCESS"),
                None,
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Railway API error: {e}")

        if not previous:
            raise HTTPException(status_code=404, detail="No previous successful Railway deployment found")

        # Redeploy the previous deployment
        try:
            redeploy_resp = await client.post(
                "https://backboard.railway.app/graphql/v2",
                headers=headers,
                json={"query": query, "variables": {"id": previous["id"]}},
            )
            redeploy_resp.raise_for_status()
            data = redeploy_resp.json()
            if data.get("errors"):
                raise HTTPException(status_code=502, detail=str(data["errors"]))
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Railway redeploy error: {e}")

        return RevertResponse(
            status="success",
            platform="railway",
            message=f"Redeploying previous successful deployment {previous['id'][:8]}.",
            rollback_deployment_id=previous["id"],
            dashboard_url="https://railway.app/dashboard",
        )

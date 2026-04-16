from fastapi import APIRouter

router = APIRouter()


@router.post("/sentry/{project_token}")
async def sentry_webhook(project_token: str):
    """Placeholder: Sentry webhook — will be implemented in Phase 6."""
    return {"status": "accepted", "note": "Not yet implemented"}


@router.post("/error/{project_token}")
async def error_webhook(project_token: str):
    """Placeholder: Custom error webhook — will be implemented in Phase 6."""
    return {"status": "accepted", "note": "Not yet implemented"}


@router.post("/telegram/{workspace_token}")
async def telegram_webhook(workspace_token: str):
    """Placeholder: Telegram webhook — will be implemented in Phase 6."""
    return {"status": "accepted", "note": "Not yet implemented"}


@router.post("/deploy/{project_token}")
async def deploy_webhook(project_token: str):
    """Placeholder: Deploy webhook — will be implemented in Phase 6."""
    return {"status": "accepted", "note": "Not yet implemented"}

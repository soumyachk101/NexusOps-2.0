from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, workspace, webhooks
from app.routers.memory import ingest, query, tasks, problems
from app.routers.autofix import repos, incidents, fixes, revert

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="NexusOps API",
    description="AI-powered incident response + team memory platform",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Core Routes ──
app.include_router(auth.router,       prefix="/api/v1/auth",       tags=["auth"])
app.include_router(workspace.router,  prefix="/api/v1/workspace",  tags=["workspace"])
app.include_router(webhooks.router,   prefix="/webhook",           tags=["webhooks"])

# ── Memory Engine ──
app.include_router(ingest.router,    prefix="/api/v1/memory/ingest",   tags=["memory"])
app.include_router(query.router,     prefix="/api/v1/memory",          tags=["memory"])
app.include_router(tasks.router,     prefix="/api/v1/memory/tasks",    tags=["memory"])
app.include_router(problems.router,  prefix="/api/v1/memory/problems", tags=["memory"])

# ── AutoFix Engine ──
app.include_router(repos.router,      prefix="/api/v1/autofix/repos",     tags=["autofix"])
app.include_router(incidents.router,  prefix="/api/v1/autofix/incidents", tags=["autofix"])
app.include_router(fixes.router,      prefix="/api/v1/autofix/fixes",     tags=["autofix"])
app.include_router(revert.router,     prefix="/api/v1/autofix/revert",    tags=["autofix"])


@app.get("/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "app": settings.APP_NAME,
    }


@app.get("/", tags=["system"])
async def root():
    return {
        "message": "NexusOps API is running",
        "docs": "/docs",
        "health": "/health",
    }

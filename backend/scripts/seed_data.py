"""
NexusOps Seed Data — Populates realistic demo data for the dashboard.
Run with: python -m scripts.seed_data (from the backend/ directory)
"""
import asyncio
import uuid
from datetime import datetime, timedelta
import random

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session_maker, init_db
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.models.incident import Incident
from app.models.task import Task, Problem
from app.models.source import Source
from app.models.repository import Repository
from app.models.activity_log import ActivityLog
from app.services.auth_service import auth_service


def hours_ago(h: int) -> datetime:
    return datetime.utcnow() - timedelta(hours=h)


def days_ago(d: int) -> datetime:
    return datetime.utcnow() - timedelta(days=d)


async def seed():
    await init_db()

    async with async_session_maker() as db:
        # ── 1. Create demo user ──
        existing = await auth_service.get_user_by_email(db, "admin@nexusops.ai")
        if existing:
            print("✓ Demo user already exists, skipping user creation")
            user = existing
        else:
            user = User(
                name="NexusOps Admin",
                email="admin@nexusops.ai",
                hashed_password=auth_service.hash_password("password"),
                provider="credentials",
            )
            db.add(user)
            await db.flush()
            print("✓ Created demo user: admin@nexusops.ai / password")

        # ── 2. Create workspace ──
        from sqlalchemy import select
        ws_result = await db.execute(select(Workspace).where(Workspace.owner_id == user.id))
        workspace = ws_result.scalar_one_or_none()

        if workspace:
            print(f"✓ Workspace already exists: {workspace.name}")
        else:
            workspace = Workspace(
                name="NexusOps Engineering",
                slug="nexusops-eng",
                owner_id=user.id,
            )
            db.add(workspace)
            await db.flush()

            member = WorkspaceMember(
                workspace_id=workspace.id,
                user_id=user.id,
                role="admin",
            )
            db.add(member)
            await db.flush()
            print(f"✓ Created workspace: {workspace.name}")

        ws_id = workspace.id

        # ── 3. Seed Repositories ──
        repos_data = [
            {"name": "frontend", "full_name": "nexusops/frontend", "default_branch": "main", "language": "typescript"},
            {"name": "api-server", "full_name": "nexusops/api-server", "default_branch": "main", "language": "python"},
            {"name": "worker-service", "full_name": "nexusops/worker-service", "default_branch": "develop", "language": "python"},
        ]

        repo_check = await db.execute(select(Repository).where(Repository.workspace_id == ws_id))
        if repo_check.scalars().first():
            print("✓ Repositories already seeded")
        else:
            repos = []
            for r in repos_data:
                repo = Repository(workspace_id=ws_id, **r)
                db.add(repo)
                repos.append(repo)
            await db.flush()
            print(f"✓ Seeded {len(repos)} repositories")

        # Fetch repos for incident FK
        repo_result = await db.execute(select(Repository).where(Repository.workspace_id == ws_id))
        repos = list(repo_result.scalars().all())

        # ── 4. Seed Incidents ──
        incident_check = await db.execute(select(Incident).where(Incident.workspace_id == ws_id))
        if incident_check.scalars().first():
            print("✓ Incidents already seeded")
        else:
            incidents_data = [
                {
                    "error_type": "TypeError",
                    "error_message": "Cannot read properties of undefined (reading 'userId')",
                    "severity": "critical",
                    "status": "analyzing",
                    "environment": "production",
                    "source": "sentry",
                    "root_cause": "The auth middleware is not properly checking for null user objects before accessing properties. When an expired JWT is passed, the decoded payload is undefined.",
                    "raw_stack_trace": "TypeError: Cannot read properties of undefined (reading 'userId')\n    at AuthMiddleware.verify (/app/src/middleware/auth.ts:45:23)\n    at Layer.handle (/app/node_modules/express/lib/router/layer.js:95:5)\n    at next (/app/node_modules/express/lib/router/route.js:144:13)",
                    "received_at": hours_ago(2),
                    "repository_id": repos[0].id if repos else None,
                },
                {
                    "error_type": "ConnectionError",
                    "error_message": "Redis connection refused - ECONNREFUSED 127.0.0.1:6379",
                    "severity": "high",
                    "status": "pr_created",
                    "environment": "production",
                    "source": "sentry",
                    "root_cause": "Redis connection pool exhausted due to missing connection retry logic in the worker service.",
                    "pr_url": "https://github.com/nexusops/worker-service/pull/142",
                    "received_at": hours_ago(8),
                    "repository_id": repos[2].id if len(repos) > 2 else None,
                },
                {
                    "error_type": "KeyError",
                    "error_message": "'workspace_id' not found in request context",
                    "severity": "medium",
                    "status": "generating_fix",
                    "environment": "staging",
                    "source": "manual",
                    "received_at": hours_ago(1),
                    "repository_id": repos[1].id if len(repos) > 1 else None,
                },
                {
                    "error_type": "MemoryError",
                    "error_message": "OOMKilled - container exceeded 512Mi memory limit",
                    "severity": "critical",
                    "status": "resolved",
                    "environment": "production",
                    "source": "sentry",
                    "root_cause": "Image processing pipeline loading full images into memory instead of streaming.",
                    "pr_url": "https://github.com/nexusops/api-server/pull/89",
                    "received_at": days_ago(2),
                    "repository_id": repos[1].id if len(repos) > 1 else None,
                },
                {
                    "error_type": "ValidationError",
                    "error_message": "Field 'email' is required but was not provided",
                    "severity": "low",
                    "status": "dismissed",
                    "environment": "staging",
                    "source": "manual",
                    "received_at": days_ago(5),
                },
            ]

            for inc_data in incidents_data:
                incident = Incident(workspace_id=ws_id, **inc_data)
                db.add(incident)
            await db.flush()
            print(f"✓ Seeded {len(incidents_data)} incidents")

        # ── 5. Seed Tasks ──
        task_check = await db.execute(select(Task).where(Task.workspace_id == ws_id))
        if task_check.scalars().first():
            print("✓ Tasks already seeded")
        else:
            tasks_data = [
                {
                    "title": "Migrate auth service to OAuth 2.0 PKCE flow",
                    "description": "Current auth uses implicit grant — need to switch to PKCE for better security",
                    "priority": "high",
                    "status": "detected",
                    "assignee_hint": "Arjun",
                    "source_preview": "We should really switch to PKCE for the mobile app auth flow, the implicit grant is deprecated",
                    "detected_at": hours_ago(6),
                },
                {
                    "title": "Add rate limiting to webhook endpoints",
                    "description": "Webhook endpoints are currently unprotected — could be abused",
                    "priority": "medium",
                    "status": "confirmed",
                    "assignee_hint": "Sarah",
                    "source_preview": "Hey team, noticed our webhook endpoints don't have any rate limiting. Can someone add that?",
                    "detected_at": days_ago(1),
                },
                {
                    "title": "Update API documentation for v2 endpoints",
                    "description": "Several new endpoints added in last sprint aren't documented",
                    "priority": "low",
                    "status": "detected",
                    "assignee_hint": "Unknown",
                    "source_preview": "The new memory query endpoints need to be added to our OpenAPI spec",
                    "detected_at": days_ago(3),
                },
                {
                    "title": "Fix memory leak in image processing worker",
                    "description": "Workers slowly consume more memory over time, need to investigate sharp library usage",
                    "priority": "high",
                    "status": "synced_to_jira",
                    "assignee_hint": "Dev Team",
                    "jira_ticket_key": "NEX-247",
                    "source_preview": "The image worker is consuming 2GB after 24 hours, something is leaking",
                    "detected_at": days_ago(2),
                },
            ]

            for task_data in tasks_data:
                task = Task(workspace_id=ws_id, **task_data)
                db.add(task)
            await db.flush()
            print(f"✓ Seeded {len(tasks_data)} tasks")

        # ── 6. Seed Problems ──
        problem_check = await db.execute(select(Problem).where(Problem.workspace_id == ws_id))
        if problem_check.scalars().first():
            print("✓ Problems already seeded")
        else:
            problems_data = [
                {
                    "title": "Flaky CI/CD pipeline on staging",
                    "description": "The staging deployment pipeline fails ~30% of the time due to timeout issues with the test suite",
                    "severity": "high",
                    "frequency": 12,
                    "status": "active",
                    "first_seen": days_ago(14),
                    "last_seen": hours_ago(3),
                },
                {
                    "title": "Slow database queries in analytics dashboard",
                    "description": "Team members have repeatedly complained about the analytics page taking 10+ seconds to load",
                    "severity": "medium",
                    "frequency": 8,
                    "status": "active",
                    "first_seen": days_ago(21),
                    "last_seen": days_ago(1),
                },
                {
                    "title": "Inconsistent error responses across API modules",
                    "description": "Different API modules return errors in different formats, making frontend error handling complex",
                    "severity": "low",
                    "frequency": 5,
                    "status": "active",
                    "first_seen": days_ago(30),
                    "last_seen": days_ago(4),
                },
            ]

            for prob_data in problems_data:
                problem = Problem(workspace_id=ws_id, **prob_data)
                db.add(problem)
            await db.flush()
            print(f"✓ Seeded {len(problems_data)} problems")

        # ── 7. Seed Sources ──
        source_check = await db.execute(select(Source).where(Source.workspace_id == ws_id))
        if source_check.scalars().first():
            print("✓ Sources already seeded")
        else:
            sources_data = [
                {"source_type": "telegram_message", "name": "NexusOps Dev Chat", "status": "processed"},
                {"source_type": "document", "name": "Architecture Decision Record v2", "status": "processed"},
                {"source_type": "voice_note", "name": "Sprint Retro - Week 14", "status": "processed"},
                {"source_type": "telegram_message", "name": "Incident Response Channel", "status": "syncing"},
                {"source_type": "document", "name": "API Design Guidelines", "status": "processed"},
            ]

            for src_data in sources_data:
                source = Source(workspace_id=ws_id, **src_data)
                db.add(source)
            await db.flush()
            print(f"✓ Seeded {len(sources_data)} sources")

        # ── 8. Seed Activity Logs ──
        log_check = await db.execute(select(ActivityLog).where(ActivityLog.workspace_id == ws_id))
        if log_check.scalars().first():
            print("✓ Activity logs already seeded")
        else:
            logs_data = [
                {
                    "module": "autofix",
                    "action": "pr_created",
                    "metadata": {
                        "title": "Draft PR Created: Fix null pointer in auth middleware",
                        "description": "AI-generated fix for TypeError in production.",
                    },
                    "created_at": hours_ago(2),
                },
                {
                    "module": "memory",
                    "action": "memory_query",
                    "metadata": {
                        "title": "Q&A: Why did we choose Redis?",
                        "description": "Answered using 3 sources in 420ms.",
                    },
                    "created_at": hours_ago(4),
                },
                {
                    "module": "memory",
                    "action": "document_ingested",
                    "metadata": {
                        "title": "Source Processed: API Design Guidelines",
                        "description": "New document indexed and ready for Q&A.",
                    },
                    "created_at": hours_ago(24),
                },
                {
                    "module": "autofix",
                    "action": "incident_received",
                    "metadata": {
                        "title": "New Critical Incident: TypeError",
                        "description": "Received from Sentry production environment.",
                    },
                    "created_at": hours_ago(1),
                },
                {
                    "module": "memory",
                    "action": "task_detected",
                    "metadata": {
                        "title": "Task Detected: Fix memory leak",
                        "description": "Extracted from [Incident Response Channel].",
                    },
                    "created_at": days_ago(1),
                },
            ]

            for log_data in logs_data:
                log = ActivityLog(workspace_id=ws_id, **log_data)
                db.add(log)
            await db.flush()
            print(f"✓ Seeded {len(logs_data)} activity logs")

        await db.commit()
        print("\n🎉 Seed data complete! Login with: admin@nexusops.ai / password")


if __name__ == "__main__":
    asyncio.run(seed())

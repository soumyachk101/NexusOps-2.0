<div align="center">

<br />

```
███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗ ██████╗ ██████╗ ███████╗
████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝██╔═══██╗██╔══██╗██╔════╝
██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║███████╗██║   ██║██████╔╝███████╗
██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║╚════██║██║   ██║██╔═══╝ ╚════██║
██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝███████║╚██████╔╝██║     ███████║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝
```

### The Intelligent Command Center for Modern AIOps

<br />

[![Version](https://img.shields.io/badge/version-2.0.4-6D28D9?style=flat-square)](https://github.com/soumyachk101/NexusOps-2.0/releases)
[![License](https://img.shields.io/badge/license-MIT-0F6E56?style=flat-square)](./LICENSE)
[![Python](https://img.shields.io/badge/python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-05998B?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

<br />

> *Most AI observability tools only see the current stack trace.*  
> *NexusOps sees the last 6 months of your team's institutional memory.*

<br />

[Getting Started](#-getting-started) · [Architecture](#-architecture) · [Features](#-core-features) · [Configuration](#-configuration) · [Contributing](#-contributing)

<br />

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start with Docker](#quick-start-with-docker)
  - [Manual Installation](#manual-installation)
- [Configuration](#-configuration)
- [API Reference](#-api-reference)
- [Security Model](#-security-model)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📌 Overview

**NexusOps 2.0** is a production-grade operational intelligence platform engineered for Site Reliability Engineers who need more than alerts — they need *context*. It is built on the principle that the most critical information during an incident is not what broke, but **what broke before and how the team fixed it**.

NexusOps unifies three pillars into a single cohesive workflow:

| Pillar | What it does |
|---|---|
| **Event Ingestion** | Consumes webhooks from Sentry, custom telemetry pipelines, and Telegram |
| **Memory Enrichment** | Augments each incident with semantically similar past events and runbooks via pgvector |
| **AI Remediation** | Generates root cause analysis and a draft code fix via Groq LLaMA 3.3 in < 500ms |

No auto-merges. No silent deployments. Every fix is a Draft Pull Request reviewed by a human engineer.

---

## 🏗️ Architecture

NexusOps is designed as a distributed, event-driven system with strict separation between the ingestion layer, the intelligence layer, and the resolution layer.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INGESTION MESH                              │
│                                                                     │
│   ┌───────────────┐   ┌───────────────┐   ┌──────────────────┐    │
│   │ Sentry        │   │ Telegram      │   │ Custom Telemetry │    │
│   │ Webhooks      │   │ Bot API       │   │ (HTTP / gRPC)    │    │
│   └───────┬───────┘   └───────┬───────┘   └────────┬─────────┘    │
└───────────┼───────────────────┼────────────────────┼──────────────┘
            └───────────────────▼────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                      INTELLIGENCE LAYER                             │
│                                                                     │
│   ┌────────────────────────────────────────────────────────────┐   │
│   │                    FastAPI Gateway                         │   │
│   └──────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
│   ┌──────────────────────────▼─────────────────────────────────┐   │
│   │               PII & Secret Sanitizer                       │   │
│   │         regex-based  ·  runs locally  ·  zero-trust        │   │
│   └──────────────────────────┬─────────────────────────────────┘   │
│                              │                                      │
│   ┌──────────────────────────▼─────────────────────────────────┐   │
│   │              Memory Enrichment Engine                      │   │
│   │    pgvector similarity search  ·  cosine distance          │   │
│   └──────┬──────────────────────────────────────────┬──────────┘   │
│          │                                          │              │
│   ┌──────▼──────┐                         ┌────────▼──────────┐   │
│   │ PostgreSQL  │                         │  Pipeline          │   │
│   │ + pgvector  │                         │  Controller        │   │
│   └─────────────┘                         └────────┬──────────┘   │
│                                                    │              │
└────────────────────────────────────────────────────┼──────────────┘
                                                     │
┌────────────────────────────────────────────────────▼──────────────┐
│                       RESOLUTION LAYER                             │
│                                                                    │
│   ┌─────────────────┐   ┌──────────────────┐   ┌──────────────┐  │
│   │ Groq LLaMA 3.3  │──▶│  AutoFix Code    │──▶│  GitHub      │  │
│   │ 70B Versatile   │   │  Generator       │   │  Draft PR    │  │
│   └─────────────────┘   └──────────────────┘   └──────────────┘  │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  Cinematic Dashboard  ·  Next.js 14  ·  Framer Motion    │    │
│   └──────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Sentry Webhook
      │
      ▼
[1] Gateway receives event → validates schema → assigns incident ID
      │
      ▼
[2] Sanitizer strips PII (API keys, IPs, emails) — locally, before any LLM call
      │
      ▼
[3] Memory Engine queries pgvector for top-k similar past incidents
      │   Returns: past discussions, runbooks, resolved fixes
      │
      ▼
[4] Enriched payload → Celery task queue (Redis broker)
      │
      ▼
[5] Groq LLaMA 3.3 inference → root cause + suggested fix
      │
      ▼
[6] Fix staged as GitHub Draft PR with memory citations in PR body
      │
      ▼
[7] Dashboard update + Telegram notification with confidence score
```

---

## ⚡ Core Features

### Memory Engine

The Memory Engine is the primary differentiator of NexusOps. Built on `pgvector` with cosine similarity search, it maintains a continuously updated knowledge base drawn from:

- **Incident History** — Every resolved incident is vectorized and stored. When a new incident arrives, the top-k most semantically similar past events are surfaced.
- **Team Discussions** — Telegram and Slack threads are indexed automatically, capturing informal tribal knowledge that never makes it into runbooks.
- **Runbooks & Internal Documentation** — Structured documentation ingested and chunked for retrieval.

> **Why this matters:** An SRE triaging a `NullPointerException` in a payment service at 2 AM needs to know that the same error surfaced 3 months ago because of a race condition in the order fulfillment pipeline — and that the fix was a 2-line database transaction scope change. NexusOps surfaces this in the incident brief automatically.

### AutoFix Engine

Powered by **Groq's LLaMA 3.3 70B Versatile**, the AutoFix Engine provides sub-500ms inference with:

| Property | Detail |
|---|---|
| **Inference Latency** | < 500ms (Groq's hardware-accelerated inference) |
| **Input** | Sanitized stack trace + enriched memory context |
| **Output** | Root cause analysis + line-level code fix + confidence score |
| **Confidence Tiers** | `SAFE` · `REVIEW` · `BLOCKED` |
| **Output Artifact** | GitHub Draft Pull Request with cited context |

### Cinematic Dashboard

A real-time incident command interface built with Next.js 14 App Router, Framer Motion, and Shadcn/UI. Designed for high-stress, low-latency decision making — not for demo slides.

### Security-First by Design

NexusOps treats data privacy as a first-class architectural constraint, not an afterthought:

- **Local PII Sanitization** — All secrets, API keys, email addresses, and IP addresses are stripped at the ingestion gateway using a deterministic regex engine before any data leaves the system boundary.
- **Cryptographic Audit Logs** — Every AI inference action is hashed and logged with full attribution to a specific incident ID and user.
- **Draft-Only PRs** — NexusOps is architecturally incapable of merging code. It creates Draft Pull Requests only. Merge authority belongs exclusively to the human engineer.

---

## 🛠️ Tech Stack

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Python 3.12 | Core application runtime |
| Framework | FastAPI 0.111 | Async HTTP gateway, OpenAPI spec generation |
| ORM | SQLAlchemy 2.x (Async) | Database abstraction with async session management |
| Task Queue | Celery + Redis | Async incident processing pipeline |
| Vector Search | pgvector (PostgreSQL) | Semantic similarity for memory enrichment |
| AI Inference | Groq API — LLaMA 3.3 70B | Sub-500ms root cause analysis |
| Validation | Pydantic v2 | Request/response schema enforcement |

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR/RSC, routing, API layer |
| Styling | Tailwind CSS + Shadcn/UI | Design system, accessible components |
| Animation | Framer Motion | Incident timeline, dashboard transitions |
| State | Zustand | Global incident state management |
| Data Fetching | TanStack Query | Server state, real-time polling |

### Infrastructure

| Component | Technology |
|---|---|
| Container Orchestration | Docker Compose |
| Primary Database | PostgreSQL 16 + pgvector |
| Cache & Broker | Redis 7 (Upstash-compatible) |
| Version Control Integration | GitHub REST API v3 |
| Monitoring Ingestion | Sentry Webhook API |

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed and configured on your development machine:

- **Node.js** `>= 20.x` — [Download](https://nodejs.org)
- **Python** `>= 3.12` — [Download](https://python.org)
- **Docker** `>= 24.x` and **Docker Compose** `>= 2.x` — [Download](https://docker.com)
- **Git** — [Download](https://git-scm.com)

You will also need the following API credentials:

- `GROQ_API_KEY` — [Obtain from Groq Console](https://console.groq.com)
- `GITHUB_TOKEN` — Personal Access Token with `repo` scope
- `SENTRY_WEBHOOK_SECRET` — From your Sentry project's webhook settings

---

### Quick Start with Docker

The fastest path to a running instance. Spins up the full stack — PostgreSQL, Redis, backend, and frontend — with a single command.

```bash
# 1. Clone the repository
git clone https://github.com/soumyachk101/NexusOps-2.0.git
cd NexusOps-2.0

# 2. Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 3. Populate your credentials in backend/.env
#    (GROQ_API_KEY, DATABASE_URL, GITHUB_TOKEN, SENTRY_WEBHOOK_SECRET)

# 4. Build and start all services
docker-compose up --build

# 5. Run database migrations (first-time setup)
docker-compose exec backend alembic upgrade head

# 6. Seed vector extensions
docker-compose exec backend python -m scripts.seed_pgvector
```

The application will be available at:

| Service | URL |
|---|---|
| Frontend Dashboard | `http://localhost:3000` |
| Backend API | `http://localhost:8000` |
| API Documentation | `http://localhost:8000/docs` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

---

### Manual Installation

Use this path for development or if you prefer managing processes individually.

**1. Clone and configure**

```bash
git clone https://github.com/soumyachk101/NexusOps-2.0.git
cd NexusOps-2.0
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**2. Start infrastructure services**

```bash
# Start PostgreSQL and Redis via Docker (or use local installations)
docker-compose up postgres redis -d
```

**3. Backend setup**

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Linux / macOS
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**4. Frontend setup**

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

**5. Start the Celery worker** (separate terminal)

```bash
cd backend
source venv/bin/activate
celery -A app.worker worker --loglevel=info
```

---

## ⚙️ Configuration

All configuration is managed via environment variables. Never commit `.env` files to version control.

### `backend/.env`

```env
# ── Application ─────────────────────────────────────────────────────
APP_ENV=development
SECRET_KEY=your-secret-key-minimum-32-characters
DEBUG=true

# ── Database ─────────────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://nexusops:password@localhost:5432/nexusops
PGVECTOR_DIMENSIONS=1536

# ── Redis / Celery ────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# ── AI Inference ─────────────────────────────────────────────────────
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=2048
MEMORY_TOP_K=5                     # Number of similar incidents to retrieve

# ── Integrations ─────────────────────────────────────────────────────
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-org-or-username
GITHUB_REPO=your-target-repository

SENTRY_WEBHOOK_SECRET=your-sentry-webhook-secret
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# ── Sanitizer ────────────────────────────────────────────────────────
SANITIZER_ENABLED=true
SANITIZER_LOG_REDACTIONS=true
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

---

## 📡 API Reference

Full interactive documentation is available at `/docs` (Swagger UI) and `/redoc` (ReDoc) when the backend is running.

### Key Endpoints

```
POST   /api/v1/webhooks/sentry          Receive Sentry error events
POST   /api/v1/webhooks/custom          Receive custom telemetry payloads

GET    /api/v1/incidents                List all incidents (paginated)
GET    /api/v1/incidents/{id}           Get incident detail with memory context
PATCH  /api/v1/incidents/{id}/resolve   Mark incident as resolved

POST   /api/v1/memory/ingest            Ingest a document into the memory store
GET    /api/v1/memory/search            Semantic search across the memory store

GET    /api/v1/health                   Health check (liveness + readiness)
```

---

## 🔒 Security Model

```
┌────────────────────────────────────────────────────────┐
│                  Trust Boundary                        │
│                                                        │
│  External Input                                        │
│       │                                                │
│       ▼                                                │
│  ┌──────────────────────────────────────────────┐     │
│  │  PII Sanitizer  (runs locally, pre-LLM call) │     │
│  │  ─────────────────────────────────────────── │     │
│  │  Strips: API keys, JWT tokens, emails,        │     │
│  │          IP addresses, credit card numbers,   │     │
│  │          AWS/GCP secrets, private keys        │     │
│  └───────────────────────┬──────────────────────┘     │
│                          │  Sanitized payload only     │
│                          ▼                             │
│  ┌──────────────────────────────────────────────┐     │
│  │  Groq API  (external — sanitized data only)  │     │
│  └───────────────────────┬──────────────────────┘     │
│                          │                             │
│                          ▼                             │
│  ┌──────────────────────────────────────────────┐     │
│  │  Audit Logger  (cryptographic hash + actor)  │     │
│  └──────────────────────────────────────────────┘     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

- **HMAC Verification** — All incoming webhooks are verified against a shared secret before processing.
- **JWT Authentication** — Dashboard access requires a signed JWT with configurable expiry.
- **Rate Limiting** — FastAPI middleware enforces per-IP and per-endpoint rate limits.
- **Draft PRs Only** — The GitHub integration is scoped to `pull_request:write`. It cannot push directly to any branch.

---

## 📁 Project Structure

```
nexusops-2.0/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── incidents.py
│   │   │   │   ├── memory.py
│   │   │   │   └── webhooks.py
│   │   │   └── deps.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── logging.py
│   │   ├── models/
│   │   │   ├── incident.py
│   │   │   └── memory_chunk.py
│   │   ├── services/
│   │   │   ├── memory_engine.py    # pgvector similarity search
│   │   │   ├── sanitizer.py        # PII stripping
│   │   │   ├── groq_client.py      # LLM inference
│   │   │   ├── github_client.py    # Draft PR creation
│   │   │   └── telegram_client.py  # Notifications
│   │   ├── worker/
│   │   │   ├── celery_app.py
│   │   │   └── tasks/
│   │   │       ├── process_incident.py
│   │   │       └── ingest_memory.py
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── incidents/
│   │   │   │   └── memory/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn base components
│   │   │   ├── incident-card.tsx
│   │   │   ├── memory-panel.tsx
│   │   │   └── confidence-badge.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts
│   │   └── store/
│   │       └── incidents.ts        # Zustand store
│   ├── .env.local.example
│   └── package.json
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml
└── README.md
```

---

## 🗺️ Roadmap

- [x] Sentry webhook ingestion
- [x] pgvector memory enrichment
- [x] Groq LLaMA 3.3 inference
- [x] GitHub Draft PR generation
- [x] Telegram notifications
- [x] Confidence scoring (SAFE / REVIEW / BLOCKED)
- [ ] Slack ingestion adapter
- [ ] OpenTelemetry trace integration
- [ ] Multi-repository support
- [ ] RBAC for team-level access control
- [ ] Memory decay and re-ranking policies
- [ ] Exportable incident post-mortems (PDF)
- [ ] Self-hosted LLM option via Ollama

---

## 🤝 Contributing

Contributions are welcome. Please follow the process below to keep the codebase clean and the review cycle fast.

**1. Fork and branch**

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-description
```

**2. Commit convention**

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

```
feat: add slack ingestion adapter
fix: resolve race condition in memory engine query
docs: update API reference for /incidents endpoint
chore: bump groq-sdk to 0.9.0
```

**3. Before opening a PR**

```bash
# Backend
cd backend && pytest --cov=app tests/

# Frontend
cd frontend && npm run lint && npm run type-check
```

**4. Open a Pull Request** against `main` with a clear description of what changed and why.

---

## 📄 License

Distributed under the [MIT License](./LICENSE).

---

<div align="center">

Built by **[Soumya Chakraborty](https://chksoumya.in)** · [@soumyachk101](https://github.com/soumyachk101)

*If this project was useful to you, consider leaving a ⭐*

</div>

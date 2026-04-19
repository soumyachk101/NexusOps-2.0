<div align="center">

# 🚀 NexusOps 2.0
### **The Intelligent Command Center for Modern AIOps**

[![NexusOps](https://img.shields.io/badge/NexusOps-v2.0.4-6D28D9?style=for-the-badge&logo=shield)](https://github.com/soumyachk101/NexusOps-2.0)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-05998B?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![AI](https://img.shields.io/badge/Inference-Groq%20LLaMA%203.3-f3d122?style=for-the-badge)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](LICENSE)

---

![NexusOps Dashboard Mockup](/Users/soumyachakraborty/.gemini/antigravity/brain/1f8f48f3-0dae-4e7f-a999-f88902ffa43d/nexusops_dashboard_mockup_1776588378759.png)

**NexusOps 2.0** is an enterprise-grade, high-fidelity operational intelligence platform. It transforms production noise into actionable resolution by merging **Real-time Event Ingestion**, **Historical Team Memory**, and **Sub-second AI Remediation**.

[Explore Dashboard](https://github.com/soumyachk101/NexusOps-2.0) • [View Architecture](#-architectural-deep-dive) • [Setup Guide](#-getting-started)

</div>

---

## 📑 Table of Contents
- [✨ Core Philosophy](#-core-philosophy)
- [🏗️ Architectural Deep Dive](#️-architectural-deep-dive)
- [🧠 The Intelligence Engines](#-the-intelligence-engines)
- [🌊 Incident Lifecycle](#-incident-lifecycle)
- [🛡️ Engineering Standards](#️-engineering-standards)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🗺️ Roadmap](#️-roadmap)

---

## ✨ Core Philosophy
NexusOps is built on the principle of **Context-Aware Remediation**. Unlike generic AI assistants, NexusOps understands that every production environment has a unique history. By indexing team discussions, documentation, and past fixes, it provides "Senior SRE" level insights in milliseconds.

---

## 🏗️ Architectural Deep Dive

NexusOps is engineered as a distributed, event-driven ecosystem. It features a stateless API layer, an asynchronous task pipeline, and a vectorized memory fabric.

```mermaid
graph TD
    %% Source Ingestion
    subgraph IngestionMesh ["Ingestion Layer"]
        Sentry[Sentry Webhooks]
        Telegram[Telegram Bot API]
        Custom[Custom Telemetry]
    end

    %% Core Processing
    subgraph Core ["NexusOps Intelligence Cluster"]
        API[API Gateway / FastAPI]
        Sanitizer[PII & Secret Sanitizer]
        MemoryEngine[Memory Enrichment Engine]
        Controller[Pipeline Controller]
    end

    %% Data Stores
    subgraph Storage ["State & Vector Fabric"]
        DB[(PostgreSQL + pgvector)]
        Redis[(Redis Cache & Task Queue)]
    end

    %% AI & Remediation
    subgraph AI ["The Resolution Engine"]
        Groq[Groq LLaMA 3.3 Inference]
        FixGen[AutoFix Code Generator]
        PR[GitHub Draft Pull Requests]
    end

    %% Connections
    IngestionMesh -->|Webhook| API
    API -->|Sanitized Trace| Sanitizer
    Sanitizer -->|Context Request| MemoryEngine
    MemoryEngine <-->|Vector Search| DB
    MemoryEngine -->|Enriched Payload| Controller
    Controller <-->|Async Tasks| Redis
    Controller -->|LLM Inference| Groq
    Groq -->|Resolution| FixGen
    FixGen -->|Git Action| PR

    %% Styling
    classDef cluster fill:#111,stroke:#333,stroke-width:1px,color:#fff;
    class IngestionMesh,Core,Storage,AI cluster;
    
    style IngestionMesh stroke:#6D28D9,stroke-width:2px
    style Core stroke:#05998B,stroke-width:2px
    style Storage stroke:#3b82f6,stroke-width:2px
    style AI stroke:#f3d122,stroke-width:2px
```

---

## 🧠 The Intelligence Engines

### 1. The Memory Engine (Contextual Awareness)
Standard AIOps tools lack memory. NexusOps solves this using a **RAG (Retrieval-Augmented Generation)** pipeline over a vector database:
- **Telegram/Slack Siphoning**: Ingests team discussions into the knowledge graph.
- **Runbook Mapping**: Automatically links active incidents to internal documentation.
- **Historical Deduplication**: Identifies if a similar incident was resolved previously.

### 2. The AutoFix Pipeline (Sub-Second Remediation)
Leveraging **Groq's LLaMA 3.3**, we achieve near-instantaneous root cause analysis:
- **Trace Decomposition**: Breaks down complex stack traces into logical components.
- **Confidence Scoring**: Each AI-generated fix includes a safety assessment (SAFE, REVIEW, BLOCKED).
- **PR Automation**: Stages Draft PRs with full technical context for the SRE to review.

---

## 🌊 Incident Lifecycle

The following sequence illustrates the automated handling of a production fault:

```mermaid
sequenceDiagram
    participant S as Sentry / Production
    participant N as NexusOps Core
    participant M as Memory Engine
    participant G as Groq AI
    participant H as GitHub / SRE

    S->>N: Trigger Webhook (Stack Trace)
    Note over N: Local Sanitization (Regex/LLM)
    N->>M: Query Context (Recent Fixes/Chat)
    M-->>N: Returns Vector Matches
    N->>G: Analyze Incident (Sanitized + Context)
    G-->>N: Root Cause + Code Fix
    N->>H: Create Draft PR + Notify Dashboard
    H->>H: Human SRE Review & Merge
```

---

## 🛡️ Engineering Standards

- **Security-First**: Regex-based sanitization strips PII and credentials at the ingestion gateway.
- **Async Reliability**: Heavy AI processing and git operations are handled by Celery workers to keep the UI snappy.
- **High Performance**: PostgreSQL + `pgvector` ensures semantic search remains performant at scale.
- **Human-in-the-Loop**: The platform never pushes code without explicit SRE approval.

---

## 💻 Tech Stack

- **Frontend**: Next.js 14 (App Router), Framer Motion, Tailwind CSS, Shadcn/UI.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy (Async), Celery/Redis.
- **Storage**: PostgreSQL with `pgvector` for semantic search.
- **AI**: Groq API (LLaMA 3.3 70B Versatile).

---

## 🚀 Getting Started

### Quick Start (Docker)
The fastest way to experience NexusOps 2.0 is via Docker Compose:

```bash
docker-compose up --build
```

### Manual Installation

**1. Clone & Environment**
```bash
git clone https://github.com/soumyachk101/NexusOps-2.0.git
cd NexusOps-2.0
cp backend/.env.example backend/.env
cp frontend/.env.local frontend/.env
```

**2. Backend Setup**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 🗺️ Roadmap

- [x] **v2.0**: Core Memory Engine & AutoFix Pipeline.
- [x] **v2.1**: GitHub PR Automation & Sentry Webhooks.
- [ ] **v2.2**: Slack/Teams Integration (Phase 4).
- [ ] **v2.3**: Multi-cloud Auto-Revert (Phase 5).
- [ ] **v2.4**: Advanced Analytics & MTTR Tracking.

---

## 📄 License & Attribution

Distributed under the MIT License. Built with ❤️ for the Next Generation of SREs by **Soumya Chakraborty**.

[Showcase Dashboard](https://github.com/soumyachk101/NexusOps-2.0) | [Documentation](https://github.com/soumyachk101/NexusOps-2.0)
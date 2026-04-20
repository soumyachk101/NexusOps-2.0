# 📖 NexusOps 2.0: Complete Documentation

Welcome to the **NexusOps 2.0** documentation. This guide will walk you through the process of setting up your command center, connecting your infrastructure, and leveraging the AI-powered operational intelligence platform.

---

## 🛠️ Phase 1: Local Environment Setup

NexusOps 2.0 consists of a **Next.js frontend** and a **FastAPI backend**. Both need to be running and properly configured to communicate.

### 1. Backend Setup (Python)
1.  **Navigate to backend**: `cd backend`
2.  **Create Virtual Environment**: `python -m venv venv`
3.  **Activate venv**:
    *   Mac/Linux: `source venv/bin/activate`
    *   Windows: `venv\Scripts\activate`
4.  **Install Dependencies**: `pip install -r requirements.txt`
5.  **Configure `.env`**: Copy `.env.example` to `.env` and fill in the required keys (see **Phase 2**).
6.  **Run Server**: `uvicorn app.main:app --reload` (Runs on `http://localhost:8000`)

### 2. Frontend Setup (Next.js)
1.  **Navigate to frontend**: `cd frontend`
2.  **Install Dependencies**: `npm install`
3.  **Configure `.env.local`**: Ensure `NEXT_PUBLIC_API_URL` points to your backend (`http://localhost:8000`).
4.  **Run Dev Server**: `npm run dev` (Runs on `http://localhost:3000`)

---

## 🔌 Phase 2: Connecting Everything Properly

To unlock the full power of NexusOps, you need to connect your external services.

### 1. AI Intelligence (Groq) — **REQUIRED**
The **AutoFix** and **Memory Engine** are powered by Groq's sub-second inference.
- **Action**: Get an API Key from [console.groq.com](https://console.groq.com/).
- **Config**: Add `GROQ_API_KEY=your_key` to `backend/.env`.

### 2. GitHub Integration — **REQUIRED for AutoFix**
NexusOps creates **Draft Pull Requests** and fetches code context via GitHub.
- **Action**: Create a **Personal Access Token (PAT)** with `repo` scope.
- **Connection**: In the NexusOps UI, navigate to **AutoFix > Connect Repo** and provide your PAT and the repo name (e.g., `user/repo`).

### 3. Monitoring (Sentry/Webhooks)
NexusOps listens for errors to trigger the AutoFix pipeline.
- **Sentry**: Set up a Webhook in Sentry pointing to `http://your-backend/webhook/sentry/{workspace_id}`.
- **Custom**: Use the generic endpoint `POST /webhook/error/{workspace_id}` to push errors from any tool.

### 4. Team Memory (Telegram)
NexusOps can "listen" to your team's discussions to provide context during incidents.
- **Action**: Create a bot via `@BotFather`.
- **Connection**: In the **Memory > Sources** page, provide the `bot_token` and `chat_id`. NexusOps will automatically register a webhook.

---

## 🚀 Phase 3: How to Use the Platform

### 1. The AutoFix Lifecycle
1.  **Detection**: An incident arrives via Sentry or a custom webhook.
2.  **Analysis**: The AI automatically breaks down the stack trace and root cause.
3.  **Context Search**: The AI queries the **Memory Engine** to see if this has happened before.
4.  **Fix Generation**: A code fix is generated with a **Safety Score** (SAFE, REVIEW, or BLOCKED).
5.  **Remediation**: Click **"Approve & Create PR"** to stage a draft PR on GitHub.

### 2. Using the Memory Engine
The Memory Engine is your team's collective brain.
- **Ask AI**: Use the **Memory Ask** page to ask questions like *"Why did we stop using the legacy auth service?"* or *"Who is the expert on the payment gateway?"*
-   **Knowledge Ingestion**: Upload PDFs, DOCX files, or connect Telegram to feed the AI context.
-   **Task Detection**: The AI automatically extracts action items from ingested chat messages and lists them in **Memory > Tasks**.

### 3. Operational Dashboard
-   **Unified Stats**: Monitor your MTTR (Mean Time to Recovery) and total incidents handled.
-   **Activity Feed**: A real-time stream of every ingestion, AI analysis, and fix event.
-   **System Health**: Real-time visualization of your backend's connectivity to Groq, GitHub, and Redis.

---

## 🔍 Troubleshooting Connections

| Issue | Solution |
| :--- | :--- |
| **Frontend can't see Backend** | Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local` and ensure CORS origins in `backend/.env` include your frontend URL. |
| **AI is slow or failing** | Verify your `GROQ_API_KEY` is valid and you haven't hit rate limits. |
| **Can't create PRs** | Ensure the GitHub PAT has sufficient permissions and the repo name is correct (`owner/name`). |
| **Messages not ingesting** | Ensure your Telegram bot is a member of the group and the `chat_id` is correct. |

---

> [!TIP]
> Always use the **"Analyze Incident"** feature first. It merges your team's history with the current error to prevent repetitive mistakes!

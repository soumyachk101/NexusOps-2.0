import json
import re
import httpx
from app.config import settings


class AIService:
    """AI service powered by Groq (fast LLM inference).

    Provides:
    - Memory Q&A with citations
    - Incident root cause analysis
    - AI fix generation
    - Data sanitization (strip PII/secrets)
    - Memory context search for incidents (Integration Layer)
    """

    GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

    @staticmethod
    def _headers() -> dict:
        return {
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

    @staticmethod
    async def _call_groq(messages: list, temperature: float = 0.3, max_tokens: int = 2048) -> str:
        """Core Groq API call."""
        if not settings.GROQ_API_KEY:
            return "AI service not configured. Add GROQ_API_KEY to your .env file."

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    AIService.GROQ_API_URL,
                    headers=AIService._headers(),
                    json={
                        "model": settings.GROQ_MODEL,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except httpx.HTTPStatusError as e:
                print(f"Groq API error ({e.response.status_code}): {e.response.text}")
                return f"AI service error: {e.response.status_code}"
            except Exception as e:
                print(f"Groq connection error: {e}")
                return f"Error connecting to Groq: {str(e)}"

    # ── Memory Q&A ──

    @staticmethod
    async def memory_qa(question: str, context_chunks: list[str] | None = None) -> dict:
        """Answer a question using ingested memory context.
        
        Returns: {"answer": str, "sources_used": int}
        """
        if context_chunks:
            context_text = "\n---\n".join(context_chunks[:10])  # Top 10 chunks
            system_prompt = (
                "You are NexusOps Memory — an intelligent knowledge assistant for engineering teams. "
                "Answer the user's question based ONLY on the provided context from team discussions, "
                "documents, and past decisions. If the context doesn't contain the answer, say so. "
                "Always cite which piece of context you used.\n\n"
                f"=== TEAM CONTEXT ===\n{context_text}\n=== END CONTEXT ==="
            )
        else:
            system_prompt = (
                "You are NexusOps Memory — an intelligent knowledge assistant for engineering teams. "
                "The team hasn't ingested any data sources yet, so answer general engineering "
                "questions helpfully while noting that connecting data sources (Telegram, docs) "
                "will enable much better team-specific answers."
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ]

        answer = await AIService._call_groq(messages, temperature=0.4)
        return {
            "answer": answer,
            "sources_used": len(context_chunks) if context_chunks else 0,
        }

    # ── Data Sanitization ──

    @staticmethod
    def sanitize_data(text: str) -> tuple[str, dict]:
        """Strip API keys, passwords, PII from error data before AI sees it.
        
        Returns: (sanitized_text, report)
        """
        report = {"items_redacted": 0, "types": []}

        patterns = [
            (r'(?:api[_-]?key|apikey|token|secret|password|passwd|pwd)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?',
             "API_KEY/SECRET", "***REDACTED_SECRET***"),
            (r'(?:Bearer|Basic)\s+([a-zA-Z0-9_\-\.]+)', "AUTH_TOKEN", "***REDACTED_TOKEN***"),
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', "EMAIL", "***REDACTED_EMAIL***"),
            (r'(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}', "GITHUB_TOKEN", "***REDACTED_GH_TOKEN***"),
            (r'sk-[A-Za-z0-9]{20,}', "OPENAI_KEY", "***REDACTED_OPENAI***"),
            (r'gsk_[A-Za-z0-9]{20,}', "GROQ_KEY", "***REDACTED_GROQ***"),
        ]

        sanitized = text
        for pattern, ptype, replacement in patterns:
            matches = re.findall(pattern, sanitized, re.IGNORECASE)
            if matches:
                report["items_redacted"] += len(matches)
                report["types"].append(ptype)
                sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

        return sanitized, report

    # ── Incident Analysis (Root Cause) ──

    @staticmethod
    async def analyze_incident(error_message: str, stack_trace: str = "",
                                memory_context: list[str] | None = None) -> dict:
        """Analyze a production incident with optional memory enrichment.
        
        This is the Integration Layer showpiece: AutoFix queries Memory Engine
        for past context about the error before generating analysis.
        """
        # Sanitize first
        sanitized_error, _ = AIService.sanitize_data(error_message)
        sanitized_trace, san_report = AIService.sanitize_data(stack_trace) if stack_trace else ("", {})

        memory_section = ""
        if memory_context:
            memory_section = (
                "\n\n=== TEAM MEMORY CONTEXT ===\n"
                "The following are relevant past discussions/decisions from the team's memory:\n"
                + "\n---\n".join(memory_context[:5]) +
                "\n=== END MEMORY CONTEXT ===\n"
                "Use this context to provide richer analysis. Mention if this error was discussed before."
            )

        prompt = (
            "You are NexusOps AutoFix — an expert production incident analyzer.\n"
            "Analyze this production error and provide a JSON response with:\n"
            "- root_cause: A clear explanation of WHY this error occurs (2-3 sentences)\n"
            "- suggested_fix: Specific code changes to fix it\n"
            "- confidence: A float between 0 and 1\n"
            "- affected_files: A list of likely affected file paths\n"
            "- memory_insights: Any relevant insights from team memory (or empty string)\n"
            "- severity_assessment: 'critical', 'high', 'medium', or 'low'\n\n"
            f"Error: {sanitized_error}\n"
            f"Stack Trace:\n{sanitized_trace}\n"
            f"{memory_section}\n\n"
            "Respond ONLY with valid JSON, no markdown fences."
        )

        raw = await AIService._call_groq(
            [{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1500,
        )

        try:
            # Strip markdown fences if present
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
                cleaned = re.sub(r'```\s*$', '', cleaned)
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {
                "root_cause": raw,
                "suggested_fix": "",
                "confidence": 0.5,
                "affected_files": [],
                "memory_insights": "",
                "severity_assessment": "medium",
            }

    # ── Fix Generation ──

    @staticmethod
    async def generate_fix(error_message: str, root_cause: str,
                           stack_trace: str = "", code_context: str = "") -> dict:
        """Generate an AI code fix for an incident.
        
        Returns: {"title": str, "explanation": str, "file_changes": list, "confidence": float, "caveats": list}
        """
        prompt = (
            "You are NexusOps AutoFix — an expert code repair agent.\n"
            "Based on the error analysis below, generate a minimal, safe code fix.\n\n"
            f"Error: {error_message}\n"
            f"Root Cause: {root_cause}\n"
            f"Stack Trace:\n{stack_trace}\n"
            f"Code Context:\n{code_context}\n\n"
            "Respond ONLY with valid JSON containing:\n"
            "- title: Short title for the fix (e.g. 'Fix null pointer in auth middleware')\n"
            "- explanation: What the fix does and why\n"
            "- file_changes: [{path, original_code, fixed_code, change_summary}]\n"
            "- confidence: float 0-1\n"
            "- caveats: list of potential risks\n"
            "- safety_score: 'SAFE', 'REVIEW_REQUIRED', or 'BLOCKED'\n\n"
            "No markdown fences."
        )

        raw = await AIService._call_groq(
            [{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000,
        )

        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
                cleaned = re.sub(r'```\s*$', '', cleaned)
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {
                "title": f"Fix: {error_message[:80]}",
                "explanation": raw,
                "file_changes": [],
                "confidence": 0.5,
                "caveats": ["AI could not generate structured fix — manual review required"],
                "safety_score": "REVIEW_REQUIRED",
            }

    # ── Task Detection ──

    @staticmethod
    async def detect_tasks(text: str) -> list[dict]:
        """Detect action items/tasks from text (e.g., Telegram messages)."""
        prompt = (
            "You are NexusOps Task Detector. Analyze the following team communication "
            "and extract any action items, tasks, or assignments.\n\n"
            f"Text:\n{text}\n\n"
            "Return a JSON array of tasks, each with:\n"
            "- title: Short task title\n"
            "- description: Brief description\n"
            "- priority: 'high', 'medium', or 'low'\n"
            "- assignee_hint: Who should do it (or null)\n\n"
            "If no tasks found, return an empty array []. No markdown fences."
        )

        raw = await AIService._call_groq(
            [{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
                cleaned = re.sub(r'```\s*$', '', cleaned)
            result = json.loads(cleaned)
            return result if isinstance(result, list) else []
        except json.JSONDecodeError:
            return []

    # ── Legacy compatibility ──

    @staticmethod
    async def generate_response(prompt: str) -> str:
        """Simple single-prompt response (backward compat)."""
        return await AIService._call_groq([{"role": "user", "content": prompt}])

    @staticmethod
    async def chat_completion(messages: list) -> str:
        """Chat completion (backward compat)."""
        return await AIService._call_groq(messages)


ai_service = AIService()

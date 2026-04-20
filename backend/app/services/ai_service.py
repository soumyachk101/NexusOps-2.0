import json
import re
from groq import AsyncGroq
from app.config import settings


class AIService:
    """AI service powered by Groq LLaMA 3.3.

    Provides:
    - Memory Q&A with citations
    - Incident root cause analysis
    - AI fix generation
    - Data sanitization (strip PII/secrets)
    - Memory context search for incidents (Integration Layer)
    - Task detection from team communications
    """

    @staticmethod
    def _client() -> AsyncGroq:
        return AsyncGroq(api_key=settings.GROQ_API_KEY)

    @staticmethod
    async def _call_claude(
        messages: list,
        system: str | None = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        if not settings.GROQ_API_KEY:
            return "AI service not configured. Add GROQ_API_KEY to your .env file."

        try:
            full_messages = []
            if system:
                full_messages.append({"role": "system", "content": system})
            full_messages.extend(messages)

            response = await AIService._client().chat.completions.create(
                model=settings.GROQ_MODEL,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=full_messages,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq API error: {e}")
            return f"AI service error: {str(e)}"

    # ── Memory Q&A ──

    @staticmethod
    async def memory_qa(question: str, context_chunks: list[dict] | None = None) -> dict:
        """Answer a question using ingested memory context with citations.

        context_chunks: list of {"text": str, "source_type": str, "sender": str|None, "timestamp": str|None}
        Returns: {"answer": str, "sources_used": int}
        """
        if context_chunks:
            formatted_chunks = []
            for i, chunk in enumerate(context_chunks[:10]):
                source_meta = f"[Source: {chunk.get('source_type', 'unknown')}"
                if chunk.get("timestamp"):
                    source_meta += f" | {chunk['timestamp']}"
                if chunk.get("sender"):
                    source_meta += f" | {chunk['sender']}"
                source_meta += "]"
                formatted_chunks.append(f"{source_meta}\n{chunk['text']}")

            context_text = "\n---\n".join(formatted_chunks)
            system = (
                "You are NexusOps Memory — an intelligent knowledge assistant for engineering teams. "
                "Answer the user's question based ONLY on the provided context from team discussions, "
                "documents, and past decisions. "
                "If the context doesn't contain the answer, say: "
                "\"I couldn't find relevant information about this in your team's records.\"\n"
                "Always cite sources using the format: [Source: source_type | date | sender]\n"
                "Be concise: 2-4 sentences unless more detail is explicitly needed.\n\n"
                f"=== TEAM CONTEXT ===\n{context_text}\n=== END CONTEXT ==="
            )
        else:
            system = (
                "You are NexusOps Memory — an intelligent knowledge assistant for engineering teams. "
                "The team hasn't ingested any data sources yet, so answer general engineering "
                "questions helpfully while noting that connecting data sources (Telegram, docs) "
                "will enable much better team-specific answers."
            )

        answer = await AIService._call_claude(
            messages=[{"role": "user", "content": question}],
            system=system,
            temperature=0.4,
        )
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
            (
                r'(?:api[_-]?key|apikey|token|secret|password|passwd|pwd)\s*[:=]\s*["\']?([a-zA-Z0-9_\-\.]{8,})["\']?',
                "API_KEY/SECRET",
                "***REDACTED_SECRET***",
            ),
            (r'(?:Bearer|Basic)\s+([a-zA-Z0-9_\-\.]+)', "AUTH_TOKEN", "***REDACTED_TOKEN***"),
            (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', "EMAIL", "***REDACTED_EMAIL***"),
            (r'(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}', "GITHUB_TOKEN", "***REDACTED_GH_TOKEN***"),
            (r'sk-[A-Za-z0-9]{20,}', "OPENAI_KEY", "***REDACTED_OPENAI***"),
            (r'(?:postgresql|mysql|mongodb)\+?[a-z]*://[^\s"\']+', "DB_URL", "***REDACTED_DB_URL***"),
            (r'\b(?:\d{1,3}\.){3}\d{1,3}\b', "IP_ADDRESS", "***REDACTED_IP***"),
            (r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}', "JWT", "***REDACTED_JWT***"),
        ]

        sanitized = text
        for pattern, ptype, replacement in patterns:
            matches = re.findall(pattern, sanitized, re.IGNORECASE)
            if matches:
                report["items_redacted"] += len(matches)
                if ptype not in report["types"]:
                    report["types"].append(ptype)
                sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)

        return sanitized, report

    # ── Incident Analysis (Root Cause) ──

    @staticmethod
    async def analyze_incident(
        error_message: str,
        stack_trace: str = "",
        memory_context: list[dict] | None = None,
    ) -> dict:
        """Analyze a production incident with optional memory enrichment.

        memory_context: list of {"text": str, "source_type": str, "sender": str|None}
        This is the Integration Layer showpiece: AutoFix queries Memory Engine
        for past context about the error before generating analysis.
        """
        sanitized_error, _ = AIService.sanitize_data(error_message)
        sanitized_trace, _ = AIService.sanitize_data(stack_trace) if stack_trace else ("", {})

        memory_section = ""
        if memory_context:
            chunks_text = "\n---\n".join(
                f"[{c.get('source_type', 'team')} | {c.get('sender', 'unknown')}]\n{c['text']}"
                for c in memory_context[:5]
            )
            memory_section = (
                "\n\n=== TEAM MEMORY CONTEXT ===\n"
                "The following are relevant past discussions/decisions from the team's memory:\n"
                f"{chunks_text}\n"
                "=== END MEMORY CONTEXT ===\n"
                "Use this context to provide richer analysis. Mention if this error was discussed before "
                "using the phrase 'The team previously...'."
            )

        prompt = (
            f"Error: {sanitized_error}\n"
            f"Stack Trace:\n{sanitized_trace}\n"
            f"{memory_section}\n\n"
            "Respond ONLY with valid JSON (no markdown fences) containing:\n"
            "- root_cause: Clear explanation of WHY this error occurs (2-3 sentences)\n"
            "- suggested_fix: Specific code changes to fix it\n"
            "- confidence: float 0-1\n"
            "- affected_files: list of likely affected file paths\n"
            "- memory_insights: insights from team memory, or empty string\n"
            "- severity_assessment: 'critical', 'high', 'medium', or 'low'"
        )

        system = (
            "You are NexusOps AutoFix — an expert production incident analyzer. "
            "Analyze production errors and provide structured JSON responses. "
            "Never hallucinate file paths or make up stack trace details."
        )

        raw = await AIService._call_claude(
            messages=[{"role": "user", "content": prompt}],
            system=system,
            temperature=0.2,
            max_tokens=1500,
        )

        return _parse_json_safely(raw, {
            "root_cause": raw,
            "suggested_fix": "",
            "confidence": 0.5,
            "affected_files": [],
            "memory_insights": "",
            "severity_assessment": "medium",
        })

    # ── Fix Generation ──

    @staticmethod
    async def generate_fix(
        error_message: str,
        root_cause: str,
        stack_trace: str = "",
        code_context: str = "",
        memory_context: list[dict] | None = None,
    ) -> dict:
        """Generate an AI code fix for an incident.

        Returns: {"title", "explanation", "file_changes", "confidence", "caveats", "safety_score"}
        """
        memory_section = ""
        if memory_context:
            chunks_text = "\n---\n".join(c["text"] for c in memory_context[:3])
            memory_section = f"\n\nTeam context from past discussions:\n{chunks_text}\n"

        prompt = (
            f"Error: {error_message}\n"
            f"Root Cause: {root_cause}\n"
            f"Stack Trace:\n{stack_trace}\n"
            f"Code Context:\n{code_context}\n"
            f"{memory_section}\n"
            "Generate a MINIMAL, safe code fix. Rules:\n"
            "- Minimum changes only — no refactoring, no touching unrelated code\n"
            "- Never add: os.system(), subprocess, eval(), exec(), file deletions, new external HTTP calls\n"
            "- Preserve exact indentation, variable naming, no comments added\n"
            "- Max 3 files changed\n\n"
            "Respond ONLY with valid JSON (no markdown fences) containing:\n"
            "- title: Short fix title (e.g. 'Fix null pointer in auth middleware')\n"
            "- explanation: What the fix does and why\n"
            "- file_changes: [{path, original_code, fixed_code, change_summary}]\n"
            "- confidence: float 0-1\n"
            "- caveats: list of potential risks\n"
            "- safety_score: 'SAFE', 'REVIEW_REQUIRED', or 'BLOCKED'"
        )

        system = (
            "You are NexusOps AutoFix code repair agent. "
            "Generate minimal, targeted code fixes. Never suggest dangerous patterns. "
            "If confidence < 0.5, set safety_score to BLOCKED."
        )

        raw = await AIService._call_claude(
            messages=[{"role": "user", "content": prompt}],
            system=system,
            temperature=0.2,
            max_tokens=2500,
        )

        return _parse_json_safely(raw, {
            "title": f"Fix: {error_message[:80]}",
            "explanation": raw,
            "file_changes": [],
            "confidence": 0.5,
            "caveats": ["AI could not generate structured fix — manual review required"],
            "safety_score": "REVIEW_REQUIRED",
        })

    # ── Task Detection ──

    @staticmethod
    async def detect_tasks(text: str) -> list[dict]:
        """Detect action items/tasks from team communication text."""
        prompt = (
            f"Text:\n{text}\n\n"
            "Extract any action items, tasks, or assignments from this team communication.\n"
            "Return a JSON array (or [] if none found) where each item has:\n"
            "- title: Short task title\n"
            "- description: Brief description\n"
            "- priority: 'high', 'medium', or 'low'\n"
            "- assignee_hint: Who should do it (or null)\n"
            "No markdown fences."
        )

        system = (
            "You are NexusOps Task Detector. "
            "Identify concrete action items from team communications. "
            "Only extract real tasks — not general discussion."
        )

        raw = await AIService._call_claude(
            messages=[{"role": "user", "content": prompt}],
            system=system,
            temperature=0.3,
        )

        result = _parse_json_safely(raw, [])
        return result if isinstance(result, list) else []

    # ── Memory Context Summary ──

    @staticmethod
    async def summarize_memory_context(chunks: list[dict]) -> str:
        """Summarize retrieved memory chunks into 1-2 sentences for PR body.

        Returns: summary string starting with 'The team previously...'
        """
        if not chunks:
            return ""

        chunks_text = "\n---\n".join(c["text"] for c in chunks[:5])
        prompt = (
            f"Team discussion excerpts:\n{chunks_text}\n\n"
            "Summarize what the team previously said about this topic in 1-2 sentences. "
            "Start your response with 'The team previously...'. Be specific and factual."
        )

        return await AIService._call_claude(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200,
        )

    # ── Problem Detection ──

    @staticmethod
    async def detect_problems(texts: list[str]) -> list[dict]:
        """Surface recurring complaints/blockers from a list of team messages."""
        combined = "\n---\n".join(texts[:20])
        prompt = (
            f"Team messages:\n{combined}\n\n"
            "Identify recurring problems, blockers, or complaints mentioned across these messages.\n"
            "Return a JSON array (or [] if none) where each item has:\n"
            "- title: Problem title\n"
            "- description: What the problem is\n"
            "- severity: 'critical', 'high', 'medium', or 'low'\n"
            "- frequency_hint: How many times it appears\n"
            "No markdown fences."
        )

        raw = await AIService._call_claude(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        result = _parse_json_safely(raw, [])
        return result if isinstance(result, list) else []

    # ── Legacy compatibility ──

    @staticmethod
    async def generate_response(prompt: str) -> str:
        return await AIService._call_claude([{"role": "user", "content": prompt}])

    @staticmethod
    async def chat_completion(messages: list) -> str:
        return await AIService._call_claude(messages)


def _parse_json_safely(raw: str, fallback):
    """Strip markdown fences and parse JSON, returning fallback on failure."""
    try:
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
            cleaned = re.sub(r'```\s*$', '', cleaned.strip())
        return json.loads(cleaned.strip())
    except json.JSONDecodeError:
        return fallback


ai_service = AIService()

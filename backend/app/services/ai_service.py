import httpx
from app.config import settings

class AIService:
    @staticmethod
    async def generate_response(prompt: str) -> str:
        """Generate a response using Ollama."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{settings.OLLAMA_API_BASE}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False
                    }
                )
                response.raise_for_status()
                return response.json().get("response", "No response from AI.")
            except Exception as e:
                print(f"Ollama error: {e}")
                return f"Error connecting to Ollama: {str(e)}"

    @staticmethod
    async def chat_completion(messages: list) -> str:
        """Chat completion using Ollama."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{settings.OLLAMA_API_BASE}/api/chat",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "messages": messages,
                        "stream": False
                    }
                )
                response.raise_for_status()
                return response.json().get("message", {}).get("content", "No response from AI.")
            except Exception as e:
                print(f"Ollama error: {e}")
                return f"Error connecting to Ollama: {str(e)}"

ai_service = AIService()

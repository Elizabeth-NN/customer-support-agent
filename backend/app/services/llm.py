import httpx
from collections.abc import Iterator

from google import genai

from app.core.config import get_settings


settings = get_settings()


def generate_embedding(text: str) -> list[float]:
    """Generate embeddings using the local Ollama embedding model."""

    response = httpx.post(
        f"{settings.llm_base_url}/api/embed",
        json={
            "model": settings.llm_embedding_model,
            "input": text,
        },
        timeout=settings.llm_timeout,
    )

    response.raise_for_status()

    return response.json()["embeddings"][0]


def generate_text(prompt: str) -> str:
    """Generate text using the configured chat provider."""

    if settings.llm_provider == "gemini":
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        client = genai.Client(api_key=settings.gemini_api_key)

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
        )

        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        return response.text.strip()

    if settings.llm_provider == "ollama":
        response = httpx.post(
            f"{settings.llm_base_url}/api/generate",
            json={
                "model": settings.llm_chat_model,
                "prompt": prompt,
                "stream": False,
                "think": settings.llm_thinking,
            },
            timeout=settings.llm_timeout,
        )

        response.raise_for_status()

        return response.json()["response"].strip()

    raise ValueError(
        f"Unsupported LLM provider: {settings.llm_provider}. "
        "Supported providers: gemini, ollama"
    )


def generate_text_stream(prompt: str) -> Iterator[str]:
    """Stream generated text from the configured chat provider."""

    if settings.llm_provider == "gemini":
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        client = genai.Client(api_key=settings.gemini_api_key)

        response = client.models.generate_content_stream(
            model=settings.gemini_model,
            contents=prompt,
        )

        for chunk in response:
            if chunk.text:
                yield chunk.text

        return

    if settings.llm_provider == "ollama":
        response = httpx.post(
            f"{settings.llm_base_url}/api/generate",
            json={
                "model": settings.llm_chat_model,
                "prompt": prompt,
                "stream": True,
                "think": settings.llm_thinking,
            },
            timeout=settings.llm_timeout,
        )

        response.raise_for_status()

        for line in response.iter_lines():
            if not line:
                continue

            import json

            data = json.loads(line)

            chunk = data.get("response", "")

            if chunk:
                yield chunk

            if data.get("done"):
                break

        return

    raise ValueError(
        f"Unsupported LLM provider: {settings.llm_provider}. "
        "Supported providers: gemini, ollama"
    )
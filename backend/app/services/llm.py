import httpx

from app.core.config import get_settings


settings = get_settings()


def _validate_provider() -> None:
    """Validate that the configured LLM provider is supported."""

    if settings.llm_provider != "ollama":
        raise ValueError(
            f"Unsupported LLM provider: {settings.llm_provider}. "
            "Currently supported providers: ollama"
        )


def generate_embedding(text: str) -> list[float]:
    """Generate an embedding using the configured LLM provider."""

    _validate_provider()

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
    """Generate text using the configured LLM provider."""

    _validate_provider()

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

import httpx

from app.core.config import get_settings


settings = get_settings()


def generate_embedding(text: str) -> list[float]:
    """Generate a 768-dimensional embedding using Ollama."""

    response = httpx.post(
        f"{settings.ollama_base_url}/api/embed",
        json={
            "model": "nomic-embed-text",
            "input": text,
        },
        timeout=120,
    )

    response.raise_for_status()

    return response.json()["embeddings"][0]

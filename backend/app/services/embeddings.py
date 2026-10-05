from app.services.llm import generate_embedding as generate_llm_embedding


def generate_embedding(text: str) -> list[float]:
    """Generate an embedding using the configured LLM."""

    return generate_llm_embedding(text)

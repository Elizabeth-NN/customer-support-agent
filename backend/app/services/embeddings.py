from app.services.llm import generate_embedding as generate_llm_embedding


def generate_embedding(
    text: str,
    task_type: str = "RETRIEVAL_DOCUMENT",
) -> list[float]:
    """Generate an embedding using the configured embedding provider."""

    return generate_llm_embedding(text, task_type=task_type)
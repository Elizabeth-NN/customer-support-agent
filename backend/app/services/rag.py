import httpx

from app.core.config import get_settings
from app.services.retrieval import retrieve_relevant_chunks


settings = get_settings()


def generate_answer(
    question: str,
    limit: int = 5,
) -> str:
    """Generate a grounded answer using retrieved knowledge."""

    chunks = retrieve_relevant_chunks(
        question,
        limit=limit,
    )

    if not chunks:
        return "I don't have enough information to answer that question."

    context = "\n\n".join(
        f"Knowledge source {index + 1}:\n{chunk['content']}"
        for index, chunk in enumerate(chunks)
    )

    prompt = f"""You are a helpful customer support assistant.

Answer the customer's question using ONLY the knowledge provided below.

If the knowledge does not contain enough information to answer the question,
say that you don't have enough information. Do not invent or assume facts.

Knowledge:
{context}

Customer question:
{question}

Answer:"""

    response = httpx.post(
        f"{settings.ollama_base_url}/api/generate",
        json={
            "model": "qwen3:1.7b",
            "prompt": prompt,
            "stream": False,
        },
        timeout=120,
    )

    response.raise_for_status()

    return response.json()["response"].strip()

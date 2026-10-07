from collections.abc import Iterator
from uuid import UUID

from app.services.llm import generate_text, generate_text_stream
from app.services.retrieval import retrieve_relevant_chunks


def _build_prompt(
    question: str,
    business_id: UUID,
    limit: int = 5,
) -> str | None:
    """Build a grounded prompt using the business's knowledge."""

    chunks = retrieve_relevant_chunks(
        question,
        business_id=business_id,
        limit=limit,
    )

    if not chunks:
        return None

    context = "\n\n".join(
        f"Knowledge source {index + 1}:\n{chunk['content']}"
        for index, chunk in enumerate(chunks)
    )

    return f"""You are a helpful customer support assistant.

Answer the customer's question using ONLY the knowledge provided below.

If the knowledge does not contain enough information to answer the question,
say that you don't have enough information. Do not invent or assume facts.

Knowledge:
{context}

Customer question:
{question}

Answer:"""


def generate_answer(
    question: str,
    business_id: UUID,
    limit: int = 5,
) -> str:
    """Generate a complete grounded answer."""

    prompt = _build_prompt(
        question,
        business_id=business_id,
        limit=limit,
    )

    if prompt is None:
        return "I don't have enough information to answer that question."

    return generate_text(prompt)


def generate_answer_stream(
    question: str,
    business_id: UUID,
    limit: int = 5,
) -> Iterator[str]:
    """Generate a grounded answer as a stream."""

    prompt = _build_prompt(
        question,
        business_id=business_id,
        limit=limit,
    )

    if prompt is None:
        yield "I don't have enough information to answer that question."
        return

    yield from generate_text_stream(prompt)
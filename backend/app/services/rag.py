from collections.abc import Iterator
from uuid import UUID

from app.services.llm import generate_text, generate_text_stream
from app.services.retrieval import retrieve_relevant_chunks


RAG_CONFIDENCE_DISTANCE_THRESHOLD = 0.55


def _build_prompt(
    question: str,
    chunks: list[dict],
) -> str:
    """Build a grounded prompt from retrieved knowledge."""

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


def _has_confident_match(chunks: list[dict]) -> bool:
    """Return whether the best retrieved chunk is sufficiently similar."""

    if not chunks:
        return False

    best_distance = float(chunks[0]["distance"])

    return best_distance <= RAG_CONFIDENCE_DISTANCE_THRESHOLD


def retrieve_answer_context(
    question: str,
    business_id: UUID,
    limit: int = 5,
) -> tuple[str | None, list[dict]]:
    """Retrieve knowledge and build the grounded prompt."""

    chunks = retrieve_relevant_chunks(
        question,
        business_id=business_id,
        limit=limit,
    )

    sources = [
        {
            "document_id": str(chunk["document_id"]),
            "document_title": chunk["document_title"],
            "source_type": chunk["source_type"],
            "source_uri": chunk["source_uri"],
            "chunk_id": str(chunk["id"]),
            "chunk_index": chunk["chunk_index"],
            "distance": float(chunk["distance"]),
            "content": chunk["content"],
        }
        for chunk in chunks
    ]

    if not _has_confident_match(chunks):
        return None, sources

    prompt = _build_prompt(
        question,
        chunks,
    )

    return prompt, sources


def generate_answer(
    question: str,
    business_id: UUID,
    limit: int = 5,
) -> str:
    """Generate a complete grounded answer."""

    prompt, _ = retrieve_answer_context(
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

    prompt, _ = retrieve_answer_context(
        question,
        business_id=business_id,
        limit=limit,
    )

    if prompt is None:
        yield "I don't have enough information to answer that question."
        return

    yield from generate_text_stream(prompt)
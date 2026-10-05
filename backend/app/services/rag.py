from app.services.llm import generate_text
from app.services.retrieval import retrieve_relevant_chunks


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

    return generate_text(prompt)

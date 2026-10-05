from sqlalchemy import text

from app.db.session import engine
from app.services.embeddings import generate_embedding


def retrieve_relevant_chunks(
    question: str,
    limit: int = 5,
) -> list[dict]:
    """Retrieve the most relevant knowledge chunks for a question."""

    embedding = generate_embedding(question)

    with engine.connect() as conn:
        result = conn.execute(
            text("""
                SELECT
                    dc.id,
                    dc.document_id,
                    dc.content,
                    dc.chunk_index,
                    dc.embedding <=> CAST(:embedding AS vector) AS distance
                FROM document_chunks dc
                ORDER BY dc.embedding <=> CAST(:embedding AS vector)
                LIMIT :limit
            """),
            {
                "embedding": str(embedding),
                "limit": limit,
            },
        )

        rows = result.mappings().all()

    return [dict(row) for row in rows]

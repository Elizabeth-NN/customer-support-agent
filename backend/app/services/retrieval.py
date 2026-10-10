from uuid import UUID

from sqlalchemy import text

from app.db.session import engine
from app.services.embeddings import generate_embedding


def retrieve_relevant_chunks(
    question: str,
    business_id: UUID,
    limit: int = 5,
    public_only: bool = False,
) -> list[dict]:
    """Retrieve relevant knowledge chunks and their source metadata."""

    embedding = generate_embedding(
        question,
        task_type="RETRIEVAL_QUERY",
    )

    with engine.connect() as conn:
        result = conn.execute(
            text(
                """
                SELECT
                    dc.id,
                    dc.document_id,
                    dc.content,
                    dc.chunk_index,
                    kd.title AS document_title,
                    kd.source_type,
                    kd.source_uri,
                    dc.embedding <=> CAST(:embedding AS vector) AS distance
                FROM document_chunks dc
                INNER JOIN knowledge_documents kd
                    ON kd.id = dc.document_id
                WHERE kd.business_id = :business_id
                  AND (:public_only = false OR kd.is_published = true)
                ORDER BY dc.embedding <=> CAST(:embedding AS vector)
                LIMIT :limit
                """
            ),
            {
                "embedding": str(embedding),
                "business_id": business_id,
                "limit": limit,
                "public_only": public_only,
            },
        )

        rows = result.mappings().all()

    return [dict(row) for row in rows]
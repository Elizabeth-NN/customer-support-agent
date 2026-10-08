from uuid import UUID

from sqlalchemy import select

from app.db.session import engine
from app.models.knowledge_document import KnowledgeDocument


def list_knowledge_documents(
    business_id: UUID,
) -> list[dict]:
    """Return knowledge documents belonging to a business, newest first."""

    statement = (
        select(
            KnowledgeDocument.id,
            KnowledgeDocument.business_id,
            KnowledgeDocument.title,
            KnowledgeDocument.source_type,
            KnowledgeDocument.source_uri,
            KnowledgeDocument.created_at,
            KnowledgeDocument.updated_at,
        )
        .where(KnowledgeDocument.business_id == business_id)
        .order_by(KnowledgeDocument.created_at.desc())
    )

    with engine.connect() as conn:
        rows = conn.execute(statement).mappings().all()

    return [dict(row) for row in rows]

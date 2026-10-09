from uuid import UUID

from sqlalchemy import delete, select, update

from app.db.session import engine
from app.models.knowledge_document import KnowledgeDocument
from app.services.storage import delete_file


def list_knowledge_documents(
    business_id: UUID,
) -> list[dict]:
    """Return knowledge documents belonging to a business, newest first."""

    statement = (
        select(
            KnowledgeDocument.id,
            KnowledgeDocument.business_id,
            KnowledgeDocument.title,
            KnowledgeDocument.is_published,
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


def delete_knowledge_document(
    business_id: UUID,
    document_id: UUID,
) -> str | None:
    """Delete a document and return its storage object key, if present."""

    # Select only the column we need. With a Core connection, selecting the
    # entity returns the first column (the id), not an ORM instance.
    statement = select(KnowledgeDocument.source_uri).where(
        KnowledgeDocument.id == document_id,
        KnowledgeDocument.business_id == business_id,
    )

    with engine.begin() as conn:
        row = conn.execute(statement).first()

        if row is None:
            raise ValueError("Document not found.")

        source_uri = row.source_uri

        conn.execute(
            delete(KnowledgeDocument).where(
                KnowledgeDocument.id == document_id,
                KnowledgeDocument.business_id == business_id,
            )
        )

    if source_uri:
        delete_file(source_uri)

    return source_uri


def set_document_publication(
    business_id: UUID,
    document_id: UUID,
    is_published: bool,
) -> dict | None:
    """Update publication status for a document owned by a business."""

    with engine.begin() as conn:
        result = conn.execute(
            update(KnowledgeDocument)
            .where(
                KnowledgeDocument.id == document_id,
                KnowledgeDocument.business_id == business_id,
            )
            .values(is_published=is_published)
        )

        if result.rowcount == 0:
            return None

        statement = select(
            KnowledgeDocument.id,
            KnowledgeDocument.business_id,
            KnowledgeDocument.title,
            KnowledgeDocument.source_type,
            KnowledgeDocument.source_uri,
            KnowledgeDocument.is_published,
            KnowledgeDocument.created_at,
            KnowledgeDocument.updated_at,
        ).where(
            KnowledgeDocument.id == document_id,
            KnowledgeDocument.business_id == business_id,
        )

        row = conn.execute(statement).mappings().one()

    return dict(row)

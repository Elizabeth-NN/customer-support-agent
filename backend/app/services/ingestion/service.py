from uuid import UUID, uuid4

from sqlalchemy import insert

from app.db.session import engine
from app.models.document_chunk import DocumentChunk
from app.models.knowledge_document import KnowledgeDocument
from app.services.embeddings import generate_embedding
from app.services.ingestion.chunking import split_text
from app.services.ingestion.extraction import extract_text
from app.services.storage import download_file


def ingest_text(
    business_id: UUID,
    title: str,
    text: str,
    source_type: str = "document",
    source_uri: str | None = None,
) -> dict:
    """Ingest text into the business knowledge base."""

    chunks = split_text(text)

    if not chunks:
        raise ValueError("Cannot ingest empty text.")

    document_id = uuid4()

    document_statement = insert(KnowledgeDocument).values(
        id=document_id,
        business_id=business_id,
        title=title,
        source_type=source_type,
        source_uri=source_uri,
    )

    chunk_rows = []

    for chunk_index, content in enumerate(chunks):
        embedding = generate_embedding(
            content,
            task_type="RETRIEVAL_DOCUMENT",
        )

        chunk_rows.append(
            {
                "id": uuid4(),
                "document_id": document_id,
                "chunk_index": chunk_index,
                "content": content,
                "embedding": embedding,
            }
        )

    with engine.begin() as conn:
        conn.execute(document_statement)
        conn.execute(
            insert(DocumentChunk),
            chunk_rows,
        )

    return {
        "document_id": document_id,
        "business_id": business_id,
        "title": title,
        "source_type": source_type,
        "source_uri": source_uri,
        "chunk_count": len(chunk_rows),
    }


def ingest_r2_document(
    business_id: UUID,
    title: str,
    object_key: str,
    source_type: str = "document",
) -> dict:
    """Download a document from R2 and ingest its contents."""

    file_bytes = download_file(object_key)

    text = extract_text(
        file_bytes,
        object_key,
    )

    return ingest_text(
        business_id=business_id,
        title=title,
        text=text,
        source_type=source_type,
        source_uri=object_key,
    )
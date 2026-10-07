"""add vector index to document chunks

Revision ID: 85dfd6dab6ae
Revises: 680c03d09df0
Create Date: 2026-10-07 11:08:34.579790

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "85dfd6dab6ae"
down_revision: Union[str, Sequence[str], None] = "680c03d09df0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add an HNSW index for cosine-similarity vector search."""
    op.execute(
        """
        CREATE INDEX ix_document_chunks_embedding_hnsw
        ON document_chunks
        USING hnsw (embedding vector_cosine_ops)
        """
    )


def downgrade() -> None:
    """Remove the vector search index."""
    op.execute(
        """
        DROP INDEX IF EXISTS ix_document_chunks_embedding_hnsw
        """
    )
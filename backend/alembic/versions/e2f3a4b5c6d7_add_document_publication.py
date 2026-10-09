"""Add publication status to knowledge documents."""

from alembic import op
import sqlalchemy as sa


revision = "e2f3a4b5c6d7"
down_revision = "d7e8f9a1b2c3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "knowledge_documents",
        sa.Column(
            "is_published",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("knowledge_documents", "is_published")

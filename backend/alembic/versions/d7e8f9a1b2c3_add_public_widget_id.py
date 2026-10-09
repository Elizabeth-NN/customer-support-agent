"""Add public widget IDs to businesses."""

import secrets

from alembic import op
import sqlalchemy as sa


revision = "d7e8f9a1b2c3"
down_revision = "c4b2d8a91f60"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "businesses",
        sa.Column("public_widget_id", sa.String(64), nullable=True),
    )

    connection = op.get_bind()
    businesses = sa.table(
        "businesses",
        sa.column("id", sa.Uuid()),
        sa.column("public_widget_id", sa.String(64)),
    )

    rows = connection.execute(
        sa.select(businesses.c.id)
    ).all()

    for row in rows:
        connection.execute(
            businesses.update()
            .where(businesses.c.id == row.id)
            .values(public_widget_id=secrets.token_urlsafe(32))
        )

    op.alter_column(
        "businesses",
        "public_widget_id",
        existing_type=sa.String(64),
        nullable=False,
    )

    op.create_index(
        "ix_businesses_public_widget_id",
        "businesses",
        ["public_widget_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_businesses_public_widget_id",
        table_name="businesses",
    )
    op.drop_column("businesses", "public_widget_id")

"""add clerk user id to businesses

Revision ID: 680c03d09df0
Revises: e1e7cd267b20
Create Date: 2026-10-06 16:36:59.255195

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "680c03d09df0"
down_revision: Union[str, Sequence[str], None] = "e1e7cd267b20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CLERK_USER_ID = "user_3KJyYGDtv0ysYHixbueDC8VHmLb"


def upgrade() -> None:
    """Add Clerk ownership to businesses."""

    # Add the column as nullable first so existing businesses can be migrated.
    op.add_column(
        "businesses",
        sa.Column(
            "clerk_user_id",
            sa.String(length=255),
            nullable=True,
        ),
    )

    # Associate the existing prototype business with the authenticated user.
    op.execute(
        sa.text(
            """
            UPDATE businesses
            SET clerk_user_id = :clerk_user_id
            WHERE name = 'RAG Test Business'
            """
        ).bindparams(clerk_user_id=CLERK_USER_ID)
    )

    # Make sure every existing business has an owner before enforcing the constraint.
    op.alter_column(
        "businesses",
        "clerk_user_id",
        existing_type=sa.String(length=255),
        nullable=False,
    )

    # One Clerk user owns one business in this prototype.
    op.create_index(
        op.f("ix_businesses_clerk_user_id"),
        "businesses",
        ["clerk_user_id"],
        unique=True,
    )


def downgrade() -> None:
    """Remove Clerk ownership from businesses."""

    op.drop_index(
        op.f("ix_businesses_clerk_user_id"),
        table_name="businesses",
    )

    op.drop_column(
        "businesses",
        "clerk_user_id",
    )
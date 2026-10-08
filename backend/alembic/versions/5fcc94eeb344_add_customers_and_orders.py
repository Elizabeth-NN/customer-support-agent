"""add customers and orders

Revision ID: 5fcc94eeb344
Revises: 8465b5fbaa2d
Create Date: 2026-10-08 19:17:12.966794

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5fcc94eeb344"
down_revision: Union[str, Sequence[str], None] = "8465b5fbaa2d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "customers",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("business_id", sa.UUID(), nullable=False),
        sa.Column("external_id", sa.String(length=255), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["business_id"],
            ["businesses.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_customers_business_id"),
        "customers",
        ["business_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_customers_email"),
        "customers",
        ["email"],
        unique=False,
    )
    op.create_index(
        op.f("ix_customers_external_id"),
        "customers",
        ["external_id"],
        unique=False,
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("business_id", sa.UUID(), nullable=False),
        sa.Column("customer_id", sa.UUID(), nullable=False),
        sa.Column("order_number", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column(
            "total_amount",
            sa.Numeric(precision=12, scale=2),
            nullable=False,
        ),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["business_id"],
            ["businesses.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["customer_id"],
            ["customers.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_orders_business_id"),
        "orders",
        ["business_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_orders_customer_id"),
        "orders",
        ["customer_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_orders_order_number"),
        "orders",
        ["order_number"],
        unique=False,
    )

    op.create_unique_constraint(
        "uq_orders_business_order_number",
        "orders",
        ["business_id", "order_number"],
    )

    


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "uq_orders_business_order_number",
        "orders",
        type_="unique",
    )

    op.drop_index(
        op.f("ix_orders_order_number"),
        table_name="orders",
    )
    op.drop_index(
        op.f("ix_orders_customer_id"),
        table_name="orders",
    )
    op.drop_index(
        op.f("ix_orders_business_id"),
        table_name="orders",
    )
    op.drop_table("orders")

    op.drop_index(
        op.f("ix_customers_external_id"),
        table_name="customers",
    )
    op.drop_index(
        op.f("ix_customers_email"),
        table_name="customers",
    )
    op.drop_index(
        op.f("ix_customers_business_id"),
        table_name="customers",
    )
    op.drop_table("customers")
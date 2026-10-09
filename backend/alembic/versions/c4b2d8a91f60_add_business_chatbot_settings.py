"""Add business profile and chatbot settings."""

from alembic import op
import sqlalchemy as sa


revision = "c4b2d8a91f60"
down_revision = "a5707f08b54e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "businesses",
        sa.Column("support_email", sa.String(320), nullable=True),
    )
    op.add_column(
        "businesses",
        sa.Column("support_phone", sa.String(50), nullable=True),
    )
    op.add_column(
        "businesses",
        sa.Column(
            "assistant_name",
            sa.String(100),
            nullable=False,
            server_default="Support Assistant",
        ),
    )
    op.add_column(
        "businesses",
        sa.Column(
            "welcome_message",
            sa.Text(),
            nullable=False,
            server_default="Hi! How can I help you today?",
        ),
    )
    op.add_column(
        "businesses",
        sa.Column(
            "fallback_message",
            sa.Text(),
            nullable=False,
            server_default=(
                "I don't have enough information to answer that question."
            ),
        ),
    )
    op.add_column(
        "businesses",
        sa.Column(
            "escalate_on_low_confidence",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )


def downgrade() -> None:
    op.drop_column("businesses", "escalate_on_low_confidence")
    op.drop_column("businesses", "fallback_message")
    op.drop_column("businesses", "welcome_message")
    op.drop_column("businesses", "assistant_name")
    op.drop_column("businesses", "support_phone")
    op.drop_column("businesses", "support_email")

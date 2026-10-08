"""add support tickets 
 
Revision ID: 8465b5fbaa2d 
Revises: 85dfd6dab6ae 
Create Date: 2026-10-08 13:28:39.479266 
 
""" 
from typing import Sequence, Union 
 
from alembic import op 
import sqlalchemy as sa 
 
 
# revision identifiers, used by Alembic. 
revision: str = "8465b5fbaa2d" 
down_revision: Union[str, Sequence[str], None] = "85dfd6dab6ae" 
branch_labels: Union[str, Sequence[str], None] = None 
depends_on: Union[str, Sequence[str], None] = None 
 
 
def upgrade() -> None: 
    """Create the support tickets table.""" 
    op.create_table( 
        "support_tickets", 
        sa.Column("id", sa.UUID(), nullable=False), 
        sa.Column("business_id", sa.UUID(), nullable=False), 
        sa.Column("customer_question", sa.Text(), nullable=False), 
        sa.Column("escalation_reason", sa.Text(), nullable=False), 
        sa.Column( 
            "status", 
            sa.String(length=30), 
            nullable=False, 
        ), 
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
        op.f("ix_support_tickets_business_id"), 
        "support_tickets", 
        ["business_id"], 
        unique=False, 
    ) 
 
 
def downgrade() -> None: 
    """Drop the support tickets table.""" 
    op.drop_index( 
        op.f("ix_support_tickets_business_id"), 
        table_name="support_tickets", 
    ) 
 
    op.drop_table("support_tickets")                                                                                                      

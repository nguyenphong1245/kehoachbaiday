"""Add tokens_used column to users table

Revision ID: 034_add_tokens_used
Revises: 033_ensure_assignment_columns
Create Date: 2026-02-04
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "034_tokens"
down_revision = "033_assign_col"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add tokens_used column to users table
    op.add_column(
        "users",
        sa.Column("tokens_used", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("users", "tokens_used")

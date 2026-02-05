"""add token_balance to users

Revision ID: 015
Revises: 014
Create Date: 2026-01-31
"""
from alembic import op
import sqlalchemy as sa

revision = "015_add_token_balance"
down_revision = "014_add_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("token_balance", sa.Integer(), nullable=False, server_default="20000"))


def downgrade() -> None:
    op.drop_column("users", "token_balance")

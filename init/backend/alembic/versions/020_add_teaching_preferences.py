"""Add teaching tools and teaching style to user_settings

Revision ID: 020
Revises: 019_add_refresh_tokens
"""
from alembic import op
import sqlalchemy as sa

revision = "020_add_teaching_preferences"
down_revision = "019_add_refresh_tokens"


def upgrade() -> None:
    op.add_column("user_settings", sa.Column("teaching_tools", sa.JSON(), nullable=True))
    op.add_column("user_settings", sa.Column("custom_tools", sa.JSON(), nullable=True))
    op.add_column("user_settings", sa.Column("teaching_style", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("user_settings", "teaching_style")
    op.drop_column("user_settings", "custom_tools")
    op.drop_column("user_settings", "teaching_tools")

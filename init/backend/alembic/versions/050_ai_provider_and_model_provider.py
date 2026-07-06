"""Add provider to admin_ai_model_settings + create ai_provider_credentials.

Revision ID: 050
Revises: 049
"""
from alembic import op
import sqlalchemy as sa

revision = "050"
down_revision = "049"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "admin_ai_model_settings",
        sa.Column("provider", sa.String(length=20), nullable=False, server_default="gemini"),
    )
    op.create_table(
        "ai_provider_credentials",
        sa.Column("provider", sa.String(length=20), primary_key=True),
        sa.Column("api_key", sa.Text(), nullable=True),
        sa.Column("base_url", sa.String(length=255), nullable=True),
        sa.Column("updated_by_admin_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ai_provider_credentials")
    op.drop_column("admin_ai_model_settings", "provider")

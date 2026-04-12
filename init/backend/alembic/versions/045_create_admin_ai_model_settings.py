"""Create admin AI model settings table

Revision ID: 045
Revises: 044
"""
from alembic import op
import sqlalchemy as sa


revision = "045"
down_revision = "044"


def upgrade() -> None:
    op.create_table(
        "admin_ai_model_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feature_key", sa.String(length=100), nullable=False),
        sa.Column("model_name", sa.String(length=64), nullable=False),
        sa.Column("updated_by_admin_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["updated_by_admin_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("feature_key", name="uq_admin_ai_model_settings_feature_key"),
    )
    op.create_index(
        "ix_admin_ai_model_settings_feature_key",
        "admin_ai_model_settings",
        ["feature_key"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_admin_ai_model_settings_feature_key", table_name="admin_ai_model_settings")
    op.drop_table("admin_ai_model_settings")

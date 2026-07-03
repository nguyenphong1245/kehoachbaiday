"""Create feature_flags table

Revision ID: 048
Revises: 047
"""
from alembic import op
import sqlalchemy as sa


revision = "048"
down_revision = "047"


def upgrade() -> None:
    op.create_table(
        "feature_flags",
        sa.Column("key", sa.String(length=50), nullable=False),
        sa.Column("enabled", sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column("config", sa.JSON(), nullable=True),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["updated_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("key"),
    )


def downgrade() -> None:
    op.drop_table("feature_flags")

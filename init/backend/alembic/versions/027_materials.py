"""add classroom_materials table

Revision ID: 027_add_classroom_materials
Revises: 026_add_peer_reviews
Create Date: 2026-02-03
"""
from alembic import op
import sqlalchemy as sa

revision = "027_materials"
down_revision = "026_peer_rev"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "classroom_materials",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("classroom_id", sa.Integer(), sa.ForeignKey("classrooms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("content_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("lesson_info", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_classroom_materials_classroom_id", "classroom_materials", ["classroom_id"])
    op.create_unique_constraint("uq_classroom_material", "classroom_materials", ["classroom_id", "content_type", "content_id"])


def downgrade() -> None:
    op.drop_table("classroom_materials")

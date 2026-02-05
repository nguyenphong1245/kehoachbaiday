"""add start_at, auto_peer_review, member_evaluations

Revision ID: 028_add_start_at_auto_review_evaluations
Revises: 027_add_classroom_materials
Create Date: 2026-02-03
"""
from alembic import op
import sqlalchemy as sa

revision = "028_auto_review"
down_revision = "027_materials"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ClassAssignment: start_at + auto_peer_review
    op.add_column(
        "class_assignments",
        sa.Column("start_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "class_assignments",
        sa.Column("auto_peer_review", sa.Boolean(), nullable=False, server_default="false"),
    )
    # GroupWorkSession: member_evaluations
    op.add_column(
        "group_work_sessions",
        sa.Column("member_evaluations", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("group_work_sessions", "member_evaluations")
    op.drop_column("class_assignments", "auto_peer_review")
    op.drop_column("class_assignments", "start_at")

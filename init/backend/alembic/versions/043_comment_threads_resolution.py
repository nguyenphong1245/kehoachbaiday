"""Add thread/reply and resolve fields for lesson_plan_comments

Revision ID: 043
Revises: 042
"""
from alembic import op
import sqlalchemy as sa

revision = "043"
down_revision = "042"


def upgrade() -> None:
    op.add_column(
        "lesson_plan_comments",
        sa.Column("parent_comment_id", sa.Integer(), nullable=True),
    )
    op.add_column(
        "lesson_plan_comments",
        sa.Column("is_resolved", sa.Boolean(), server_default="false", nullable=False),
    )
    op.add_column(
        "lesson_plan_comments",
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "lesson_plan_comments",
        sa.Column("resolved_by", sa.Integer(), nullable=True),
    )

    op.create_foreign_key(
        "fk_lesson_plan_comments_parent_comment_id",
        "lesson_plan_comments",
        "lesson_plan_comments",
        ["parent_comment_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_lesson_plan_comments_resolved_by",
        "lesson_plan_comments",
        "users",
        ["resolved_by"],
        ["id"],
        ondelete="SET NULL",
    )

    op.create_index(
        "ix_lesson_plan_comments_parent_comment_id",
        "lesson_plan_comments",
        ["parent_comment_id"],
    )
    op.create_index(
        "ix_lesson_plan_comments_plan_teacher_resolved",
        "lesson_plan_comments",
        ["lesson_plan_id", "teacher_id", "is_resolved"],
    )


def downgrade() -> None:
    op.drop_index("ix_lesson_plan_comments_plan_teacher_resolved", table_name="lesson_plan_comments")
    op.drop_index("ix_lesson_plan_comments_parent_comment_id", table_name="lesson_plan_comments")

    op.drop_constraint(
        "fk_lesson_plan_comments_resolved_by",
        "lesson_plan_comments",
        type_="foreignkey",
    )
    op.drop_constraint(
        "fk_lesson_plan_comments_parent_comment_id",
        "lesson_plan_comments",
        type_="foreignkey",
    )

    op.drop_column("lesson_plan_comments", "resolved_by")
    op.drop_column("lesson_plan_comments", "resolved_at")
    op.drop_column("lesson_plan_comments", "is_resolved")
    op.drop_column("lesson_plan_comments", "parent_comment_id")

"""add teacher_score and teacher_comment to submissions

Revision ID: 029_add_teacher_grading
Revises: 028_add_start_at_auto_review_evaluations
Create Date: 2026-02-03
"""
from alembic import op
import sqlalchemy as sa

revision = "029_grading"
down_revision = "028_auto_review"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IndividualSubmission: teacher_score + teacher_comment
    op.add_column(
        "individual_submissions",
        sa.Column("teacher_score", sa.Float(), nullable=True),
    )
    op.add_column(
        "individual_submissions",
        sa.Column("teacher_comment", sa.Text(), nullable=True),
    )
    # GroupWorkSession: teacher_score + teacher_comment
    op.add_column(
        "group_work_sessions",
        sa.Column("teacher_score", sa.Float(), nullable=True),
    )
    op.add_column(
        "group_work_sessions",
        sa.Column("teacher_comment", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("group_work_sessions", "teacher_comment")
    op.drop_column("group_work_sessions", "teacher_score")
    op.drop_column("individual_submissions", "teacher_comment")
    op.drop_column("individual_submissions", "teacher_score")

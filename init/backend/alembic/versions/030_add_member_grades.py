"""add member_grades to group_work_sessions

Revision ID: 030_add_member_grades
Revises: 029_add_teacher_grading
Create Date: 2026-02-03
"""
from alembic import op
import sqlalchemy as sa

revision = "030_add_member_grades"
down_revision = "029_add_teacher_grading"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "group_work_sessions",
        sa.Column("member_grades", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("group_work_sessions", "member_grades")

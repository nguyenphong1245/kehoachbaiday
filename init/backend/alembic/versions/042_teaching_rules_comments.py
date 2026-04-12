"""Add teaching_rules, lesson_plan_comments tables and applied_rules column

Revision ID: 042
Revises: 041
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "042"
down_revision = "041"


def upgrade() -> None:
    # --- teaching_rules ---
    op.create_table(
        "teaching_rules",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("teacher_id", sa.Integer(), nullable=False),
        sa.Column("rule_type", sa.String(20), nullable=False),
        sa.Column("lesson_id", sa.String(100), nullable=True),
        sa.Column("source_plan_id", sa.Integer(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("merged_from", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_plan_id"], ["saved_lesson_plans.id"], ondelete="SET NULL"),
        sa.CheckConstraint(
            "(rule_type = 'TEACHER_LESSON' AND lesson_id IS NOT NULL) OR "
            "(rule_type = 'TEACHER_GENERAL' AND lesson_id IS NULL)",
            name="ck_teaching_rules_type_scope",
        ),
    )
    op.create_index("ix_teaching_rules_teacher_type_active", "teaching_rules", ["teacher_id", "rule_type", "is_active"])

    # --- lesson_plan_comments ---
    op.create_table(
        "lesson_plan_comments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("lesson_plan_id", sa.Integer(), nullable=False),
        sa.Column("teacher_id", sa.Integer(), nullable=False),
        sa.Column("selected_text", sa.Text(), nullable=False),
        sa.Column("context_before", sa.String(200), nullable=True),
        sa.Column("context_after", sa.String(200), nullable=True),
        sa.Column("section_type", sa.String(50), nullable=True),
        sa.Column("comment_text", sa.Text(), nullable=False),
        sa.Column("rule_id", sa.Integer(), nullable=True),
        sa.Column("analysis_status", sa.String(20), server_default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["lesson_plan_id"], ["saved_lesson_plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["teacher_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["rule_id"], ["teaching_rules.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_lesson_plan_comments_plan_id", "lesson_plan_comments", ["lesson_plan_id"])

    # --- applied_rules column on saved_lesson_plans ---
    op.add_column("saved_lesson_plans", sa.Column("applied_rules", JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("saved_lesson_plans", "applied_rules")
    op.drop_index("ix_lesson_plan_comments_plan_id", table_name="lesson_plan_comments")
    op.drop_table("lesson_plan_comments")
    op.drop_index("ix_teaching_rules_teacher_type_active", table_name="teaching_rules")
    op.drop_table("teaching_rules")

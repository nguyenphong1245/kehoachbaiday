"""Create kg_lpv_jobs and kg_lpv_findings tables

Revision ID: 049
Revises: 048
"""
from alembic import op
import sqlalchemy as sa


revision = "049"
down_revision = "048"


def upgrade() -> None:
    op.create_table(
        "kg_lpv_jobs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("saved_lesson_plan_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="pending"),
        sa.Column("progress", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("segments", sa.JSON(), nullable=True),
        sa.Column("stats", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["saved_lesson_plan_id"], ["saved_lesson_plans.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_kg_lpv_jobs_user_id", "kg_lpv_jobs", ["user_id"])
    op.create_index("ix_kg_lpv_jobs_saved_lesson_plan_id", "kg_lpv_jobs", ["saved_lesson_plan_id"])

    op.create_table(
        "kg_lpv_findings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("job_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=4), nullable=False),
        sa.Column("branch", sa.String(length=2), nullable=False),
        sa.Column("truc", sa.SmallInteger(), nullable=True),
        sa.Column("section_id", sa.String(length=100), nullable=False),
        sa.Column("span", sa.JSON(), nullable=True),
        sa.Column("evidence", sa.JSON(), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("repair_diff", sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(["job_id"], ["kg_lpv_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_kg_lpv_findings_job_id", "kg_lpv_findings", ["job_id"])


def downgrade() -> None:
    op.drop_index("ix_kg_lpv_findings_job_id", table_name="kg_lpv_findings")
    op.drop_table("kg_lpv_findings")
    op.drop_index("ix_kg_lpv_jobs_saved_lesson_plan_id", table_name="kg_lpv_jobs")
    op.drop_index("ix_kg_lpv_jobs_user_id", table_name="kg_lpv_jobs")
    op.drop_table("kg_lpv_jobs")

"""Add submission_sessions table for student identity verification

Revision ID: 018
Revises: 017
"""
from alembic import op
import sqlalchemy as sa

revision = "018_add_submission_sessions"
down_revision = "017_add_security_columns"


def upgrade() -> None:
    op.create_table(
        "submission_sessions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_token", sa.String(64), nullable=False),
        sa.Column("share_code", sa.String(50), nullable=False),
        sa.Column("resource_type", sa.String(20), nullable=False),
        sa.Column("student_name", sa.String(200), nullable=False),
        sa.Column("student_class", sa.String(100), nullable=False),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_submission_sessions_session_token", "submission_sessions", ["session_token"], unique=True)
    op.create_index(
        "ix_submission_session_lookup",
        "submission_sessions",
        ["share_code", "resource_type", "student_name", "student_class"],
    )


def downgrade() -> None:
    op.drop_index("ix_submission_session_lookup", table_name="submission_sessions")
    op.drop_index("ix_submission_sessions_session_token", table_name="submission_sessions")
    op.drop_table("submission_sessions")

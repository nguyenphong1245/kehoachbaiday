"""Add chat_enabled, peer_review_duration to assignments and chat_disabled to work sessions

Revision ID: 040
Revises: 039
"""
from alembic import op
import sqlalchemy as sa

revision = "040"
down_revision = "039"


def upgrade() -> None:
    # Add chat_enabled to class_assignments
    op.add_column("class_assignments", sa.Column("chat_enabled", sa.Boolean(), server_default="true", nullable=False))
    # Add peer_review_duration to class_assignments
    op.add_column("class_assignments", sa.Column("peer_review_duration", sa.Integer(), nullable=True))
    # Add chat_disabled to group_work_sessions
    op.add_column("group_work_sessions", sa.Column("chat_disabled", sa.Boolean(), server_default="false", nullable=False))


def downgrade() -> None:
    op.drop_column("group_work_sessions", "chat_disabled")
    op.drop_column("class_assignments", "peer_review_duration")
    op.drop_column("class_assignments", "chat_enabled")

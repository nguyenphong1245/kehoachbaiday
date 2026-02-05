"""Ensure all assignment columns exist

Revision ID: 033_ensure_assignment_columns
Revises: 032_add_peer_review_times
Create Date: 2026-02-04

This migration ensures all required columns exist in class_assignments table.
It's safe to run multiple times - it will only add columns that don't exist.
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


revision = '033_ensure_assignment_columns'
down_revision = '032_add_peer_review_times'
branch_labels = None
depends_on = None


def column_exists(table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    return column_name in columns


def upgrade() -> None:
    # Ensure start_at column exists
    if not column_exists('class_assignments', 'start_at'):
        op.add_column('class_assignments',
            sa.Column('start_at', sa.DateTime(timezone=True), nullable=True)
        )

    # Ensure auto_peer_review column exists
    if not column_exists('class_assignments', 'auto_peer_review'):
        op.add_column('class_assignments',
            sa.Column('auto_peer_review', sa.Boolean(), nullable=False, server_default='false')
        )

    # Ensure peer_review_start_time column exists
    if not column_exists('class_assignments', 'peer_review_start_time'):
        op.add_column('class_assignments',
            sa.Column('peer_review_start_time', sa.DateTime(timezone=True), nullable=True)
        )

    # Ensure peer_review_end_time column exists
    if not column_exists('class_assignments', 'peer_review_end_time'):
        op.add_column('class_assignments',
            sa.Column('peer_review_end_time', sa.DateTime(timezone=True), nullable=True)
        )

    # Ensure member_evaluations column exists in group_work_sessions
    if not column_exists('group_work_sessions', 'member_evaluations'):
        op.add_column('group_work_sessions',
            sa.Column('member_evaluations', sa.JSON(), nullable=True)
        )

    # Ensure member_grades column exists in group_work_sessions
    if not column_exists('group_work_sessions', 'member_grades'):
        op.add_column('group_work_sessions',
            sa.Column('member_grades', sa.JSON(), nullable=True)
        )


def downgrade() -> None:
    # Don't remove columns on downgrade - they might contain data
    pass

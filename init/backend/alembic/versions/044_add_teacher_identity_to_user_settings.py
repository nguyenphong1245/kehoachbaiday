"""Add teacher identity fields to user_settings

Revision ID: 044
Revises: 043
"""
from alembic import op
import sqlalchemy as sa


revision = "044"
down_revision = "043"


def upgrade() -> None:
    op.add_column("user_settings", sa.Column("school_name", sa.String(length=255), nullable=True))
    op.add_column("user_settings", sa.Column("department_name", sa.String(length=255), nullable=True))
    op.add_column("user_settings", sa.Column("teacher_name", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("user_settings", "teacher_name")
    op.drop_column("user_settings", "department_name")
    op.drop_column("user_settings", "school_name")

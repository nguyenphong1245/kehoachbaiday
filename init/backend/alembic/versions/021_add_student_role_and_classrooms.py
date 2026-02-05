"""Add student role and classrooms table

Revision ID: 021
Revises: 020_add_teaching_preferences
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa

revision = '021_add_student_role_and_classrooms'
down_revision = '020_add_teaching_preferences'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Bảng classrooms - Lớp học
    op.create_table(
        'classrooms',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('teacher_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('grade', sa.String(20), nullable=True),
        sa.Column('school_year', sa.String(20), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_classrooms_teacher_id', 'classrooms', ['teacher_id'])


def downgrade() -> None:
    op.drop_index('ix_classrooms_teacher_id')
    op.drop_table('classrooms')

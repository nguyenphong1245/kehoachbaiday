"""Add class_assignments table

Revision ID: 024
Revises: 023_add_student_groups
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa

revision = '024_add_class_assignments'
down_revision = '023_add_student_groups'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'class_assignments',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('classroom_id', sa.Integer(), sa.ForeignKey('classrooms.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content_type', sa.String(20), nullable=False),
        sa.Column('content_id', sa.Integer(), nullable=False),
        sa.Column('lesson_plan_id', sa.Integer(), sa.ForeignKey('saved_lesson_plans.id', ondelete='SET NULL'), nullable=True),
        sa.Column('lesson_info', sa.JSON(), nullable=True),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('work_type', sa.String(20), nullable=False, server_default='individual'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('peer_review_status', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_class_assignments_classroom_id', 'class_assignments', ['classroom_id'])
    op.create_index('ix_class_assignments_content', 'class_assignments', ['content_type', 'content_id'])


def downgrade() -> None:
    op.drop_index('ix_class_assignments_content')
    op.drop_index('ix_class_assignments_classroom_id')
    op.drop_table('class_assignments')

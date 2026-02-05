"""Add group_work_sessions, individual_submissions, group_discussions tables

Revision ID: 025
Revises: 024_add_class_assignments
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa

revision = '025_add_work_sessions'
down_revision = '024_add_class_assignments'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Group work sessions
    op.create_table(
        'group_work_sessions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('assignment_id', sa.Integer(), sa.ForeignKey('class_assignments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('group_id', sa.Integer(), sa.ForeignKey('student_groups.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(20), server_default='in_progress'),
        sa.Column('answers', sa.JSON(), server_default='{}'),
        sa.Column('task_assignments', sa.JSON(), server_default='{}'),
        sa.Column('leader_id', sa.Integer(), sa.ForeignKey('class_students.id', ondelete='SET NULL'), nullable=True),
        sa.Column('leader_votes', sa.JSON(), server_default='{}'),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint('assignment_id', 'group_id', name='uq_work_session_assignment_group'),
    )

    # Individual submissions
    op.create_table(
        'individual_submissions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('assignment_id', sa.Integer(), sa.ForeignKey('class_assignments.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('class_students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('answers', sa.JSON(), server_default='{}'),
        sa.Column('status', sa.String(20), server_default='in_progress'),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint('assignment_id', 'student_id', name='uq_individual_submission_assignment_student'),
    )

    # Group discussions
    op.create_table(
        'group_discussions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('work_session_id', sa.Integer(), sa.ForeignKey('group_work_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_group_discussions_session_id', 'group_discussions', ['work_session_id'])


def downgrade() -> None:
    op.drop_index('ix_group_discussions_session_id')
    op.drop_table('group_discussions')
    op.drop_table('individual_submissions')
    op.drop_table('group_work_sessions')

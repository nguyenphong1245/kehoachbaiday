"""Add student_groups and group_members tables

Revision ID: 023
Revises: 022_add_class_students
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa

revision = '023_student_groups'
down_revision = '022_class_students'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Bảng nhóm học sinh
    op.create_table(
        'student_groups',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('classroom_id', sa.Integer(), sa.ForeignKey('classrooms.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_student_groups_classroom_id', 'student_groups', ['classroom_id'])

    # Bảng thành viên nhóm
    op.create_table(
        'group_members',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('group_id', sa.Integer(), sa.ForeignKey('student_groups.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', sa.Integer(), sa.ForeignKey('class_students.id', ondelete='CASCADE'), nullable=False),
        sa.UniqueConstraint('group_id', 'student_id', name='uq_group_members_group_student'),
    )
    op.create_index('ix_group_members_group_id', 'group_members', ['group_id'])
    op.create_index('ix_group_members_student_id', 'group_members', ['student_id'])


def downgrade() -> None:
    op.drop_index('ix_group_members_student_id')
    op.drop_index('ix_group_members_group_id')
    op.drop_table('group_members')
    op.drop_index('ix_student_groups_classroom_id')
    op.drop_table('student_groups')

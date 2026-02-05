"""Add class_students table

Revision ID: 022
Revises: 021_add_student_role_and_classrooms
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa

revision = '022_add_class_students'
down_revision = '021_add_student_role_and_classrooms'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'class_students',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('classroom_id', sa.Integer(), sa.ForeignKey('classrooms.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_code', sa.String(50), nullable=True),
        sa.Column('student_number', sa.Integer(), nullable=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('classroom_id', 'user_id', name='uq_class_students_classroom_user'),
        sa.UniqueConstraint('classroom_id', 'student_code', name='uq_class_students_classroom_code'),
    )
    op.create_index('ix_class_students_classroom_id', 'class_students', ['classroom_id'])
    op.create_index('ix_class_students_user_id', 'class_students', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_class_students_user_id')
    op.drop_index('ix_class_students_classroom_id')
    op.drop_table('class_students')

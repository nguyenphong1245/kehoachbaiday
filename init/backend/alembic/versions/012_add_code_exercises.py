"""Add code exercises tables

Revision ID: 012
Revises: 011
Create Date: 2026-01-31

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '012_add_code_exercises'
down_revision = '011_add_lesson_info_to_quiz'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create code_exercises table
    op.create_table(
        'code_exercises',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('share_code', sa.String(8), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('language', sa.String(50), server_default='python', nullable=False),
        sa.Column('problem_statement', sa.Text(), nullable=False),
        sa.Column('starter_code', sa.Text(), nullable=True),
        sa.Column('test_cases', sa.JSON(), nullable=False),
        sa.Column('time_limit_seconds', sa.Integer(), server_default='5', nullable=False),
        sa.Column('memory_limit_mb', sa.Integer(), server_default='128', nullable=False),
        sa.Column('lesson_info', sa.JSON(), nullable=True),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_code_exercises_id'), 'code_exercises', ['id'])
    op.create_index(op.f('ix_code_exercises_share_code'), 'code_exercises', ['share_code'], unique=True)

    # Create code_submissions table
    op.create_table(
        'code_submissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('student_name', sa.String(200), nullable=False),
        sa.Column('student_class', sa.String(100), nullable=False),
        sa.Column('student_group', sa.String(100), nullable=True),
        sa.Column('code', sa.Text(), nullable=False),
        sa.Column('language', sa.String(50), server_default='python', nullable=False),
        sa.Column('status', sa.String(50), server_default='pending', nullable=False),
        sa.Column('total_tests', sa.Integer(), server_default='0', nullable=False),
        sa.Column('passed_tests', sa.Integer(), server_default='0', nullable=False),
        sa.Column('test_results', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('execution_time_ms', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['exercise_id'], ['code_exercises.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_code_submissions_id'), 'code_submissions', ['id'])


def downgrade() -> None:
    op.drop_index(op.f('ix_code_submissions_id'), table_name='code_submissions')
    op.drop_table('code_submissions')
    op.drop_index(op.f('ix_code_exercises_share_code'), table_name='code_exercises')
    op.drop_index(op.f('ix_code_exercises_id'), table_name='code_exercises')
    op.drop_table('code_exercises')

"""Add code exercises tables

Revision ID: 011
Revises: 010
Create Date: 2026-01-08

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '011'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create shared_code_exercises table
    op.create_table(
        'shared_code_exercises',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('share_code', sa.String(8), nullable=False),
        sa.Column('exercise_type', sa.String(20), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('language', sa.String(20), server_default='python'),
        sa.Column('difficulty', sa.String(20), server_default='medium'),
        sa.Column('exercise_data', sa.JSON(), nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('lesson_plan_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1'),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['lesson_plan_id'], ['saved_lesson_plans.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_shared_code_exercises_share_code', 'shared_code_exercises', ['share_code'], unique=True)
    op.create_index('ix_shared_code_exercises_creator_id', 'shared_code_exercises', ['creator_id'])
    
    # Create code_exercise_submissions table
    op.create_table(
        'code_exercise_submissions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('exercise_id', sa.Integer(), nullable=False),
        sa.Column('student_name', sa.String(200), nullable=False),
        sa.Column('submitted_code', sa.Text(), nullable=True),
        sa.Column('submitted_order', sa.JSON(), nullable=True),
        sa.Column('score', sa.Integer(), server_default='0'),
        sa.Column('is_correct', sa.Boolean(), server_default='0'),
        sa.Column('test_results', sa.JSON(), nullable=True),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('execution_time_ms', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['exercise_id'], ['shared_code_exercises.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_code_exercise_submissions_exercise_id', 'code_exercise_submissions', ['exercise_id'])


def downgrade() -> None:
    op.drop_index('ix_code_exercise_submissions_exercise_id', 'code_exercise_submissions')
    op.drop_table('code_exercise_submissions')
    
    op.drop_index('ix_shared_code_exercises_creator_id', 'shared_code_exercises')
    op.drop_index('ix_shared_code_exercises_share_code', 'shared_code_exercises')
    op.drop_table('shared_code_exercises')

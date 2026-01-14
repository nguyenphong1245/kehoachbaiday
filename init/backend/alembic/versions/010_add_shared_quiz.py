"""Add shared quiz tables

Revision ID: 010
Revises: 009
Create Date: 2026-01-08

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '010'
down_revision = '009'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create shared_quizzes table
    op.create_table(
        'shared_quizzes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('share_code', sa.String(8), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('questions', sa.JSON(), nullable=False),
        sa.Column('total_questions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('time_limit', sa.Integer(), nullable=True),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), onupdate=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('expires_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('show_correct_answers', sa.Boolean(), server_default='0', nullable=False),
        sa.Column('allow_multiple_attempts', sa.Boolean(), server_default='0', nullable=False),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shared_quizzes_id'), 'shared_quizzes', ['id'])
    op.create_index(op.f('ix_shared_quizzes_share_code'), 'shared_quizzes', ['share_code'], unique=True)

    # Create quiz_responses table
    op.create_table(
        'quiz_responses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('quiz_id', sa.Integer(), nullable=False),
        sa.Column('student_name', sa.String(200), nullable=False),
        sa.Column('student_class', sa.String(100), nullable=False),
        sa.Column('student_email', sa.String(255), nullable=True),
        sa.Column('answers', sa.JSON(), nullable=False),
        sa.Column('score', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_correct', sa.Integer(), server_default='0', nullable=False),
        sa.Column('total_questions', sa.Integer(), server_default='0', nullable=False),
        sa.Column('submitted_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('time_spent', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['quiz_id'], ['shared_quizzes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_responses_id'), 'quiz_responses', ['id'])


def downgrade() -> None:
    op.drop_index(op.f('ix_quiz_responses_id'), table_name='quiz_responses')
    op.drop_table('quiz_responses')
    op.drop_index(op.f('ix_shared_quizzes_share_code'), table_name='shared_quizzes')
    op.drop_index(op.f('ix_shared_quizzes_id'), table_name='shared_quizzes')
    op.drop_table('shared_quizzes')

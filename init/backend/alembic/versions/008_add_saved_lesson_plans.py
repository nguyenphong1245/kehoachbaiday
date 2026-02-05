"""Add saved_lesson_plans table

Revision ID: 008
Revises: 005
Create Date: 2026-01-07
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008_add_saved_lesson_plans'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'saved_lesson_plans',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('book_type', sa.String(100), nullable=True),
        sa.Column('grade', sa.String(20), nullable=True),
        sa.Column('topic', sa.String(500), nullable=True),
        sa.Column('lesson_name', sa.String(500), nullable=True),
        sa.Column('lesson_id', sa.String(100), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('sections', sa.JSON(), nullable=True),
        sa.Column('generation_params', sa.JSON(), nullable=True),
        sa.Column('original_content', sa.Text(), nullable=True),
        sa.Column('is_printed', sa.Boolean(), default=False),
        sa.Column('print_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_saved_lesson_plans_id', 'saved_lesson_plans', ['id'])
    op.create_index('ix_saved_lesson_plans_user_id', 'saved_lesson_plans', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_saved_lesson_plans_user_id', table_name='saved_lesson_plans')
    op.drop_index('ix_saved_lesson_plans_id', table_name='saved_lesson_plans')
    op.drop_table('saved_lesson_plans')

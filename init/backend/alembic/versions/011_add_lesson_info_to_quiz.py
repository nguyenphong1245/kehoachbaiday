"""Add lesson_info to shared_quizzes

Revision ID: 011
Revises: 010
Create Date: 2026-01-30

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '011_add_lesson_info_to_quiz'
down_revision = '010_add_shared_quiz'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('shared_quizzes', sa.Column('lesson_info', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('shared_quizzes', 'lesson_info')

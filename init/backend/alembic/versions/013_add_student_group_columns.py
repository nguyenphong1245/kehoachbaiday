"""Add student_group columns to quiz_responses and worksheet_responses

Revision ID: 013
Revises: 012
Create Date: 2026-01-31

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '013_add_student_group_columns'
down_revision = '012_add_code_exercises'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('quiz_responses', sa.Column('student_group', sa.String(100), nullable=True))
    op.add_column('worksheet_responses', sa.Column('student_group', sa.String(50), nullable=True))


def downgrade() -> None:
    op.drop_column('worksheet_responses', 'student_group')
    op.drop_column('quiz_responses', 'student_group')

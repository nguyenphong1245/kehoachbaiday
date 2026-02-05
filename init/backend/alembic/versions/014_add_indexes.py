"""Add indexes for share_code, user_id, email columns

Revision ID: 014
Revises: 013
Create Date: 2026-01-31

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = '014_add_indexes'
down_revision = '013_add_student_group_columns'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users email index (for login lookup)
    op.create_index('ix_users_email', 'users', ['email'], unique=True, if_not_exists=True)

    # Shared worksheets indexes
    op.create_index('ix_shared_worksheets_share_code', 'shared_worksheets', ['share_code'], unique=True, if_not_exists=True)

    # Quiz responses - lookup by quiz_id
    op.create_index('ix_quiz_responses_quiz_id', 'quiz_responses', ['quiz_id'], if_not_exists=True)

    # Code exercises - creator lookup
    op.create_index('ix_code_exercises_creator_id', 'code_exercises', ['creator_id'], if_not_exists=True)

    # Code submissions - exercise lookup
    op.create_index('ix_code_submissions_exercise_id', 'code_submissions', ['exercise_id'], if_not_exists=True)


def downgrade() -> None:
    op.drop_index('ix_code_submissions_exercise_id', table_name='code_submissions', if_exists=True)
    op.drop_index('ix_code_exercises_creator_id', table_name='code_exercises', if_exists=True)
    op.drop_index('ix_quiz_responses_quiz_id', table_name='quiz_responses', if_exists=True)
    op.drop_index('ix_shared_worksheets_share_code', table_name='shared_worksheets', if_exists=True)
    op.drop_index('ix_users_email', table_name='users', if_exists=True)

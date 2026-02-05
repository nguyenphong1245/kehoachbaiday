"""add peer review times

Revision ID: 032_add_peer_review_times
Revises: 010_add_shared_quiz
Create Date: 2026-02-04 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '032_pr_times'
down_revision = '031_audit'
branch_labels = None
depends_on = None


def upgrade():
    # Add peer review time columns to class_assignments table
    op.add_column('class_assignments',
        sa.Column('peer_review_start_time', sa.DateTime(timezone=True), nullable=True)
    )
    op.add_column('class_assignments',
        sa.Column('peer_review_end_time', sa.DateTime(timezone=True), nullable=True)
    )


def downgrade():
    # Remove peer review time columns
    op.drop_column('class_assignments', 'peer_review_end_time')
    op.drop_column('class_assignments', 'peer_review_start_time')

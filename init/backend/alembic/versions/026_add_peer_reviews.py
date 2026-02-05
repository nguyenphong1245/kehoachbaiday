"""Add peer_review_rounds and peer_reviews tables

Revision ID: 026
Revises: 025_add_work_sessions
Create Date: 2026-02-02
"""
from alembic import op
import sqlalchemy as sa

revision = '026_add_peer_reviews'
down_revision = '025_add_work_sessions'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'peer_review_rounds',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('assignment_id', sa.Integer(), sa.ForeignKey('class_assignments.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('pairings', sa.JSON(), server_default='[]'),
        sa.Column('activated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        'peer_reviews',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('round_id', sa.Integer(), sa.ForeignKey('peer_review_rounds.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reviewer_id', sa.Integer(), nullable=False),
        sa.Column('reviewee_id', sa.Integer(), nullable=False),
        sa.Column('reviewer_type', sa.String(20), nullable=False),
        sa.Column('reviewer_user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('comments', sa.JSON(), server_default='{}'),
        sa.Column('score', sa.Integer(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_peer_reviews_round_id', 'peer_reviews', ['round_id'])


def downgrade() -> None:
    op.drop_index('ix_peer_reviews_round_id')
    op.drop_table('peer_reviews')
    op.drop_table('peer_review_rounds')

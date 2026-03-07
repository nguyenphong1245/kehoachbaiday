"""Add member_scores, member_comments to peer_reviews, change score to Float

Revision ID: 041
Revises: 040
"""
from alembic import op
import sqlalchemy as sa

revision = "041"
down_revision = "040"


def upgrade() -> None:
    # Change score from Integer to Float (for 0.5 step and averages)
    op.alter_column(
        "peer_reviews",
        "score",
        existing_type=sa.Integer(),
        type_=sa.Float(),
        existing_nullable=True,
    )
    # Add member_scores JSON: {"user_id": score, ...}
    op.add_column(
        "peer_reviews",
        sa.Column("member_scores", sa.JSON(), server_default="{}", nullable=True),
    )
    # Add member_comments JSON: {"user_id": {"key": "comment"}, ...}
    op.add_column(
        "peer_reviews",
        sa.Column("member_comments", sa.JSON(), server_default="{}", nullable=True),
    )


def downgrade() -> None:
    op.drop_column("peer_reviews", "member_comments")
    op.drop_column("peer_reviews", "member_scores")
    op.alter_column(
        "peer_reviews",
        "score",
        existing_type=sa.Float(),
        type_=sa.Integer(),
        existing_nullable=True,
    )

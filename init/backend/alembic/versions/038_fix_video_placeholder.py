"""Fix video guide card placeholder URL

Revision ID: 038_fix_video_placeholder
Revises: 037_guide_cards_markdown
Create Date: 2026-03-02
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "038_fix_video_placeholder"
down_revision = "037_guide_cards_markdown"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    # Clear placeholder video URL that shows YouTube error
    conn.execute(
        sa.text(
            "UPDATE guide_cards SET video_url = NULL "
            "WHERE card_key = 'video' AND video_url LIKE '%VIDEO_ID%'"
        )
    )


def downgrade() -> None:
    pass

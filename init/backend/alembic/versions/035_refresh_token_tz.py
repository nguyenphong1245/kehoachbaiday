"""Make refresh_tokens datetime columns timezone-aware

Revision ID: 035_refresh_token_tz
Revises: 034_tokens
Create Date: 2026-02-26
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "035_refresh_token_tz"
down_revision = "034_tokens"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "refresh_tokens",
        "expires_at",
        type_=sa.DateTime(timezone=True),
        existing_type=sa.DateTime(),
        existing_nullable=False,
        postgresql_using="expires_at AT TIME ZONE 'UTC'",
    )
    op.alter_column(
        "refresh_tokens",
        "created_at",
        type_=sa.DateTime(timezone=True),
        existing_type=sa.DateTime(),
        existing_nullable=True,
        server_default=sa.func.now(),
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    op.alter_column(
        "refresh_tokens",
        "expires_at",
        type_=sa.DateTime(),
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=False,
    )
    op.alter_column(
        "refresh_tokens",
        "created_at",
        type_=sa.DateTime(),
        existing_type=sa.DateTime(timezone=True),
        existing_nullable=True,
    )

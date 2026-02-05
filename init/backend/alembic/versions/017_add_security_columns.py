"""Add security columns: token attempts, account lockout

Revision ID: 017
Revises: 016
"""
from alembic import op
import sqlalchemy as sa

revision = "017_add_security_columns"
down_revision = "016_add_performance_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Token attempt tracking (brute force protection)
    op.add_column("email_verification_tokens", sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("password_reset_tokens", sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"))

    # Account lockout
    op.add_column("users", sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("users", sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "locked_until")
    op.drop_column("users", "failed_login_attempts")
    op.drop_column("password_reset_tokens", "attempts")
    op.drop_column("email_verification_tokens", "attempts")

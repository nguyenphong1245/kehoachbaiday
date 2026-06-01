"""Drop user_profiles table and remove theme/language from user_settings.

Revision ID: 047
Revises: 046
"""

from alembic import op
import sqlalchemy as sa


revision = "047"
down_revision = "046"


def upgrade() -> None:
    op.execute(sa.text("DROP TABLE IF EXISTS user_profiles CASCADE"))
    op.drop_column("user_settings", "theme")
    op.drop_column("user_settings", "language")


def downgrade() -> None:
    op.add_column(
        "user_settings",
        sa.Column("language", sa.String(10), nullable=False, server_default="en"),
    )
    op.add_column(
        "user_settings",
        sa.Column("theme", sa.String(20), nullable=False, server_default="system"),
    )

    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "user_profiles" not in inspector.get_table_names():
        op.create_table(
            "user_profiles",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_id", sa.Integer(), nullable=False),
            sa.Column("first_name", sa.String(100), nullable=True),
            sa.Column("last_name", sa.String(100), nullable=True),
            sa.Column("bio", sa.Text(), nullable=True),
            sa.Column("avatar_url", sa.String(255), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.UniqueConstraint("user_id"),
        )

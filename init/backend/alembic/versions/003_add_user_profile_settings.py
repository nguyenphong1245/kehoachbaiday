"""add user profile and settings tables"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=True),
        sa.Column("last_name", sa.String(length=100), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("avatar_url", sa.String(length=255), nullable=True),
    )
    op.create_index("ix_user_profiles_id", "user_profiles", ["id"], unique=False)

    op.create_table(
        "user_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("theme", sa.String(length=20), nullable=False, server_default="system"),
        sa.Column("language", sa.String(length=10), nullable=False, server_default="en"),
        sa.Column("marketing_emails_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("push_notifications_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("timezone", sa.String(length=50), nullable=True),
    )
    op.create_index("ix_user_settings_id", "user_settings", ["id"], unique=False)

    bind = op.get_bind()
    users_table = sa.table("users", sa.column("id", sa.Integer()))
    profiles_table = sa.table("user_profiles", sa.column("user_id", sa.Integer()))
    settings_table = sa.table("user_settings", sa.column("user_id", sa.Integer()))

    user_ids = [row.id for row in bind.execute(sa.select(users_table.c.id))]
    for user_id in user_ids:
        bind.execute(sa.insert(profiles_table).values(user_id=user_id))
        bind.execute(sa.insert(settings_table).values(user_id=user_id))


def downgrade() -> None:
    op.drop_index("ix_user_settings_id", table_name="user_settings")
    op.drop_table("user_settings")
    op.drop_index("ix_user_profiles_id", table_name="user_profiles")
    op.drop_table("user_profiles")

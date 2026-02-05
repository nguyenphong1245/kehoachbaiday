"""add chat conversations and messages tables"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create chat_conversations table
    op.create_table(
        "chat_conversations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("is_archived", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_chat_conversations_user_id", "chat_conversations", ["user_id"], unique=False)

    # Create chat_messages table
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("conversation_id", sa.String(), sa.ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.Enum("user", "assistant", "system", name="messagerole"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_chat_messages_conversation_id", "chat_messages", ["conversation_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_chat_messages_conversation_id", table_name="chat_messages")
    op.drop_table("chat_messages")
    op.execute("DROP TYPE IF EXISTS messagerole")

    op.drop_index("ix_chat_conversations_user_id", table_name="chat_conversations")
    op.drop_table("chat_conversations")

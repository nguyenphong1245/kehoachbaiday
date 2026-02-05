"""Add performance indexes for concurrent access

Revision ID: 016
Revises: 015
"""
from alembic import op

revision = "016_add_performance_indexes"
down_revision = "015_add_token_balance"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Chat conversations - sort by updated_at (user_id index already in 005)
    op.create_index("ix_chat_conversations_updated_at", "chat_conversations", ["updated_at"])

    # Chat messages - sort by created_at (conversation_id index already in 005)
    op.create_index("ix_chat_messages_created_at", "chat_messages", ["created_at"])

    # Shared quizzes - query by creator_id (share_code index already in 010)
    op.create_index("ix_shared_quizzes_creator_id", "shared_quizzes", ["creator_id"])


def downgrade() -> None:
    op.drop_index("ix_shared_quizzes_creator_id")
    op.drop_index("ix_chat_messages_created_at")
    op.drop_index("ix_chat_conversations_updated_at")

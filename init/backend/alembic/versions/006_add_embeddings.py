"""add embedding column to documents table for semantic search"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "006"
down_revision = "005b"  # Depends on categories/documents tables
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add embedding column to documents table for storing vector embeddings"""
    op.add_column(
        "documents",
        sa.Column("embedding", sa.Text(), nullable=True)  # Store JSON array of floats
    )


def downgrade() -> None:
    """Remove embedding column from documents table"""
    op.drop_column("documents", "embedding")

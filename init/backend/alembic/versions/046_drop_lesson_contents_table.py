"""Drop unused lesson_contents table.

Revision ID: 046
Revises: 045
"""

from alembic import op
import sqlalchemy as sa


revision = "046"
down_revision = "045"


def upgrade() -> None:
    # lesson_contents is no longer used by the lesson generation flow.
    op.execute(sa.text("DROP TABLE IF EXISTS lesson_contents CASCADE"))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "lesson_contents" in inspector.get_table_names():
        return

    op.create_table(
        "lesson_contents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("neo4j_lesson_id", sa.String(length=100), nullable=False),
        sa.Column("lesson_name", sa.String(length=255), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_lesson_contents_neo4j_lesson_id",
        "lesson_contents",
        ["neo4j_lesson_id"],
        unique=True,
    )
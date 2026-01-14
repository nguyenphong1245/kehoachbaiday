"""Add shared worksheets tables

Revision ID: 009
Revises: 008
Create Date: 2026-01-07

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Bảng phiếu học tập đã chia sẻ
    op.create_table(
        'shared_worksheets',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('share_code', sa.String(32), unique=True, nullable=False, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),  # Markdown content của phiếu
        sa.Column('lesson_info', sa.JSON, nullable=True),  # Thông tin bài học
        sa.Column('questions', sa.JSON, nullable=True),  # Cấu trúc câu hỏi đã parse
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('max_submissions', sa.Integer(), nullable=True),  # Giới hạn số lượt submit
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Bảng câu trả lời của học sinh
    op.create_table(
        'worksheet_responses',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('worksheet_id', sa.Integer(), sa.ForeignKey('shared_worksheets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_name', sa.String(255), nullable=False),
        sa.Column('student_class', sa.String(50), nullable=True),  # Lớp
        sa.Column('answers', sa.JSON, nullable=False),  # Câu trả lời dạng JSON
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('ip_address', sa.String(50), nullable=True),
    )
    
    # Index
    op.create_index('ix_worksheet_responses_worksheet_id', 'worksheet_responses', ['worksheet_id'])
    op.create_index('ix_shared_worksheets_user_id', 'shared_worksheets', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_worksheet_responses_worksheet_id')
    op.drop_index('ix_shared_worksheets_user_id')
    op.drop_table('worksheet_responses')
    op.drop_table('shared_worksheets')

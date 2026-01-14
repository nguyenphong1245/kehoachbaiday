"""
Alembic migration: Tạo bảng lesson_contents để lưu nội dung markdown
Liên kết với Neo4j qua neo4j_lesson_id
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '013_lesson_contents'
down_revision = '012_add_lesson_content'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Xóa bảng cũ nếu có
    op.execute("DROP TABLE IF EXISTS lesson_contents")
    
    # Tạo bảng mới
    op.create_table(
        'lesson_contents',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('neo4j_lesson_id', sa.String(50), nullable=False, unique=True, index=True,
                  comment='ID liên kết với BaiHoc.id trong Neo4j (VD: KNTT_10_BAI_01)'),
        sa.Column('lesson_name', sa.String(500), nullable=False,
                  comment='Tên bài học'),
        sa.Column('book_type', sa.String(100), nullable=True,
                  comment='Loại sách: KNTT, CD, CTST'),
        sa.Column('grade', sa.String(10), nullable=True,
                  comment='Lớp: 10, 11, 12'),
        sa.Column('content', sa.Text(), nullable=True,
                  comment='Nội dung markdown của bài học'),
        sa.Column('file_path', sa.String(500), nullable=True,
                  comment='Đường dẫn file markdown gốc'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Tạo index cho tìm kiếm nhanh
    op.create_index('ix_lesson_contents_book_grade', 'lesson_contents', ['book_type', 'grade'])


def downgrade() -> None:
    op.drop_index('ix_lesson_contents_book_grade')
    op.drop_table('lesson_contents')

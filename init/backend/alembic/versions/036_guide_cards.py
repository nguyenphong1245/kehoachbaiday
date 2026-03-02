"""Create guide_cards table and seed initial content

Revision ID: 036_guide_cards
Revises: 035_refresh_token_tz
Create Date: 2026-03-01
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "036_guide_cards"
down_revision = "035_refresh_token_tz"
branch_labels = None
depends_on = None


# ── seed data ───────────────────────────────────────────────────────
CARDS = [
    {
        "card_key": "features",
        "icon_name": "FileText",
        "color": "bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800",
        "icon_color": "text-sky-600 dark:text-sky-400",
        "title": "Tổng quan tính năng",
        "description": "Danh sách chức năng hệ thống",
        "sort_order": 0,
        "is_active": True,
        "content_html": (
            '<p>Hệ thống hỗ trợ giáo viên Tin học soạn Kế hoạch bài dạy (KHBD) theo chương trình GDPT 2018 với các tính năng chính:</p>'
            '<ul>'
            '<li><strong>Soạn KHBD bằng AI</strong> – Tạo kế hoạch bài dạy tự động theo chuẩn, cấu hình phương pháp, kỹ thuật dạy học và năng lực số</li>'
            '<li><strong>Chỉnh sửa KHBD</strong> – Sửa trực tiếp trong trình soạn thảo, lưu lại</li>'
            '<li><strong>Quản lý KHBD đã lưu</strong> – Xem lại, chỉnh sửa, xuất PDF/Word, xóa</li>'
            '<li><strong>Tạo học liệu tự động</strong> – AI tạo kèm KHBD: phiếu học tập, trắc nghiệm, bài tập code, sơ đồ tư duy (khi chọn kỹ thuật tương ứng)</li>'
            '<li><strong>Chấm điểm tự động</strong> – Quiz chấm tự động, bài tập code chạy test case tự động</li>'
            '<li><strong>Quản lý lớp học</strong> – Tạo lớp, thêm học sinh (thủ công hoặc CSV/Excel), chia nhóm</li>'
            '<li><strong>Giao bài tập</strong> – Giao học liệu cho học sinh, hỗ trợ cá nhân và nhóm</li>'
            '<li><strong>Làm bài nhóm cộng tác</strong> – Chỉnh sửa đồng thời, chat nhóm thời gian thực</li>'
            '<li><strong>Đánh giá đồng đẳng</strong> – Học sinh đánh giá chéo bài nhau, nhận xét và chấm điểm</li>'
            '<li><strong>Đánh giá thành viên nhóm</strong> – Học sinh đánh giá các thành viên trong nhóm</li>'
            '<li><strong>Thống kê lớp học</strong> – Tỷ lệ nộp bài, điểm trung bình, xếp hạng học sinh</li>'
            '<li><strong>Cài đặt tài khoản</strong> – Thiết bị dạy học, phong cách giảng dạy, đổi mật khẩu</li>'
            '</ul>'
        ),
    },
    {
        "card_key": "khbd-process",
        "icon_name": "Sparkles",
        "color": "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
        "icon_color": "text-amber-600 dark:text-amber-400",
        "title": "Soạn & chỉnh sửa KHBD",
        "description": "Quy trình 3 bước tạo KHBD",
        "sort_order": 1,
        "is_active": True,
        "content_html": (
            '<h4>Bước 1: Chọn bài học</h4>'
            '<div class="guide-step"><span class="step-num">1</span><div><p class="step-title">Chọn khối lớp</p><div class="step-body">Thanh bên trái, chọn khối <strong>10</strong>, <strong>11</strong> hoặc <strong>12</strong>.</div></div></div>'
            '<div class="guide-step"><span class="step-num">2</span><div><p class="step-title">Chọn chủ đề</p><div class="step-body">Danh sách chủ đề hiển thị theo chương trình. Nhấn vào chủ đề muốn soạn.</div></div></div>'
            '<div class="guide-step"><span class="step-num">3</span><div><p class="step-title">Chọn bài học</p><div class="step-body">Chọn bài học cụ thể muốn soạn.</div></div></div>'

            '<h4>Bước 2: Cấu hình</h4>'
            '<p>Hệ thống có 4 hoạt động theo chuẩn KHBD: <strong>Khởi động</strong>, <strong>Hình thành kiến thức</strong>, <strong>Luyện tập</strong>, <strong>Vận dụng</strong>.</p>'
            '<p>Với mỗi hoạt động, cấu hình:</p>'
            '<ul>'
            '<li><strong>Phương pháp dạy học</strong>: Hợp tác, Giải quyết vấn đề, Khám phá, Trò chơi, Thảo luận nhóm...</li>'
            '<li><strong>Kỹ thuật dạy học</strong>: Think-Pair-Share, Jigsaw, KWL, Brainstorming, Sơ đồ tư duy...</li>'
            '<li><strong>Địa điểm</strong>: Phòng học hoặc Phòng máy tính (cấu hình cho Khởi động + Hình thành kiến thức, và Luyện tập + Vận dụng)</li>'
            '<li><strong>Yêu cầu riêng</strong>: Ghi thêm yêu cầu đặc biệt cho từng hoạt động</li>'
            '</ul>'
            '<p>Cấu hình chung cho toàn bài:</p>'
            '<ul>'
            '<li><strong>Chỉ báo Năng lực số (NLS)</strong>: Chọn theo miền năng lực → năng lực thành phần → chỉ báo</li>'
            '</ul>'

            '<h4>Bước 3: Tạo &amp; chỉnh sửa</h4>'
            '<div class="guide-step"><span class="step-num">4</span><div><p class="step-title">Nhấn Tạo KHBD</p><div class="step-body">AI tạo kế hoạch bài dạy hoàn chỉnh. Tiến trình hiển thị theo thời gian thực.</div></div></div>'
            '<div class="guide-step"><span class="step-num">5</span><div><p class="step-title">Xem kết quả</p><div class="step-body">KHBD gồm: Mục tiêu, Thiết bị &amp; học liệu, nội dung 4 hoạt động. Có thể kèm câu hỏi trắc nghiệm, phiếu học tập. Nếu chọn kỹ thuật <strong>Sơ đồ tư duy</strong> thì KHBD sẽ kèm sơ đồ tư duy.</div></div></div>'
            '<div class="guide-step"><span class="step-num">6</span><div><p class="step-title">Chỉnh sửa trực tiếp</p><div class="step-body">Nhấn vào nội dung để sửa trực tiếp trong trình soạn thảo.</div></div></div>'
            '<div class="guide-step"><span class="step-num">7</span><div><p class="step-title">Lưu KHBD</p><div class="step-body">Nhấn <strong>Lưu</strong> với tên tùy chỉnh. Xem lại tại mục <strong>KHBD đã lưu</strong>.</div></div></div>'

            '<h4>Quản lý KHBD đã lưu</h4>'
            '<ul>'
            '<li>Tìm kiếm theo tên bài học</li>'
            '<li>Nhấn vào KHBD để xem, chỉnh sửa và lưu lại</li>'
            '<li>Xuất ra <strong>PDF</strong> hoặc <strong>Word</strong></li>'
            '<li>Xóa KHBD không cần thiết</li>'
            '</ul>'

            '<div class="guide-tip"><strong>Lưu ý:</strong> Hãy cấu hình <strong>Thiết bị dạy học</strong> và <strong>Phong cách dạy học</strong> trong cài đặt tài khoản trước khi tạo KHBD. AI sẽ tự động tham khảo để tạo nội dung phù hợp.</div>'
        ),
    },
    {
        "card_key": "materials",
        "icon_name": "FileText",
        "color": "bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-800",
        "icon_color": "text-violet-600 dark:text-violet-400",
        "title": "Chỉnh sửa học liệu",
        "description": "Sửa quiz, phiếu HT, code",
        "sort_order": 2,
        "is_active": True,
        "content_html": (
            '<p>Học liệu được AI tạo tự động kèm KHBD. Giáo viên có thể chỉnh sửa nội dung trước khi giao cho học sinh.</p>'

            '<div class="guide-step"><span class="step-num">1</span><div><p class="step-title">Mở trang Quản lý</p><div class="step-body">Tại trang <strong>Kế hoạch bài dạy</strong>, nhấn <strong>Quản lý lớp &amp; học liệu</strong> trên thanh điều hướng phía trên.</div></div></div>'
            '<div class="guide-step"><span class="step-num">2</span><div><p class="step-title">Chọn Quản lý học liệu</p><div class="step-body">Tại thanh bên trái, nhấn <strong>Quản lý học liệu</strong>. Trang hiển thị 3 tab: <strong>Phiếu học tập</strong>, <strong>Trắc nghiệm</strong>, <strong>Bài tập code</strong>.</div></div></div>'
            '<div class="guide-step"><span class="step-num">3</span><div><p class="step-title">Tìm học liệu cần sửa</p><div class="step-body">Chọn tab loại học liệu. Học liệu được nhóm theo bài học — nhấn vào tên bài để mở rộng.</div></div></div>'
            '<div class="guide-step"><span class="step-num">4</span><div><p class="step-title">Nhấn nút sửa</p><div class="step-body">Mỗi học liệu có các nút: <strong>Sửa</strong> (bút chì), <strong>Chuyển vào lớp</strong>, <strong>Xóa</strong>.</div></div></div>'

            '<h4>Sửa trắc nghiệm (Quiz)</h4>'
            '<ul>'
            '<li>Modal hiện ra với tiêu đề và danh sách câu hỏi</li>'
            '<li>Sửa nội dung câu hỏi, 4 đáp án (A/B/C/D)</li>'
            '<li>Nhấn vào đáp án để đặt làm <strong>đáp án đúng</strong> (hiển thị màu xanh)</li>'
            '<li>Nhấn <strong>Lưu</strong> để cập nhật</li>'
            '</ul>'

            '<h4>Sửa phiếu học tập (Worksheet)</h4>'
            '<ul>'
            '<li>Modal hiện ra với tiêu đề và trình soạn thảo Markdown</li>'
            '<li>Bên trái: soạn nội dung — Bên phải: xem trước kết quả</li>'
            '<li>Nhấn <strong>Lưu</strong> để cập nhật</li>'
            '</ul>'

            '<h4>Sửa bài tập code (Code Exercise)</h4>'
            '<ul>'
            '<li>Nhấn vào bài tập code sẽ mở trang chỉnh sửa trong tab mới</li>'
            '</ul>'

            '<div class="guide-tip"><strong>Lưu ý:</strong> Sau khi chỉnh sửa xong, nhấn nút <strong>Chuyển vào lớp</strong> để đưa học liệu vào lớp. Sau đó vào lớp học → tab <strong>Học liệu</strong> → nhấn nút <strong>Giao</strong> ở cột <strong>Danh sách học liệu</strong> bên phải để giao bài cho học sinh.</div>'
        ),
    },
    {
        "card_key": "classroom",
        "icon_name": "Users",
        "color": "bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800",
        "icon_color": "text-teal-600 dark:text-teal-400",
        "title": "Tạo lớp & chia nhóm",
        "description": "Tạo lớp, thêm HS, phân nhóm",
        "sort_order": 3,
        "is_active": True,
        "content_html": (
            '<h4>Tạo lớp học</h4>'
            '<div class="guide-step"><span class="step-num">1</span><div><p class="step-title">Mở trang Quản lý</p><div class="step-body">Tại trang <strong>Kế hoạch bài dạy</strong>, nhấn <strong>Quản lý lớp &amp; học liệu</strong> trên thanh điều hướng. Chọn <strong>Quản lý lớp học</strong> ở thanh bên trái.</div></div></div>'
            '<div class="guide-step"><span class="step-num">2</span><div><p class="step-title">Tạo lớp mới</p><div class="step-body">Nhấn nút <strong>+ Tạo lớp mới</strong> (góc phải). Nhập tên lớp (VD: 10A1), chọn khối và năm học.</div></div></div>'
            '<div class="guide-step"><span class="step-num">3</span><div><p class="step-title">Thêm học sinh</p><div class="step-body">Sau khi tạo lớp, thêm học sinh bằng 2 cách:<ul><li><strong>Upload danh sách</strong>: Tải lên file Excel/CSV (cột: Họ tên, Ngày sinh DD/MM/YYYY)</li><li><strong>Thêm thủ công</strong>: Nhập họ tên và ngày sinh từng học sinh</li></ul></div></div></div>'
            '<div class="guide-step"><span class="step-num">4</span><div><p class="step-title">Phát thông tin đăng nhập</p><div class="step-body">Hệ thống tự tạo tài khoản cho mỗi học sinh. Tại tab <strong>Học sinh</strong>, nhấn <strong>Copy TK</strong> để sao chép tài khoản và mật khẩu, phát cho học sinh.</div></div></div>'

            '<h4>Chia nhóm</h4>'
            '<div class="guide-step"><span class="step-num">5</span><div><p class="step-title">Chia nhóm tự động</p><div class="step-body">Chọn tab <strong>Nhóm</strong> trong lớp → nhấn <strong>Chia nhóm tự động</strong>. Nhập số nhóm, chọn cách chia (<strong>theo thứ tự</strong> hoặc <strong>ngẫu nhiên</strong>).</div></div></div>'
            '<div class="guide-step"><span class="step-num">6</span><div><p class="step-title">Hoặc tạo nhóm thủ công</p><div class="step-body">Nhấn <strong>Tạo nhóm thủ công</strong> → chọn tên nhóm và chọn thành viên từ danh sách học sinh.</div></div></div>'

            '<div class="guide-tip"><strong>Lưu ý:</strong> Học sinh đăng nhập bằng <strong>tài khoản</strong> và <strong>mật khẩu</strong> do hệ thống tạo (mật khẩu mặc định là ngày tháng năm sinh). Khi làm bài nhóm, học sinh tự bầu nhóm trưởng — nhóm trưởng có quyền nộp bài thay cho cả nhóm.</div>'
        ),
    },
    {
        "card_key": "assignment",
        "icon_name": "Share2",
        "color": "bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800",
        "icon_color": "text-indigo-600 dark:text-indigo-400",
        "title": "Giao bài tập",
        "description": "Giao học liệu cho học sinh",
        "sort_order": 4,
        "is_active": True,
        "content_html": (
            '<p>Học liệu cần được <strong>chuyển vào lớp</strong> trước (từ trang Quản lý học liệu), sau đó mới giao cho học sinh.</p>'

            '<div class="guide-step"><span class="step-num">1</span><div><p class="step-title">Vào lớp học</p><div class="step-body">Tại trang <strong>Quản lý lớp học</strong>, nhấn vào lớp muốn giao bài → chọn tab <strong>Học liệu</strong>.</div></div></div>'
            '<div class="guide-step"><span class="step-num">2</span><div><p class="step-title">Chọn học liệu muốn giao</p><div class="step-body">Cột bên phải <strong>Danh sách học liệu</strong> hiển thị các học liệu đã chuyển vào lớp. Nhấn nút <strong>Giao</strong> trên học liệu muốn giao.</div></div></div>'
            '<div class="guide-step"><span class="step-num">3</span><div><p class="step-title">Cấu hình bài tập</p><div class="step-body">Form mở ra với các trường:<ul><li><strong>Tiêu đề</strong> (tự điền sẵn tên học liệu)</li><li><strong>Mô tả</strong> (tùy chọn)</li><li><strong>Giờ bắt đầu</strong> và <strong>Hạn nộp</strong></li><li>Hình thức: <strong>Cá nhân</strong> hoặc <strong>Nhóm</strong></li><li><strong>Tráo bài tự động</strong> (đánh giá đồng đẳng)</li></ul></div></div></div>'
            '<div class="guide-step"><span class="step-num">4</span><div><p class="step-title">Nhấn Giao bài</p><div class="step-body">Bài tập chuyển sang cột trái <strong>Bài đã giao</strong>. Học sinh sẽ nhìn thấy bài tập trên trang cá nhân.</div></div></div>'

            '<div class="guide-tip"><strong>Lưu ý:</strong> Với bài tập nhóm, học sinh có thể <strong>làm việc cộng tác thời gian thực</strong> (chỉnh sửa đồng thời, chat nhóm). Nhóm trưởng có thể nộp bài thay cho cả nhóm.</div>'
        ),
    },
    {
        "card_key": "grading",
        "icon_name": "ClipboardCheck",
        "color": "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
        "icon_color": "text-emerald-600 dark:text-emerald-400",
        "title": "Chấm điểm & kết quả",
        "description": "Xem bài nộp, chấm điểm",
        "sort_order": 5,
        "is_active": True,
        "content_html": (
            '<p>Vào lớp học → tab <strong>Thống kê</strong> để xem kết quả và chấm điểm.</p>'

            '<h4>Tổng quan</h4>'
            '<ul>'
            '<li>Tổng bài giao, số học sinh, số bài đã nộp, tỉ lệ nộp</li>'
            '<li>Thống kê <strong>theo loại bài</strong> (Phiếu bài tập, Quiz, Bài code) với tỉ lệ nộp và điểm trung bình</li>'
            '<li><strong>Bảng xếp hạng tổng hợp</strong>: điểm Quiz, Code, Phiếu bài tập, TB chung, tiến độ từng học sinh</li>'
            '</ul>'

            '<h4>Chi tiết</h4>'
            '<ul>'
            '<li>Lọc theo: <strong>Tất cả</strong>, <strong>Cá nhân</strong>, <strong>Nhóm</strong></li>'
            '<li>Xem từng bài tập: trạng thái nộp, điểm, thời gian nộp của mỗi học sinh</li>'
            '<li>Nhấn <strong>Xem bài nộp</strong> để xem đáp án chi tiết của học sinh</li>'
            '<li><strong>Trắc nghiệm</strong> và <strong>bài tập code</strong> được hệ thống chấm tự động</li>'
            '</ul>'

            '<h4>Đánh giá đồng đẳng</h4>'
            '<ul>'
            '<li>Tại tab Học liệu, cột <strong>Bài đã giao</strong>, nhấn <strong>Tráo bài</strong> (cần ít nhất 2 bài đã nộp)</li>'
            '<li>Hệ thống tự động ghép cặp — mỗi học sinh/nhóm nhận bài của người khác để nhận xét và chấm điểm</li>'
            '<li>Tại tab Thống kê → Chi tiết, nhấn <strong>Đánh giá chéo</strong> để xem kết quả đánh giá</li>'
            '</ul>'
        ),
    },
    {
        "card_key": "settings",
        "icon_name": "Settings",
        "color": "bg-stone-100 border-stone-300 dark:bg-stone-800 dark:border-stone-600",
        "icon_color": "text-stone-600 dark:text-stone-400",
        "title": "Cài đặt tài khoản",
        "description": "Thiết bị, phong cách, mật khẩu",
        "sort_order": 6,
        "is_active": True,
        "content_html": (
            '<p>Nhấn vào <strong>avatar</strong> ở góc phải thanh điều hướng → chọn <strong>Cài đặt</strong>.</p>'

            '<div class="guide-step"><span class="step-num">1</span><div><p class="step-title">Thiết bị dạy học</p><div class="step-body">Chọn hoặc thêm các thiết bị dạy học (máy chiếu, bảng tương tác, điện thoại...). AI sẽ dựa trên thiết bị giáo viên có để đưa vào phần <strong>Thiết bị &amp; học liệu</strong> và tổ chức các hoạt động dạy học phù hợp khi tạo KHBD.</div></div></div>'
            '<div class="guide-step"><span class="step-num">2</span><div><p class="step-title">Phong cách dạy học</p><div class="step-body">Mô tả phong cách giảng dạy cá nhân (tối đa 2000 ký tự). AI sẽ tham khảo để tạo KHBD phù hợp với phong cách của bạn.</div></div></div>'
            '<div class="guide-step"><span class="step-num">3</span><div><p class="step-title">Đổi mật khẩu</p><div class="step-body">Nhập mật khẩu cũ và mật khẩu mới (tối thiểu 8 ký tự).</div></div></div>'

            '<div class="guide-tip"><strong>Lưu ý:</strong> Nên cấu hình <strong>Thiết bị</strong> và <strong>Phong cách dạy học</strong> trước khi bắt đầu soạn KHBD. AI sẽ tạo nội dung sát với thực tế giảng dạy của bạn hơn.</div>'
        ),
    },
    {
        "card_key": "video",
        "icon_name": "Play",
        "color": "bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
        "icon_color": "text-rose-600 dark:text-rose-400",
        "title": "Video hướng dẫn",
        "description": "Xem video hướng dẫn chi tiết",
        "sort_order": 7,
        "is_active": True,
        "video_url": "https://www.youtube.com/embed/VIDEO_ID",
        "content_html": '<p>Video hướng dẫn chi tiết các chức năng của hệ thống:</p>',
    },
]


def upgrade() -> None:
    guide_cards = op.create_table(
        "guide_cards",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("card_key", sa.String(50), unique=True, nullable=False),
        sa.Column("icon_name", sa.String(50), nullable=False),
        sa.Column("color", sa.String(200), nullable=False),
        sa.Column("icon_color", sa.String(100), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("content_html", sa.Text, nullable=False),
        sa.Column("video_url", sa.String(500), nullable=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.bulk_insert(guide_cards, CARDS)


def downgrade() -> None:
    op.drop_table("guide_cards")

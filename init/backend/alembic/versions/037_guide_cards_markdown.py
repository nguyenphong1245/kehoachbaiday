"""Convert guide_cards content_html from complex HTML to Markdown

Revision ID: 037_guide_cards_markdown
Revises: 036_guide_cards
Create Date: 2026-03-02
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "037_guide_cards_markdown"
down_revision = "036_guide_cards"
branch_labels = None
depends_on = None


# ── Markdown content for each card ──────────────────────────────────

MARKDOWN = {
    "features": (
        "Hệ thống hỗ trợ giáo viên Tin học soạn Kế hoạch bài dạy (KHBD) "
        "theo chương trình GDPT 2018 với các tính năng chính:\n\n"
        "- **Soạn KHBD bằng AI** – Tạo kế hoạch bài dạy tự động theo chuẩn, cấu hình phương pháp, kỹ thuật dạy học và năng lực số\n"
        "- **Chỉnh sửa KHBD** – Sửa trực tiếp trong trình soạn thảo, lưu lại\n"
        "- **Quản lý KHBD đã lưu** – Xem lại, chỉnh sửa, xuất PDF/Word, xóa\n"
        "- **Tạo học liệu tự động** – AI tạo kèm KHBD: phiếu học tập, trắc nghiệm, bài tập code, sơ đồ tư duy (khi chọn kỹ thuật tương ứng)\n"
        "- **Chấm điểm tự động** – Quiz chấm tự động, bài tập code chạy test case tự động\n"
        "- **Quản lý lớp học** – Tạo lớp, thêm học sinh (thủ công hoặc CSV/Excel), chia nhóm\n"
        "- **Giao bài tập** – Giao học liệu cho học sinh, hỗ trợ cá nhân và nhóm\n"
        "- **Làm bài nhóm cộng tác** – Chỉnh sửa đồng thời, chat nhóm thời gian thực\n"
        "- **Đánh giá đồng đẳng** – Học sinh đánh giá chéo bài nhau, nhận xét và chấm điểm\n"
        "- **Đánh giá thành viên nhóm** – Học sinh đánh giá các thành viên trong nhóm\n"
        "- **Thống kê lớp học** – Tỷ lệ nộp bài, điểm trung bình, xếp hạng học sinh\n"
        "- **Cài đặt tài khoản** – Thiết bị dạy học, phong cách giảng dạy, đổi mật khẩu\n"
    ),
    "khbd-process": (
        "## Bước 1: Chọn bài học\n\n"
        "1. **Chọn khối lớp** — Thanh bên trái, chọn khối **10**, **11** hoặc **12**.\n"
        "2. **Chọn chủ đề** — Danh sách chủ đề hiển thị theo chương trình. Nhấn vào chủ đề muốn soạn.\n"
        "3. **Chọn bài học** — Chọn bài học cụ thể muốn soạn.\n\n"
        "## Bước 2: Cấu hình\n\n"
        "Hệ thống có 4 hoạt động theo chuẩn KHBD: **Khởi động**, **Hình thành kiến thức**, **Luyện tập**, **Vận dụng**.\n\n"
        "Với mỗi hoạt động, cấu hình:\n"
        "- **Phương pháp dạy học**: Hợp tác, Giải quyết vấn đề, Khám phá, Trò chơi, Thảo luận nhóm...\n"
        "- **Kỹ thuật dạy học**: Think-Pair-Share, Jigsaw, KWL, Brainstorming, Sơ đồ tư duy...\n"
        "- **Địa điểm**: Phòng học hoặc Phòng máy tính\n"
        "- **Yêu cầu riêng**: Ghi thêm yêu cầu đặc biệt cho từng hoạt động\n\n"
        "Cấu hình chung cho toàn bài:\n"
        "- **Chỉ báo Năng lực số (NLS)**: Chọn theo miền năng lực → năng lực thành phần → chỉ báo\n\n"
        "## Bước 3: Tạo & chỉnh sửa\n\n"
        "4. **Nhấn Tạo KHBD** — AI tạo kế hoạch bài dạy hoàn chỉnh. Tiến trình hiển thị theo thời gian thực.\n"
        "5. **Xem kết quả** — KHBD gồm: Mục tiêu, Thiết bị & học liệu, nội dung 4 hoạt động. Có thể kèm câu hỏi trắc nghiệm, phiếu học tập. Nếu chọn kỹ thuật **Sơ đồ tư duy** thì KHBD sẽ kèm sơ đồ tư duy.\n"
        "6. **Chỉnh sửa trực tiếp** — Nhấn vào nội dung để sửa trực tiếp trong trình soạn thảo.\n"
        "7. **Lưu KHBD** — Nhấn **Lưu** với tên tùy chỉnh. Xem lại tại mục **KHBD đã lưu**.\n\n"
        "## Quản lý KHBD đã lưu\n\n"
        "- Tìm kiếm theo tên bài học\n"
        "- Nhấn vào KHBD để xem, chỉnh sửa và lưu lại\n"
        "- Xuất ra **PDF** hoặc **Word**\n"
        "- Xóa KHBD không cần thiết\n\n"
        "> **Lưu ý:** Hãy cấu hình **Thiết bị dạy học** và **Phong cách dạy học** trong cài đặt tài khoản trước khi tạo KHBD. AI sẽ tự động tham khảo để tạo nội dung phù hợp.\n"
    ),
    "materials": (
        "Học liệu được AI tạo tự động kèm KHBD. Giáo viên có thể chỉnh sửa nội dung trước khi giao cho học sinh.\n\n"
        "1. **Mở trang Quản lý** — Tại trang **Kế hoạch bài dạy**, nhấn **Quản lý lớp & học liệu** trên thanh điều hướng phía trên.\n"
        "2. **Chọn Quản lý học liệu** — Tại thanh bên trái, nhấn **Quản lý học liệu**. Trang hiển thị 3 tab: **Phiếu học tập**, **Trắc nghiệm**, **Bài tập code**.\n"
        "3. **Tìm học liệu cần sửa** — Chọn tab loại học liệu. Học liệu được nhóm theo bài học — nhấn vào tên bài để mở rộng.\n"
        "4. **Nhấn nút sửa** — Mỗi học liệu có các nút: **Sửa** (bút chì), **Chuyển vào lớp**, **Xóa**.\n\n"
        "## Sửa trắc nghiệm (Quiz)\n\n"
        "- Modal hiện ra với tiêu đề và danh sách câu hỏi\n"
        "- Sửa nội dung câu hỏi, 4 đáp án (A/B/C/D)\n"
        "- Nhấn vào đáp án để đặt làm **đáp án đúng** (hiển thị màu xanh)\n"
        "- Nhấn **Lưu** để cập nhật\n\n"
        "## Sửa phiếu học tập (Worksheet)\n\n"
        "- Modal hiện ra với tiêu đề và trình soạn thảo Markdown\n"
        "- Bên trái: soạn nội dung — Bên phải: xem trước kết quả\n"
        "- Nhấn **Lưu** để cập nhật\n\n"
        "## Sửa bài tập code (Code Exercise)\n\n"
        "- Nhấn vào bài tập code sẽ mở trang chỉnh sửa trong tab mới\n\n"
        "> **Lưu ý:** Sau khi chỉnh sửa xong, nhấn nút **Chuyển vào lớp** để đưa học liệu vào lớp. Sau đó vào lớp học → tab **Học liệu** → nhấn nút **Giao** ở cột **Danh sách học liệu** bên phải để giao bài cho học sinh.\n"
    ),
    "classroom": (
        "## Tạo lớp học\n\n"
        "1. **Mở trang Quản lý** — Tại trang **Kế hoạch bài dạy**, nhấn **Quản lý lớp & học liệu** trên thanh điều hướng. Chọn **Quản lý lớp học** ở thanh bên trái.\n"
        "2. **Tạo lớp mới** — Nhấn nút **+ Tạo lớp mới** (góc phải). Nhập tên lớp (VD: 10A1), chọn khối và năm học.\n"
        "3. **Thêm học sinh** — Sau khi tạo lớp, thêm học sinh bằng 2 cách:\n"
        "   - **Upload danh sách**: Tải lên file Excel/CSV (cột: Họ tên, Ngày sinh DD/MM/YYYY)\n"
        "   - **Thêm thủ công**: Nhập họ tên và ngày sinh từng học sinh\n"
        "4. **Phát thông tin đăng nhập** — Hệ thống tự tạo tài khoản cho mỗi học sinh. Tại tab **Học sinh**, nhấn **Copy TK** để sao chép tài khoản và mật khẩu, phát cho học sinh.\n\n"
        "## Chia nhóm\n\n"
        "5. **Chia nhóm tự động** — Chọn tab **Nhóm** trong lớp → nhấn **Chia nhóm tự động**. Nhập số nhóm, chọn cách chia (**theo thứ tự** hoặc **ngẫu nhiên**).\n"
        "6. **Hoặc tạo nhóm thủ công** — Nhấn **Tạo nhóm thủ công** → chọn tên nhóm và chọn thành viên từ danh sách học sinh.\n\n"
        "> **Lưu ý:** Học sinh đăng nhập bằng **tài khoản** và **mật khẩu** do hệ thống tạo (mật khẩu mặc định là ngày tháng năm sinh). Khi làm bài nhóm, học sinh tự bầu nhóm trưởng — nhóm trưởng có quyền nộp bài thay cho cả nhóm.\n"
    ),
    "assignment": (
        "Học liệu cần được **chuyển vào lớp** trước (từ trang Quản lý học liệu), sau đó mới giao cho học sinh.\n\n"
        "1. **Vào lớp học** — Tại trang **Quản lý lớp học**, nhấn vào lớp muốn giao bài → chọn tab **Học liệu**.\n"
        "2. **Chọn học liệu muốn giao** — Cột bên phải **Danh sách học liệu** hiển thị các học liệu đã chuyển vào lớp. Nhấn nút **Giao** trên học liệu muốn giao.\n"
        "3. **Cấu hình bài tập** — Form mở ra với các trường:\n"
        "   - **Tiêu đề** (tự điền sẵn tên học liệu)\n"
        "   - **Mô tả** (tùy chọn)\n"
        "   - **Giờ bắt đầu** và **Hạn nộp**\n"
        "   - Hình thức: **Cá nhân** hoặc **Nhóm**\n"
        "   - **Tráo bài tự động** (đánh giá đồng đẳng)\n"
        "4. **Nhấn Giao bài** — Bài tập chuyển sang cột trái **Bài đã giao**. Học sinh sẽ nhìn thấy bài tập trên trang cá nhân.\n\n"
        "> **Lưu ý:** Với bài tập nhóm, học sinh có thể **làm việc cộng tác thời gian thực** (chỉnh sửa đồng thời, chat nhóm). Nhóm trưởng có thể nộp bài thay cho cả nhóm.\n"
    ),
    "grading": (
        "Vào lớp học → tab **Thống kê** để xem kết quả và chấm điểm.\n\n"
        "## Tổng quan\n\n"
        "- Tổng bài giao, số học sinh, số bài đã nộp, tỉ lệ nộp\n"
        "- Thống kê **theo loại bài** (Phiếu bài tập, Quiz, Bài code) với tỉ lệ nộp và điểm trung bình\n"
        "- **Bảng xếp hạng tổng hợp**: điểm Quiz, Code, Phiếu bài tập, TB chung, tiến độ từng học sinh\n\n"
        "## Chi tiết\n\n"
        "- Lọc theo: **Tất cả**, **Cá nhân**, **Nhóm**\n"
        "- Xem từng bài tập: trạng thái nộp, điểm, thời gian nộp của mỗi học sinh\n"
        "- Nhấn **Xem bài nộp** để xem đáp án chi tiết của học sinh\n"
        "- **Trắc nghiệm** và **bài tập code** được hệ thống chấm tự động\n\n"
        "## Đánh giá đồng đẳng\n\n"
        "- Tại tab Học liệu, cột **Bài đã giao**, nhấn **Tráo bài** (cần ít nhất 2 bài đã nộp)\n"
        "- Hệ thống tự động ghép cặp — mỗi học sinh/nhóm nhận bài của người khác để nhận xét và chấm điểm\n"
        "- Tại tab Thống kê → Chi tiết, nhấn **Đánh giá chéo** để xem kết quả đánh giá\n"
    ),
    "settings": (
        "Nhấn vào **avatar** ở góc phải thanh điều hướng → chọn **Cài đặt**.\n\n"
        "1. **Thiết bị dạy học** — Chọn hoặc thêm các thiết bị dạy học (máy chiếu, bảng tương tác, điện thoại...). AI sẽ dựa trên thiết bị giáo viên có để đưa vào phần **Thiết bị & học liệu** và tổ chức các hoạt động dạy học phù hợp khi tạo KHBD.\n"
        "2. **Phong cách dạy học** — Mô tả phong cách giảng dạy cá nhân (tối đa 2000 ký tự). AI sẽ tham khảo để tạo KHBD phù hợp với phong cách của bạn.\n"
        "3. **Đổi mật khẩu** — Nhập mật khẩu cũ và mật khẩu mới (tối thiểu 8 ký tự).\n\n"
        "> **Lưu ý:** Nên cấu hình **Thiết bị** và **Phong cách dạy học** trước khi bắt đầu soạn KHBD. AI sẽ tạo nội dung sát với thực tế giảng dạy của bạn hơn.\n"
    ),
    "video": "Video hướng dẫn chi tiết các chức năng của hệ thống:",
}


def upgrade() -> None:
    conn = op.get_bind()
    for key, content in MARKDOWN.items():
        conn.execute(
            sa.text("UPDATE guide_cards SET content_html = :content WHERE card_key = :key"),
            {"content": content, "key": key},
        )


def downgrade() -> None:
    # No easy reverse — would need to store original HTML
    pass

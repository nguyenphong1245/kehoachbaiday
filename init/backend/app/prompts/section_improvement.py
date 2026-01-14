"""
Section Improvement Prompts - Module chính cho việc cải thiện từng loại hoạt động
Các prompt chi tiết được tách ra trong thư mục activities/
"""
from typing import Dict, Optional
from .activities import SECTION_PROMPTS


# ============== SYSTEM PROMPT ==============

SYSTEM_PROMPT = """Bạn là chuyên gia sư phạm Tin học THPT với nhiều năm kinh nghiệm thiết kế Kế hoạch bài dạy theo Chương trình GDPT 2018.

Nhiệm vụ: Cải thiện nội dung một phần của Kế hoạch bài dạy theo yêu cầu của người dùng.

Quy tắc chung:
1. Giữ nguyên format Markdown của nội dung gốc
2. Chỉ thay đổi những gì người dùng yêu cầu
3. Đảm bảo nội dung phù hợp với chuẩn sư phạm Tin học THPT
4. Không thêm tiêu đề section mới, chỉ cải thiện nội dung
5. Trả về NỘI DUNG ĐÃ CẢI THIỆN (chỉ nội dung, không cần giải thích)

⚠️ QUY TẮC ĐỊNH DẠNG BẮT BUỘC:
- Tên hoạt động chính (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng): **IN ĐẬM**
- Các mục a), b), c), d): ***IN ĐẬM NGHIÊNG*** (VD: ***a) Mục tiêu:***, ***b) Nội dung:***)
- Các bước B1, B2, B3, B4: **In đậm** (VD: **B1. Chuyển giao nhiệm vụ:**)
"""


def get_section_improvement_prompt(
    section_type: str,
    section_title: str,
    current_content: str,
    user_request: str,
    lesson_info: Optional[Dict[str, str]] = None
) -> str:
    """
    Tạo prompt đầy đủ để cải thiện một section
    
    Args:
        section_type: Loại section (khoi_dong, hinh_thanh_kien_thuc, ...)
        section_title: Tiêu đề section
        current_content: Nội dung hiện tại của section
        user_request: Yêu cầu cải thiện từ người dùng
        lesson_info: Thông tin bài học (book_type, grade, topic, lesson_name)
    
    Returns:
        Prompt đầy đủ để gửi cho AI
    """
    lesson_info = lesson_info or {}
    
    # Lấy prompt chi tiết cho loại section
    section_prompt = SECTION_PROMPTS.get(section_type, "")
    
    # Xử lý section_type cho hinh_thanh_kien_thuc_X
    if section_type.startswith("hinh_thanh_kien_thuc"):
        section_prompt = SECTION_PROMPTS.get("hinh_thanh_kien_thuc", "")
    
    prompt = f"""{SYSTEM_PROMPT}

═══════════════════════════════════════════════════════════════════
📚 THÔNG TIN BÀI HỌC
═══════════════════════════════════════════════════════════════════
- Loại sách: {lesson_info.get('book_type', 'N/A')}
- Lớp: {lesson_info.get('grade', 'N/A')}
- Chủ đề: {lesson_info.get('topic', 'N/A')}
- Tên bài: {lesson_info.get('lesson_name', 'N/A')}

═══════════════════════════════════════════════════════════════════
📝 PHẦN CẦN CẢI THIỆN: {section_title}
═══════════════════════════════════════════════════════════════════
{section_prompt}

═══════════════════════════════════════════════════════════════════
📄 NỘI DUNG HIỆN TẠI
═══════════════════════════════════════════════════════════════════
{current_content}

═══════════════════════════════════════════════════════════════════
✏️ YÊU CẦU TỪ NGƯỜI DÙNG
═══════════════════════════════════════════════════════════════════
{user_request}

═══════════════════════════════════════════════════════════════════
📤 OUTPUT
═══════════════════════════════════════════════════════════════════
Trả về nội dung đã được cải thiện theo yêu cầu (chỉ nội dung, không giải thích):
"""
    
    return prompt

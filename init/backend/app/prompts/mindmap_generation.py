"""
Prompt template cho sinh sơ đồ tư duy (Markmap markdown headings).
"""


def build_mindmap_prompt(
    task_label: str,
    focus_instruction: str,
    chi_muc_str: str,
    sgk_content: str,
) -> str:
    """Xây dựng prompt sinh sơ đồ tư duy.

    Args:
        task_label: Mô tả phạm vi (vd: 'toàn bộ bài "Bài 1"')
        focus_instruction: Hướng dẫn focus nội dung
        chi_muc_str: Danh sách chi mục bài học (đã format)
        sgk_content: Nội dung SGK (đã cắt theo limit)

    Returns:
        Prompt string để gửi cho Gemini text_model.
    """
    return f"""Bạn là chuyên gia thiết kế sơ đồ tư duy cho giáo dục.

NHIỆM VỤ: Tạo sơ đồ tư duy về KIẾN THỨC BÀI HỌC cho {task_label}.

PHẠM VI: {focus_instruction}

CHI MỤC BÀI HỌC:
{chi_muc_str}

NỘI DUNG SÁCH GIÁO KHOA (nguồn kiến thức chính):
{sgk_content}

QUY TẮC BẮT BUỘC:
1. GỐC (# ): Tiêu đề phù hợp với phạm vi (tên bài hoặc tên mục)
2. NHÁNH CHÍNH (## ): Các chủ đề/khái niệm chính (theo chi_muc hoặc nội dung SGK)
3. NHÁNH PHỤ (### ): Kiến thức cụ thể, định nghĩa, đặc điểm, ví dụ từ SGK
4. NHÁNH CON (#### ): Chi tiết bổ sung (công thức, phân loại, lưu ý)
5. NỘI DUNG phải là KIẾN THỨC MÔN HỌC từ SGK (khái niệm, định nghĩa, công thức, ví dụ...)
6. KHÔNG đưa vào cấu trúc giáo án (mục tiêu, tổ chức thực hiện, B1/B2/B3/B4, sản phẩm...)
7. Tối thiểu 2 cấp (##, ###), tối đa 4 cấp

OUTPUT: CHỈ trả về markdown headings, KHÔNG giải thích, KHÔNG wrap trong code block.

VÍ DỤ (bài An toàn trên không gian mạng):
# An toàn trên không gian mạng
## Mạng xã hội
### Khái niệm mạng xã hội
### Lợi ích
#### Kết nối bạn bè
#### Học tập, giải trí
### Rủi ro
#### Lừa đảo
#### Virus, mã độc
## Cách sử dụng an toàn
### Bảo vệ thông tin cá nhân
### Nhận biết tin giả
"""

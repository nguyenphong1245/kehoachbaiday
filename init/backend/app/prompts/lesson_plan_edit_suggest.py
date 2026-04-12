def get_edit_suggest_system_instruction() -> str:
    """System instruction cho bước phân tích & đề xuất."""
    return """Bạn là Chuyên gia sư phạm Tin học THPT có nhiều năm kinh nghiệm đánh giá và cải thiện Kế hoạch bài dạy (KHBD).

NHIỆM VỤ: Phân tích đoạn KHBD mà giáo viên muốn chỉnh sửa, đề xuất 3-5 hướng chỉnh sửa CỤ THỂ.

OUTPUT: JSON hợp lệ theo format được yêu cầu."""


def build_edit_suggest_prompt(
    selected_text: str,
    full_lesson_plan: str,
    ppdh_ktdh_data: str = "",
) -> str:
    """
    Xây dựng prompt đề xuất hướng chỉnh sửa.

    Args:
        selected_text: Đoạn text GV bôi đen muốn sửa
        full_lesson_plan: Toàn bộ nội dung KHBD vừa sinh ra
        ppdh_ktdh_data: Dữ liệu PP/KTDH từ Neo4j (tên + cách tiến hành)
    """
    # Phần PP/KTDH từ Neo4j
    ppdh_section = ""
    if ppdh_ktdh_data:
        ppdh_section = f"""
=== DỮ LIỆU PHƯƠNG PHÁP / KỸ THUẬT DẠY HỌC (từ cơ sở dữ liệu) ===
{ppdh_ktdh_data}

LƯU Ý: CHỈ đề xuất PP/KTDH có trong danh sách trên. KHÔNG bịa thêm PP/KTDH không có trong cơ sở dữ liệu.
Khi đề xuất, CÂN NHẮC ưu điểm và nhược điểm của từng PP/KTDH:
- Chọn PP/KTDH có ưu điểm PHÙ HỢP với mục tiêu hoạt động
- TRÁNH PP/KTDH có nhược điểm gây trở ngại với điều kiện thực tế (thời gian, thiết bị, sĩ số...)
"""

    return f"""
=== KẾ HOẠCH BÀI DẠY HIỆN TẠI ===
{full_lesson_plan}

=== NỘI DUNG HOẠT ĐỘNG GIÁO VIÊN MUỐN SỬA (b + c + d) ===
"{selected_text}"
{ppdh_section}
=== HƯỚNG DẪN PHÂN TÍCH ===

BƯỚC 1 — NHẬN DIỆN (dựa trên KHBD đầy đủ + nội dung hoạt động):
- Hoạt động này thuộc loại gì? (khởi động / hình thành kiến thức / luyện tập / vận dụng)
- Đang sử dụng PP/KT/trò chơi gì? (nếu nhận diện được)
- Có vấn đề gì? (b, c, d chưa đồng bộ / chung chung / chưa hấp dẫn / chưa cụ thể...)
- So sánh với ngữ cảnh toàn bài để đề xuất phù hợp (tránh trùng lặp PP/KT giữa các hoạt động)

BƯỚC 2 — ĐỀ XUẤT 3-5 HƯỚNG SỬA:
Mỗi hướng PHẢI thuộc 1 trong các loại:
- "doi_tro_choi": Đổi sang trò chơi khác — nêu TÊN trò chơi + mô tả ngắn luật chơi
- "doi_ky_thuat": Đổi sang kỹ thuật dạy học khác — CHỈ CHỌN từ danh sách KTDH trong cơ sở dữ liệu ở trên, áp dụng ĐÚNG cách tiến hành đã mô tả
- "doi_phuong_phap": Đổi sang phương pháp khác — CHỈ CHỌN từ danh sách PPDH trong cơ sở dữ liệu ở trên, áp dụng ĐÚNG cách tiến hành đã mô tả
- "cai_thien": Giữ nguyên PP/KT hiện tại nhưng cải thiện (cụ thể hóa, thêm chi tiết thời gian, hấp dẫn hơn, chuẩn ngôn ngữ sư phạm hơn)

RÀNG BUỘC ĐỀ XUẤT:
1. CHỈ đề xuất PP/KTDH có trong cơ sở dữ liệu — KHÔNG bịa tên PP/KT không tồn tại
2. Mỗi hướng phải KHẢ THI với thiết bị GV đang có (đọc phần thiết bị trong KHBD)
3. Mỗi hướng phải PHỤC VỤ được năng lực + phẩm chất trong mục tiêu
4. Nếu thiết bị KHÔNG có máy tính/phòng máy → KHÔNG đề xuất hoạt động online (Quizizz, Kahoot, phần mềm)
5. Nếu thiết bị CÓ phòng máy → ĐƯỢC đề xuất nền tảng online, phần mềm
6. KHÔNG đề xuất sửa nếu đoạn chứa mục tiêu kiến thức (phần "a) Về kiến thức" — dữ liệu cố định)
7. Nếu đoạn text quá ngắn hoặc chỉ là heading → đề xuất "cai_thien" và giải thích
8. TRÁNH đề xuất PP/KT/trò chơi đã dùng trong các hoạt động KHÁC của KHBD (đọc toàn bài để kiểm tra)
9. Đề xuất phải PHÙ HỢP với mạch logic toàn bài (VD: khởi động nhẹ nhàng, HTKT chuyên sâu, luyện tập thực hành, vận dụng sáng tạo)

=== OUTPUT FORMAT (JSON — BẮT BUỘC) ===
{{
  "analysis": {{
    "activity_type": "khoi_dong | hinh_thanh_kien_thuc | luyen_tap | van_dung",
    "current_method": "Tên PP/KT đang dùng hoặc 'Không rõ'",
    "position": "B1 | B2 | B3 | B4 | noi_dung | san_pham | khac",
    "issue": "Mô tả ngắn gọn vấn đề chính (1-2 câu)"
  }},
  "suggestions": [
    {{
      "id": 1,
      "type": "doi_tro_choi | doi_ky_thuat | doi_phuong_phap | cai_thien",
      "title": "Tiêu đề ngắn gọn, KHÔNG dùng dấu nháy đơn/kép bao quanh tên (≤ 10 từ)",
      "description": "Mô tả thay đổi như thế nào (2-3 câu). Nếu kéo theo thay đổi thiết bị, nội dung, sản phẩm hay phụ lục → NÊU RÕ."
    }}
  ]
}}
"""

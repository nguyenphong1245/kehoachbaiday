"""
Prompt cho bước 2: AI thực hiện chỉnh sửa đoạn text theo hướng GV đã chọn.

Input: đoạn gốc + suggestion đã chọn + toàn bộ KHBD
Output: JSON chứa đoạn text đã sửa + các thay đổi liên quan (thiết bị, nội dung, sản phẩm, phụ lục)
"""


def get_edit_apply_system_instruction() -> str:
    """System instruction cho bước thực hiện sửa."""
    return """Bạn là Chuyên gia sư phạm Tin học THPT. Chỉnh sửa đoạn Kế hoạch bài dạy (KHBD) theo yêu cầu.

OUTPUT: JSON hợp lệ theo format được yêu cầu.
KHÔNG giải thích. KHÔNG wrapper. KHÔNG markdown code block bao ngoài JSON."""


def build_edit_apply_prompt(
    selected_text: str,
    suggestion_type: str,
    suggestion_title: str,
    suggestion_description: str,
    full_lesson_plan: str,
    ppdh_ktdh_data: str = "",
) -> str:
    """
    Xây dựng prompt thực hiện chỉnh sửa.

    Args:
        selected_text: Đoạn text gốc GV bôi đen
        suggestion_type: Loại sửa (doi_tro_choi, doi_ky_thuat, doi_phuong_phap, cai_thien)
        suggestion_title: Tiêu đề hướng sửa GV đã chọn
        suggestion_description: Mô tả chi tiết hướng sửa
        full_lesson_plan: Toàn bộ nội dung KHBD vừa sinh ra
        ppdh_ktdh_data: Dữ liệu PP/KTDH từ Neo4j
    """
    # Phần PP/KTDH từ Neo4j
    ppdh_section = ""
    if ppdh_ktdh_data:
        ppdh_section = f"""
=== DỮ LIỆU PHƯƠNG PHÁP / KỸ THUẬT DẠY HỌC (từ cơ sở dữ liệu) ===
{ppdh_ktdh_data}

QUAN TRỌNG: Khi đổi PP/KTDH, PHẢI áp dụng ĐÚNG cách tiến hành đã mô tả ở trên.
KHÔNG nêu tên PP/KTDH trong nội dung KHBD — chỉ thể hiện CÁCH TỔ CHỨC.
TUYỆT ĐỐI không copy tên kỹ thuật/phương pháp từ "Tiêu đề" hoặc "Mô tả" vào edited_text.
Ví dụ: nếu hướng sửa có tên "Tia chớp" thì edited_text phải mô tả quy trình hỏi nhanh - đáp nhanh,
không được xuất hiện từ "Tia chớp".
"""
    return f"""
=== KẾ HOẠCH BÀI DẠY HIỆN TẠI ===
{full_lesson_plan}

=== NỘI DUNG HOẠT ĐỘNG CẦN SỬA (b + c + d) ===
"{selected_text}"

=== HƯỚNG SỬA GIÁO VIÊN ĐÃ CHỌN ===
Loại: {suggestion_type}
Tiêu đề: {suggestion_title}
Mô tả: {suggestion_description}
{ppdh_section}

=== QUY TRÌNH CHỈNH SỬA (THỰC HIỆN LẦN LƯỢT) ===

BƯỚC 1 — XÁC ĐỊNH PHẠM VI ẢNH HƯỞNG:
- Hoạt động này thuộc loại gì? (khởi động / HTKT 2.1 / HTKT 2.2... / luyện tập / vận dụng)
- Hoạt động này phát triển năng lực tin học nào? (NLa/NLb/NLc/NLd/NLe)
- Hoạt động này phát triển năng lực chung nào? (Giao tiếp và hợp tác / Giải quyết vấn đề / Tự chủ và tự học...)
- Hoạt động này phát triển phẩm chất nào? (Chăm chỉ / Trách nhiệm / Trung thực...)
- Hoạt động này sử dụng thiết bị gì? (giấy A1, phiếu HT số X, thẻ trả lời...)
- Hoạt động này có liên kết với Phiếu học tập hoặc Trắc nghiệm ở phụ lục không?

BƯỚC 2 — VIẾT LẠI NỘI DUNG HOẠT ĐỘNG (edited_text):
Viết lại TOÀN BỘ phần b) Nội dung + c) Sản phẩm + d) Tổ chức thực hiện theo hướng sửa đã chọn.
QUAN TRỌNG:
- edited_text PHẢI bao gồm ĐẦY ĐỦ b) Nội dung, c) Sản phẩm, d/dd) Tổ chức thực hiện.
- Ba phần b), c), d) PHẢI LOGIC và ĐỒNG BỘ với nhau.
- Giữ nguyên cấu trúc: b) ... → c) ... → d/dd) Tổ chức thực hiện: B1→B2→B3→B4.
- Giữ nguyên a) Mục tiêu (KHÔNG đưa vào edited_text).

BƯỚC 3 — KIỂM TRA ĐỒNG BỘ b + c + d:
- b) Nội dung mô tả hình thức hoạt động phải KHỚP với cách tổ chức ở d)
- c) Sản phẩm phải phù hợp với nội dung + tổ chức (VD: nếu đổi sang trò chơi → sản phẩm = kết quả trò chơi)
- Nếu thay đổi hình thức (VD: từ nhóm → trò chơi, từ phiếu HT → thảo luận):
  + b) Nội dung PHẢI thay đổi theo (VD: "HS hoạt động nhóm..." → "HS tham gia trò chơi...")
  + c) Sản phẩm PHẢI thay đổi theo (VD: "Câu trả lời trên Phiếu HT số 1" → "Kết quả trò chơi...")

BƯỚC 4 — CẬP NHẬT THIẾT BỊ (nếu cần):
- Nếu hoạt động MỚI sử dụng thiết bị CHƯA CÓ trong "II. THIẾT BỊ" → thêm vào equipment_add
- Nếu hoạt động CŨ dùng thiết bị mà hoạt động MỚI KHÔNG dùng nữa:
  + Quét TOÀN BỘ các hoạt động khác trong KHBD
  + Nếu KHÔNG có hoạt động nào khác sử dụng thiết bị đó → thêm vào equipment_remove
  + Nếu CÒN hoạt động khác sử dụng → KHÔNG xóa

BƯỚC 5 — CẬP NHẬT NĂNG LỰC + PHẨM CHẤT (nếu cần):
- Hoạt động mới vẫn PHẢI phát triển cùng năng lực/phẩm chất như hoạt động cũ
- Nếu hoạt động cũ phát triển NLd/NLe với công cụ X nhưng hoạt động mới không dùng X nữa:
  + Nếu hoạt động mới dùng công cụ Y → cập nhật biểu hiện NLd/NLe cho phù hợp
  + Nếu không dùng công cụ số nào → xóa NLd/NLe khỏi mục tiêu
- Biểu hiện năng lực chung: cập nhật tên hoạt động cho khớp
  VD cũ: "...trong hoạt động luyện tập khi thảo luận nhóm trên giấy A1"
  VD mới: "...trong hoạt động luyện tập khi tham gia trò chơi Ai nhanh hơn"

BƯỚC 6 — CẬP NHẬT PHỤ LỤC (nếu cần):
- Nếu hoạt động cũ dùng Phiếu HT mà hoạt động mới KHÔNG dùng → xóa phiếu tương ứng (appendix_remove)
- Nếu hoạt động mới cần Phiếu HT mới → tạo phiếu mới (appendix_add) theo format KHBD
- Nếu hoạt động cũ dùng Trắc nghiệm mà hoạt động mới KHÔNG dùng → xóa trắc nghiệm
- Nếu hoạt động mới cần Trắc nghiệm → tạo trắc nghiệm mới (appendix_add)
- Nếu GV chỉ muốn đổi câu hỏi trong PHT/trắc nghiệm → tìm hoạt động sử dụng nó → cập nhật c) Sản phẩm cho khớp

=== RÀNG BUỘC KHI SỬA (CRITICAL — VI PHẠM = SAI) ===

QUY TẮC KHBD:
1. KHÔNG nêu tên PP/KTDH trong nội dung — chỉ thể hiện CÁCH TỔ CHỨC
   SAI: "HS hoạt động nhóm sử dụng kỹ thuật Khăn trải bàn..."
   ĐÚNG: "GV phát cho mỗi nhóm 1 tờ giấy A1 đã kẻ sẵn 4 ô góc + 1 ô trung tâm..."
  SAI: "HS hoạt động cá nhân, tham gia kỹ thuật 'Tia chớp' để phân biệt..."
  ĐÚNG: "HS hoạt động cá nhân, lần lượt trả lời nhanh từng câu hỏi phân biệt thông tin và dữ liệu."
2. TUYỆT ĐỐI CẤM các mẫu từ trong edited_text:
  - "kỹ thuật ...", "phương pháp ...", "theo kỹ thuật ...", "theo phương pháp ..."
  - Tên riêng của kỹ thuật/phương pháp (ví dụ: "Tia chớp", "Khăn trải bàn", "Think-Pair-Share", "Jigsaw", "KWL")
  Nếu có -> PHẢI tự viết lại bằng mô tả tiến trình/hành vi.
3. KHÔNG trích dẫn lời GV trong ngoặc kép — chỉ mô tả hành động
4. KHÔNG viết "hoặc", "/", "hay" — CHỌN 1 DUY NHẤT
5. Ngôn ngữ sư phạm: "GV yêu cầu HS..." (KHÔNG "GV mời HS...", "GV khuyến khích...")

QUY TẮC TRÌNH BÀY:
6. MỖI hành động XUỐNG DÒNG RIÊNG với gạch đầu dòng (-)
7. Nếu 1 ý có ý con → dùng (+) thụt vào
8. Viết CỤ THỂ, TƯỜNG MINH: Ai làm gì? Bao lâu? Dùng gì?
9. Trò chơi → mô tả LUẬT CHƠI, CÁCH CHƠI, ĐIỀU KIỆN THẮNG/THUA chi tiết
10. Phải có ĐẦY ĐỦ: b) Nội dung → c) Sản phẩm → d/dd) Tổ chức thực hiện (B1→B2→B3→B4)
11. GIỮ NGUYÊN markdown formatting (**, -, +, ```)

QUY TẮC THIẾT BỊ:
12. Không có máy tính/phòng máy → KHÔNG dùng phần mềm, nền tảng online
13. Có phòng máy → ĐƯỢC dùng Quizizz/Kahoot (chọn 1), Thonny/PyCharm (chọn 1)

QUY TẮC NỘI DUNG:
14. Nội dung phải PHỤC VỤ năng lực + phẩm chất trong mục tiêu
15. Nếu đổi trò chơi/KT → NỘI DUNG KIẾN THỨC giữ nguyên, CHỈ đổi HÌNH THỨC tổ chức
16. KHÔNG thêm kiến thức mới ngoài phạm vi bài học
17. Hình thức ở b) Nội dung PHẢI XUYÊN SUỐT B1 → B2 → B3 → B4

QUY TẮC VIẾT "b) Nội dung" (CRITICAL):
18. CÔNG THỨC BẮT BUỘC: "HS hoạt động [hình thức] để [hành động cụ thể] [địa điểm/phiếu]"
19. CHỌN MỘT hình thức DUY NHẤT: cá nhân HOẶC cặp đôi HOẶC nhóm — KHÔNG TRỘN LẪN
20. NGẮN GỌN 1-3 câu — KHÔNG mô tả chi tiết cách thức (đó là việc của d) Tổ chức)
21. KHÔNG đề cập SGK: KHÔNG "đọc SGK", "dựa vào SGK"
22. Nếu có Phiếu HT → "HS hoạt động [hình thức] để trả lời các câu hỏi trong Phiếu học tập số X nằm trong Phụ lục."
    VD ĐÚNG: "HS hoạt động theo nhóm, tham gia trò chơi Đuổi hình bắt chữ dưới sự hướng dẫn của GV."
    VD ĐÚNG: "HS thực hiện thảo luận theo nhóm để trả lời các câu hỏi trong Phiếu học tập số 1 nằm trong Phụ lục."
    VD SAI: "HS hoạt động nhóm (4 HS/nhóm) thảo luận về cấu trúc xâu kí tự, trả lời câu hỏi và vẽ minh họa cấu trúc xâu lên giấy A1. Sau đó, các nhóm di chuyển quanh lớp để quan sát, nhận xét và chấm điểm chéo sản phẩm của nhau." (QUÁ CHI TIẾT — đây là nội dung d) Tổ chức!)

QUY TẮC PHIẾU HỌC TẬP (nếu tạo mới):
23. Mỗi hoạt động = 1 phiếu riêng, tối đa 5 câu
24. CHỈ dùng 2 dạng: câu hỏi thường (text + answer_lines) hoặc câu hỏi có code (text + code + answer_lines)
25. KHÔNG đặt đáp án trong phiếu

QUY TẮC TRẮC NGHIỆM (nếu tạo mới):
26. Mỗi câu PHẢI có 4 đáp án A, B, C, D
27. CHỈ 1 đáp án đúng (answer = 1 chữ cái)
28. Tiếng Việt, KHÔNG tiếng Anh

KIỂM TRA BẮT BUỘC TRƯỚC KHI TRẢ JSON:
- Quét toàn bộ edited_text. Nếu còn bất kỳ cụm nào như "kỹ thuật", "phương pháp"
  hoặc tên riêng kỹ thuật/phương pháp thì PHẢI tự viết lại để loại bỏ hoàn toàn.
- Chỉ giữ mô tả tiến trình hành động cụ thể của GV và HS.

=== OUTPUT FORMAT (JSON — BẮT BUỘC) ===
{{
  "edited_text": "Toàn bộ b) Nội dung + c) Sản phẩm + d/dd) Tổ chức thực hiện đã sửa (markdown)",
  "related_changes": [
    {{
      "section": "thiet_bi_gv | thiet_bi_hs | nang_luc_tin_hoc | nang_luc_chung | pham_chat | phieu_hoc_tap | trac_nghiem",
      "action": "update | add | remove",
      "old_text": "Đoạn text cũ cần tìm (để frontend replace) — bỏ trống nếu action = add",
      "new_text": "Đoạn text mới thay thế — bỏ trống nếu action = remove"
    }}
  ]
}}

QUY TẮC OUTPUT:
- "edited_text": TOÀN BỘ phần b) + c) + d) đã sửa. BẮT ĐẦU bằng "b) **Nội dung:**". Markdown format.
- "related_changes": CHỈ chứa thay đổi NGOÀI hoạt động (thiết bị, năng lực, phẩm chất, phụ lục). KHÔNG đưa b_noi_dung, c_san_pham vào đây (đã nằm trong edited_text rồi).
- "section": PHẢI dùng ĐÚNG giá trị: thiet_bi_gv, thiet_bi_hs, nang_luc_tin_hoc, nang_luc_chung, pham_chat, phieu_hoc_tap, trac_nghiem.
- "old_text" phải CHÍNH XÁC khớp với text trong KHBD hiện tại (để tìm và thay thế).
- Nếu thêm thiết bị mới → action "add", section "thiet_bi_gv", old_text = "", new_text = dòng thiết bị mới.
- Nếu xóa thiết bị → action "remove", section "thiet_bi_gv", old_text = dòng cần xóa, new_text = "".
- TOÀN BỘ nội dung PHẢI viết tiếng Việt CÓ DẤU đầy đủ. KHÔNG viết không dấu.
- CHỈ trả về JSON. KHÔNG giải thích. KHÔNG bọc trong code block.
"""

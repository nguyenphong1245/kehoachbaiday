import json
from typing import Optional


def build_teacher_preferences_section(
    teaching_tools: list[str] | None,
    teaching_style: str | None,
) -> str:
    """Tạo đoạn prompt mô tả công cụ và phong cách dạy học của GV.

    Nếu cả hai đều None/rỗng → trả empty string (prompt không thay đổi).
    """
    parts: list[str] = []

    if teaching_tools:
        tools_str = ", ".join(teaching_tools)
        parts.append(f"CÔNG CỤ DẠY HỌC CÓ SẴN CỦA GIÁO VIÊN: {tools_str}")

    if teaching_style:
        parts.append(f"PHONG CÁCH DẠY HỌC: {teaching_style}")

    if not parts:
        return ""

    requirements = (
        "\nYÊU CẦU:\n"
        "- CHỈ sử dụng công cụ trong danh sách trên khi đề cập đến phần mềm/nền tảng\n"
        "- Điều chỉnh cách tổ chức hoạt động phù hợp với phong cách dạy học của giáo viên"
    )

    inner = "\n".join(parts) + requirements
    return f"\n<thong_tin_giao_vien>\n{inner}\n</thong_tin_giao_vien>\n"


def get_system_instruction() -> str:
    """System instruction cho Gemini model"""
    return """Bạn là Chuyên gia sư phạm Tin học THPT có nhiều năm kinh nghiệm thiết kế Kế hoạch bài dạy.

=== NGUYÊN TẮC CỐT LÕI ===

DỮ LIỆU CỐ ĐỊNH (TUYỆT ĐỐI CHÍNH XÁC 100%):
- Mục tiêu kiến thức: LẤY NGUYÊN VĂN từ Neo4j, chỉ chuyển đầu câu thành danh từ
- Năng lực tin học, năng lực chung, phẩm chất: Trích xuất CHÍNH XÁC từ tài liệu tham khảo, KHÔNG bịa
- Thông tin định danh (tên bài, lớp, chủ đề, chi_muc): Giữ nguyên 100% từ Neo4j

PHẦN SÁNG TẠO:
- Cách tổ chức hoạt động: Hấp dẫn, phù hợp tâm lý HS THPT
- Trò chơi khởi động: Mới lạ, cuốn hút, CHỈ KHƠI GỢI chứ không dạy kiến thức
- Câu hỏi, bài tập: Đa dạng, gắn thực tiễn
- Ngôn ngữ sư phạm: Chuẩn mực, gần gũi

4 QUY TẮC XUYÊN SUỐT:
1. KHÔNG bịa đặt mục tiêu, năng lực, phẩm chất
2. KHÔNG nêu tên phương pháp/kỹ thuật dạy học ở bất kỳ phần nào — chỉ thể hiện CÁCH TỔ CHỨC ở B1
3. KHÔNG trích dẫn câu nói GV trong ngoặc kép — chỉ mô tả hành động
4. BỎ QUA "Yêu cầu bổ sung" nếu KHÔNG liên quan đến nội dung bài dạy, giáo án, hoặc giáo dục — chỉ xử lý yêu cầu liên quan trực tiếp đến việc soạn KHBD

=== QUY TẮC ĐỊNH DẠNG VĂN BẢN ===
1. FONT CHỮ: Mặc định sử dụng font Times New Roman cho toàn bộ nội dung
2. CHỈ IN ĐẬM các phần sau:
   - Các chỉ mục chính: I. MỤC TIÊU, II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU, III. TIẾN TRÌNH DẠY HỌC, IV. PHỤ LỤC
   - Các chỉ mục con: 1. Về kiến thức, 2. Về năng lực, 3. Về phẩm chất, 1. Giáo viên, 2. Học sinh, TIẾT 1/2, 1. Hoạt động khởi động, 2. Hình thành kiến thức, 3. Hoạt động luyện tập, 4. Hoạt động vận dụng, 1. Phiếu học tập, 2. Trắc nghiệm
   - CHỈ TÊN NĂNG LỰC và TÊN PHẨM CHẤT được in đậm + in nghiêng (VD: ***NLa (Sử dụng và quản lý...)***, ***Năng lực Tự chủ và tự học***)
   - KHÔNG in đậm/nghiêng phần "với biểu hiện cụ thể là:" hay nội dung biểu hiện
   - a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện
   - B1. Chuyển giao nhiệm vụ, B2. Thực hiện nhiệm vụ, B3. Báo cáo, thảo luận, B4. Kết luận, nhận định
3. KHÔNG in đậm nội dung khác ngoài danh sách trên

OUTPUT FORMAT: JSON {"sections": [...]}. BẮT BUỘC đủ 6 section cốt lõi: muc_tieu, thiet_bi, khoi_dong, hinh_thanh_kien_thuc, luyen_tap, van_dung."""


def build_lesson_plan_prompt(
    neo4j_data: dict,
    activities_info: str,
    teaching_instructions: str,
    lesson_content_section: str,
    docs_instruction: str,
    topic: str,
    lesson_name: str,
    grade: str,
    book_type: str,
    teacher_preferences_section: str = "",
) -> str:
    """
    Xây dựng prompt đầy đủ để sinh kế hoạch bài dạy

    Args:
        neo4j_data: Dữ liệu từ Neo4j (dict)
        activities_info: Thông tin hoạt động đã format
        teaching_instructions: Hướng dẫn phương pháp/kỹ thuật
        lesson_content_section: Nội dung bài học từ database
        docs_instruction: Tài liệu tham khảo (năng lực, phẩm chất)
        topic: Chủ đề bài học
        lesson_name: Tên bài học
        grade: Lớp
        book_type: Loại sách

    Returns:
        Prompt đầy đủ để gửi cho LLM
    """
    neo4j_json = json.dumps(neo4j_data, ensure_ascii=False, indent=2)

    # Phần hướng dẫn phương pháp/kỹ thuật (nếu có)
    teaching_section = ""
    if teaching_instructions:
        teaching_section = f'''
---
## HƯỚNG DẪN CÁCH TỔ CHỨC PHƯƠNG PHÁP/KỸ THUẬT DẠY HỌC
(ÁP DỤNG CHÍNH XÁC CHO TỪNG HOẠT ĐỘNG ĐƯỢC CHỈ ĐỊNH)
---
{teaching_instructions}

YÊU CẦU BẮT BUỘC:
- BẮT BUỘC áp dụng PP/KTDH đã chọn cho từng hoạt động tương ứng
- Thể hiện CÁCH TỔ CHỨC (không nêu tên) trong phần B1. Chuyển giao nhiệm vụ
'''

    prompt = f"""
---
## NHIỆM VỤ: Soạn Kế hoạch bài dạy (KHBD) chi tiết theo CẤU TRÚC và QUY TẮC DƯỚI ĐÂY.
---

### DỮ LIỆU ĐẦU VÀO
<du_lieu_neo4j>
{neo4j_json}

QUY TẮC KHUNG XƯƠNG:
- "bai_hoc_id", "lop", "bai_hoc", "chu_de", "loai_sach", "loai": KHÔNG THAY ĐỔI
- "loai": Xác định loại bài học (VD: "Thực hành", "Lý thuyết", "Ôn tập"...). Dùng để quyết định cách xử lý chi_muc
- "muc_tieu": Chuyển thành câu văn mục tiêu chuẩn (danh từ)
- "chi_muc": Tạo hoạt động học tập theo đúng thứ tự
- "noi_dung": Tham khảo để hiểu bài học
- "dinh_huong": Ghi rõ nếu có, không có thì bỏ qua

</du_lieu_neo4j>

<cau_hinh_hoat_dong>
{activities_info}

===== RÀNG BUỘC THEO VỊ TRÍ DẠY HỌC =====

KHI DẠY Ở "LỚP HỌC" (KHÔNG CÓ MÁY TÍNH):
- HS không có máy tính, chỉ sử dụng bảng/giấy/thảo luận
- RÀNG BUỘC BẮT BUỘC:
  1. KHÔNG yêu cầu HS nhập mã/link trắc nghiệm online → Thay bằng thẻ trả lời ABCD, giơ tay, phiếu giấy
  2. KHÔNG thiết kế bài tập viết code chạy chương trình → Thay bằng phân tích code trên giấy, điền khuyết, sửa lỗi, viết mã giả
  3. KHÔNG yêu cầu HS sử dụng điện thoại, máy tính
  4. KHÔNG nêu NLd/NLe với công cụ số (Padlet, Miro, Google Search...) vì HS không có máy tính

KHI DẠY Ở "PHÒNG MÁY" (CÓ MÁY TÍNH):
- Mỗi HS có máy tính, thực hành trực tiếp
- CÁC HOẠT ĐỘNG ĐƯỢC PHÉP:
  1. Trắc nghiệm online: CHỌN 1 nền tảng duy nhất (Quizizz HOẶC Kahoot)
  2. Bài tập viết code: HS thực hành trên 1 phần mềm duy nhất (Thonny HOẶC PyCharm HOẶC VS Code). Sản phẩm là file code chạy được
  3. Thực hành phần mềm: HS sử dụng trực tiếp phần mềm được học
  4. ĐƯỢC PHÉP nêu NLd/NLe với công cụ số BỔ SUNG (khác công cụ chính của bài)

HÌNH THỨC HOẠT ĐỘNG:
- "Trắc nghiệm": Phòng máy → 1 nền tảng online | Lớp học → thẻ trả lời ABCD hoặc phiếu giấy
- "Phiếu học tập": Tự luận, điền chỗ trống, phân tích code (KHÔNG cho bài viết code chạy được)
- "Bài tập viết code": CHỈ KHI Ở PHÒNG MÁY

=> Thiết kế NỘI DUNG và CÁCH TỔ CHỨC từng hoạt động PHÙ HỢP với vị trí đã chọn!
</cau_hinh_hoat_dong>

QUY TẮC VỀ PHƯƠNG PHÁP/KỸ THUẬT DẠY HỌC:
- KHÔNG nêu tên PP/KTDH ở BẤT KỲ phần nào (Mục tiêu, Nội dung, Sản phẩm, Năng lực chung, Phẩm chất, B1, B2, B3, B4)
- CHỈ thể hiện CÁCH TỔ CHỨC của PP/KTDH ở phần B1
- SAI: "HS hoạt động nhóm sử dụng kỹ thuật Khăn trải bàn...", "Thực hiện kỹ thuật KWL để..."
- ĐÚNG: "HS hoạt động nhóm để thảo luận và trả lời câu hỏi..."

{teaching_section}
{teacher_preferences_section}
{lesson_content_section}
{docs_instruction}

---
## QUY TẮC XUYÊN SUỐT (ÁP DỤNG CHO MỌI PHẦN)
---

QUY TẮC "CHỌN 1 DUY NHẤT":
- KHÔNG viết "hoặc", "/", "hay" để liệt kê nhiều lựa chọn ở bất kỳ phần nào
- SAI: "Giấy A1 hoặc A0", "Thonny hoặc PyCharm", "cá nhân/cặp đôi"
- ĐÚNG: Chọn 1 cái duy nhất và viết rõ ràng

QUY TẮC PHIẾU HỌC TẬP vs GIẤY A1/A0:
- Phiếu học tập (giấy A4 in sẵn): HS làm bài trực tiếp vào phiếu
- Giấy A1/A0 (giấy thảo luận nhóm): HS viết ý tưởng, GV chiếu đề bài lên màn hình
- TUYỆT ĐỐI KHÔNG dùng cả hai trong CÙNG MỘT hoạt động
- Kỹ thuật Khăn trải bàn / Sơ đồ tư duy → BẮT BUỘC dùng giấy A1/A0, KHÔNG dùng phiếu

QUY TẮC KHÔNG TRÍCH DẪN:
- KHÔNG viết câu nói GV trong ngoặc kép "..."
- KHÔNG nhấn mạnh mục đích/ý nghĩa/mục tiêu của trò chơi
- CHỈ mô tả hành động, bước tổ chức

---
## QUY TẮC SOẠN THẢO CHI TIẾT
---

1. MỤC TIÊU:

   a) Về kiến thức:

   1. LẤY NGUYÊN VĂN 100% nội dung từ "muc_tieu" trong Neo4j
   2. KHÔNG ĐƯỢC thêm, bớt, thay đổi, diễn giải, mở rộng, bịa đặt
   3. CHỈ ĐƯỢC chuyển đầu câu thành DANH TỪ:
      - "Biết khái niệm..." → "Khái niệm..."
      - "Hiểu cách..." → "Cách..."
      - "Nắm được nguyên lý..." → "Nguyên lý..."
   4. GIỮ NGUYÊN 100% các từ còn lại

   VÍ DỤ ĐÚNG:
   Neo4j: "Biết khái niệm mảng một chiều và cách khai báo"
   → "Khái niệm mảng một chiều và cách khai báo"

   VÍ DỤ SAI:
   Neo4j: "Biết khái niệm mảng một chiều"
   → SAI: "Khái niệm mảng một chiều và cách sử dụng" (THÊM)
   → SAI: "Khái niệm về mảng" (BỚT)
   → SAI: "Khái niệm cấu trúc dữ liệu mảng" (THAY ĐỔI)

   VALIDATION: Đối chiếu từng chữ với "muc_tieu" Neo4j. Khác biệt → sửa lại.

   b) Năng lực Tin học: (đọc từ <tai_lieu_tham_khao>)
        Phân tích "muc_tieu" và đối chiếu với năng lực tin học trong <tai_lieu_tham_khao>.

        YÊU CẦU:
            1. Xác định NLa / NLb / NLc làm năng lực chính (chọn 01 NL chính).
            - Năng lực chính phải hình thành trực tiếp từ mục tiêu kiến thức.
            - Chỉ ra căn cứ cụ thể trong "muc_tieu".

            2. NLd và NLe KHÔNG xác định từ mục tiêu kiến thức.
            - Chỉ phát triển qua cách tổ chức hoạt động dạy học.
            - NLd: Nêu rõ nguồn thông tin số được sử dụng.
            - NLe: Nêu rõ công cụ số được sử dụng.
            - Khuyến khích thêm NLd/NLe nếu phù hợp. Linh hoạt chọn công cụ, không chỉ dùng ví dụ.

            3. Phân tích "muc_tieu" để tách biểu hiện năng lực:
            - Nhiều cấp độ → tách. Cùng cấp độ → không tách.
            - Không bịa thêm ngoài "muc_tieu".

            4. Mỗi biểu hiện bắt đầu bằng động từ đo lường được.
            - KHÔNG dùng: "Hiểu", "Biết", "Nắm được".
            - DÙNG: "trình bày", "mô tả", "nêu", "liệt kê", "phân biệt", "thực hiện", "sử dụng".

            5. Không suy diễn sang nội dung không có trong "muc_tieu".
            6. Một bài học phát triển 02 năng lực tin học là hợp lý.

            VALIDATION NLd/NLe:

            - NLd và NLe PHẢI dùng công cụ BỔ SUNG, KHÔNG TRÙNG với công cụ thực hành chính của bài!
              + Bài dùng Microsoft Access → NLd KHÔNG dùng Access
              + Bài dùng Thonny → NLe KHÔNG dùng Thonny (dùng Padlet thay thế)

            - LỚP HỌC: KHÔNG nêu NLd/NLe dùng công cụ số (HS không có máy tính)
            - PHÒNG MÁY: ĐƯỢC nêu NLd/NLe, NHƯNG PHẢI có hoạt động tương ứng trong tiến trình

            - Công cụ BỔ SUNG (chỉ khi ở PHÒNG MÁY):
              + NLd: W3Schools, MDN Web Docs, Wikipedia, Google Search, Padlet, Notion, Miro, Quizizz, Kahoot, Canva
              + NLe: Padlet, Miro, Microsoft Teams, Google Docs, Figma, GitHub, Replit

            - QUY TRÌNH:
              BƯỚC 1: Kiểm tra vị trí (Lớp học → bỏ NLd/NLe công cụ số)
              BƯỚC 2: Thiết kế tiến trình TRƯỚC
              BƯỚC 3: CHỈ nêu NLd/NLe nếu đã có hoạt động sử dụng công cụ đó trong tiến trình

            - Nếu nêu NLd/NLe trong mục tiêu → PHẢI có ít nhất 1 hoạt động có:
              + B1: "GV yêu cầu HS truy cập [công cụ] theo link: [link]"
              + B2: "HS thực hiện [hành động] trên [công cụ]"
            - Nếu KHÔNG có hoạt động → KHÔNG được nêu!

            - Ngôn ngữ: ĐÚNG: "GV yêu cầu HS..." | SAI: "GV mời HS...", "GV khuyến khích HS..."

        VÍ DỤ MINH HỌA:
                Ví dụ 1 (KHÔNG TÁCH - cùng cấp độ):
                muc_tieu:
                a) Về kiến thức
                Bài học này cung cấp những kiến thức sau:
                - Cách tạo nội dung trang web theo đoạn văn bản và cách tạo tiêu đề mục.
                - Một số cách làm nổi bật văn bản trên trình duyệt web.
                - Cách tạo siêu liên kết.
                Kết quả mong muốn:
                NLc (Giải quyết vấn đề với sự hỗ trợ của công nghệ thông tin và truyền thông) với các biểu hiện cụ thể sau:
                - Trình bày được cách tạo nội dung trang web theo đoạn văn bản và cách tạo tiêu đề mục.
                - Liệt kê được một số cách làm nổi bật văn bản trên trình duyệt web.
                - Mô tả được cách tạo siêu liên kết.

                --------------------------------

                Ví dụ 2 (KHÔNG TÁCH - cùng cấp độ):
                muc_tieu:
                a) Về kiến thức
                Bài học này cung cấp những kiến thức sau:
                - Các phép so sánh, phép tính logic tạo thành biểu thức logic thể hiện điều kiện rẽ nhánh trong chương trình.
                - Cách viết câu lệnh rẽ nhánh trong Python.

                Kết quả mong muốn:
                NLc (Giải quyết vấn đề với sự hỗ trợ của công nghệ thông tin và truyền thông) với các biểu hiện cụ thể sau:
                - Nêu được các phép so sánh và các phép tính logic tạo thành biểu thức logic thể hiện điều kiện rẽ nhánh trong chương trình.
                - Thực hiện được câu lệnh rẽ nhánh trong Python.

                --------------------------------

                Ví dụ 3 (CÓ TÁCH – NHIỀU CẤP ĐỘ):
                muc_tieu:
                a) Về kiến thức
                Bài học này cung cấp những kiến thức sau:
                - Biết được khái niệm về thiết kế đồ hoạ, phân biệt được đồ hoạ vectơ và đồ hoạ điểm ảnh.
                - Sử dụng được các chức năng cơ bản của phần mềm thiết kế đồ hoạ Inkscape để vẽ hình đơn giản.

                Kết quả mong muốn:
                NLa (Sử dụng và quản lí các phương tiện công nghệ thông tin và truyền thông) với các biểu hiện cụ thể sau:
                - Trình bày được khái niệm về thiết kế đồ hoạ.
                - Phân biệt được đồ hoạ vectơ và đồ hoạ điểm ảnh.
                - Sử dụng được các chức năng cơ bản của phần mềm thiết kế đồ hoạ Inkscape để vẽ hình đơn giản.

                Ví dụ 4 (NLd + NLe - công cụ BỔ SUNG):

                NLe (Hợp tác trong môi trường số) - CHỌN công cụ CỘNG TÁC phù hợp:
                - Thảo luận/chia sẻ ý tưởng → Padlet, Miro, Microsoft Teams
                - Cộng tác soạn thảo → Google Docs, Microsoft 365 Online
                - Cộng tác lập trình → GitHub, Replit
                - Cộng tác thiết kế → Canva, Figma

                NLd (Ứng dụng CNTT trong học tập) - CHỌN công cụ BỔ SUNG:
                - Tra cứu bổ sung → W3Schools, MDN Web Docs, Wikipedia, Google Search
                - Ghi chú/tổng hợp → Notion, OneNote, Padlet
                - Ôn tập → Quizizz, Kahoot
                - Sơ đồ tư duy → Miro, Mindmeister, Canva

                Ví dụ 5 (NLd - BÀI VỀ HTML):
                NLd: Sử dụng W3Schools để tra cứu thêm các thuộc tính nâng cao của thẻ input và form trong HTML.
                (KHÔNG dùng W3Schools Try It Editor vì đó là công cụ thực hành chính)

                Ví dụ 6 (NLe - BÀI VỀ LẬP TRÌNH Python):
                NLe: Sử dụng Padlet để chia sẻ và thảo luận với nhóm về các cách giải quyết bài toán xử lý danh sách.
                (Bài dùng Thonny → NLe KHÔNG dùng Thonny, dùng Padlet/Miro)

                Ví dụ 7 (SAI - công cụ trùng):
                Bài về Microsoft Access 365.
                SAI: NLd: Sử dụng Microsoft Access 365 để tạo bảng (Access là công cụ chính!)
                ĐÚNG: NLd: Sử dụng Padlet để tổng hợp kiến thức về bảng, khóa chính trong CSDL quan hệ.

                Ví dụ 8 (SAI - quá chung chung):
                SAI: NLd: Sử dụng Google Search để tìm hiểu thêm về các định dạng dữ liệu âm thanh...
                ĐÚNG: NLd: Sử dụng Padlet để ghi chú và tổng hợp kiến thức về các định dạng dữ liệu âm thanh...

                Ví dụ 9 (SAI - dùng mạng xã hội):
                SAI: NLe: Sử dụng Facebook, Zalo để trao đổi...
                ĐÚNG: NLe: Sử dụng Padlet để chia sẻ và thảo luận...

                CÁCH TRÌNH BÀY: CHỈ in đậm+nghiêng TÊN NĂNG LỰC, phần còn lại viết thường.
                VD: - ***NLc (Giải quyết vấn đề...)*** với biểu hiện cụ thể sau:
                      + Trình bày được...

   c) Năng lực chung: (Đọc từ <tai_lieu_tham_khao>)
   - Chọn 1-3 năng lực phù hợp.
   - Lấy một biểu hiện cụ thể từ <tai_lieu_tham_khao> → phát triển trong bài.
   - Năng lực chung phát triển qua cách GV tổ chức hoạt động.
   - Bắt đầu bằng động từ keyword của biểu hiện.
   - KHÔNG nêu tên PP/KTDH trong biểu hiện năng lực.
   - CHỈ in đậm+nghiêng TÊN năng lực, không in đậm/nghiêng phần còn lại
   Ví dụ 1:
    Biểu hiện tài liệu: "Phân tích được các công việc cần thực hiện để hoàn thành nhiệm vụ của nhóm; sẵn sàng nhận công việc khó khăn."
    Viết: - ***Năng lực Giao tiếp và hợp tác*** với biểu hiện cụ thể là:
      + Phân tích được các công việc cần thực hiện để hoàn thành nhiệm vụ nhóm về tìm hiểu các thẻ định dạng cơ bản, siêu liên kết trong HTML; sẵn sàng nhận công việc khó khăn sau khi được hướng dẫn, phân công.
   Ví dụ 2:
    Biểu hiện tài liệu: "Phân tích được tình huống trong học tập, trong cuộc sống..."
    Viết: - ***Năng lực Giải quyết vấn đề và sáng tạo*** với biểu hiện cụ thể là:
      + Phân tích được nhiệm vụ của yêu cầu bài học, phát hiện và giải quyết được nhiệm vụ sử dụng điều kiện rẽ nhánh khi thực hiện các câu hỏi trong hoạt động hình thành kiến thức.
   SAI (nêu tên PP/KTDH):
    - "...trong hoạt động tìm hiểu bằng kĩ thuật khăn trải bàn"
    - "...thông qua việc xác định những điều đã biết trong bảng KWL"

   d) Phẩm chất: (Đọc từ <tai_lieu_tham_khao>)
   - Tương tự năng lực chung: lấy biểu hiện từ tài liệu → phát triển trong bài.
   - Phải chỉ rõ hoạt động mà phẩm chất đó được phát triển.
   - CHỈ in đậm+nghiêng TÊN phẩm chất, không in đậm/nghiêng phần còn lại
   SAI: "Sẵn sàng chịu trách nhiệm về kết quả làm việc nhóm."
   ĐÚNG: "Sẵn sàng chịu trách nhiệm về kết quả làm việc nhóm trong hoạt động luyện tập."

2. THIẾT BỊ:

   Phân chia GV - HS:
   - GV chuẩn bị: Phiếu học tập, giấy A1, bút màu, thẻ trả lời → HS KHÔNG liệt kê lại
   - HS chỉ chuẩn bị: SGK, vở ghi, bút, và "Đọc và tìm hiểu trước nội dung [tên bài học]"
   - TUYỆT ĐỐI KHÔNG viết "Kiến thức đã học về..." trong phần HS
   - Máy tính phòng máy do GV chuẩn bị sẵn → KHÔNG viết "Máy tính cá nhân", KHÔNG liệt kê trong phần HS
   - KHÔNG CÓ ĐIỆN THOẠI trong thiết bị HS

   Cách viết:
   - MỖI THIẾT BỊ XUỐNG DÒNG RIÊNG
   - SGK ghi rõ: "SGK Tin học {grade} - {book_type}"
   - Phần mềm: 1 DUY NHẤT, nêu phiên bản: "Phần mềm Thonny 4.1.7"
   - Nền tảng trắc nghiệm: 1 DUY NHẤT: "Bộ câu hỏi trắc nghiệm trên Quizizz: [link]"
   - Giấy thảo luận: 1 LOẠI: "Giấy A1" (KHÔNG viết "A1 hoặc A0")
   - Ghi rõ số phiếu: Phiếu học tập 1, 2...

   Ví dụ ĐÚNG:
      1. Giáo viên
        + SGK Tin học 10 - Kết nối tri thức với cuộc sống (Bài 23).
        + Máy chiếu, màn chiếu, máy tính GV.
        + Kế hoạch bài dạy.
        + PowerPoint bài giảng.
        + Bộ câu hỏi trắc nghiệm trên Quizizz: [link].
        + Phần mềm Thonny 4.1.7 (cài đặt sẵn trên phòng máy).
        + Phiếu học tập 1, 2 (Phụ lục).
        + Giấy A1, bút màu.
        + Thẻ trả lời Đúng/Sai.
      2. Học sinh
        + Đọc và tìm hiểu trước nội dung Bài 23: Một số lệnh làm việc với dữ liệu danh sách.
        + SGK Tin học 10 - Kết nối tri thức với cuộc sống.
        + Vở ghi, bút.

   Ví dụ SAI:
      + Thẻ trả lời câu hỏi (Có/Không) → ĐÚNG: Thẻ trả lời Đúng/Sai
      + Máy tính cá nhân (tại phòng máy) → SAI
      + Giấy A1 hoặc A0 → SAI (dùng "hoặc")
      + Phiếu học tập 1 (hoặc in trên giấy A1) → SAI (trộn lẫn)
      + Kiến thức đã học về... → SAI (KHÔNG dùng cụm từ này)

3. TIẾN TRÌNH:

   Cấu trúc: 2 tiết × 45 phút

   Mỗi hoạt động BẮT BUỘC có:
   a) Mục tiêu: Động từ hành động + nội dung. Mục tiêu từng hoạt động phải bao phủ mục tiêu chung của bài (không thiếu mục tiêu nào).
   b) Nội dung
   c) Sản phẩm
   d) Tổ chức: 4 bước (B1 → B2 → B3 → B4)

   QUY TẮC VIẾT "b) Nội dung":
    - CHỌN MỘT hình thức: cá nhân HOẶC cặp đôi HOẶC nhóm (KHÔNG viết "cá nhân/cặp đôi")
    - KHÔNG đề cập SGK: KHÔNG viết "đọc SGK", "dựa vào SGK"
    - KHÔNG viết chung chung: KHÔNG "để củng cố kiến thức" → PHẢI "để trả lời các câu hỏi trong phiếu học tập số 1"
    - KHÔNG ghi nội dung chi tiết nếu đã có Phiếu học tập (chỉ nêu yêu cầu)
    - Câu hỏi ở "b) Nội dung" KHÔNG lặp nguyên văn ở B1
    - KHÔNG nêu tên PP/KTDH
    - CÔNG THỨC: "HS hoạt động [hình thức] để [hành động cụ thể] [địa điểm/phiếu]"
    Ví dụ ĐÚNG:
      - HS hoạt động theo nhóm, tham gia trò chơi "Đuổi hình bắt chữ" dưới sự hướng dẫn của GV.
      - HS thực hiện thảo luận theo nhóm để trả lời các câu hỏi trong phiếu học tập số 1 nằm trong Phụ lục.
      - HS hoạt động cá nhân để trả lời các câu hỏi sau:
          + Em hãy kể tên một số thiết bị thông minh?
          + Theo em, đặc điểm chung nào khiến một thiết bị được gọi là "thông minh"?
    Ví dụ SAI:
      - "HS hoạt động cá nhân và cặp đôi để tìm hiểu..." (dùng "và")
      - "HS hoạt động nhóm sử dụng kĩ thuật Khăn trải bàn để..." (nêu tên KTDH)

   QUY TẮC VIẾT "c) Sản phẩm":
      1. Hoạt động CÓ PHIẾU HỌC TẬP:
      - "Câu trả lời của HS trên Phiếu học tập số [X]."
      - "Dự kiến câu trả lời:"

      QUY TẮC ĐỊNH DẠNG:
      - Các ý a), b), c), d), e), f) viết thẳng KHÔNG có dấu gạch đầu dòng
      - KHÔNG in đậm nội dung đáp án trong phần Sản phẩm

      Ví dụ ĐÚNG:
      ```
      Câu trả lời của HS trên Phiếu học tập số 1.

      Dự kiến câu trả lời:

      - Câu 1: Biểu thức lôgic là biểu thức cho kết quả là True (đúng) hoặc False (sai).

      - Câu 2:
      a) Phép so sánh bằng (==)
      b) Phép so sánh khác (!=)
      c) Phép so sánh lớn hơn (>)
      d) Phép so sánh nhỏ hơn (<)

      - Câu 3:
      a) and (và): Cả hai điều kiện đều đúng thì kết quả là True.
      b) or (hoặc): Ít nhất một điều kiện đúng thì kết quả là True.
      c) not (phủ định): Đảo ngược giá trị lôgic của điều kiện.
      ```

      Ví dụ SAI (KHÔNG LÀM):
      ```
      • Câu 2:                            <-- SAI: dùng bullet chấm tròn
        • a) Phép so sánh bằng (==)       <-- SAI: có bullet trước a)
      ```
     2. Hoạt động TRẮC NGHIỆM:
      - "Bài làm trắc nghiệm của HS."
      - "Đáp án đúng:" + bảng markdown 2 cột:

       | Câu | Đáp án |
       |-----|--------|
       | 1   | C      |
       | 2   | B      |
       ...
     3. Hoạt động CODE:
      Ví dụ:
      Câu trả lời của HS
        - Sơ đồ kệ trái cây do nhóm thiết kế.
        - Đoạn mã Python khởi tạo và thao tác với list.
      Dự kiến câu trả lời:

      ```python
      TraiCay = ["Táo", "Cam", "Chuối", "Xoài", "Nho",
                 "Ổi", "Lê", "Mít", "Dưa hấu", "Thanh long"]
      print(TraiCay[7])
      del TraiCay[3]
      TraiCay.append("Sầu riêng")
      print("Sầu riêng" in TraiCay)
      for qua in TraiCay:
          print(qua)
      ```

   QUY TẮC VIẾT "d) Tổ chức thực hiện" (CỰC KỲ QUAN TRỌNG):

    MỤC TIÊU: Viết ĐỦ CHI TIẾT để BẤT KỲ AI đọc đều HIỂU NGAY và CÓ THỂ THỰC HIỆN được hoạt động đó!

    NGUYÊN TẮC TRÌNH BÀY BẮT BUỘC:
    - TUYỆT ĐỐI KHÔNG viết gộp nhiều ý thành 1 đoạn văn dài liền mạch
    - MỖI hành động/ý riêng biệt PHẢI xuống dòng mới với gạch đầu dòng (-)
    - Nếu 1 ý có nhiều ý con → dùng chỉ mục cấp nhỏ hơn (+) thụt vào trong
    - Mỗi bước B1/B2/B3/B4 phải có TỐI THIỂU 3-5 dòng gạch đầu dòng riêng biệt

    YÊU CẦU VỀ ĐỘ CHI TIẾT VÀ RÕ RÀNG:
    - Viết CỤ THỂ, TƯỜNG MINH từng bước - không viết chung chung, mơ hồ
    - Nêu RÕ: Ai làm gì? Làm như thế nào? Trong bao lâu? Dùng công cụ/vật liệu gì?
    - Trò chơi/hoạt động: Mô tả LUẬT CHƠI, CÁCH CHƠI, ĐIỀU KIỆN THẮNG/THUA chi tiết
    - Thảo luận nhóm: Nêu rõ CÂU HỎI THẢO LUẬN, CÁCH CHIA NHÓM, SẢN PHẨM YÊU CẦU
    - Phiếu học tập: Nêu rõ PHIẾU SỐ MẤY, CÁCH LÀM, THỜI GIAN
    - KHÔNG viết: "GV tổ chức hoạt động" → PHẢI viết CỤ THỂ hoạt động đó là gì, tổ chức như thế nào

    VÍ DỤ SAI (quá chung chung, không hiểu được):
    - "GV tổ chức cho HS thảo luận về nội dung bài học."
    - "HS thực hiện nhiệm vụ theo yêu cầu của GV."
    - "GV hướng dẫn HS tìm hiểu kiến thức mới."

    VÍ DỤ ĐÚNG (cụ thể, rõ ràng, ai đọc cũng hiểu):
    - "GV chia lớp thành 6 nhóm, mỗi nhóm 5-6 HS. GV phát Phiếu học tập số 1 cho mỗi nhóm."
    - "HS đọc câu hỏi trong phiếu, thảo luận nhóm trong 8 phút, ghi đáp án vào phiếu."
    - "GV chiếu slide chứa đoạn code Python, yêu cầu HS dự đoán kết quả trước khi chạy."

    FORMAT MẪU BẮT BUỘC (viết CHI TIẾT, RÕ RÀNG như ví dụ này):
    ```
    **B1. Chuyển giao nhiệm vụ:**
    - GV chia lớp thành 4 nhóm (mỗi nhóm 4-5 HS), đặt tên nhóm: Táo, Cam, Xoài, Nho.
    - GV chiếu slide chứa đề bài "Tìm hiểu các lệnh làm việc với danh sách" lên màn hình.
    - GV phát cho mỗi nhóm một tờ giấy A1 đã kẻ sẵn 5 ô (4 ô góc + 1 ô trung tâm).
    - GV hướng dẫn cách làm:
      + Mỗi thành viên ghi ý tưởng cá nhân vào ô góc của mình (3 phút đầu).
      + Sau đó, cả nhóm thảo luận và thống nhất đáp án chung ghi vào ô trung tâm.
    - GV quy định thời gian hoàn thành: 10 phút.

    **B2. Thực hiện nhiệm vụ:**
    - HS đọc kỹ 3 câu hỏi trong Phiếu học tập số 1:
      + Câu 1: Nêu cú pháp lệnh append() và insert().
      + Câu 2: Phân biệt lệnh del và remove().
      + Câu 3: Cho ví dụ minh họa việc thêm/xóa phần tử trong danh sách.
    - Mỗi HS suy nghĩ độc lập và ghi ý tưởng vào ô góc (3 phút).
    - Các thành viên lần lượt trình bày ý tưởng của mình cho cả nhóm nghe.
    - Nhóm thảo luận, thống nhất câu trả lời chung, ghi vào ô trung tâm (7 phút).
    - GV đi quanh lớp, quan sát tiến độ, hỗ trợ nhóm gặp khó khăn.

    **B3. Báo cáo, thảo luận:**
    - GV mời đại diện nhóm Táo dán giấy A1 lên bảng và trình bày kết quả.
    - GV mời nhóm Cam nhận xét, bổ sung những điểm khác biệt.
    - Các nhóm còn lại nêu ý kiến bổ sung nếu có.
    - GV ghi nhận các điểm đúng và các điểm cần sửa lại.

    **B4. Kết luận, nhận định:**
    - GV nhận xét tinh thần hợp tác của các nhóm: "Nhóm Táo trình bày rõ ràng, nhóm Cam có bổ sung hay."
    - GV chốt kiến thức:
      + Lệnh append(x) thêm x vào CUỐI danh sách.
      + Lệnh insert(i, x) thêm x vào VỊ TRÍ i.
      + Lệnh del list[i] xóa phần tử theo CHỈ SỐ.
      + Lệnh list.remove(x) xóa phần tử theo GIÁ TRỊ.
    - GV lưu ý lỗi sai thường gặp: Nhầm lẫn giữa del và remove.
    - GV tuyên dương nhóm có câu trả lời đầy đủ nhất.
    ```

    SAI (viết gộp liền tù tì — TUYỆT ĐỐI KHÔNG ĐƯỢC):
    ```
    **B1. Chuyển giao nhiệm vụ:** GV giao nhiệm vụ "Viết một hàm Python có tên thoi_gian_gap_nhau(s, v1, v2) để tính thời gian hai xe gặp nhau..."
    ```

    ĐÚNG (cùng nội dung nhưng xuống dòng từng ý):
    ```
    **B1. Chuyển giao nhiệm vụ:**
    - GV chiếu đề bài lên màn hình:
      + Viết một hàm Python có tên `thoi_gian_gap_nhau(s, v1, v2)`.
      + Hàm nhận 3 tham số: `s` (quãng đường, km), `v1` (vận tốc xe 1, km/h), `v2` (vận tốc xe 2, km/h).
      + Hai xe đi ngược chiều và gặp nhau.
      + Hàm trả về thời gian gặp nhau (giờ) hoặc thông báo nếu không thể gặp nhau.
    - GV yêu cầu HS mở Thonny, tạo file mới.
    - GV hướng dẫn HS thử với các giá trị khác nhau.
    ```

    - BẮT BUỘC ĐÚNG TÊN 4 BƯỚC (không thay đổi, không viết tắt, không thêm chữ):
      + B1. Chuyển giao nhiệm vụ
      + B2. Thực hiện nhiệm vụ
      + B3. Báo cáo, thảo luận
      + B4. Kết luận, nhận định

    - **B1. Chuyển giao nhiệm vụ:** (GV là chủ thể - MÔ TẢ CỤ THỂ GV LÀM GÌ)
       - Thể hiện CÁCH TỔ CHỨC PP/KTDH (không nêu tên)
       - CHỈ mô tả bước tổ chức, KHÔNG viết câu hỏi kiến thức (đã có ở b) Nội dung)
       - KHÔNG viết câu chốt, dẫn dắt vào bài (để ở B4)
       - KHÔNG viết ví dụ trong ngoặc đơn ở luật chơi
         SAI: "GV đưa ra yêu cầu (ví dụ: tìm một số trong dãy...)"
         ĐÚNG: "GV chiếu dãy số [1, 5, 3, 8, 2, 9, 4] lên màn hình và yêu cầu HS tìm số 8."
       - Nếu trò chơi: Nêu RÕ luật chơi, cách chơi, điều kiện thắng-thua
       - Chia nhóm rõ ràng (nếu có): số nhóm, số HS/nhóm
       - Phát phiếu/giấy cho HS (nếu có)
       - NÊU RÕ: GV chiếu/phát/yêu cầu CÁI GÌ CỤ THỂ, thời gian bao lâu

    - **B2. Thực hiện nhiệm vụ:** (HS là chủ thể - MÔ TẢ CỤ THỂ HS LÀM GÌ)
       - Nêu rõ thời gian HS làm việc (VD: "trong 10 phút")
       - Mô tả TỪNG BƯỚC HS thực hiện, mỗi bước 1 dòng gạch đầu dòng
       - NÊU RÕ: HS làm gì? Ở đâu? Bằng cách nào? Sản phẩm là gì?
       - GV quan sát, hướng dẫn khi cần
       KHÔNG viết: "HS đọc thông tin..." → NÊN: "HS tìm hiểu thông tin..."
       KHÔNG viết: "HS thực hiện nhiệm vụ" → NÊN: Mô tả CỤ THỂ nhiệm vụ đó là gì

    - **B3. Báo cáo, thảo luận:** (MÔ TẢ CỤ THỂ CÁCH BÁO CÁO)
       - Hình thức báo cáo: đại diện nhóm/cá nhân trình bày
       - NÊU RÕ: Báo cáo CÁI GÌ? Bằng hình thức nào? Bao nhiêu nhóm/HS?
       - Phương tiện: trên bảng/giấy/trình chiếu
       - Các nhóm/HS khác nhận xét, bổ sung
       - GV ghi nhận, trao đổi
       KHÔNG viết: "GV chỉ định ngẫu nhiên hoặc lần lượt..." → NÊN: "GV mời ngẫu nhiên 2-3 HS trả lời."

    - **B4. Kết luận, nhận định:** (MÔ TẢ CỤ THỂ GV CHỐT KIẾN THỨC GÌ)
       - GV nhận xét quá trình thực hiện của HS/nhóm
       - GV chốt kiến thức trọng tâm (CHỈ ở HTKT/Luyện tập/Vận dụng, KHÔNG ở Khởi động)
       - NÊU RÕ: Chốt KIẾN THỨC GÌ CỤ THỂ (không viết chung chung "chốt kiến thức")
       - Lưu ý lỗi sai HS thường gặp (nêu cụ thể lỗi gì nếu có)
       - Khen thưởng nhóm/cá nhân (nếu có)

       Ví dụ ĐÚNG (khởi động — KHÔNG chốt kiến thức):
       - GV tuyên dương tinh thần tham gia của cả lớp.
       - GV dẫn dắt HS vào bài học mới.

       SAI (khởi động — KHÔNG được chốt kiến thức):
       - "GV chốt lại rằng việc tìm kiếm hiệu quả là rất quan trọng..."

   Khởi động (5 phút):
   - GỢI MỞ, KHƠI GỢI nhu cầu tìm hiểu - KHÔNG DẠY KIẾN THỨC
   - Tên trò chơi cuốn hút, thiết kế sinh động hấp dẫn
   - TUYỆT ĐỐI không chạm vào kiến thức phần Hình thành kiến thức
   - CÓ THỂ đặt câu hỏi khó → giải đáp ở phần HTKT

   Hình thành kiến thức (40 phút):
   - TẠO hoạt động con theo "chi_muc" từ Neo4j (giữ đúng thứ tự)
   - Chia thời gian phù hợp cho các hoạt động con

   Luyện tập:
   - Bắt đầu bằng "củng cố" + kiến thức đã học
   - Câu hỏi phải bao trọn kiến thức đã học trong phần HTKT

   Vận dụng:
   - Bắt đầu bằng "vận dụng" + kiến thức đã học
   - Câu hỏi gắn với thực tiễn

   Thời lượng:
   - Khởi động: 5 phút
   - Hình thành kiến thức: 40 phút
   - Luyện tập + Vận dụng: 45 phút (chia phù hợp)

4. NỘI DUNG CHUYÊN MÔN VÀ THIẾT KẾ CÂU HỎI/BÀI TẬP:

   NGUYÊN TẮC CHUNG:
   - Dựa trên "noi_dung" từ Neo4j và <noi_dung_bai_hoc_chi_tiet>
   - Bổ sung ví dụ code Python, bài tập cụ thể
   - Kiến thức không vượt quá nội dung bài học trong Neo4j
   - Nếu mục tiêu nêu năng lực chung/phẩm chất → BẮT BUỘC có hoạt động tương ứng
   - Nếu tài liệu mâu thuẫn với Neo4j → ƯU TIÊN Neo4j

   THIẾT KẾ CÂU HỎI/BÀI TẬP (CỰC KỲ QUAN TRỌNG):

   1. PHÙ HỢP MỤC TIÊU TỪNG HOẠT ĐỘNG:
      - Hình thành kiến thức: Câu hỏi giúp HS khám phá, phát hiện kiến thức mới
      - Luyện tập: Câu hỏi/bài tập củng cố, áp dụng trực tiếp kiến thức vừa học
      - Vận dụng: Bài tập nâng cao, gắn với thực tiễn, yêu cầu tư duy sáng tạo

   2. TUÂN THỦ DỮ LIỆU SGK TỪ NEO4J:
      - CHỈ sử dụng kiến thức có trong "noi_dung" và "chi_muc" của Neo4j
      - KHÔNG đặt câu hỏi/bài tập về nội dung SGK bài đó KHÔNG đề cập
      - KHÔNG sử dụng thuật ngữ, khái niệm ngoài phạm vi bài học

   3. KHUYẾN KHÍCH SÁNG TẠO BÀI TẬP MỚI:
      - TẠO bài tập MỚI dựa trên kiến thức SGK, KHÔNG sao chép nguyên văn bài tập trong SGK
      - Thay đổi ngữ cảnh, số liệu, ví dụ để bài tập phong phú hơn
      - Bài tập code: Tạo đề bài mới với yêu cầu tương tự nhưng ngữ cảnh khác
      - VD: SGK có bài tập tính diện tích → Tạo bài tập mới: tính chi phí, tính tiền điện...

   4. VALIDATION CÂU HỎI/BÀI TẬP:
      - TRƯỚC KHI viết câu hỏi → Kiểm tra: Kiến thức này có trong Neo4j không?
      - Nếu KHÔNG → KHÔNG được sử dụng
      - Nếu CÓ → Sáng tạo câu hỏi MỚI dựa trên kiến thức đó

5. PHIẾU HỌC TẬP (CHỈ CHO BÀI TẬP TỰ LUẬN):
   - CHỈ dùng cho: tự luận, điền chỗ trống, bài tập viết code trên giấy
   - KHÔNG TẠO phiếu cho TRẮC NGHIỆM
   - KHÔNG để đáp án trong phiếu (đáp án ở phần "c) Sản phẩm")
   - KHÔNG đưa nội dung phần "d) Tổ chức" vào phiếu

   BẮT BUỘC SỬ DỤNG ĐỊNH DẠNG JSON CHO PHIẾU HỌC TẬP:
   Phiếu học tập PHẢI có trường "worksheet_data" chứa JSON có cấu trúc ĐƠN GIẢN như sau:

   CHỈ CÓ 3 LOẠI CÂU HỎI:

   LOẠI 1 - CÂU HỎI ĐƠN GIẢN (chỉ có text + dòng trả lời):
   ```json
   {{
     "id": "1",
     "text": "Nội dung câu hỏi",
     "answer_lines": 3
   }}
   ```

   LOẠI 2 - CÂU HỎI CÓ CÁC Ý CON (a, b, c, d):
   ```json
   {{
     "id": "2",
     "text": "Câu hỏi chính",
     "sub_items": [
       {{"id": "a", "text": "Nội dung ý a"}},
       {{"id": "b", "text": "Nội dung ý b"}},
       {{"id": "c", "text": "Nội dung ý c"}}
     ],
     "answer_lines": 3
   }}
   ```

   LOẠI 3 - CÂU HỎI CÓ CODE:
   ```json
   {{
     "id": "3",
     "text": "Cho đoạn chương trình sau, hãy cho biết kết quả",
     "code": "x = 5\\ny = 10\\nprint(x + y)",
     "answer_lines": 2
   }}
   ```

   CẤU TRÚC ĐẦY ĐỦ PHIẾU HỌC TẬP:
   ```json
   {{
     "section_type": "phieu_hoc_tap",
     "title": "Phiếu học tập số 1",
     "worksheet_data": {{
       "worksheet_number": 1,
       "type": "group",
       "task": "Mô tả nhiệm vụ của phiếu",
       "questions": [
         {{
           "id": "1",
           "text": "Câu hỏi đơn giản?",
           "answer_lines": 3
         }},
         {{
           "id": "2",
           "text": "Câu hỏi có nhiều ý:",
           "sub_items": [
             {{"id": "a", "text": "Ý a"}},
             {{"id": "b", "text": "Ý b"}}
           ],
           "answer_lines": 4
         }},
         {{
           "id": "3",
           "text": "Cho đoạn code sau, hãy cho biết kết quả:",
           "code": "print('Hello')",
           "answer_lines": 2
         }}
       ]
     }}
   }}
   ```

   QUY TẮC:
   - `answer_lines`: Số dòng trả lời (FULL WIDTH - chiếm hết chiều rộng giấy)
   - `sub_items`: Các ý con a, b, c, d - dòng trả lời ĐẶT SAU TẤT CẢ các ý
   - `code`: Đoạn code hiển thị - dòng trả lời ĐẶT SAU code
   - KHÔNG dùng các trường phức tạp như: blanks, fill_blanks, code_template
   - KỸ THUẬT KWL: Dùng `"kwl_table": true`

6. TRẮC NGHIỆM:
   - CHỈ TẠO section "trac_nghiem" KHI VÀ CHỈ KHI có hoạt động với "Hình thức hoạt động: Trắc nghiệm" trong <cau_hinh_hoat_dong>
   - TUYỆT ĐỐI KHÔNG tạo section trắc nghiệm nếu không có hoạt động nào chọn hình thức "Trắc nghiệm"
   - Nếu có hoạt động trắc nghiệm → tạo ít nhất 10-15 câu
   - TẤT CẢ câu trắc nghiệm gom vào 1 section "trac_nghiem" DUY NHẤT
   - KHÔNG tạo phiếu học tập chứa trắc nghiệm
   - Mỗi câu PHẢI có 4 đáp án (A, B, C, D)
   - CHỈ HỖ TRỢ CHỌN 1 ĐÁP ÁN ĐÚNG: "answer" = 1 chữ cái (VD: "A")
   - KHÔNG hỗ trợ chọn nhiều đáp án ("multiple_select")
   - KHÔNG có đáp án "Tất cả các đáp án trên"
   - TIẾNG VIỆT, KHÔNG DÙNG TIẾNG ANH

7. ĐỊNH DẠNG CODE:
   - BẮT BUỘC dùng markdown code block: ```python
   - KHÔNG đánh số dòng thủ công (1. 2. 3...)
   - Thụt lề đúng chuẩn Python (4 spaces)

   SAI (đánh số thủ công):
     ```
     1. kWh = float(input("Nhập số kWh: "))
     2. if kWh <= 50:
     ```

   ĐÚNG:
     ```python
     kWh = float(input("Nhập số kWh: "))
     if kWh <= 50:
         tien_dien = kWh * 1.678
     elif kWh <= 100:
         tien_dien = 50 * 1.678 + (kWh - 50) * 1.734
     else:
         tien_dien = 50 * 1.678 + 50 * 1.734 + (kWh - 100) * 2.014
     print("Tiền điện:", tien_dien)
     ```

   Trong JSON: \\`\\`\\`python\\n...code...\\n\\`\\`\\`

---
## OUTPUT FORMAT: JSON (BẮT BUỘC)
---

QUAN TRỌNG - TÊN 4 BƯỚC TRONG "d) Tổ chức thực hiện":
- PHẢI ĐÚNG CHÍNH XÁC VÀ IN ĐẬM: **B1. Chuyển giao nhiệm vụ:** | **B2. Thực hiện nhiệm vụ:** | **B3. Báo cáo, thảo luận:** | **B4. Kết luận, nhận định:**
- KHÔNG thay đổi, viết tắt, thêm bớt chữ
- SAI: "B1. Đặt vấn đề", "Bước 1:", "Giai đoạn 1", "B1: Giới thiệu"
- ĐÚNG: "B1. Chuyển giao nhiệm vụ"

QUAN TRỌNG - TRÌNH BÀY B1/B2/B3/B4:
- TUYỆT ĐỐI KHÔNG viết gộp nhiều ý thành 1 câu dài sau dấu hai chấm
- MỖI hành động PHẢI xuống dòng mới với gạch đầu dòng (-)
- Nếu có ý con → dùng (+) thụt vào trong
- Mỗi bước tối thiểu 3-5 dòng gạch đầu dòng riêng biệt

Trả về JSON với cấu trúc sau (NỘI DUNG PHẢI ĐẦY ĐỦ VÀ CHI TIẾT):

{{
  "sections": [
    {{
      "section_type": "thong_tin_chung",
      "title": "Thông tin chung",
      "content": "# **KẾ HOẠCH BÀI DẠY**\\n\\n**TRƯỜNG:** ........................\\n**GIÁO VIÊN:** ........................\\n**TỔ:** TIN HỌC\\n\\n**CHỦ ĐỀ:** {topic}\\n**BÀI:** {lesson_name}\\n**Môn học:** Tin Học\\n**Lớp:** {grade}\\n**Bộ sách:** {book_type}\\n**Thời lượng:** 02 tiết"
    }},
    {{
      "section_type": "muc_tieu",
      "title": "Mục tiêu bài học",
      "content": "## **I. MỤC TIÊU**\\n\\n### **1. Về kiến thức**\\n- [Viết mục tiêu kiến thức dạng danh từ]\\n\\n### **2. Về năng lực**\\n\\n**a) Năng lực tin học**\\n- ***NLa (Tên năng lực)*** với biểu hiện cụ thể sau:\\n  + [biểu hiện cụ thể]\\n- ***NLc (Tên năng lực)*** với các biểu hiện cụ thể sau:\\n  + [biểu hiện cụ thể]\\n\\n**b) Năng lực chung**\\n- ***Năng lực [Tên NL chung]*** với biểu hiện cụ thể là:\\n  + [biểu hiện cụ thể]\\n\\n### **3. Về phẩm chất**\\n- ***[Tên phẩm chất]:*** [biểu hiện cụ thể]"
    }},
    {{
      "section_type": "thiet_bi",
      "title": "Thiết bị dạy học",
      "content": "## **II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU**\\n\\n### **1. Giáo viên**\\n- [Thiết bị GV]\\n\\n### **2. Học sinh**\\n- Đọc và tìm hiểu trước nội dung [Tên bài học].\\n- SGK Tin học [Lớp] - [Bộ sách].\\n- Vở ghi, bút."
    }},
    {{
      "section_type": "khoi_dong",
      "title": "Hoạt động 1: Khởi động",
      "content": "## **III. TIẾN TRÌNH DẠY HỌC**\\n\\n### **TIẾT 1 (45 phút)**\\n\\n#### **1. Hoạt động khởi động (5 phút)**\\n\\n**a) Mục tiêu:**\\n- [Mục tiêu cụ thể]\\n\\n**b) Nội dung:**\\nHS hoạt động [cá nhân/cặp đôi/nhóm] để tham gia [tên hoạt động]\\n\\n**c) Sản phẩm:**\\nCâu trả lời của HS.\\nDự kiến câu trả lời:\\n- [Đáp án]\\n\\n**d) Tổ chức thực hiện:**\\n\\n**B1. Chuyển giao nhiệm vụ:**\\n- [Hành động 1 của GV]\\n- [Hành động 2 của GV]\\n- [Hành động 3 của GV]\\n\\n**B2. Thực hiện nhiệm vụ:**\\n- [Bước 1 HS thực hiện]\\n- [Bước 2 HS thực hiện]\\n- [GV quan sát, hỗ trợ]\\n\\n**B3. Báo cáo, thảo luận:**\\n- [Hình thức báo cáo]\\n- [HS/nhóm khác nhận xét]\\n\\n**B4. Kết luận, nhận định:**\\n- [GV nhận xét]\\n- [GV chốt kiến thức]"
    }},
    {{
      "section_type": "hinh_thanh_kien_thuc",
      "title": "Hoạt động 2: Hình thành kiến thức mới",
      "content": "#### **2. Hình thành kiến thức (40 phút)**\\n\\n**Hoạt động 2.1: [Tên hoạt động theo chi_muc[0]] ([X] phút)**\\n\\n**a) Mục tiêu:**\\n- [Mục tiêu]\\n\\n**b) Nội dung:**\\n[Nội dung chi tiết]\\n\\n**c) Sản phẩm:**\\n[Sản phẩm dự kiến]\\n\\n**d) Tổ chức thực hiện:**\\n\\n**B1. Chuyển giao nhiệm vụ:**\\n- [Chi tiết]\\n\\n**B2. Thực hiện nhiệm vụ:**\\n- [Chi tiết]\\n\\n**B3. Báo cáo, thảo luận:**\\n- [Chi tiết]\\n\\n**B4. Kết luận, nhận định:**\\n- [Chi tiết]\\n\\n**Hoạt động 2.2: [Tên hoạt động theo chi_muc[1]] ([Y] phút)**\\n[Cấu trúc tương tự a, b, c, d]\\n\\n**Hoạt động 2.3: [Tên hoạt động theo chi_muc[2]] ([Z] phút)**\\n[Cấu trúc tương tự - TẠO THÊM 2.4, 2.5... nếu có nhiều chi_muc]"
    }},
    {{
      "section_type": "luyen_tap",
      "title": "Hoạt động 3: Luyện tập",
      "content": "### **TIẾT 2 (45 phút)**\\n\\n#### **3. Hoạt động luyện tập (20 phút)**\\n\\n**a) Mục tiêu:**\\n- Củng cố [kiến thức đã học]\\n\\n**b) Nội dung:**\\n[Nội dung chi tiết]\\n\\n**c) Sản phẩm:**\\n[Sản phẩm]\\n\\n**d) Tổ chức thực hiện:**\\n\\n**B1. Chuyển giao nhiệm vụ:**\\n- [Chi tiết]\\n\\n**B2. Thực hiện nhiệm vụ:**\\n- [Chi tiết]\\n\\n**B3. Báo cáo, thảo luận:**\\n- [Chi tiết]\\n\\n**B4. Kết luận, nhận định:**\\n- [Chi tiết]"
    }},
    {{
      "section_type": "van_dung",
      "title": "Hoạt động 4: Vận dụng",
      "content": "#### **4. Hoạt động vận dụng (25 phút)**\\n\\n**a) Mục tiêu:**\\n- Vận dụng [kiến thức đã học]\\n\\n**b) Nội dung:**\\n[Nội dung chi tiết]\\n\\n**c) Sản phẩm:**\\n[Sản phẩm]\\n\\n**d) Tổ chức thực hiện:**\\n\\n**B1. Chuyển giao nhiệm vụ:**\\n- [Chi tiết]\\n\\n**B2. Thực hiện nhiệm vụ:**\\n- [Chi tiết]\\n\\n**B3. Báo cáo, thảo luận:**\\n- [Chi tiết]\\n\\n**B4. Kết luận, nhận định:**\\n- [Chi tiết]"
    }},
    {{
      "section_type": "phieu_hoc_tap",
      "title": "Phiếu học tập số 1",
      "worksheet_data": {{
        "worksheet_number": 1,
        "type": "group",
        "task": "[Mô tả nhiệm vụ của phiếu]",
        "questions": [
          {{
            "id": "1",
            "text": "[Câu hỏi đơn giản]",
            "answer_lines": 3
          }},
          {{
            "id": "2",
            "text": "[Câu hỏi có nhiều ý]",
            "sub_items": [
              {{"id": "a", "text": "[Ý a]"}},
              {{"id": "b", "text": "[Ý b]"}}
            ],
            "answer_lines": 3
          }},
          {{
            "id": "3",
            "text": "[Câu hỏi có code]",
            "code": "print('Hello')",
            "answer_lines": 2
          }}
        ]
      }}
    }},
    {{
      "section_type": "trac_nghiem",
      "title": "Trắc nghiệm",
      "questions": [
        {{
          "question": "[Câu hỏi chọn 1 đáp án đúng]",
          "A": "[Đáp án A]",
          "B": "[Đáp án B]",
          "C": "[Đáp án C]",
          "D": "[Đáp án D]",
          "answer": "A"
        }}
      ]
    }}
  ]
}}

QUY TẮC JSON:
1. Mỗi section_type DUY NHẤT, trừ "phieu_hoc_tap" có thể NHIỀU (số 1, 2, 3...)
2. "content" chứa Markdown, dùng \\n cho xuống dòng, \\\\ cho backslash
3. Escape: " → \\" và \\ → \\\\
4. Thứ tự: muc_tieu → thiet_bi → khoi_dong → hinh_thanh_kien_thuc → luyen_tap → van_dung → phieu_hoc_tap → trac_nghiem
5. KHÔNG wrap trong ```json```, KHÔNG thêm giải thích
6. Section "trac_nghiem": dùng array "questions" (không dùng "content")
7. TẠO ĐỦ số phiếu học tập theo yêu cầu hoạt động
8. HTKT: Tạo hoạt động con 2.1, 2.2... theo SỐ LƯỢNG chi_muc từ Neo4j
9. TRẮC NGHIỆM CHỈ TẠO KHI có hoạt động chọn hình thức "Trắc nghiệm". KHÔNG TẠO nếu không có yêu cầu!
10. PHIẾU HỌC TẬP CHỈ CẦN "worksheet_data" (JSON theo 3 loại câu hỏi ở mục 5), KHÔNG cần "content"

BẮT BUỘC ĐỦ 6 SECTION CỐT LÕI: muc_tieu, thiet_bi, khoi_dong, hinh_thanh_kien_thuc, luyen_tap, van_dung. KHÔNG bỏ sót!

---
HÃY BẮT ĐẦU SOẠN NGAY! Trả về JSON thuần túy, không có gì khác.
---
"""
    return prompt

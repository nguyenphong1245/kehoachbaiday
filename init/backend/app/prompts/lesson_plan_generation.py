import json
from typing import Optional


def get_system_instruction() -> str:
    """System instruction cho Gemini model"""
    return """Bạn là Chuyên gia sư phạm Tin học THPT có nhiều năm kinh nghiệm thiết kế Kế hoạch bài dạy.

Tư duy làm việc của bạn là sáng tạo, chi tiết, logic và tuân thủ nghiêm ngặt các quy tắc đã cho:
1. Phần khung (Loại sách, định hướng, lớp, chủ đề, bài học, mục tiêu, năng lực, chỉ mục, nội dung): Phải lấy cứng từ dữ liệu Neo4j.
2. Nội dung phẩm chất và năng lực chung: Phải trích xuất từ Tài liệu tham khảo.
3. TUYỆT ĐỐI KHÔNG BỊA ĐẶT những thông tin định danh (Tên bài, lớp, chủ đề, mục tiêu về kiến thức).
4. Áp dụng các phương pháp/kỹ thuật dạy học đã được chọn cho từng hoạt động.
5. Mỗi hoạt động phải có: Mục tiêu, Nội dung, Sản phẩm, Tổ chức (4 bước: Chuyển giao → Thực hiện → Báo cáo → Kết luận).
6. Ngôn ngữ sư phạm chuẩn,sáng tạo, không bịa đặt thông tin.

OUTPUT FORMAT: Trả về JSON với cấu trúc {"sections": [...]} chứa các section của giáo án. Mỗi section có content là Markdown."""


def build_lesson_plan_prompt(
    neo4j_data: dict,
    activities_info: str,
    teaching_instructions: str,
    lesson_content_section: str,
    docs_instruction: str,
    topic: str,
    lesson_name: str,
    grade: str,
    book_type: str
) -> str:
    """
    Xây dựng prompt đầy đủ để sinh kế hoạch bài dạy
    
    Args:
        neo4j_data: Dữ liệu từ Neo4j (dict)
        activities_info: Thông tin hoạt động đã format
        teaching_instructions: Hướng dẫn phương pháp/kỹ thuật
        lesson_content_section: Nội dung bài học từ SQLite
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

**YÊU CẦU BẮT BUỘC:**
- Ở mỗi hoạt động, BẮT BUỘC áp dụng phương pháp/kỹ thuật đã được người dùng chọn
- Phải đọc rõ cách tổ chức phương pháp/kỹ thuật trong phần này để áp dụng CHÍNH XÁC và thể hiện trong phần chuyển giao nhiệm vụ của hoạt động tương ứng.
'''

    prompt = f"""
---
## NHIỆM VỤ: Soạn Kế hoạch bài dạy (KHBD) chi tiết theo CẤU TRÚC và QUY TẮC DƯỚI ĐÂY.
---

### DỮ LIỆU ĐẦU VÀO
<du_lieu_neo4j>
{neo4j_json}

**QUY TẮC KHUNG XƯƠNG:**
- "bai_hoc_id", "lop", "bai_hoc", "chu_de", "loai_sach", "loai": KHÔNG THAY ĐỔI
- "loai": Xác định loại bài học (VD: "Thực hành", "Lý thuyết", "Ôn tập"...). Dùng để quyết định cách xử lý chi_muc
- "muc_tieu": Chuyển thành câu văn mục tiêu chuẩn (danh từ)
- "chi_muc": Tạo hoạt động học tập theo đúng thứ tự
- "noi_dung": Tham khảo để hiểu bài học
- "dinh_huong": Ghi rõ nếu có, không có thì bỏ qua

</du_lieu_neo4j>

<cau_hinh_hoat_dong>
{activities_info}
</cau_hinh_hoat_dong>

{teaching_section}
{lesson_content_section}
{docs_instruction}

---
## QUY TẮC SOẠN THẢO
---

**1. MỤC TIÊU:**

   **a) Về kiến thức:** Dạng DANH TỪ
   ĐÚNG: "Khái niệm mảng một chiều" | SAI: "Biết khái niệm mảng"
    - Không bao giờ được thay đổi bất kì một chữ nào từ "muc_tieu" từ Neo4j và bắt đầu bằng danh từ cho từng mục tiêu.

   **b) Năng lực Tin học:** (đọc các năng lực tin học từ <tai_lieu_tham_khao>) 
        Nhiệm vụ của bạn là phân tích nội dung "muc_tieu" và đối chiếu với các năng lực tin học trong <tai_lieu_tham_khao> để xác định đúng năng lực tin học chính (NLa / NLb / NLc) và tách các biểu hiện năng lực tương ứng.
        YÊU CẦU BẮT BUỘC:
            1. Đối chiếu nội dung "muc_tieu" với các năng lực tin học trong <tai_lieu_tham_khao> để xác định NLa / NLb / NLc.

            2. Chỉ chọn 01 năng lực tin học chính.
            - Năng lực chính phải được hình thành trực tiếp từ mục tiêu về kiến thức.
            - Không chọn năng lực chính nếu mục tiêu không yêu cầu trực tiếp các biểu hiện cốt lõi của năng lực đó.
            - Khi xác định năng lực chính, phải chỉ ra rõ những yêu cầu cụ thể trong "muc_tieu" làm căn cứ lựa chọn.

            4. NLd và NLe KHÔNG được xác định từ mục tiêu kiến thức.
            - NLd và NLe chỉ được phát triển thông qua cách tổ chức hoạt động dạy học.
            - Khi nêu biểu hiện cụ thể đối với NLe bày rõ công cụ số được sử dụng.
            - Khi nêu biểu hiện cụ thể đối với NLd bày rõ nguồn thông tin số được sử dụng.
            - Khuyến khích thêm NLe và NLd vào bài học nếu phù hợp với nội dung và hoạt động dạy học.
            - Sử dụng các công cụ số hay các nguồn thông tin số phù hợp với học sinh THPT.

            5. Phân tích "muc_tieu" để tách thành các biểu hiện năng lực:
            - Nếu mục tiêu có từ hai cấp độ đạt được trở lên → phải tách.
            - Nếu các mục tiêu cùng một cấp độ đạt được → không tách.
            - Không được bịa thêm nội dung ngoài "muc_tieu".

            6. Mỗi biểu hiện năng lực phải bắt đầu bằng động từ đo lường được.
            - KHÔNG được sử dụng các động từ: "Hiểu", "Biết", "Nắm được".
            - Phải chuyển đổi sang các động từ đo lường được tương đương như:
                "trình bày", "mô tả", "nêu", "liệt kê", "phân biệt", "thực hiện", "sử dụng".

            7. Không được suy diễn sang lập trình, thuật toán, cấu trúc dữ liệu hoặc xử lí thông tin nếu nội dung đó không được nêu rõ trong "muc_tieu".
            8. Một bài học phát triển 02 năng lực tin học là hợp lý.

        VÍ DỤ MINH HỌA (BẮT BUỘC LÀM THEO):
                Ví dụ 1 (KHÔNG TÁCH):
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

                Ví dụ 2 (KHÔNG TÁCH):
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

                Ví dụ 4 (Về năng lực Nle và Nld):
                Nle (Hợp tác trong môi trường số) với biểu hiện cụ thể sau:
                - Sử dụng công zalo để trao đổi thông tin, chia sẻ tài liệu học tập với bạn bè và giáo viên.
                Nld ( Ứng dụng công nghệ thông tin và truyền thông trong học và tự học) với biểu hiện cụ thể sau:
                - Sử dụng công cụ Google Search để tìm kiếm thông tin phục vụ học tập.
                - Không viế

                Ví dụ 5 (Kết hợp với NLd):
                muc_tieu:
                a) Về kiến thức
                Bài học này cung cấp những kiến thức sau:
                - Khái niệm Trí tuệ nhân tạo.
                - Các ví dụ minh hoạ về một số ứng dụng điển hình của Trí tuệ nhân tạo.
                Kết quả mong muốn:
                NLa (Sử dụng và quản lí các phương tiện công nghệ thông tin và truyền thông) với các biểu hiện cụ thể sau:
                - Trình bày được khái niệm Trí tuệ nhân tạo.
                - Liệt kê được các ví dụ minh hoạ về một số ứng dụng điển hình của Trí tuệ nhân tạo.
                NLd (Ứng dụng công nghệ thông tin và truyền thông trong học và tự học) với biểu hiện cụ thể sau:
                - Sử dụng Wikipedia để tìm kiếm thông tin về các ứng dụng của Trí tuệ nhân tạo.
                
                Ví dụ 6 (Kết hợp với NLe):
                muc_tieu:
                a) Về kiến thức
                Bài học này cung cấp những kiến thức sau:
                - Khái niệm Trí tuệ nhân tạo.
                - Các ví dụ minh hoạ về một số ứng dụng điển hình của Trí tuệ nhân tạo.
                Kết quả mong muốn:
                NLa (Sử dụng và quản lí các phương tiện công nghệ thông tin và truyền thông) với các biểu hiện cụ thể sau:
                - Trình bày được khái niệm Trí tuệ nhân tạo.
                - Liệt kê được các ví dụ minh hoạ về một số ứng dụng điển hình của Trí tuệ nhân tạo.
                Nle (Hợp tác trong môi trường số) với biểu hiện cụ thể sau:
                - Sử dụng công Microsoft Teams để trao đổi thông tin về các ứng dụng của Trí tuệ nhân tạo.
                
                Ví dụ 7 (Tuyệt đối không được viết):
                Không được viết:
                - NLd (Ứng dụng công nghệ thông tin và truyền thông trong học và tự học) với biểu hiện cụ thể sau:
                       + Sử dụng công cụ tìm kiếm (ví dụ: Google Search) để tìm hiểu thêm về các định dạng dữ liệu âm thanh và hình ảnh phổ biến.
                Bắt buộc viết:
                - NLd (Ứng dụng công nghệ thông tin và truyền thông trong học và tự học) với biểu hiện cụ thể sau:
                       + Sử dụng công cụ tìm kiếm Google Search để tìm hiểu thêm về các định dạng dữ liệu âm thanh và hình ảnh phổ biến.

                Ví dụ 8 (Yêu cầu không được viết):
                Không được viết:
                - NLe (Hợp tác trong môi trường số) với biểu hiện cụ thể sau:
                          + Sử dụng mạng xã hội (ví dụ: Facebook, Zalo) để trao đổi với bạn bè về các ứng dụng của trí tuệ nhân tạo trong cuộc sống.
                Bắt buộc viết:
                - NLe (Hợp tác trong môi trường số) với biểu hiện cụ thể sau:
                          + Sử dụng công cụ Zalo để trao đổi với bạn bè về các ứng dụng của trí tuệ nhân tạo trong cuộc sống.


                CÁCH TRÌNH BÀY KẾT QUẢ (BẮT BUỘC)

                - Tên năng lực PHẢI IN ĐẬM + cụm từ với các biểu hiện cụ thể sau:
                - Các biểu hiện cụ thể của năng lực (gạch đầu dòng, đúng cấp độ)
            

   **c) Năng lực chung:** (Đọc các năng lực chung từ <tai_lieu_tham_khao>)
   - Chọn 1-3 năng lực phù hợp.
   - Lấy một biểu hiện cụ thể từ <tai_lieu_tham_khao>) → phát triển biểu hiện cụ thể đó trong bài.
   - Năng lực chung được phát triển qua cách giáo viên tổ chức hoạt động dạy học.
   - TÊN NĂNG LỰC PHẢI IN ĐẬM
   - Và khi viết phải bắt đầu bằng động từ keyword của biểu hiện trong năng lực chung đó <tai_lieu_tham_khao>.
   Ví dụ 1:
    Biểu hiện trong tài liệu tham khảo của năng lực Giao tiếp và hợp tác là:  
     - Phân tích được các công việc cần thực hiện để hoàn thành nhiệm vụ của nhóm; sẵn sàng nhận công việc khó khăn của nhóm. 
    Khi viết:
     - Năng lực Giao tiếp và hợp tác với biểu hiện cụ thể là:
       + Phân tích được các công việc cần thực hiện để hoàn thành nhiệm vụ nhóm về tìm hiểu các thẻ định dạng cơ bản, siêu liên kết trong HTML; sẵn sàng nhận công việc khó khăn sau khi được hướng dẫn, phân công.
   Ví dụ 2:
    Biểu hiện trong tài liệu tham khảo của năng lực Giải quyết vấn đề và sáng tạo là:
     - Phân tích được tình huống trong học tập, trong cuộc sống; phát hiện và nêu được tình huống có vấn đề trong học tập, trong cuộc sống.
    Khi viết:
     - Năng lực Giải quyết vấn đề và sáng tạo với biểu hiện cụ thể là:
       + Phân tích được nhiệm vụ của yêu cầu bài học, phát hiện và giải quyết được nhiệm vụ sử dụng điều kiện rẽ nhánh câu lệnh rẽ nhánh khi thực hiện các câu hỏi được giao trong hoạt động hình thành kiến thức.

   **d) Phẩm chất:** (Đọc các phẩm chất từ <tai_lieu_tham_khao>)
   - Tương tự như năng lực chung.
   - Phải chỉ rõ hoạt động mà phẩm chất đó được phát triển trong bài
   Ví dụ:
   Không nên viết: 
    - Trách nhiệm với biểu hiện cụ thể là: Sẵn sàng chịu trách nhiệm về kết quả làm việc nhóm.
   Nên viết:
    - Trách nhiệm với biểu hiện cụ thể là: Sẵn sàng chịu trách nhiệm về kết quả làm việc nhóm trong hoạt động luyện tập.

**2. THIẾT BỊ:** (Sử dụng danh mục "THIẾT BỊ" từ <tai_lieu_tham_khao>)
   - Đối chiếu với hoạt động dạy học
   - Chỉ liệt kê thiết bị thực sự sử dụng
   - Ghi rõ phiếu học tập số mấy VD: Phiếu học tập 1, Phiếu học tập 2..(nếu có)
   - MỖI THIẾT BỊ PHẢI XUỐNG DÒNG RIÊNG
   - TUYỆT ĐỐI KHÔNG CÓ ĐIỆN THOẠI trong thiết bị HS
   - Sách giáo khoa phải ghi rõ môn, lớp, loại sách VD: "SGK Tin học 10 - Kết nối tri thức với cuộc sống"
   - Nếu sử dụng các phần mềm thì phải nêu rõ cả phiên bản VD: "Phần mềm Inkscape phiên bản 1.0"
   - Nếu làm câu hỏi trắc nghiệm trên các nền tảng trực tuyến thì phải để đường  dẫn cụ thể VD: "Link bài tập trắc nghiệm trên Quizizz: [link]"
   

**3. TIẾN TRÌNH:**
   
   **Cấu trúc:** 2 tiết × 45 phút 
   
   **Mỗi hoạt động:**
   a) Mục tiêu: Động từ hành động + nội dung
   b) Nội dung: HS hoạt động [CHỌN 1: cá nhân | cặp đôi | nhóm] để tham gia [tên hoạt động]
   c) Sản phẩm: Kết quả cụ thể
   d) Tổ chức: 4 bước (Chuyển giao → Thực hiện → Báo cáo → Kết luận)
   
   **QUY TẮC VIẾT PHẦN "b) Nội dung":**
   - CHỌN 1 hình thức hoạt động cụ thể (cá nhân HOẶC cặp đôi HOẶC nhóm), KHÔNG viết "cá nhân/cặp đôi"
   - TUYỆT ĐỐI KHÔNG ĐỀ CẬP SÁCH GIÁO KHOA: KHÔNG viết "tìm hiểu từ SGK", "đọc SGK"
   - KHÔNG GHI NỘI DUNG CHI TIẾT khi đã có Phiếu học tập
   
   **QUY TẮC VIẾT PHẦN "c) Sản phẩm":**
   - Với hoạt động KHÔNG PHẢI trắc nghiệm:
     + Dòng 1: "Câu trả lời của HS."
     + Dòng 2: "Dự kiến câu trả lời:"
     + Dòng 3 trở đi: PASTE PHIẾU HỌC TẬP CÓ ĐÁP ÁN hoặc liệt kê đáp án
   - Với hoạt động trắc nghiệm:
     + Dòng 1: "Bài làm trắc nghiệm của HS."
     + Dòng 2: "Phiếu học tập số X:" (ghi rõ số thứ tự)
     + Dòng 3 trở đi: PASTE PHIẾU HỌC TẬP TRẮC NGHIỆM CÓ ĐÁP ÁN (đánh dấu đáp án đúng bằng **in đậm**)
   
   **QUY TẮC VIẾT PHẦN "B4. Kết luận, nhận định":**
   - KHÔNG TRÍCH DẪN câu nói cụ thể của giáo viên
   - Chỉ viết HÀNH ĐỘNG CHUNG của GV
   
   **QUY TẮC VIẾT PHẦN "B1. Chuyển giao nhiệm vụ":**
   - TUYỆT ĐỐI KHÔNG ĐỀ CẬP SÁCH GIÁO KHOA
   
   **Hình thành kiến thức:**
   - TẠO hoạt động con theo "chi_muc" từ Neo4j (giữ đúng thứ tự)
   - Hình thành kiến thức phải có 40p chia sao phù hợp với các hoạt động con bên trong.
   
   **Luyện tập:**
   - Bắt đầu bằng từ củng cố + kiến thức đã học ở phần hình thành kiến thức
   
   **Vận dụng:**
   - Bắt đầu bằng từ vận dụng + kiến thức đã học

**4. NỘI DUNG CHUYÊN MÔN:**
   - Dựa trên "noi_dung" Neo4j + <tai_lieu_tham_khao>
   - Bổ sung ví dụ code Python, bài tập cụ thể
   - Hoạt động khởi động phải có 5p.
   - Tổng cả hoạt động luyện tập và vận dụng bắt buộc là 45p chia cho phù hợp.

**5. PHIẾU HỌC TẬP (CHỈ CHO BÀI TẬP TỰ LUẬN/THỰC HÀNH):**
   - Phiếu học tập CHỈ dùng cho: tự luận, điền chỗ trống, thực hành, bài tập viết code
   - KHÔNG TẠO phiếu học tập cho nội dung TRẮC NGHIỆM (trắc nghiệm để riêng ở section trac_nghiem)
   - Nội dung phiếu phải CHI TIẾT, CỤ THỂ cho bài học
   - Phiếu phải có: Tên nhóm, Nhiệm vụ, Các câu hỏi/bài tập cụ thể (KHÔNG PHẢI TRẮC NGHIỆM)

**6. TRẮC NGHIỆM (TẤT CẢ CÂU HỎI TRẮC NGHIỆM Ở ĐÂY):**
   - TẤT CẢ câu hỏi trắc nghiệm phải gom vào 1 section "trac_nghiem" DUY NHẤT
   - KHÔNG tạo phiếu học tập chứa trắc nghiệm - để hết vào section này
   - Nếu có hoạt động trắc nghiệm → tạo ít nhất 10 câu hỏi thực tế
   - Mỗi câu phải có 4 đáp án (A, B, C, D) với nội dung cụ thể
   - KHÔNG được có đáp án "Tất cả các đáp án trên"
   - Đánh dấu đáp án đúng bằng **in đậm** và dấu ←
   - Nếu KHÔNG có nội dung trắc nghiệm nào → KHÔNG tạo section này
   - TRẢ LỜI BẰNG TIẾNG VIỆT, KHÔNG DÙNG TIẾNG ANH

**LƯU Ý QUAN TRỌNG:**
- Nếu tài liệu mâu thuẫn với Neo4j → ƯU TIÊN Neo4j (tên bài, lớp, chủ đề, chi mục)
- Áp dụng phương pháp/kỹ thuật dạy học đã được chọn trong <cau_hinh_hoat_dong>
- PHÂN BIỆT RÕ: Phiếu học tập = tự luận/thực hành | Section trắc nghiệm = câu hỏi ABCD

---
## OUTPUT FORMAT: JSON (BẮT BUỘC)
---

Trả về JSON với cấu trúc sau (NỘI DUNG PHẢI ĐẦY ĐỦ VÀ CHI TIẾT):

{{
  "sections": [
    {{
      "section_type": "thong_tin_chung",
      "title": "Thông tin chung",
      "content": "# KẾ HOẠCH BÀI DẠY\\n\\n**TRƯỜNG:** ........................\\n**GIÁO VIÊN:** ........................\\n**TỔ:** TIN HỌC\\n\\n**CHỦ ĐỀ:** {topic}\\n**BÀI:** {lesson_name}\\n**Môn học:** Tin Học\\n**Lớp:** {grade}\\n**Bộ sách:** {book_type}\\n**Thời lượng:** 02 tiết"
    }},
    {{
      "section_type": "muc_tieu",
      "title": "Mục tiêu bài học",
      "content": "## I. MỤC TIÊU\\n\\n### 1. Về kiến thức\\n- [Viết mục tiêu kiến thức dạng danh từ]\\n\\n### 2. Về năng lực\\n\\n**a) Năng lực tin học**\\n- **NLa:** [biểu hiện cụ thể]\\n- **NLb:** [biểu hiện cụ thể]\\n\\n**b) Năng lực chung**\\n- **[Tên NL chung]:** [biểu hiện cụ thể]\\n\\n### 3. Về phẩm chất\\n- **[Tên phẩm chất]:** [biểu hiện cụ thể]"
    }},
    {{
      "section_type": "thiet_bi",
      "title": "Thiết bị dạy học",
      "content": "## II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU\\n\\n### 1. Giáo viên\\n- [Thiết bị GV]\\n\\n### 2. Học sinh\\n- [Thiết bị HS]"
    }},
    {{
      "section_type": "khoi_dong",
      "title": "Hoạt động 1: Khởi động",
      "content": "## III. TIẾN TRÌNH DẠY HỌC\\n\\n### TIẾT 1 (45 phút)\\n\\n#### 1. Hoạt động khởi động (5 phút)\\n\\n**a) Mục tiêu:**\\n- [Mục tiêu cụ thể]\\n\\n**b) Nội dung:**\\nHS hoạt động [cá nhân/cặp đôi/nhóm] để tham gia [tên hoạt động]\\n\\n**c) Sản phẩm:**\\nCâu trả lời của HS.\\nDự kiến câu trả lời:\\n- [Đáp án]\\n\\n**d) Tổ chức thực hiện:**\\n\\n- **B1. Chuyển giao nhiệm vụ:** [Chi tiết]\\n- **B2. Thực hiện nhiệm vụ:** [Chi tiết]\\n- **B3. Báo cáo, thảo luận:** [Chi tiết]\\n- **B4. Kết luận, nhận định:** [Chi tiết]"
    }},
    {{
      "section_type": "hinh_thanh_kien_thuc",
      "title": "Hoạt động 2: Hình thành kiến thức mới",
      "content": "#### 2. Hình thành kiến thức (40 phút)\\n\\n**Hoạt động 2.1: [Tên hoạt động theo chi_muc[0]] ([X] phút)**\\n\\n**a) Mục tiêu:**\\n- [Mục tiêu]\\n\\n**b) Nội dung:**\\n[Nội dung chi tiết]\\n\\n**c) Sản phẩm:**\\n[Sản phẩm dự kiến]\\n\\n**d) Tổ chức thực hiện:**\\n- **B1. Chuyển giao nhiệm vụ:** [Chi tiết]\\n- **B2. Thực hiện nhiệm vụ:** [Chi tiết]\\n- **B3. Báo cáo, thảo luận:** [Chi tiết]\\n- **B4. Kết luận, nhận định:** [Chi tiết]\\n\\n**Hoạt động 2.2: [Tên hoạt động theo chi_muc[1]] ([Y] phút)**\\n[Cấu trúc tương tự a, b, c, d]\\n\\n**Hoạt động 2.3: [Tên hoạt động theo chi_muc[2]] ([Z] phút)**\\n[Cấu trúc tương tự - TẠO THÊM 2.4, 2.5... nếu có nhiều chi_muc]"
    }},
    {{
      "section_type": "luyen_tap",
      "title": "Hoạt động 3: Luyện tập",
      "content": "### TIẾT 2 (45 phút)\\n\\n#### 3. Hoạt động luyện tập (20 phút)\\n\\n**a) Mục tiêu:**\\n- Củng cố [kiến thức đã học]\\n\\n**b) Nội dung:**\\n[Nội dung chi tiết]\\n\\n**c) Sản phẩm:**\\n[Sản phẩm]\\n\\n**d) Tổ chức thực hiện:**\\n- **B1. Chuyển giao nhiệm vụ:** [Chi tiết]\\n- **B2. Thực hiện nhiệm vụ:** [Chi tiết]\\n- **B3. Báo cáo, thảo luận:** [Chi tiết]\\n- **B4. Kết luận, nhận định:** [Chi tiết]"
    }},
    {{
      "section_type": "van_dung",
      "title": "Hoạt động 4: Vận dụng",
      "content": "#### 4. Hoạt động vận dụng (25 phút)\\n\\n**a) Mục tiêu:**\\n- Vận dụng [kiến thức đã học]\\n\\n**b) Nội dung:**\\n[Nội dung chi tiết]\\n\\n**c) Sản phẩm:**\\n[Sản phẩm]\\n\\n**d) Tổ chức thực hiện:**\\n- **B1. Chuyển giao nhiệm vụ:** [Chi tiết]\\n- **B2. Thực hiện nhiệm vụ:** [Chi tiết]\\n- **B3. Báo cáo, thảo luận:** [Chi tiết]\\n- **B4. Kết luận, nhận định:** [Chi tiết]"
    }},
    {{
      "section_type": "phieu_hoc_tap",
      "title": "Phiếu học tập số 1",
      "content": "**PHIẾU HỌC TẬP SỐ 1**\\n\\n**NHÓM:** ....................................\\n\\n**Nhiệm vụ:** [Mô tả nhiệm vụ]\\n\\n**Câu 1:** [Nội dung câu hỏi]\\n\\n......................................................................................................................................................\\n\\n**Câu 2:** [Nội dung câu hỏi]\\n\\n......................................................................................................................................................",
      "code_exercises": [
        {{
          "exercise_type": "parsons",
          "title": "Sắp xếp code: [Tên bài tập]",
          "description": "[Mô tả yêu cầu]",
          "difficulty": "easy",
          "blocks": [
            {{"id": "block_1", "content": "def function_name():", "indent": 0}},
            {{"id": "block_2", "content": "    # code line 1", "indent": 1}},
            {{"id": "block_3", "content": "    return result", "indent": 1}}
          ],
          "correct_order": ["block_1", "block_2", "block_3"],
          "distractors": []
        }},
        {{
          "exercise_type": "coding",
          "title": "Viết code: [Tên bài tập]",
          "description": "[Mô tả yêu cầu chi tiết]",
          "difficulty": "medium",
          "starter_code": "def solution():\\n    # TODO: Viết code tại đây\\n    pass",
          "solution_code": "def solution():\\n    # Code đáp án\\n    return result",
          "test_code": "assert solution() == expected",
          "test_cases": [
            {{"input": "", "expected": "output1", "hidden": false}},
            {{"input": "test", "expected": "output2", "hidden": true}}
          ],
          "hints": ["Gợi ý 1", "Gợi ý 2"]
        }}
      ]
    }},
    {{
      "section_type": "phieu_hoc_tap",
      "title": "Phiếu học tập số 2",
      "content": "**PHIẾU HỌC TẬP SỐ 2**\\n\\n**NHÓM:** ....................................\\n\\n**Nhiệm vụ:** [Mô tả nhiệm vụ]\\n\\n[Nội dung phiếu]"
    }},
    {{
      "section_type": "trac_nghiem",
      "title": "Trắc nghiệm",
      "questions": [
        {{
          "question": "[Nội dung câu hỏi 1]",
          "A": "[Đáp án A]",
          "B": "[Đáp án B]",
          "C": "[Đáp án C]",
          "D": "[Đáp án D]",
          "answer": "A"
        }},
        {{
          "question": "[Nội dung câu hỏi 2]",
          "A": "[Đáp án A]",
          "B": "[Đáp án B]",
          "C": "[Đáp án C]",
          "D": "[Đáp án D]",
          "answer": "B"
        }}
      ]
    }}
  ]
}}

QUY TẮC JSON QUAN TRỌNG:
1. Mỗi section_type là DUY NHẤT, trừ "phieu_hoc_tap" có thể có NHIỀU (số 1, 2, 3, 4, 5... tùy bài học)
2. "content" chứa Markdown, dùng \\n cho xuống dòng, \\\\ cho backslash
3. Escape đúng ký tự đặc biệt: " → \\" và \\ → \\\\
4. Giữ ĐÚNG thứ tự sections như trên
5. KHÔNG thêm giải thích, KHÔNG wrap trong ```json```
6. Section "trac_nghiem": dùng array "questions" thay vì "content", mỗi câu hỏi có question, A, B, C, D, answer
7. TẠO ĐỦ SỐ PHIẾU HỌC TẬP theo yêu cầu của các hoạt động (có thể 1, 2, 3, 4... phiếu)
8. HÌNH THÀNH KIẾN THỨC: Tạo hoạt động con 2.1, 2.2, 2.3, 2.4, 2.5... theo SỐ LƯỢNG chi_muc từ Neo4j (có thể 1-5 hoạt động con)
9. TRẮC NGHIỆM: Tạo ít nhất 10 câu hỏi, "answer" là chữ cái đáp án đúng (A/B/C/D)

**10. CODE_EXERCISES (BÀI TẬP LẬP TRÌNH) - CHỈ DÙNG CHO BÀI THỰC HÀNH PYTHON:**
   - Nếu bài học có THỰC HÀNH viết code Python → thêm "code_exercises" vào phiếu học tập
   - Mỗi code_exercise có 2 loại:
     a) "parsons": Bài ghép thẻ code - học sinh sắp xếp các dòng code đúng thứ tự
        - blocks: Các dòng code (id, content, indent)
        - correct_order: Thứ tự đúng của block ids
        - distractors: Các dòng code nhiễu (không bắt buộc)
     b) "coding": Bài viết code - học sinh viết code và chạy test
        - starter_code: Code khung ban đầu
        - solution_code: Đáp án (ẩn với học sinh)
        - test_cases: Các test case để kiểm tra
   - Nếu KHÔNG PHẢI bài thực hành Python → KHÔNG thêm code_exercises

---
HÃY BẮT ĐẦU SOẠN NGAY! Trả về JSON thuần túy, không có gì khác.
---
"""
    return prompt

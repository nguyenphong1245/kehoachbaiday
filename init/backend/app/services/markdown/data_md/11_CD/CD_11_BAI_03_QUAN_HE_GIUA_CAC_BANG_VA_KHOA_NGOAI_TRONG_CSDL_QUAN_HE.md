# BÀI QUAN HỆ GIỮA CÁC BẢNG VÀ KHÓA NGOÀI TRONG CƠ SỞ DỮ LIỆU QUAN HỆ

Học xong bài này, em sẽ:
- Diễn đạt được khái niệm khóa ngoài của một bảng và mối liên kết giữa các bảng.
- Giải thích được các khái niệm đó qua ví dụ minh họa.
- Giải thích được ràng buộc khóa ngoài là gì.
- Biết được các phần mềm quản trị CSDL có cơ chế kiểm soát các cập nhật dữ liệu để đảm bảo ràng buộc khóa ngoài.

Để quản lý sách, người đọc và việc mượn/trả sách của một thư viện (TV) trường học, bạn Anh Thư dự định chỉ dùng một bảng như mẫu ở Hình 1. Theo em, trong trường hợp cụ thể này, việc đưa tất cả dữ liệu cần quản lý vào trong một bảng như Anh Thư thực hiện có ưu điểm và nhược điểm gì?

| Số thẻ | Họ và tên | Ngày sinh | Lớp | Mã sách | Tên sách | Tác giả | Ngày mượn | Ngày trả |
|--------|-----------|-----------|-----|---------|----------|---------|-----------|----------|
|        |           |           |     |         |          |         |           |          |

**Hình 1. Cấu trúc bảng SÁCH-NGƯỜI ĐỌC-MUỢN-TRẢ**

Gợi ý: Xét một số trường hợp sau:
- Một học sinh mượn sách nhiều lần, mỗi lần mượn nhiều quyển sách.
- Cần bổ sung dữ liệu về số sách mới mua của thư viện.

## Tình dư thừa dữ liệu

Dư thừa dữ liệu có thể dẫn đến dữ liệu không nhất quán khi cập nhật. Có thể một số người nghĩ nên đưa tất cả dữ liệu cần lưu trữ vào trong một bảng vì khi cần tìm thông tin phải tìm trong một bảng. Nhưng thực tế cho thấy, để giải quyết nhiều bài toán quan trọng, cần dùng nhiều hơn một bảng dữ liệu. Nếu chỉ dùng một bảng thì rất có thể dẫn đến tình trạng dư thừa dữ liệu.

Ví dụ: Giả sử học sinh có số thẻ "TV-HS-002", tên là "Lê Bình", sinh ngày "02/3/2007", học lớp IA1 đã có 68 lần mượn sách. Như vậy, bộ giá trị ("HS-002", "Lê Bình", "02/3/2007", "IA1") phải xuất hiện 68 lần (trên 68 bản ghi của bảng). Tình trạng dư thừa dữ liệu có thể dẫn đến sai lệch không nhất quán về dữ liệu. Việc nhập 68 lần...

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Bộ Dữ Liệu Về Lê Binh

Bộ dữ liệu về Lê Binh sẽ dễ xuất hiện sai nhầm hơn so với 68 lần gõ số thẻ TT của Lê Binh vào bảng. Giải pháp tránh dư thừa là có thể dùng một bảng khác chỉ chứa dữ liệu về người đọc và có khóa chính là trường số thẻ TT.

## CSDL Cản Được Thiết Kế Để Tránh Dư Thừa Dữ Liệu

Dư thừa dữ liệu do trùng lặp dữ liệu có các nhược điểm là tốn nhiều vùng nhớ lưu trữ không cần thiết và dữ liệu có thể không nhất quán (dữ liệu bị mâu thuẫn) khi cập nhật dữ liệu.

### Nhược Điểm Do Dư Thừa Dữ Liệu Gây Ra

CSDL quan hệ được thiết kế gồm một số bảng có bảng chứa dữ liệu về riêng một đối tượng (cá thể) cần quản lý, có bảng chứa dữ liệu về những sự kiện liên quan đến các đối tượng được quản lý.

#### Ví Dụ Ở Một Thư Viện Nhỏ

CSDL có thể gồm 3 bảng (Hình 2):

- **Bảng SÁCH** chứa dữ liệu về các sách của thư viện.
- **Bảng NGƯỜI ĐỌC** chứa dữ liệu về những người đọc (có thể thư viện).
- **Bảng MƯỢN-TRA** chứa dữ liệu về sự việc một người mượn trả một quyển sách; việc này liên quan đến hai đối tượng quản lý (một người đọc và một quyển sách).

### Bảng MƯỢN-TRA

| Số thẻ TV | Mã sách | Ngày mượn | Ngày trả |
|-----------|---------|------------|----------|
| HS-002    | TH-01   | 14/10/2022 | 21/10/2022 |
| HS-001    | AN-01   | 02/10/2022 | 09/10/2022 |
| HS-003    | TO-01   | 15/10/2022 | 25/10/2022 |

### Bảng NGƯỜI ĐỌC

| Số thẻ | Họ và tên     | Ngày sinh  | Lớp | Mã sách |
|--------|----------------|------------|-----|---------|
| HS-001 | Trần Văn An    | 14/9/2006  | 1242| AN-01   |
| HS-002 | Lê Bình        | 02/3/2007  | 1141| 70-01   |
| HS-003 | Hà Thị Mai     | 16/9/2007  | 11A?| TH-01   |

### Bảng SÁCH

| Mã sách | Tên sách                     | Trang | Tác giả          |
|---------|-------------------------------|-------|------------------|
| AN-01   | Âm nhạc ở quanh ta           | 184   | Phạm Tuyên       |
| 70-01   | Sáng tạo Toán học            | 308   | Poly             |
| TH-01   | Al = Trí tuệ nhân tạo        | 306   | Lasse Rouhaine   |
| TH-02   | Al = Trí tuệ nhân tạo        | 306   | Lasse Rouhaine   |

### Hình 2: Cấu Trúc CSDL Gồm Các Bảng

Với cách tổ chức CSDL như trong ví dụ vừa nêu, mỗi bảng sẽ giảm thiểu dữ liệu lặp lại, thông tin dư thừa và việc cập nhật dữ liệu sẽ bớt được nhiều rủi ro sai nhầm.

## Liên Kết Giữa Các Bảng Và Khóa Ngoài

Để trích xuất thông tin từ CSDL quan hệ, ta có thể cần dữ liệu trong hơn một bảng, phải ghép nối đúng được dữ liệu giữa các bảng với nhau.



# VÍ DỤ: Xét CSDL Thư viện

Gồm bảng như ở Hình 2 và yêu cầu "Cho biết Họ và tên học sinh đã mượn quyển sách có mã TH-01". Để trả lời yêu cầu này, cần dữ liệu ở hai bảng (MƯỢN-TRA và NGƯỜI ĐỌC). Chú ý rằng giá trị "HS-002" của Sổ thẻ TV trong bảng MƯỢN-TRA đã "dẫn" đến (tham chiếu đến) một bản ghi trong bảng NGƯỜI ĐỌC chứa thông tin cần tìm. Thông qua thuộc tính Sổ thẻ TV mà hai bảng MƯỢN-TRA và NGƯỜI ĐỌC có được liên kết với nhau: mỗi giá trị của Sổ thẻ TV xuất hiện trong MƯỢN-TRA được giải thích chi tiết hơn trong NGƯỜI ĐỌC.

Trong mối liên kết đó, bảng MƯỢN-TRA được gọi là bảng tham chiếu của mối liên kết. Tương tự, hai bảng MƯỢN-TRA và SÁCH có mối liên kết với nhau qua thuộc tính Mã sách. Bảng MƯỢN-TRA là bảng được tham chiếu, còn bảng SÁCH là bảng được tham chiếu.

Để tham chiếu xác định thì thuộc tính liên kết hai bảng phải là khóa của bảng được tham chiếu. Trong ví dụ này, Số thẻ TV phải là khóa chính của bảng NGƯỜI ĐỌC và còn được gọi là khóa ngoài của bảng MƯỢN-TRA. Liên kết giữa hai bảng trong CSDL được thực hiện thông qua cặp khóa chính - khóa ngoài. Hệ quản trị CSDL đảm bảo ràng buộc khóa ngoài.

## Hãy xét tình huống sau đây:

CSDL Thư viện có bảng MƯỢN-TRA liên kết với bảng NGƯỜI ĐỌC qua khóa ngoài Số thẻ TV. Hiện tại, bảng NGƯỜI ĐỌC có bốn bản ghi (ghi nhận dữ liệu về bốn học sinh đã làm thẻ thư viện). Người thủ thư đang muốn thêm một bản ghi cho bảng MƯỢN-TRA (Hình 3). Theo em, cập nhật đó có hợp lý không? Giải thích vì sao?

### Bảng MƯỢN-TRA

| Sổ thẻ | Mã sách | Ngày mượn   | Ngày trả     |
|--------|---------|--------------|--------------|
| HS-002 | TH-01   | 14/10/2022   | 21/10/2022   |
| HS-001 | AN-01   | 02/10/2022   | 09/10/2022   |
| HS-007 | TO-01   | 16/9/2022    | 26/9/2022    |

### Bảng NGƯỜI ĐỌC

| Sổ thẻ TV | Họ và tên      | Ngày sinh   | Lớp  |
|------------|----------------|-------------|------|
| HS-001     | Trần Văn An    | 14/9/2006   | 12A2 |
| HS-002     | Lê Bình        | 02/3/2007   | 11A1 |
| HS-003     | Hà Thị Mai     | 16/9/2007   | 11A2 |
| HS-004     | Nguyễn Lộc     | 05/10/2006  | 12A3 |

Hình 3. Dự kiến bổ sung một bản ghi vào bảng MƯỢN-TRA.

### Ràng buộc khóa ngoài

Khi hai bảng trong một CSDL có liên kết với nhau, mỗi giá trị khóa ngoài của bảng tham chiếu sẽ được giải thích chi tiết hơn ở bảng được tham chiếu. Ví dụ, HS-001.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Giải thích bảng thông tin

**Họ và tên:** Trân Văn An
**Ngày:** 14/9/2006
**Lớp:** 12A2

Nếu có giá trị khóa không sinh dưoc tham chiếu xuất hiện trong giá trị khóa ở bảng, thì sẽ xảy ra hiện tượng mất tham chiếu. Trong Hình 3, "HS-007" không xuất hiện trong số thẻ TV của bảng NGƯỜI ĐỌC. Do vậy, việc bổ sung cho bảng MƯỢN-TRA một bản ghi mới có giá trị khóa là "HS-007" sẽ làm cho dữ liệu trong CSDL không còn đúng đắn nữa.

Giải thích được "HS-007" là số thẻ thư viện của ai. Muốn cập nhật đó, phải bổ sung bản ghi có giá trị khóa là "HS-007" vào bảng NGƯỜI ĐỌC. Các bảng có liên kết với nhau cũng là một đảm bảo tính tham chiếu đầy đủ giữa các bảng. Ràng buộc này áp dụng cho khóa ngoại. Nói một cách cụ thể hơn, ràng buộc khóa ngoại là yêu cầu mọi giá trị của khóa ngoại trong tham chiếu phải xuất hiện trong giá trị khóa ở bảng được tham chiếu.

## b) Khai báo liên kết giữa các bảng

Các hệ trị CSDL đều cho người tạo lập CSDL được khai báo liên kết giữa các bảng. Phần mềm quản trị CSDL sẽ căn cứ vào các liên kết đó để kiểm soát tất cả thao tác cập nhật, để xảy ra ràng buộc khóa ngoại.

Hình 4 cho thấy kết quả trực quan của việc khai báo liên kết giữa 3 bảng trong hệ quản trị CSDL Microsoft Access (phiên bản 365).

| All Acc... | Relationships | SÁCH | NGƯỜI ĐỌC | MƯỢN-TRA |
|------------|---------------|------|------------|----------|
| Search     |               |      |            |          |
| Tables     |               |      |            |          |
|            |               |      |            |          |
| MƯỢN-TRA   | MF sách       | SÁCH | 58 thẻ TV  | Ngày mượn |
|            |               |      | Ngày trả   | Tên sách  |
|            |               |      | Số trang   | Tác giả   |

## Hình 4: Kết quả của việc khai báo thành công hai liên kết giữa các bảng

### Thực hành về bảng với khóa ngoại

**Yêu cầu:**
Khám phá cách khai báo liên kết giữa các bảng trong môi trường Access và nhận biết các cập nhật vi phạm ràng buộc khóa ngoại.

**Hướng dẫn thực hiện:**
Bảng SÁCH (kết mục thực hành ở Bài 2)
Bước 1: Mở CSDL Thư viện đã có.
Tạo câu truy vấn như ở Hình 2 cho bảng NGƯỜI ĐỌC và bảng MƯỢN-TRA. Chọn Số thẻ TV làm khóa chính cho bảng NGƯỜI ĐỌC, chọn khóa chính của bảng MƯỢN-TRA gồm ba thuộc tính: Số thẻ TV, Mã sách và Ngày mượn.

Đọc bản mới nhất trên hoc10.vn
Bản sách mẫu



# Bước 2: Khám Phá Cách Khai Báo Liên Kết Giữa Các Bảng

Trong dải Database Tools, chọn Relationships.
Dùng chuột kéo thả các bảng vào cửa sổ khai báo liên kết (vùng giữa).
Dùng chuột kéo thả khóa ngoài của bảng tham chiếu vào khóa chính của bảng được tham chiếu làm xuất hiện hộp thoại Edit Relationships.
Đánh dấu hộp kiểm Enforce Referential Integrity và chọn Create.

## Bước 3: Khám Phá Báo Lỗi Của Phần Mềm Quản Trị CSDL Khi Cập Nhật Vi Phạm Ràng Buộc Khóa Ngoài

Thêm một vài bản ghi trong đó có bản ghi 'phần mềm' (tham khảo Hình 3). Quan sát báo lỗi của phần mềm.
Chọn xóa một bản ghi trong bảng NGƯỜI ĐỌC nếu giá trị Số thẻ TT trong bản ghi này xuất hiện trong bảng MƯỢN-TRA, báo lỗi của phần mềm.

### Trong Việc Tạo Lập CSDL

Khi tạo xong cấu trúc cho hai bảng mà ta dự kiến sau có liên kết nhau bằng khóa, ta nên khai báo liên kết ngay trước khi nhập dữ liệu cho hai bảng trước? Hãy giải thích vì sao.

### Trong Các Câu Sau, Những Câu Nào Đúng?

a) Một trưởng là khóa ngoài của một bảng nếu nó là khóa của bảng đó và thời xuất hiện trong một bảng khác.
b) Khóa ngoài của một bảng là tập hợp một số trưởng của bảng đó và thời là khóa của một bảng khác.
c) Khi hai bảng có liên kết với nhau qua khóa chính - khóa ngoài, chỉ khi bổ sung bản ghi vào các bảng mới cần thỏa mãn ràng buộc khóa ngoài.
d) Các hệ quản trị CSDL quan hệ tự động kiểm tra và chỉ chấp nhận các cập nhật thỏa mãn ràng buộc khóa ngoài.

## Tóm Tắt Bài Học

CSDL quan hệ có thể gồm một số bảng, trong đó có những bảng có mối liên kết với nhau: Những liên kết này giúp tìm được những thông tin đúng đắn và đầy đủ.
Nếu hai bảng có chung một trường và trường này là khóa của một trong hai bảng thì trường đó là khóa ngoài của bảng còn lại. Hai bảng có thể liên kết với nhau thông qua khóa ngoài.
Dữ liệu trong hai bảng liên kết với nhau qua khóa ngoài cần phải thỏa mãn ràng buộc khóa ngoài: Mọi giá trị khóa ngoài đều phải xuất hiện trong trường khóa ở bảng được tham chiếu. Mọi hệ quản trị CSDL quan hệ đều có cơ chế đảm bảo cập nhật dữ liệu không vi phạm ràng buộc khóa ngoài đối với các liên kết giữa bảng.
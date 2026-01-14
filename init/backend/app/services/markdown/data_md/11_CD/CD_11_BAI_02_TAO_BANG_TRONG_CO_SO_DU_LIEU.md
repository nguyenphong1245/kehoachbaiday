# BÀI 2: TẠO BẢNG TRONG CƠ SỞ DỮ LIỆU

Học xong bài này, em sẽ:
- Biết được cách tạo bảng theo thiết kế thường.
- Biết được sơ bộ cách thiết lập một số thuộc tính kiểu dữ liệu sử dụng.
- Tạo được một số bảng CSDL.

## Các bảng trong cơ sở dữ liệu thư viện trường

### Các cột trong bảng
Một bảng CSDL có nhiều cột. Mỗi cột chứa dữ liệu thuộc một kiểu nhất định. Cần thiết lập kiểu dữ liệu cho mỗi cột trong bảng phù hợp với thực tế và mục đích sử dụng.

| Tên kiểu     | Mô tả                | Kích thước               | Giải thích thêm                               |
|--------------|----------------------|--------------------------|------------------------------------------------|
| Short Text   | Xâu ký tự ngắn       | Không quá 255 ký tự      | Một mục dữ liệu chữ ngắn                      |
| Long Text    | Văn bản dài hơn      | Tới 63,999 ký tự         | Văn bản mô tả, giải thích thêm                |
| Number       | Số để tính toán      | 1, 2, 4, 8 byte          | Trong các công thức, các hàm tính toán        |
| Date/Time    | Thời gian            | 8 byte                   | Cho các năm: 1900 - 9999                      |
| Currency     | Số tiền              | 8 byte                   | Có thể có từ 1 đến 4 chữ số phần thập phân    |
| AutoNumber   | Số được Access sinh tự động | 4 byte           | Tăng dần hoặc ngẫu nhiên khi thêm một bản ghi mới vào |
| Yes/No       | Chỉ nhận 1 trong 2 giá trị | 1 bit               | Yes/No, True/False, On/Off                    |

----

**Lưu ý:** Các thông tin trên là những kiểu dữ liệu thường dùng trong Access.



# Thiết kế các bảng

Trong tin học, logic nghiệp vụ (Business Logic) hàm ý các quy tắc nghiệp vụ trong thế giới thực và thiết kế CSDL cần dựa vào đó xác định cách thu thập, lưu trữ và thao tác dữ liệu.

Hoạt động hằng ngày của thư viện trường liên quan đến kho sách, đến bạn đọc là các học sinh trong trường, đến các giao dịch mượn, trả sách. CSDL thư viện đơn giản nhất gồm 3 bảng tương ứng: Sách, Bạn Đọc, Mượn-Trả sách.

Bảng Mượn-Trả là bảng nối, một kiểu bảng riêng sẽ được thiết kế sau. Dưới đây trình bày chi tiết về bảng Sách và bảng Bạn Đọc.

## Bảng Sách

Bảng Sách gồm các cột và kiểu dữ liệu tương ứng: ví dụ như Bảng 2 sau đây:

### Bảng 2: Các trường dữ liệu trong bảng Sách

| STT | Tên trường   | Kiểu dữ liệu   | Chú thích                                                                 |
|-----|--------------|----------------|---------------------------------------------------------------------------|
| 1   | Mã sách      | Short Text     | Do thư viện đặt, là khoá chính; có độ dài hạn chế                       |
| 2   | Tên sách     | Short Text     | Cần có                                                                   |
| 3   | Sẵn có       | Yes/No         | Cần có                                                                   |
| 4   | Số trang     | Number         | Tùy chọn                                                                |
| 5   | Tác giả      | Short Text     | Tùy chọn                                                                |
| 6   | Loại sách    | Short Text     | Tùy chọn                                                                |

Có thể thêm một số cột nữa cho bảng Sách tùy theo yêu cầu quản lý và quy mô kho sách. Ví dụ: ngày nhập kho sách; phân loại sách giáo khoa; sách hỗ trợ học tập và giảng dạy (sách bài tập, sách giáo viên). Với mục đích minh họa, ta thêm cột Loại sách phân loại sách Tin học TH" và còn lại là sách Khác" (Hình 1).

### Dữ liệu trong bảng Sách

| ID   | Mã sách | Tên sách                                      | Sẵn có | Số trang | Tác giả           | Loại sách |
|------|---------|-----------------------------------------------|--------|----------|-------------------|-----------|
| AN-01| Am nhạc ơ quanh ta                       | 184    | Phạm Tuyên | Khác      | | |
| AY-05| Nhạc cổ điển Những mảnh ghép sắc màu     | 160    | Lê Ngọc Anh | Khác      | | |
| TH-01| AI-Trí tuệ nhân tạo                       | 306    | Lasse Roulaien | TH        | | |
| TH-02| AI-Trí tuệ nhân tạo                       | 306    | Lasse Rouhiainen | TH        | | |
| TH-10| Một số vấn đề chọn lọc trong môn Tin học (tập 1) | 176    | Nguyễn Xuân Mỷ | TH        | | |
| TO-01| Sáng tạo Toán học                         | 308    | Polya | Khác      | | |
| VH-01| Đề men phiếu liru ki                      | 236    | Tô Hòa | Khác      | | |
| VH-02| Tập thơ Góc sân và khoảng trời           | 203    | Trần Uarg Khoa | Khác      | | |

### Hình 1. Bảng Sách trong khung hình bảng dữ liệu



# Bảng Bạn Đọc

## Các trường dữ liệu trong bảng Bạn Đọc

| STT | Tên trường       | Kiểu dữ liệu   | Chú thích                                                                 |
|-----|------------------|----------------|---------------------------------------------------------------------------|
| 1   | Số thẻ           | Short Text     | Do thư viện đặt, là khoá chính; có thể hạn chế độ dài                   |
| 2   | Mã Học sinh      | Short Text     | Do phòng giáo vụ đặt; có thể hạn chế độ dài                              |
| 3   | Họ và đệm        | Short Text     | Cần có; có thể hạn chế độ dài                                            |
| 4   | Tên              | Short Text     | Cần có; có thể hạn chế độ dài                                            |
| 5   | Ngày sinh        | Date/Time      | Tuỳ chọn                                                                 |
| 6   | Giới tính        | Yes/No         | Tuỳ chọn; Nữ = Yes                                                       |
| 7   | Số điện thoại    | Short Text     | Tuỳ chọn; có thể hạn chế độ dài                                          |
| 8   | Email            | Short Text     | Tuỳ chọn; có thể hạn chế độ dài                                          |
| 9   | Ảnh              | Attachment      | Đính kèm; Tuỳ chọn                                                       |

## Hình 2

Hình 2 minh họa bảng Bạn Đọc với một số bảng hi. Có thể thêm một số cột nữa cho bảng Bạn Đọc tùy theo yêu cầu quản lý và quy mô tập thể bạn đọc. Ví dụ: ngày bắt đầu trở thành bạn đọc; là học sinh; giáo viên hay cán bộ nhà trường.

### Bảng Bạn Đọc

| STT | Số thẻ   | Mã Học sinh | Họ và đệm      | Tên   | Ngày sinh | Giới tính | Số điện thoại |
|-----|----------|-------------|----------------|-------|-----------|-----------|----------------|
| 1   | HS-001   | Trần Ván    | An             |       |           |           |                |
| 2   | HS-002   | Lê Hữu      | Binh           |       |           |           |                |
| 3   | HS-003   | Hà Thị      | Mai            |       |           |           |                |
| 4   | HS-004   | Nguyễn Đinh  | Lộc            |       |           |           |                |
| 5   | HS-005   | Hoàng Đinh  | Bảo            |       |           |           |                |
| 6   | HS-006   | Phạm Văn    | Hùng           |       |           |           |                |
| 7   | HS-007   | Hoàng Kim   | Dung           |       |           |           |                |
| 8   | HS-008   | Phạm Hồ     | Thùy Anh      |       |           |           |                |
| 9   | HS-009   | Trần Dũng   | Cường          |       |           |           |                |
| 10  | HS-010   | Nguyễn Việt  | Dũng           |       |           |           |                |
| 11  | HS-011   | Nguyễn Thị  | Ánh Dương      |       |           |           |                |

## Nhận xét

Để phân biệt đối tượng bạn đọc, có thể sử dụng mã số thẻ bạn đọc. Ví dụ, số thẻ bắt đầu bằng `HS-` nghĩa là học sinh, bắt đầu bằng `GV-` nghĩa là giáo viên. Tương tự, có thể sử dụng mã số sách để phân loại sách. Cách làm này thích hợp cho thư viện quy mô nhỏ và dễ nhận biết, dễ nhớ với con người.

Với thư viện quy mô lớn, có yêu cầu quản lý nâng cao hơn và dịch vụ phong phú hơn cần xử lý bằng máy tính thì sẽ có những bất tiện. Việc trích lấy ra các thông tin...



# Hướng dẫn tạo bảng theo thiết kế

Xét hai trường hợp:
1. CSDL trống mới tạo sẽ có sẵn ngay một bảng tên là Table1 theo mặc định.
2. CSDL đang làm việc: Nháy chuột chọn Create Table sẽ tạo thêm một bảng mới tên là Table1.

Access sẽ yêu cầu đổi tên tạm Table1 thành tên mới khi ghi lưu bảng mới tạo hoặc ta có thể gõ nhập luôn tên mới cho bảng trước khi nháy lệnh Create. Nên chọn tên gợi nhớ nội dung bảng chứa dữ liệu gì.

## Thiết lập kiểu dữ liệu cho mỗi trường và các thuộc tính chi tiết

Mở bảng trong khung nhìn thiết kế và nhập lần lượt các tên trường trong cột Field Name. Nên giữ cột ID do Access tự động tạo ra. Cột DataType để chọn kiểu dữ liệu nguyên của trường:

### Bước 1
Nháy chuột vào ô tên kiểu dữ liệu (cột Data Type); nháy dấu trỏ đầu mút phải sẽ thả xuống danh sách để chọn các kiểu dữ liệu.

### Bước 2
Chọn một kiểu dữ liệu (bằng tiếng Anh) thích hợp trong danh sách. Vùng Field Properties bên dưới để xác định chi tiết các thuộc tính của kiểu dữ liệu đã chọn. Cột đầu tiên là danh sách các tên thuộc tính: Field Size, Format, Input Mask. Cột kế tiếp xác định cụ thể giá trị của thuộc tính.

### Bước 3
Thiết lập các chi tiết thuộc tính của trường đã chọn:
1. Nháy chuột chọn một thuộc tính (một dòng) sẽ xuất hiện dấu trỏ ở đầu mút phải để thả danh sách chọn thiết lập chi tiết cho thuộc tính đó.
2. Nháy dấu trỏ.

Các trường Mã sách, Số thẻ được dự kiến làm khóa chính trong các bảng tương ứng. Theo mặc định, trường khóa chính sẽ được xác định một số thuộc tính như sau:
- Required: Yes
- Indexed: Yes (No Duplicates)

Thuộc tính Indexed (được lập chỉ mục) giúp tìm kiếm nhanh hơn. Một việc hay làm là tìm kiếm bạn đọc theo tên. Do đó với cột Tên trong bảng Bạn Đọc nên xác định thuộc tính Indexed. Tuy nhiên, việc hai người trùng tên có thể xảy ra, nên ta phải chọn Indexed: Yes (Duplicates OK).

Cũng cần xác định thuộc tính Format của trường để hiển thị dữ liệu dưới dạng quen thuộc dễ xem và dễ gõ nhập dữ liệu mới. Ví dụ, trong bảng Bạn Đọc có trường Ngày sinh, kiểu dữ liệu Date Time có các lựa chọn: General Date, Long Date, Medium Date, Short Date. Hãy chọn sao cho phù hợp.



# Gõ nhập dữ liệu vào bảng để kiểm tra thiết kế dữ liệu

Ta có thể:

Sau khi thiết kế xong bảng - ghi lưu và chuyển về khung nhìn bảng bắt đầu nhập dữ liệu vào bảng. Việc gõ nhập dữ liệu được thực hiện theo từng ô. Access tự động lưu kết quả nhập dữ liệu khi kết thúc một bản ghi và chuyển sang bản ghi tiếp theo; không cần nháy chuột vào biểu tượng Save.

**Chú ý:** Trong thực tế, người ta thường thiết kế để nhập dữ liệu cho CSDL qua biểu mẫu để kiểm soát một số ràng buộc dữ liệu.

## Chuyển quan hệ "nhiều nhiều" thành quan hệ "một nhiều"

Nhật ký giao dịch hằng ngày phản ánh mối quan hệ giữa hai (hoặc nhiều) đối tượng liên quan trong hoạt động kinh doanh hay dịch vụ. Thư viện cần ghi lại các giao dịch mượn trả sách trong một thời gian; ví dụ một năm học. Thực tế cho thấy mỗi học sinh đã từng mượn nhiều cuốn sách và mỗi cuốn sách đã từng được nhiều học sinh mượn. Đây là quan hệ nhiều = nhiều. Trong Access nói riêng và CSDL quan hệ chung nói giữa hai bảng chỉ có mối quan hệ một một (1-1) hoặc một nhiều (1-n).

Ta tạo bảng thứ ba đặt tên là Mượn-Trả, là bảng nối giữa Bạn Đọc và Sách để chuyển quan hệ thành hai quan hệ 1-n. Trong bảng nối sẽ có hai cột ứng với hai khóa chính của bảng Bạn Đọc và bảng Sách. Đó là các khóa ngoài.

### Bảng 4: Các trường dữ liệu trong bảng Mượn-Trả

| STT | Tên trường     | Kiểu dữ liệu   | Chú thích                                                  |
|-----|----------------|----------------|-----------------------------------------------------------|
| 1   | ID             | AutoNumber     | Là khóa chính, dùng luôn trường khóa chính mặc định của Access |
| 2   | Số thẻ         | Short Text     | Phải có, là khóa ngoài                                    |
| 3   | Mã sách        | Short Text     | Phải có, là khóa ngoài                                    |
| 4   | Ngày mượn      | Date/Time      | Phải có                                                  |
| 5   | Ngày trả       | Date/Time      | Phải có                                                  |
| 6   | Chú thích      | LongText       | Tùy chọn                                                 |

Tùy theo yêu cầu sử dụng; có thể thêm cột cho bảng Mượn-Trả.

## Thực hành tạo bảng trong CSDL

### Nhiệm vụ 1: Tạo bảng Sách theo thiết kế và thử nhập dữ liệu

a) Tạo bảng mới. Mở bảng trong khung nhìn thiết kế, giữ nguyên ID, thêm các trường mới và xác định kiểu dữ liệu, thiết lập thuộc tính của trường dữ liệu.



# Bài Học: Tạo Bảng Dữ Liệu

## Nhiệm vụ 1: Tạo bảng Sách

1. Chuyển sang khung nhìn bảng dữ liệu, nhập dữ liệu cho một vài cột, và hàng.
2. Chuyển sang khung nhìn thiết kế; bỏ chọn khóa chính là ID: chọn Mã sách làm khóa chính; ghi lưu thay đổi thiết kế.

**Chú ý:**
- Kiểu dữ liệu Number cho cột Số trang nên được xác định chi tiết hơn: Field Size là Integer.
- Nên hạn chế độ dài một số trường kiểu Short text, ví dụ hạn chế độ dài:
- Mã sách: 15
- Tác giả: 127

## Nhiệm vụ 2: Tạo bảng Bạn Đọc theo thiết kế và thử nhập dữ liệu

Các bước thực hành tương tự như Bài 1.

**Chú ý:**
1. Nên hạn chế độ dài một số trường kiểu Short text, ví dụ hạn chế độ dài:
- Số thẻ: 15
- Mã học sinh: 15
- Họ và đệm: 63
- Tên: 15
2. Chọn Số thẻ làm khóa chính của bảng thay cho trường ID mặc định.
3. Cột Tên nên chọn thuộc tính Indexed là Yes (Duplicates OK).
4. Cột Ngày sinh nên chọn thuộc tính Format phù hợp, ví dụ Short Date.
5. Nhập một số bạn đọc không là học sinh, ví dụ có Số thẻ bắt đầu bằng ~GV.

## Câu Hỏi Thảo Luận

1. Học sinh là trung tâm của hoạt động giáo dục trong nhà trường. Em hãy thiết kế bảng dữ liệu Học sinh cho CSDL của trường em.
2. Theo em, trong bảng Bạn đọc, những trường dữ liệu nào hoàn toàn giống như trong bảng Học sinh.

### Câu Hỏi Thực Hành

1. Để tạo một bảng mới cần thao tác như thế nào?
2. Để tạo cột và xác định kiểu dữ liệu cho cột cần thao tác như thế nào?
3. Để chọn một cột làm khóa chính cần làm gì?

## Tóm Tắt Bài Học

Các việc cần làm sau khi tạo bảng mới:
- Mở khung nhìn thiết kế để nhập các tên cột; chọn kiểu dữ liệu cho cột.
- Xác định một số thuộc tính chi tiết quan trọng của cột trong trường hợp cần thiết: Field Size, Required, Indexed và Yes/No Duplicates.
- Chọn cột làm khóa chính của bảng.
- Chuyển sang khung nhìn bảng dữ liệu và thử nhập dữ liệu để kiểm tra.
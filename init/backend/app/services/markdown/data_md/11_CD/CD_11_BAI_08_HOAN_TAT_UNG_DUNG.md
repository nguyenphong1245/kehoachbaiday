# BÀI 8: HOÀN TẤT ỨNG DỤNG

Học xong bài này, em sẽ:
- Tạo được biểu mẫu điều hướng để làm giao diện khi mở ứng dụng.
- Hoàn tất một ứng dụng đơn giản có thể sử dụng được.

Theo em, làm thế nào để một người không học Access cũng có thể sử dụng được các công cụ quản lý thư viện ta đã tạo ra trong các bài học?

## Biểu mẫu điều hướng

Vùng điều hướng trong CSDL Access hiển thị tất cả đối tượng đã được tạo ra, trong đó có nhiều đối tượng không nên cho phép truy cập trực tiếp: Ví dụ: các bảng, các truy vấn. Người dùng có thể vô tình hay cố ý gõ nhập làm hỏng dữ liệu khi mở bảng dữ liệu hay chạy truy vấn.

Biểu mẫu điều hướng đơn giản là một giao diện có chứa các nút điều khiển (control) giúp điều hướng để người dùng dễ dàng chuyển đổi giữa các biểu mẫu và báo cáo khác nhau trong CSDL. Báo cáo chỉ hiển thị kết quả xuất ra thông tin, không cho phép sửa đổi dữ liệu từ các bảng nguồn bên dưới. Biểu mẫu cho phép xem và gõ nhập dữ liệu, nhưng có tính năng khóa chặt một số trường dữ liệu cần bảo vệ, không cho phép sửa đổi.

Nếu người thiết kế muốn tạo một bàn điều khiển trung tâm (switchboard) giúp người dùng dễ dàng tìm thấy các đối tượng cụ thể đã dành cho họ, thì biểu mẫu điều hướng là giải pháp phù hợp.

### Thao tác tạo biểu mẫu điều hướng

**Bước 1:** Chọn `Create` > `Navigation` (trong nhóm Forms). Trong danh sách thả xuống có các mục chọn kèm biểu tượng rất dễ hình dung bố cục trông sẽ như thế nào (Hình 1).

#### Hình 1. Các lựa chọn biểu mẫu điều hướng

| Tùy chọn                          |
|-----------------------------------|
| Form Wizard                       |
| Report                            |
| Form                              |
| Design Form                       |
| Horizontal Tabs                   |
| Vertical Tabs, Left               |
| Vertical Tabs, Right              |
| Horizontal Tabs 2 Levels          |
| Horizontal Tabs and Vertical Tabs, Left |
| Horizontal Tabs and Vertical Tabs, Right |

----

**Help**: Tell me what you want to do.



# Hướng Dẫn Sử Dụng Biểu Mẫu Điều Hướng Trong Access

## Bước 2: Chọn Một Mục
Ví dụ: **Horizontal Tabs**.

Trong vùng làm việc hiển thị biểu mẫu có bố cục **Navigation Form** đã chọn trong khung nhìn bài trí **Layout View**:

- **Tin Sách**         [Add New]
- **Tim Sách**
- **Ma sách**                  **Tiaséch**

### Hình 2: Kéo thả vào Add New
Khi biểu mẫu điều hướng đang mở trong khung nhìn bài trí (Hình 2), kéo các báo cáo hay biểu mẫu khác từ vùng điều hướng thả vào ô **Add New**. Biểu mẫu hay báo cáo đó sẽ lập tức xuất hiện trong vùng làm việc là ô hình chữ nhật đã dành sẵn. Có thể sử dụng ngay để nhập dữ liệu hay thông tin giống như khi nó từ vùng điều hướng Thẻ của biểu mẫu.

- Xem báo cáo sẽ hiển thị thay thế nút **Add New**.

## Thiết Lập Biểu Mẫu Điều Hướng Làm Bàn Điều Khiển Trung Tâm Của Ứng Dụng
Để khi mở CSDL trong cửa sổ Access thì biểu mẫu điều hướng sẽ hiển thị đầu tiên, che khuất toàn bộ vùng làm việc và vùng điều hướng, ta thực hiện như sau:

### Bước 1
Nháy chọn **File > Options** (ở cuối dải lệnh thả xuống). Access hiển thị cửa sổ để thiết lập nhiều lựa chọn chung cho toàn bộ hoặc cho từng CSDL đang làm việc (Current Database).

### Bước 2
Chọn **Current Database**.

### Bước 3
Tìm mục **Display Form**. Hiện đang bỏ trống (none). Nháy mũi tên trỏ xuống để thả xuống danh sách các biểu mẫu đang có trong CSDL.

### Bước 4
Chọn **Navigation Form** là tên biểu mẫu dự kiến làm bàn điều khiển trung tâm.

### Bước 5
Có thể chọn thiết lập che khuất vùng điều hướng để người dùng không nhìn thấy các đối tượng khác đã có trong CSDL bằng cách: tìm mục **Navigation**; bỏ đánh dấu chọn trong ô **Display Navigation Pane**.

Đóng Access và khởi chạy lại tệp CSDL thì các thiết lập trên mới có hiệu lực. Người sử dụng chỉ cần nháy chuột lên các thẻ, giống như các nút lệnh, thì biểu mẫu/báo cáo sẽ mở để làm việc.

### Chú Ý
Nếu biết lập trình, có thể làm thêm một biểu mẫu đăng nhập (login form) yêu cầu cung cấp tên, mật khẩu; sau đó thiết lập để mở biểu mẫu đăng nhập trước tiên thay vì mở bàn điều khiển trung tâm.

Access tích hợp sẵn môi trường lập trình **VBA (Visual Basic for Application)**. Nháy chọn **Create**; ở cuối dải lệnh sẽ thấy nhóm lệnh **Macros &#x26; Code**. Nháy các nút lệnh để bắt đầu viết các câu lệnh.



# Thiết kế giao diện của ứng dụng quản lí thư viện trường

Dưới đây tóm tắt ngắn gọn vài điểm về quy trình tác nghiệp của thư viện và các biểu mẫu, báo cáo liên quan (Hình 3).

## a) Các biểu mẫu

1. Bạn đọc đến thư viện tìm sách để mượn. Thao tác tìm sách biểu mẫu **TìmSách** cho thông tin về sách có sẵn một cuốn sách.

2. Bạn đọc yêu cầu mượn. Thao tác cho mượn **ChoMượn** để thủ thư cập nhật gồm các trường Số thẻ, Mã sách, Ngày mượn trong bảng **Mượn-Trả** và **Sẵn có** trong bảng **Sách**.
Quy tắc nghiệp vụ cần tuân thủ: Bỏ đánh dấu cuốn sách vừa cho mượn là sẵn có.

| Thư viện Trường THPT Hữu Nghị | Tistch | CLol | [ưrun NhauIv MuouTrả Tcollng MruuTra-Thang-Lonigach | [dd New] |
|--------------------------------|--------|------|--------------------------------------------------|----------|
| Tóm tắt Mượn-Trả theo Triday 2 | Janiry 2022 | Tháng - Loại sách | 0{ 1lS7 | eucl Tolal OÊS5 ihé |
| Khuc | Pare Df] | Hình 3. Biểu mẫu điều hướng làm bàn điều khiển trung tâm của ứng dụng | | |

3. Bạn đọc đến trả một cuốn sách. Thao tác nhận trả biểu mẫu để thủ thư cập nhật gồm các trường Số thẻ, Mã sách, Ngày mượn, Ngày trả trong bảng **Mượn-Trả** và **Sẵn có** trong bảng **Sách**. Đánh dấu cuốn sách vừa nhận trả là sẵn có.
Quy tắc nghiệp vụ cần tuân thủ: Có thể thêm các biểu mẫu để nhập dữ liệu cho bảng **Bạn đọc**, quy ước là khi nhập một cuốn sách mới vào kho sách thì trường **Sẵn có** mặc định nhận giá trị là Yes.
Chú ý: Nếu biết lập trình, có thể thiết lập việc thực thi các quy tắc vừa nêu trên, tránh trường hợp làm sai, dữ liệu có mâu thuẫn, không nhất quán.

## b) Các báo cáo

1. Thống kê hoạt động mượn trả ví dụ theo tháng: báo cáo **MượnTrả-TheoTháng**.

2. Báo cáo phân tích mượn trả theo tháng và theo loại sách: báo cáo **MượnTrả-Tháng-LoaiSách**.
Có thể thêm những báo cáo khác, ví dụ báo cáo theo bạn đọc và số đầu sách đã mượn.



# Bàn điều khiển trung tâm của ứng dụng quản lí thư viện trường

Một ví dụ thiết kế biểu mẫu điều hướng như sau:
- **Nhãn tiêu đề**: Thư viện Trường THPT.
- **Bố cục**: Horizontal Tabs:
- Các thẻ đầu tiên là các biểu mẫu, sau đó là các báo cáo.

## Thực hành tổng hợp

### Nhiệm vụ 1: Tạo và chỉnh sửa bài trí biểu mẫu điều hướng
a) Làm theo các bước hướng dẫn thao tác tạo biểu mẫu điều hướng.
b) Kéo thả các biểu mẫu và báo cáo từ vùng điều hướng vào các ô Add New theo bố cục như trong ví dụ đã nêu.
c) Đổi tiêu đề biểu mẫu điều hướng.
d) Đổi tên trong thẻ của các biểu mẫu, báo cáo. Ví dụ: Tìm Sách, Cho Mượn, Nhận Trả (có khoảng trắng, có dấu tiếng Việt kiểu dáng 3 chữ).

**Chú ý**: Quan sát thấy tên đối tượng trong vùng điều hướng thay đổi.

### Nhiệm vụ 2: Hoàn thiện biểu mẫu một bản ghi để nhập dữ liệu cho bảng Bạn đọc; thử nhập dữ liệu cho trường Anh.

### Nhiệm vụ 3: Thử xuất ra một báo cáo.
**Gợi ý**: Mở báo cáo trong khung nhìn Print Preview sẽ thấy nhiều nút lệnh để in ra giấy, chuyển thành tệp Excel, chuyển thành tệp PDF.

Hoàn tất ứng dụng quản lí thư viện theo yêu cầu sử dụng thực tế.

## Câu hỏi
1. Biểu mẫu điều hướng dùng để làm gì và chứa những gì?
2. Thao tác thiết lập biểu mẫu điều hướng làm bàn điều khiển trung tâm của ứng dụng gồm mấy bước? Bắt đầu bằng thao tác nào?

## Tóm tắt bài học
Những công việc chính để hoàn tất ứng dụng là:
- Thiết kế giao diện, bài trí các nút lệnh phù hợp với quy trình nghiệp vụ quản lí CSDL và cung cấp dịch vụ.
- Tạo một biểu mẫu điều hướng và thực hiện các thiết kế giao diện như trên, chỉnh sửa lại các nhãn tiêu đề, chạy thử kiểm tra.
- Thiết lập biểu mẫu điều hướng làm bàn điều khiển trung tâm của ứng dụng.
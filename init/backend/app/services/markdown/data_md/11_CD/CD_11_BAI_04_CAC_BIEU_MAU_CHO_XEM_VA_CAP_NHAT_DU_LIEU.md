# BÀI: CÁC BIỂU MẪU CHO XEM VÀ CẬP NHẬP DỮ LIỆU

Học xong bài này; em sẽ:
- Diễn đạt được khái niệm biểu mẫu trong các CSDL và ứng dụng CSDL thông.
- Giải thích được những ưu điểm khi người dùng xem và cập nhật dữ liệu cho CSDL qua biểu mẫu.

Khi nhập dữ liệu vào một bảng của CSDL quan hệ, theo em có thể gặp những lỗi nào? Em hãy cho ví dụ.

## Khái niệm và chức năng của biểu mẫu

### Chức năng của biểu mẫu
CSDL có thể được nhiều người dùng tiếp xúc với CSDL. Các giao diện đã được thiết kế phù hợp với mỗi nhóm người làm việc với CSDL. Biểu mẫu là giao diện thuận tiện để người dùng tương tác với CSDL khi xem dữ liệu, hạn chế bớt lỗi, tránh vi phạm ràng buộc về dữ liệu khi cập nhật CSDL. Biểu mẫu được thiết kế nhằm các mục đích sau:
- Hiển thị dữ liệu trong bảng dưới dạng phù hợp để xem.
- Cung cấp một khuôn dạng thuận tiện để nhập và sửa dữ liệu.
- Cung cấp các nút lệnh để người dùng có thể sử dụng thông qua đó thực hiện một số thao tác với dữ liệu.

Phổ biến nhất là các biểu mẫu hiển thị dữ liệu cho những nhóm người và biểu mẫu cho người nhập dữ liệu.

### Tạo biểu mẫu
Các hệ quản trị CSDL thường cung cấp các công cụ để tạo được biểu mẫu cho người dùng CSDL. Muốn nhanh chóng có được biểu mẫu theo ý minh, ta có thể dùng công cụ thiết kế biểu mẫu tự động - sau đó điều chỉnh thêm để có một biểu mẫu thân thiện hơn, thuận tiện hơn trong sử dụng. Những ứng dụng CSDL đơn giản sử dụng các biểu mẫu được tạo ra theo cách này. Trong khi đó, những ứng dụng CSDL lớn và phức tạp (thường là những phần mềm được xây dựng trên nền hệ quản trị CSDL) các biểu mẫu của phần mềm được tạo ra nhờ một ngôn ngữ lập trình như một thành phần.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Biểu mẫu cho xem dữ liệu

Các hệ quản trị CSDL quan hệ thường cung cấp công cụ lập nhanh chóng không những biểu mẫu cho xem dữ liệu, những biểu mẫu loại này cho phép truy xuất dữ liệu. Việc thiết kế những biểu mẫu như vậy là để hỗ trợ cho những nhóm người dùng tra cứu thông tin của CSDL trong phạm vi được phép:

- Biểu mẫu chỉ hiển thị dữ liệu dùng cần hoặc dữ liệu được phép xem.
- Có thể thiết kế biểu mẫu hiển thị chỉ một phần của dữ liệu trong bảng.
- Biểu mẫu hiển thị các bản ghi theo thứ tự sắp xếp của một trường nào đó.
- Biểu mẫu cho xem dữ liệu được lọc theo một tiêu chí nào đó và có thể lọc dẫn nhiều bước.

## ĐỊA CHỈ LIÊN LẠC CỦA HỌC SINH LỚP 11

| Mã định danh | Họ và tên         | Giới tính | Địa chỉ               |
|--------------|-------------------|-----------|-----------------------|
| 13109413     | Phau Thuy Anh     | Nữ       | Hủng Vương            |
| 13109735     | Lê Miuh Đỉrc      | Nam       | Văn Cao, Thanh        |
| 13124595     | Hoang Glang       | Nam       | 27 Lú Su, Trượt      |
| 13126236     | Đaug Phuong       | Nam       | 148 Hàng Gà, Đọc     |

**Record:** 10/16 Thanh trượt ngang

Hình 1. Một biểu mẫu cho xem dữ liệu một số (rộng của một bảng). Các biểu mẫu minh họa trong bài đều được lập ra bởi hệ quản trị CSDL Microsoft Access 365. Biểu mẫu như ở Hình 1 chỉ hiển thị một số trường của bảng dữ liệu nguồn THÔNG TIN HỌC SINH LỚP 11 (không hiển thị điểm các môn học). Các thanh trượt dọc và ngang được dùng để xem những dữ liệu bị khuất trong cửa sổ biểu mẫu. Các nút được dùng để chuyển đến xem bản ghi đứng trước hoặc đứng sau bản ghi hiện thời. Có thể chỉ hiển thị danh sách các bản ghi thỏa mãn điều kiện nào đó (ví dụ xem danh sách học sinh là Đoàn viên) bằng cách sử dụng chức năng lọc bản ghi theo điều kiện. Người dùng biểu mẫu có thể thay đổi các điều kiện lọc, điều kiện sắp xếp ngay trên biểu mẫu để xem được dữ liệu tương ứng.

Biểu mẫu cũng có thể hiển thị các trường từ nhiều bảng khác nhau. Hình 2 cho thấy dữ liệu trong biểu mẫu lấy từ 3 bảng SÁCH, NGƯỜI ĐỌC và MƯỢN-TRA của CSDL Thư viện trong ví dụ đã nêu.

Đọc bản mới nhất trên hoc10.vn                                                    Bản sách mẫu



# THEO DÕI SÁCH MƯỢN

| Sổ thé TV | Họ và tên       | Mã sách | Tên sách                     | Ngày mượn   | Ngày trả    |
|-----------|------------------|---------|-------------------------------|--------------|-------------|
| HS C01    | Bunl             | TH 01   | Al-Trí tuệ nhân tạo         | 14/10/2022   | 21/10/2022  |
| RS C01    | Izan Vhn         | AN 01   | Âm nhạc quân đội            | 02/10/2022   | 09/10/2022  |
| HS C01    | Hn Ilu Mlaf      | AN 01   | Rm nhạc &#x26; quân đội          | 14/10/2022   | -           |
| HS C01    | Tran Vin An      | TH 02   | Al-Trí tuệ nhân tạo         | 15/10/2022   | 27/10/2022  |
| HS C01    | Thi Mnr          | TO-01   | S3r8Do Toán học             | 15/10/2022   | 25/10/2022  |

----

## Hình Mẫu Biểu Mẫu Của CSDL Thư Viện

### Biểu mẫu cho cập nhật dữ liệu

Theo em, có những bất lợi nào trong việc mở một bảng của CSDL quan hệ rồi trực tiếp cập nhật dữ liệu (thêm bản ghi, sửa các bản ghi trong đó)?

Các hệ quản trị CSDL quan hệ cũng thường cung cấp công cụ cho phép tạo lập nhanh chóng những biểu mẫu cập nhật dữ liệu. Những biểu mẫu loại này có các ô nhập dữ liệu còn dễ trông hoặc chứa dữ liệu đã có nhưng cho phép sửa đổi. Các ô và nhãn đi kèm được bố trí hợp lý cho việc xem và thực hiện thao tác cập nhật.

Việc thiết kế những biểu mẫu như vậy giúp việc cập nhật dữ liệu được tiện lợi hơn, hạn chế được những sai sót khi cập nhật:
- Tránh được các cập nhật vi phạm ràng buộc toàn vẹn như ràng buộc khóa, ràng buộc khóa ngoài.
- Tránh được các cập nhật vi phạm ràng buộc miền giá trị: tức là không đưa vào giá trị nằm ngoài tập giá trị được chấp nhận.

### Ví dụ

Biểu mẫu (Hình 3) dùng để nhập dữ liệu. Dữ liệu của các trường ở nửa bên trên biểu mẫu đó (Mã định danh, Giới tính) được hiển thị và bị khóa lại không cho thay đổi.

![Hình 3. Ảnh biểu mẫu nhập điểm cho học sinh](#)

----

Đọc bản mới nhất trên hoc10.vn                                                Bản sách mẫu



# NHẬP DỮ LIỆU MƯỢN-TRẢ SÁCH

Có thể thiết kế biểu mẫu dùng để cập nhật dữ liệu cho bảng MƯỢN-TRA và tránh được các phạm vi ràng buộc khoa ngoại.

## Hình 4a
Biểu mẫu cập nhật được thiết kế để Số thẻ TV của người mượn (hay người trả) không thể gõ nhập vào mà chỉ được chọn trong một danh sách thả xuống.

## Hình 4b
Biểu mẫu cho phép nhập dữ liệu Ngày mượn, Ngày trả theo cách mở lịch và chọn ngày trên đó.

| Số thẻ TV | Mã sách | Ngày mượn | Ngày trả |
|-----------|---------|------------|----------|
| HS-001    | AN-01   | 02/10/2022 |          |
| HS-002    |         |            |          |
| HS-003    |         |            |          |
| HS-004    |         |            |          |

### Ví dụ 2
Một sổ CSDL trực tuyến cũng có các biểu mẫu cho sẵn phục vụ như biểu mẫu khai báo y tế mà người dân có thể điền trên diện.

## Thực hành tạo biểu mẫu và cập nhật dữ liệu

### Nhiệm vụ 1
Cô giáo đã dựng sẵn 3 bảng: SÁCH NGƯỜI ĐỌC, MƯỢN-TRA cùng một vài biểu mẫu trong CSDL Thư viện (tạo bảng Access). Em hãy sử dụng biểu mẫu NHẬP DỮ LIỆU MƯỢN-TRA SÁCH đã có để nhập 3 bản ghi mới cho bảng MƯỢN-TRA.

#### Hướng dẫn thực hiện:
1. Kích hoạt Microsoft Access.
2. Mở CSDL Thư viện, chọn biểu mẫu NHẬP DỮ LIỆU MƯỢN-TRA SÁCH.
3. Trên biểu mẫu vừa mở, hãy nhập ít nhất 3 bản ghi.
4. Tìm và mở biểu mẫu XEM THÔNG TIN MƯỢN-TRA SÁCH để kiểm tra những bản ghi nhập vào ở bước 3 đã xuất hiện trong bảng MƯỢN-TRA chưa.
5. Kết thúc phiên làm việc với CSDL Thư viện, trong bảng chọn File chọn nút lệnh Close để đóng CSDL lại.

### Nhiệm vụ 2
Khám phá cách dùng công cụ tạo biểu mẫu trong Access.

#### Hướng dẫn thực hiện:
1. Chọn mở CSDL HỌC SINH 11. Mở bảng HỌC SINH 11.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Bước 2
Nháy chuột vào **Create** để xuất hiện các công cụ lập. Trong đó có các công cụ tạo lập biểu mẫu (Hình 5).

```
Home          Create          External Data          Database Tools          Help
Table         Fields          Table          SharePoint          Query          Query
Form Wizard   Application      Table          Table          SharePoint          Query
Fou hamn      Blank           Navigation       Report          Report          Blank
Parts         Design          Users            Wizard          Design          Design Form
More Forms    Design          Report
```

| Mã định danh | Họ và tên      | Ngày sinh   | Giới tính | Đoàn viên | Địa chỉ   |
|--------------|----------------|-------------|-----------|-----------|-----------|
| 13109413     | Phan Thuy Anh  | 29/10/2007  | Nữ       | Hung Vong |           |
| 13109735     | Le Minh Đuc    | 05/09/2007  | Nam      | 15 Ván Cao|           |
| 13124595     | Hoang Giang    | 21/12/2007  | Nam      | 27 Lo 50  |           |

**Hình 5**: Các công cụ tạo lập biểu mẫu trong Access

# Bước 3
Chọn và khám phá công cụ **Form Wizard**: Chọn các trường cho biểu mẫu, đặt tên biểu mẫu, chọn **Finish**.

# Bước 4
Đóng CSDL **HỌC SINH 11** để kết thúc phiên làm việc với CSDL này.

Nếu là người xây dựng một CSDL quản lý học sinh khối 11 của trường mình, em sẽ xây dựng những biểu mẫu nào? Mỗi biểu mẫu em định thiết kế sẽ có chức năng nào và đem lại thuận lợi gì cho ai?

## Trong các câu sau, những câu nào đúng?
a) Mỗi biểu mẫu đều được dùng chung cho tất cả mọi người sử dụng CSDL.
b) Mỗi biểu mẫu là một cửa sổ cho người dùng xem toàn bộ thông tin trong một bảng của CSDL.
c) Khi cập nhật dữ liệu, cần sử dụng biểu mẫu vì có thể đảm bảo được ràng buộc khóa và khóa ngoài, tránh được nhiều sai sót về dữ liệu.
d) Biểu mẫu là một giao diện được thiết kế để kiểm soát các truy cập của người dùng đến dữ liệu trong CSDL.

# Tóm tắt bài học
Biểu mẫu là một loại giao diện cho người dùng CSDL tương tác với dữ liệu nguồn trong việc xem và cập nhật dữ liệu. Biểu mẫu đem lại sự thuận tiện cho các nhóm người dùng làm việc với CSDL và giúp hạn chế những vi phạm trong cập nhật nhằm tăng cường sự đảm bảo tính đúng đắn của dữ liệu.

Đọc bản mới nhất trên hoc10.vn    Bản sách mẫu
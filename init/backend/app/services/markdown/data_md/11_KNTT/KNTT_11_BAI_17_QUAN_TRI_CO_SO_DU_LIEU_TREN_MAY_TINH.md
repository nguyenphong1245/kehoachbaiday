# Chủ đề 6: Thực hành tạo và khai thác cơ sở dữ liệu

## BÀI 17: QUẢN TRỊ CƠ SỞ DỮ LIỆU TRÊN MÁY TÍNH

### SAU BÀI HỌC NÀY EM SẼ
- Biết được lợi ích của việc quản trị CSDL trên máy tính.
- Làm quen với MySQL và HeidiSQL - bộ công cụ hỗ trợ việc quản trị CSDL trên máy tính.

Trở lại với các bài toán quản lí điểm; quản lí các bản thu âm (Bài 10 đến Bài 15), em có nhận xét; so sánh gì về việc cập nhật; chỉnh sửa dữ liệu giữa quản lí thủ công và quản lí CSDL trên máy tính?

## 1. LỢI ÍCH CỦA VIỆC QUẢN TRỊ CƠ SỞ DỮ LIỆU TRÊN MÁY TÍNH

### Hoạt động: Tìm hiểu lợi ích của quản trị CSDL trên máy tính
Các bài toán quản lí cùng với việc lưu trữ dữ liệu, khai thác thông tin đã xuất hiện từ rất lâu trong các hoạt động kinh tế - xã hội với những nghiệp vụ được vận hành nề nếp, ổn định từ rất nhiều năm. Hãy cùng tìm hiểu tại sao lại phải thay đổi thói quen quản lí thủ công, chuyển sang sử dụng máy tính với hệ QTCSDL.

Trước khi có máy tính và giải pháp quản trị CSDL trên máy tính, việc quản lí dữ liệu thủ công là công việc rất vất vả, khó kiểm soát; đòi hỏi nhiều công sức, đặc biệt với những dữ liệu không được phép sai sót dù rất nhỏ, chẳng hạn như với ngành ngân hàng.

Hằng ngày, nhân viên ngân hàng phải tiếp số lượng lớn khách hàng đến thực hiện các giao dịch gửi, rút tiền; mỗi giao dịch đều phải tiếp nhận thông tin khách hàng, đối chiếu với thông tin lưu trong sổ sách, ghi chép chính xác lượng tiền gửi vào hay rút ra, lập các chứng từ cần thiết. Vì vậy, cần nhiều thời gian cho mỗi giao dịch.

Cuối ngày, nhân viên ngân hàng lại phải thực hiện rà soát số liệu; so sánh, đối chiếu để phát hiện, xử lí nếu có sai sót, làm sổ tổng hợp dữ liệu tài khoản, số dư trong ngày; làm các chứng từ giao dịch liên ngân hàng. Vì vậy, tiền tệ luân chuyển chậm, mất nhiều thời gian; ảnh hưởng lớn đến tất cả các hoạt động sản xuất kinh doanh trong xã hội.

Những chức năng được thiết kế để hạn chế tối đa dư thừa dữ liệu; đảm bảo tính nhất quán của dữ liệu, đảm bảo an ninh và an toàn dữ liệu, đã giúp hoạt động của ngân hàng ngày nay có nhiều chuyển biến tiến bộ.



# Việc tìm kiếm, xác định một khách hàng cung danh sách các giao dịch đã thực hiện

Việc tìm kiếm, xác định một khách hàng cung danh sách các giao dịch đã thực hiện cũng như số dư tài khoản trong CSDL có thể thực hiện một cách nhanh chóng và chính xác. Tài khoản đích trong mỗi giao dịch cũng có thể được kiểm tra xác nhận ngay trước khi thực hiện giao dịch, không những rút ngắn thời gian giao dịch mà còn hạn chế tối đa những giao dịch nhầm lẫn. Nhiều hệ QTCSDL cho phép cài đặt bổ sung các dịch vụ đa (phần mềm) hỗ trợ giao dịch trực tuyến trên máy tính, điện thoại di động, mà không cần yêu cầu khách hàng phải trực tiếp tới các chi nhánh ngân hàng.

Không riêng lĩnh vực ngân hàng; việc ứng dụng mô hình tổ chức và quản trị CSDL một cách khoa học trên máy tính trong quản lý của các lĩnh vực khác nhau đều đem lại nhiều lợi ích to lớn. Chính vì vậy, ngày nay, việc ứng dụng quản trị CSDL trên máy tính đã được thực hiện một cách phổ biến ở hầu khắp các hoạt động quản lý kinh tế xã hội.

Việc ứng dụng CSDL trong quản lý đem lại nhiều lợi ích to lớn: tiện lợi, kịp thời, nhanh chóng, hạn chế sai sót.

**Hãy nêu vài ví dụ thực tế minh họa về việc ứng dụng quản trị CSDL trên máy tính và những lợi ích mà nó mang lại.**

## 2 HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU MYSQL VÀ PHẦN MỀM HEIDISQL

### Hoạt động 2: Tìm hiểu và lựa chọn hệ QTCSDL

Hãy sử dụng từ khóa "hệ quản trị CSDL phổ biến" để tìm kiếm thông tin trên Internet và trả lời câu hỏi "Nếu được lựa chọn, em sẽ chọn hệ QTCSDL nào để đáp ứng được các tiêu chí nhiều người dùng và là hệ QTCSDL miễn phí"?

Để có thể làm việc được với CSDL (khởi tạo CSDL; tạo bảng, cập nhật dữ liệu và khai thác thông tin) cần phải có một hệ QTCSDL và một phần mềm giúp giao tiếp với hệ QTCSDL đó. Các hệ QTCSDL được dùng phổ biến nhất hiện nay có thể kể tới là ORACLE, MySQL, Microsoft SQL Server. Trong số đó chỉ có MySQL là sản phẩm mã nguồn mở miễn phí. MySQL cũng được đánh giá là gọn nhẹ, tốc độ xử lý nhanh, hỗ trợ quản lý chặt chẽ sự nhất quán dữ liệu, đảm bảo an ninh và an toàn dữ liệu, thích hợp cho cả các bài toán quản trị CSDL lớn cũng như các bài toán quản trị CSDL trên Internet.

Với những đặc điểm trên, MySQL được sử dụng phổ biến trong các ứng dụng quản lý hiện nay. Trong sách này, em sẽ làm quen với MySQL để thực hành quản trị CSDL.

### a) Cài đặt và làm việc với MySQL

Truy cập trang dev.mysql.com/downloads/mysql để tải về một trong các bản:
- Bản cài đặt tự động: Windows (x86, 32/64-bit) MySQL Installer MSI.
- Bản Windows (x86, 64-bit) ZIP archive (gọn nhẹ).
- Bản đầy đủ Windows (x86, 64-bit) ZIP archive (với Debug Binaries &#x26; Test Suite).

Với bản cài đặt tự động, trong quá trình cài đặt sẽ có yêu cầu nhập mật khẩu cho người dùng root (tương tự administrator của hệ điều hành Windows). Cần ghi nhớ mật khẩu này để truy xuất MySQL. Sau khi cài đặt, MySQL sẽ hoạt động như một dịch vụ hệ thống (Service).



# MySQL

MySQL có sẵn phần mềm khách giúp người dùng có thể kết nối; làm việc với MySQL; dùng giao diện dòng lệnh, có tên là `mysql.exe` trong thư mục `bin` của thư mục MySQL.

## Hướng dẫn kết nối

Hãy mở cửa sổ dòng lệnh (chẳng hạn chạy `cmd.exe`).

```bash
mysql -u root -p
```

Nhập mật khẩu của người dùng root; nhấn phím Enter để mở cửa sổ làm việc.

### Hình 17.1. Gọi chạy mysql trong cửa sổ lệnh của MySQL

```plaintext
Command Prompt mysql -uroot -p
Welcome to the MySQL Monitor
Commands end with ; or \g.
Your MySQL connection id is 97
Server version: 5.5.5-10.6.4-MariaDB mariadb.org binary distribution
Copyright (c) 2000, 2022, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql>
```

### Hình 17.2. Cửa sổ làm việc của MySQL sau khi đăng nhập

Trong cửa sổ làm việc này, có thể nhập các câu truy vấn SQL và nhận được thông báo về kết quả và thời gian thực hiện câu truy vấn đó, tính đến phần trăm giải:

```bash
mysql> select * from rytusic.bannhac;
```

| idBannhac | tenBannhac                          | idMhacsi |
|-----------|-------------------------------------|----------|
|           | Du kích sông Thao                  |          |
|           | Nhạc rừng                           |          |
|           | Tiến về Hà Nội                     |          |
|           | Tình ca                             |          |
|           | Trường ca Sông Lô                  |          |
|           | Việt Nam quê hương tôi             |          |
|           | Xa khơi                             |          |

**Hình 17.3. Ví dụ về câu truy vấn đọc toàn bộ nội dung bảng bannhac trong CSDL mymusic**



# Phần mềm HeidiSQL

Phần mềm mysql.exe giúp kết nối, làm việc với hệ QTCSDL MySQL tuy rất gọn nhẹ nhưng dùng giao diện dòng lệnh nên không thật thuận tiện với người dùng mới. Sẽ thuận lợi hơn nếu có một phần mềm tương tự, dùng giao diện đồ hoạ. HeidiSQL là phần mềm như vậy: Đây là một phần mềm mã nguồn mở, miễn phí, giúp kết nối, làm việc với nhiều hệ QTCSDL như MySQL, MariaDB, Microsoft SQL Server, PostgreSQL. Hơn nữa, HeidiSQL còn là hệ QTCSDL có hỗ trợ tiếng Việt nên được lựa chọn giới thiệu trong sách này.

## Cài đặt HeidiSQL

Truy cập trang www.heidisql.com/download để tải về một trong hai bản sau:
- Bản cài đặt tự động Installer; 32/64 bit combined.
- Bản Portable version (zipped): 32 bit; 64 bit

Bản Portable là bản nén dạng zip; chỉ cần giải nén vào một thư mục và chạy tệp `heidisql.exe`. Bản cài đặt tự động sẽ thêm biểu tượng HeidiSQL trên màn hình nền.

## Làm việc với HeidiSQL

Nháy đúp chuột vào biểu tượng HeidiSQL trên màn hình nền để khởi động hoặc nháy đúp trực tiếp tệp `heidisql.exe`. Giao diện ban đầu như Hình 17.4.

### Trình quản lý phiên

| Tên phiên | Mã | Kiểu mạng | Tên máy chủ / IP | Cổng | Ngược dùng | Mật khẩu | Cổng | Nhũng cở dữ liệu | Bình luận |
|-----------|-----|-----------|------------------|------|------------|----------|------|------------------|-----------|
| Unnamed   | 127.0.0.1 | MariaDB or MySQL (TCP/IP) | 127.0.0.1 | 3306 | Sử dụng xác thực của Windows | | | [Phân chia bởi dấu chấm phẩy] | |

**Hình 17.4. Giao diện đầu tiên của HeidiSQL**

Các ô Kiểu mạng Library được đặt các giá trị mặc định để kết nối với các hệ QTCSDL MySQL hay MariaDB. Tên máy chủ IP và các ô kiểm đi kèm được đặt giá trị mặc định vì MySQL và HeidiSQL được cài đặt trên cùng một máy. Người dùng (tên dùng CSDL): hãy nhập `root`.



# Mật khẩu
Nhập mật khẩu của người dùng root.

## Cổng
Cổng dùng giá trị mặc định là cổng giao tiếp dành cho các hệ QTCSDL.

Sau khi nhập tên người dùng và mật khẩu, hãy chọn **Mở** để vào cửa sổ làm việc:

### Giao diện sau khi đăng nhập thành công của HeidiSQL như Hình 17.5

```
Unnamed{ HeidiSQL Paltable 12.0,0,6468
Tạp tin Chỉnh sửa  Tim kiẽm       Truy vấn Cac cong cụ Đẽn Trợ giup

Bậ loc bang             @Kho0                                                      0lo
Bọ lcc co ,0                               Mảy chú: 127,0.0,1  Truy vấn
Unnamed                 320,0 KiB          Nhùng cc sẺ dữ liệu {2)  Cac biẽn     Trặng thái  TiẼn trinh Iul Lệnh
infcrnaticn     258,0 KiB  Co s dử liệu                     Kich cò      Items  Lan 5 Tables  Views  Func.
mymusic         112,0 KiB          infcrmation_schema       208,0 KiB           2022 _
mymusic                  112,0 KiB           2022,"
```

### Vùng danh sách
Vùng làm việc chính: tương tác tạo lập; cập nhật; truy xuất dữ liệu và hiển thị kết quả các CSDL đã có.

```
Bậ lcc Regular expression
SELECT     EVENT SChEN4 As         Db EVENT_NAFE            Name     FROM infocmation schema , EvENts IHERE
Connecte = MariaDB 16,64         Uptime 14 days 0o:  Server tim Oldle
Hình 17.5. Giao diện làm việc cúa HeidiSQL
```

Chú ý: Khi cài đặt HeidiSQL, nếu máy tính kết nối Internet; HeidiSQL sẽ tự động nhận biết mã vùng quốc gia và thiết lập giao diện với ngôn ngữ tương ứng. Người dùng có thể thiết lập ngôn ngữ công cụ **Tools > Preferences > General**.

Trong các bài học tiếp theo; em sẽ được hướng dẫn chi tiết các thao tác với HeidiSQL để tạo lập CSDL; tạo bảng dữ liệu cũng như cập nhật và truy xuất dữ liệu.

## LÝ THUYẾT
MySQL và HeidiSQL là các phần mềm mã nguồn mở, được nhiều người dùng để quản trị các CSDL.

Cần gõ câu truy vấn nào trong cửa sổ lệnh của MySQL để đọc được toàn bộ thông tin bảng nhacsi trong CSDL mymusic?

## LUYÊN TẬP
Thực hành cài đặt MySQL và cài đặt HeidiSQL.

## VẬN DỤNG
Truy cập Internet với các cụm từ khoá thích hợp để tìm hiểu thêm thông tin về MySQL và HeidiSQL.
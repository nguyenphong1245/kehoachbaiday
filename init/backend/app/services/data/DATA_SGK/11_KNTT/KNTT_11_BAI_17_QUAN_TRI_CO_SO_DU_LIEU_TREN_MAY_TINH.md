# BÀI 17: QUẢN TRỊ CƠ SỞ DỮ LIỆU TRÊN MÁY TÍNH

## SAU BÀI HỌC NÀY EM SẼ
- Biết được lợi ích của việc quản trị CSDL trên máy tính.
- Làm quen với MySQL và HeidiSQL - bộ công cụ hỗ trợ việc quản trị CSDL trên máy tính.

## Câu hỏi khởi động
Trở lại với các bài toán quản lí điểm; quản lí các bản thu âm (Bài 10 đến Bài 15), em có nhận xét; so sánh gì về việc cập nhật; chỉnh sửa dữ liệu giữa quản lí thủ công và quản lí CSDL trên máy tính?

## 1. LỢI ÍCH CỦA VIỆC QUẢN TRỊ CƠ SỞ DỮ LIỆU TRÊN MÁY TÍNH
### Hoạt động
Các bài toán quản lí cùng với việc lưu trữ dữ liệu, khai thác thông tin đã xuất hiện từ rất lâu trong các hoạt động kinh tế - xã hội với những nghiệp vụ được vận hành nề nếp, ổn định từ rất nhiều năm. Hãy cùng tìm hiểu tại sao lại phải thay đổi thói quen quản lí thủ công, chuyển sang sử dụng máy tính với hệ QTCSDL.

Trước khi có máy tính và giải pháp quản trị CSDL trên máy tính, việc quản lí dữ liệu thủ công là công việc rất vất vả, khó kiểm soát; đòi hỏi nhiều công sức, đặc biệt với những dữ liệu không được phép sai sót dù rất nhỏ, chẳng hạn như với ngành ngân hàng.

Hằng ngày, nhân viên ngân hàng phải tiếp số lượng lớn khách hàng đến thực hiện các giao dịch gửi, rút tiền; Mỗi giao dịch đều phải tiếp nhận thông tin khách hàng, đối chiếu với thông tin lưu trong sổ sách, ghi chép chính xác lượng tiền gửi vào hay rút ra, lập các chứng từ cần thiết. Vì vậy, cần nhiều thời gian cho mỗi giao dịch.

Cuối ngày, nhân viên ngân hàng lại phải thực hiện rà soát số liệu; so sánh; đối chiếu để phát hiện; xử lí nếu có sai sót, làm sổ tổng hợp dữ liệu tài khoản; số dư trong ngày; làm các chứng từ giao dịch liên ngân hàng. Vì vậy, tiền tệ luân chuyển chậm, mất nhiều thời gian; ảnh hưởng lớn đến tất cả các hoạt động sản xuất kinh doanh trong xã hội.

Những chức năng được thiết kế để hạn chế tối đa dư thừa dữ liệu; đảm bảo tính nhất quán của dữ liệu, đảm bảo an ninh và an toàn dữ liệu, đã giúp hoạt động của ngân hàng ngày nay có nhiều chuyển biến tiến bộ.

----

### Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa quy trình giao dịch tại ngân hàng, thể hiện sự phức tạp và thời gian cần thiết cho việc quản lý dữ liệu thủ công.)

### Bảng biểu
| Hoạt động | Thời gian (phút) | Ghi chú |
|-----------|------------------|---------|
| Tiếp nhận thông tin khách hàng | 5 | Cần chính xác |
| Ghi chép giao dịch | 10 | Rủi ro sai sót |
| Rà soát số liệu cuối ngày | 30 | Tốn thời gian |

----

## Bài tập và câu hỏi
1. Nêu những lợi ích của việc sử dụng CSDL trên máy tính so với quản lý thủ công.
2. Hãy mô tả một tình huống cụ thể mà việc quản lý dữ liệu trên máy tính có thể giúp tiết kiệm thời gian và công sức.
3. Tìm hiểu và trình bày về MySQL và HeidiSQL, nêu rõ chức năng của từng công cụ trong việc quản trị CSDL.



# Tiêu đề bài học: Hệ quản trị cơ sở dữ liệu MySQL và phần mềm HeidiSQL

## Nội dung lý thuyết:
Việc tìm kiếm, xác định một khách hàng cung danh sách các giao dịch đã thực hiện cũng như số dư tài khoản trong CSDL có thể thực hiện một cách nhanh chóng và chính xác. Tài khoản đích trong mỗi giao dịch cũng có thể được kiểm tra xác nhận ngay trước khi thực hiện giao dịch, không những rút ngắn thời gian giao dịch mà còn hạn chế tối đa những giao dịch nhầm lẫn. Nhiều hệ QTCSDL cho phép cài đặt bổ sung các dịch vụ đa (phần mềm) hỗ trợ giao dịch trực tuyến trên máy tính, điện thoại di động, mà không cần yêu cầu khách hàng phải trực tiếp tới các chi nhánh ngân hàng.

Không riêng lĩnh vực ngân hàng; việc ứng dụng mô hình tổ chức và quản trị CSDL một cách khoa học trên máy tính trong quản lý của các lĩnh vực khác nhau đều đem lại nhiều lợi ích to lớn. Chính vì vậy, ngày nay, việc ứng dụng quản trị CSDL trên máy tính đã được thực hiện một cách phổ biến ở hầu khắp các hoạt động quản lý kinh tế xã hội. Việc ứng dụng CSDL trong quản lý đem lại nhiều lợi ích to lớn: tiện lợi, kịp thời, nhanh chóng, hạn chế sai sót.

## Ví dụ minh họa:
Hãy nêu vài ví dụ thực tế minh họa về việc ứng dụng quản trị CSDL trên máy tính và những lợi ích mà nó mang lại.

## Bài tập và câu hỏi:
1. Hãy sử dụng từ khóa "hệ quản trị CSDL phổ biến" để tìm kiếm thông tin trên Internet và trả lời câu hỏi: "Nếu được lựa chọn, em sẽ chọn hệ QTCSDL nào để đáp ứng được các tiêu chí nhiều người dùng và là hệ QTCSDL miễn phí"?

Để có thể làm việc được với CSDL (khởi tạo CSDL; tạo bảng, cập nhật dữ liệu và khai thác thông tin) cần phải có một hệ QTCSDL và một phần mềm giúp giao tiếp với hệ QTCSDL đó. Các hệ QTCSDL được dùng phổ biến nhất hiện nay có thể kể tới là ORACLE, MySQL, Microsoft SQL Server. Trong số đó chỉ có MySQL là sản phẩm mã nguồn mở miễn phí. MySQL cũng được đánh giá là gọn nhẹ, tốc độ xử lý nhanh, hỗ trợ quản lý chặt chẽ sự nhất quán dữ liệu, đảm bảo an ninh và an toàn dữ liệu, thích hợp cho cả các bài toán quản trị CSDL lớn cũng như các bài toán quản trị CSDL trên Internet.

## Hình ảnh mô tả:
- (Ghi chú về hình ảnh: Hình ảnh minh họa giao diện của MySQL và HeidiSQL, thể hiện cách thức kết nối và quản lý cơ sở dữ liệu.)

## Bảng biểu:
- (Ghi chú về bảng biểu: Bảng so sánh các hệ quản trị CSDL phổ biến, bao gồm các tiêu chí như tính năng, tốc độ, độ an toàn, và chi phí.)

## Cài đặt và làm việc với MySQL:
Truy cập trang dev.mysql.com/downloads/mysql để tải về một trong các bản:
- Bản cài đặt tự động: Windows (x86, 32/64-bit) MySQL Installer MSI.
- Bản Windows (x86, 64-bit) ZIP archive (gọn nhẹ).
- Bản đầy đủ Windows (x86, 64-bit) ZIP archive (với Debug Binaries &#x26; Test Suite).

Với bản cài đặt tự động, trong quá trình cài đặt sẽ có yêu cầu nhập mật khẩu cho người dùng root (tương tự administrator của hệ điều hành Windows). Cần ghi nhớ mật khẩu này để truy xuất MySQL. Sau khi cài đặt, MySQL sẽ hoạt động như một dịch vụ hệ thống (Service).



# Bài học: Kết nối và làm việc với MySQL

## Nội dung lý thuyết
MySQL có sẵn phần mềm khách giúp người dùng có thể kết nối và làm việc với MySQL thông qua giao diện dòng lệnh, có tên là `mysql.exe` trong thư mục `bin` của thư mục MySQL. Để mở cửa sổ dòng lệnh (chẳng hạn chạy `cmd.exe`), người dùng cần nhập lệnh sau:

```
mysql -u root -p
```

- `-u` là viết tắt của từ "user".
- `-p` là viết tắt của từ "password".

Sau khi nhấn phím Enter, người dùng sẽ được yêu cầu nhập mật khẩu của người dùng root. Nhấn phím Enter để mở cửa sổ làm việc của MySQL.

## Ví dụ minh họa
### Hình 17.1: Gọi chạy mysql trong cửa sổ lệnh của MySQL
```
Command Prompt mysql -uroot -p
Welcome to the MySQL Monitor. Commands end with ; or \g.
Your MySQL connection id is 97
Server version: 5.5.5-10.6.4-MariaDB mariadb.org binary distribution
Copyright (c) 2000, 2022, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates. Other names may be trademarks of their respective owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
mysql>
```

### Hình 17.2: Cửa sổ làm việc của MySQL sau khi đăng nhập
Trong cửa sổ làm việc này, người dùng có thể nhập các câu truy vấn SQL và nhận được thông báo về kết quả và thời gian thực hiện câu truy vấn đó, tính đến phần trăm giải:

```
Command Prompt - mysql -uroot -p
mysql> select * from rytusic.bannhac;
```

## Bài tập và câu hỏi
1. Hãy mô tả cách kết nối đến MySQL bằng giao diện dòng lệnh.
2. Viết câu lệnh SQL để truy vấn toàn bộ nội dung của một bảng trong cơ sở dữ liệu của bạn.
3. Giải thích ý nghĩa của các tham số `-u` và `-p` trong lệnh kết nối MySQL.

## Hình ảnh mô tả
- **Hình 17.1**: Gọi chạy mysql trong cửa sổ lệnh của MySQL.
- **Hình 17.2**: Cửa sổ làm việc của MySQL sau khi đăng nhập.
- **Hình 17.3**: Ví dụ về câu truy vấn đọc toàn bộ nội dung bảng `bannhac` trong CSDL `mymusic`.

## Bảng biểu
| idBannhac | tenBannhac                     | idMhacsi |
|-----------|--------------------------------|----------|
| 1         | Du kích sông Thao             | ...      |
| 2         | Nhạc rừng                      | ...      |
| 3         | Tiến về Hà Nội                | ...      |
| 4         | Tình ca                        | ...      |
| 5         | Trường ca Sông Lô             | ...      |
| 6         | Việt Nam quê hương tôi        | ...      |
| 7         | Xa khơi                        | ...      |

**Ghi chú**: Các thông tin trong bảng trên chỉ là ví dụ minh họa và có thể không chính xác với cơ sở dữ liệu thực tế.



# Phần mềm HeidiSQL

## Nội dung lý thuyết
Phần mềm mysql.exe giúp kết nối, làm việc với hệ QTCSDL MySQL tuy rất gọn nhẹ nhưng dùng giao diện dòng lệnh nên không thật thuận tiện với người dùng mới. Sẽ thuận lợi hơn nếu có một phần mềm tương tự, dùng giao diện đồ hoạ. HeidiSQL là phần mềm như vậy: Đây là một phần mềm mã nguồn mở, miễn phí, giúp kết nối, làm việc với nhiều hệ QTCSDL như MySQL, MariaDB, Microsoft SQL Server, PostgreSQL. Hơn nữa, HeidiSQL còn là hệ QTCSDL có hỗ trợ tiếng Việt nên được lựa chọn giới thiệu trong sách này.

## Cài đặt HeidiSQL
Truy cập trang www.heidisql.com/download để tải về một trong hai bản sau:
- Bản cài đặt tự động Installer; 32/64 bit combined.
- Bản Portable version (zipped): 32 bit; 64 bit

Bản Portable là bản nén dạng zip; chỉ cần giải nén vào một thư mục và chạy tệp heidisql.exe. Bản cài đặt tự động sẽ thêm biểu tượng HeidiSQL trên màn hình nền.

## Làm việc với HeidiSQL
Nháy đúp chuột vào biểu tượng HeidiSQL trên màn hình nền để khởi động hoặc nháy đúp trực tiếp tệp heidisql.exe. Giao diện ban đầu như Hình 17.4.

### Hình 17.4. Giao diện đầu tiên của HeidiSQL
![Giao diện đầu tiên của HeidiSQL](Hinh_17_4.png)

Các ô Kiểu mạng Library được đặt các giá trị mặc định để kết nối với các hệ QTCSDL MySQL hay MariaDB. Tên máy chủ IP và các ô kiểm đi kèm được đặt giá trị mặc định vì MySQL và HeidiSQL được cài đặt trên cùng một máy. Người dùng (tên dùng CSDL): hãy nhập root.

## Bài tập và câu hỏi
1. Truy cập trang web nào để tải về phần mềm HeidiSQL?
2. Nêu các bước cần thực hiện để cài đặt bản Portable của HeidiSQL.
3. Giải thích ý nghĩa của các ô Kiểu mạng và Library trong giao diện HeidiSQL.

## Hình ảnh mô tả
- Hình 17.4: Giao diện đầu tiên của HeidiSQL, cho thấy các tùy chọn kết nối và cấu hình cơ bản.

## Bảng biểu
| Tên phiên | Địa chỉ IP | Kiểu mạng | Thông tin thêm |
|-----------|------------|-----------|-----------------|
| Unnamed   | 127.0.0.1  | MariaDB or MySQL (TCP/IP) | -              |

### Ghi chú về hình ảnh
Hình 17.4 mô tả giao diện đầu tiên của phần mềm HeidiSQL, nơi người dùng có thể nhập thông tin kết nối đến cơ sở dữ liệu.



# Bài học: Sử dụng HeidiSQL để quản lý cơ sở dữ liệu

## Nội dung lý thuyết
HeidiSQL là một công cụ quản lý cơ sở dữ liệu mã nguồn mở, cho phép người dùng dễ dàng tương tác với các hệ quản trị cơ sở dữ liệu như MySQL, MariaDB, PostgreSQL, và SQL Server. Sau khi cài đặt và đăng nhập thành công, người dùng có thể thực hiện các thao tác như tạo lập cơ sở dữ liệu, tạo bảng dữ liệu, cập nhật và truy xuất dữ liệu.

### Đăng nhập vào HeidiSQL
- **Mật khẩu**: Nhập mật khẩu của người dùng root.
- **Cổng**: Sử dụng giá trị mặc định là cổng giao tiếp dành cho các hệ QTCSDL.
- Sau khi nhập tên người dùng và mật khẩu, hãy chọn "Mở" để vào cửa sổ làm việc.

## Ví dụ minh họa
Giao diện sau khi đăng nhập thành công của HeidiSQL như Hình 17.5:

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

### Hình ảnh mô tả
- **Hình 17.5**: Giao diện làm việc của HeidiSQL.

## Bài tập và câu hỏi
1. Cần gõ câu truy vấn nào trong cửa sổ lệnh của MySQL để đọc được toàn bộ thông tin bảng nhacsi trong CSDL mymusic?
2. Thực hành cài đặt MySQL và cài đặt HeidiSQL.

## Vận dụng
Truy cập Internet với các cụm từ khóa thích hợp để tìm hiểu thêm thông tin về MySQL và HeidiSQL.

## Ghi chú về hình ảnh
- Hình ảnh mô tả giao diện làm việc của HeidiSQL sau khi đăng nhập thành công.

## Bảng biểu
- Không có bảng biểu trong nội dung này.

----

Lưu ý: Nội dung trên được trích xuất từ sách giáo khoa Tin học của Việt Nam và có thể không đầy đủ hoặc chính xác hoàn toàn.
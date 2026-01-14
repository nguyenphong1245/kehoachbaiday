# BÀI 21: THỰC HÀNH CẬP NHẬT VÀ TRUY XUẤT DỮ LIỆU CÁC BẢNG

## SAU BÀI HỌC NÀY EM SẼ:
- Biết cách cập nhật và truy xuất CSDL.

Cập nhật và truy xuất dữ liệu là hai công việc chính khi làm việc với một CSDL. HeidiSQL hỗ trợ việc thực hiện các công việc đó như thế nào với những bảng đơn giản, không có khóa ngoài?

### Nhiệm vụ: Cập nhật bảng nhacsi

#### Hướng dẫn:

### 1. THÊM MỚI DỮ LIỆU VÀO BẢNG NHACSI
- Chọn bảng nhacsi; chọn thẻ Dữ liệu; em sẽ thấy bảng dữ liệu có hai trường `idNhacsi` và `tenNhacsi` nhưng chưa có dữ liệu.

```
Tập tin Chỉ định    Tìm kiếm         Truy vấn CSDL
Máy chủ: 127.0.0.1   Cơ sở dữ liệu: mymusic
```

| idNhacsi | tenNhacsi |
|----------|-----------|
| baobac   |           |
| ban-huan |           |
| casi     |           |
| nhacsi   |           |

**Hình 21.1. Giao diện của thẻ dữ liệu**

Để thêm vào một hàng dữ liệu mới, có thể nhấn phím Insert hoặc chọn biểu tượng thêm hàng. Một hàng rỗng sẽ xuất hiện: Tiếp theo nháy đúp chuột vào từng ô trên hàng đó để nhập dữ liệu tương ứng cho từng trường.

Trường `idNhacsi` có kiểu INT, AUTO_INCREMENT (tự động điền giá trị) nên không cần nhập dữ liệu cho trường này. Nháy đúp chuột vào ô ở cột `tenNhacsi` để nhập tên Nhạc sĩ, nhấn phím Enter, sau đó nhấn phím Insert để nhập hàng mới.

```
Tập tin Chỉnh sửa    Tìm kiếm         Truy vấn CSDL
```

| Tên bảng: nhacsi | Kích thước | Sắp xếp |
|------------------|-------------|---------|
| mymusic          | 112 KiB     |         |
| nhacsi           | 16 KiB      |         |

**Hình 21.2. Giao diện thêm mới dữ liệu**



# Tập tin Chỉnh sửa

## 1. Nhập Dữ Liệu

Hình 21.3. Giao diện kết quả nhập dữ liệu

Tiếp tục thực hành nhập thêm dữ liệu để nắm vững những thao tác nhập dữ liệu:

## 2. CHỈNH SỬA DỮ LIỆU TRONG BẢNG NHACSI

Giả sử dữ liệu nhập có sai sót, cần sửa lại chẳng hạn tên nhạc sĩ Hoàng Việt thiếu dấu tiếng Việt như Hình 21.4.

Hình 21.4. Minh họa dữ liệu có lỗi

Em có thể nháy đúp chuột vào ô dữ liệu cần sửa và nhập lại.

Hình 21.5. Kết quả sửa lỗi

## 3. XOÁ DÒNG DỮ LIỆU TRONG BẢNG NHACSI

Để xoá các dòng dữ liệu trong bảng nhacsi; hãy đánh dấu những dòng muốn chọn: giữ phím Shift và nháy chuột để chọn những dòng liền nhau hoặc nhấn giữ phím Ctrl và nháy chuột để chọn những dòng tách rời nhau.

Hình 21.6. Thao tác đánh dấu dữ liệu

Nhấn tổ hợp phím Ctrl+Delete trên bàn phím hoặc chọn biểu tượng để xoá. Phần mềm sẽ có lời nhắc yêu cầu khẳng định muốn xoá.

Nếu chắc chắn muốn xoá, nháy chuột chọn OK.

Hình 21.7. Thông báo nhắc xác nhận yêu cầu xoá dữ liệu

----

## Bảng Dữ Liệu Nhạc Sĩ

| idNhacsi | tenNhacsi   |
|----------|-------------|
| 1        | Đỗ Nhân     |
| 2        | Văn Cao     |
| 3        | Hoàng Việt  |
| 4        | Nguyễn Tài Tu|
| 5        | Nguyễn Văn Tý|
| 6        | Phan Nhàn   |
| 7        | Phan Huỳnh Điểu|

----

### Hình 21.3
Giao diện kết quả nhập dữ liệu

### Hình 21.4
Minh họa dữ liệu có lỗi

### Hình 21.5
Kết quả sửa lỗi

### Hình 21.6
Thao tác đánh dấu dữ liệu

### Hình 21.7
Thông báo nhắc xác nhận yêu cầu xoá dữ liệu



# XUẤT DỮ LIỆU TỪ BẢNG NHACSI

## 4. TRUY

### a) Truy xuất đơn giản
Để xem toàn bộ dữ liệu trong bảng nhacsi, chỉ cần chọn bảng nhacsi và thẻ Dữ liệu.

```
Unnamed                      {nhacsi}    HediSQL Portable 120.0.
Tạp tin   Chỉnk sửz     Tim kiẽm         Truv vã1   Cảc công cụ Đến Trợ giủp
Mynu:                 Bệ lẹc bin                     Msy chủ; 1270.01
Unnamed                                             Co se dữ licu; nymusic
mymusic           128,0 KIB     Tabls; Mlacsi         Dờlicu      Tuy vấn
J2n1..        48,0 KiB     xếp       Columrs (2/2)       Lọc
Jan-n ,        48 0 KiB     idNhacsi  tenVhacsi
Za51           16,0 KiB                Đc Nhuân
nharsi         16,0 KiB                Vằn Czo
Hoang Việ
NguyẺn Ta Tue
yenVă Tý
Phan Nhên
Phan Fuỳr ĐiÉu
```

**Bọ lcc Regular expression**
```
287       SELECT        FROM fynusic             'nnacsi LIKIT 188e;
```

```
13 ;[1         Cunr         MariaDB   Uplirne;    Selve   Ijle'
```

**Hình 21.8. Giao diện hiển thị dữ liệu trong bảng**

### b) Truy xuất và sắp xếp kết quả theo thứ tự
Nhìn trong danh sách dữ liệu kết xuất; có thể thấy bình thường dữ liệu được kết xuất theo thứ tự tăng dần của trường khoá chính `idNhacsi`. Nếu muốn kết xuất theo thứ tự giảm dần của `idNhacsi`, hãy nháy chuột vào ô `idNhacsi`. Hình tam giác màu đen sẽ xuất hiện và dữ liệu được kết xuất theo thứ tự giảm dần của `idNhacsi`.

```
nhacsi {8r
idNhacsi    tenNhacsi
Truong Quý Hái
Nguvén Đinh ThiCUỘc SỐN G
Quoc Béo
Viet Anh
ThêSong
Bui ĐửcHạnh
vănKỷ
Tran Tien
```

**Hình 21.9. Kết sắp xếp dữ liệu**

### c) Tìm kiếm
Để lấy ra danh sách dữ liệu thoả mãn một yêu cầu nào đó có thể thực hiện các thao tác tạo bộ lọc: Nháy nút phải chuột vào vùng dữ liệu `tenNhacsi`, chọn Quick Filter rồi chẳng hạn chọn LIKE "% . Nhập vào kí tự P.

**Hình 21.10. Bảng chọn đ thiết lập bộ lọc**



# Sách Giáo Khoa - Truy Xuất Dữ Liệu

## Hình 21.11. Thao tác thiết lập bộ lọc

Kết quả thu được như Hình 21.12 là danh sách hai nhạc sĩ và có chữ P trong tên.

```
Unnamed mymusic nhacsi} HeidiSQL Portable 12.0.0.6468
Tảp tin Chỉnh sửa Tim kiến Truy vãn Cảc cèng cu Đến Trợ giúp
KH X
mymus Bộ lọc bẳn Máy chủ: 127.0.0.1 Ca sẻ dữ liêu; mymusic
Unnamed Table: nhacsi Dù lieu Truy vấn
mymusic       128,0 KiB    tcả         Sàp xẽp           Columns (2/2)  Lọc
bannhac       48,0 KiB    Bọ lọc găn đâ; tenNhacsi LIKE Tac bệ lọc nhiều cệt
banth..       48,0 KiB    tenNhacsi LIKE            3P3
casi          16,0 KiB                                   Apply filter     Dọn dẹp
nhacsi        1160 KiB    idNhacsi     tenNhacsi
Phan Nhân
Phan Huynh Điếu

Bạ lọc Regular expression
235     SELECT      FROM     yMusic     nhacs1 Where tenNhacsi LIKE             %PX
SHON ABuF STATUS        IKE     nhacs
r2 : c2      Conne     Maria DB 10 Uptime:       day  Server   Idle
```

## Hình 21.12. Kết quả lọc dữ liệu

Để xoá bộ lọc chọn Dọn dẹp và Lọc.

### Tiếp theo
- Hiện thị tất cả
- Sắp xếp
- Columns (2/2)
- Lọc

Bộ lọc gần đây: `tenNhacsi LIKE '%P%'`

```
tenNhacsi LIKE g6Pg
```

### Apply filter  Dọn dẹp

## Hình 21.13. Xoá bộ lọc đã thiết lập

----

## 5. TRUY XUẤT DỮ LIỆU VỚI CÂU TRUY VẤN SQL

Ngoài việc sử dụng các thao tác qua giao diện trực quan như đã hướng dẫn ở trên; cũng có thể nhập câu truy vấn SQL để truy xuất dữ liệu một cách linh hoạt hơn.

### Cấu trúc cơ bản câu truy vấn vào một bảng dữ liệu như sau:

```
SELECT danh sách các_trường
FROM tên bảng
[WHERE biểu_thức_điều_kiện]
[ORDER BY tên_trường_1 [ASC|DESC], [tên_trường_2 [ASC|DESC], ...]]
```

Trong đó:
- `danh_sách các_trường` liệt kê các tên trường ngăn cách nhau bởi dấu phẩy.
- Nếu muốn lấy tất cả các trường dùng ký tự `*`.
- Tên trường bao gồm tên bảng khi làm việc với nhiều CSDL phải có cả tên CSDL; Ví dụ: `mymusic.bannhac`.



# Biểu thức điều kiện

Biểu thức điều kiện: là biểu thức lôgic xác lập các điều kiện với các giá trị của các trường dữ liệu.

**Ví dụ:**
```sql
tenNhacsi LIKE P% AND (idNhacsi=2 OR idNhacsi=6)
```

Cặp dấu `[ ]` biểu thị nội dung bên trong nó là một lựa chọn có thể dùng hoặc không dùng.

**ASC &#x26; DESC:**
- ASC là viết tắt của Ascending (tăng dần);
- DESC là viết tắt của Descending (giảm dần).

Nghĩa của câu truy vấn trên; với đủ các lựa chọn là: Lấy ra tất cả các dòng dữ liệu, mỗi dòng là giá trị của các trường trong danh sách các trường từ bảng tên bảng ở đó các giá trị thoả mãn biểu thức điều kiện, kết quả truy vấn được sắp xếp theo thứ tự:

```
tên_trường_1 [ASC | DESC]
tên_trường_2 [ASC | DESC]
```

**Ví dụ:**
```sql
SELECT idNhacsi, tenNhacsi
FROM nhacsi
WHERE tenNhacsi LIKE P%
ORDER BY tenNhacsi
```

Mở CSDL `mymusic`; chọn thẻ Truy vấn, nhập câu truy vấn trên và chọn Kết quả nhận được như Hình 21.14.

----

## Hình 21.14
Giaodiện nhập và thực hiện câu truy vấn dữ liệu

----

## LUYỆN TẬP
1. Cập nhật dữ liệu vào bảng casi.
2. Truy xuất dữ liệu bảng casi theo các tiêu chí khác nhau.

## VẬN DỤNG
Thực hành cập nhật và truy xuất dữ liệu bảng Tỉnh/Thành phố trong CSDL quản lý danh sách tên Quận/Huyện; Tỉnh/Thành phố.
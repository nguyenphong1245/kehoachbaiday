# BÀI 23  THỰC HÀNH TRUY XUẤT DỮ LIỆU QUA LIÊN KẾT CÁC BẢNG

## SAU BÀI HỌC NÀY EM SẼ:
- Hiểu được cách thức truy xuất dữ liệu qua liên kết các bảng.
- Các bảng có thể có quan hệ với nhau; thể hiện qua khóa ngoại. Nhờ vậy có thể truy xuất dữ liệu từ các bảng khác theo mối quan hệ. Việc này sẽ được thực hiện cụ thể như thế nào trong giao diện của một hệ QTCSDL?

## Nhiệm vụ 1. Lập danh sách các bản nhạc với tên bản nhạc và tên tác giả
### Hướng dẫn:
Bảng `bannhac` có cấu trúc:
```
bannhac (idBannhac, tenBannhac, idNhacsi, idTheloai)
```
Trong số các trường này không có trường `tenNhacsi`. Làm thế nào lập được danh sách các bản nhạc cùng với tên nhạc sĩ sáng tác bản nhạc ấy? Tên nhạc sĩ nằm trong bảng `nhacsi`, lưu trữ ở trường `tenNhacsi`:
```
nhacsi (idNhacsi, tenNhacsi)
```
Bảng `bannhac` có khóa ngoài là `idNhacsi` tham chiếu đến trường khóa chính `idNhacsi` của bảng `nhacsi`.

Để truy vấn hai bảng qua liên kết khóa, câu truy vấn SQL với mệnh đề `JOIN` có cấu trúc như sau:
```
SELECT danh_sách_tên_trường_của
FROM tên_bảng
bảng INNER JOIN tên_bảng
ON tên_trường_bảng1 = tên_trường_bảng2
[WHERE]
[ORDER BY];
```
### Ví dụ:
Để lấy ra danh sách các bản nhạc gồm `tenBannhac`, `tenNhacsi`, dùng câu truy vấn:
```sql
SELECT bannhac.tenBannhac, nhacsi.tenNhacsi
FROM bannhac INNER JOIN nhacsi
ON bannhac.idNhacsi = nhacsi.idNhacsi;
```
Vào HeidiSQL, chọn CSDL `mymusic`, chọn thẻ Truy vấn và nhập vào câu truy vấn trên. Nhấn F9 trên bàn phím hoặc nháy chuột vào biểu tượng hoặc nháy nút phải chuột, chọn Chạy.



# Sách Giáo Khoa - Truy Vấn Dữ Liệu

## Hình 23.1. Kết quả truy vấn liên kết hai bảng theo trường khoá

Nếu muốn ở dữ liệu kết xuất có cả trường `idNhacsi` của bảng `nhacsi` nhằm có thể đối chiếu một cách tường minh cũng không khó, chỉ cần đổi tên hai trường (cùng tên) ở hai bảng để phân biệt.

```sql
SELECT tenBannhac,
bannhac.idNhacsi AS idNS_BN,
nhacsi.idNhacsi AS idNS_NS,
nhacsi.tenNhacsi
FROM bannhac
INNER JOIN nhacsi
ON bannhac.idNhacsi = nhacsi.idNhacsi;
```

## Hình 23.2. Kết quả truy vấn liên kết hai bảng với khoá đối chiếu

Lưu ý: HeidiSQL có hỗ trợ người dùng khi nhập các câu truy vấn theo các phương thức:
- Dùng màu sắc để trợ giúp quan sát cú pháp của câu truy vấn (syntax coloring).
- Mỗi khi người dùng nhập một tên bảng và dấu chấm (.) HeidiSQL sẽ hiển thị ngay danh sách các tên trường của bảng để người dùng lựa chọn.



# HeidiSQL Portable 12.0.5.6468

## Tạp tin
- Chỉnh sủa
- Tìm kiếm
- Truy vãn
- Các công cụ
- Đến
- Trụ giúp

### Kết nối
- Bệ Icc bang
- Máy chủ: 127.0.0.1
- Cơ sở dữ liệu: mymusic
- Table: nhacsi
- Dữ liệu: Truy vấn

| Tên bảng | Kích thước |
|----------|-------------|
| mymusic  | 96,0 KiB    |
| bannh..  | 48,0 KiB    |
| nhacsi   | 16,0 KiB    |
| theloai  | 32,0 KiB    |

### Kết quả
| idBannhac | tenBannhac | idNhacsi | idTheloai |
|-----------|-------------|----------|-----------|
|           |             |          |           |

### Nhắc nhở
- Bệ lcc Regular exprll
- Affecred Tows
- Fcuno roWs
- Warnings: Duration for query: 0,880 sec

### Hình 23.3
Một giao diện hỗ trợ người dùng của HeidiSQL

## Hãy thực hành
1. Lập danh sách bao gồm `idBannhac`, `tenBannhac`, `tenNhacsi` từ tất cả các bản nhạc có trong bảng `bannhac`.
2. Lập danh sách bao gồm `idBannhac`, `tenBannhac` từ tất cả các bản nhạc của nhạc sĩ Đỗ Nhuận có trong bảng `bannhac`.
3. Nhiệm vụ 2: Lập danh sách các bản thu âm với đủ các `tenBannhac`, `tenCasi`.

### Hướng dẫn
Để truy vấn được nhiều hơn hai bảng theo liên kết khóa ngoài, hãy lặp lại mệnh đề `JOIN` trong câu truy vấn SQL theo cấu trúc như sau:

```sql
SELECT danh sách_tên_trường_của bảng
FROM tên bảng a
INNER JOIN tên bảng b
ON tên bảng a.tên_trường = tên bảng b.tên_trường
INNER JOIN tên bảng c
ON tên bảng b.tên_trường = tên bảng c.tên_trường
[WHERE
[ORDER BY                   ] ;
```

Trong đó `tên bảng a.tên_trường` là tên trường của bảng a hay bảng b.

## Nhiệm vụ 3
Tìm hiểu một chức năng của ứng dụng Quản lý dữ liệu âm nhạc. Qua giao diện trong Hình 23.4, em hãy tìm hiểu một chức năng của ứng dụng Quản lý dữ liệu âm nhạc, so sánh với những kiến thức vừa được học và cho nhận xét so sánh.



# MYMUSIC MANAGER
Nhạc s Ca sĩ Bản nhạc Bả- thJán Logout

## QUẢN LÝ DANH SÁCH CÁC BẢN THU ÂM
- **Danh sách nhạc:**
- Chor
- Chgr:

### Danh sách có:
- Bản thu &#x26; đĩa CD
- Benras
- 2kich
- kich
- Irubrg
- Trường ca Sang L8, Ta Cao
- Knei
- 12Jue
- Kag
- vCt Njm qu2 huong tò
- #iừa 36
- khci Ygce 72Ju
- Tiến
- Nci Van Cao

## QUẢN LÝ DANH SÁCH CÁC BẢN THU ÂM
- **Bản nhạc:**
- Cjy Dan Sultar
- 7u"5
- 23 { quan
- SCn
- 7ah-
- Ski
- Tran
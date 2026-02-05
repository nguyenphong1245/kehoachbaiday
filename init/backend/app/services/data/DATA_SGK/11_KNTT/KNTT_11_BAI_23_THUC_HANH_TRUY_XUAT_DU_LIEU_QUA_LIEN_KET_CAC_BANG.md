# BÀI 23  THỰC HÀNH TRUY XUẤT DỮ LIỆU QUA LIÊN KẾT CÁC BẢNG

## SAU BÀI HỌC NÀY EM SẼ:
Hiểu được cách thức truy xuất dữ liệu qua liên kết các bảng.

Các bảng có thể có quan hệ với nhau; thể hiện qua khóa ngoài. Nhờ vậy có thể truy xuất dữ liệu từ các bảng khác theo mối quan hệ. Việc này sẽ được thực hiện cụ thể như thế nào trong giao diện của một hệ QTCSDL?

### Nhiệm vụ 1: Lập danh sách các bản nhạc với tên bản nhạc và tên tác giả
#### Hướng dẫn:
Bảng `bannhac` có cấu trúc:
```
bannhac (idBannhac, tenBannhac, idNhacsi, idTheloai)
```
Trong số các trường này không có trường `tenNhacsi`. Làm thế nào lập được danh sách các bản nhạc cùng với tên nhạc sĩ sáng tác bản nhạc ấy? Tên nhạc sĩ nằm trong bảng `nhacsi`, lưu trữ ở trường `tenNhacsi`:
```
nhacsi (idNhacsi, tenNhacsi)
```
Bảng `bannhac` có khóa ngoài là `idNhacsi` tham chiếu đến trường khóa chính `idNhacsi` của bảng `nhacsi`.

Để truy vấn hai bảng qua liên kết khóa, câu truy vấn SQL với mệnh đề JOIN có cấu trúc như sau:
```
SELECT danh_sách_tên_trường_của bảng_a, tên_trường_b
FROM tên_bảng_a
INNER JOIN tên_bảng_b
ON tên_bảng_a.tên_trường_khóa = tên_bảng_b.tên_trường_khóa
[WHERE điều_kiện]
[ORDER BY trường];
```

#### Ví dụ:
Để lấy ra danh sách các bản nhạc gồm `tenBannhac` và `tenNhacsi`, dùng câu truy vấn:
```sql
SELECT bannhac.tenBannhac, nhacsi.tenNhacsi
FROM bannhac INNER JOIN nhacsi
ON bannhac.idNhacsi = nhacsi.idNhacsi;
```
Vào HeidiSQL, chọn CSDL `mymusic`, chọn thẻ Truy vấn và nhập vào câu truy vấn trên. Nhấn F9 trên bàn phím hoặc nháy chuột vào biểu tượng hoặc nháy nút phải chuột, chọn Chạy.



Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các câu hỏi hoặc thông tin liên quan đến Tin học. Bạn cần hỗ trợ gì?



# Bài học: Quản lý dữ liệu âm nhạc với HeidiSQL

## Nội dung lý thuyết
HeidiSQL là một công cụ quản lý cơ sở dữ liệu mạnh mẽ, cho phép người dùng thực hiện các truy vấn SQL, quản lý bảng, và thao tác với dữ liệu một cách dễ dàng. Trong bài học này, chúng ta sẽ tìm hiểu cách sử dụng HeidiSQL để quản lý dữ liệu âm nhạc, bao gồm việc truy vấn thông tin từ các bảng khác nhau.

## Ví dụ minh họa
Giả sử chúng ta có một cơ sở dữ liệu âm nhạc với các bảng như `bannhac` và `nhacsi`. Dưới đây là một ví dụ về cách truy vấn thông tin từ bảng `bannhac`:

```sql
SELECT idBannhac, tenBannhac FROM bannhac;
```

Kết quả của truy vấn này sẽ trả về danh sách tất cả các bản nhạc trong bảng `bannhac`.

## Bài tập và câu hỏi
1. **Nhiệm vụ 1**: Lập danh sách bao gồm `idBannhac`, `tenBannhac`, `tenNhacsi` từ tất cả các bản nhạc có trong bảng `bannhac`.
2. **Nhiệm vụ 2**: Lập danh sách bao gồm `idBannhac`, `tenBannhac` từ tất cả các bản nhạc của nhạc sĩ Đỗ Nhuận có trong bảng `bannhac`.
3. **Nhiệm vụ 3**: Tìm hiểu một chức năng của ứng dụng Quản lý dữ liệu âm nhạc. Qua giao diện trong Hình 23.4, hãy tìm hiểu một chức năng của ứng dụng, so sánh với những kiến thức vừa được học và cho nhận xét so sánh.

## Hình ảnh mô tả
- **Hình 23.3**: Một giao diện hỗ trợ người dùng của HeidiSQL.

## Bảng biểu
| Tên trường     | Kiểu dữ liệu |
|----------------|--------------|
| idBannhac      | int          |
| tenBannhac     | varchar      |
| idNhacsi       | int          |
| tenNhacsi      | varchar      |
| idTheloai      | int          |

## Hướng dẫn
Để truy vấn được nhiều hơn hai bảng theo liên kết khóa ngoài, hãy lặp lại mệnh đề JOIN trong câu truy vấn SQL theo cấu trúc như sau:

```sql
SELECT danh sách_tên_trường_của bảng
FROM tên_bảng_a
INNER JOIN tên_bảng_b ON tên_bảng_a.tên_trường_a = tên_bảng_b.tên_trường_b
INNER JOIN tên_bảng_c ON tên_bảng_a.tên_trường_c = tên_bảng_c.tên_trường_c
[WHERE ...]
[ORDER BY ...];
```

Trong đó, `tên_bảng_a.tên_trường_a` là tên trường của bảng a hay bảng b.



# MYMUSIC MANAGER

## Tiêu đề bài học
Quản lý danh sách các bản thu âm

## Nội dung lý thuyết
Giao diện Quản lý danh sách các bản thu âm cho phép người dùng quản lý các bản thu âm trong cơ sở dữ liệu. Người dùng có thể nhập thông tin về bản nhạc, ca sĩ và nhạc sĩ từ các hộp danh sách đã được định nghĩa sẵn. Cơ sở dữ liệu chứa đầy đủ các thông tin tường minh như tên bản nhạc, tên nhạc sĩ và tên ca sĩ thể hiện.

## Ví dụ minh họa
Hình 23.4. Mô tả giao diện Quản lý danh sách các bản thu âm. Cách tương tác với giao diện này tương tự như với giao diện Quản lý Bản nhạc ở Bài 22 (Hình 22.7), chỉ khác ở chỗ khi nhập bản thu âm, chỉ có thể chọn tên bản nhạc và tên ca sĩ từ hộp danh sách với những tên đã có trong CSDL.

## Bài tập và câu hỏi
1. Lấy danh sách các bản thu âm với đầy đủ các thông tin: idBanthuam, tenBannhac, tenTheloai, tenNhacsi, tenCasi.
2. Lấy danh sách các bản thu âm với các thông tin: idBanthuam, tenBannhac, tenTheloai, tenCasi của các bản nhạc của nhạc sĩ Văn Cao.
3. Lấy danh sách các bản thu âm với các thông tin: idBanthuam, tenBannhac, tenTacgia, tenTheloai của các bản nhạc do ca sĩ Lê Dung thể hiện.
4. Lấy danh sách các bản thu âm với các thông tin: idBanthuam, tenBannhac, Tacgia, tenCasi của các bản nhạc do ca sĩ Lê Dung thể hiện thuộc thể loại Nhạc trữ tình.

## Hình ảnh mô tả
Hình 23.4. Mô tả giao diện Quản lý danh sách các bản thu âm.

## Bảng biểu
- Danh sách các bản thu âm:
- idBanthuam
- tenBannhac
- tenTheloai
- tenNhacsi
- tenCasi

## Ghi chú
Người sử dụng có cần biết, nhớ cấu trúc của CSDL không? Giao diện trên có dễ hiểu, dễ sử dụng không? Hình thức nhập dữ liệu như vậy có hỗ trợ tính nhất quán dữ liệu không?
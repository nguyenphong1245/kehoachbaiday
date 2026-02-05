# BÀI 79  THỰC HÀNH TẠO LẬP CƠ SỞ DỮ LIỆU VÀ CÁC BẢNG

## SAU BÀI HỌC NÀY EM SẼ:
- Biết tạo mới mật CSDL; thực hiện thông qua giao diện của phần mềm khách quản trị CSDL HeidiSQL.
- Tạo được các bảng không có khoá ngoài, chỉ định được khoá chính cho mỗi bảng, khoá cấm trùng lặp cho những trường không được có giá trị trùng lặp.

## Nội dung lý thuyết
Việc đầu tiên để làm việc với một CSDL là tạo lập; Với HeidiSQL, việc tạo lập bảng đơn giản được thực hiện như thế nào?

## Nhiệm vụ
Tạo lập CSDL mới tên là mymusic, khởi tạo bảng nhacsi, khai báo các khoá cho các bảng này như thiết kế ở Bài 18.

## Hướng dẫn:
### 1. TẠO LẬP CSDL MYMUSIC
- Nháy nút chuột ở vùng danh sách các CSDL đã có, chọn thẻ Tạo mới, chọn Cơ sở dữ liệu.
- Nhập mymusic, chọn OK.
- Bộ mã kí tự mặc định là Unicode byte: utf8mb4, đối chiếu so sánh xâu theo utf8mb4_general_ci.
- Vùng mã lệnh phía dưới sẽ thấy xuất hiện câu truy vấn SQL tương ứng:

```
CREATE DATABASE mymusic
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;
```

**Hình 19.1. Tạo lập CSDL mymusic**

### 2. TẠO LẬP BẢNG
#### a) Khai báo tạo lập bảng; các trường và kiểu dữ liệu
- Tạo lập bảng nhacsi (idNhacsi, tenNhacsi), idNhacsi kiểu INT, tenNhacsi kiểu VARCHAR(255).
- Nháy nút phải chuột ở vùng danh sách các CSDL đã có, chọn thẻ Tạo mới, chọn Bảng.
- Nhập tên: nhacsi; chọn Thêm mới để thêm trường: Một trường với tên mặc định Column1 sẽ xuất hiện phía dưới.

## Ví dụ minh họa
- Ví dụ về câu lệnh SQL để tạo bảng nhacsi:
```sql
CREATE TABLE nhacsi (
idNhacsi INT PRIMARY KEY,
tenNhacsi VARCHAR(255) NOT NULL
);
```

## Bài tập và câu hỏi
1. Hãy tạo một cơ sở dữ liệu mới với tên khác và tạo một bảng với ít nhất 3 trường dữ liệu.
2. Giải thích ý nghĩa của các kiểu dữ liệu đã sử dụng trong bảng nhacsi.

## Hình ảnh mô tả
- Hình 19.1: Giao diện tạo lập CSDL mymusic trong phần mềm HeidiSQL.

## Bảng biểu
| Tên trường  | Kiểu dữ liệu | Khóa chính | Khóa cấm trùng lặp |
|-------------|--------------|------------|---------------------|
| idNhacsi    | INT          | Có         | Không               |
| tenNhacsi   | VARCHAR(255) | Không      | Có                  |




Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các câu hỏi hoặc thông tin khác liên quan đến Tin học. Bạn cần hỗ trợ gì thêm không?



# Bài học: Khai báo trường và khoá chính trong cơ sở dữ liệu

## Nội dung lý thuyết
Trong cơ sở dữ liệu, việc khai báo trường và khoá chính là rất quan trọng để đảm bảo tính toàn vẹn và duy nhất của dữ liệu. Khoá chính (Primary Key) là một trường hoặc tập hợp các trường trong bảng mà giá trị của nó là duy nhất cho mỗi bản ghi. Điều này giúp xác định một cách chính xác từng bản ghi trong bảng.

### 1. Khai báo trường kiểu VARCHAR
Trường kiểu VARCHAR được sử dụng để lưu trữ chuỗi ký tự có độ dài biến đổi. Độ dài tối đa của trường VARCHAR có thể lên đến 65,535 ký tự, nhưng kích thước thực tế sẽ phụ thuộc vào độ dài của chuỗi được lưu trữ.

**Hình 19.5. Khai báo trường kiểu VARCHAR**

### 2. Khai báo khoá chính
Để khai báo một trường là khoá chính, bạn cần nháy chuột phải vào dòng khai báo trường đó và chọn "Create new index > PRIMARY". Điều này sẽ đảm bảo rằng trường đó sẽ không chứa giá trị NULL và mỗi giá trị phải là duy nhất.

**Hình 19.6. Bảng chọn để khai báo khoá chính**

### 3. Xử lý trường hợp chọn nhầm khoá chính
Nếu bạn chọn nhầm trường làm khoá chính, bạn có thể dễ dàng thay đổi bằng cách chọn trường khác và thực hiện lại các bước khai báo khoá chính.

**Hình 19.7. Minh hoạ khai báo nhầm khoá chính**

## Ví dụ minh hoạ
Giả sử bạn có một bảng lưu trữ thông tin về nhạc sĩ với các trường như sau:
- `idNhacsi` (INT, khoá chính, AUTO_INCREMENT)
- `tenNhacsi` (VARCHAR(255))

Khi khai báo bảng, bạn sẽ thực hiện như sau:
```sql
CREATE TABLE mymusic (
idNhacsi INT AUTO_INCREMENT,
tenNhacsi VARCHAR(255),
PRIMARY KEY (idNhacsi)
);
```

## Bài tập và câu hỏi
1. Giải thích vai trò của khoá chính trong một bảng cơ sở dữ liệu.
2. Tại sao lại cần sử dụng kiểu dữ liệu VARCHAR cho trường `tenNhacsi`?
3. Hãy viết câu lệnh SQL để tạo một bảng mới với ít nhất 3 trường, trong đó có một khoá chính.

## Hình ảnh mô tả
- **Hình 19.5**: Khai báo trường kiểu VARCHAR.
- **Hình 19.6**: Bảng chọn để khai báo khoá chính.
- **Hình 19.7**: Minh hoạ khai báo nhầm khoá chính.

## Bảng biểu
| Tên trường   | Kiểu dữ liệu | Ghi chú                |
|--------------|--------------|------------------------|
| idNhacsi     | INT          | Khoá chính, AUTO_INCREMENT |
| tenNhacsi    | VARCHAR(255) | Tên nhạc sĩ            |




# Bài học: Sửa khoá chính trong cơ sở dữ liệu

## Nội dung lý thuyết
Để sửa khoá chính đã khai báo nhầm trong cơ sở dữ liệu, bạn cần thực hiện các bước sau:

1. Nháy đúp chuột vào ô tên bảng cần sửa.
2. Ở phần trên, chọn lại khoá chính (PRIMARY KEY).
3. Nháy chuột vào ô bên cạnh dưới ô PRIMARY để thực hiện chỉnh sửa.

## Ví dụ minh họa
(Hình 19.8): Thao tác sửa khoá chính

![Hình 19.8. Thao tác sửa khoá chính](link_to_image)

Sau đó, nháy chuột vào ô bên cạnh dưới ô PRIMARY (Hình 19.9).

(Hình 19.9): Kết quả chỉnh sửa khoá chính

![Hình 19.9. Kết quả chỉnh sửa khoá chính](link_to_image)

## Bài tập và câu hỏi
1. Khai báo tạo lập bảng như thiết kế ở Bài 18.
2. Hãy lập CSDL quản lí tên các Quận/Huyện, Tỉnh/Thành phố của Việt Nam. Tạo bảng Tỉnh/Thành phố.

## Hình ảnh mô tả
- Hình 19.8: Thao tác sửa khoá chính.
- Hình 19.9: Kết quả chỉnh sửa khoá chính.
- Hình 19.10: Kết quả tạo lập bảng.

![Hình 19.10. Kết quả tạo lập bảng](link_to_image)

## Bảng biểu
| Tên trường   | Kiểu dữ liệu  |
|--------------|----------------|
| idNhacsi     | VARCHAR        |
| tenNhacsi    | VARCHAR        |
| ...          | ...            |

## Lưu ý
Cuối cùng, chọn "Lưu" để lưu lại khai báo bảng nhacsi. Vùng hiển thị phía trái sẽ xuất hiện tên bảng nhacsi dưới dòng tên CSDL mymusic.
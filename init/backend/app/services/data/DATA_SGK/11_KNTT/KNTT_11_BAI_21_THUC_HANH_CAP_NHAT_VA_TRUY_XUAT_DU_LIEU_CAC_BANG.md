# BÀI 21  THỰC HÀNH CẬP NHẬT VÀ TRUY XUẤT DỮ LIỆU CÁC BẢNG

## SAU BÀI HỌC NÀY EM SẼ:
Biết cách cập nhật và truy xuất CSDL.

Cập nhật và truy xuất dữ liệu là hai công việc chính khi làm việc với một CSDL. HeidiSQL hỗ trợ việc thực hiện các công việc đó như thế nào với những bảng đơn giản, không có khóa ngoài?

### Nhiệm vụ: Cập nhật bảng nhạc sĩ

### Hướng dẫn:

#### 1. THÊM MỚI DỮ LIỆU VÀO BẢNG NHACSI
Chọn bảng nhạc sĩ; chọn thẻ Dữ liệu; em sẽ thấy bảng dữ liệu có hai trường `idNhacsi` và `tenNhacsi` nhưng chưa có dữ liệu.

![Hình 21.1. Giao diện của thẻ dữ liệu](Hình_21.1.png)

Để thêm vào một hàng dữ liệu mới, em có thể nhấn phím Insert hoặc chọn biểu tượng thêm hàng. Một hàng rỗng sẽ xuất hiện: Tiếp theo nháy đúp chuột vào từng ô trên hàng đó để nhập dữ liệu tương ứng cho từng trường.

Trường `idNhacsi` có kiểu INT, AUTO_INCREMENT (tự động điền giá trị) nên không cần nhập dữ liệu cho trường này. Nháy đúp chuột vào ô ở cột `tenNhacsi` để nhập tên Nhạc sĩ, nhấn phím Enter, sau đó nhấn phím Insert để nhập hàng mới.

![Hình 21.2. Giao diện thêm mới dữ liệu](Hình_21.2.png)

### Bài tập và câu hỏi:
1. Hãy mô tả quy trình thêm mới một bản ghi vào bảng nhạc sĩ.
2. Giải thích ý nghĩa của trường `idNhacsi` trong bảng nhạc sĩ.
3. Thực hiện thêm ít nhất 3 bản ghi mới vào bảng nhạc sĩ và trình bày kết quả.

### Hình ảnh mô tả:
- Hình 21.1: Giao diện của thẻ dữ liệu.
- Hình 21.2: Giao diện thêm mới dữ liệu.

### Bảng biểu:
| idNhacsi | tenNhacsi |
|----------|------------|
| 1        | Trịnh Công Sơn |
| 2        | Văn Cao     |
| 3        | Phạm Duy    |




# Bài học: Chỉnh sửa và quản lý dữ liệu trong bảng nhạc sĩ

## Nội dung lý thuyết

Trong quá trình làm việc với cơ sở dữ liệu, việc nhập, chỉnh sửa và xóa dữ liệu là những thao tác cơ bản và cần thiết. Bài học này sẽ hướng dẫn bạn cách thực hiện các thao tác này trong bảng nhạc sĩ.

### 1. Nhập dữ liệu vào bảng nhạc sĩ
Để nhập dữ liệu vào bảng nhạc sĩ, bạn cần mở giao diện nhập dữ liệu và thực hiện các bước sau:

- Nhập thông tin nhạc sĩ vào các ô tương ứng.
- Kiểm tra lại thông tin đã nhập để đảm bảo không có sai sót.

**Hình 21.3. Giao diện kết quả nhập dữ liệu**

### 2. Chỉnh sửa dữ liệu trong bảng nhạc sĩ
Nếu dữ liệu đã nhập có sai sót, bạn có thể chỉnh sửa bằng cách:

- Nháy đúp chuột vào ô dữ liệu cần sửa.
- Nhập lại thông tin chính xác.

**Hình 21.4. Minh họa dữ liệu có lỗi**

### 3. Xóa dòng dữ liệu trong bảng nhạc sĩ
Để xóa các dòng dữ liệu trong bảng nhạc sĩ, bạn thực hiện như sau:

- Đánh dấu những dòng muốn chọn: giữ phím Shift và nháy chuột để chọn những dòng liền nhau hoặc nhấn giữ phím Ctrl và nháy chuột để chọn những dòng tách rời nhau.
- Nhấn tổ hợp phím Ctrl+Delete trên bàn phím hoặc chọn biểu tượng để xóa.
- Phần mềm sẽ có lời nhắc yêu cầu xác nhận việc xóa.

**Hình 21.6. Thao tác đánh dấu dữ liệu**

## Ví dụ minh họa
Giả sử bạn đã nhập thông tin nhạc sĩ Hoàng Việt nhưng thiếu dấu tiếng Việt. Bạn cần chỉnh sửa lại tên nhạc sĩ này để đảm bảo thông tin chính xác.

**Hình 21.5. Kết quả sửa lỗi**

## Bài tập và câu hỏi
1. Hãy nhập thông tin của ít nhất 5 nhạc sĩ vào bảng nhạc sĩ.
2. Chỉnh sửa thông tin của một nhạc sĩ mà bạn đã nhập.
3. Xóa thông tin của một nhạc sĩ trong bảng.

## Hình ảnh mô tả
- **Hình 21.3**: Giao diện kết quả nhập dữ liệu.
- **Hình 21.4**: Minh họa dữ liệu có lỗi.
- **Hình 21.5**: Kết quả sửa lỗi.
- **Hình 21.6**: Thao tác đánh dấu dữ liệu.
- **Hình 21.7**: Thông báo nhắc xác nhận yêu cầu xóa dữ liệu.

## Bảng biểu
| idNhacsi | tenNhacsi     |
|----------|----------------|
| 1        | Hoàng Việt     |
| 2        | Nguyễn Tài Tuệ |
| 3        | Nguyễn Văn Tý  |
| 4        | Phan Nhàn     |
| 5        | Phan Huỳnh Điểu|

Hãy thực hành các thao tác trên để nắm vững cách quản lý dữ liệu trong cơ sở dữ liệu.



# XUẤT DỮ LIỆU TỪ BẢNG NHACSI

## 4. TRUY XUẤT DỮ LIỆU

### a) Truy xuất đơn giản
Để xem toàn bộ dữ liệu trong bảng nhacsi, chỉ cần chọn bảng nhacsi và thẻ Dữ liệu.

**Hình 21.8. Giao diện hiển thị dữ liệu trong bảng**

### b) Truy xuất và sắp xếp kết quả theo thứ tự
Nhìn trong danh sách dữ liệu kết xuất, có thể thấy bình thường dữ liệu được kết xuất theo thứ tự tăng dần của trường khoá chính idNhacsi. Nếu muốn kết xuất theo thứ tự giảm dần của idNhacsi, hãy nháy chuột vào ô idNhacsi. Hình tam giác màu đen sẽ xuất hiện và dữ liệu được kết xuất theo thứ tự giảm dần của idNhacsi.

**Hình 21.9. Kết sắp xếp dữ liệu**

### c) Tìm kiếm
Để lấy ra danh sách dữ liệu thoả mãn một yêu cầu nào đó, có thể thực hiện các thao tác tạo bộ lọc: Nháy nút phải chuột vào vùng dữ liệu tenNhacsi, chọn Quick Filter rồi chẳng hạn chọn LIKE "%". Nhập vào ký tự cần tìm.

**Hình 21.10. Bảng chọn để thiết lập bộ lọc**

----

### Bài tập và câu hỏi
1. Hãy mô tả cách thực hiện truy xuất dữ liệu từ bảng nhacsi.
2. Làm thế nào để sắp xếp dữ liệu theo thứ tự giảm dần của trường idNhacsi?
3. Giải thích cách sử dụng bộ lọc để tìm kiếm dữ liệu trong bảng nhacsi.



# Bài học: Truy xuất dữ liệu với câu truy vấn SQL

## Nội dung lý thuyết
Trong phần này, chúng ta sẽ tìm hiểu về cách truy xuất dữ liệu từ cơ sở dữ liệu bằng cách sử dụng câu truy vấn SQL. SQL (Structured Query Language) là ngôn ngữ tiêu chuẩn để quản lý và thao tác với cơ sở dữ liệu.

Câu truy vấn SQL cho phép người dùng lấy dữ liệu từ một hoặc nhiều bảng trong cơ sở dữ liệu một cách linh hoạt. Cấu trúc cơ bản của một câu truy vấn SQL như sau:

```
SELECT danh sách các_trường
FROM tên bảng
[WHERE biểu_thức_điều_kiện]
[ORDER BY tên_trường_1 [ASC|DESC], [tên_trường_2 [ASC|DESC], ...]]
```

### Giải thích các thành phần:
- **danh sách các_trường**: Liệt kê các tên trường mà bạn muốn lấy dữ liệu, ngăn cách nhau bởi dấu phẩy. Nếu muốn lấy tất cả các trường, bạn có thể sử dụng ký tự `*`.
- **tên bảng**: Tên của bảng mà bạn muốn truy xuất dữ liệu.
- **WHERE**: Điều kiện để lọc dữ liệu. Nếu không có điều kiện này, tất cả dữ liệu trong bảng sẽ được lấy.
- **ORDER BY**: Sắp xếp kết quả theo một hoặc nhiều trường, có thể sắp xếp theo thứ tự tăng dần (ASC) hoặc giảm dần (DESC).

## Ví dụ minh họa
Giả sử bạn có một bảng tên là `nhacsi` trong cơ sở dữ liệu `mymusic`, bạn muốn lấy tất cả các nhạc sĩ có tên chứa chữ "P". Câu truy vấn SQL sẽ như sau:

```sql
SELECT *
FROM mymusic.nhacsi
WHERE tenNhacsi LIKE '%P%'
```

Kết quả thu được sẽ là danh sách các nhạc sĩ có chữ "P" trong tên.

## Bài tập và câu hỏi
1. Viết câu truy vấn SQL để lấy tất cả các nhạc sĩ trong bảng `nhacsi`.
2. Sử dụng câu truy vấn để tìm các nhạc sĩ có tên bắt đầu bằng chữ "H".
3. Viết câu truy vấn để sắp xếp danh sách nhạc sĩ theo tên theo thứ tự giảm dần.

## Hình ảnh mô tả
- **Hình 21.11**: Thao tác thiết lập bộ lọc.
- **Hình 21.12**: Kết quả lọc dữ liệu.
- **Hình 21.13**: Xoá bộ lọc đã thiết lập.

## Bảng biểu
| Tên trường   | Kiểu dữ liệu | Mô tả                     |
|--------------|--------------|---------------------------|
| idNhacsi     | INT          | ID của nhạc sĩ            |
| tenNhacsi    | VARCHAR      | Tên của nhạc sĩ           |

----

Lưu ý: Các hình ảnh và bảng biểu được mô tả trong nội dung bài học có thể không được hiển thị ở đây, nhưng chúng có vai trò quan trọng trong việc minh họa cho các thao tác và kết quả truy vấn.



# Bài học: Biểu thức điều kiện trong SQL

## Nội dung lý thuyết
Biểu thức điều kiện là biểu thức lôgic xác lập các điều kiện với các giá trị của các trường dữ liệu.

### Ví dụ:
```sql
tenNhacsi LIKE 'P%' AND (idNhacsi=2 OR idNhacsi=6)
```

Cặp dấu `[ ]` biểu thị nội dung bên trong nó là một lựa chọn có thể dùng hoặc không dùng.

`ASC` và `DESC`:
- `ASC` là viết tắt của Ascending (tăng dần);
- `DESC` là viết tắt của Descending (giảm dần).

Nghĩa của câu truy vấn trên; với đủ các lựa chọn là: Lấy ra tất cả các dòng dữ liệu, mỗi dòng là giá trị của các trường trong danh sách các trường từ bảng tên bảng ở đó các giá trị thoả mãn biểu thức điều kiện, kết quả truy vấn được sắp xếp theo thứ tự `tên_trường_1 [ASC | DESC] tên_trường_2 [ASC | DESC]`.

### Ví dụ:
```sql
SELECT idNhacsi, tenNhacsi
FROM nhacsi
WHERE tenNhacsi LIKE 'P%'
ORDER BY tenNhacsi
```

Mở CSDL `mymusic`; chọn thẻ Truy vấn, nhập câu truy vấn trên và chọn Kết quả nhận được như Hình 21.14.

![Hình 21. Giaodiện nhập và thực hiện câu truy vấn dữ liệu](Hình_21.14.png)

## Luyện tập
1. Cập nhật dữ liệu vào bảng `casi`.
2. Truy xuất dữ liệu bảng `casi` theo các tiêu chí khác nhau.

## Vận dụng
Thực hành cập nhật và truy xuất dữ liệu bảng `Tỉnh/Thành phố` trong CSDL quản lý danh sách tên `Quận/Huyện`; `Tỉnh/Thành phố`.
# BÀI 20: THỰC HÀNH TẠO LẬP CÁC BẢNG CÓ KHÓA NGOÀI

## SAU BÀI HỌC NÀY EM SẼ:
- Biết cách tạo mới các bảng có khóa ngoài.

Các em đã biết; khóa ngoài có tác dụng liên kết dữ liệu giữa các bảng: Khi tạo bảng có khóa ngoài, việc thiết lập khóa ngoài được thực hiện như thế nào?

## Nhiệm vụ:
Tạo lập bảng `bannhac` với cấu trúc:
- `bannhac (idBannhac, tenBannhac, idNhacsi)`

Các trường:
- `idBannhac`, `idNhacsi` kiểu INT
- Trường `tenBannhac` kiểu VARCHAR (255).

## Hướng dẫn:
1. **KHAI BÁO BẢNG BANNHAC VỚI CÁC TRƯỜNG IDBANNHAC, TENBANNHAC**
- Chọn thẻ Tạo mới, chọn Bảng. Nhập tên: `bannhac`; chọn Thêm mới để thêm trường dữ liệu; một trường với tên mặc định `Column1` sẽ xuất hiện phía dưới.

![Hình 20.1. Khai báo bảng mới](link_to_image)

## Bảng biểu:
| Tên trường     | Kiểu dữ liệu | Chiều dài | Cho phép NULL | Mặc định |
|----------------|---------------|-----------|---------------|----------|
| idBannhac      | INT           |           | Không         |          |
| tenBannhac     | VARCHAR       | 255       | Có            |          |
| idNhacsi       | INT           |           | Không         |          |

## Bài tập và câu hỏi:
1. Tạo bảng `bannhac` theo cấu trúc đã hướng dẫn.
2. Giải thích vai trò của khóa ngoài trong việc liên kết dữ liệu giữa các bảng.
3. Thực hiện truy vấn để kiểm tra cấu trúc bảng vừa tạo.



# Bài học: Khai báo trường trong cơ sở dữ liệu

## Nội dung lý thuyết
Khi thiết kế cơ sở dữ liệu, việc khai báo các trường là rất quan trọng. Các trường có thể có nhiều kiểu dữ liệu khác nhau, như INT, VARCHAR, và có thể là khóa chính hoặc khóa ngoại.

### 1. Khai báo trường kiểu INT
Để khai báo trường kiểu INT, bạn cần nhập tên trường và chọn kiểu dữ liệu là INT. Bạn cũng có thể thiết lập giá trị mặc định và các thuộc tính khác cho trường.

**Ví dụ minh họa:**
- Nhập tên: `idBannhac`
- Chọn kiểu dữ liệu: `INT`
- Giá trị mặc định: `NULL`

![Hình 20.2 Khai báo trường kiểu INT](#)

### 2. Khai báo trường kiểu VARCHAR
Đối với trường kiểu VARCHAR, bạn cần nhập tên trường, chọn kiểu dữ liệu là VARCHAR, và thiết lập độ dài tối đa cho trường.

**Ví dụ minh họa:**
- Nhập tên: `tenBannhac`
- Chọn kiểu dữ liệu: `VARCHAR`
- Độ dài: `255`
- Giá trị mặc định: `rỗng`

![Hình 20.3 Khai báo trường kiểu VARCHAR](#)

### 3. Khai báo các trường là khóa ngoại
Các trường là khóa ngoại của bảng là các trường tham chiếu đến một trường khóa chính của một bảng khác. Do đó, cần khai báo giá trị mặc định phù hợp với giá trị tương ứng của khóa chính.

**Ví dụ minh họa:**
- Bảng `bannhac` có trường `idNhacsi` tham chiếu đến trường `idNhacsi` của bảng `nhacsi`.
- Kiểu dữ liệu của trường này là `INT` và giá trị mặc định có thể là `0`.

![Hình 20.4 Khai báo trường sẽ là khóa ngoài của bảng](#)

## Bài tập và câu hỏi
1. Hãy khai báo một trường kiểu INT với tên là `idKhachHang` và giá trị mặc định là `1`.
2. Khai báo một trường kiểu VARCHAR với tên là `tenKhachHang`, độ dài 100 và giá trị mặc định là `rỗng`.
3. Giải thích sự khác nhau giữa khóa chính và khóa ngoại trong cơ sở dữ liệu.

## Hình ảnh mô tả
- Hình 20.2: Khai báo trường kiểu INT
- Hình 20.3: Khai báo trường kiểu VARCHAR
- Hình 20.4: Khai báo trường sẽ là khóa ngoài của bảng

## Bảng biểu
| Tên trường      | Kiểu dữ liệu | Độ dài | Giá trị mặc định |
|------------------|--------------|--------|-------------------|
| idBannhac        | INT          | -      | NULL              |
| tenBannhac      | VARCHAR      | 255    | rỗng              |
| idNhacsi         | INT          | -      | 0                 |




# 3. KHAI BÁO CÁC TRƯỜNG KHOÁ

## a) Khai báo khoá chính: idBannhac
Nháy nút phải chuột vào ô idBannhac; chọn Create new index, chọn PRIMARY.

- **Sao chép**: Ctrl+C
- **Copy selected columns**
- **Paste columns**

- **Add column**: Ctrl+Ins
- **Remove column**: Ctrl+Del
- **Move up**: Ctrl+U
- **Move down**: Ctrl+D

- **Create new index**: PRIMARY

**Hình 20.5. Bảng chọn để khai báo khoá chính**

## b) Khai báo khoá cấm trùng lặp
Cặp (tenBannhac; idNhacsi) không được trùng lặp, vì vậy phải khai báo khoá cấm trùng lặp. Đánh dấu hai trường này; nháy nút phải chuột vào vùng đánh dấu và chọn Create new index, chọn UNIQUE.

**Hình 20.6. Giao diện khai báo khoá cấm trùng lặp**

## Bài tập và câu hỏi
1. Giải thích sự khác nhau giữa khoá chính và khoá cấm trùng lặp.
2. Thực hiện khai báo khoá chính cho bảng nhạc của bạn.
3. Tạo một khoá cấm trùng lặp cho bảng nhạc với các trường phù hợp.

## Hình ảnh mô tả
- **Hình 20.5**: Bảng chọn để khai báo khoá chính.
- **Hình 20.6**: Giao diện khai báo khoá cấm trùng lặp.

## Bảng biểu
| Tên trường     | Kiểu dữ liệu | Chiều dài | Cho phép NULL | Mặc định         |
|----------------|---------------|-----------|---------------|-------------------|
| idBannhac      | INT           |           |               | AUTO_INCREMENT     |
| tenBannhac     | VARCHAR       | 255       |               |                   |




# Khai báo các khoá ngoại

## Nội dung lý thuyết
Để khai báo khoá ngoài `idNhacsi`, chọn thẻ Foreign Key trong phần mềm quản lý cơ sở dữ liệu.

## Ví dụ minh họa
1. Mở phần mềm HeidiSQL và kết nối đến cơ sở dữ liệu `mymusic`.
2. Chọn bảng cần khai báo khoá ngoài.
3. Nháy chuột vào ô dưới dòng `Columns` và chọn trường khoá ngoài là `idNhacsi`, sau đó chọn OK.

### Hình 20.7. Khai báo khoá ngoài
![Hình 20.7. Khai báo khoá ngoài](link_to_image)

## Bài tập và câu hỏi
1. Giải thích quy trình khai báo khoá ngoài trong cơ sở dữ liệu.
2. Tại sao cần phải sử dụng khoá ngoài trong thiết kế cơ sở dữ liệu?

### Hình 20.8. Chọn trường là khoá ngoài
![Hình 20.8. Chọn trường là khoá ngoài](link_to_image)

## Bảng biểu
| Tên trường     | Kiểu dữ liệu | Chiều dài | Mặc định       |
|----------------|--------------|-----------|----------------|
| idBannhac      | INT          |           | AUTO_INCREMENT  |
| tenBannh       | VARCHAR      | 255       |                |
| idNhacsi       | INT          |           |                |

## Ghi chú về hình ảnh
- Hình 20.7 và Hình 20.8 minh họa các bước trong việc khai báo khoá ngoài trong phần mềm HeidiSQL.



# Tiêu đề bài học
**Khai báo và khởi tạo bảng trong cơ sở dữ liệu**

## Nội dung lý thuyết
Trong quá trình thiết kế cơ sở dữ liệu, việc khai báo và khởi tạo bảng là một bước quan trọng. Bảng là nơi lưu trữ dữ liệu trong cơ sở dữ liệu, mỗi bảng sẽ có các trường (cột) và bản ghi (dòng) để lưu trữ thông tin.

### Các thành phần của bảng:
- **Tên bảng**: Là tên gọi của bảng trong cơ sở dữ liệu.
- **Các trường**: Là các cột trong bảng, mỗi trường có một kiểu dữ liệu nhất định.
- **Khóa chính**: Là trường hoặc tập hợp các trường có giá trị duy nhất để xác định mỗi bản ghi trong bảng.
- **Khóa ngoại**: Là trường trong bảng này tham chiếu đến khóa chính của bảng khác.

## Ví dụ minh họa
Giả sử chúng ta có bảng `bannhac` với các trường như sau:
- `idBannhac`: INT, khóa chính, tự động tăng.
- `tenBannh`: VARCHAR(255), tên ban nhạc.
- `idNhacsi`: INT, khóa ngoại tham chiếu đến bảng `nhacsi`.

### Câu lệnh SQL để tạo bảng:
```sql
CREATE TABLE bannhac (
idBannhac INT AUTO_INCREMENT PRIMARY KEY,
tenBannh VARCHAR(255),
idNhacsi INT,
FOREIGN KEY (idNhacsi) REFERENCES nhacsi(idNhacsi)
);
```

## Bài tập và câu hỏi
1. Hãy tạo lập bảng `banthuam` với các trường:
- `idBanthuam`: INT, khóa chính, tự động tăng.
- `tenBanthuam`: VARCHAR(255).
- `idNhacsi`: INT, khóa ngoại tham chiếu đến bảng `nhacsi`.

2. Hãy tạo lập bảng `QuậnHuyện` trong CSDL quản lý tên Quận/Huyện, Tỉnh/Thành phố.

## Hình ảnh mô tả
- **Hình 20.9**: Chọn bảng tham chiếu trong cơ sở dữ liệu.
- **Hình 20.10**: Chọn trường tham chiếu trong bảng `nhacsi`.

## Bảng biểu
| Tên trường     | Kiểu dữ liệu | Khóa chính | Khóa ngoại |
|----------------|---------------|-------------|-------------|
| idBannhac      | INT           | Có          | Không       |
| tenBannh       | VARCHAR(255)  | Không       | Không       |
| idNhacsi       | INT           | Không       | Có          |

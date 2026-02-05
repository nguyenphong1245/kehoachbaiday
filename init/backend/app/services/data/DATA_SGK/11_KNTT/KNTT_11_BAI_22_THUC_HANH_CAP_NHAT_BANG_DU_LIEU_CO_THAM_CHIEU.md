# BÀI 22: THỰC HÀNH CẬP NHẬT BẢNG DỮ LIỆU CÓ THAM CHIẾU

## SAU BÀI HỌC NÀY EM SẼ:
- Hiểu được cách nhập dữ liệu đối với các bảng có trường khoá ngoài - trường tham chiếu đến một khoá chính của bảng khác.
- Khi cập nhật một bảng có khoá ngoài, dữ liệu của trường khoá ngoài là dữ liệu tham chiếu đến một trường khoá chính của một bảng khác. HeidiSQL hỗ trợ kiểm soát điều này như thế nào?

## Nhiệm vụ 1: Cập nhật bảng bannhac
### Hướng dẫn:
a) Thêm mới dữ liệu vào bảng bannhac
- Chọn bảng bannhac; nháy chuột chọn thẻ Dữ liệu; em sẽ thấy bảng dữ liệu có các trường idBannhac, tenBannhac, idNhacsi nhưng chưa có dữ liệu.

### Hình 22.1: Giao diện thêm mới dữ liệu.
![Hình 22.1: Giao diện thêm mới dữ liệu.](#)

- Thực hiện nhập dữ liệu:
- Trường idNhacsi có kiểu INT, AUTO_INCREMENT nên không cần nhập dữ liệu cho trường này: Nháy đúp chuột vào ô ở trường tenBannhac để nhập tên bản nhạc.

### Hình 22.2: Minh họa thao tác nhập dữ liệu.
![Hình 22.2: Minh họa thao tác nhập dữ liệu.](#)

## Bài tập và câu hỏi:
1. Giải thích vai trò của khoá ngoài trong cơ sở dữ liệu.
2. Tại sao không cần nhập dữ liệu cho trường idNhacsi?
3. Hãy mô tả quy trình cập nhật dữ liệu cho một bảng có khoá ngoài.

## Bảng biểu:
| idBannhac | tenBannhac | idNhacsi |
|------------|-------------|-----------|
| NULL       | Du kích sóng|           |

**Ghi chú về hình ảnh:**
- Hình 22.1 và Hình 22.2 minh họa giao diện và thao tác nhập dữ liệu trong phần mềm HeidiSQL.



# Bài học: Quản lý dữ liệu trong cơ sở dữ liệu

## Nội dung lý thuyết
Trong cơ sở dữ liệu, việc quản lý dữ liệu bao gồm các thao tác như nhập, sửa chữa, cập nhật và xóa dữ liệu. Đặc biệt, khi làm việc với các trường khóa ngoài, cần đảm bảo tính nhất quán của dữ liệu giữa các bảng.

### Trường khóa ngoài
Trường `idNhacsi` là trường khóa ngoài, đã được khai báo tham chiếu đến trường `idNhacsi` của bảng `nhacsi`. Để đảm bảo tính nhất quán, giá trị hợp lệ chỉ có thể lấy từ các giá trị của `idNhacsi` có trong bảng `nhacsi`. Để nhập dữ liệu cho trường `idNhacsi`, nháy đúp chuột vào ô nhập và chọn tên nhạc sĩ trong hộp danh sách.

## Ví dụ minh họa
Hình 22.3. Nhập dữ liệu cho trường khóa ngoài

![Hình 22.3. Nhập dữ liệu cho trường khóa ngoài](image_placeholder)

### Sửa chữa, cập nhật dữ liệu trong bảng `bannhac`
Thao tác sửa chữa dữ liệu trong bảng `bannhac` nếu phát hiện có sai sót, tương tự như đã được giới thiệu ở Bài 21. Chỉ cần nháy đúp chuột vào ô dữ liệu muốn sửa.

#### Ví dụ sửa dữ liệu trường `idNhacsi` ở dòng số 2
Hình 22.4. Giao diện sửa dữ liệu

![Hình 22.4. Giao diện sửa dữ liệu](image_placeholder)

## Bài tập và câu hỏi
1. Giải thích khái niệm trường khóa ngoài và tầm quan trọng của nó trong cơ sở dữ liệu.
2. Thực hiện các thao tác nhập, sửa, và xóa dữ liệu trong bảng `bannhac` và `nhacsi`.
3. Tại sao MySQL lại ngăn chặn việc xóa các dòng trong bảng `nhacsi` khi có dữ liệu tham chiếu trong bảng `bannhac`?

## Hình ảnh mô tả
- Hình 22.3: Giao diện nhập dữ liệu cho trường khóa ngoài.
- Hình 22.4: Giao diện sửa dữ liệu trong bảng `bannhac`.

## Bảng biểu
| Tên bảng  | Số lượng bản ghi | Kích thước |
|-----------|------------------|-------------|
| bannhac   | 128              | 49.0 KiB    |
| nhacsi    | 16               | 16.0 KiB    |
| casi      | 16               | 16.0 KiB    |

Lưu ý: Các thao tác trên cần được thực hiện cẩn thận để đảm bảo tính toàn vẹn của dữ liệu trong cơ sở dữ liệu.



# Bài học: Quản lý dữ liệu âm nhạc trong MySQL

## Nội dung lý thuyết
Trong MySQL, khi một bản ghi trong bảng cha (bảng nhacsi) có liên kết với các bản ghi trong bảng con (bảng bannhac) thông qua khóa ngoại (foreign key), hệ thống sẽ ngăn chặn việc xóa bản ghi trong bảng cha nếu vẫn còn bản ghi liên quan trong bảng con. Điều này giúp duy trì tính toàn vẹn dữ liệu.

### Ví dụ minh họa
Giả sử idNhacsi của nhạc sĩ Văn Cao là 2 đã có trong các bản nhạc "Trường ca sông Lô", "Tiến về Hà Nội" ở bảng bannhac. MySQL sẽ ngăn chặn việc xóa dòng tương ứng với nhạc sĩ Văn Cao ở bảng nhacsi.

![Hình 22.5. Minh họa xóa dữ liệu có tham chiếu](#)

Nếu chọn OK, thông báo lỗi sẽ xuất hiện như hình dưới đây:

![Hình 22.6. Thông báo lỗi](#)

Thông báo lỗi này cho biết việc xóa dữ liệu sẽ làm mất tính toàn vẹn dữ liệu.

## Bài tập và câu hỏi
1. Hãy thực hành các truy xuất dữ liệu theo thứ tự giảm dần của trường idBannhac; theo thứ tự tên các bản nhạc.
2. Hãy thực hành lấy ra danh sách tên các bản nhạc của nhạc sĩ Văn Cao có trong bảng bannhac.

### Nhiệm vụ 2
Hãy tìm hiểu một chức năng của phần mềm ứng dụng Quản lý dữ liệu âm nhạc dựa trên những kiến thức vừa được học trong bài. Thực hiện qua giao diện ở Hình 22.7, so sánh với hành động và cho nhận xét so sánh.

## Hình ảnh mô tả
- Hình 22.5: Minh họa xóa dữ liệu có tham chiếu.
- Hình 22.6: Thông báo lỗi khi xóa dữ liệu làm mất tính toàn vẹn dữ liệu.

## Bảng biểu
| idNhacsi | TenNhacsi | idBannhac | TenBannhac          |
|----------|------------|------------|----------------------|
| 2        | Văn Cao    | 1          | Trường ca sông Lô   |
| 2        | Văn Cao    | 2          | Tiến về Hà Nội      |

Lưu ý: Hệ QTCSDL chỉ có thể ngăn chặn được các lỗi logic đã được khai báo (ví dụ logic tham chiếu khóa ngoài). Nó không thể ngăn chặn được các lỗi không liên quan đến logic nào. Do đó, người làm việc với CSDL luôn phải có sự cẩn thận, mẫn cán trong công việc của mình.



# Bài học: Quản lý danh sách bản nhạc

## Nội dung lý thuyết
Giao diện Quản lý danh sách các bản nhạc cho phép người dùng thực hiện các thao tác như nhập, tìm kiếm, sửa chữa và xóa các bản nhạc trong cơ sở dữ liệu.

### Cách tương tác với giao diện:
- **Nhập dữ liệu bản nhạc mới**: Người dùng cần nhập tên bản nhạc và chọn nhạc sĩ từ hộp danh sách phía dưới, sau đó nhấn nút Nhập.
- **Ví dụ**: Nhập 'Hà Nội niềm tin và hi vọng', chọn nhạc sĩ Phan Nhân và nhấn Nhập.

- **Tìm một bản nhạc**: Người dùng có thể nhập một vài từ của tên bản nhạc hoặc chọn nhạc sĩ nếu biết, sau đó nhấn nút Tìm.

- **Danh sách các bản nhạc**: Các bản nhạc đã có trong cơ sở dữ liệu được hiển thị thành nhiều trang, mỗi trang có 10 dòng. Người dùng có thể chọn trang bằng cách nhấn vào hộp danh sách trang.

- **Sửa một bản nhạc**: Nhấn vào phím radio trên dòng tương ứng, thông tin của bản nhạc sẽ được hiển thị ở phần phía trên để người dùng sửa chữa. Nhấn Nhập để lưu lại kết quả thay đổi.

- **Xóa một hay nhiều bản nhạc**: Nhấn vào các checkbox ở đầu các dòng tương ứng và chọn Xóa.

## Hình ảnh mô tả
- **Hình 22.7**: Giao diện Quản lý danh sách các bản nhạc.

## Bảng biểu
- Danh sách các bản nhạc được thể hiện trong bảng phía dưới với nhiều trang.

## Bài tập và câu hỏi
1. Cập nhật dữ liệu vào bảng `banthuam`.
2. Truy xuất dữ liệu bảng `banthuam` theo các tiêu chí khác nhau.

### Vận dụng
Hãy thực hiện cập nhật và truy xuất bảng Quận/Huyện trong cơ sở dữ liệu quản lý danh sách tên các Quận/Huyện; Tỉnh/Thành phố.

----

### Ghi chú về hình ảnh
Hình 22.7 mô tả giao diện của ứng dụng quản lý danh sách bản nhạc, nơi người dùng có thể thực hiện các thao tác như nhập, tìm kiếm, sửa chữa và xóa bản nhạc.
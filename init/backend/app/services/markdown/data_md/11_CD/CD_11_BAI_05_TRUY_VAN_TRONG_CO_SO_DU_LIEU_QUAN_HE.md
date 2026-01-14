# BÀI 5: TRUY VẤN TRONG CƠ SỞ DỮ LIỆU QUAN HỆ

Học xong bài này, em sẽ:
- Diễn đạt được khái niệm truy vấn CSDL
- Giải thích được cấu trúc cơ bản `SELECT`, `FROM`, `WHERE` của câu lệnh SQL.
- Nêu được một vài ví dụ minh họa việc dùng truy vấn để tổng hợp, tìm kiếm dữ liệu trên một bảng.

----

Em hãy nêu một vài ví dụ cụ thể về khai thác tin trong một CSDL mà em biết.

## Khái niệm truy vấn CSDL

Truy vấn CSDL (Query) là một phát biểu thể hiện yêu cầu của người dùng đối với CSDL. Đó có thể là yêu cầu thao tác trên dữ liệu như: thêm, sửa, xóa bản ghi. Đó cũng có thể là yêu cầu khai thác CSDL. Dù đơn giản hay phức tạp thì bản chất việc khai thác một CSDL là tìm kiếm dữ liệu đã lưu giữ trong đó và hiển thị kết quả theo khuôn dạng thuận lợi cho người khai thác.

Để máy tính có thể hiểu và thực thi được yêu cầu của người dùng truy vấn, phải được viết theo một số quy tắc của hệ quản trị CSDL. Nói cách khác, mỗi hệ quản trị CSDL có ngôn ngữ truy vấn của nó. Đối với các hệ quản trị CSDL quan hệ, ngôn ngữ truy vấn phổ biến nhất và nổi tiếng nhất cho đến nay là SQL (Structured Query Language). Hầu hết các hệ quản trị CSDL quan hệ, ngay cả những hệ thống ngôn ngữ chung đều hỗ trợ một số phiên bản SQL. Bài học này lập trung vào việc dùng SQL để hiện yêu cầu tìm và trích rút dữ liệu trong CSDL.

Chẳng hạn, giáo viên chủ nhiệm cần danh sách những học sinh có điểm tổng kết môn Tin học từ 8.0 trở lên. Tùy theo hệ quản trị CSDL có thể có những truy vấn tóm tắt dữ liệu và thực hiện một số phép tính trên dữ liệu để đưa ra kết quả. Với những truy vấn như vậy, kết quả có thể là hình ảnh, đồ thị, ví dụ như kết quả ra có thể là yêu cầu phân tích xu hướng mua bán một mặt hàng trong 6 tháng đầu năm của một công ty thương mại.

----

Đọc bản mới nhất trên hoc10.vn                              Bản sách mẫu



# Khai thác CSDL bằng câu truy vấn SQL đơn giản

Em hãy quan sát mẫu câu truy vấn ở Hình 1a dùng để tìm dữ liệu trong CSDL và truy vấn một ví dụ truy vấn ở Hình 1b. Muốn tìm Họ và tên, Ngày sinh, điểm môn Toán và điểm môn Ngữ văn của những học sinh có điểm môn Toán trên 7.0 thì em sử dụng câu truy vấn SQL như thế nào?

## Cấu trúc cơ bản của một câu truy vấn viết bằng ngôn ngữ SQL như ở Hình:

```
SELECT [Tên các trường dữ liệu cần đưa ra kết quả]
FROM [Tên bảng trong CSDL được truy cập để lấy dữ liệu]
WHERE [Biểu thức logic chọn các bản ghi đưa ra kết quả]
```

### Hình 1a. Mẫu câu truy vấn SQL

### Hình 1b. Một câu truy vấn SQL

Để có kết quả của câu truy vấn, hệ quản trị CSDL sẽ truy cập vào các bảng dữ liệu qua các bảng thỏa mãn điều kiện tìm kiếm dùng sau WHERE sẽ được lựa chọn. Kết quả câu truy vấn là những bản ghi đã được lựa chọn những trường có tên dùng giá trị của.

**Chú ý:** Khi thực hiện các câu truy vấn, hệ quản trị CSDL sẽ coi tên trường là biến trong chương trình xử lý. Do vậy nếu tên trường có chứa dấu cách thì cần phải dùng các dấu để đánh dấu bắt đầu và kết thúc tên trường.

Để dễ theo dõi các ví dụ về câu truy vấn trong mục này, CSDL nói đến ở các ví dụ bảng HOC SINH 11 với dữ liệu như ở Hình:

| Mã định danh | Họ và tên       | Ngày sinh   | Giới tính | Đoàn viên      | Địa chỉ         | Toán | Ngữ văn | Tin học |
|--------------|------------------|-------------|-----------|----------------|------------------|------|---------|---------|
| 13109413     | Phan Thủy Anh    | 29/10/2007  | Nữ       | 39 Hung Vương  | 7.3              | 7.4  | 8.5     | |
| 13109735     | Lê Minh Đức      | 05/9/2007   | Nam      | 15 Ván Cao     | 6.4              | 7.2  | 7.0     | |
| 13124595     | Hoàng Giang      | 21/12/2007  | Nam      | 27 Lò Sũ       | 7.7              | 7.6  | 9.3     | |
| 13126236     | Đặng Phương      | 21/01/2007  | Nam      | 148 Hàng Gà    | 8.5              | 6.8  | 9.0     | |
| 13146782     | Nguyễn Minh Trí   | 03/12/2007  | Nam      | 37 Chu Ván An  | 9.0              | 7.0  | 7.5     | |
| 13169292     | Trần Minh Tú     | 14/11/2007  | Nữ       | 18 Quán Thánh  | 7.8              | 6.5  | 7.7     | |

### Hình 2. Bảng HỌC SINH 11

Đọc bản mới nhất trên hoc10.vn                                                       Bản sách mẫu



# Vídụ 1. Dểtìm Mã dinh danh Họ và tên.

| Mã dinh danh | Họ và tên        | Toán | Ngữ văn |
|---------------|------------------|------|---------|
| 13109413      | Phan Thuỳ Anh    | 7.3  | 7.4     |
| 13109735      | Lê Minh Đức      | 6.4  | 7.2     |
| 13124595      | Hoàng Giang      | 7.7  | 7.6     |
| 13146782      | Nguyễn Minh Trí   | 9.0  | 7.0     |

Ngôn ngữ truy vấn QBE

Có những hệ quản trị CSDL cho phép truy vấn bằng cách điền vào chỗ trống trong một bảng - như thể hiện một ví dụ về kết quả nhận được (nên ngôn truy vấn này là Query By Example - QBE). Access là một hệ quản trị CSDL cho truy vấn.

## VÍ dụ 2. Tương ứng với câu truy vấn SQL ở Hình 1b, ta có thể điền vào bảng thiết kế QBE của Access như ở Hình dưới đây:

Những bản ghi có giá trị trường Ngữ văn >= 7.0 mở được ra vào kết quả của truy vấn.

| Field            | Mã dinh danh | Họ và tên | Ngày sinh | Toán | Ngữ văn |
|------------------|---------------|------------|-----------|------|---------|
| Sort:            |               |            |           |      |         |
| Show             |               |            |           |      |         |

Cho biết trường Mã dinh danh không xuất hiện trong kết quả truy vấn.

## Hình 1. Giao diện truy vấn trên bảng QBE

### Câu 1. Hãy viết câu truy vấn SQL để tìm điểm môn Ngữ văn của những học sinh là Đoàn viên trong bảng HOC SINH 11 (Hình 2). Kết quả của câu truy vấn là gì?

### Câu 2. Hình bên là một câu truy vấn SQL:
```sql
SELECT [Mã sách], [Tên sách], [Số trang]
FROM SÁCH
WHERE [Tác giả] = "Nguyên Nhật Ánh"
```
Theo em, câu truy vấn đó muốn tìm biết gì?

Đọc bản mới nhất trên hoc10.vn                                          Bản sách mẫu



# Học Sinh 11 - Truy Vấn CSDL

## Yêu cầu
Hãy nêu một yêu cầu tìm thông tin trong bảng HỌC SINH 11 (Hình 2) và viết câu truy vấn SQL để có được thông tin cần tìm.

Trong các câu sau, những câu nào đúng?
1. Truy vấn CSDL là một biểu mẫu.
2. Có thể dùng các câu truy vấn để tìm kiếm dữ liệu trong CSDL.
3. SQL là ngôn ngữ truy vấn thường được dùng trong các hệ CSDL quan hệ.
4. Trong câu truy vấn SQL, sau từ khóa FROM là tên của bảng dữ liệu nguồn cho các trích xuất dữ liệu.

## Tóm tắt bài học
Đối với các hệ CSDL quan hệ, có hai loại truy vấn dữ liệu:
- Truy vấn cập nhật dữ liệu
- Truy vấn khai thác dữ liệu.

Ngôn ngữ truy vấn phổ biến nhất trong các hệ quản trị CSDL quan hệ là SQL. Truy vấn khai thác dữ liệu của SQL có cấu trúc cơ bản là:

```
SELECT <các cột="" cần="" hiển="" thị="">
FROM <tên bảng="">
WHERE &#x3C;điều kiện lọc dữ liệu>
```

- Mệnh đề `SELECT` xác định thông tin ta muốn hiển thị.
- Mệnh đề `FROM` xác định dữ liệu được lấy từ đâu.
- Mệnh đề `WHERE` xác định điều kiện lọc dữ liệu.

Trong một số hệ quản trị CSDL, truy vấn còn có thể được thể hiện bằng ngôn ngữ QBE.

## BÀI TÌM HIỂU THÊM
### VÀI NÉT VỀ CSDL NoSQL
Vào cuối những năm 2000, xuất hiện các CSDL NoSQL. Một số nội dung truy vấn SQL trong các hệ CSDL có rằng ngữ quen.

CSDL không dùng truy vấn SQL. Thực ra "NoSQL" trong tên gọi đó nên được hiểu là "Không chỉ SQL" (Not Only SQL). Các hệ CSDL NoSQL ra đời là để lưu trữ và xử lý dữ liệu lớn rất nhanh trong nhiều ứng dụng; đặc biệt là các ứng dụng web.

Khác với các CSDL quan hệ truyền thống, CSDL NoSQL hỗ trợ nhiều kiểu lưu trữ dữ liệu khác nhau tùy thuộc vào ứng dụng cụ thể thay vì sử dụng dạng câu lệnh chặt chẽ như bảng. Một số hệ CSDL NoSQL có thể sử dụng cú pháp giống SQL để làm việc với dữ liệu nhưng chỉ ở một mức độ hạn chế.

CSDL NoSQL nới lỏng các quy tắc và tính nhất quán dữ liệu để đạt tốc độ nhanh trong phục vụ, tính linh hoạt cũng như khả năng mở rộng quy mô. CSDL quan hệ và CSDL NoSQL, mỗi loại có cách lưu trữ và truy xuất dữ liệu khác nhau, được thiết kế để giải quyết các loại nhu cầu khác nhau do các ứng dụng CSDL đòi hỏi.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.</tên></các>
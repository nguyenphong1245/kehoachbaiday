Văn bản

```

Trên màn hình trình duyệt web, văn bản hiển thị trên một đoạn mới và phân tách với các thành phần khác bằng một khoảng trống giữa hai đoạn văn bản. Văn bản có thể chứa một số phần tử HTML khác.

### Ví dụ 1
Văn bản HTML ở Hình Ia gồm hai đoạn văn bản được tạo bằng phần tử ``. Kết quả hiển thị hai đoạn văn bản trên màn hình trình duyệt web như ở Hình 1b.

```html

# Sử dụng thẻ p

Thông thường, trang web tĩnh được tạo thành từ các văn bản HTML. Muốn thay đổi nội dung trang web tĩnh, người tạo trang web phải chỉnh sửa nội dung văn bản HTML.

Các trang web động thường được tạo thành từ các kịch bản của một số ngôn ngữ lập trình như PHP, Java, Python.



# Khai báo tiêu đề

# Tiêu đề mục thường được dùng cho tên Chương

# Tiêu đề mục thường được dùng cho tên Mục

# Tiêu đề mục mức 3 thường được dùng cho tên Tiểu mục

# Tiêu đề mục mức 4

# Tiêu đề mục mức 5

# Tiêu đề mục mức 6



# Tiêu đề mục mức 1
Thường được dùng cho tên Chương

## Tiêu đề mục mức 2
Thường được dùng cho tên Mục

### Tiêu đề mục mức 3
Thường được dùng cho tên Tiểu mục

#### Tiêu đề mục mức 4

##### Tiêu đề mục mức 5

###### Tiêu đề mục mức 6

### Hình 2b. Kết quả
Khi mở văn bản HTML ở Hình 2a bằng trình duyệt web

## Làm nổi bật nội dung văn bản

Hãy nêu một số cách làm nổi bật nội dung văn bản ở các hệ soạn thảo văn bản mà em đã sử dụng:

HTML làm nổi bật nội dung trong văn bản bằng cách thay đổi định dạng của phần dung đó khi hiển thị trên màn hình trình duyệt web. Bảng liệt kê một số phần tử dùng để làm nổi bật nội dung văn bản.

### Bảng 1: Một số phần tử HTML dùng để làm nổi bật nội dung văn bản

| Phần tử | Cú pháp         | Mục đích sử dụng                                                                 |
|---------|------------------|----------------------------------------------------------------------------------|
| strong  | `Nội dung` | In đậm Nội dung; thường dùng để nhấn mạnh các nội dung quan trọng trong văn bản. |
| em      | `Nội dung`         | In nghiêng Nội dung; thường dùng để nhấn mạnh các danh từ riêng hay thuật ngữ trong văn bản. |
| mark    | `Nội dung`     | Tô màu vàng cho nền của Nội dung; thường dùng để làm nổi bật các nội dung cần chú ý trong văn bản. |

### Ví dụ 3
Nội dung trong phần body của văn bản HTML ở Hình 3a có sử dụng các phần tử ``, ``, `` để làm nổi bật nội dung văn bản. Hình 3b là kết quả hiển thị văn bản HTML ở Hình 3a trên màn hình trình duyệt web.



Nội dung được in đậm
Nội dung được in nghiêng
Nội dung có nền vàng

Hình 3a. Ví dụ sử dụng ,  làm nổi bật nội dung văn bản phần tử ;

file:/I/highlight.html
Nội dung được in đậm Nộidung được in nghiêng Nội dung có nền vàng
Hình 3b. Kết quả khi mở văn bản HTML ở Hình 3a bằng trình duyệt web

Lưu ý: HTML định nghĩa thêm phần tử  để in đậm văn bản và phần tử  để in nghiêng văn bản. Về phông chữ, cỡ chữ từ phiên bản HTML5 (phiên bản các định dạng sử dụng thông dụng) không còn hỗ trợ dạng phông chữ, cỡ chữ ta sẽ sử dụng CSS. Nội dung về CSS được đề cập trong Bài 8.

## Tạo siêu liên kết
HTML định nghĩa phần tử  để tạo các siêu liên kết, giúp kết nối trang web hiện thời với các tài nguyên web khác như trang web, hình ảnh, âm thanh, đoạn phim. Phần tử  được khai báo như sau:

```html
Liên kết web
```

Trong đó, thuộc tính `href` xác định địa chỉ của tài nguyên web trên Internet. URL (Uniform Resource Locator) có cấu trúc cơ bản như sau:

```
Giao thức://Tên miền/Đường dẫn
```

Giao thức thường là `http` hoặc `https`. Tên miền là địa chỉ máy chủ chứa tài nguyên web muốn liên kết; ví dụ: `https://www.w3schools.com`. Đường dẫn thường là sự kết hợp giữa tên các thư mục và tên tệp để xác định vị trí cụ thể của tài nguyên web muốn liên kết; ví dụ: `/reference/tags/html`.

Liên kết web thường là dãy kí tự được hiển thị trên trình duyệt web cho phép người dùng nháy chuột vào để đến tài nguyên liên kết.

### Ví dụ 4
Nội dung phần body trong văn bản HTML ở Hình 4a khai báo siêu liên kết "Trang web tìm hiểu về HTML". Khi mở bằng trình duyệt web, nháy chuột vào siêu liên kết, nội dung trang web `https://www.w3schools.com/html/default.asp` sẽ hiển thị như ở Hình 4b.



Tạo siêu liên kết
<fbody>
Hình 4a. Ví dụ tạo siêu liên kết bằng phần tử a

file:///lahtmnl
Trang web tìm hiểu về html
Hình 4b. Ví dụ siêu liên kết và nội dung hiển thị trên màn hình trình duyệt web khi nháy chuột
Lưu ý: Nếu URL chỉ khai báo địa chỉ website và được viết dưới dạng Giao thức://Tên miền thì khi nháy chuột vào siêu liên kết; trình duyệt web sẽ hiển thị nội dung trang chủ của website được khai báo trong Tên miền.

Để tạo siêu liên kết giữa các trang web trong cùng thư mục, chỉ cần khai báo thành phần Đường dẫn trong URL là tên tệp của trang web cần kết nối.

Ví dụ 5. Nội dung phần body trong tệp index.html
Hình 5 khai báo siêu liên kết "Sở thích" đến trang web hobbies.html được lưu trong cùng thư mục web cá nhân.

```html

Sở thích

```

Hình 5. Ví dụ tạo siêu liên kết các trang web trong cùng thư mục

HTML còn hỗ trợ tạo siêu liên kết đến một phần tử khác trên cùng một trang web dựa vào định danh của nó, nhằm tạo các dấu trang giúp di chuyển nhanh đến phần nội dung mong muốn thay vì phải di chuyển thanh trượt màn hình. Các dấu trang thường được tạo khi trang web có nội dung dài hơn chiều dọc màn hình máy tính.

Mỗi phần tử trong một văn bản HTML có thể được định danh duy nhất bằng cách gán Tên định danh cho thuộc tính id theo cú pháp:
```html
id = "Tên định danh"
```

Để tạo siêu liên kết đến một phần tử trong trang web, Tên định danh của phần tử đó được gán cho URL và được viết theo cú pháp:
```html
'#Tên định danh'
```

Bản in thử



Chủ đề
# Nội dung Chủ đề 1
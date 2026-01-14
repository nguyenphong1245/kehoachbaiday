.red {color: red;}

# Tiêu đề có chữ màu đỏ

Đoạn văn có chữ màu đỏ

Nhãn có chữ màu đỏ



.red { color: red; }
.blue { color: blue; }

Đoạn văn có chữ màu đỏ

Đoạn văn có chữ màu xanh

Đoạn văn có màu chữ mặc định quy định bởi trình duyệt web

```

### Hình 3a

Ví dụ khai báo và áp dụng bộ chọn lớp cho một loại phần tử.

### Hình 3b

Kết quả khi mở văn bản HTML ở Hình 3a bằng trình duyệt web.

## Bộ chọn định danh

Em có biết cách khai báo định dạng CSS để chỉ áp dụng cho một phần tử cụ thể trên trang web không?

CSS có thể sử dụng bộ chọn định danh (ID selector) để áp dụng quy tắc định dạng phần tử đã được định danh trong văn bản HTML. Khi đó, bộ chọn định danh được xác định thông qua tên định danh của phần tử này và được khai báo như sau:

```
#Tên định danh thuộc tính 1: giá trị; thuộc tính n: giá trị;



#tieu_de_muc_chinh {color: red;}

# Chương 1

# Chương 2

```

Hình 4a. Ví dụ khai báo và áp dụng bộ chọn định danh
Hình 4b. Kết quả khi mở văn bản HTML ở Hình 4a bằng trình duyệt web

## Thực hành sử dụng bộ chọn lớp, bộ chọn định danh

### Nhiệm vụ 1. Khai báo và áp dụng bộ chọn lớp
Soạn văn bản HTML có khai báo CSS sử dụng bộ chọn lớp để được trang web hiển thị trên màn hình trình duyệt web như ở Hình 5.

**Yêu cầu 1:**
Em hãy sử dụng external CSS tạo bảng định dạng gồm các quy tắc sau:

- Bộ chọn lớp có tên `blue` khai báo định dạng màu `steelblue`.
- Bộ chọn lớp có tên `red` khai báo định dạng màu `darkred`.
- Bộ chọn lớp có tên `orangered` để khai báo các thuộc tính định dạng CSS: tên phông chữ `Verdana`, cỡ chữ `25 pixel`, màu chữ `orangered`.
- Bộ chọn lớp có tên `yellow` cho phần tử `input` để khai báo thuộc tính CSS: màu nền `yellow`.
- Bộ chọn lớp có tên `blue` cho phần tử `input` để khai báo thuộc tính CSS: màu nền `blue`, màu chữ `white`.

### Hướng dẫn thực hiện:
**Bước 1.** Tạo tệp `BailO-NVI.css` bằng phần mềm Sublime Text
Mở tệp mới và ghi lưu với tên `BailO-NVI.css`.

**Bước 2.** Khai báo các quy tắc định dạng CSS như sau:
```
/* Nội dung quy tắc CSS sẽ được thêm vào đây */



```

**Bước 3:** Khai báo các thuộc tính class cho các phần tử. Trong nội dung phần tử `body`:
- Thêm khai báo thuộc tính class cho phần tử `h2` như sau:
```html
```
- Thêm khai báo thuộc tính class cho phần tử `h3` của tiêu đề mục 1 "Thông tin về người góp ý" như sau:
```html

#
```
Chú ý, giá trị của thuộc tính class có thể gồm nhiều bộ chọn lớp được viết phân tách bởi dấu cách. Khi đó, các khai báo định dạng CSS thuộc bộ chọn lớp `blue` và `orangered` đều được áp dụng.

- Thêm khai báo thuộc tính class `blue` cho các phần tử `h3` khác.
- Thêm khai báo thuộc tính class `yellow` cho các phần tử input nhập liệu ô text.
- Thêm khai báo thuộc tính class `blue` cho phần tử input gửi dữ liệu.

**Bước 4:** Ghi lưu, mở tệp bằng trình duyệt web và xem kết quả.

## Nhiệm vụ 2. Khai báo và áp dụng bộ chọn định danh
### Yêu cầu:
Em hãy chỉnh sửa văn bản HTML đã hoàn thành ở Nhiệm vụ 1 để khai báo định dạng CSS theo bộ chọn định danh cho tiêu đề "Đóng góp ý kiến cho thư viện của nhà trường" có phông chữ `Courier New`, cỡ chữ 30, màu chữ `lightsalmon`.

### Hướng dẫn thực hiện:
**Bước 1:** Mở tệp `BailO-NV1.html` đã hoàn thành ở Nhiệm vụ 1, ghi lưu với tên mới là `BailO-NV2.html`.

**Bước 2:** Thêm khai báo
```css
#tieu-de {
font-family: "Courier New";
font-size: 30px;
color: lightsalmon;
}
```
vào trong phần khai báo style:
```html

/* Các khai báo khác */
#tieu-de {
font-family: "Courier New";
font-size: 30px;
color: lightsalmon;
}



# Đóng góp ý kiến cho thư viện của nhà trường

Bước 2. Ghi lưu văn bản HTML, mở tệp

# Tạo website cá nhân:

Câu 1. Khai báo bộ chọn lớp; bộ chọn định danh, giá trị thuộc tính class cho tử body; id để hoàn thiện website cá nhân đã có ở các bài học trước.

Gợi ý thực hiện:

- Mở tệp 'style.css'
- Khai báo bộ chọn lớp có tên bg để thiết lập màu nền (ví dụ: lightgrey).
- Khai báo bộ chọn định danh có tên submit để trình bày màu của nút lệnh (ví dụ: blue).

Bổ sung khai báo giá trị thuộc tính class cho phần tử body của các tệp hobbies.html và album.html là bg:

Bổ sung khai báo giá trị thuộc tính id cho nút lệnh submit trong tệp index.html là submit.

Câu 2. Em hãy mở tệp index.html để xem website cá nhân và tự đánh giá có hài lòng với thành quả của bản thân không.

Câu 1. Cho khai báo định dạng CSS sau: .xanh {color: blue; font-size: 15px;}

Trong các khai báo HTML sau, khai báo nào sẽ áp dụng định dạng CSS trên?

- A. &#x3C;p class='xanh'>Học CSS&#x3C;/p>
- B. &#x3C;p id='xanh'>Học CSS&#x3C;/p>
- C. &#x3C;a href='https://www.w3schools.com' id='xanh'>
- D. &#x3C;a href='https://www.w3schools.com' class='xanh'>Học CSS&#x3C;/a>

Câu 2 yêu cầu khai báo và áp dụng CSS để định dạng văn bản HTML có nội dung như ở Hình 6a để có kết quả hiển thị trên trình duyệt web như ở Hình 6b.

Sau khi tìm hiểu, các bạn học sinh đã đưa ra các giải pháp sau đây. Em hãy cho biết mỗi phát biểu sau là đúng hay sai:

# Chương 1

# Chương 2

# Chương 3

# Chương 4

Hình 6a

Hình 6b



# Khai báo CSS sử dụng bộ chọn phần tử cho phần tử h1 vì nội dung văn bản HTML gồm các tử tiêu đề mục h1

## b) Thực hiện các bước sau:

### Bước 1.
Khai báo CSS sử dụng bộ chọn lớp để định dạng màu chữ khác với màu mặc định
```css
.tieudel {color: red;}
.tieude2 {color: blue;}
```

### Bước 2
Khai báo thuộc tính class 'tieude' cho các tiêu đề mục chữ có màu đỏ, khai báo thuộc tính class 'tieude2' cho các tiêu đề mục chữ có màu xanh.

## c) Thực hiện các bước sau:

### Bước 1.
Khai báo CSS sử dụng bộ chọn định danh để định dạng tiêu đề mục chữ có màu xanh; các tiêu đề khác sử dụng bộ chọn phần tử h1.
```css
#tieudel {color: blue;}
h1 {color: red;}
```

### Bước 2
Khai báo thuộc tính class 'tieude' cho tiêu đề mục chữ có màu xanh.

## d) Thực hiện các bước sau:

### Bước 1.
Kết hợp khai báo CSS sử dụng bộ chọn lớp; bộ chọn định danh:
```css
.tieudel {color: red;}
#tieude2 {color: blue;}
```

### Bước 2
Khai báo thuộc tính class='tieudel' cho các tiêu đề mục chữ màu đỏ, khai báo thuộc tính id='tieude2' cho các tiêu đề mục chữ có màu xanh.

## Tóm tắt bài học
- Bộ chọn lớp thường dùng để khai báo các quy tắc định dạng được áp dụng chung cho nhiều tử trong văn bản HTML.
- Bộ chọn định danh được dùng để khai báo các quy tắc định dạng chỉ áp dụng cho một phần tử cụ thể trong văn bản HTML.
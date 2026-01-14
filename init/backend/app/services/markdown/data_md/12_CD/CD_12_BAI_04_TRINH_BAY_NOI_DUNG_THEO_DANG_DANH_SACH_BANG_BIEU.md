1. Nội dung 1
2. Nội dung 2

```

Phần tử `` được sử dụng để tạo các mục nội dung trong danh sách. Nội dung của mỗi mục được viết trong cặp thẻ ``. Các mục trong danh sách theo mặc định được xác định thứ tự tăng dần bằng các số nguyên bắt đầu từ 1.

**Ví dụ 1.** Nội dung body của văn bản HTML trong Hình Ia khai báo một danh sách gồm ba mục nội dung. Khi hiển thị trên màn hình trình duyệt web (Hình Ib), các mục đó được xác định thứ tự. Nội dung mục đầu tiên HTML được xác định thứ tự là 1.

```html

Các công nghệ cần biết khi tạo trang web

1. HTML
2. Cascading Style Sheets (CSS)
3. JavaScript



HTML hỗ trợ tạo danh sách

- Danh sách xác định thứ tự
- Danh sách không xác định thứ tự



|   | |
| - |---|
| Dữ liệu 1 | Dữ liệu 2 |
| --------- | --------- |

```

Dữ liệu trong các ô thường là văn bản, hình ảnh, siêu liên kết. Dữ liệu cũng có thể bao gồm các bảng khác. Body của văn bản HTML trong Hình 3a trình bày danh sách cán bộ lớp 12A1 dưới dạng bảng.

### Ví dụ 5. Nội dung phần sách cán bộ lớp 12A1

Kết hiển thị trên màn hình trình duyệt web như Hình 3b.

```html

Danh sách cán bộ lớp 12A1

| STT | Họ và tên        | Chức vụ         |
| --- | ---------------- | --------------- |
| 1   | Nguyễn Thảo Linh | Lớp trưởng      |
| 2   | Nguyễn Hoàng Nam | Bí thư chi đoàn |




Các trường Kĩ thuật - Công nghệ

Đại học Bách khoa Hà Nội
Trường Đại học Công nghệ, ĐHQGHN

Các trường Kinh tế

Trường Đại học Kinh tế Quốc dân
Trường Đại học Ngoại thương

Các trường Quân đội Công an

Học Viện Kĩ thuật Quân sự
Học viện An ninh nhân dân

```

Quan sát các nhóm tiếp theo, các mục con được đánh thứ tự kế tiếp, cùng kiểu của các mục con trước đó. Danh sách các mục con này cần khai báo thuộc tính start để xác định giá trị thứ tự bắt đầu cho phù hợp. Ví dụ, các mục con của nhóm Các trường Kinh tế được khai báo như sau:

```html

Trường Đại học Kinh tế Quốc dân
Trường Đại học Ngoại thương

```

Thực hiện tương tự với danh sách con của nhóm Các trường Quân đội Công an.

**Bước 4:** Ghi lưu, mở tệp bằng trình duyệt web và xem kết quả.

----

## Nhiệm vụ 2. Tạo bảng

**Yêu cầu:** Soạn văn bản HTML để hiển thị trên màn hình trình duyệt web thông tin dạng bảng như ở Hình 5.

### Hướng dẫn thực hiện:

**Bước 1:** Tạo tệp "Bai4-NV2.html"

**Bước 2:** Tạo cấu trúc và khai báo phần tử head cho tệp Bai4-NV2.html

**Bước 3:** Tạo đường viền và chú thích cho bảng trong nội dung phần tử body:

Khai báo phần tử table.

Tạo đường viền bao quanh các ô:

```html
| Nội dung        | Nam | Nữ |
| --------------- | --- | -- |
| Bóng bàn        | 10  |    |
| Cờ vua          |     |    |
| Chạy cự li ngắn | 15  |    |




# Bước 4. Tạo nội dung bảng

Tạo nội dung bảng bằng cách khai báo nội dung cho từng hàng.

- Khai báo nội dung cho từng ô trong nội dung phần tử table: bằng ``
- Sau phần chú thích, khai báo tạo bố cục hàng các cặp thẻ ``
- Trong mỗi hàng, tạo ba ô bằng cặp thẻ `` và viết nội dung tương ứng vào các ô như yêu cầu trong Hình 5.

# Bước 5. Ghi lưu

Mở tệp bằng trình duyệt web và xem kết quả.

## Tạo website cá nhân:

Em hãy bổ sung thêm một số nội dung cho website cá nhân đã được tạo ở các bài học trước.

### Gợi ý thực hiện:
- Bổ sung tiêu đề mục `# ` "Sở thích của em" trong tệp "hobbies.html".
- Tạo danh sách xác định thứ tự hoặc không xác định thứ tự liệt kê các sở thích của em.
- Trong tệp "index.html", bổ sung tiêu đề mục `
# ` "Kế hoạch học tập" và trình bày thời khóa biểu của em dưới dạng bảng.

## Câu 1. Mỗi phát biểu sau đây là đúng hay sai khi sử dụng các `
```

Trong nội dung phần tử `form`:
- Thêm ô text để nhập liệu cho thông tin Họ và tên:
```html
Họ và tên:

```
Chú ý, phần tử `label` được dùng để tạo nhãn gắn với điều khiển, nhằm làm cho việc truy cập các điều khiển trên biểu mẫu được dễ dàng (nháy chuột vào nhãn là có thể nhập dữ liệu cho ô điều khiển đó). Khai báo này sử dụng phần tử `br` nhằm tạo ngắt dòng để ô text "Địa chỉ email" bắt đầu ở dòng mới.

- Thêm ô text để nhập dữ liệu cho thông tin Địa chỉ email:
```html
Địa chỉ email?

```

- Thêm ô `textarea` để nhập đoạn văn bản thể hiện thông tin "Ý kiến đóng góp". `textarea` được khai báo như sau:
```html
Ý kiến đóng góp:



Truyện ngắn

Kĩ năng sống

Công nghệ thông tin

Truyện tranh

Lịch sử

```

**Lưu ý:** Trong khai báo này sử dụng phần tử `
` để ngắt dòng mỗi mục chọn trong danh sách được hiển thị ở một dòng mới.

**Góp thêm nút submit bằng khai báo:**

```html



# Nhiệm vụ 3. Tạo trang web phản hồi khi người dùng nhấn nút gửi dữ liệu

## Yêu cầu:
Soạn văn bản HTML để khi nhấn nút lệnh "Góp ý" trong biểu mẫu ở Nhiệm vụ 2 thì màn hình trình duyệt web hiển thị như ở Hình 4.

Cám ơn bạn đã góp ý kiến. Chúng tôi xin ghi nhận ý kiến của bạn và sẽ cải tiến nâng cao chất lượng phục vụ hơn nữa trong thời gian sắp tới.

### Hình 4. Một trang web phản hồi khi người sử dụng gửi dữ liệu

## Hướng dẫn thực hiện:
**Bước 1.** Tạo tệp `Bai7-NV3.html`
**Bước 2.** Tạo cấu trúc và khai báo phần tử `head` cho tệp `Bai7-NV3.html`
**Bước 3.** Khai báo nội dung phần tử `body` cho tệp `Bai7-NV3.html`
Soạn nội dung như minh hoạ ở Hình 4 và ghi lưu.
**Bước 4.** Cập nhật khai báo phần tử `form` cho tệp `Bai7-NV2.html`
Mở tệp `Bai7-NV2.html` và cập nhật thuộc tính `action` trong khai báo phần tử `form` thành: `action="Bai7-NV3.html"`
**Lưu ý:** Tệp `Bai7-NV3.html` được lưu cùng thư mục chứa tệp `Bai7-NV2.html`.
**Bước 5.** Ghi lưu, mở tệp `Bai7-NV2.html` bằng trình duyệt web, điền biểu mẫu và nháy chuột vào nút "Góp ý" để quan sát kết quả.

## Tạo website cá nhân:
Hãy tạo biểu mẫu nhận lời nhắn từ bạn bè để hoàn thiện tiếp website cá nhân đã tạo ở các bài học trước.

### Gợi ý thực hiện:
- Mở tệp `index.html` và thêm tiêu đề mục `h2` "Lời nhắn" để tạo biểu mẫu nhận các lời nhắn từ bạn bè.
- Biểu mẫu có các điều khiển:
+ Ô nhập liệu `text` có nhãn "Họ và tên"
+ Ô nhập liệu `textarea` có nhãn "Lời nhắn"
+ Nút lệnh `submit` có nhãn "Gửi"
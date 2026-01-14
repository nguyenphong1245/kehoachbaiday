```

- **Thuộc tính `src`** xác định tên tệp ảnh được chèn vào trang web. Lưu ý, tên tệp ảnh có thể bao gồm cả đường dẫn đến tệp ảnh.
- **Thuộc tính `alt`** xác định nội dung thay thế sẽ hiển thị vào vùng của hình ảnh trên trình duyệt web trong trường hợp việc hiển thị hình ảnh gặp lỗi.
- **Thuộc tính `width`, `height`** xác định cụ thể kích thước chiều rộng và chiều cao của ảnh, thường được dùng để tăng giảm kích thước của ảnh gốc và tùy biến kích thước ảnh khi hiển thị trên trình duyệt web. Theo mặc định, trị chiều rộng và chiều cao được tính theo đơn vị điểm ảnh (pixel). Ảnh được sử dụng trên trình duyệt web thường ở các định dạng JPG, PNG, GIF.

**Lưu ý:** Ảnh sẽ được hiển thị theo kích thước ảnh gốc nếu không khai báo thuộc tính `width`, `height`.

### Ví dụ

Nội dung phần body của văn bản HTML trong Hình Ia chèn tệp ảnh 'canhdieu.jpg' vào trang web, kết quả hiển thị trên màn hình trình duyệt web như Hình Ib.

```html



```

- Thuộc tính `src` xác định tên tệp âm thanh được chèn vào trang web.
- Lưu ý: Tên tệp âm thanh có thể bao gồm đường dẫn đến tệp âm thanh.
- Định dạng tệp âm thanh thường được sử dụng trên trang web là MP3, OGG.
- Thuộc tính `controls` được khai báo để hiển thị bảng điều khiển tệp âm thanh trên trình duyệt web. Bảng điều khiển cung cấp một số nút lệnh có chức năng: Phát, Tạm dừng - Tắt, Tăng - Giảm âm lượng.

### Ví dụ 2
Nội dung phần body của văn bản HTML ở Hình 2a chèn tệp âm thanh `QueHuong.mp3` vào trang web, kết quả hiển thị trên màn hình trình duyệt web như Hình 2b.

```html

```

- **Hình 2a**: Ví dụ sử dụng thẻ `audio` chèn âm thanh.
- **Hình 2b**: Kết quả khi mở văn bản HTML ở Hình 2a bằng trình duyệt web.

## Chèn video
Phần tử `video` khai báo việc chèn video vào trang web theo cú pháp sau:

```html

```

- Thuộc tính `src` xác định tên tệp video được chèn vào trang web.
- Lưu ý: Tên tệp video có thể bao gồm đường dẫn đến tệp video.
- Định dạng tệp video thường được sử dụng trên trang web là MP4, OGG.
- Thuộc tính `controls` được khai báo để hiển thị bảng điều khiển tệp video trên màn hình trình duyệt web. Bảng điều khiển cung cấp một số nút lệnh có chức năng: Chạy, Tạm dừng - Tắt, Tăng - Giảm âm lượng, Phóng to - Thu nhỏ màn hình.

### Ví dụ 3
Nội dung phần body của văn bản HTML ở Hình 3a chèn tệp video `monguockyniemxua.mp4` vào trang web, kết quả hiển thị trên màn hình trình duyệt web như Hình 3b.

```html



```

Trong đó, `url` là đường dẫn đến tệp HTML hoặc tài nguyên web khác. Thuộc tính `width`, `height` xác định cụ thể kích thước chiều rộng và chiều cao của vùng nhúng trên trang web. Theo mặc định, giá trị chiều rộng và chiều cao được tính theo đơn vị điểm ảnh (pixel).

## Ví dụ 4. Nội dung phần body của văn bản

```html



# Hướng dẫn tạo trang web

## Nhiệm vụ 1. Chèn hình ảnh

### Yêu cầu:
Soạn văn bản HTML giúp Khánh Nam tạo một trang web có hình ảnh của Văn Miếu.

### Hướng dẫn thực hiện:
1. **Tạo tệp** `Bai5-NVI.html`
2. **Tạo cấu trúc và khai báo** phần tử `head` cho tệp `Bai5-NVI.html`
3. **Chuẩn bị tệp hình ảnh**
- Lưu ảnh với tên `vanmieu.jpg` trong cùng thư mục lưu tệp `Bai5-NVI.html`
- Lưu ý: Có thể chèn hình ảnh từ nguồn khác trên Internet mà không phải lưu ảnh về máy tính. Thực hiện bằng cách sao chép đường link ảnh và gán cho thuộc tính `src` trong khai báo phần tử `img`. Tuy nhiên, khi mất kết nối Internet hay nguồn ảnh bị thay đổi thì việc hiển thị hình ảnh có thể gặp lỗi.
4. **Chèn hình ảnh vào trang web**
- Trong nội dung phần tử `body`: Khai báo phần tử `img` với thuộc tính `src = vanmieu.jpg` và thuộc tính `alt = "Văn Miếu"`
5. **Ghi lưu, mở tệp bằng trình duyệt web và xem kết quả.**

----

## Nhiệm vụ 2. Chèn âm thanh

### Yêu cầu:
Soạn văn bản HTML giúp Khánh Nam tạo một trang web để nghe bài hát "Nhớ về Hà Nội".

### Hướng dẫn thực hiện:
1. **Tạo tệp** `Bai5-NV2.html`
2. **Tạo cấu trúc và khai báo** phần tử `head` cho tệp `Bai5-NV2.html`
3. **Chuẩn bị tệp âm thanh**
- Có thể truy cập một số website như chiasenhac.vn; zingmp3.vn; nhaccuatui.com để tìm kiếm tệp âm thanh định dạng MP3.
- Tải và lưu tệp nhạc với tên mới là `nhovehanoi.mp3` trong cùng thư mục lưu tệp `Bai5-NV2.html`.
4. **Chèn âm thanh vào trang web**
- Trong nội dung phần tử `body`: Khai báo phần tử `audio` với thuộc tính `src = nhovehanoi.mp3`.
5. **Ghi lưu, mở tệp trên trình duyệt web và xem kết quả.**

----

## Nhiệm vụ 3. Nhúng tệp HTML đã có vào văn bản HTML

### Yêu cầu:
Sử dụng phần tử `iframe` để tạo trang web mới có nội dung là hai trang web đã tạo ở Nhiệm vụ 1 và Nhiệm vụ 2.

### Hướng dẫn thực hiện:
1. **Tạo tệp** `Bai5-NV3.html`
2. **Tạo cấu trúc và khai báo** phần tử `head` cho tệp `Bai5-NV3.html`
3. **Soạn nội dung phần tử `body` cho tệp `Bai5-NV3.html`**
- Trong nội dung phần tử `body`: Khai báo phần tử `iframe` với thuộc tính `src = Bai5-NVI.html`.

----

**Bản in thử**



# Khai báo phần tử iframe với thuộc tính src

Lưu ý: Các tệp `Bai5-NV1.html`, `Bai5-NV2.html`, `Bai5-NV3.html` cần được lưu trong cùng một thư mục. Bằng trình duyệt web và xem kết quả.

## Bước 4. Ghi lưu

Mở tệp `Bai5-NV3.html`.

## Tạo website cá nhân

Em hãy chèn thêm hình ảnh, âm thanh, video để hoàn thiện tiếp website cá nhân đã tạo ở các bài học trước.

### Gợi ý thực hiện:

1. Mở tệp `album.html` và thêm một số hình ảnh của em hoặc em thích (nên lưu tệp ảnh vào thư mục `images`).
2. Mở tệp `hobbies.html` bổ sung tiêu đề mục `h2` là "Bài hát tôi thích" và thêm một tệp âm thanh/video cho bài hát đó.

### Câu hỏi:

**Câu 1:** Thuộc tính nào của phần tử `img` được dùng để hiển thị thông báo khi hình ảnh chèn vào trang web gặp lỗi trong quá trình hiển thị trên màn hình trình duyệt web?
- A. link
- B. title
- C. src
- D. alt

**Câu 2:** Thuộc tính nào dùng để xác định tài nguyên được nhúng vào trang web khi khai báo iframe?
- A. source
- B. src
- C. link
- D. target

## Tóm tắt bài học

Các phần tử `img`, `audio`, `video` được dùng để thêm nội dung đa phương tiện (hình ảnh, âm thanh, video) vào trang web. Phần tử `iframe` dùng để khai báo nhúng tệp HTML hoặc tài nguyên web khác vào văn bản HTML đang soạn.
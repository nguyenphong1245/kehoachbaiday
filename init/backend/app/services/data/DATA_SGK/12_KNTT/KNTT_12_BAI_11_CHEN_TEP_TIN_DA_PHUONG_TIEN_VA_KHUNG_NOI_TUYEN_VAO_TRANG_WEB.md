Tôi muốn uống một cốc  ngay bây giờ.

```

#### a) Đoạn mã
#### b) Kết quả hiển thị trên trình duyệt

**Hình 11.1. Chèn ảnh bằng thẻ ``**

Với thẻ ``, trình duyệt sẽ phải tải ảnh lên trước khi hiển thị trên trang web. Do vậy, khi chèn hình ảnh vào trang web, ta cần quan tâm tới dung lượng của tệp hình ảnh vì dung lượng lớn sẽ làm việc hiển thị hình ảnh trên trang web gặp khó khăn nếu tốc độ của mạng chậm.

Trong các thuộc tính của thẻ ``, thuộc tính `src` là bắt buộc; để chỉ đường dẫn tới tệp ảnh. Ngoài ra, thuộc tính quan trọng khác là `alt` nên được sử dụng kèm để cung cấp văn bản thay thế khi việc hiển thị ảnh bị lỗi. Văn bản thay thế cần có tác dụng giúp người đọc hình dung ra nội dung bức ảnh. Đoạn mã để chèn ảnh có thể như sau:

```html



Tải biểu mẫu xin nhập học:

```

### Hình ảnh mô tả
- Hình 11.2a thể hiện kết quả khi có tệp `pdffiles.png` trong thư mục `images`.
- Hình 11.2b thể hiện kết quả trong trường hợp không có tệp.

## Ví dụ minh họa
Khi sử dụng thuộc tính `alt` với trình duyệt Google Chrome, kết quả sẽ như sau:

```html
Tải biểu mẫu xin nhập học:

```

## Bài tập và câu hỏi
1. Thẻ `` chỉ dùng khi chèn ảnh jpg vào trang web có đúng không?
2. Hãy nêu một số trường hợp có thể xảy ra lỗi khi hiển thị ảnh.

## Kích thước ảnh
Để thiết lập kích thước cho ảnh, ta sử dụng các thuộc tính `width`, `height` cho thẻ ``. Các thuộc tính này cho biết kích thước hiển thị ảnh bằng pixel. Khi sử dụng các thuộc tính này, trình duyệt sẽ giữ đúng không gian trong bố cục khi hình ảnh đang tải, giúp hiển thị nhanh hơn. Nếu chỉ sử dụng một trong hai thuộc tính (width hoặc height), chiều còn lại sẽ được tính toán để hiển thị theo tỉ lệ của ảnh gốc.

### Ví dụ về kích thước ảnh
Hình 11.3 thể hiện kết quả khi chèn ảnh hình trái tim `heart.png` có chiều rộng 262 pixel và chiều dài 257 pixel với các giá trị thuộc tính khác nhau:

```html



```

Để chèn video hoặc âm thanh vào trang web, ta sử dụng thẻ `` và ``. Hai thẻ này được hỗ trợ trong hầu hết các trình duyệt; tuy nhiên định dạng của các tệp tin đa phương tiện có thể sử dụng vẫn phụ thuộc vào trình duyệt.

Hai định dạng tệp video phổ biến nhất là mp4 và webm. Mp4 chạy được trực tiếp trên hầu hết các trình duyệt.

Ba định dạng tệp âm thanh phổ biến được hỗ trợ bởi hầu hết trình duyệt hiện tại là mp3, wav và ogg.

Để chèn tệp video hay âm thanh vào trang web, ta sử dụng thẻ `` hoặc ``:
```html
<video[audio] thuộc_tính="giá_trị_thuộc_tính"></video[audio]>
```

Tương tự như thẻ ``, thẻ `` cũng có các thuộc tính cơ bản như `src`, `width`, `height`. Ngoài ra còn có các thuộc tính khác như:

- **controls**: là thuộc tính boolean; không cần có giá trị, để trình duyệt hiển thị các thành phần điều khiển như nút phát/tạm dừng, điều khiển âm lượng. Thuộc tính này nên được sử dụng để có thể điều khiển trong quá trình phát tin đa phương tiện.

- **autoplay**: là thuộc tính boolean; không cần có giá trị, cho phép trình duyệt chạy video ngay khi hiển thị. Tuy nhiên, một số trình duyệt như Google Chrome thường không cho video chạy ngay khi hiển thị hoặc có thể chạy ngay khi hiển thị nếu có thuộc tính `muted` không phát tiếng.

- **poster**: cung cấp đường dẫn đến tệp ảnh; dùng để hiển thị khi chưa chạy video.

Thẻ `` không có thuộc tính `width`, `height` và `poster`.

Trong trường hợp có nhiều video hoặc nhiều tệp âm thanh tương ứng với các định dạng khác nhau, ta có thể sử dụng thẻ `` trong cặp thẻ `` hay `` để định các loại định dạng khác nhau. Trình duyệt sẽ tự động tìm và hiển thị tệp tin với định dạng mà nó hỗ trợ.

### Ví dụ:
```html

Trình duyệt của bạn không hỗ trợ HTML video.



&#x3C;iframe src="CLB.html" width="600" height="400">
```
Khi đó trình duyệt sẽ hiển thị trang web `iframe.html` như Hình 11.4.

**Lưu ý**: Các phần tử iframe thường dùng kết hợp với thẻ `` để tạo liên kết và hiển thị nội dung bằng cách thêm thuộc tính target cho thẻ `` để chỉ định nơi mở tài liệu được liên kết.

### Hình ảnh mô tả
**Hình 11.4**: Ví dụ khung nội tuyến

Thẻ `` sử dụng để chèn một trang web hoặc một tài nguyên web vào trong một trang web khác.

### Bài tập và câu hỏi
Viết các câu lệnh để tạo hai khung nội tuyến có kích thước bằng nhau; hiển thị song song (theo phương ngang) trên trang web.

## 4. THỰC HÀNH CHÈN TỆP ĐA PHƯƠNG TIỆN VÀ KHUNG NỘI TUYẾN

### Nhiệm vụ 1: Chèn tệp ảnh
**Yêu cầu**: Tạo hai trang `the_thao.html` và `nghe_thuat.html` và chèn hai loại ảnh minh họa.

**Hướng dẫn**:
- Tạo trang `the_thao.html` và chèn một ảnh bằng thẻ `&#x3C;img>`.
- Chuẩn bị: Tạo thư mục `images` trong thư mục chứa các bài tập thực hành; sao chép một ảnh hoạt động thể thao của trường lớp vào thư mục đó (chẳng hạn tệp `thethao.png`).
- Chèn ảnh đã chuẩn bị vào trang web:
```html
&#x3C;img src='images/thethao.png' alt='Hoạt động của các CLB thể thao'>



```

### Bước 3:
Tạo hai vị trí đặt liên kết tương ứng với hai lựa chọn là câu lạc bộ thể thao hoặc câu lạc bộ nghệ thuật và đặt liên kết bằng thẻ `` với thuộc tính target là mã định danh của khung nhìn vừa tạo.
```html
Câu lạc bộ Thể thao
Câu lạc bộ Nghệ thuật
```

- Lưu ý: Thứ tự hiển thị là thứ tự các đoạn mã lệnh; để các lựa chọn câu lạc bộ hiển thị phía trên cần viết câu lệnh trong Bước 3 ở trên câu lệnh trong Bước 2.

----

# LUYỆN TẬP

1. Cho ảnh có kích thước gốc là 720 x 450 pixel. Chèn ảnh vào trang web bằng câu lệnh:
```html
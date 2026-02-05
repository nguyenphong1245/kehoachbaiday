Nội dung hiển thị tại vị trí đặt liên kết
```
Trong đó URL là địa chỉ (đường dẫn) tham chiếu tới tài liệu được liên kết. Thuộc tính `href` dùng để cung cấp địa chỉ của trang web hay tài nguyên được liên kết (URL) tới. Đường dẫn URL phải được nằm trong cặp dấu nháy kép. Phần lớn các liên kết trỏ tới một tài liệu HTML khác; nhưng ta cũng có thể trỏ tới một hình ảnh, một tệp âm thanh hoặc video.

Có hai loại URL chính là đường dẫn tuyệt đối và đường dẫn tương đối.

- **Đường dẫn tuyệt đối**: Cung cấp một địa chỉ đầy đủ bao gồm cả giao thức (http:// hoặc https://), tên miền (domain name) và tên đường dẫn chi tiết nếu cần. Khi sử dụng liên kết trên mạng Internet (mà tài liệu không nằm trên máy chủ của mình), ta cần phải sử dụng đường dẫn tuyệt đối. Ví dụ: `href="https://www.nxbgd.vn"`. Đôi khi đường dẫn tuyệt đối rất dài và khó nhìn; ta vẫn cần để một cách chính xác.

### Ví dụ minh họa
```html
Truy cập vào Example



Sách điện tử Kết nối tri thức với cuộc sống



Giới thiệu về trang web
```

2. **Liên kết tới trang web thuộc thư mục khác, dưới một cấp:**
Đường dẫn đến trang web khác thuộc thư mục dưới một cấp gồm tên thư mục và tên tệp được phân cách bằng dấu `/`. Ví dụ tạo liên kết từ trang `index.html` tới trang `bai_tap_1.html` như sau:
```html
Bài tập 1
```

3. **Liên kết tới trang web thuộc thư mục khác, dưới hai (hay nhiều) cấp:**
Tương tự, đường dẫn gồm tên các thư mục và tên tệp cần được liên kết theo thứ tự từ trên xuống. Mỗi cấp thư mục hoặc tệp tin được phân cách bởi dấu `/`. Ví dụ: tạo liên kết từ trang `index.html` tới trang `bai_tap/on_tap.html` như sau:
```html
Bài tập ôn tập
```

4. **Liên kết tới trang web nằm ở thư mục mức trên:**
Trong trường hợp trang web liên kết tới nằm ở thư mục mức trên, ta sử dụng ký tự `../` trong đường dẫn; tức là chỉ định "trở lại thư mục trên một mức" của thư mục chứa tệp có liên kết. Số cụm `../` trong đường dẫn tương ứng với số mức quay trở lại thư mục ở mức trên.

**Ví dụ minh họa:**
- Liên kết tới trang cùng thư mục:
```html
Giới thiệu về trang web
```
- Liên kết tới trang thuộc thư mục khác:
```html
Bài tập 1
```
- Liên kết tới trang thuộc thư mục nhiều cấp:
```html
Bài tập ôn tập
```
- Liên kết tới trang ở thư mục mức trên:
```html
Quay lại trang giới thiệu



Quay lại trang chủ
```

### Liên kết đến vị trí khác trong cùng trang
Ngoài việc liên kết tới trang web hay tài liệu khác, ta có thể tạo liên kết tới một vị trí cụ thể trong cùng trang web. Để tạo liên kết trong cùng trang, ta thực hiện hai bước:
1. Tạo phần tử HTML có thuộc tính `id` nằm tại vị trí được liên kết đến.
2. Tạo liên kết tới phần tử trên.

Việc thiết lập thuộc tính `id` cho thẻ HTML tại vị trí cần liên kết giống như việc cắm cờ trong tài liệu để có thể quay lại dễ dàng. Để là vị trí đích, thuộc tính `id` cần được đặt tên duy nhất (chỉ xuất hiện duy nhất một lần trong toàn bộ trang web) và được gọi là mã định danh đoạn.

Để liên kết tới phần tử vừa tạo, ta thiết lập thuộc tính `href` như sau: `href="#mã_định_danh_đoạn"`.

### Ví dụ
Hai câu lệnh dưới đây sẽ tạo một bảng với `id` là `Thong_tin` và đặt liên kết tới bảng đó:

```html
|   |
| - |

Thông tin chi tiết
```

### Tạo liên kết cho hình ảnh
Để tạo liên kết tới hình ảnh, ta cần hiển thị ảnh trong trang web với thẻ ``:

```html

```

Trong đó, đường dẫn tới tệp ảnh cũng sử dụng đường dẫn tuyệt đối hoặc đường dẫn tương đối như trên. Với website có cấu trúc như Hình 10.1, trong trang `index.html`, ta đặt hình ảnh Mặt Trời được lưu trong tệp có địa chỉ `images/sun.png` và tạo đường liên kết từ ảnh tới trang `thong_tin.html` thì đoạn mã có dạng như sau:

```html

```

Từ một vị trí trong một trang web, ta có thể tạo liên kết tới trang web bất kỳ trên Internet, tới các trang ở trên cùng máy chủ hay liên kết tới những vị trí khác trong cùng trang.

## Bài tập và câu hỏi
Viết một đoạn mã HTML để hiển thị một danh sách không có thứ tự trong tệp `index.html`. Danh sách gồm ba mục: bài tập 1, bài tập 2 và ôn tập. Ba mục này liên kết tới ba trang tương ứng với ba tệp `bai_tap_1.html`, `bai_tap_2.html` và `bai_tap_on_tap.html`.

```html
- Bài tập 1
- Bài tập 2
- Ôn tập



```
**Bước 3:** Thêm liên kết cho dòng "Theo dõi lịch hoạt động các CLB Thể thao"
```html
Theo dõi lịch hoạt động các CLB Thể thao
```

## Nhiệm vụ 2: Tạo liên kết sang trang khác
### Yêu cầu:
Bổ sung vào tệp thông tin html những thông tin về các câu lạc bộ và đặt đường liên kết từ trang chủ đến trang thông tin này:

### Hướng dẫn:
**Bước 1:** Trong cùng thư mục với tệp CLB.html, tạo tệp thong_tin.html và thêm nội dung giới thiệu thông tin về các câu lạc bộ.
**Bước 2:** Tạo liên kết bằng đường dẫn tương đối đến tệp này (đoạn mã viết trong tệp CLB.html).
```html
Thông tin của các CLB
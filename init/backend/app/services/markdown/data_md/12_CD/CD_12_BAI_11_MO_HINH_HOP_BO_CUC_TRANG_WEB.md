# BÀI 11: MÔ HÌNH HỘP, BỐ CỤC TRANG WEB

Học xong bài này, em sẽ:
- Mô tả được mô hình hộp trong trình bày phần tử HTML.
- Trình bày được cách hiển thị phần tử theo khối, theo dòng.
- Nhận diện được các thành phần cơ bản trong bố cục trang web.

Em hãy truy cập trang chủ của các website: https://moet.gov.vn, https://tienphong.vn.
Theo em, bố cục của hai trang web này có giống nhau không?

## Mô hình hộp trong trình bày phần tử HTML

Các phần tử trong văn bản HTML được trình bày trên trình duyệt web theo mô hình hộp (box model) (Hình 1). Theo đó, mỗi phần tử khi được trình bày có cấu trúc logic gồm cách hộp chữ nhật xác định các vùng nội dung và vùng đường viền:

| Vùng                | Mô tả                                      |
|---------------------|--------------------------------------------|
| Vùng lề (Margin)    | Ngăn cách nhau giữa vùng nội dung và vùng đường viền. |
| Vùng đường viền (Border) | Bao quanh vùng nội dung.                  |
| Vùng đệm (Padding)  | Giúp tách nội dung và đường viền khi hiển thị trên màn hình trình duyệt web. |
| Vùng nội dung (Content) | Chứa nội dung thực tế của phần tử.       |

Hình 1. Cấu trúc logic của mô hình hộp trong trình bày phần tử HTML.

Thông thường, các trình duyệt web tự động căn chỉnh để toàn bộ các phần tử được khai báo trong văn bản HTML hiển thị đầy đủ trên màn hình trình duyệt web. Tuy vậy, hoàn toàn có thể điều chỉnh kích cỡ các vùng hiển thị này bằng cách thiết lập giá trị phù hợp cho các thuộc tính định dạng CSS.

### Bảng 1. Một số thuộc tính định dạng CSS cho các vùng hiển thị của mô hình hộp

| Thuộc tính CSS      | Mô tả                                      |
|---------------------|--------------------------------------------|
| padding             | Xác định kích thước vùng đệm              |
| border-style        | Xác định kiểu trình bày đường viền bao quanh |
| margin              | Xác định kích thước vùng lề               |
| width               | Xác định chiều rộng vùng nội dung         |
| height              | Xác định chiều cao vùng nội dung          |

----

Bản in thử.



p { margin: 50px; }

Đoạn văn cách lề 50 pixel

```

Hình 2a. Ví dụ sử dụng mô hình hộp
Hình 2b. Kết quả khi mở văn bản HTML ở Hình 2a bằng trình duyệt web

# Ví dụ 2
Trong văn bản HTML ở Hình 3a có khai báo thuộc tính định dạng kích thước vùng đệm và đường viền của phần tử `p`; kết quả hiển thị trên màn hình trình duyệt web như ở Hình 3b.

```html

.custom-border {
padding: 300px;
border-style: solid;
}

Sử dụng mô hình hộp để định dạng phần tử p



.block {display: block;}  /* Hiển thị theo khối */
.inline {display: inline;} /* Hiển thị theo dòng */



# Xác định vị trí tuyệt đối

region {padding: 20px; border-style: solid;}
header {background-color: Lightcyan;}
navigation menu {background-color: Lightgray; height: 50px;}
content {background-color: lightsalmon; height: 300px;}
footer {background-color: Lightgray;}

# Phần đầu trang
Thanh điều hướng

Phần nội dung

Phần chân trang



file:/lIcauzhtml
Họ tên
Địa chỉ
Đồng   Huỷ bỏ
```
Hình

Theo mặc định, các phần tử `input` được hiển thị theo khối nên khi khai báo các phần tử `input` trong văn bản HTML không cần xác định thuộc tính `display` mà các điều khiển trên biểu mẫu vẫn hiển thị đúng như yêu cầu.

b) Để hiển thị như yêu cầu cần định dạng các `label` được hiển thị theo khối bằng khai báo định dạng:
```css
label {
display: block;
}
```
Phần `body` của văn bản HTML khai báo như sau:
```html

Họ tên

Địa chỉ



```

c) Để hiển thị như yêu cầu cần định dạng các label được hiển thị theo khối bằng cách khai báo:

```css
label {
display: block;
}
```

Phần body của văn bản HTML khai báo như sau:

```html

Họ tên

Địa chỉ

```

d) Theo mặc định, các phần tử input được hiển thị theo dòng nên cần khai báo định dạng hiển thị theo khối cho hai ô text nhập dữ liệu.

```css
.bl {
display: block;
}
```

Phần body của văn bản HTML khai báo như sau:

```html

Họ tên

Địa chỉ
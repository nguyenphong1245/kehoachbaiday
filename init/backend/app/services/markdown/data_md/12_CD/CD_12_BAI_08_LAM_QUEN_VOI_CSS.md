# BÀI 8: LÀM QUEN VỚI CSS

Học xong bài này, em sẽ:
- Nêu được mục đích sử dụng CSS.
- Mô tả được bộ chọn phần tử và cách áp dụng CSS.
- Trình bày được một số thuộc tính định dạng CSS.

Theo em, làm thế nào để trình bày các đoạn văn, tiêu đề, nhãn trong trang web có cùng màu chữ?

## Bảng định dạng CSS

Bảng định dạng (Cascading Style Sheets - CSS) là ngôn ngữ được sử dụng để khai báo kiểu trình bày các tử HTML trong trang web. CSS thường gồm một số phần quy tắc định dạng. Mỗi quy tắc định dạng minh họa ở Hình gồm bộ chọn (selector) và các khai báo thuộc tính CSS (css properties) để xác định kiểu trình bày cho phần tử - ví dụ: màu sắc, phông chữ, kích cỡ, đường viền.

Sử dụng CSS giúp tách biệt khai báo nội dung với định dạng và trang trí trang web. Với sự tách biệt như vậy, khai báo CSS dễ dàng được chỉnh sửa, tái sử dụng. Sử dụng CSS còn cho phép nhiều trang web hay toàn bộ website cùng dùng chung quy tắc định nhằm tạo sự thống nhất trong trình bày.

Trình duyệt web áp dụng CSS bằng cách chọn các phần tử trong văn bản HTML khớp với bộ chọn trong CSS và sử dụng các quy tắc định dạng tương ứng để trình bày phần tử.

Phiên bản đầu tiên CSS1 được công bố vào năm 1996. Cho đến nay, CSS đã cập nhật và hoàn thiện thêm một số phiên bản. Trong quyển sách này, phiên bản CSS3 được sử dụng để minh họa khai báo CSS.

## Khai báo bộ chọn phần tử và áp dụng CSS

Bộ chọn phần tử thường được dùng để áp dụng CSS cho một hoặc nhiều phần tử cụ thể trong văn bản HTML nhằm tạo sự nhất quán trong trình bày, ví dụ: trình bày chữ in nghiêng cho các đoạn văn bản trên trang web. Với mỗi phần tử HTML, CSS định nghĩa một bộ chọn tương ứng và đặt tên theo tên phần tử đó.



h1 {color: red;}
p {color: blue;}

# Tiêu đề mục 1

Đoạn văn 1

# Tiêu đề mục 2

Đoạn văn 2

```

Hình 3a. Ví dụ khai báo internal CSS và áp dụng bộ chọn phần tử.

Hình 3b. Kết quả khi mở văn bản HTML ở Hình 3a bằng trình duyệt web.

## Khai báo external CSS
Khai báo external CSS thường được sử dụng khi cần áp dụng chung bảng định dạng CSS cho nhiều văn bản HTML. Các quy tắc định dạng được ghi lưu dưới dạng tệp có phần mở rộng `.css`. Để áp dụng external CSS, trong nội dung phần `` của văn bản HTML, cần khai báo tham chiếu đến tệp CSS có dạng:

```html



# CSS

# Màu nền của Heading 1 tô màu vàng

Nội dung đoạn văn có màu đỏ, in đậm

```

Hình 4a. Ví dụ khai báo và áp dụng quy tắc định dạng external CSS

```css
file {
color: red;
font-weight: bold;
background-color: yellow;
}
```

Hình 4b. Tệp external CSS được áp dụng
Hình 4c. Kết quả khi mở văn bản HTML ở Hình 4a bằng trình duyệt web

Trong trường hợp một số phần tử có các khai báo CSS giống nhau, có thể viết gộp nhiều bộ chọn để không phải khai báo lặp lại thuộc tính CSS nhiều lần cho từng phần tử. Khi đó, bộ chọn gồm danh sách các phần tử, ngăn cách nhau bởi dấu phẩy.

## Ví dụ 4

Các bộ chọn `p`, `h1` và `h2`, `h3` cùng có chung quy tắc định dạng nên được viết gộp như ở Hình 5.

```css
p, h1 {
color: blue;
font-size: 20px;
}
h2, h3 {
background-color: yellow;
font-family: Verdana;
}



# CSS

h1 {color: red;}  /* file Illcolorhtml */
h2 {color: blue;}

# Heading 1 có màu xanh

# Heading 2 có màu xanh

Đoạn văn có màu đỏ

```

**Hình 6a.** Ví dụ khai báo CSS định dạng màu
**Hình 6b.** Kết quả khi mở văn bản HTML ở Hình 6a bằng trình duyệt web

## Thuộc tính background-color
Thuộc tính `background-color` định dạng màu nền, áp dụng được cho tất cả phần tử, được khai báo như sau:

```css
background-color: Màu;
```

### Ví dụ 6
Văn bản HTML trong Hình 7a sẽ trình bày trang web với nền màu xanh lơ khi hiển thị trên màn hình trình duyệt web (Hình 7b).

```html

# CSS

body {background-color: cyan;}  /* file lllbackground-colorhtml */



# CSS

{font-family: Times New Roman;}
p {font-size: 20px;}

Định dạng phông và kích cỡ chữ

```

- **Hình 8a.** Ví dụ khai báo CSS định dạng phông chữ; cỡ chữ
- **Hình 8b.** Kết quả khi mở văn bản HTML ở Hình 8a bằng trình duyệt web.

## c) Thuộc tính định dạng đường viền

### Thuộc tính border-style
- Xác định kiểu trình bày đường viền của phần tử, được khai báo như sau:
```
border-style: Kiểu trình bày;
```

### Các kiểu trình bày
- CSS quy định cụ thể các kiểu trình bày. Một số kiểu trình bày thông dụng gồm:
- **dotted:** đường viền là những dấu chấm liền nhau.
- **solid:** đường viền là một đường dậm liền nét.

### Thuộc tính border-color
- Xác định màu đường viền của phần tử, được khai báo như sau:
```
border-color: Màu;
```
- Lưu ý: Định dạng thuộc tính border-color chỉ được áp dụng khi thuộc tính border-style được khai báo.



Ví dụ 8. Văn bản HTML trong Hình 9a trình bày đường viền màu đỏ, nét liền đậm bao quanh phần tử p khi hiển thị trên màn hình trình duyệt web (Hình 9b)

# Đường viền

p {border-style: solid; border-color: red;}

Đường viền màu đỏ nét đậm

Hình 9a. Ví dụ khai báo CSS định dạng đường viền
Hình 9. Kết quả khi mở văn bản qua HTML ở Hình 9a bằng trình duyệt web

Em hãy soạn văn bản HTML có hai đoạn văn bản được tạo bởi phần tử p. Khai báo và áp dụng internal CSS để trình bày trang web có nền màu xanh lơ (cyan); đoạn văn bản có chữ màu đỏ, phông chữ Arial, cỡ chữ 15 pixel. Em hãy chuyển các khai báo internal CSS trong mục Luyện tập thành khai báo external CSS ghi lưu với tên tệp styles.css và tạo mới văn bản HTML để áp dụng bảng định dạng styles.css này.

Mỗi phát biểu sau đây về CSS là đúng hay sai?
a) Sử dụng CSS giúp tách biệt khai báo nội dung với định dạng và trang trí trang web.
b) Để áp dụng CSS, trong văn bản HTML phải khai báo tham chiếu đến tệp CSS.
c) Sử dụng external CSS giúp cho nhiều trang web trong một website có thể dùng chung kiểu định dạng và trang trí.
d) Khai báo CSS sử dụng bộ chọn phần tử: p {color: red; font-size: 20px;} là đúng cú pháp.

Tóm tắt bài học
CSS dùng để khai báo quy tắc định dạng trình bày các phần tử HTML trên trình duyệt web. Bộ chọn phần tử thường được dùng để áp dụng CSS cho tất cả các phần tử cùng loại trong văn bản HTML nhằm tạo sự nhất quán trong trình bày. Hai cách khai báo CSS thường được sử dụng là internal CSS và external CSS. CSS định nghĩa một số thuộc tính để định dạng trình bày: màu sắc, phông chữ, cỡ chữ, đường viền.
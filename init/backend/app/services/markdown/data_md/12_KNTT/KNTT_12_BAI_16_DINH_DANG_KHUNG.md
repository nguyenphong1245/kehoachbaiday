# BÀI 76  ĐỊNH DẠNG KHUNG

## SAU BÀI HỌC NÀY EM SẼ:
- Sử dụng được CSS để định dạng khung văn bản, kích thước khung, kiểu đường viền.
- Biết sử dụng CSS cho các bộ chọn khác nhau (id, class).

Trên một trang web thường có rất nhiều phần tử cùng loại (cùng tên thẻ). Ví dụ thẻ `p` sẽ tương ứng với rất nhiều phần tử của trang web. Một định dạng với bộ chọn `p` sẽ áp dụng cho tất cả các thẻ `p`. Nếu muốn phân biệt các thẻ `p` với nhau và muốn tạo ra các CSS để phân biệt các thẻ `p` thì có thể thực hiện được không?

## 1. PHÂN LOẠI PHẦN TỬ KHỐI VÀ NỘI TUYẾN

### Hoạt động 1: Tìm hiểu và phân biệt phần tử khối và phần tử nội tuyến
Quan sát cách tô màu nền của hai phần tử trên trang web trong Hình 16.1, em có nhận xét gì?

> Thư Bác Hồ gửi học sinh:
>
> Non sông Việt Nam có trở nên tươi đẹp hay không, dân tộc Việt Nam có bước tới đài vinh quang để sánh vai với các cường quốc năm châu được hay không; chính là nhờ một phần lớn ở công học tập của các cháu.

#### Hình 16.1. Nội dung trang web

Các thẻ (hay phần tử) HTML được chia làm hai loại, khối (block level) và nội tuyến (inline level).

Các phần tử khối thường bắt đầu từ đầu hàng và kéo dài suốt chiều rộng của trang web. Trong ví dụ ở Hình 16.1, dòng chữ "Thư Bác Hồ gửi học sinh" được thể hiện dạng khối.

Các phần tử nội tuyến là các phần tử nhúng bên trong một phần tử khác. Trong ví dụ ở Hình 16.1, cụm từ "Việt Nam" là một phần tử nội tuyến, được nhúng trong phần tử `p`.

#### Bảng 16.1. Phân loại phần tử CSS

| Phần tử loại khối                          | Phần tử loại nội tuyến                          |
|--------------------------------------------|------------------------------------------------|
| h1, h2, h3, h4, h5, h6, p, div, address, nav, article, section, aside, form, header, footer, table, hr, ol, ul, li, canvas | b, span, a, img, em, strong, sub, sup, var, samp, cite, dfn, kbd, pre, code, q, i, u, del, ins, mark, br, label, textarea, input, script |

Chúng ta có thể thay đổi loại phần tử HTML bằng thuộc tính `display`. Các giá trị của thuộc tính này bao gồm `block`, `inline`, `none`. Giá trị `none` sẽ làm ẩn (không hiển thị) phần tử này trên trang web. Ví dụ CSS sau sẽ đổi loại phần tử `span` từ dạng mặc định là inline sang block:

```css
span {
display: block;
}
```



span {
display: block;
text-indent: 2em;
color: red;
}
{color: blue;}

Kết quả áp dụng mẫu CSS trên được minh hoạ trong Hình 16.2.

Kiểu thể hiện
Đây là phần đầu
dòng thứ nhất
Đay7là phân đẩu
dòng tiếp theo

dongthu nhat
<spanvdòng tiếp="" theo="" nữa="" ispan="">
dongtỉêp theo
đây là phần cuối của đoạn </spanvdòng>

dòng tiép theo nũa

đây là phân cuoi của đoạn
Mã html
b) Kết quả hiển thị trên trình duyệt
Hình 16.2 Minh hoạ chuyển đổi phần tử nội tuyến sang khối
Các phần tử HTML đều thuộc một trong hai loại khối (block) hoặc nội tuyến (inline). Có thể dùng thuộc tính display để thay đổi loại phần tử.

1. Chiều rộng của các phần tử nội tuyến phụ thuộc vào những yếu tố nào? Có phụ thuộc vào chiều rộng của cửa sổ trình duyệt không?
2. Khẳng định "Chiều rộng của các phần tử khối chỉ phụ thuộc vào kích thước của cửa sổ trình duyệt" là đúng hay sai?

2. THIẾT LẬP ĐỊNH DẠNG KHUNG BẰNG CSS
Trong hoạt động tiếp theo các em sẽ được làm quen với cách định dạng khung; viền cho các phần tử HTML của trang web. Cần phân biệt hai loại phần tử HTML; phần tử khối và phần tử nội tuyến: Với phần tử dạng khối, các khung được xác định với đầy đủ tính chất, còn với các phần tử nội tuyến thì khung chỉ có thể thiết lập mà không có các thông số chiều cao; chiều rộng.

Hoạt động 2: Tìm hiểu cách thiết lập định dạng khung cho các phần tử
Quan sát Hình 16.3 để biết các thông số chính của khung của phần tử HTML để có thể hiểu được cách thiết lập khung; viền bằng CSS.

| Thông số chính của khung | Mô tả                |
|--------------------------|----------------------|
| Viền ngoài               | Lề khung (margin)    |
| Viền trong               | Khung (border)       |
| Phần nội dung           | Chiều cao (height)   |
|                          | Vùng đệm (padding)   |
|                          | Chiều rộng (width)   |

Hình 16.3. Các thông số chính của khung



#  Lịch sử CSS </hl>
Ý tưởng của CSS do kĩ sư Hâkon Wium Lie người Na Uy, thiết lập năm 1994 trong khi làm việc với Tim Berners-Lee tại viện hạt nhân CERN

```

Nếu thiết lập mẫu định dạng như Hình 16.4a cho đoạn mã HTML ở trên thì kết quả nhận được tương tự như Hình 16.4b.

```css
hl {
border: 5px ridge blue;
margin: 20px;
width: 200px;
padding: 10px;
}
em {
border: 2px double red;
}



warning {color: red;} /* chữ màu đỏ cho các đoạn văn bản thuộc lớp warning */
test { /* chữ màu xanh và in đậm cho lớp test */
color: blue;
font-weight: bold;
}

```

Ví dụ đoạn mã HTML sau được áp dụng mẫu CSS ở ví dụ trên thì đoạn văn bản thứ nhất có chữ màu xanh và in đậm; đoạn văn bản thứ hai có chữ màu đỏ.

```html

Thông tin đang test

tin cần warning.



Đoạn chương trình cần kiểm tra

```

Có thể thiết lập các mẫu định dạng với bộ chọn là class, ID hoặc thuộc tính.

### 1. Nêu sự khác biệt cơ bản giữa thuộc tính id và class của các phần tử HTML.

### 2. Mỗi bộ chọn sau có ý nghĩa gì?
- a) `div#bat_dau`
- b) `p.test`
- c) `em#p123`

## 4. THỰC HÀNH

### Nhiệm vụ: Tạo trang web
**Yêu cầu:** Tạo trang web mô tả bảng 16 tên màu cơ bản CSS như Hình 16.5.

**Gợi ý:** Bài thực hành có thể thực hiện theo hai bước:
- **Bước 1:** Thiết lập bảng với nội dung như trong Hình 16.5 nhưng chưa định dạng.
- **Bước 2:** Viết bổ sung các mẫu CSS để định dạng khung đúng như Hình 16.5.



| Tên màu | #hex    | #rgb(r,g,b) | Thể hiện |
| ------- | ------- | ----------- | -------- |
| black   | #000000 | rgb(0,0,0)  |          |




Bước 2 Thiết lập mẫu CSS để tạo khuôn khung, viền cho bảng.
Ví dụ các mẫu định dạng sau:

table {
border: 4px solid magenta;
padding: 5px;
}
td, th, tr {
border: 1px solid blue;
}
td {
border: 1px solid blue;
width: 25%;
}
th {
border: 1px solid blue;
background-color: rgb(255, 255, 0);
}
tr {
border: 1px solid black;
}
caption {
color: red;
font-size: 200%;
font-weight: bold;
border: 4px solid green;
padding: 2px;
margin: 1px;
}

LUYÊN TÂP
1. Phần tử html có thể ẩn đi trên trang web được không? Nếu có thì dùng lệnh CSS gì?
2. Hãy giải thích ý nghĩa định dạng sau:
```css
test test_more {
background-color: red;
}
```

VẬN DỤNG
1. Giả sử nội dung trang web của em có rất nhiều thẻ p; trong đó có ba đoạn mà em thấy quan trọng nhất, kí hiệu các đoạn này là P1, P2, P3. Có cách nào thiết lập định dạng CSS để có thể định dạng P1 khác biệt, P2 và P3 có cùng kiểu và cũng khác biệt không? Tất cả các đoạn còn lại có định dạng giống nhau: Hãy nêu cách giải quyết vấn đề của em.
2. Có thể thiết lập định dạng cho các khung với thông số khung; viền trên; dưới, trái, phải khác nhau được không? Em hãy tìm hiểu và trình bày cách thiết lập định dạng CSS cho các khung, viền như vậy.
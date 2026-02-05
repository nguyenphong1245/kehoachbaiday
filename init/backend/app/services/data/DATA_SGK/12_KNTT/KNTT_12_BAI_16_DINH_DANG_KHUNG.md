# BÀI 76  ĐỊNH DẠNG KHUNG

## SAU BÀI HỌC NÀY EM SẼ:
- Sử dụng được CSS để định dạng khung văn bản, kích thước khung, kiểu đường viền.
- Biết sử dụng CSS cho các bộ chọn khác nhau (id, class,...).

Trên một trang web thường có rất nhiều phần tử cùng loại (cùng tên thẻ). Ví dụ thẻ `p` sẽ tương ứng với rất nhiều phần tử của trang web. Một định dạng với bộ chọn `p` sẽ áp dụng cho tất cả các thẻ `p`. Nếu muốn phân biệt các thẻ `p` với nhau và muốn tạo ra các CSS để phân biệt các thẻ `p` thì có thể thực hiện được không?

## PHÂN LOẠI PHẦN TỬ KHỐI VÀ NỘI TUYẾN
### Hoạt động 1: Tìm hiểu và phân biệt phần tử khối và phần tử nội tuyến
Quan sát cách tô màu nền của hai phần tử trên trang web trong Hình 16.1, em có nhận xét gì?

**Thư Bác Hồ gửi học sinh**
Non sông Việt Nam có trở nên tươi đẹp hay không, dân tộc Việt Nam có bước tới đài vinh quang để sánh vai với các cường quốc năm châu được hay không; chính là nhờ một phần lớn ở công học tập của các cháu:

![Hình 16.1. Nội dung trang web](#)

Các thẻ (hay phần tử) HTML được chia làm hai loại: khối (block level) và nội tuyến (inline level).

Các phần tử khối thường bắt đầu từ đầu hàng và kéo dài suốt chiều rộng của trang web. Trong ví dụ ở Hình 16.1, dòng chữ "Thư Bác Hồ gửi học sinh" được thể hiện dạng khối.

Các phần tử nội tuyến là các phần tử nhúng bên trong một phần tử khác. Trong ví dụ ở Hình 16.1, cụm từ "Việt Nam" là một phần tử nội tuyến, được nhúng trong phần tử `p`.

### Bảng 16.1. Phân loại phần tử CSS
| Phần tử loại khối                     | Phần tử loại nội tuyến                     |
|---------------------------------------|-------------------------------------------|
| h1, h2, h3, h4, h5, h6, p, div, address, nav, article, section, aside, form, header, footer, table, hr, ol, ul, li, canvas | b, span, a, img, em, strong, sub, sup, var, samp, cite, dfn, kbd, pre, code, q, i, u, del, ins, mark, br, label, textarea, input, script |

Chúng ta có thể thay đổi loại phần tử HTML bằng thuộc tính `display`. Các giá trị của thuộc tính này bao gồm `block`, `inline`, `none`. Giá trị `none` sẽ làm ẩn (không hiển thị) phần tử này trên trang web. Ví dụ CSS sau sẽ đổi loại phần tử `span` từ dạng mặc định là `inline` sang `block`.



Đây là phần đầu
dòng thứ nhất
dòng tiếp theo
dòng tiếp theo nữa
đây là phần cuối của đoạn



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



.warning {color: red;} /* chữ màu đỏ cho các đoạn văn bản thuộc lớp warning */
.test { /* chữ màu xanh và in đậm cho lớp test */
color: blue;
font-weight: bold;
}

```

Ví dụ đoạn mã HTML sau được áp dụng mẫu CSS ở ví dụ trên thì đoạn văn bản thứ nhất có chữ màu xanh và in đậm; đoạn văn bản thứ hai có chữ màu đỏ.

```html

Thông tin đang test

tin cần warning.



Đoạn chương trình cần kiểm tra



# Bảng tên màu CSS

## Nội dung lý thuyết
Bảng tên màu CSS là một phần quan trọng trong việc thiết kế giao diện web. Nó giúp lập trình viên dễ dàng sử dụng các màu sắc trong mã nguồn của mình thông qua các tên màu, mã hex và mã RGB.

## Ví dụ minh họa
Dưới đây là bảng tên màu cơ bản trong CSS:

| Tên màu   | #hex      | #rgb(r,g,b)     | Thể hiện          |
|-----------|-----------|------------------|--------------------|
| black     | #000000   | rgb(0,0,0)       | ![black](#000000)  |
| silver    | #C0C0C0   | rgb(192,192,192) | ![silver](#C0C0C0) |
| white     | #FFFFFF   | rgb(255,255,255) | ![white](#FFFFFF)  |
| maroon    | #800000   | rgb(128,0,0)     | ![maroon](#800000) |
| red       | #FF0000   | rgb(255,0,0)     | ![red](#FF0000)    |
| purple    | #800080   | rgb(128,0,128)   | ![purple](#800080) |
| fuchsia   | #FF00FF   | rgb(255,0,255)   | ![fuchsia](#FF00FF)|
| green     | #008000   | rgb(0,128,0)     | ![green](#008000)  |
| lime      | #00FF00   | rgb(0,255,0)     | ![lime](#00FF00)   |
| olive     | #808000   | rgb(128,128,0)   | ![olive](#808000)  |
| yellow    | #FFFF00   | rgb(255,255,0)   | ![yellow](#FFFF00) |
| navy      | #000080   | rgb(0,0,128)     | ![navy](#000080)   |
| blue      | #0000FF   | rgb(0,0,255)     | ![blue](#0000FF)   |
| teal      | #008080   | rgb(0,128,128)   | ![teal](#008080)   |
| aqua      | #00FFFF   | rgb(0,255,255)   | ![aqua](#00FFFF)   |
| orange    | #FFA500   | rgb(255,165,0)   | ![orange](#FFA500) |

### Hình 16.5. Bảng 16 tên màu cơ bản

## Bài tập và câu hỏi
1. Hãy tạo một bảng tương tự như bảng trên với ít nhất 5 màu khác.
2. Giải thích ý nghĩa của mã hex và mã RGB trong CSS.
3. Tại sao việc sử dụng tên màu trong CSS lại quan trọng?

## Hình ảnh mô tả
- Hình 16.5: Bảng tên màu cơ bản trong CSS.

## Bảng biểu
| Tên màu   | #hex      | #rgb(r,g,b)     | Thể hiện          |
|-----------|-----------|------------------|--------------------|
| black     | #000000   | rgb(0,0,0)       | ![black](#000000)  |
| silver    | #C0C0C0   | rgb(192,192,192) | ![silver](#C0C0C0) |
| white     | #FFFFFF   | rgb(255,255,255) | ![white](#FFFFFF)  |
| maroon    | #800000   | rgb(128,0,0)     | ![maroon](#800000) |
| red       | #FF0000   | rgb(255,0,0)     | ![red](#FF0000)    |
| purple    | #800080   | rgb(128,0,128)   | ![purple](#800080) |
| fuchsia   | #FF00FF   | rgb(255,0,255)   | ![fuchsia](#FF00FF)|
| green     | #008000   | rgb(0,128,0)     | ![green](#008000)  |
| lime      | #00FF00   | rgb(0,255,0)     | ![lime](#00FF00)   |
| olive     | #808000   | rgb(128,128,0)   | ![olive](#808000)  |
| yellow    | #FFFF00   | rgb(255,255,0)   | ![yellow](#FFFF00) |
| navy      | #000080   | rgb(0,0,128)     | ![navy](#000080)   |
| blue      | #0000FF   | rgb(0,0,255)     | ![blue](#0000FF)   |
| teal      | #008080   | rgb(0,128,128)   | ![teal](#008080)   |
| aqua      | #00FFFF   | rgb(0,255,255)   | ![aqua](#00FFFF)   |
| orange    | #FFA500   | rgb(255,165,0)   | ![orange](#FFA500) |



# Bài học: Thiết lập mẫu CSS cho bảng

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách thiết lập mẫu CSS để tạo khuôn khung và viền cho bảng. CSS (Cascading Style Sheets) cho phép chúng ta định dạng các phần tử HTML, bao gồm cả bảng, để tạo ra giao diện đẹp mắt và dễ sử dụng.

### Ví dụ các mẫu định dạng CSS cho bảng:
```css

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

```

## Ví dụ minh họa
Hình ảnh mô tả: (Hình ảnh minh họa cho bảng với các định dạng CSS đã thiết lập)

## Bài tập và câu hỏi

### LUYÊN TÂP
1. Phần tử HTML có thể ẩn đi trên trang web được không? Nếu có thì dùng lệnh CSS gì?
2. Hãy giải thích ý nghĩa định dạng sau:
```css
test test_more {background-color: red;}
```

### VẬN DỤNG
1. Giả sử nội dung trang web của em có rất nhiều thẻ ``; trong đó có ba đoạn mà em thấy quan trọng nhất, kí hiệu các đoạn này là P1, P2, P3. Có cách nào thiết lập định dạng CSS để có thể định dạng P1 khác biệt, P2 và P3 có cùng kiểu và cũng khác biệt không? Tất cả các đoạn còn lại có định dạng giống nhau: Hãy nêu cách giải quyết vấn đề của em.
2. Có thể thiết lập định dạng cho các khung với thông số khung; viền trên; dưới, trái, phải khác nhau được không? Em hãy tìm hiểu và trình bày cách thiết lập định dạng CSS cho các khung, viền như vậy.

## Bảng biểu
(Hình ảnh hoặc bảng biểu mô tả các định dạng CSS cho bảng)
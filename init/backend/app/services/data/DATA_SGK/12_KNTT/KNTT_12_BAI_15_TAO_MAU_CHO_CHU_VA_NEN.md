# BÀI 15: TAO MÀU CHO CHỮ VÀ NỀN

## SAU BÀI HỌC NÀY EM SẼ:
Sử dụng được CSS màu để thiết lập màu cho chữ và nền. Các định dạng sau có thiết lập cùng một màu hay không? Em có nhận xét gì về cách thiết lập màu này?
- a) `{color: rgb(128,0,128);}`
- b) `p {color: #800080;}`
- c) `{color: hsl(300,100%,25.1%);}`

## 1. HỆ THỐNG MÀU CỦA CSS

### Hoạt động 1: Tìm hiểu cách biểu diễn màu trong HTML và CSS
Cùng thảo luận và tìm hiểu hệ màu RGB hỗ trợ bởi HTML và CSS.

#### a) Hệ màu RGB
HTML và CSS hỗ trợ hệ màu theo mẫu RGB (R - red, G - green, B - blue). Mỗi màu là một tổ hợp gồm ba giá trị (r, g, b), trong đó mỗi giá trị này là số nguyên nằm trong khoảng từ 0 đến 255, tức là một số 8 bit. Tổng số màu cho phép là 2^8 * 2^8 * 2^8 = 16,777,216 màu.

Mỗi giá trị màu được thiết lập bởi một trong các cách sau:
- `rgb(x-red, x-green, x-blue)`, trong đó x-red, x-green, x-blue có thể nhận các giá trị độc lập từ 0 đến 255.
- `rgb(x-red%, x-green%, x-blue%)`, trong đó các tham số biểu thị giá trị phần trăm của 255.
- Trong hệ đếm hexa (hệ đếm cơ số 16): `#rrggbb`, trong đó rr, gg, bb là giá trị.

| R | 255 | R | 128 | R | 0 |
|---|-----|---|-----|---|---|
| (100%) | (50%) | (0%) | | | |
| G | 255 | G | 128 | G | 0 |
| (100%) | (50%) | (0%) | | | |
| B | 255 | B | 128 | B | 0 |
| (100%) | (50%) | (0%) | | | |

- Màu trắng (white): `rgb(255,255,255)` - `#ffffff`
- Màu xám (gray): `rgb(128,128,128)` - `#808080`
- Màu đen (black): `rgb(0,0,0)` - `#000000`

**Hình 15.1:** Một số hình ảnh tham số màu được thiết lập trong CSS.

#### b) Hệ màu HSL
Một hệ màu khác mà HTML và CSS hỗ trợ là HSL (Hue, Saturation, Lightness). H (Hue) là vòng tròn màu với giá trị từ 0 đến 360. S (Saturation) chỉ độ bão hòa hay...

----

### Bài tập và câu hỏi
1. Hãy cho biết sự khác nhau giữa các cách thiết lập màu trong CSS.
2. Thực hành tạo một trang HTML với các đoạn văn có màu sắc khác nhau sử dụng các phương pháp RGB và HSL.

### Hình ảnh mô tả
- Hình 15.1: Một số hình ảnh tham số màu được thiết lập trong CSS.

### Bảng biểu
| Màu         | RGB                | HEX      |
|-------------|--------------------|----------|
| Trắng       | rgb(255,255,255)   | #ffffff  |
| Xám         | rgb(128,128,128)   | #808080  |
| Đen         | rgb(0,0,0)         | #000000  |




# Bài học: Thiết lập màu sắc trong CSS

## Nội dung lý thuyết
Màu sắc trong CSS có thể được thiết lập thông qua các hệ màu khác nhau, trong đó phổ biến nhất là hệ màu RGB và HSL.

- **HSL** (Hue, Saturation, Lightness):
- **Hue (H)**: Là màu sắc với giá trị từ 0° đến 360°.
- **Saturation (S)**: Là độ bão hòa của màu với giá trị từ 0% đến 100%. Màu sẽ biến mất chỉ còn xám khi độ bão hòa bằng 0%. Ngược lại, màu sẽ đầy đủ nếu độ bão hòa bằng 100%.
- **Lightness (L)**: Là độ sáng với giá trị từ 0% đến 100%. Với 0% chỉ mức độ sáng thấp nhất (màu đen) và 100% là độ sáng lớn nhất (màu trắng).

## Ví dụ minh họa
- Ví dụ về các màu cơ bản trong hệ màu HSL:
- Red: `hsl(0, 100%, 50%)`
- Green: `hsl(120, 100%, 50%)`
- Blue: `hsl(240, 100%, 50%)`
- Yellow: `hsl(60, 100%, 50%)`
- Magenta: `hsl(300, 100%, 50%)`
- Cyan: `hsl(180, 100%, 50%)`

## Bài tập và câu hỏi
1. Các màu cơ bản red, yellow, green, blue, magenta, cyan được thể hiện hàm hsl như thế nào?
2. Trong hệ màu rgb có bao nhiêu màu thuộc màu xám?

## Hình ảnh mô tả
- **Hình 15.2**: Mô hình hệ màu HSL với các tham số Hue, Saturation, Lightness và mô hình vòng tròn màu Hue với trị từ 0° (đỏ) đến 360° (cũng là đỏ), 120° (xanh lá cây), 240° (xanh dương).

## Bảng biểu
| Tên màu  | Mã màu HSL               |
|----------|--------------------------|
| Red      | hsl(0, 100%, 50%)        |
| Green    | hsl(120, 100%, 50%)      |
| Blue     | hsl(240, 100%, 50%)      |
| Yellow   | hsl(60, 100%, 50%)       |
| Magenta  | hsl(300, 100%, 50%)      |
| Cyan     | hsl(180, 100%, 50%)      |

## Hoạt động 2: Tìm hiểu cách thiết lập màu chữ và màu nền trong CSS
Cùng thảo luận về cách thiết lập màu trong các mẫu CSS và trả lời các câu hỏi sau:
1. Cách thiết lập định dạng màu chữ trong CSS như thế nào?
2. Cách thiết lập màu nền cho các phần tử của CSS như thế nào?

### Các thuộc tính trong HTML
- **Thuộc tính `color`**: Dùng để định dạng màu chữ (màu nổi).
- **Thuộc tính `background-color`**: Dùng để định dạng màu nền.



# Bài học: Định dạng màu trong CSS

## Nội dung lý thuyết
Thuộc tính `border` dùng để định dạng màu khung viền quanh phần tử. CSS hỗ trợ định dạng màu chữ bằng thuộc tính `color`, màu nền bằng thuộc tính `background-color` và màu khung viền bằng thuộc tính `border`. Lưu ý: Các thuộc tính định dạng màu chữ và màu nền đều có tính kế thừa; riêng thuộc tính `border` không có tính kế thừa.

### Ví dụ minh họa
Trong mẫu CSS sau, phần tử `h1` được định dạng màu chữ, màu nền và màu của khung viền:
```css
h1 {
color: red;
background-color: lightgreen;
border: 2px solid magenta;
}
```
Trong mẫu CSS sau, định dạng khung viền, màu nền cho phần tử `em`, định dạng màu chữ cho phần tử `p`:
```css
em {
background-color: lightgreen;
border: 1px solid red;
}
p {
color: blue;
}
```
Kết quả áp dụng hai CSS trên có thể như Hình 15.3.

### Hình ảnh mô tả
**Hình 15.3. Kết quả áp dụng CSS định dạng màu**

## Bài tập và câu hỏi
1. Sửa lại CSS trong ví dụ trên, định dạng màu nền và khung viền cho cụm từ "Tim Berners-Lee" với màu khác biệt.
2. Sửa lại CSS trên, định dạng khung viền cho phần tử `p`. Em hãy kiểm tra xem tính chất này có kế thừa cho các phần tử con không.

## Thiết lập bộ chọn là tổ hợp các phần tử có quan hệ
Từ trước đến nay, chúng ta chỉ xem xét các mẫu định dạng CSS với bộ chọn là các phần tử độc lập, riêng biệt. Trong hoạt động này, chúng ta sẽ tìm hiểu các mẫu định dạng với bộ chọn là các phần tử có liên quan đến nhau. Các định dạng này có rất nhiều ứng dụng trên thực tế. Các định dạng này có thể hiểu là được áp dụng trên phần tử với điều kiện nhất định.

### Hoạt động 3
Tìm hiểu cách thiết lập bộ chọn là tổ hợp các phần tử. Quan sát, trao đổi và thảo luận về 4 trường hợp bộ chọn là tổ hợp các phần tử, nêu ý nghĩa và sự khác biệt giữa các trường hợp này: `E`, `F`, `E > F`, `E + F` và `E ~ F`.

### Bảng biểu
**Bảng 15.1** mô tả chi tiết, ý nghĩa và ví dụ áp dụng cho các trường hợp định dạng CSS có dạng là tổ hợp các phần tử có quan hệ với nhau.



#  Lịch sử CSS

Ý tưởng ban đầu của CSS do kĩ sư Håkon Wium Lie, người Na Uy, thiết lập năm 1994 trong khi làm việc với Tim Berners-Lee tại viện hạt nhân CERN.

#  tưởng CSS

riêng, độc lập cho các phần tử HTML của trang web

```

**Hình 15.4. Ví dụ sử dụng bộ chọn E F**

### b) Ví dụ minh họa cho trường hợp E > F
Giả sử định dạng `p em {color: red;}` áp dụng cho văn bản sau: Trong đoạn văn bản này có hai phần tử em; nhưng chỉ phần tử em thứ hai là con trực tiếp của p, do đó định dạng trên chỉ áp dụng cho phần tử em thứ hai (Hình 15.5).

```html

#  Lịch sử CSS

Ý tưởng của CSS do kĩ sư Håkon Lie người Na Uy, thiết lập năm 1994 trong khi làm việc với Tim Berners-Lee tại viện hạt nhân CERN.



# Lịch sử CSS

Ý tưởng của CSS do kĩ sư Hakon Wium Lie, người Na Uy, thiết lập năm 1994 trong khi làm việc với Tim Berners-Lee tại viện hạt nhân CERN.

```

### Kết quả hiển thị trên trình duyệt
Hình 15.6. Ví dụ sử dụng bộ chọn E + F

### Ví dụ minh họa cho trường hợp E ~ F
Với định dạng `em strong {color: red;}`, văn bản sau có hai phần tử `strong` đều nằm phía sau của phần tử `em`; do đó mẫu định dạng trên sẽ áp dụng cho cả hai phần tử `strong` (Hình 15.7).

```html

# Lịch sử CSS

Ý tưởng của CSS do kĩ sư Hakon Wium Lie, người Na Uy, thiết lập năm 1994 trong khi làm việc với Tim Berners-Lee tại viện hạt nhân CERN.



# 3. THỰC HÀNH

## Nhiệm vụ: Tạo trang HTML và định dạng CSS

### Yêu cầu:
Thiết lập trang HTML và định dạng CSS để thể hiện văn bản sau chính xác và đẹp như sau:

### LỢI ÍCH CỦA CSS
Sử dụng CSS mang lại rất nhiều tiện ích và hiệu quả trong công việc. Sau đây là một vài nguyên nhân chính khi sử dụng mẫu định dạng CSS để trình bày trang web:
- **Trình bày chính xác.** Có thể điều khiển chính xác cách trang web hiển thị cũng như khi in ra máy in.
- **Tiết kiệm công sức đáng kể.** Bạn có thể thay đổi lại hoàn toàn cách trang trí, định dạng; trình bày một trang hoặc cả một website chỉ bằng việc chỉnh sửa và thay đổi một tệp CSS duy nhất.
- **Điều khiển hiển thị đa dạng.** CSS cho phép điều khiển định dạng trên các phương tiện máy tính khác nhau; từ máy tính màn hình lớn cho đến các thiết bị di động nhỏ.
- **Tiếp cận trình bày theo ngữ nghĩa văn bản.** CSS cho phép trình bày nội dung không theo cú pháp logic giống như các ngôn ngữ lập trình bình thường mà cho phép thay đổi, điều khiển việc trang trí, trình bày theo ngữ nghĩa ngôn ngữ của nội dung văn bản.

### Hướng dẫn:
**Bước 1.** Nhập văn bản trên thành tệp HTML: Có thể thiết lập các phần tử HTML như sau:
- Bốn ý chính của lợi ích CSS được trình bày bằng cặp thẻ `- `.
- Các câu đầu in đậm của các ý chính dùng thẻ ``.
- Các cụm từ in nghiêng dùng thẻ ``.

**Bước 2.** Viết ra các yêu cầu trình bày trang web, ví dụ:
- Tiêu đề chữ màu đỏ.
- Nội dung chính dùng dấu đầu dòng; không có thứ tự để trình bày.
- Các dòng của danh sách có chiều cao dòng bằng 1,5 bình thường.
- Dòng chữ nhấn mạnh đầu dòng để màu xanh đậm.
- Các cụm từ nhấn mạnh bên trong các dòng dùng màu đỏ, chữ nghiêng.

**Bước 3.** Thiết lập các mẫu định dạng CSS.
```css

h1 {color: red;}
li {height: 1.5;}
strong {color: blue;}
em {color: red;}

```

## LUYỆN TẬP
1. Thiết lập hệ màu cơ bản (17 màu của CSS2.1) theo bộ ba tham số R, G, B.
2. Khi nào thì các mẫu định dạng E1 và E2 > F có tác dụng như nhau?

## VÂN DUNG
1. Tìm ví dụ và giải thích ý nghĩa cho các mẫu định dạng CSS tổng quát như sau:
- a) E1 E2 E3.
- b) E1 > E2 > E3.
2. Tìm ví dụ và giải thích ý nghĩa cho các mẫu định dạng CSS tổng quát như sau:
- a) E+F+G.
- b) E > F+G.
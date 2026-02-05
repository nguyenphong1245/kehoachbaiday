# BÀI 14: ĐỊNH DẠNG VĂN BẢN BẰNG CSS

## SAU BÀI HỌC NÀY EM SẼ:
- Sử dụng được CSS để định dạng văn bản, phông chữ.
- Quan sát đoạn văn bản được thể hiện trên một trang web trong Hình 14.1. Em có nhận xét gì về các định dạng liên quan đến phông chữ của văn bản?

### Lịch sử CSS
Ý tưởng của CSS do kỹ sư Hakon Wium Lie lập ra năm 1994 khi làm việc với Tim Berners-Lee tại CERN.

![Hình 14.1. Đoạn văn bản trên trang web](#)

## 1. ĐỊNH DẠNG VĂN BẢN BẰNG CSS
### Hoạt động 1: Tìm hiểu các mẫu định dạng CSS định dạng văn bản
Các định dạng văn bản trong Hình 14.1 đều liên quan đến định dạng kí tự gồm phông chữ, màu chữ và kiểu chữ. Các thuộc tính của CSS liên quan bao gồm định dạng phông chữ (text font), màu chữ (text color) và dòng văn bản (text line). Quan sát và thảo luận để hiểu rõ hơn các mẫu định dạng CSS này:

### a) CSS định dạng phông chữ
CSS hỗ trợ thiết lập các thuộc tính liên quan đến chọn phông (font-family), chọn cỡ chữ (font-size), chọn kiểu chữ (font-style), độ dày nét chữ (font-weight) và nhiều thuộc tính khác.

- **font-family**: CSS cho phép thiết lập mẫu định dạng chọn phông sử dụng thuộc tính font-family. Trên máy tính có thể cài đặt nhiều phông chữ khác nhau; mỗi phông chữ có một tên riêng. Tuy nhiên, các phông chữ có thể được chia làm năm loại sau:
- **serif** (chữ có chân)
- **sans-serif** (chữ không chân)
- **monospace** (chữ có chiều rộng đều nhau)
- **cursive** (chữ viết tay)
- **fantasy** (chữ trừu tượng)

![Hình 14.2. Font-family](#)

### Ví dụ:
Mẫu CSS sau cho biết cách thiết lập phông chữ cho các thẻ h1, lựa chọn các phông ưu tiên theo thứ tự Times, Times New Roman, Tahoma; cuối cùng là một phông loại có chân bất kỳ.
```css
h1 {
font-family: Times, 'Times New Roman', Tahoma, serif;
}
```

### Bài tập và câu hỏi:
1. Hãy liệt kê các loại phông chữ trong CSS và cho biết đặc điểm của từng loại.
2. Viết một đoạn mã CSS để định dạng một đoạn văn bản với phông chữ Arial, cỡ chữ 16px và màu chữ xanh dương.



# Bài học: CSS Định dạng Văn bản

## Nội dung lý thuyết

Trong ví dụ trên; sau thuộc tính `font-family` là một hay một danh sách các tên phông chữ. Nếu tên phông chữ có chứa dấu cách thì cần đặt trong hai dấu nháy kép (hoặc nháy đơn). Danh sách các phông chữ này thường cùng loại và tên của loại phông đó ở vị trí cuối cùng. Nếu đưa ra một danh sách các phông chữ; trình duyệt sẽ lần lượt tìm các phông trong danh sách từ trái sang phải để chọn thể hiện văn bản. Nếu không tìm thấy phông chữ nào trong danh sách thì sẽ chọn phông cùng loại bất kỳ.

### Các thuộc tính chính

1. **font-size**: Thuộc tính này sẽ thiết lập cỡ chữ. Cú pháp của mẫu định dạng như sau:
```
selector {font-size: cỡ chữ;}
```
Cỡ chữ có thể là một trong những dạng sau:
- Cỡ chữ theo đơn vị đo chính xác tuyệt đối, ví dụ: cm (centimét), mm (milimét), in (inch = 2,54 cm), px (pixel 96 inch), pt (point = 72 inch).
- Cỡ chữ theo các đơn vị đo tương đối: em (so với cỡ chữ hiện thời của trình duyệt), ex (so với chiều cao chữ x của cỡ chữ hiện thời), rem (so với cỡ chữ của phần tử gốc html của tệp HTML).
- Cỡ chữ theo tỷ lệ phần trăm (%) cỡ chữ của tử cha.
- Cỡ chữ theo các mức xx-small, x-small, small, medium, large, x-large, xx-large. Cỡ chữ mặc định là medium.

2. **font-style**: Thuộc tính này thiết lập kiểu chữ thường hay kiểu chữ nghiêng của văn bản. Giá trị của thuộc tính này có hai giá trị là `normal` (thường) và `italics` (nghiêng).

3. **font-weight**: Thuộc tính này thiết lập kiểu chữ đậm. Giá trị của thuộc tính này có thể đặt bằng chữ là `normal` (bình thường), `bold` (đậm) hoặc đặt bằng các giá trị từ 100, 200 đến 900, trong đó các mức độ viết đậm từ 500 trở lên.

### Ví dụ minh họa

Mẫu sau thiết lập các thẻ `strong` và `em` với kiểu chữ nghiêng và đậm khác nhau:
```css
em {
font-style: italics;
font-weight: bold;
}
strong {
font-style: italics;
font-weight: 900;
}
```

### CSS định dạng màu chữ

Thuộc tính `color` sẽ thiết lập màu chữ. Một số giá trị màu cơ bản cho thuộc tính này như sau:
- black (đen)
- white (trắng)
- purple (tím)
- blue (xanh dương)
- orange (cam)
- red (đỏ)
- green (xanh lá cây)
- yellow (vàng)

### Một số ví dụ thiết lập thuộc tính màu chữ
```css
h1 {
color: red;
}
em {
color: green;
}
* {
color: black;
}
```
Bộ chọn với ký tự `*` là tất cả các phần tử HTML của trang web. Khi áp dụng CSS trên thì các phần tử `h1` có chữ màu đỏ, các phần tử `em` có chữ màu xanh lá cây; còn toàn bộ các phần tử còn lại có chữ màu đen.

## Bài tập và câu hỏi

1. Hãy viết CSS để thiết lập cỡ chữ cho các thẻ `p` là 16px.
2. Sử dụng thuộc tính `font-weight` để làm cho các thẻ `strong` có chữ đậm.
3. Thay đổi màu chữ cho các thẻ `h2` thành màu xanh dương.

## Hình ảnh mô tả

(Ghi chú: Hình ảnh mô tả không có sẵn trong văn bản này)

## Bảng biểu

(Ghi chú: Bảng biểu không có sẵn trong văn bản này)



# CSS Định Dạng Dòng Văn Bản

## Nội Dung Lý Thuyết
Các mẫu định dạng loại này sẽ thiết lập các thuộc tính liên quan đến các dòng văn bản khi thể hiện trên trình duyệt. Để hiểu cách định dạng này, cần biết đường cơ sở (baseline) và chiều cao dòng văn bản (line-height).

- **Đường cơ sở (baseline)** là đường ngang mà các chữ cái đứng thẳng trên nó.
- **Chiều cao dòng văn bản** là khoảng cách giữa các đường cơ sở của các dòng trong cùng một đoạn văn bản: CSS sẽ mặc định coi chiều cao là 2em và thể hiện bằng cách bổ sung khoảng cách phía trên và dưới của văn bản.

Hình 14.3 cho chúng ta hình dung đường cơ sở (baseline) và chiều cao dòng (line-height).

### Hình 14.3. Đường cơ sở và chiều cao dòng văn bản
*Đây là một dòng văn bản có đường baseline và line-height.*

## Ví Dụ Minh Họa
- `p {line-height: 3;}` /* thiết lập chiều cao bằng 3 lần cỡ chữ hiện thời của trình duyệt.
- `p {line-height: 2em;}` /* thiết lập chiều cao bằng 2 lần chiều cao dòng hiện thời.
- `p {line-height: 200%;}` /* thiết lập chiều cao dòng bằng 200% của chiều cao dòng của phần tử cha mà phần tử hiện thời được kế thừa.

### text-align
Thuộc tính này thiết lập căn lề cho các phần tử được chọn. Các kiểu căn hàng bao gồm: left, center, right; justify.

Ví dụ:
- `text-align: right;` /* thiết lập căn phải.

### text-decoration
Thuộc tính này thiết lập tính chất "trang trí" dòng văn bản bằng các đường kẻ ngang trên, dưới hay giữa dòng. Thuộc tính này sẽ thay thế và mở rộng cho thẻ `` của HTML. Thuộc tính này có bốn giá trị thường sử dụng là:
- `none` (mặc định; không trang trí)
- `underline` (đường kẻ dưới chữ)
- `overline` (đường kẻ phía trên chữ)
- `line-through` (kẻ giữa dòng chữ)

### Hình 14.4. Các định dạng đường kẻ ngang dòng văn bản
- `text-decoration: underline;` /* chữ có gạch dưới.
- `text-decoration: overline;` /* chữ có gạch trên.
- `text-decoration: line-through;` /* chữ có đường kẻ ngang.

## Bài Tập và Câu Hỏi
1. Giải thích ý nghĩa của đường cơ sở và chiều cao dòng văn bản trong CSS.
2. Viết mã CSS để thiết lập chiều cao dòng văn bản là 1.5 lần cỡ chữ hiện tại.
3. Thực hiện các kiểu căn lề khác nhau cho một đoạn văn bản và mô tả sự khác biệt.

## Hình Ảnh Mô Tả
- Hình 14.3: Đường cơ sở và chiều cao dòng văn bản.
- Hình 14.4: Các định dạng đường kẻ ngang dòng văn bản.

## Bảng Biểu
| Thuộc Tính        | Giá Trị Mô Tả                          |
|-------------------|----------------------------------------|
| line-height       | Thiết lập chiều cao dòng               |
| text-align        | Thiết lập căn lề cho phần tử          |
| text-decoration    | Thiết lập trang trí cho dòng văn bản   |
| text-indent       | Thiết lập thụt lề dòng đầu tiên       |




# Bài học: Tính kế thừa và cách lựa chọn theo thứ tự của CSS

## Nội dung lý thuyết

### 1. Giải thích các mẫu định dạng CSS sau:
```css

hl {color: red; text-align: center;}
p {text-align: justify;}

```

### 2. Giả sử mẫu định dạng CSS có dạng sau:
```css

body {color: blue;}

```
Hãy kiểm tra tác dụng của CSS này trên một tệp HTML bất kỳ và đưa ra nhận xét.

## Ví dụ minh họa

### a) Tính kế thừa của CSS
Một tính chất rất quan trọng của CSS là tính kế thừa. Nếu một mẫu CSS áp dụng cho một phần tử HTML bất kỳ thì nó sẽ được tự động áp dụng cho tất cả các phần tử là con, cháu của phần tử đó trong mô hình cây HTML (trừ các trường hợp ngoại lệ, ví dụ các phần tử với mẫu định dạng riêng). Ví dụ CSS sau định dạng chữ màu xanh dương cho thẻ body:
```css

body {color: blue;}
h1 {color: red; text-align: center;}

```

## Bài tập và câu hỏi

1. Các mẫu định dạng có tính kế thừa trong mô hình cây HTML không? Nếu một mẫu định dạng thiết lập định dạng ở một phần tử HTML thì định dạng đó có áp dụng cho tất cả các phần tử là con, cháu của phần tử này không?
2. Nếu có nhiều mẫu CSS cùng được thiết lập cho một phần tử HTML thì trình duyệt sẽ áp dụng các mẫu định dạng CSS này theo thứ tự ưu tiên như thế nào?

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh mô tả cấu trúc cây HTML và cách các thuộc tính CSS được áp dụng cho các phần tử con và cháu.)

## Bảng biểu
| Phần tử HTML | Mẫu định dạng CSS | Kết quả |
|--------------|-------------------|---------|
| body         | color: blue;      | Chữ màu xanh dương cho toàn bộ nội dung |
| h1           | color: red;       | Chữ màu đỏ cho tiêu đề h1 |
| p            | text-align: justify; | Đoạn văn được căn chỉnh đều hai bên |




# Tính kế thừa của CSS</hl>

# 1. Mô hình cây html

Đây là đoạn đầu tiên.

```
### a) Mã html
### b) Hiển thị trong trình duyệt
**Hình 14.5. Minh hoạ tính kế thừa của CSS**

### b) Thứ tự ưu tiên khi áp dụng mẫu CSS
Do được phép có nhiều mẫu định dạng CSS nên có thể xảy ra trường hợp nhiều mẫu cùng áp dụng cho một phần tử HTML; khi đó câu hỏi đặt ra là trình duyệt sẽ chọn các mẫu định dạng theo thứ tự ưu tiên nào để áp dụng?

Khi đó trình duyệt sẽ thực hiện mẫu định dạng được viết cuối cùng: Đây chính là tính chất "cascading" của CSS. Trong ví dụ mẫu CSS sau có hai định dạng cùng được viết áp dụng cho `# `, mẫu đầu quy định căn giữa, mẫu sau quy định căn trái.

```css

body {color: blue;}
h1 {color: red; text-align: center;}
h1 {text-align: left;}

```

Khi áp dụng trong ví dụ sau; phần tử `
# ` được căn trái theo mẫu cuối cùng của CSS:

```html

# Tính kế thừa của CSS</hl>

# 1. Mô hình cây html

Đây là đoạn đầu tiên.



# Bài học: CSS và Kỹ thuật Chia để Trị

## Nội dung lý thuyết

Màu sắc sẽ được ưu tiên áp dụng. Mẫu cuối cùng có kí hiệu sẽ có mức ưu tiên thấp nhất mặc dù nó được viết ở vị trí cuối cùng. Kết quả áp dụng CSS trên cho tệp HTML như Hình 14.7.

```css

hl text-indent: @em;                                   /* Lịch sử CSS */
color: blue;
text-align: center;    important                      /* tưởng của CSS do kĩ sư Hảkon Wium */
hl text-align: left; color red;                       /* Lie.người Na Uy thiết lập nãm 1994 trong */
{text-indent: lem; color blue;}                       /* khỉ làm viec vởi Tin Berners-Lee taỉ viện hat */

```

### Hình 14.7. Minh họa sử dụng mẫu có sử dụng các kí hiệu và 'important

Các mẫu định dạng CSS được áp dụng theo nguyên tắc kế thừa trong mô hình cây HTML. Nếu mẫu định dạng được viết cho một phần tử thì sẽ được áp dụng mặc định cho tất cả các phần tử con; cháu. Nếu có nhiều mẫu định dạng được viết cho cùng một bộ chọn thì mẫu viết sau cùng sẽ được áp dụng. Nếu bộ chọn có kí tự `!important` thì được áp dụng cho mọi phần tử nhưng với độ ưu tiên thấp nhất. Ngược lại, mẫu định dạng với từ khoá `!important` có mức ưu tiên cao nhất.

## Ví dụ minh họa

1. Giả sử có mẫu định dạng sau:
```css

body {font-family: sans-serif;}

```
Khi đó toàn bộ văn bản của trang web sẽ mặc định thể hiện với phông có chân; đúng hay sai?

2. Giả sử có mẫu định dạng như sau:
```css

body {font-family: sans-serif;}
hl {text-align: center !important;}
hl {text-align: left;}
{font-family: serif;}

```
Mẫu nào sẽ được áp dụng cho `h1`, mẫu nào sẽ được áp dụng cho thẻ `p`?

## Bài tập và câu hỏi

### THỰC HÀNH

**Nhiệm vụ 1:** Thiết lập mẫu định dạng CSS

**Yêu cầu:** Thiết lập mẫu định dạng CSS để trình bày nội dung văn bản trong Hình 14.8 trên trang web.

## Kỹ thuật chia để trị

Chia để trị hay Divide and Conquer là một kĩ thuật thiết kế thuật toán và chương trình rất quan trọng. Ý tưởng chính của kĩ thuật này nằm ở hai thao tác "chia" và "trị".

### Ý tưởng của kĩ thuật chia để trị

Từ bài toán gốc ban đầu (ký hiệu P); chúng ta chia thành các bài toán nhỏ hơn về kích thước (nhưng vẫn giữ nguyên yêu cầu). Với mỗi bài toán nhỏ hơn, có thể gọi đệ quy hoặc giải trực tiếp; sau đó kết hợp lại để giải bài toán gốc (P) ban đầu.

### Hình 14.8. Nội dung cần trình bày

![Hình 14.8. Nội dung cần trình bày](#)



# Bài học: Thiết lập định dạng CSS

## Nội dung lý thuyết
CSS (Cascading Style Sheets) là ngôn ngữ dùng để mô tả cách trình bày của tài liệu HTML. CSS cho phép bạn kiểm soát bố cục, màu sắc, phông chữ và nhiều yếu tố khác của trang web.

### Các thuộc tính CSS cơ bản
- **font-family**: Xác định phông chữ cho văn bản.
- **font-size**: Xác định kích thước chữ.
- **color**: Xác định màu sắc của văn bản.
- **text-align**: Xác định cách căn chỉnh văn bản.
- **text-indent**: Xác định độ thụt lề của dòng đầu tiên trong đoạn văn.
- **text-justify**: Xác định cách căn chỉnh văn bản đều hai bên.

## Ví dụ minh họa
```css
h1, h2 {
font-family: sans-serif;
font-size: 16px;
color: blue;
text-align: center;
text-indent: 2em;
}

p {
text-align: justify;
}

strong, em {
font-size: 100%;
}
```

## Bài tập và câu hỏi
1. Mỗi phông chữ sau đây thuộc loại nào?
- a) Times New Roman
- b) Courier New
- c) Abadi
- d) Bradley Huns ITC
- e) Berlin Sans FB
- f) ALGERIAN
- g) Consolas
- h) Cascadia

2. Hãy liệt kê các thuộc tính CSS liên quan đến định dạng đoạn văn bản sau:
```
Trời Hà Nội xanh
Sáng tác: Văn Ký
Xanh xanh thắm bầu trời xanh Hà Nội
Hồ Gươm xanh như mái tóc em xanh
```

## VÂN DUNG
1. Tìm hiểu thêm các thuộc tính phông chữ như `font-variant` và thuộc tính dòng văn bản như `letter-space` (khoảng cách giữa các kí tự), `word-space` (khoảng cách giữa các từ) và `text-shadow` (chữ bóng).
2. Với bài đọc thêm "Lịch sử CSS" (Bài 13), em hãy thiết lập hai tệp CSS khác nhau để định dạng cho trang web mô tả bài đọc thêm này: Hai kiểu định dạng được thiết lập cần khác nhau về phông chữ, cỡ chữ và màu chữ.

## Hình ảnh mô tả
*Hình 14.8: Ví dụ về cách trình bày văn bản với CSS.*

## Bảng biểu
| Tên phông chữ         | Loại phông chữ   |
|-----------------------|------------------|
| Times New Roman       | Serif            |
| Courier New           | Monospace        |
| Abadi                 | Sans-serif       |
| Bradley Huns ITC      | Serif            |
| Berlin Sans FB        | Sans-serif       |
| ALGERIAN              | Decorative       |
| Consolas              | Monospace        |
| Cascadia              | Sans-serif       |

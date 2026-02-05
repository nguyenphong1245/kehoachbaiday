# BÀI 17: CÁC MỨC ƯU TIÊN CỦA BỘ CHỌN

## SAU BÀI HỌC NÀY EM SẼ:
- Biết cách dùng CSS cho các kiểu bộ chọn khác nhau (id, class, pseudo-class, pseudo-element)
- Biết cách sử dụng CSS thực hiện các mẫu định dạng theo thứ tự ưu tiên của mình

Chúng ta đã biết nhiều cách thiết lập mẫu định dạng cho các phần tử HTML. Tuy nhiên, các lệnh định dạng CSS đã biết đều chỉ áp dụng cho các phần tử tĩnh, tức là không phụ thuộc vào tương tác với người dùng. Vậy có cách nào thiết lập CSS để định dạng cho các trạng thái tương tác với người dùng; ví dụ như trạng thái khi người dùng di chuyển hay nháy chuột lên phần tử đó không?

## 1. KIỂU BỘ CHỌN DANG PSEUDO-CLASS VÀ PSEUDO-ELEMENT

### Hoạt động 1: Tìm hiểu một số kiểu lớp và bộ chọn pseudo-class; pseudo-element
Thảo luận và trả lời các câu hỏi sau:
1. Thế nào là pseudo-class của bộ chọn? Cách áp dụng:
2. Thế nào là pseudo-element của bộ chọn? Nêu ý nghĩa của khái niệm này trong định dạng CSS.

### a) Bộ chọn pseudo-class
Pseudo-class (lớp giả) là khái niệm chỉ các trạng thái đặc biệt của phần tử HTML. Các trạng thái này không cần định nghĩa và mặc định được coi như các lớp có sẵn của CSS. Trong CSS, các lớp giả quy định viết sau dấu `:` theo cú pháp:
```css
pseudo-class { thuộc tính: giá trị; }
```

### Bảng 17.1: Một số lớp giả thường dùng

| Bộ chọn  | Ý nghĩa                                                        | Ví dụ                                      |
|----------|----------------------------------------------------------------|-------------------------------------------|
| `link`   | Tất cả các liên kết khi chưa được kích hoạt.                  | Các liên kết (khi chưa kích hoạt) sẽ có màu xanh dương.
`a:link { color: blue; }` |
| `visited`| Tất cả các liên kết sau khi đã được kích hoạt một lần.        | Các liên kết sau khi kích hoạt chuyển màu xám.
`a:visited { color: gray; }` |
| `hover`  | Tất cả các phần tử, khi người dùng di chuyển con trỏ chuột lên đối tượng. | Khi di chuyển con trỏ chuột lên đối tượng có id = "home" sẽ hiển thị với cỡ chữ tăng lên 150%.
`#home:hover { font-size: 150%; }` |

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa các trạng thái của liên kết và phần tử khi sử dụng pseudo-class trong CSS)

## Bài tập và câu hỏi
1. Hãy liệt kê và giải thích ít nhất 3 pseudo-class khác nhau mà bạn biết.
2. Viết một đoạn mã CSS sử dụng pseudo-class để thay đổi màu nền của một phần tử khi người dùng di chuột lên nó.
3. Giải thích sự khác nhau giữa pseudo-class và pseudo-element trong CSS.



a:link {color: red;}
a:visited {color: green;}
a:hover {color: magenta;}
h1 {color: blue;}

# CSS là gì

Tự học nhanh CSS

CSS (Cascading Style Sheets) là ngôn ngữ định dạng đặc biệt được dùng để mô tả cách thể hiện của văn bản HTML trong trang web.

```

b) Bộ chọn kiểu pseudo-element
Pseudo-element (phần tử giả) là khái niệm chỉ một phần (hoặc một thành phần) của các phần tử bình thường: Các phần này có thể coi là một phần tử giả và có thể thiết lập mẫu định dạng CSS. Quy định phần tử giả viết sau dấu hai chấm theo cú pháp:
```css
pseudo-element {thuộc tính giá trị;}



p:first-line {color: red; font-family: monospace; font-size: 120%;}

HTML là ngôn ngữ đánh dấu siêu văn bản, đặc biệt dùng để thiết kế nội dung các trang web và được thể hiện bằng trình duyệt.

CSS là ngôn ngữ định dạng đặc biệt được dùng để mô tả cách thể hiện của văn bản HTML trong trang web.

```

## Bài tập và câu hỏi

1. Muốn áp dụng đổi màu chữ một vùng trên màn hình khi nháy chuột tại vùng đó thì cần phải dùng định dạng CSS nào?
2. Muốn tăng kích thước một đoạn văn bản khi di chuyển chuột qua đoạn văn bản đó thì cần dùng định dạng CSS nào?

### Mức độ ưu tiên khi áp dụng CSS

Hoạt động 2: Tìm hiểu nghĩa và ứng dụng của mức độ ưu tiên trong CSS.

Giả sử có định dạng CSS như sau:

```css

.test {color: green;}
p {color: red;}

```

CSS trên áp dụng cho phần tử HTML sau:

```html
Tin học 12



# Bài học: Thứ tự ưu tiên của CSS

## Nội dung lý thuyết
Trong CSS, thứ tự ưu tiên quyết định cách mà các thuộc tính được áp dụng cho các phần tử HTML. Có nhiều mức độ ưu tiên khác nhau, từ cao đến thấp, như sau:

1. **!important**: Các thuộc tính trong CSS với từ khóa `!important` sẽ có mức ưu tiên cao nhất.
2. **CSS trực tiếp (inline CSS)**: Các định dạng nằm ngay trong phần tử HTML với thuộc tính `style`. Các định dạng loại này thường dùng để điều khiển cách hiển thị thông tin phụ thuộc vào kích thước màn hình của thiết bị.
3. **CSS liên quan đến kích thước thiết bị (Media type)**: Ví dụ mẫu định dạng sau sẽ tăng kích thước chữ lên 150% nếu chiều ngang màn hình nhỏ hơn 600 px:
```css
@media only screen and (max-width: 600px) {
body { font-size: 150%; }
}
```
4. **Trọng số CSS**: Mỗi định dạng CSS sẽ có trọng số (specificity) riêng của mình. Tại mức ưu tiên này, định dạng CSS có trọng số cao nhất sẽ được áp dụng.
5. **Nguyên tắc thứ tự cuối cùng (Rule order)**: Nếu có nhiều mẫu định dạng với cùng trọng số thì định dạng ở vị trí cuối cùng sẽ được áp dụng.
6. **Kế thừa từ CSS cha**: Nếu không tìm thấy mẫu định dạng tương ứng thì sẽ lấy thông số định dạng CSS kế thừa từ phần tử cha.
7. **Mặc định theo trình duyệt**: Nếu không có bất cứ định dạng CSS nào thì trình duyệt quyết định thể hiện nội dung mặc định.

Như vậy, theo nguyên tắc trên, nếu có một dãy các mẫu định dạng CSS cùng có thể áp dụng cho một phần tử HTML thì tính kế thừa CSS và nguyên tắc thứ tự cuối cùng được xếp dưới trọng số CSS. Tức là khi đó CSS sẽ tính trọng số các mẫu định dạng; cái nào có trọng số lớn hơn sẽ được ưu tiên áp dụng.

Cách tính trọng số của CSS rất đơn giản dựa trên giá trị trọng số của từng thành phần của bộ chọn (selector) trong mẫu định dạng. Trọng số của mẫu định dạng sẽ được tính bằng tổng của các giá trị thành phần đó. Giá trị của các thành phần của bộ chọn theo quy định trong Bảng 17.4.

## Bảng 17.3. Thứ tự (mức) ưu tiên của CSS

| STT | CSS                                      | Giải thích                                                                 |
|-----|------------------------------------------|-----------------------------------------------------------------------------|
| 1   | !important                               | Các thuộc tính trong CSS với từ khóa !important sẽ có mức ưu tiên cao nhất |
| 2   | CSS trực tiếp (inline CSS)              | Các định dạng nằm ngay trong phần tử HTML với thuộc tính style            |
| 3   | CSS liên quan đến kích thước thiết bị   | Nếu chiều ngang màn hình nhỏ hơn 600 px, kích thước chữ sẽ tăng lên 150%  |
| 4   | Trọng số CSS                             | Mỗi định dạng CSS sẽ có trọng số riêng của mình                            |
| 5   | Nguyên tắc thứ tự cuối cùng (Rule order)| Định dạng ở vị trí cuối cùng sẽ được áp dụng nếu có cùng trọng số          |
| 6   | Kế thừa từ CSS cha                      | Nếu không tìm thấy mẫu định dạng tương ứng thì sẽ lấy từ phần tử cha      |
| 7   | Mặc định theo trình duyệt               | Nếu không có định dạng nào thì trình duyệt quyết định thể hiện nội dung   |

## Bảng 17.4. Giá trị của các thành phần của bộ chọn

| STT | Bộ chọn                                   | Giá trị đóng góp trọng số |
|-----|-------------------------------------------|----------------------------|
| 1   | Mã định danh (ID)                        | 100                        |
| 2   | Lớp, lớp giả, bộ chọn kiểu thuộc tính    | 10                         |
| 3   | Phần tử, phần tử giả                     | 1                          |

## Bảng 17.5. Một số ví dụ tính trọng số

| Bộ chọn                     | Trọng số | Giải thích                                      |
|----------------------------|----------|-------------------------------------------------|
| em                         | 2        | Bộ chọn có hai phần tử là p và em, vậy trọng số 1 + 1 = 2 |
| test #pll                  | 110      | Bộ chọn bao gồm class và id, vậy trọng số bằng 10 + 100 = 110 |
| p.test em .more           | 22       | Bộ chọn có hai phần tử (p, em) và hai class (test, more), vậy trọng số bằng 2 + 20 = 22 |
| em#p123                   | 102      | Bộ chọn có hai phần tử (p, em) và một id, vậy trọng số bằng 2 + 100 = 102 |

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa có thể bao gồm các ví dụ về cách áp dụng CSS và cách tính trọng số, nhưng không có hình ảnh cụ thể trong văn bản này.)

## Bài tập và câu hỏi
1. Giải thích các mức độ ưu tiên của CSS và cách chúng ảnh hưởng đến việc áp dụng các thuộc tính.
2. Tính trọng số cho các bộ chọn sau:
- `div#header .menu li`
- `p.intro`
- `ul li a:hover`
3. Viết một đoạn mã CSS sử dụng `@media` để thay đổi màu nền của trang khi chiều rộng màn hình nhỏ hơn 800px.



# Giới thiệu HTML

HTML là gì

HTML - tên viết tắt của HyperText Markup Language; ngôn ngữ đánh dấu siêu văn bản; là ngôn ngữ đặc biệt dùng để thiết kế nội dung các trang web và được thể hiện bằng trình duyệt.

```

- **CSS**:
```css
h1 {
color: red;
text-align: center;
}



-  Giới thiệu HTML
-  Giới thiệu CSS

```

CSS được thiết lập như sau:
```css

h1 {color: red; text-align: center;}
h2 {color: blue;}
nav {text-align: right;}
li {display: inline;
border: 1px solid blue;
padding: 5px;
background-color: lime;}
a:hover {color: red; background-color: cyan;}
h2 {color: red;}
img {display: none;}
img.active {display: block;}
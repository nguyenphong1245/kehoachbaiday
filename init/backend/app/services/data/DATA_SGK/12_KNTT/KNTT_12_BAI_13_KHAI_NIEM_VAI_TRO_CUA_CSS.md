# Lịch sử phát triển HTML

h1 {color: red;}
h1 {border: 2px solid blue;}
p {text-indent: 15px;}

# Lịch sử phát triển HTML

Các chuẩn HTML của trang web hiện nay được nhà vật lí Tim Berners-Lee đưa ra lần đầu tiên vào những năm 1990 của thế kỉ XX tại trung tâm vật lí hạt nhân CERN.

Ý tưởng ban đầu của Berners-Lee là muốn thiết lập một chuẩn chung để thể hiện và chia sẻ các văn bản có thể trao đổi bên trong cơ quan CERN.



# Bài học: Giới thiệu về CSS

## Nội dung lý thuyết
Trong đoạn mã nguồn ở Hình 13.2, các dòng từ 6 đến 10 là một loại ngôn ngữ đặc biệt dùng để thiết lập các mẫu định dạng cho trang web. Các mẫu định dạng này được gọi là Cascading Style Sheet và viết tắt là CSS.

```css

hl {color: red; }
hl {border: 2px solid blue;}
p {text-indent: 15px;}

```

Hình 13.3. Mẫu định dạng CSS

CSS là định dạng độc lập với chuẩn HTML; được dùng để thiết lập các mẫu định dạng dùng trong trang web. Trong Hình 13.3, ba mẫu định dạng tương ứng với ba dòng được ghi trong thẻ `` (trong phần tử head): Mẫu thứ nhất thiết lập màu chữ đỏ cho các phần tử `# `. Mẫu thứ hai thiết lập khung viền màu xanh có độ dày 2 pixel (mỗi pixel = 2,54/96 cm) cũng được áp dụng cho các phần tử `# `. Mẫu thứ ba thiết lập dòng đầu thụt vào 15 pixel cho tất cả các phần tử ``.

Như vậy, CSS có thể hiểu là tập hợp các mẫu định dạng viết độc lập với mã nguồn HTML của trang web và dùng để định dạng cho các phần tử HTML tương ứng. CSS có cách viết riêng (ngôn ngữ CSS), độc lập với ngôn ngữ HTML. Chỉ cần viết mẫu định dạng một lần và được áp dụng đồng thời cho tất cả các phần tử, ví dụ `# ` và `` trong trang web trên.

Mẫu định dạng CSS là một công cụ hỗ trợ giúp định dạng nội dung trang web nhanh hơn; thuận tiện hơn bằng cách định nghĩa một lần và sử dụng nhiều lần: CSS sử dụng ngôn ngữ mô tả riêng, độc lập với HTML.

## Ví dụ minh họa
```css

h1 {color: blue;}
p {font-size: 16px;}

```
- Trong ví dụ trên, tất cả các thẻ `# ` sẽ có màu chữ xanh và tất cả các thẻ `` sẽ có kích thước chữ là 16px.

## Bài tập và câu hỏi
1. Ngôn ngữ CSS có phải là HTML không?
2. Các mẫu định dạng CSS thường được mô tả như thế nào?
A. Trong một bảng.
B. Phải viết trên một hàng.
C. Có thể viết trên nhiều hàng.

## Hình ảnh mô tả
- Hình 13.2: Mã nguồn CSS.
- Hình 13.3: Mẫu định dạng CSS.

## Bảng biểu
Cấu trúc tổng quát của một mẫu định dạng CSS có hai phần: bộ chọn (selector) và vùng mô tả (declaration block). Vùng mô tả bao gồm một hay nhiều quy định có dạng `{thuộc tính: giá trị;}`. Các quy định được viết cách nhau bởi dấu `;`. Bộ chọn sẽ quy định những thẻ HTML nào được chọn để áp dụng định dạng này.

Cấu trúc CSS có thể ở dạng đơn giản; trong đó vùng mô tả chỉ có một quy định:
```css
bộ chọn {thuộc tính: giá trị;}
```



#



@import "styles.css";

```
Một tệp CSS có thể được thiết lập để đồng thời áp dụng cho nhiều trang web; giúp cho việc định dạng nhiều trang web thống nhất và khi cần chỉnh sửa định dạng thì chỉ cần sửa một lần trong tệp định dạng CSS.

### 2. Cách thiết lập CSS nội tuyến
Có thể định dạng CSS trực tiếp bên trong thẻ của các phần tử HTML bằng cách chỉ ra các thuộc tính và giá trị cho thuộc tính style. Cách làm này mất thời gian nhưng thời gian thực hiện sẽ nhanh. Các lợi ích khác của cách thiết lập CSS nội tuyến sẽ được trình bày trong phần sau.

Cấu trúc tổng quát của CSS bao gồm các mẫu định dạng dùng để tạo khuôn cho các phần tử HTML của trang web. Mỗi mẫu này bao gồm hai phần: bộ chọn và vùng mô tả. Có thể thiết lập CSS trong, ngoài thông qua tệp CSS hoặc đặt nội tuyến trực tiếp bên trong các phần tử HTML thông qua thuộc tính style.

## Ví dụ minh họa
```html

h1 {
color: blue;
}
p {
font-size: 16px;
}



# Bài học: Giới thiệu về CSS

## Nội dung lý thuyết
Các mẫu định dạng có thể viết trong tệp CSS ngoài và kết nối vào bất kỳ trang web nào. Tính năng này cho phép định dạng một lần và áp dụng cho nhiều trang web; thậm chí cả một website. Một ý nghĩa khác là nếu một website (hay trang web) cần thay đổi định dạng thì có thể chỉ cần chỉnh sửa một lần. CSS được thiết lập với mục đích làm cho công việc định dạng nội dung trang web trở nên khoa học hơn; nhanh hơn; thuận tiện hơn. Với CSS, các mẫu định dạng được thiết kế độc lập, có thể viết ra một lần nhưng được áp dụng nhiều lần.

## Ví dụ minh họa
1. Nếu muốn tất cả các đoạn văn bản của trang web có màu xanh (blue) thì cần thiết lập định dạng CSS như thế nào?
```css
p {
color: blue;
}
```

2. Giả sử có một mẫu định dạng CSS như sau:
```css
h1, h2, h3 {
border: 2px solid red;
}
```
Hãy giải thích ý nghĩa của mẫu định dạng CSS trên.
- Mẫu định dạng này sẽ áp dụng một đường viền màu đỏ dày 2px cho tất cả các thẻ h1, h2 và h3 trong trang web.

## Bài tập và câu hỏi
1. Ngôn ngữ định dạng CSS chính là ngôn ngữ HTML, đúng hay sai?
2. Khẳng định sau là đúng hay sai: Có thể chỉ cần thay đổi thông tin của một tệp CSS sẽ làm thay đổi định dạng của nhiều trang web; thậm chí cả một website.

## Vân Dung
1. Trong các phần mềm soạn thảo văn bản thường có chức năng tạo các mẫu định dạng Style Sheet; dùng để tạo khuôn cho các đoạn (paragraph) của văn bản. Em hãy trình bày sự giống nhau và tương thích của Style Sheet trong các phần mềm soạn thảo văn bản với CSS của trang web.
2. Thiết lập trang web với nội dung sau và định dạng trang bằng các mẫu CSS.

### Lịch sử CSS
Ý tưởng của CSS do kỹ sư Hakon Wium Lie; người Na Uy; thiết lập năm 1994 trong khi làm việc với Tim Berners-Lee tại viện hạt nhân CERN. Ý tưởng chính của CSS là tạo ra các mẫu định dạng riêng, độc lập cho các phần tử HTML của trang web. Cách tạo ngôn ngữ định dạng riêng này sẽ giúp ích rất nhiều nếu so sánh với việc định dạng theo từng thẻ HTML.

### Lịch sử các phiên bản CSS đầu tiên
Các ý tưởng ban đầu được Hakon Wium Lie đưa ra năm 1994 nhưng phiên bản CSS1 chính thức ra đời năm 1996. Phiên bản tiếp theo CSS2 được khởi động ngay sau đó nhưng mãi đến 1998 mới hoàn thiện. Phiên bản chính thức hoàn thiện nhất của CSS2 là CSS2.1 ra đời năm 2011, bản CSS2 nâng cấp được hoàn thiện năm 2016.

### Các phiên bản CSS tiếp theo
Từ bản CSS3 trở đi, CSS được phát triển theo từng gói riêng biệt. Hiện nay các gói của CSS3 vẫn đang được phát triển và hoàn thiện. Đồng thời một số chuẩn của CSS4 và CSS5 vẫn đang được tiếp tục thiết lập mới. Hiện tại hiệp hội chịu trách nhiệm phát triển các chuẩn của HTML, CSS và các công nghệ có liên quan là tổ chức World Wide Web Consortium (W3C), có địa chỉ tại https://www.w3.org/.
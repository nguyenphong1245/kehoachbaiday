# BÀI 18 THỰC HÀNH TỔNG HỢP
## THIẾT KẾ TRANG WEB

### SAU BÀI HỌC NÀY EM SẼ:
- Tạo được trang web bằng HTML và định dạng bằng CSS.

Giả sử website của em có nhiều tệp HTML. Có thể hay dùng một tệp CSS duy nhất để định dạng cho toàn bộ các trang web? Nếu có thể hãy nêu các bước cần thực hiện:

1. **DỰ ÁN: XÂY DỰNG WEBSITE GIỚI THIỆU CÁC CÂU LẠC BỘ NGOẠI KHOÁ CỦA TRƯỜNG**
- Hoạt động: Thảo luận theo nhóm để trả lời các câu hỏi sau:
1. Tổ chức cấu trúc website như thế nào cho phù hợp?
2. Với mỗi câu lạc bộ sẽ đưa những thông tin gì? Thống nhất với nhau?
3. Trình bày các trang web như thế nào cho đẹp?
4. Làm thế nào để website sinh động và đẹp mắt?

Website cần một trang chủ và các trang riêng cho từng nhóm hoặc từng câu lạc bộ tùy theo số lượng và thông tin hoạt động chi tiết của các câu lạc bộ. Ở mức đơn giản, em có thể thiết kế website với ba trang tương ứng với trang chủ; trang giới thiệu các câu lạc bộ thể thao và các câu lạc bộ nghệ thuật:

- **Trang chủ** sẽ chứa các thông tin chung nhất về các câu lạc bộ và liên kết tới các trang thành viên. Ví dụ như trong **Hình 18.1** Minh họa có thể tùy chọn vào các tài nguyên sẵn có thường là ảnh và video. Các trang thành viên đăng thông tin chi tiết, lịch hoạt động, thành tích; tùy nhu cầu: Ngoài ra, em có thể tạo thêm một trang chứa biểu mẫu để các bạn đăng ký tham gia.

Các trang nên tuân theo phong cách trình bày chung bằng cách sử dụng liên kết tới cùng một tệp tin CSS. Để thực hiện ý tưởng này, trước hết ta cần lên ý tưởng về bố cục của từng phần trong một trang web rồi sử dụng CSS để định dạng (kích thước, vị trí, màu sắc, cỡ chữ, ...) của mỗi phần.

### Hình ảnh mô tả:
- **Hình 18.1. Trang chủ của website câu lạc bộ**

### Bài tập và câu hỏi:
- Hãy thiết kế một trang web giới thiệu về một câu lạc bộ mà em yêu thích, sử dụng HTML và CSS.
- Trình bày cấu trúc và nội dung của trang web đó.
- Đưa ra các ý tưởng để làm cho trang web trở nên sinh động và hấp dẫn hơn.



# 2. THỰC HÀNH:

## Nhiệm vụ 1: Tạo tệp CSS
### Yêu cầu:
Tạo tệp CSS để trình bày website như Hình 18.2

```
Đầu trang (Header)
Banner
Khẩu hiệu - Slogan

Phân nội dung chính

Ảnh minh hoạ/Nội dung                  Ảnh minh hoạ/Nội dung

Ảnh minh hoạ/Nội dung                  Ảnh minh hoạ/Nội dung

Cuối trang (Footer)
```

### Hướng dẫn:
**Hình 18.2** Bố cục của website

Với bố cục như Hình 18.2, mỗi thành phần (đầu trang; nội dung chính; cuối trang; banner; slogan; ảnh nội dung) được định nghĩa bằng một lớp riêng hoặc sử dụng chung lớp nếu cùng định dạng.

Phần đầu trang gồm hai phần nhỏ:
- **Banner**: Có thể sử dụng một ảnh làm nền và tiêu đề là tiêu đề trang web, cỡ chữ to; màu sắc nổi bật. Ví dụ, CSS để trang web hiển thị như Hình 18.1 được thiết lập như sau:
```css
banner {
background: url('lassets/img/bg-masthead.jpg') no-repeat center center;
background-size: cover;
padding-top: 12rem;
padding-bottom: 12rem;
text-align: center !important;
color: darkred !important;
}
```

- **Slogan**: Trong Hình 18.1, slogan gồm 3 ô trên hàng ngang có định dạng giống nhau; mỗi ô có độ rộng bằng 1/3 độ rộng trang. Vì các ô giống nhau nên ta chỉ cần tạo một lớp CSS (đặt tên là `block_3`). Tuy nhiên, khi sử dụng thẻ div, các ô này sẽ được xếp theo chiều dọc. Để hiển thị theo phương ngang, ta sẽ tạo ra một lớp `Row` có độ rộng bằng độ rộng trang, lớp `Row` chứa 3 ô trên.



# Bài học: Trình bày nhiều ô trong cùng một hàng

## Nội dung lý thuyết
Cách trình bày nhiều ô trong cùng một hàng được sử dụng phổ biến trong các trang web, tạo sự cân đối và hài hoà khi hiển thị. Trong phần nội dung, cách thiết lập hoàn toàn tương tự, áp dụng cho việc chia hai cột nhau trên mỗi hàng. Do vậy, ta sẽ định nghĩa thêm lớp slogan và lớp nội dung chính (content) để bao phía ngoài lớp Row: Mỗi lớp có thể có thêm các đặc tính trình bày riêng.

### Slogan
```
Row
```

## Hình ảnh mô tả
**Hình 18.3. Bố cục của slogan**

## Ví dụ minh họa
CSS cho slogan như Hình 18.3 được thiết lập như sau:
```css
slogan {
background-color: rgb(248, 249, 250) !important;
text-align: center !important;
width: 100%;
padding-right: 0.5rem;
padding-left: 3rem;
padding-top: 2rem;
padding-bottom: 7rem;
}

row {
display: flex;
flex-wrap: wrap;
margin-top: -1;
max-width: 100%;
padding-right: 3rem;
padding-left: 3rem;
flex: auto;
width: 33.33333333%;
}
```

## Bài tập và câu hỏi
### Nhiệm vụ 2: Tạo các tệp HTML
**Yêu cầu:** Tạo các tệp HTML `index.html`, `thethao.html` và `nghethuat.html` để tạo trang web theo phân tích ở Nhiệm vụ 1.

### Hướng dẫn:
Để sử dụng các thiết lập CSS từ Nhiệm vụ 1, ta cần tạo các khối bằng thẻ `div` với các lớp CSS đã tạo. Ví dụ; để tạo khối banner cho trang chủ, ta làm như sau:



Dường như bạn đã cung cấp một đoạn văn bản không hoàn chỉnh và không phải là nội dung của sách giáo khoa Tin học. Đoạn văn này có vẻ liên quan đến việc tạo một trang web và các hoạt động của một câu lạc bộ tại trường THPT Nguyễn Bỉnh Khiêm.

Nếu bạn cần thông tin cụ thể về một bài học trong sách giáo khoa Tin học, vui lòng cung cấp tiêu đề hoặc nội dung cụ thể mà bạn muốn trích xuất. Tôi sẽ cố gắng giúp bạn với thông tin đó!
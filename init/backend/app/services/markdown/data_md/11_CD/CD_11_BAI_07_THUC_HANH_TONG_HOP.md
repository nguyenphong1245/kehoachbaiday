# BÀI 7: THỰC HÀNH TỐNG HỢP

Học xong bài này, em sẽ:
- Chỉnh sửa được ảnh và tạo được ảnh động bằng GIMP
- Tạo được phim hoạt hình ngắn bằng phần mềm Animiz Animation Maker

## Nhiệm vụ 1: Thực hành chỉnh sửa ảnh và tạo ảnh động

### Yêu cầu:
Hãy chọn một số bức ảnh về một chủ đề nào đó, ví dụ các ảnh chụp từ cáp treo lên đỉnh Phan Xi Păng (Hình 1). Sau đó, hiệu chỉnh màu sắc để có màu sắc tương đồng và tẩy xóa các chi tiết không mong đợi để được các ảnh như ở Hình 2.

**Hình 1:** Các ảnh được chụp tại các thời điểm khác nhau

### Hướng dẫn thực hiện:

#### Công việc 1: Chỉnh sửa ảnh

**Bước 1:** Tẩy xóa chi tiết không mong đợi
Mở ảnh ở Hình 1a rồi sử dụng công cụ Clone để xóa dây cáp treo; sử dụng công cụ Healing để làm mờ vết xóa nếu có. Kết quả nhận được như ảnh ở Hình 2a.
Xuất ảnh sang một tệp ảnh với định dạng chuẩn.

**Hình 2:** Các ảnh ở Hình 1 được chỉnh lại màu sắc và xóa dây cáp treo

**Bước 2:** Điều chỉnh lại màu sắc cho ảnh
Thực hiện điều chỉnh màu sắc cho ảnh ở Hình 1b như sau:
Mở ảnh ở Hình 1b rồi thực hiện lệnh Colors > Curves để mở hộp thoại Curves. Trong hộp thoại Curves, lần lượt chọn các kênh màu từ danh sách Channel rồi kéo dây cung màu đến các vị trí như ở Hình 3 để giảm các màu đỏ và tăng xanh. Kết quả nhận được như ở Hình 2b.



# Thực hiện tương tự cho ảnh ở Hình I nhưng giảm các màu xanh và tăng các màu đỏ để nhận kết quả như ở Hình 2c. Xuất các ảnh vừa được điều chỉnh màu sang các tệp ảnh với định dạng chuẩn để sử dụng.

## Công việc 2. Tạo ảnh động

Từ ba ảnh đã được chỉnh sửa trên dây, có thể tạo ảnh động với hiệu ứng mờ như hướng dẫn ở bài học tạo ảnh động, cụ thể như sau:

### Bước 1. Tạo tệp ảnh mới và mở các ảnh tĩnh dưới dạng các lớp ảnh

Tạo một tệp ảnh mới với lớp nền trắng, sau đó mở các tệp ảnh trên đây dưới dạng các lớp ảnh bằng lệnh `File > Open as Layers`.

### Bước 2. Tạo dãy khung hình cho ảnh động

Thực hiện lệnh `Filters > Animation` và chọn `Blend` để tạo ảnh động với hiệu ứng mờ dẫn. Hộp thoại `Script-Fu: Blend` xuất hiện, nhập các tham số cho ảnh động như ở Hình 4 và nháy lệnh OK.

- **Intermediate frames**: Số lượng khung hình trung gian cho mỗi ảnh tĩnh.
- **Max blur radius**: Độ mờ.
- **Looped**: Chỉ định nội dung ảnh động có lặp lại hay không.

Sau khi nháy chuột vào lệnh OK, một tệp ảnh mới được tạo ra với các lớp ảnh biểu thị các khung hình của ảnh động. Tên các lớp ảnh có dạng "Frame n" trong đó là số thứ tự khung hình (Hình 5). Theo ví dụ, số lượng khung hình là 12, gồm 3 khung hình 1, 5, 9 của 3 ảnh tĩnh ban đầu và 9 khung hình trung gian cho 3 ảnh tĩnh.

### Bước 3. Gắn thời gian cho các khung hình

Thực hiện lệnh `Filters > Animation > Optimize (for GIF)` để GIMP tự động tạo dãy khung hình gắn với thời gian. Nháy đúp chuột vào tên các khung hình 1, 5 và 9 ứng với ảnh rõ nhất để tăng thời gian hiển thị các khung hình này; chẳng hạn là 500 ms.

### Bước 4. Xem trước và xuất ảnh động

Thực hiện như phần tạo ảnh động hướng dẫn ở phần tạo ảnh với hiệu ứng tự thiết kế để xem trước ảnh động. Tiếp theo, xuất ảnh động sang định dạng GIF để sử dụng.

----

### Hình 3. Hiệu chỉnh màu
### Hình 4. Hiệu ứng Blend
### Hình 5. Các khung hình của ảnh động

| Frame |   |
|-------|---|
| Frame 1 |   |
| Frame 2 |   |
| Frame 3 |   |
| Frame 4 |   |
| Frame 5 |   |
| Frame 6 |   |
| Frame 7 |   |
| Frame 8 |   |
| Frame 9 |   |
| Frame 10 |   |
| Frame 11 |   |
| Frame 12 |   |




# Nhiệm vụ 2. Thực hành tạo phim hoạt hình

## Yêu cầu:
Em hãy tạo một đoạn phim hoạt hình với thời lượng khoảng 3 phút kể về một chuyến tham quan dã ngoại mà em ấn tượng nhất. Yêu cầu cụ thể như sau:
- Đoạn phim hoạt hình gồm 3 cảnh:
- Cảnh 1 gồm một số hình ảnh về phong cảnh buổi dã ngoại.
- Cảnh 2 có hoạt động dã ngoại của học sinh.
- Cảnh 3 là cảnh học sinh báo cáo, thảo luận kết quả thu được sau buổi dã ngoại.
- Có chuyển cảnh giữa các cảnh.
- Cảnh 1 và 2 có nhạc nền.
- Cảnh 3 lấy một số hình ảnh được chỉnh sửa hoặc ảnh động đã tạo trong bài thực hành số 1 ở trên.
- Phần báo cáo và thảo luận ở cảnh 3 có cả hội thoại âm thanh và văn bản.
- Phim có tiêu đề, giới thiệu phần mở đầu phim và kết thúc phim.

## Hướng dẫn thực hiện:
### Bước 1. Xây dựng kịch bản phim hoạt hình
- Thiết kế chi tiết từng phân cảnh cho mỗi cảnh phim. Trong mỗi cảnh, phác thảo chi tiết cảnh nền và các nhân vật.

### Bước 2. Chuẩn bị tư liệu cho phim hoạt hình
- Thiết kế nhân vật cho mỗi phân cảnh: Có thể lựa chọn các nhân vật mẫu trong các video mẫu của Animiz. Ngoài ra, có thể vẽ các nhân vật bằng các phần mềm đồ họa như GIMP, hoặc vẽ các hình đơn giản bằng Animiz.
- Thiết kế cảnh nền: Tạo cảnh nền trực tiếp trên Animiz hoặc trên các phần mềm đồ họa khác. Ảnh nền cũng có thể sưu tập trên Internet.

### Các bước 3, 4, 5, 6 thực hiện như hướng dẫn ở Bài 6.

### Bước 7. Thêm hội thoại và phụ đề
- Thêm hội thoại: Trên thanh đối tượng, đầu tiên chọn Callout chọn hình hộp thoại rồi chỉnh vị trí, kích thước và xoay hướng phù hợp với vị trí nhân vật. Tiếp theo chọn Text, nhập văn bản hội thoại, căn chỉnh cỡ chữ và màu chữ, kéo thả đoạn văn bản vào hình hộp thoại và căn chỉnh như ở Hình 6.

![Hình 6: Hội thoại văn bản](#)

- Thêm phụ đề: Thực hiện như hướng dẫn ở Bài 5.

### Bước 8. Lưu và xuất bản dự án phim hoạt hình:
- Thực hiện như hướng dẫn Bài 6.

Mỗi nhóm (gồm 5 bạn) hãy tạo một đoạn video về một trong các chủ đề sau:
- a) Lễ hội Trung thu
- b) Hội diễn văn nghệ chào mừng ngày Nhà giáo Việt Nam
- c) Giới thiệu một nhân vật lịch sử được yêu thích.
- d) Học tập trong đại dịch COVID-19
- e) Bảo vệ môi trường và chống biến đổi khí hậu.
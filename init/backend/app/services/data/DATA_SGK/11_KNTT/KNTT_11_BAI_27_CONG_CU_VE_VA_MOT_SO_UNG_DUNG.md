# BÀI 27: CÔNG CỤ VẼ VÀ MỘT SỐ ỨNG DỤNG

## SAU BÀI HỌC NÀY EM SẼ
- Biết được khái niệm lớp ảnh.
- Biết một số công cụ vẽ đơn giản.
- Thực hiện được một số ứng dụng để tẩy, làm sạch và xoá các vết xước trên ảnh.

Khi chỉnh sửa ảnh, em muốn thực hiện những việc gì? Em đã dùng những phần mềm chỉnh sửa ảnh nào?

----

## 1. GIỚI THIỆU VỀ LỚP ẢNH

### Hoạt động 1: Nên xanh để làm gì?
Khi làm phim, các cảnh quay thường diễn ra như trong hình 27.1. Em có biết nền màu xanh để làm gì không?

![Hình 27.1. Ảnh với nền xanh](#)

Lớp ảnh (Layer) đóng vai trò quan trọng trong chỉnh sửa ảnh; giúp xử lý các phần riêng biệt của bức ảnh mà không làm ảnh hưởng đến các phần khác và dễ dàng sử dụng lại từng phần nhỏ trong ảnh.

Khái niệm về lớp ảnh tương tự như trong Inkscape, nghĩa là mỗi lớp ảnh sẽ chứa một số đối tượng hình ảnh, thứ tự sắp xếp của các lớp và độ trong suốt của mỗi lớp sẽ ảnh hưởng đến hình ảnh tổng thể của tệp ảnh. Các thao tác quản lý các lớp ảnh được tìm thấy trong hộp thoại Layer ở góc dưới bên phải màn hình của GIMP.

Có thể thêm mới, xoá hay thay đổi thứ tự các lớp ảnh. Các lớp ảnh được sắp theo thứ tự hiển thị từ dưới lên trên: Có hay không hình con mắt bên cạnh biểu tượng và tên lớp cho biết lớp được hiển thị hay ẩn. Chọn một lớp để xử lý riêng (chỉnh sửa hay vẽ thêm). Có thể thay đổi thứ tự lớp bằng cách kéo thả lên trên hoặc xuống dưới.

Mỗi lớp ảnh chứa một số đối tượng của ảnh để có thể xử lý riêng. Thứ tự sắp xếp của các lớp quyết định ảnh sản phẩm.

### Câu hỏi:
Trong Hình 27.2, lớp nào được hiển thị, lớp nào không?

![Hình 27.2 Hộp Layer](#)

----

## Bài tập và câu hỏi
1. Giải thích khái niệm lớp ảnh và vai trò của nó trong chỉnh sửa ảnh.
2. Nêu một số thao tác cơ bản có thể thực hiện với lớp ảnh trong GIMP.
3. Thực hành tạo và quản lý các lớp ảnh trong một bức ảnh cụ thể.

----

## Hình ảnh mô tả
- Hình 27.1: Ảnh với nền xanh.
- Hình 27.2: Hộp Layer trong GIMP.

----

## Bảng biểu
| Tên lớp | Hiển thị | Độ trong suốt |
|---------|----------|----------------|
| Lớp 1  | Có       | 100%           |
| Lớp 2  | Không    | 50%            |
| Lớp 3  | Có       | 75%            |

----

*Lưu ý: Hình ảnh và bảng biểu chỉ mang tính chất minh họa và có thể thay đổi tùy theo nội dung thực tế.*



# 2. GIỚI THIỆU MỘT SỔ CÔNG CỤ VẼ

## Nội dung lý thuyết
Hình 27.3 là một bức ảnh nổi tiếng của nhiếp ảnh gia Kusaikabe Kimbei được chụp từ những năm 1870. Em có thể xác định được tác giả đã phải vẽ thêm những gì để thu được tấm hình này không? Vẽ thêm vào ảnh gốc là một phần của việc chỉnh sửa ảnh. Các công cụ vẽ trong GIMP được cung cấp trong bảng chọn Tools > Paint Tools. Công cụ vẽ gồm ba nhóm chính: vẽ thêm (ví dụ như Paint Brush, Bucket Fill, Gradient), tẩy (Eraser) và vẽ bằng vùng chọn (ví dụ như Clone và Healing) (Bảng 27.1). Để dùng một công cụ nào đó, em nháy chuột vào biểu tượng tương ứng trong hộp công cụ hoặc nhấn hợp phím tắt tương ứng.

### Hình 27.3. Người đàn bà cầm ô dưới mưa
(https://www.metmuseum.org/art/collection/search/294829)

## Bảng 27.1. Một số công cụ vẽ thường dùng

| Công cụ        | Chức năng                                         | Lưu ý                                                                 |
|----------------|--------------------------------------------------|-----------------------------------------------------------------------|
| Paint Brush    | Vẽ thêm cho lớp đang chọn.                       | Chọn kiểu cọ vẽ trong hộp thoại Brushes bên phải màn hình.         |
| Bucket Fill    | Tô màu vùng chọn.                                | Mặc định là dùng màu nổi và tô màu cả vùng chọn. Có thể thay đổi trong mục Fill Type và Affected. |
| Gradient       | Tô màu chuyển sắc vùng chọn.                     | Mặc định chuyển từ màu nổi sang màu nền tuy nhiên có thể thay đổi trong hộp tùy chọn. |
| Eraser         | Xoá điểm ảnh trên lớp đang chọn hoặc một vùng chọn. | Nếu lớp đang chọn không có kênh alpha thì điểm ảnh được xoá sẽ có màu nền. Ngược lại, nếu lớp có kênh alpha thì điểm ảnh trong suốt, hiển thị bởi lưới ô vuông xám đen. |
| Clone          | Vẽ bằng cách sao chép chính xác một vùng chọn.  | Chọn độ nhoè và kích thước nét vẽ trong hộp tùy chọn.               |
| Healing        | Vẽ bằng cách sao chép một vùng chọn.             | Tương tự như Clone nhưng công cụ này kết hợp giữa điểm ảnh ở vùng chọn và điểm ảnh cần vẽ (chỉnh sửa). |

Các công cụ vẽ là phương tiện để chúng ta vẽ thêm chi tiết hoặc loại bỏ các nhược điểm trên ảnh.

## Bài tập và câu hỏi
Nêu sự khác nhau giữa hai công cụ Clone và Healing.



# THIẾT LẬP MÀU SẮC

## Hoạt động 3: Màu sắc

Khi viết trên bảng, các thầy cô sử dụng phấn màu trắng, còn khi viết trong vở học sinh thường dùng mực màu gì? Tại sao không dùng bút mực trắng?

Ngoài ba kênh màu cơ bản R, G và B, giá trị màu sắc của các điểm ảnh còn có một kênh nữa là kênh alpha. Khi lớp ảnh có kênh alpha, trên lớp có thể có những điểm ảnh trong suốt; giống như khi ta nhìn qua tấm kính. Khi không có kênh alpha, lớp ảnh giống như tờ giấy; không thể nhìn thấy các hình ảnh ở dưới. Mặc định là chỉ có lớp dưới cùng không có kênh alpha. Ta có thể thêm kênh alpha vào một lớp bằng cách nháy nút phải chuột vào lớp và chọn **Add Alpha Channel**, chọn **Remove Alpha Channel** để xóa kênh alpha.

GIMP phân biệt màu nổi (Foreground) và màu nền (Background): màu nổi là màu của các đối tượng được vẽ khi sử dụng các công cụ như cọ vẽ, bút chì, màu nền được coi là màu của giấy vẽ. Khi dùng công cụ Erase để xóa tại một điểm ảnh; nếu lớp không có kênh alpha thì điểm ảnh đó sẽ có màu nền; còn nếu có kênh alpha thì điểm ảnh đó sẽ không có màu và ta có thể nhìn thấy hình ảnh ở lớp dưới tại vị trí được xóa (Hình 27.4).

### Hình 27.4. Kết quả khi xóa trên lớp có và không có kênh alpha

![Hình 27.4. Kết quả khi xóa trên lớp có và không có kênh alpha](link_to_image)

Để chọn màu cho màu nổi và màu nền; ta nháy chuột vào ô tương ứng. Trong hộp thoại chọn màu; chọn dải màu trước rồi nháy chuột vào màu muốn chọn. Có thể sử dụng công cụ **Color Picker** để lấy màu từ một điểm ảnh.

Màu nổi là màu dùng cho các công cụ vẽ; màu nền được coi là màu giấy vẽ. Có ba lớp ảnh theo thứ tự từ dưới lên là 1, 2 và 3. Lớp có một bông hoa, lớp 2 có một quả táo và lớp 3 có một chiếc bàn: Biết chỉ có lớp 2 có kênh alpha và độ mờ của cả 3 lớp là 100. Hỏi khi hiển thị cả ba lớp em thấy hình gì?

## THỰC HÀNH

### Nhiệm vụ 1: Xóa đoạn chi tiết thừa bằng công cụ Clone và Healing

**Hướng dẫn:**
Xóa hình dây điện trên ảnh (Hình 27.5): Chọn công cụ **Healing** rồi chọn loại cọ và độ lớn của cọ vẽ (sử dụng cọ đầu tròn; độ lớn 300). Đưa con trỏ chuột lên vùng trời màu xanh; nhấn giữ phím Ctrl và nháy chuột để sao chép điểm ảnh ở vùng nguồn (Hình 27.6). Nhấn giữ và di chuyển chuột vào vùng dây điện để sao chép điểm ảnh ở vùng nguồn vào vùng chỉnh sửa để xóa hình dây điện.

### Hình 27.5. Hình ảnh cần chỉnh sửa

![Hình 27.5. Hình ảnh cần chỉnh sửa](link_to_image)

### Hình 27.6. Vùng nguồn để sao chép

![Hình 27.6. Vùng nguồn để sao chép](link_to_image)

----

**Bài tập và câu hỏi:**
1. Giải thích sự khác biệt giữa màu nổi và màu nền trong GIMP.
2. Khi nào cần sử dụng kênh alpha trong quá trình chỉnh sửa ảnh?
3. Hãy mô tả quy trình xóa một chi tiết không mong muốn trong ảnh bằng công cụ Healing.



# Vùng chính sửa ảnh

## Nội dung lý thuyết
Trong quá trình chỉnh sửa ảnh, việc sử dụng các công cụ như Healing và Clone là rất quan trọng để loại bỏ các khuyết điểm không mong muốn. Công cụ Healing giúp làm mịn và hòa trộn các vùng màu sắc, trong khi công cụ Clone cho phép sao chép một phần của ảnh để thay thế cho phần không mong muốn.

### Ví dụ minh họa
- **Hình 27.5**: Ảnh cần sửa ban đầu
- **Hình 27.6**: Xoá dây điện bằng công cụ Healing
- **Hình 27.7**: So sánh kết quả tẩy vạch đen bằng Healing và Clone

## Bài tập và câu hỏi
### Nhiệm vụ 2: Thay nền trời trong ảnh cánh đồng hoa
Thay phần nền trời trong hình cánh đồng hoa (Hình 27.8) bằng một lớp màu chuyển đơn giản mô phỏng trời trong xanh.

#### Hướng dẫn:
1. Tách phần phong cảnh duy nhất chứa ảnh cánh đồng hoa.
2. Bước 1: Sau khi mở tệp ảnh chỉ có một lớp, nháy nút phải chuột vào tên lớp trong hộp thoại Layer và chọn Duplicate layer. Sửa tên lớp mới thành phong_canh. Sửa trên bản sao phong_canh để không ảnh hưởng đến ảnh gốc.

- **Hình 27.8**: Cánh đồng hoa nền trời xám
- **Hình 27.9**: Ảnh sau khi cắt phần nền trời

## Hình ảnh mô tả
- **Hình 27.5**: Ảnh cần sửa ban đầu
- **Hình 27.6**: Xoá dây điện bằng công cụ Healing
- **Hình 27.7**: So sánh kết quả tẩy vạch đen bằng Healing và Clone
- **Hình 27.8**: Cánh đồng hoa nền trời xám
- **Hình 27.9**: Ảnh sau khi cắt phần nền trời

## Bảng biểu
- Không có bảng biểu trong nội dung này.



# Bài học: Chỉnh sửa ảnh với công cụ chọn và màu nền

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách sử dụng các công cụ trong phần mềm chỉnh sửa ảnh để thực hiện việc chọn vùng và thay đổi màu nền. Các bước thực hiện sẽ giúp bạn làm quen với việc thao tác trên các lớp ảnh và sử dụng các công cụ như Eraser, Gradient, và Clone.

## Ví dụ minh họa
### Bước 1: Thêm kênh alpha
- Nháy nút chuột vào lớp `phong_canh` và chọn **Add alpha Channel**.

### Bước 2: Chọn phần bầu trời
- Sử dụng công cụ chọn tự do để chọn phần bầu trời.
- **Lưu ý**: Nên phóng to ảnh để dễ thực hiện; để đơn giản, nên cắt cả phần cây phía trên.

### Bước 3: Xóa phần đã chọn
- Nháy nút phải chuột vào vùng vừa chọn, chọn **Edit > Clear** (Hình 27.9).
- Phần lưới ô vuông xám sẽ hiển thị phần trong suốt, có thể nhìn thấy lớp bên dưới.

### Bước 4: Chỉnh lại cây
- Sử dụng công cụ **Eraser** hoặc dùng cọ vẽ để thêm viền cây cho đẹp.
- Có thể chỉnh màu sắc của cây bằng các công cụ đã học trong Bài 26.

### Bước 5: Vẽ nền trời
- Nháy nút phải chuột vào lớp dưới cùng (ảnh gốc) và chọn **New Layer**; nhập tên lớp mới là `bau_troi` trong ô Layer Name.
- Lớp `bau_troi` mới tạo sẽ nằm dưới lớp `phong_canh`.
- Để tiện thao tác với lớp này, tắt hiển thị của tất cả các lớp còn lại (nháy chuột vào hình con mắt bên cạnh mỗi lớp).

### Bước 6: Chọn màu nền
- Chọn màu nổi và màu nền là hai tông màu của màu xanh lam (các màu có giá trị `#4bgdde` và `#cle6fb`, nhập vào ô HTML notation trong hộp thoại chọn màu).

### Bước 7: Sử dụng công cụ Gradient
- Chọn công cụ màu chuyển **Gradient** trong hộp công cụ.

### Bước 8: Chọn kiểu chuyển
- Chọn kiểu chuyển **FBto GB (RGB)** trong hộp thoại Gradients.

### Bước 9: Đổ màu cho lớp
- Nháy chuột vào điểm sát phía trên cùng của ảnh, kéo thả chuột theo phương thẳng đứng xuống phía dưới để đổ màu cho lớp (Hình 27.10).
- Để xem ảnh tổng thể, hiển thị lại lớp `phong_canh` (Hình 27.11).

## Hình ảnh mô tả
- **Hình 27.10**: Đổ màu chuyển sắc cho lớp nền trời.
- **Hình 27.11**: Ảnh sau khi sửa nền trời.

## Bài tập và câu hỏi
1. Trong Nhiệm vụ 2, nếu thực hiện các bước từ 5 đến 9 trước thì khi hiển thị cả ba lớp ta thu được ảnh như thế nào?
2. Giả sử màu nổi và màu nền đang có giá trị theo hệ RGB là (100, 125, 125) và (225, 225, 0). Nếu ta thực hiện bước 3 và 4 trên lớp ảnh ban đầu (ảnh gốc sau khi mở) thì hình ảnh mới của lớp như thế nào?
3. Nếu ta cần sử dụng công cụ Clone trên một vùng ảnh hình chữ nhật thì theo em ta nên dùng đầu cọ nào?

## Vận dụng
Lấy một ảnh chụp chân dung có nhược điểm như nám, mụn. Thực hiện việc xóa các vết này bằng công cụ Clone và Healing: So sánh kết quả khi chỉ dùng một trong hai loại.
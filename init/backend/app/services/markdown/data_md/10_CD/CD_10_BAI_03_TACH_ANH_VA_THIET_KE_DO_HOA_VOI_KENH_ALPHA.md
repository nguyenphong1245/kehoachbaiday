# BÀI 3: TÁCH ẢNH VÀ THIẾT KẾ ĐỔ HOẠ VỚI KÊNH ALPHA

Học xong bài này, em sẽ:
- Hiểu được khái niệm độ "trong suốt"
- Sử dụng được kênh alpha và các kĩ thuật thiết kế dựa trên vùng chọn; đường dẫn để thiết kế được banner hoặc băng rôn.

Khi ghép hai ảnh với nhau để tạo thành một ảnh mới, em thường gặp điều gì không như mong đợi và muốn khắc phục để được kết quả đẹp hơn?

## Kênh alpha và kĩ thuật tách ảnh nhờ kênh alpha

Hình minh họa hai ảnh đích (thiệp chúc mừng sinh nhật) được tạo thành sau khi ghép hai ảnh nguồn (hộp quà và bó hoa) từ hai tệp ảnh có sẵn.

- Ở Ảnh đích 1, các ảnh có nền không "trong suốt".
- Ngược lại, ở Ảnh đích 2, chúng có nền "trong suốt".

1) Em hãy nêu tác dụng của ảnh có nền trong suốt.
2) Mức độ nhìn rõ ảnh phụ thuộc thế nào vào độ "trong suốt" của nó?

### Hình 1: Ảnh được ghép vào ảnh đích

- a) Ảnh có nền trong suốt
- b) Ảnh không có nền trong suốt

Trong các phần mềm thiết kế, chỉnh sửa đồ họa, nếu ảnh có nền trong suốt thì có thể nhìn xuyên qua ảnh đến tận "vô cùng". GIMP sử dụng mẫu ca rô đen xám xen kẽ để biểu thị giới hạn vô cùng hay nền trong suốt này (Hình 2a). Nếu dùng công cụ Eraser để tẩy một số chỗ trên ảnh thì sẽ phát hiện ra ảnh có nền trong suốt hay không.

### Hình 2:
- a) Ảnh có nền trong suốt
- b) Ảnh minh họa có nền trong suốt (đôi khi còn gọi là "ảnh không có nền")
- c) Ảnh không có nền trong suốt

Đọc sách tại học O.vn 163



# Hình 2: Ảnh không có nền và ảnh có nền

## b) Kênh alpha và kĩ thuật tách ảnh

Mỗi điểm ảnh sẽ không được nhìn thấy nếu nó có độ trong suốt hoàn toàn hoặc nhìn thấy mờ mờ nếu nó có độ trong suốt nào đó. Nói cách khác, sự hiện diện của mỗi điểm ảnh được thể hiện thông qua màu sắc cùng với độ trong suốt của nó. Vì vậy, nhiều phần mềm thiết kế, chỉnh sửa đồ họa lưu trữ và biểu thị các điểm ảnh thông qua các kênh màu.

GIMP lưu trữ ba kênh màu R, G, B và có thể được thêm một kênh lưu độ trong suốt của tất cả các điểm ảnh, gọi là kênh alpha.

Tấm thiệp ở Hình 1a thể hiện sự ghép ảnh một cách thô sơ là sản phẩm đồ họa thiếu tính tự nhiên: Do đó, trước khi ghép vào ảnh đích, các ảnh cần được tách ra khỏi nguồn công nền của nó. Tùy theo đặc điểm của ảnh cần tách khỏi nền mà sử dụng công cụ tách ảnh hợp.

### Công cụ Free Select

Sau đây là cách tách ảnh bằng công cụ Free Select:

**Bước 1:** Chọn ảnh và thêm kênh alpha vào lớp ảnh nguồn
- Chọn lớp ảnh cần xử lý, ví dụ chọn lớp ảnh Hộp quà.
- Thêm kênh alpha vào lớp ảnh bằng cách thực hiện lệnh Add Alpha Channel từ bảng chọn Layer > Transparency hoặc từ bảng chọn được mở ra khi nháy chuột phải vào tên lớp. Ảnh bây giờ có nền trong suốt nên có thể chọn phải vào tên lớp và tách các đối tượng ra khỏi nền.

**Bước 2:** Chọn đối tượng cần tách ra khỏi nền ảnh
- Nháy chuột chọn công cụ Free Select rồi bắt đầu từ một điểm bất kỳ trên biên đối tượng; lần lượt nháy chuột vào xung quanh đối tượng cần tách; ví dụ như Hình 3a.
- Khi chọn đến chi tiết nhỏ, khó nhìn rõ, nhấn giữ Ctrl và lăn nút cuộn chuột để phóng to hay thu nhỏ ảnh cho phù hợp. Khi phóng to ảnh, vị trí thao tác có thể chạy ra xa; nhấn giữ phím Space và di chuyển chuột để di chuyển khung ảnh sao cho nhìn thấy vị trí này; ví dụ như Hình 3.
- Điểm chọn cuối cùng được xác định bằng cách nháy chuột trùng với điểm xuất phát. Khi đó, một vùng chọn bao quanh đối tượng xuất hiện, nó biểu thị đối tượng.



# Hình 3. Chọn một đối tượng bằng công cụ Free Select

- Vùng chọn đối tượng. Toàn bộ phần ảnh xung quanh hộp quà sẽ được chọn:
- Đảo ngược vùng chọn rồi bỏ chọn: Theo ví dụ trên, toàn bộ phần ảnh xung quanh hộp quà bị xoá. Lớp ảnh Hộp quà bây giờ có nền trong suốt.

## Xác định vùng chọn đối tượng từ kênh alpha trong thiết kế đồ họa

Trong Hình 4a và Hình 4b, lớp Tam giác chứa duy nhất hoạ tiết màu đen: Hãy nêu cách thực hiện tạo thêm một hoạ tiết giống như vậy và chỉnh sửa để được kết quả như Hình 4c.

| Tam g 2 | Mau nen | Khung | Ner | Background |
|---------|---------|-------|-----|------------|

# Hình 4 Thiết kế tiết mới hoa

- Vùng chọn đối tượng được sử dụng để thiết kế, chỉnh sửa cho chính đối tượng đó hoặc cho đối tượng thuộc lớp ảnh khác.

Đọc sách tại học O.vn 165



# Vi dụ
Sau khi thiết kế xong hoạ tiết ở Hình 4c, ta muốn tô lại màu cho hoa tiết tam giác thành màu xanh như Hình 5. Để làm điều này, chọn lớp Tam giác, chuyển kênh alpha của lớp sang vùng chọn bằng lệnh `Layer > Transparency > Alpha to Selection` hoặc nháy chuột phải vào tên lớp ở bảng điều khiển lớp và chọn lệnh `Alpha to Selection`. Sau đó tiến hành tô màu xanh cho vùng chọn và bỏ vùng chọn.

**Hình 5. Tô lại màu cho một lớp**

----

## Thực hành

### Bài 1. Tạo thiệp chúc mừng với ảnh được tách khỏi nền
Em hãy tạo một thiệp chúc mừng sinh nhật như Hình 1b, trong đó các ảnh (hộp quà và bó hoa) được tách khỏi nền. Có thể thay đổi nội dung nguồn các ảnh bằng ảnh khác.

**Gợi ý thực hiện:**
- Sử dụng kỹ thuật tách ảnh để tách các ảnh ra khỏi nền trước khi sao chép vào ảnh đích.

### Bài 2. Tạo banner "ICT GROUP 10A5"
Em hãy tạo banner "ICT GROUP 10A5" như Hình 6 sau đây.

**Hình 6. Banner ICT GROUP 10A5**

**Gợi ý thực hiện:**
- Sử dụng sản phẩm của bài tập Vận dụng thuộc Bài học 2 để làm logo cho banner.
- Tạo thêm một dải nơ cho logo này.
- Tách ảnh logo khỏi nền nếu cần thiết.
- Tạo tệp ảnh mới để thiết kế banner.
- Tạo nền banner và tô màu gradient cho nền.
- Sao chép ảnh logo vào banner.
- Tạo các hoạ tiết đường cong cho banner bằng kỹ thuật cắt xén.
- Trong quá trình thiết kế, các chi tiết có thể tô lại màu sắc bằng các chuyển lớp.



# Em hãy thiết kế một trong các sản phẩm đồ họa như: áp phích, banner; rôn; theo nhu cầu và sở thích của mình.

## Lưu sản phẩm và xuất ra một tệp ảnh với định dạng chuẩn:
Sau đây là một số ví dụ về logo và áp phích:

----

## Em đồng ý với những phát biểu nào sau đây?
Trong phần mềm thiết kế đồ họa như phần mềm GIMP:

1. Độ trong suốt của ảnh tỉ lệ thuận với mức độ nhìn rõ ảnh.
2. Tách ảnh khỏi nền là loại bỏ lớp nền hay nói cách khác là tạo ra một lớp nền trong suốt.
3. Việc chuyển kênh alpha của một ảnh vào vùng chọn sẽ giúp chọn được các đối tượng trên lớp đó.
4. Cho dù đối tượng được thiết kế phức tạp thế nào thì luôn chọn được nó nhờ kênh alpha của lớp chứa nó vào vùng chọn.
5. Sử dụng logo, hay các sản phẩm đơn giản như áp phích, poster; banner hoặc rôn.

----

## Tóm tắt bài học
Trong các phần mềm thiết kế đồ họa như GIMP:

### Khái niệm:
- Độ trong suốt của điểm ảnh thể hiện mức độ rõ nét của nó: Điểm ảnh càng trong suốt thì càng không nhìn thấy rõ nó. Ảnh không có nền (còn gọi là nền không màu) là ảnh có lớp nền trong suốt.
- Các điểm ảnh trên lớp ảnh được thể hiện và lưu trữ trên các kênh màu và kênh alpha. Trong đó, kênh alpha thể hiện độ trong suốt (hay độ không nhìn rõ) của các điểm ảnh.
- Có hai thao tác cơ bản với kênh alpha đó là: thêm kênh alpha vào một lớp ảnh và chuyển kênh alpha của một lớp ảnh vào vùng chọn.

### Các kĩ thuật thiết kế cơ bản:
- Tách ảnh (sau khi thêm kênh alpha vào lớp chứa ảnh cần tách).
- Xử lý một vùng chọn trên ảnh (với vùng chọn được xác định từ kênh alpha của một lớp ảnh nào đó).

----

Đọc sách tại hoc10.vn
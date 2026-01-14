# BÀI 2: TẨY XOÁ ẢNH

Học xong bài này, em sẽ:
- Thực hiện được cách tẩy xoá ảnh bằng các công cụ Clone và Healing.
- Thực hiện được cách sao chép ảnh theo phép phối cảnh bằng công cụ Perspective Clone.

Hiện trạng của khu du lịch thác Dray Nur như ở Hình 1a. Để chuẩn bị cho việc chỉnh trang khu du lịch, người quản lí đã nhờ người thiết kế cảnh quan như Hình 1b. Em hãy chỉ ra các điểm khác biệt giữa hai hình này: Theo em, bằng cách nào ta có thể nhận được bức ảnh ở Hình 1b?

![Hình 1. Cảnh thác Dray Nur; tỉnh Đắk Lắk](#)

## Tẩy xoá ảnh bằng công cụ Clone

Tẩy xoá ảnh là loại bỏ những chi tiết nào đó trong ảnh, đồng thời thay chúng bằng những chi tiết khác phù hợp sao cho ảnh không để lại dấu vết đã tẩy xoá.

Ví dụ, ở vị trí 1 trong Hình 2, sau khi loại bỏ cái cây bị cắt cụt cành và thay bằng một thảm cỏ sẽ nhận được kết quả như ở Hình 1b. Các chi tiết ở vị trí 2 và 3 cũng được chỉnh sửa tương tự.

![Hình 2. Các vị trí tẩy xoá](#)

Để tẩy xoá và phục hồi ảnh trong GIMP, sử dụng các công cụ Clone và Healing. Dưới đây là cách sử dụng công cụ Clone:

### Bước 1: Chọn công cụ Clone
- Phóng to ảnh và di chuyển ảnh để tập trung vào vùng ảnh cần xử lý (Hình 3a).
- Nháy chuột chọn công cụ Clone. Nó được xem như một cái bút lông.
- Trong tùy chọn của công cụ, mở danh sách Brush (bút lông) và chọn kiểu của bút lông tùy theo độ phóng to và màu sắc của vùng ảnh được xử lý (Hình 3b).



# Chọn các tham số cho công cụ (Hình 3c)

- **Size** (độ lớn của đầu bút)
- **Hardness** (độ sắc cạnh)
- **Force** (độ ấn mạnh)

| Tham số        | Giá trị     |
|----------------|-------------|
| Brush          | [clone]     |
| Hardness       | 0.75        |
| Mode           | Normal      |
| Opacity        | 100         |
| Size           | 30.00       |
| Aspect Ratio   | 00o         |
| Angle          | 00o         |
| Force          | 700         |

**Hình 3.** Ví dụ phóng to ảnh và chọn các tham số cho công cụ Clone

## Bước 2. Lấy mẫu

Nhấn, giữ **Ctrl** khi nháy chuột vào một điểm ảnh cần lấy mẫu để áp dụng vào vùng ảnh cần tẩy xoá. Ví dụ, nháy chuột vào một điểm trên mặt nước, gần chỗ cành cây (Hình 4a).

**Hình 4.** Ví dụ lấy mẫu để áp dụng cho vùng ảnh cần tẩy xoá

## Bước 3. Thực hiện tẩy xoá ảnh dựa trên mẫu

Nháy chuột vào những điểm ảnh cần tẩy xoá. Sau mỗi lần nháy chuột, điểm ảnh tại chỗ vừa nháy chuột sẽ có màu sắc như điểm ảnh mẫu. Theo ví dụ, nháy chuột vào những chỗ thuộc cành cây để biến nó thành mặt nước (Hình 4b).

Khi thấy thích hợp, có thể kéo thả chuột lên vùng ảnh cần xoá để tốc độ tẩy xoá nhanh hơn và tăng độ tương đồng với vùng ảnh mẫu.



# Chú ý:
Lặp lại Bước 2 và Bước 3 trên dây nếu cẩn thận thay đổi điểm ảnh mẫu. Sau khi phần cành cây chỗ mặt nước, để xoá phần thân cây trên nền cỏ xanh, cần lấy lại mẫu mới là một điểm nào đó trên dải cỏ xanh.

Như vậy, công cụ Clone lấy mẫu của một vùng ảnh (gọi là vùng mẫu) để áp dụng vào vùng cần tẩy xoá trong ảnh (gọi là vùng đích).

## Tẩy xoá ảnh bằng công cụ Healing

Khi sử dụng công cụ Clone để chỉnh sửa ảnh ở các vị trí được chỉ ra trong Hình 2, trên ảnh lộ ra khá rõ chỗ tẩy xoá. Theo em, tại sao công cụ Clone có hạn chế này?

Công cụ Healing cũng có cách sử dụng tương tự như công cụ Clone; ngoài ra, công cụ Healing không chỉ có tác dụng như công cụ Clone mà còn hoà trộn độ sáng và sắc thái của các điểm ảnh giữa vùng mẫu và vùng đích để làm cho những điểm ảnh được chỉnh sửa không có sự khác biệt với những điểm ảnh còn lại.

Việc loại bỏ một chi tiết trên ảnh bằng công cụ Clone làm lộ ra dấu vết tẩy xoá tại đường biên của vùng ảnh bị tẩy xoá. Cần sử dụng công cụ Healing tô lên đường biên này để làm mờ vết tẩy xoá.

### Ví dụ
Dấu vết tẩy xoá ở Hình 5a được xử lý bằng công cụ Healing và nhận được vùng ảnh nhìn tự nhiên hơn như ở Hình 5b.

#### Hình 5.
Ví dụ xử lý dấu vết của vùng ảnh bị tẩy xoá.

## Sao chép ảnh theo phép biến đổi cảnh bằng công cụ Perspective Clone

Hình 6a và Hình 6b đều thể hiện kết quả sao chép hai cái cây từ vị trí 1 đến vị trí 2 của cùng một ảnh. Theo em, nếu sử dụng công cụ Clone thì sẽ tạo ra được kết quả nào (Hình 6a hay Hình 6b)? Tại sao?



# Hình 6: Ví dụ xử lý vùng ảnh tẩy xóa bị lộ ra

Công cụ Clone hoạt động như một công cụ sao chép các đối tượng mẫu. Đối tượng đích (kết quả) giống hệt đối tượng mẫu. Trong nhiều trường hợp, đối tượng đích được mong đợi là kết quả của một phép biến đổi cảnh của đối tượng mẫu. Ví dụ, Hình 6b cho thấy đối tượng đích ở vị trí 2 đồng phối cảnh với đối tượng mẫu ở vị trí 1. Công cụ Perspective Clone giúp thực hiện phép biến đổi này. Cách sử dụng công cụ như sau:

## Bước 1: Chọn công cụ Perspective Clone
- Nháy chuột chọn công cụ Perspective Clone.
- Ở bảng tùy chọn của công cụ, chọn chế độ Modify Perspective để làm xuất hiện một khung mờ xung quanh ảnh, gọi là khung phối cảnh; ví dụ như ở Hình 7.
- Trên khung có các điểm điều khiển là các ô vuông nhỏ ở các góc và trên các cạnh. Để nhìn thấy khung này, cần thu nhỏ ảnh.

### Hình 7: Ví dụ khung cảnh xuất hiện

## Bước 2: Xác định hình dạng khung phối cảnh
- Kéo thả chuột tại các điểm điều khiển trên khung phối cảnh để xác định hình dạng mà nó biểu thị phép đồng dạng phối cảnh của đối tượng mẫu. Phép biến đổi này sẽ được áp dụng để tạo đối tượng đích.

### Hình 8: Minh họa hình dáng của khung cảnh (nó được tô lại bằng màu vàng cho dễ nhìn)

### Hình 8: Ví dụ tạo khung cảnh phối 1

----

97



# Bước 3. Sao chép

## Phối cảnh

- Bằng tùy chọn của công cụ, chọn chế độ **Perspective Clone**.
- Khung phối cảnh tạm ẩn.

Nhấn phím **Ctrl** và nháy chuột vào một điểm trên đối tượng mẫu, ví dụ ở vị trí trong **Hình 9**.

Nháy chuột vào một điểm nào đó được chọn là vị trí xuất phát để tạo đối tượng đích. Ví dụ đó là vị trí 2 trong **Hình 9**.

Nháy chuột hoặc kéo thả chuột trên vùng ảnh cần tạo đối tượng đích. Nháy hoặc kéo thả chuột đến đâu, đối tượng đích hiện ra đến đó và thể hiện kết quả sao chép đối tượng mẫu theo phép đồng dạng đã xác định.

Tiếp tục quá trình này cho đến khi đối tượng đích được tạo đầy đủ.

# Bước 4. Hoàn thiện

Đối tượng đích có thể có những chi tiết thừa hoặc bất hợp lý khi được sao chép từ đối tượng mẫu. Do đó, sau khi đối tượng đích được tạo xong, cần sử dụng công cụ **Clone** và có thể kết hợp với công cụ **Healing** để loại bỏ các chi tiết này. Cuối cùng thu được sản phẩm mong đợi, ví dụ như ảnh ở **Hình 9**.

## Thực hành tẩy xóa ảnh

### Yêu cầu:

Một cảnh cua thị xã Cửa Lò được chụp trong bức ảnh ở **Hình 10a**. Nếu nhìn ảnh với đúng kích thước của nó sẽ thấy rõ khu đất ở vị trí chưa được xây dựng, có sỏi đá, cát rất bừa bộn. Nó làm cho bức ảnh bị xấu đi nhiều. Theo quy hoạch, mảnh đất này sẽ được làm sân bóng chuyền với cây cối xung quanh tương tự như mảnh đất ở vị trí 2. Hãy sử dụng GIMP để tạo ra bức ảnh như ở **Hình 10b** để xem trước kết quả quy hoạch mảnh đất nói trên.

### Hướng dẫn thực hiện:

1. Chọn công cụ **Perspective Clone**:
- Thu nhỏ ảnh và nháy chuột chọn công cụ **Perspective Clone**.
- Chọn chế độ **Modify Perspective** để làm xuất hiện khung phối cảnh.

![Hình 10. Xem trước ảnh quy hoạch một khu đất



# Bước 2. Xác định hình dạng khung phổi
Cảnh: Kéo thả chuột tại các điểm điều khiển cạnh và các góc trên khung để có hình dạng khu đất cần quy hoạch. Kết quả nhận được như ở Hình 11.

# Bước 3. Sao chép cảnh
Chọn chế độ Perspective Clone rồi thực hiện trình nhấn phím Ctrl và nháy chuột lấy mẫu ảnh từ khu đất ở vị trí 2 sau đó nhân hoặc kéo thả chuột trên ảnh khu đất ở vị trí để sao chép mẫu theo phép phối cảnh. Kết quả được như ở Hình 12.

# Bước 4. Hoàn thiện
Sử dụng công cụ Clone để tẩy xoá chỗ đất và rác bừa bộn xung quanh và thay bằng tán lá cây ở khu vực ảnh lấy mẫu. Kết quả nhận được như ở Hình 10b.

Em hãy lựa chọn một ảnh chứa đối tượng cần loại bỏ. Sau đó, tiến hành tẩy xoá đối tượng này đồng thời khôi phục vùng ảnh chỗ tẩy xoá một cách hợp lý.

## Trong bảng sau, em hãy cho biết các công cụ ở cột A có tác dụng nào được nêu ở cột B?

| A                     | B                                                                 |
|-----------------------|-------------------------------------------------------------------|
| 1) Clone              | a) Sao chép và hoà trộn màu sắc của điểm ảnh ở vùng mẫu với điểm ảnh ở vùng đích |
| 2) Healing            | b) Sao chép điểm ảnh ở vùng mẫu đến vùng đích theo một cách xác định |
| 3) Perspective Clone   | c) Sao chép nguyên văn điểm ảnh ở vùng mẫu đến vùng đích        |

# Tóm tắt bài học
- Công cụ Clone dùng để sao chép y nguyên hình dạng, kích thước vùng mẫu sang vùng đích.
- Công cụ Perspective Clone dùng để sao chép từ vùng mẫu sang vùng đích theo một phép biến đổi đồng dạng phối cảnh.
- Công cụ Healing dùng để sao chép, hoà trộn màu sắc và ánh sáng giữa vùng mẫu với vùng đích.
- Các công cụ Clone, Perspective Clone và Healing giúp tẩy xoá các dấu vết trên ảnh, giúp thay thế một chi tiết trên ảnh bằng một chi tiết khác có trên ảnh đó.
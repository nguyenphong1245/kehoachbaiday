# CHỦ ĐỀ ICT: PHẦN MỀM THIẾT KẾ ĐỒ HỌA

## BÀI: TẠO VĂN BẢN TÔ MÀU VÀ GHÉP ẢNH

Học xong bài này, em sẽ:
- Bước đầu quen được với một số thành phần chính trong màn hình làm việc của GIMP.
- Tạo được tệp ảnh mới; lưu được tệp ảnh và xuất tệp ảnh với định dạng chuẩn.
- Bước đầu nhận diện được các lớp ảnh; chọn và đổi được tên lớp ảnh.
- Bước đầu sử dụng được các công cụ tô màu ảnh đơn giản để tạo sản phẩm đồ họa như thiệp chúc mừng, thiệp mời, bưu thiếp.

Em đã bao giờ dùng phần mềm để tạo ra những sản phẩm như thiệp chúc mừng, bưu thiếp hay một áp phích (poster) chưa? Em hãy giới thiệu sơ lược về một phần mềm như vậy:

### Phần mềm thiết kế đồ họa và GIMP

1. Theo em, để tạo được các bưu thiếp đẹp bằng một phần mềm thì phần mềm đó cần cung cấp những khả năng gì?

#### Sản phẩm đồ họa và phần mềm thiết kế đồ họa

Hình 1 là ảnh minh họa cho một thiếp chúc mừng sinh nhật được tạo bởi phần mềm thiết kế đồ họa.

| Sản phẩm đồ họa | Phần mềm thiết kế đồ họa |
|------------------|---------------------------|
| Logo             | Banner                    |
| Băng rôn        | Áp phích (poster)        |
| Thiệp chúc mừng  |                          |

**Chúc bạn sinh nhật vui vẻ!**
**Kỷ niệm (15 tuổi) - Chúc bạn thành công trong học tập!**
**Hình 1: Thiệp chúc mừng sinh nhật**

### b) Giới thiệu phần mềm GIMP

Phần mềm thiết kế, chỉnh sửa đồ họa sẽ hỗ trợ tạo ra sản phẩm đồ họa vector hay ảnh raster.



# Đổ họa vector và raster

Đổ họa vector sử dụng các tọa độ trong mặt phẳng và mối quan hệ vector để tạo ra các đường giữa chúng với các thuộc tính như màu nét, hình dạng, độ dày để biểu diễn hình ảnh. Ảnh được tạo theo cách này được gọi là ảnh vector. Đổ họa raster sử dụng ma trận các điểm ảnh với màu sắc và sắc thái khác nhau để biểu diễn hình ảnh. Ảnh được tạo theo cách này được gọi là ảnh raster (hay ảnh bitmap).

## GIMP

GIMP (viết tắt của "GNU Image Manipulation Program") là phần mềm xử lý ảnh mã nguồn mở, miễn phí, trợ giúp một cách hiệu quả cả hai việc chỉnh sửa ảnh và thiết kế đồ họa dựa trên đổ họa raster. Hơn nữa, mặc dù GIMP xử lý đồ họa raster, nó cũng hỗ trợ đổ họa vector. Do vậy có thể khai thác GIMP cho các chủ đề về chỉnh sửa ảnh, làm video; hoạt hình. Có thể tải phần mềm GIMP từ https://www.gimp.org. Phiên bản GIMP được sử dụng trong sách giáo khoa là 2.10.x.

### Màn hình làm việc của GIMP

Màn hình làm việc của một giao diện của GIMP (Hình 2) có các thành phần chính sau:

- **Hệ thống bảng chọn** chứa các lệnh của phần mềm.
- **Hộp công cụ (Toolbox)** chứa các công cụ thiết kế và chỉnh sửa như: tạo văn bản; chọn; cắt, xóa; vẽ, tô màu và biến đổi hình. Các thuộc tính của công cụ được chọn ở bảng tùy chọn.
- **Các bảng quản lý lớp ảnh**, kênh màu và đường dẫn chứa các lệnh làm việc với các lớp ảnh (thường gọi tắt là lớp), các kênh màu và các đường dẫn.

| Thành phần | Mô tả |
|------------|-------|
| Hệ thống bảng chọn | Chứa các lệnh của phần mềm |
| Hộp công cụ | Chứa các công cụ thiết kế và chỉnh sửa |
| Bảng quản lý lớp ảnh | Quản lý các lớp ảnh, kênh màu và đường dẫn |

### Hình 2. Màn hình làm việc của GIMP

![Màn hình làm việc của GIMP](https://www.hoc1o.vn/hinh2.png)

Chúc mừng sinh nhật Trung Anh! Chúc bạn sinh nhật vui vẻ và nhiều niềm vui!



# Tạo tệp ảnh mới

Chọn **File > New**, GIMP đưa ra hộp thoại hỏi về các tham số để tạo tệp ảnh mới (Hình 3).

## Create New Image

| Template:          |                     | | |
|--------------------|---------------------|---|---|
| Kích thước ảnh     | Image Size          | | |
| Width:             | 24.000              | | |
| Height:            | 36.000              | | |
| Đơn vị             | 1728 x 2592 pixels  | | |
|                    | PPI RGB color       | | |
| **Advanced Options**|                     | | |
| Độ phân giải &#x26;nh   |                     | | |
| X resolution:      | 72.000              | | |
| Y resolution:      | 72.000              | | |
| Color space:       | RGB color           | | |
| Precision:         | 8-bit integer       | | |
| **Color manage this image** |             | | |
| Color profile:     | [Built-in RGB (GIMP built-in sRGB)] | | |
| Fill with:         | Background color    | | |
| Comment:           | Created with GIMP   | | |
| **Help**           | **Reset**          | **@K** | **Cancel** |

**Hình 3. Hộp thoại tạo tệp ảnh mới**

Ví dụ: Thiệp chúc mừng sinh nhật có thể được tạo trên tệp ảnh mới với kích thước 15 x 8 (cm), không gian màu là RGB. Tệp ảnh mới sẽ có "ảnh trống" trong cửa sổ ảnh. Lớp ảnh nền có tên mặc định là **Background** được hiển thị trong bảng quản lý lớp ảnh.

## Tô màu

Khi thực hiện công việc "tô màu", đối tượng được tô hay phủ màu có thể là hậu cảnh (nền ảnh) hoặc tiền cảnh (văn bản, hình vẽ, vùng chọn trên ảnh).

Để thay đổi màu tiền cảnh (FG) hoặc hậu cảnh (BG), nháy chuột vào biểu tượng FG hoặc BG (Hình 4) rồi chọn màu trong hộp thoại chọn màu xuất hiện ngay sau đó.

Có hai cách tô màu: tô màu thuần nhất và tô màu gradient.

### Tô màu thuần nhất

Tô màu thuần nhất là một màu duy nhất lên bề mặt đối tượng. Để tô màu, nháy chuột vào công cụ **Bucket Fill** (công cụ tô mặc định là màu FG) rồi nháy chuột vào một vị trí nào đó trên đối tượng cần tô màu.

**Hình 4. Biểu tượng cặp màu FG/BG**



# Hình 5. Tô màu thuần nhất

## Tô màu gradient

Tô màu gradient là phủ lên bề mặt đối tượng một dải màu chuyển dần từ màu thứ nhất sang màu thứ hai. Để tô màu, nháy chuột vào công cụ Gradient sau đó chọn các vị trí nào đó bên cạnh hoặc bên trên đối tượng cần tô màu. Hình 6 minh hoạ một cách xác định đường cơ sở và kết quả tô màu gradient cho nền ảnh. Dải màu gradient thể hiện sự chuyển dần từ màu FG (xanh dương) sang BG (trắng).

## Tạo văn bản

Văn bản được tạo bằng công cụ Text với các thuộc tính định dạng được chỉ ra ở Hình 7. Để tạo một đoạn văn bản; nháy chuột vào công cụ Text, chọn các thuộc tính định dạng rồi nháy chuột vào vị trí cần chèn văn bản trong cửa sổ ảnh để nhập văn bản. Để kết thúc, nháy chuột vào công cụ khác (thường là công cụ di chuyển Move).

Khi tạo xong, một lớp mới với biểu tượng là  được tự động tạo ra để chứa văn bản. Tên lớp trùng với nội dung văn bản.

### Bảng tùy chọn các thuộc tính định dạng của công cụ Text

| Thuộc tính         | Giá trị                     |
|--------------------|----------------------------|
| Font               | Chọn kiểu chữ              |
| Size               | Chọn cỡ chữ                |
| Color              | Chọn màu chữ               |
| Justify            | Chọn kiểu căn biên         |
| Line spacing       | Chọn độ giãn dòng          |
| Letter spacing     | Chọn độ giãn chữ           |

Hình 7. Bảng tùy chọn các thuộc tính định dạng của công cụ Text

Khi công cụ Text không được chọn, văn bản được xem như một đối tượng đồ họa.



# Mở tệp ảnh và ghép ảnh

## 1. Giới thiệu
Ảnh nguồn để ghép thường được xử lý trước khi ghép bằng các phép biến đổi ảnh. Em hãy tìm hiểu và cho biết các cách biến đổi ảnh như: thay đổi kích thước, xoay; lật và biến dạng ảnh.

## 2. Mở tệp ảnh
Có thể mở một hoặc nhiều tệp ảnh trong GIMP bằng lệnh `File > Open`; nhưng tại một thời điểm, cửa sổ ảnh chỉ hiển thị ảnh của một tệp. Danh sách các biểu tượng tệp ảnh đang mở nằm ở phía trên cửa sổ ảnh. Nếu muốn đóng một tệp ảnh, nháy dấu `X` bên cạnh biểu tượng tệp ảnh.

## 3. Ghép ảnh
Có thể ghép một phần hoặc toàn bộ ảnh vào trong ảnh đích bằng các bước sau:

1. **Chọn ảnh nguồn** và thực hiện các xử lý cần thiết (biến đổi ảnh).
2. **Sao chép ảnh** vào ảnh đích, điều chỉnh kích thước và vị trí ảnh mới ghép vào cho phù hợp.

Em hãy thực hiện ghép ảnh để thiết kế một thiệp chúc mừng sinh nhật như ở Hình 8.

### Hình 8. Thiệp chúc mừng sinh nhật
```
Chúc mừng sinh nhật
Trung Anh

Chúc em luôn tiến bộ, thành công trong học tập
```

## 4. Hướng dẫn thực hiện
### Bước 1
Chọn ảnh từ một tệp ảnh đã mở và thực hiện các xử lý cần thiết. Có thể dùng công cụ `Crop` để cắt; cẩn lấy ở ảnh nguồn; sau đó chọn phần lớp ảnh rồi thực hiện lệnh `Edit > Copy`.

### Bước 2
Sao chép ảnh nguồn thành một lớp mới của ảnh đích và thực hiện các điều chỉnh cần thiết cho lớp ảnh mới. Chọn tệp ảnh đích; chọn một lớp ảnh, ví dụ lớp `Background`, thực hiện lệnh `Edit > Paste`. Một lớp động được tự động tạo ra ở phía trên lớp đã chọn để chứa ảnh được sao chép và có tên tạm thời là `Floating Selection` (Hình 9).

## 5. Kết luận
Đọc sách tại học O.vn.



# Hướng dẫn sử dụng phần mềm thiết kế đồ họa

## Tạo lớp mới
Nháy chuột vào nút lệnh **New Layer** để tạo lớp mới. Tên lớp mới mặc định là tên tệp ảnh nguồn. Nên đổi lại tên lớp mới này bằng cách nháy đúp chuột vào tên lớp rồi gõ tên mới.

## Kích thước và vị trí ảnh
Ảnh mới được ghép thường có kích thước và vị trí phù hợp (Hình 9a). Dùng công cụ **Scale** để thay đổi kích thước ảnh và công cụ **Move** để di chuyển ảnh đến vị trí phù hợp.

### Hình 9. Sao chép ảnh vào ảnh đích

## Bài tập thực hành
Em hãy tạo một thiệp chúc mừng sinh nhật bạn hoặc người thân. Lưu sản phẩm với tên tệp là "Chúc mừng sinh nhật.cxf" và xuất sang định dạng JPG bằng cách thực hiện lệnh **File > Export As**.

## Phát biểu đồng ý
Em đồng ý với những phát biểu nào sau đây?

1. Trong phần mềm thiết kế đồ họa:
- Phần mềm GIMP:
- Ví dụ như: tạo và tô màu.
2. Có thể tô nền một màu duy nhất hoặc tô hai màu dần cho nhau chuyển.
3. Văn bản được tạo cũng có các thuộc tính định dạng cơ bản như: kiểu chữ, cỡ chữ, màu sắc.
4. Không thể mở nhiều tệp ảnh để lựa chọn và sao chép sang tệp ảnh đích.

## Tóm tắt bài học
Màn hình làm việc của một phần mềm thiết kế đồ họa thường có các thành phần chính là: hệ thống bảng chọn; hộp công cụ; các tùy chọn và các bảng (quản lý lớp; kênh màu và đường dẫn). Có thể chỉnh sửa ảnh có sẵn; có thể ghép vào ảnh khác tạo thành sản phẩm đồ họa mới. Phần mềm thiết kế đồ họa cung cấp các công cụ tạo văn bản; tô màu và biến đổi hình.
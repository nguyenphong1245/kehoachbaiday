# ÂM THANH

## Bản chất của âm thanh
Âm thanh truyền đi bằng sóng âm. Sóng âm có dạng hình sin, trong đó trục hoành là trục thời gian; thể hiện biên độ của tín hiệu. Tín hiệu âm thanh có đồ thị liên tục như vậy là tín hiệu âm thanh tương tự (analog).

Để xử lý một cách hiệu quả, âm thanh cần được lưu trữ số hóa (âm thanh số). Vậy âm thanh được tạo ra như thế nào?

## Nguyên tắc cơ bản số hóa âm thanh
Nguyên tắc cơ bản số hóa âm thanh là điều chế mã xung (Pulse Code Modulation - PCM) được thực hiện theo các bước như sau:

### Hình 6.1. Đồ thị của sóng âm
![Hình 6.1](link_to_image)
*Ghi chú: Hình 6.1 mô tả đồ thị của sóng âm với các giá trị biên độ khác nhau.*

### Bảng giá trị mẫu
| Biên độ | Giá trị mẫu |
|---------|-------------|
| 255     |             |
| 223     |             |
| 175     |             |
| 191     |             |
| 159     |             |
| 127     |             |
| 95      |             |
| 63      |             |
| 31      |             |
| 0       |             |

*Một chu kỳ lấy mẫu với thang 255 mức.*

## Ví dụ minh họa
- Khi một âm thanh được ghi lại, nó sẽ được chuyển đổi thành các giá trị số tương ứng với biên độ của sóng âm tại các thời điểm khác nhau.

## Bài tập và câu hỏi
1. Giải thích khái niệm sóng âm và biên độ.
2. Nêu các bước trong quá trình số hóa âm thanh.
3. Vẽ đồ thị sóng âm cho một âm thanh đơn giản và chỉ ra các giá trị biên độ.

----

*Lưu ý: Nội dung trên được trích xuất và giữ nguyên cấu trúc từ tài liệu gốc.*



**Tiêu đề bài học:** Âm thanh số và các phương pháp nén âm thanh

**Nội dung lý thuyết:**
Âm thanh số là dạng biểu diễn âm thanh dưới dạng số liệu, thường được sử dụng trong các thiết bị điện tử. Để chuyển đổi âm thanh từ dạng tương tự sang dạng số, cần có các mạch điện tử chuyên dụng như Bộ chuyển đổi tương tự sang số (ADC). Ngược lại, để phát lại âm thanh số, cần có mạch điện tử gọi là Bộ chuyển đổi số sang tương tự (DAC), có chức năng tạo lại tín hiệu tương tự từ tín hiệu số.

Âm thanh số thường được lưu trữ dưới dạng các tệp âm thanh. Một trong những phương pháp phổ biến để mã hóa âm thanh là phương pháp PCM (Pulse Code Modulation), tuy nhiên, phương pháp này tạo ra các tệp âm thanh có kích thước lớn. Do đó, người ta đã phát triển các phương pháp nén âm thanh để giảm kích thước tệp mà vẫn giữ được chất lượng âm thanh.

Có hai phương pháp chính để nén âm thanh:
1. Nén dữ liệu không làm giảm chất lượng âm thanh (lossless).
2. Bỏ bớt một phần thông tin âm thanh mà vẫn chấp nhận được sự giảm chất lượng (lossy).

Một trong các định dạng âm thanh thông dụng là MP3, có kích thước tệp nhỏ hơn khoảng 10 lần so với định dạng WAV, nhưng vẫn giữ được chất lượng âm thanh chấp nhận được.

**Ví dụ minh họa:**
- Định dạng WAV: Thường được sử dụng trong các ứng dụng trên Windows, chất lượng âm thanh cao nhưng kích thước tệp lớn.
- Định dạng MP3: Thích hợp cho việc lưu trữ và phát nhạc trên các thiết bị di động, với kích thước tệp nhỏ hơn nhiều so với WAV.

**Bài tập và câu hỏi:**
1. Giải thích sự khác nhau giữa định dạng âm thanh WAV và MP3.
2. Nêu các ưu điểm và nhược điểm của phương pháp nén âm thanh không mất mát và mất mát.
3. Tại sao cần phải nén âm thanh trong các ứng dụng hiện nay?

**Hình ảnh mô tả:**
- Hình ảnh minh họa về cấu trúc của mạch ADC và DAC (ghi chú: Hình ảnh này cho thấy cách thức hoạt động của các bộ chuyển đổi âm thanh).

**Bảng biểu:**
| Định dạng âm thanh | Kích thước tệp | Chất lượng âm thanh | Phương pháp nén |
|--------------------|----------------|---------------------|------------------|
| WAV                | Lớn            | Cao                 | Không nén        |
| MP3                | Nhỏ            | Chấp nhận được      | Nén mất mát      |




# Bài học: Độ sâu màu và điểm ảnh

## Nội dung lý thuyết
Trong đồ họa máy tính, điểm ảnh (hay pixel) là đơn vị nhỏ nhất của hình ảnh. Mỗi điểm ảnh được tạo thành từ ba diode cạnh nhau phát sáng theo hệ RGB (Đỏ, Xanh lá, Xanh dương) để tạo thành một màu sắc tự nhiên nhất. Tập hợp thông tin màu của các điểm ảnh tạo nên hình ảnh hoàn chỉnh.

Điểm ảnh trong tiếng Anh gọi là "pixel" (viết tắt của "picture element"). Ảnh được tạo thành từ từng điểm ảnh gọi là ảnh raster. Để mã hóa thông tin màu, mỗi điểm ảnh cần có độ sâu màu (color depth). Độ sâu màu càng lớn thì màu sắc của ảnh càng phong phú.

Ảnh màu thông dụng có độ sâu màu 24 bit, trong đó mỗi màu cơ bản (Đỏ, Xanh lá, Xanh dương) được mã hóa bằng 8 bit, tương ứng với 256 sắc độ khác nhau. Ví dụ, mã màu 255 trong hệ thập phân được biểu diễn là 11111111 trong hệ nhị phân.

## Ví dụ minh họa
- Mã màu 255 (Đỏ): `11111111`
- Mã màu 0 (Đen): `00000000`
- Mã màu 128 (Xám): `10000000`

### Bảng mã màu
| Độ sâu màu | Số mức xám |
|------------|------------|
| 2          | 4          |
| 4          | 16         |
| 8          | 256        |

## Bài tập và câu hỏi
1. Giải thích khái niệm điểm ảnh và vai trò của nó trong hình ảnh số.
2. Tại sao độ sâu màu lại quan trọng trong việc hiển thị hình ảnh?
3. Hãy cho biết số sắc độ của một ảnh có độ sâu màu 16 bit.

## Hình ảnh mô tả
- Hình 6.5: Một ví dụ về cách các diode RGB tạo thành một điểm ảnh trên màn hình. (Ghi chú: Hình ảnh minh họa các diode RGB và cách chúng kết hợp để tạo ra màu sắc cho điểm ảnh).



**Tiêu đề bài học:** Hình ảnh và các định dạng ảnh

**Nội dung lý thuyết:**
Hình ảnh có thể được lưu trữ dưới dạng bitmap, trong đó mỗi điểm ảnh được lưu trữ thông tin riêng biệt. Tuy nhiên, việc lưu trữ này rất tốn bộ nhớ. Để giảm kích thước tệp, có thể sử dụng các phương pháp nén tệp. Khi xem ảnh, tệp sẽ được giải nén mà không gây mất mát thông tin, nhưng có thể có một số chất lượng bị giảm. Các định dạng ảnh phổ biến thường được sử dụng trong các ứng dụng bao gồm ảnh nén có mất mát chất lượng, giúp giảm thời gian truyền tải và không gian lưu trữ.

**Ví dụ minh họa:**
- Hình ảnh màu và ảnh xám tương ứng (Hình 6.8).

**Bài tập và câu hỏi:**
1. Giải thích sự khác nhau giữa ảnh bitmap và ảnh nén.
2. Nêu các ưu điểm và nhược điểm của việc nén ảnh.
3. Tại sao ảnh theo hệ RGB lại phổ biến trong máy tính?

**Hình ảnh mô tả:**
- Hình 6.8: Ảnh màu và ảnh xám tương ứng.

**Bảng biểu:**
| Định dạng ảnh | Ưu điểm | Nhược điểm |
|---------------|---------|-------------|
| Bitmap        | Chất lượng cao | Tốn bộ nhớ |
| JPEG          | Kích thước nhỏ | Mất mát chất lượng |
| PNG           | Không mất mát chất lượng | Kích thước lớn hơn JPEG |




# Bài học: Định dạng ảnh và âm thanh

## Nội dung lý thuyết
Trong lĩnh vực công nghệ thông tin, định dạng ảnh và âm thanh là rất quan trọng. Định dạng JPEG là một trong những định dạng phổ biến nhất cho ảnh, với nhiều ưu điểm như kích thước tệp nhỏ và chất lượng ảnh tốt. Tuy nhiên, cũng có những hạn chế và điều cần lưu ý khi sử dụng định dạng này.

### Định dạng JPEG
- **Kích thước tệp nhỏ**: Giúp giảm chi phí lưu trữ.
- **Tải về nhanh hơn**: Đặc biệt khi sử dụng trên web.
- **Chất lượng ảnh**: Mặc dù kích thước giảm đáng kể so với ảnh bitmap, nhưng chất lượng ảnh vẫn đủ tốt.

### Hạn chế
- **Công nghệ web**: Không chỉ sử dụng định dạng JPEG mà còn nhiều định dạng khác như PNG, GIF, BMP.

## Ví dụ minh họa
- **Hình 6.9**: Bảng quảng cáo LED. Nếu coi mỗi vị trí đặt bóng LED tương ứng với một điểm ảnh thì độ sâu màu của ảnh này là bao nhiêu?

## Bài tập và câu hỏi
1. Có một bảng quảng cáo LED như trong Hình 6.9. Nếu coi mỗi vị trí đặt bóng LED tương ứng với một điểm ảnh thì độ sâu màu của ảnh này là bao nhiêu?

2. Nhạc CD có tốc độ bit là 1411 Kbps. Hãy ước tính một đĩa nhạc CD có dung lượng 650 MB có thể nghe được bao lâu?

### Hình ảnh mô tả
- **Hình 6.9**: Bảng quảng cáo đèn LED.

## Vân Dung
1. Có nhiều website cung cấp dịch vụ nhạc số. Một số trang cho phép tải nhạc về máy. Khi tải nhạc thường có gợi ý lựa chọn 128 Kbps, 320 Kbps hay Lossless (Hình 6.10). Em hãy giải thích ý nghĩa của những lựa chọn đó.

Bạn đang muốn tải bài hát "Trở về dòng sông tuổi thơ". Vui lòng chọn chất lượng mong muốn:
- **FREE**: Tiêu chuẩn chất lượng cao 128 Kbps
- **VIP**: Chất lượng cao 320 Kbps
- **VIP**: Lossless

- **Hình 6.10**: Lựa chọn tải nhạc.

2. Sử dụng phần mềm Paint có sẵn trong Windows mở một hình; sau đó chọn lệnh Save As. Phần mềm sẽ hỏi lưu ảnh dưới định dạng nào trong các định dạng 'png', 'jpeg', 'bmp' và '.gif'. Hãy lưu tệp với bốn định dạng trong cùng một thư mục và so sánh độ lớn của các tệp.
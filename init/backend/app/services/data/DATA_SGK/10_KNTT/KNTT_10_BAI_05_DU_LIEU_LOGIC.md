# 5. Các phép toán liên quan đến các yếu tố

## Nội dung lý thuyết
Các phép toán liên quan đến các yếu tố "đúng" và "sai" là các phép toán logic cơ bản trong Tin học. Chúng ta thường sử dụng các phép toán này để phân tích và đánh giá các điều kiện trong lập trình và logic.

## Ví dụ minh họa
Xét một ví dụ về dự báo thời tiết: "Ngày mai trời lạnh và có mưa". Thực tế có thể xảy ra bốn trường hợp khác nhau. Chúng ta cần xác định xem dự báo nào là đúng và dự báo nào là sai.

## Bài tập và câu hỏi
1. Hãy xác định các trường hợp dự báo thời tiết sau đây là đúng hay sai:
- Ngày mai trời lạnh
- Ngày mai trời có mưa

2. Dựa vào bảng dưới đây, hãy điền vào các ô trống để xác định tính đúng sai của các dự báo.

## Hình ảnh mô tả
**Hình 5.1. Trị chân lý và các phép toán logic**

## Bảng biểu
| Ngày mai trời lạnh | Ngày mai trời có mưa | Dự báo |
|--------------------|-----------------------|--------|
| Đúng               | Đúng                  | Đúng   |
| Đúng               | Sai                   | ?      |
| Sai                | Đúng                  | ?      |
| Sai                | Sai                   | ?      |




**Tiêu đề bài học:** Các phép toán lôgic

**Nội dung lý thuyết:**
- p AND q (đọc là p và q) là mệnh đề có giá trị đúng nếu cả p và q đều đúng; mệnh đề có giá trị sai khi cả p và q đều sai.
- p OR q (đọc là p hoặc q) là mệnh đề có giá trị sai khi cả p và q đều sai; mệnh đề có giá trị đúng khi ít nhất một trong hai p hoặc q đúng.
- p XOR q (đọc là p hoặc q nhưng không phải cả hai) là mệnh đề có giá trị đúng khi p và q có giá trị khác nhau; mệnh đề có giá trị sai khi p và q có giá trị như nhau.
- NOT p (đọc là phủ định p) là mệnh đề có giá trị sai khi p đúng và ngược lại.

**Ví dụ minh họa:**
- Giả sử p là mệnh đề "Trời đang mưa" và q là mệnh đề "Tôi mang ô".
- p AND q: "Trời đang mưa và tôi mang ô" - đúng khi cả hai đều đúng.
- p OR q: "Trời đang mưa hoặc tôi mang ô" - đúng khi ít nhất một trong hai đúng.
- p XOR q: "Trời đang mưa hoặc tôi mang ô nhưng không phải cả hai" - đúng khi một trong hai đúng mà không phải cả hai.
- NOT p: "Không phải trời đang mưa" - đúng khi trời không mưa.

**Bài tập và câu hỏi:**
1. Cho các mệnh đề p: "Học sinh học bài" và q: "Học sinh làm bài tập". Hãy xác định giá trị đúng sai của các mệnh đề sau:
- p AND q
- p OR q
- p XOR q
- NOT p

2. Giải thích ý nghĩa của các phép toán lôgic trong thực tế.

**Hình ảnh mô tả:**
- (Ghi chú về hình ảnh: Hình ảnh minh họa bảng giá trị của các phép toán lôgic với các giá trị 0 và 1 cho các mệnh đề p và q.)

**Bảng biểu:**
| p | q | p AND q | p OR q | p XOR q | NOT p |
|---|---|---------|--------|---------|-------|
| 0 | 0 |    0    |   0    |    0    |   1   |
| 0 | 1 |    0    |   1    |    1    |   1   |
| 1 | 0 |    0    |   1    |    1    |   0   |
| 1 | 1 |    1    |   1    |    0    |   0   |




**Tiêu đề bài học:** Mệnh đề và Biểu thức Lôgic

**Nội dung lý thuyết:**
Mệnh đề là một câu có thể đúng hoặc sai, nhưng không thể vừa đúng vừa sai. Trong bài học này, chúng ta sẽ tìm hiểu về các phép toán lôgic cơ bản như AND, OR, NOT và cách chúng tương tác với nhau.

- **p AND q**: Kết quả đúng khi cả p và q đều đúng.
- **p OR q**: Kết quả đúng khi ít nhất một trong hai p hoặc q đúng.
- **NOT p**: Kết quả đúng khi p sai.

**Ví dụ minh họa:**
Giả sử:
- p là "Hùng khéo tay"
- q là "Hùng chăm chỉ"

Chúng ta có thể xây dựng các mệnh đề như sau:
- Mệnh đề "p AND NOT q": Hùng khéo tay nhưng không chăm chỉ.
- Mệnh đề "p OR q": Hùng khéo tay hoặc Hùng chăm chỉ.
- Mệnh đề "NOT p": Hùng không khéo tay.

**Bài tập và câu hỏi:**
1. Xác định giá trị của các mệnh đề sau dựa trên giá trị của p và q:
- p = 1 (đúng), q = 0 (sai)
- p = 0 (sai), q = 1 (đúng)
- p = 1 (đúng), q = 1 (đúng)
- p = 0 (sai), q = 0 (sai)

2. Dựa vào bảng giá trị, hãy xác định phương án nào có kết quả sai cho biểu thức lôgic "p AND NOT q".

**Hình ảnh mô tả:**
- Bảng 5.3. Giá trị của biểu thức lôgic p AND NOT q

**Bảng biểu:**
| Phương án | p | q | p AND NOT q |
|-----------|---|---|--------------|
| A         | 0 | 0 | 0            |
| B         | 1 | 0 | 1            |
| C         | 1 | 1 | 0            |
| D         | 0 | 1 | 0            |

Lưu ý: Kết quả của biểu thức lôgic sẽ phụ thuộc vào giá trị của p và q.



**Tiêu đề bài học:** Logic trong mạch điện

**Nội dung lý thuyết:**
Trong mạch điện có các công tắc và bóng đèn, ta quy ước các giá trị logic như sau:
- Giá trị logic 1 thể hiện khi công tắc mở.
- Giá trị logic 0 thể hiện khi công tắc đóng.
- Đèn sáng thể hiện giá trị logic 1.
- Đèn tắt thể hiện giá trị logic 0.

Một mạch điện có hai công tắc K1 và K2 nối với một bóng đèn. Giá trị logic của đèn được tính qua giá trị logic của các công tắc K1 và K2.

**Ví dụ minh họa:**
- Nếu K1 = 1 (mở) và K2 = 1 (mở), thì đèn sáng (giá trị logic 1).
- Nếu K1 = 0 (đóng) và K2 = 1 (mở), thì đèn tắt (giá trị logic 0).
- Nếu K1 = 1 (mở) và K2 = 0 (đóng), thì đèn tắt (giá trị logic 0).
- Nếu K1 = 0 (đóng) và K2 = 0 (đóng), thì đèn tắt (giá trị logic 0).

**Bài tập và câu hỏi:**
1. Hãy vẽ sơ đồ mạch điện với hai công tắc K1 và K2 và một bóng đèn.
2. Giải thích các trường hợp khác nhau của giá trị logic của đèn khi thay đổi trạng thái của K1 và K2.
3. Tại sao giá trị logic của biểu thức "K1 AND NOT K2" luôn luôn bằng 0 khi K2 = 1?

**Hình ảnh mô tả:**
- Hình ảnh mô tả sơ đồ mạch điện với các công tắc K1, K2 và bóng đèn. (Ghi chú: Hình ảnh này sẽ giúp người học hình dung rõ hơn về cách kết nối các thành phần trong mạch điện.)

**Bảng biểu:**
| K1 | K2 | Đèn   |
|----|----|-------|
| 1  | 1  | Sáng  |
| 1  | 0  | Tắt   |
| 0  | 1  | Tắt   |
| 0  | 0  | Tắt   |

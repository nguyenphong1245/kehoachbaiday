# HÀN VÀ BIỂU DIỄN SỐ NGUYÊN

## Nội dung lý thuyết
Biểu diễn một số dưới dạng tổng lũy thừa của 2. Ví dụ, số 19 có thể được biểu diễn bằng tổng các lũy thừa của 2.

### Lập danh sách các lũy thừa của 2:
- 16 (2^4)
- 8 (2^3)
- 4 (2^2)
- 2 (2^1)
- 1 (2^0)

Số 19 có thể được biểu diễn bằng tổng:
- 16 + 2 + 1, hoặc viết dưới dạng nhị phân là:
- 1 x 2^4 + 0 x 2^3 + 0 x 2^2 + 1 x 2^1 + 1 x 2^0.

Hệ nhị phân sử dụng cơ số 2 với các đặc điểm sau:
- Chỉ có hai chữ số là 0 và 1.
- Các chữ số 0 và 1 gọi là các chữ số nhị phân.

## Ví dụ minh họa
- Số 19 trong hệ thập phân được biểu diễn trong hệ nhị phân là 10011.

## Bài tập và câu hỏi
1. Hãy cho biết số 13 được biểu diễn bằng dãy bit như thế nào?
2. Em hãy cho biết việc biểu diễn số bằng dãy bit có lợi gì?

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa các lũy thừa của 2 và cách biểu diễn số trong hệ nhị phân.)

## Bảng biểu
| Số thập phân | Biểu diễn nhị phân |
|--------------|---------------------|
| 0            | 0                   |
| 1            | 1                   |
| 2            | 10                  |
| 3            | 11                  |
| 4            | 100                 |
| 5            | 101                 |
| 6            | 110                 |
| 7            | 111                 |
| 8            | 1000                |
| 9            | 1001                |
| 10           | 1010                |
| 11           | 1011                |
| 12           | 1100                |
| 13           | 1101                |
| 14           | 1110                |
| 15           | 1111                |
| 16           | 10000               |
| 17           | 10001               |
| 18           | 10010               |
| 19           | 10011               |




# Bài học: Biểu diễn số trong máy tính

## Nội dung lý thuyết
Trong máy tính, có nhiều phương pháp để biểu diễn số, trong đó có phương pháp dấu phẩy động thường được dùng cho các số thực (có phần thập phân). Dưới đây là cách biểu diễn số nguyên:

Số nguyên không dấu chính là thể hiện của số trong hệ đếm nhị phân. Tùy theo số nhỏ hay lớn mà có thể phải dùng nhiều bit khác nhau để biểu diễn. Ví dụ, số 19 trong hệ đếm nhị phân có biểu diễn là 10011. Chỉ cần thêm bên trái cho đủ 8 bit, nhưng số 62010 = 100110 cần bổ sung thêm 6 bit 0 vào phía trái cho đủ 16 bit.

Đối với số nguyên có dấu, có một số cách mã hóa như mã thuế (mã 2), mã bù 1 (còn gọi là mã đảo) và mã bù 2. Cả ba cách mã hóa này đều sử dụng bit đầu tiên bên trái để mã hóa dấu; dấu âm được mã hóa bởi bit 1. Số dương trong cả ba cách mã hóa này đều giống nhau với biểu diễn nhị phân của số. Đối với số âm, biểu diễn của ba cách mã hóa sẽ khác nhau.

## Ví dụ minh họa
Ví dụ:
- Số 11012 = 1 x 23 + 1 x 22 + 0 x 21 + 1 x 20 = 13.
- Số 19 trong cả ba cách mã hóa đều có mã là 00010011.

## Bài tập và câu hỏi
1. Hãy chuyển đổi số 25 sang hệ nhị phân và biểu diễn nó bằng 8 bit.
2. Giải thích sự khác nhau giữa mã bù 1 và mã bù 2.
3. Cho số -5, hãy biểu diễn nó trong hệ nhị phân sử dụng mã bù 2 với 8 bit.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa các cách biểu diễn số trong hệ nhị phân và các mã hóa khác nhau cho số nguyên có dấu và không dấu.)

## Bảng biểu
| Số thập phân | Biểu diễn nhị phân (8 bit) | Mã bù 1 | Mã bù 2 |
|--------------|-----------------------------|---------|---------|
| 19           | 00010011                   | 00010011| 00010011|
| -19          | 11101101                   | 11101100| 11101101|
| 25           | 00011001                   | 00011001| 00011001|
| -25          | 11100111                   | 11100110| 11100111|




# Bài học: Cộng và nhân trong hệ nhị phân

## Nội dung lý thuyết
Trong hệ nhị phân, phép cộng và phép nhân được thực hiện tương tự như trong hệ thập phân, nhưng chỉ với hai chữ số 0 và 1. Dưới đây là bảng cộng và nhân trong hệ nhị phân:

### Bảng 4.1. Bảng cộng và nhân trong hệ nhị phân

| A | B | A + B | A * B |
|---|---|-------|-------|
| 0 | 0 |   0   |   0   |
| 0 | 1 |   1   |   0   |
| 1 | 0 |   1   |   0   |
| 1 | 1 |  10   |   1   |

Lưu ý rằng khi cộng hai bit có kết quả là 10, ta ghi 0 ở hàng tương ứng dưới tổng và nhớ 1 sang hàng bên trái. Nếu xảy ra trường hợp cộng hai bit 1 mà phải chuyển sang hàng trước, kết quả sẽ là 11, ta ghi 1 ở hàng tương ứng dưới tổng và nhớ 1 sang hàng tiếp theo bên trái.

## Ví dụ minh họa
Minh họa phép cộng hai số nhị phân 11011:

```
11011
+  10101
--------
110000
```

## Bài tập và câu hỏi
1. Thực hiện phép cộng hai số nhị phân 1010 và 1101.
2. Tính tích của hai số nhị phân 101 và 11.
3. Giải thích cách thực hiện phép cộng trong hệ nhị phân.

## Hình ảnh mô tả
**Hình 4.2. Thực hiện phép cộng hai số nhị phân**
(Ghi chú: Hình ảnh mô tả quá trình cộng hai số nhị phân với các bước chi tiết.)

## Bảng biểu
| Phép toán | Kết quả |
|-----------|---------|
| 0 + 0     | 0       |
| 0 + 1     | 1       |
| 1 + 0     | 1       |
| 1 + 1     | 10      |
| 0 * 0     | 0       |
| 0 * 1     | 0       |
| 1 * 0     | 0       |
| 1 * 1     | 1       |




**Tiêu đề bài học:** Quy trình thực hiện phép tính trên máy tính

**Nội dung lý thuyết:**
Tính toán trên máy tính luôn theo quy trình sau:
- Chuyển đổi dữ liệu từ hệ thập phân sang hệ nhị phân.
- Thực hiện phép tính trong hệ nhị phân.
- Giải mã kết quả (đổi kết quả từ hệ nhị phân về hệ thập phân).

**Ví dụ minh họa:**
Hình 4.4. Quy trình thực hiện phép tính trên máy tính

**Bài tập và câu hỏi:**
1. Thực hiện các phép tính sau đây theo quy trình Hình 4.4:
a) 17
b) 250 + 175
c) 75

2. Thực hiện các phép tính sau đây theo quy trình Hình 4.4:
a) 6
b) 11 + 9
c) 125

**Hình ảnh mô tả:**
Hình 4.4. Quy trình thực hiện phép tính trên máy tính

**Bảng biểu:**
- Không có bảng biểu trong nội dung này.
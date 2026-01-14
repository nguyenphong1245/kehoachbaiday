# VUI UaU 1/9 9u ULILia U Hlay

## HÂN VÀ BIỂU DIỄN SỐ NGUYÊN

### Biểu diễn một số dưới dạng tổng lũy thừa của 2

**Ví dụ:** Số 19 thành một tổng các lũy thừa của 2.

- Lập danh sách các lũy thừa của 2 như: 16, 8, 4, 2, 1 và hết.

Số 19 có thể được biểu diễn bằng tổng \(2^4 + 2^1 + 2^0\) hoặc viết dưới dạng nhị phân:

\[
1 \times 2^4 + 0 \times 2^3 + 0 \times 2^2 + 1 \times 2^1 + 1 \times 2^0
\]

### Hệ thập phân và hệ nhị phân

- Hệ thập phân: 10
- Hệ nhị phân: 2

**Đặc điểm của hệ nhị phân:**
- Chỉ có hai chữ số là 0 và 1.
- Các chữ số 0 và 1 gọi là các chữ số nhị phân.



# Niiui|  4419 UKK-1' ''u7u0    CiTyP Niiui|

## Biểu diễn số trong máy tính

### Ví dụ:
\[
11012 = 1 \times 2^3 + 1 \times 2^2 + 0 \times 2^1 + 1 \times 2^0 = 13
\]

### Phương pháp để biểu diễn số trong máy tính
- Dấu phẩy động thường được dùng khi:
1. Số thực (có phần thập phân).

### Cách biểu diễn số nguyên:
- Số nguyên không dấu chính là thể hiện của số trong hệ đếm nhị phân.
- Vào bộ nhớ, tùy theo số nhỏ hay lớn mà có thể phải dùng:
- Số 19 trong hệ đếm nhị phân có biểu diễn là \( 10011 \) chỉ cần thêm bên trái cho đủ 8 bit.
- Nhưng số 62010 = \( 100110 \) và cần bổ sung thêm 6 bit 0 vào phía trái cho đủ 16 bit.

### Số nguyên có dấu
- Có một số cách mã hóa như:
- Mã thuế (mã 0)
- Mã bù 1 (còn gọi là mã đảo)
- Mã bù 2

Cả ba cách mã hóa đều sử dụng bit tận cùng bên trái để mã hóa dấu; dấu âm được mã hóa bởi bit 1. Số dương trong cả ba cách mã hóa này đều giống biểu diễn nhị phân của số. Đối với số âm thì biểu diễn của ba cách mã hóa sẽ khác nhau.

### Ví dụ
- Số 1910 trong cả ba cách mã hóa đều có mã là \( 0001 \)



# Bảng 4.1. Bảng cộng và nhân trong hệ nhị

## 1. Bảng cộng và nhân trong hệ nhị

| Ai số nhị phân | 0 | 0 | 0 |
|----------------|---|---|---|
|                | 0 | 1 | 0 |
|                | 1 | 1 | 1 |
|                | 1 | 1 | 0 |

Lưu ý là phép cộng hai bit có kết quả là 10 thì ghi 0 ở hàng tương ứng dưới tổng và nhớ 1 sang hàng bên trái. Nếu xảy ra trường hợp cộng hai bit 1 mà phải chuyển sang thì kết quả sẽ là 11, ghi 1 ở hàng tương ứng dưới tổng và hàng tiếp theo bên trái.

## Minh hoạ phép cộng hai số nhị phân 11011

### Hình 4.2. Thụ



# Tính toán trên máy tính

Tính toán trên máy tính luôn theo quy trình sau:

| Hệ thập phân | Thực hiện phép tính trong | Hệ nhị phân | Giải mã kết quả (đổi kết quả về hệ thập phân) |
|---------------|---------------------------|--------------|------------------------------------------------|
| 02            | 03                        |              |                                                |

Hình 4.4. Quy trình thực hiện phép tính trên máy tính

**Thực hiện các phép tính sau đây theo quy trình Hình 4.4:**
1. a) 17
2. b) 250 + 175
3. c) 75

**Thực hiện các phép tính sau đây theo quy trình Hình 4.4:**
1. a) 11 + 9
2. b) 125
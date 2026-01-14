# CHỦ ĐỀ: MÁY TÍNH VÀ XỬ LÝ THÔNG TIN

## BÀI: HỆ NHỊ PHÂN VÀ ỨNG DỤNG

Học xong bài này, em sẽ:
- Hiểu và thực hiện được các phép toán cơ bản NOT, AND, OR và XOR theo từng bit và cho các dãy bit.
- Biết hệ nhị phân (hệ đếm cơ số 2) là gì.
- Chuyển đổi được số đếm hệ nhị phân sang giá trị thập phân và ngược lại.
- Biết được các phép toán bit là cơ sở để thực hiện các tính toán số học nhị phân.
- Giải thích được ứng dụng của hệ nhị phân trong tin học.

Máy tính tính toán với các bit; các toán hạng là bit và kết quả cũng là bit.

a) Em sẽ chọn kết quả phép cộng hai bit \(1 + 1\) là 0, 1 hay 10? Tại sao?
b) Em sẽ chọn kết quả phép nhân hai bit \(1 \times 1\) là 0, 1 hay 10? Tại sao?

## Các phép toán bit

### a) Định nghĩa

Để đánh giá một món ăn, ta có thể dựa vào các tiêu chí ngon hay không, rẻ hay không. Em hãy phân biệt "ngon và rẻ" với "ngon hoặc rẻ" và "hoặc ngon hoặc rẻ".

Mọi dữ liệu trong máy tính đều đã số hóa tức là có dạng dãy các bit. Mọi thao tác xử lý dữ liệu cuối cùng đều dẫn đến xử lý các bit. Các phép toán bit là nền tảng hoạt động của máy tính. Bốn phép toán bit cơ sở là NOT, AND, OR và XOR. Các phép toán này cũng gọi là phép toán logic với các bit.

### Phép toán NOT

- **Hạng**: 1
- **Kí hiệu toán**: NOT \(x\)
- **Kết quả**: Phép toán NOT cho kết quả trái ngược với đầu vào.

### Các phép toán còn lại: AND, OR và XOR

Các phép toán này có nềntảng logic tương tự như phép toán NOT.

----

**Lưu ý**: Để hiểu rõ hơn về các phép toán này, em có thể tham khảo thêm tài liệu tại hoc1O.vn.



# Phép toán AND

## Hạng đẩu vào là x; y
- \( x \) AND \( y \)

### Kí hiệu hai toán
- Bảng kết quả phép toán AND như hình bên:

| x | y | x AND y |
|---|---|---------|
| 0 | 0 |    0    |
| 0 | 1 |    0    |
| 1 | 0 |    0    |
| 1 | 1 |    1    |

Phép toán AND còn gọi là phép nhân logic. AND cho kết quả là 1 khi và chỉ khi cả hai bit toán hạng đều là 1; bằng trong những trường hợp còn lại.

## Phép toán OR và XOR
- Hạng đẩu vào là x; y
- \( x \) OR \( y \)
- \( x \) XOR \( y \)

### Kí hiệu hai toán hạng đầu vào
- Bảng kết quả phép toán OR và XOR như hình bên:

| x | y | x OR y | x XOR y |
|---|---|--------|---------|
| 0 | 0 |   0    |    0    |
| 0 | 1 |   1    |    1    |
| 1 | 0 |   1    |    1    |
| 1 | 1 |   1    |    0    |

Phép toán OR còn gọi là phép cộng logic. Phép toán XOR là viết tắt của eXclusive OR nghĩa là phép OR loại trừ hay "độc quyền" không lấy cả hai.

Phép toán OR cho kết quả là 0 khi và chỉ khi cả hai bit toán hạng đều là 0. Phép toán XOR cho kết quả là 1 khi và chỉ khi hai bit toán hạng trái ngược nhau.

## b) Các phép toán bit với dãy bit
Mỗi tử dữ liệu số hóa là một dãy bit liền nhau với độ dài ấn định trước. Bốn phép toán cơ sở NOT, AND, OR và XOR được áp dụng cho các dãy bit theo cách sau:

- Phép toán một toán hạng NOT được thực hiện với từng bit trong dãy. Phép toán này cũng gọi là phép bù (complement). Bit chỉ nhận hai giá trị 0 hoặc 1, nên bù của 0 là 1, phần bù của 1 là 0.

- Các phép toán hai toán hạng AND, OR và XOR được thực hiện với từng cặp bit từ hai toán hạng dọc cột tương ứng với nhau: Các dãy bit có cùng độ dài.

### Các ví dụ minh họa:
```
x = 10101011
y = 10011001

NOT x = 01010100
x AND y = 10001001
x OR y = 10111011
x XOR y = 00110010
```

Đọc sách tại học O.vn 133



# Hệ nhị phân và ứng dụng

## a) Hệ nhị phân

### Cơ số trong một hệ đếm

Số tự nhiên quen thuộc là cách biểu diễn số trong hệ thập phân (hệ đếm cơ số 10). Một dãy số biểu diễn một trị số lượng. Quy ước từ trái sang phải là cột hàng đơn vị, cột hàng chục, cột hàng trăm, cột hàng nghìn. Cứ dịch thêm một vị trí cột, từ phải sang trái, thì giá trị của ký số được tăng thêm 10 lần, 10 là cơ số của hệ đếm thập phân.

Số nhị phân là cách biểu diễn số trong hệ nhị phân (hệ đếm cơ số 2). Hệ nhị phân quy ước từ phải sang trái, cứ dịch thêm một vị trí cột thì giá trị của ký số được tăng thêm 2 lần. Hệ nhị phân chỉ dùng hai ký số 0 và 1. Mỗi số nhị phân đều là một dãy bit.

#### Ví dụ minh họa: Chuyển đổi biểu diễn số ở hệ nhị phân sang hệ thập phân:

$$
101101 \text{ (cơ số 2)} \sim 1 \times 2^5 + 0 \times 2^4 + 1 \times 2^3 + 0 \times 2^2 + 1 \times 2^0 = 45 \text{ (cơ số 10)}.
$$

## b) Chuyển đổi một số nguyên dương ở hệ thập phân sang hệ nhị phân

Dãy bit 1101 biểu diễn số nào ở hệ thập phân? Em hãy quan sát hình sau và nêu nhận xét.

```
13 chia 2, được 6 dư 1
1 x 2^0 = 1
6 chia 2, được 3 dư 0
0 x 2^1 = 0
3 chia 2, được 1 dư 1
1 x 2^2 = 4
1 chia 2, được 0 dư 1
1 x 2^3 = 8
```

**Tổng**: 13

### Chú ý:

Khi kết quả của phép chia là 0 thì kết thúc. Dãy các ký số 0 và 1 ghi lại phần dư của các phép chia sẽ tạo thành số nhị phân.

Để chuyển số nguyên dương bất kỳ ở hệ thập phân sang hệ nhị phân, ta làm tương tự.



# Phép cộng và phép nhân hai số nguyên trong hệ nhị phân

Các phép toán số học với các số trong hệ nhị phân được thực hiện theo quy tắc (thuật toán) tương tự như trong hệ thập phân:

## Phép cộng

### X + y

Phép cộng hai số trong hệ nhị phân thực hiện với hai dãy bit (biểu diễn hai toán hạng) theo quy tắc như cộng hai số trong hệ thập phân và "viết 0, ghi nhớ 1, nếu có" trước khi cộng tiếp cho cột kề bên trái.

### Bảng cộng cơ sở cho 8 số nhị phân như hình bên

| X      | 00111 |
|--------|-------|
| y      | 10011 |
| X + y  | 11010  |

**Ví dụ minh họa:**

- Nếu cả hai toán hạng đều bằng 7 thì kết quả là "viết 0 nhớ 1".

## Phép nhân

### X * y

Phép nhân hai số trong hệ nhị phân thực hiện với hai dãy bit biểu diễn hai toán hạng và theo quy tắc tương tự như trong hệ thập phân.

### Bảng nhân cơ sở như hình bên

| Bảng nhân cơ sở | Giống với phép toán AND. |
|------------------|--------------------------|

**Ví dụ sau đây minh họa từng bước làm phép tính nhân:**

- x = 100101
- y = 101

```
100101
101     y
100101     1 * x: Tích riêng thứ nhất.
oooooo         0 * x: Tích riêng thứ hai
100101          1 * x: Tích riêng thứ ba.
10111001     X * y: Cộng các tích riêng theo cột dọc.
```

## d) Vai trò của hệ nhị phân trong tin học

Hệ nhị phân chỉ dùng hai ký số là 0 và 1. Các số trong hệ nhị phân đều được biểu diễn bằng dãy bit. Ban đầu, máy tính điện tử ra đời là để tính toán số học với tốc độ rất nhanh. Máy tính biểu diễn các số trong hệ nhị phân; thực hiện các phép tính số học nhị phân dựa trên cơ sở các phép toán bit và các quy tắc tương tự như của hệ thập phân.



# Nhờ có hệ nhị phân mà máy tính có thể tính toán; xử lý thông tin giống như con người

Việc dễ dàng thể hiện một dãy bit về mặt vật lý làm nên sức mạnh của hệ nhị phân:

- Cách thể hiện bit bởi hai mức điện áp khác nhau trong các mạch điện tử các cổng logic cho phép thực hiện tính toán rất nhanh và thuận tiện.
- Có thể thể hiện dãy bit bằng cách phân biệt giữa điểm phẳng với điểm lồi lên hay xuống như trong đĩa CD.
- Thể hiện dãy bit nhờ biệt hai cực của nam châm như trong băng từ.

Hệ nhị phân đặt cơ sở cho sự ra đời của máy tính điện tử, là cơ sở của các thiết bị xử lý thông tin kỹ thuật số.

## Bài tập

**Bài 1.** Số 111111 trong hệ nhị phân có giá trị là bao nhiêu trong hệ thập phân?

**Bài 2.** Chuyển hai số sau sang hệ nhị phân rồi thực hiện phép toán cộng (hoặc nhân) số nhị phân; kiểm tra lại kết quả số trong hệ thập phân:
1) 125 + 12
2) 125 x 6

Một máy tính kết nối với Internet phải được gán một địa chỉ IP (viết tắt của Internet Protocol). Địa chỉ IP là một số nhị phân dài 32 bit (tức là 4 byte) còn là IPv4 để phân biệt với IPv6 dài 6 byte. Để cho con người dễ đọc, người ta viết địa chỉ IP dưới dạng số trong hệ thập phân, cách nhau bởi dấu chấm; mỗi số trong hệ thập phân ứng với 1 byte. Các dãy sau đây có thể là địa chỉ IP không? Tại sao?
(Gợi ý: Số nhị phân dài 1 byte biểu diễn được các giá trị trong khoảng nào?)
1) 345.123.011.201
2) 123.110.256.101

## Câu hỏi

**Câu 1.** Trong hệ nhị phân khi nào thì phép toán AND có kết quả là 1? Khi nào thì phép toán OR có kết quả là 0?

**Câu 2.** Điểm khác nhau giữa hai phép toán OR và XOR là gì?

**Câu 3.** Tại sao phép toán NOT cũng được gọi là phép bù?

## Tóm tắt bài học

- Các tên gọi phép toán bit NOT, AND, OR và XOR nói lên kết quả thực hiện phép toán.
- Hệ nhị phân biểu diễn các số bằng dãy bit và tính toán bằng các phép toán bit.
- Hệ nhị phân là cơ sở để máy tính thực hiện tính toán.
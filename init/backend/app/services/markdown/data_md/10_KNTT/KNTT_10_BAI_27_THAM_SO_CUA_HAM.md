```python
def f_sum(a, b, c):
return a + b + c

# Example usage
x, y = 25, 18
result = f_sum(10, x, y)
```

## Ổ VÀ ĐỔI SỔ CỦA HÀM

### 1. Phân biệt tham số và đổi số

Ví dụ sau, tìm hiểu cách dữ liệu được truyền qua luận để giải thích kết quả.

- Chuyển dữ liệu qua tham số:
- Hàm `f()` có ba tham số: `a`, `b`, `c`.
- `return a + b + c`

- Hàm `f()` được gọi với ba giá trị cụ thể.



# Il gọl nam cac tham so (parameter) se aược truyen banc
ia đối số (argument) của hàm số lượng giá trị đượctru)
ng với số tham số trong khai báo của hàm:

1. Khi khai báo có một tham số, nhưng khi gọi hàm có th
ông?
- Hàm có hai tham số x, y khi khai báo, hàm sẽ trả lại giá trị x + y. Có lỗi hay không?

## DỤNG CHƯƠNG TRINH CON

2. Khi nào nên sử dụng chương trình con?
- Ví dụ là viết chương trình chính yêu cầu nhập số tự nhiên n và in ra số nguyên tố nhỏ hơn hoặc bằng n ra màn hình. Trong phần này, em đã biết hàm `prime(n)` kiểm tra số n có là số nguyên tố hay không. Chương trình giải bài toán này như thế nào?

- Cách kiểm tra một số có là số nguyên tố được lặp đi lặp lại trong chương trình.



# Tính Tổng Các Số Dương

Chúng ta sẽ thiết lập hàm `tongduong(A)` để tính tổng của một dãy A. Chương trình chính sẽ gọi hàm `tongduong` như sau:

```python
def tongduong(A):
S = 0
for k in A:
if k > 0:
S = S + k
return S
```

## Chương trình chính

```python
A = [0, 2, -1, 5, 10, -3]
B = [1, -10, -11, 8, 2, 0, -5]

# Sử dụng hàm tongduong tính tổng các số dương trong A
tong_A = tongduong(A)

# Sử dụng hàm tongduong tính tổng các số dương trong B
tong_B = tongduong(B)
```

### Kết quả

- Tổng các số dương trong A: `tong_A`
- Tổng các số dương trong B: `tong_B`



# Nội dung SGK

## 1. Hàm `f dem(msg, sep)`

Hàm này có chức năng đếm số ký tự tách từ là `sep`.

### Ví dụ:
- `"thu lịch sử"` → Trả lại giá trị 4
- `"thu lich sỬ"` → Trả lại giá trị 1

### Cách thực hiện:
Để tách xâu `msg` thành các từ, chúng ta dùng lệnh `split()` với tham số là `sep`.

```python
if b == 0:
S = S + X
else:
if X > 0:
S = S + X
S
```

## 2. Ghi chú
- Đảm bảo rằng các ký tự tách từ được xác định chính xác để hàm hoạt động hiệu quả.
- Kiểm tra các trường hợp đặc biệt để đảm bảo tính chính xác của kết quả.



# TÀI LIỆU HỌC TẬP

## Bài 11

### Bài tập 1
Viết hàm `power(a, b, c)` với `a`, `b`, `c` là số nguyên. Hàm trả lại giá trị của \( a^b \mod c \).

### Chương trình thực hiện:
- Nhập `n` số tự nhiên từ bàn phím.
- Tính và in ra tổng của các số này.

### Bài tập 2
Chương trình thực hiện:
- Nhập hai số tự nhiên từ bàn phím.
- In ra ước chung lớn nhất (ƯCLN) của hai số.

### Bài tập 3
Viết hàm `change()` có hai tham số là xâu `ho_ten` và số `c`. Hàm trả về xâu `ho_ten` là chữ in hoa nếu `c = 0`. Nếu tham số `c` khác 0 thì hàm trả về xâu `ho_ten` là chữ thường.

### Gợi ý
Sử dụng các hàm `upper()` và `lower()` để chuyển đổi chữ hoa và chữ thường.
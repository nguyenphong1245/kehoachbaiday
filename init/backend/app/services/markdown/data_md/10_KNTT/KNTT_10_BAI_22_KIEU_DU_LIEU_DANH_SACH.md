# Dữ liệu danh sách trong Python

## 1. Khởi tạo và tìm hiểu dữ liệu kiểu danh sách

Dữ liệu danh sách như thế nào? Cách truy cập; thay đổi giá trị trong danh sách như thế nào?

Quan sát các lệnh sau để tìm hiểu kiểu dữ liệu danh sách.

```python
list_example = [1, 2, 3, 4, 5]
```

Có thể truy cập từng phần tử của danh sách thông qua chỉ số. Chỉ số của list được đánh số từ 0.

### Cách khởi tạo dữ liệu danh sách trong Python

Dữ liệu danh sách trong Python được khởi tạo như sau:

```python
list_example = [1.5, 2, 3, 4, 5]
```

### Truy cập và thay đổi giá trị trong danh sách

- Để truy cập phần tử đầu tiên: `list_example[0]`
- Để thay đổi giá trị phần tử thứ hai: `list_example[1] = 10`

### Một số thao tác với danh sách

- **Thêm phần tử**: `list_example.append(6)`
- **Xóa phần tử**: `list_example.remove(3)`
- **Lấy độ dài danh sách**: `len(list_example)`

### Ví dụ về danh sách

| Chỉ số | Giá trị |
|--------|---------|
| 0      | 1.5     |
| 1      | 2       |
| 2      | 3       |
| 3      | 4       |
| 4      | 5       |
| 5      | 6       |

### Kết luận

Dữ liệu danh sách là một trong những kiểu dữ liệu quan trọng và thường được sử dụng trong Python. Việc hiểu rõ cách khởi tạo, truy cập và thao tác với danh sách sẽ giúp bạn lập trình hiệu quả hơn.



# Các phép ghép hai danh sách

List là kiểu dữ liệu danh sách (dãy; mảng) trong Python, được tạo ra bằng lệnh gán với các phần tử trong cặp dấu ngoặc `[]`. Các phần tử của danh sách có thể có các kiểu dữ liệu khác nhau.

## Thay đổi giá trị của từng phần tử thông qua chỉ số:
```
<danh sách="">[<chỉ số="">]
```
Chỉ số của danh sách bắt đầu từ 0 đến `len(<danh sách="">) - 1`, trong đó `len()` là lệnh tính độ dài danh sách.

### Ví dụ về danh sách A:
```
A = [1, 0, "One", 3, 9, 15, "Two", 3, True, False]
```

#### Trị các phần tử:
- a) `A[7]`
- b) `A[2]`
- c) `A[10]` (lệnh này sẽ gây lỗi vì chỉ số không hợp lệ)
- d) `del A[0]` (lệnh này sẽ xóa phần tử đầu tiên trong danh sách A)
- e) `A = A[1]*25` (lệnh này sẽ nhân phần tử thứ hai của danh sách A với 25)

### Lưu ý:
- Danh sách có thể chứa các kiểu dữ liệu khác nhau như số nguyên, chuỗi, boolean, v.v.
- Việc sử dụng chỉ số để truy cập và thay đổi giá trị của các phần tử trong danh sách là rất quan trọng trong lập trình Python.</danh></chỉ></danh>



# HẨN TỬ VÀO DANH SÁCH

## Các lệnh đặc biệt để thêm phần tử vào một danh sách

### 1. Tìm hiểu lệnh thêm phần tử cho danh sách

Các lệnh sau đây để biết cách thêm phần tử vào một danh sách:

- **append()**: Thêm phần tử vào cuối danh sách.

```python
A = [1, 2]
A.append(10)
```

Chú ý cách dùng phương thức `append()`. Sau khi gõ `A.append`, bạn cần thêm dấu ngoặc đơn và phần tử muốn thêm vào.

### 2. Ví dụ về việc in ra các số chẵn

Viết chương trình in ra các số chẵn từ danh sách các số nguyên A:

```python
for i in range(len(A)):
if A[i] > 0:
S = S + A[i]
print(S)
```

### 3. Biến và giá trị

- `C = 0`: Khởi tạo biến C.
- `S = 0`: Khởi tạo biến S.

### 4. Kết quả

- In ra giá trị của `C` và `S` sau khi thực hiện các phép toán trên danh sách.



# Nhập họ tên học sinh

```python
name = []
for i in range(len(dsLop)):
name.append(input("Nhập họ tên học sinh thứ " + str(i + 1) + ": "))
print("Danh sách học sinh đã nhập:")
print(name)
```

## 2. Nhập một dãy số từ bàn phím: Tính tổng, trung bình cử hàng ngang.

1. Tương tự nhiệm vụ 1, chỉ khác là nhập số nguyên nên cần đổi dữ liệu.

```python
n = int(input("Nhập số tự nhiên n: "))
A = []
for i in range(n):
A.append(int(input("Nhập số thứ " + str(i + 1) + ": ")))
print("Số đã nhập:")
print(A)
```

### Tính tổng và trung bình

- Tổng: `sum(A)`
- Trung bình: `sum(A) / n`

### Kết quả

- Tổng: `T`
- Trung bình: `TB`
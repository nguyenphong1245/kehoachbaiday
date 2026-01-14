# HÀM THIẾT KẾ SẴN CỦA PYTHON

## 1. Tìm hiểu một số hàm của Python

Một số câu lệnh trong Bảng 26.1 và cho biết những câu lệnh:

| Hàm        | Mô tả                       |
|------------|-----------------------------|
| `len()`    | Trả về độ dài của đối tượng |
| `range()`  | Tạo một dãy số             |
| `bool()`   | Chuyển đổi sang kiểu boolean|
| `float()`  | Chuyển đổi sang kiểu số thực|
| `round()`  | Làm tròn số                 |
| `chr()`    | Trả về ký tự từ mã ASCII   |
| `input()`  | Nhập dữ liệu từ người dùng  |
| `divmod()` | Trả về thương và số dư     |
| `int()`    | Chuyển đổi sang kiểu số nguyên|
| `print()`  | In ra màn hình              |

### Câu hỏi
- Hãy kể tên một số hàm trong số các lệnh đã học hay khái quát những đặc điểm chung gì?



# CÁC HÀM TỰ ĐỊNH NGHĨA

Hàm thiết kế sẵn, Python còn cho phép người dùng tự định nghĩa (còn gọi là các hàm tự định nghĩa).

## 1. Cách thiết lập hàm trong Python

### Các ví dụ sau để biết cách viết hàm

#### Ví dụ 1: Viết hàm có trả lại giá trị
```python
def inc(n):
return n + 1
```
- Tên hàm: `inc`
- Tham số hàm: số `n`
- Giá trị trả lại: số `n + 1`

#### Ví dụ 2: Viết hàm không trả lại giá trị
```python
def thong_bao(msg):
print("Thông báo bạn: ", msg)
```
- Tên hàm: `thong_bao`



# Nội dung SGK

## Các hàm trong Python

### 1. Viết hàm yêu cầu người dùng nhập họ tên rồi đưa lời chào

```python
def chao():
ten = input("Nhập họ tên của em: ")
print("Xin chào " + ten)
```

### 2. Hàm _xau()

```python
def _xau():
return input("Nhập một xâu: ")
```

### 3. Hàm Inday(n)

```python
def Inday(n):
for k in range(n):
print(k)
```

### 4. Các giá trị trả về

- Không có giá trị
- Có giá trị

### 5. Chú thích

- Hàm có thể không có giá trị trả về hoặc có giá trị trả về.
- Cách thiết lập và chức năng của mỗi hàm cần được giải thích rõ ràng.



# Sách Giáo Khoa - Thực Hành Lập Trình

## Sử dụng hàm `prime()` trong phần thực hành.

1. **Đếm số các chữ số có trong xâu `s`:**
```python
numbers("0101abc") = 4
```

## Viết hàm có thể có nhiều lệnh `return`.

Quan sát hàm sau đây và chỉ ra những lệnh `return`:

```python
def prime(n):
if n &#x3C; 2:
return False
for k in range(2, n):
if n % k == 0:
return False
return True
```

### Hàm này có điểm gì khác so với mô tả trong phần thực hành?
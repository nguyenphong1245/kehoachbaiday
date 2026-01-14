# CỦA BIẾN KHAI BÁO TRONG HÀM

## Phạm vi của biến khi khai báo trong hàm

Các lệnh sau để tìm hiểu phạm vi có hiệu lực của biến khi khai báo bên trong một hàm.

```python
def nc(a, b):
n = 10
a = a * 2
return a + b + n
```

- Trong hàm này có các biến: `n`, `a`, `b`.
- `n` được khai báo bên trong hàm chỉ được sử dụng bên trong hàm này.
- `a` và `b` được thay đổi.

### Đây là các biến bên ngoài hàm: `a`, `b`.



# CỦA BIẾN KHAI BÁO NGOÀI HÀM

## 2 Phạm vi của biến khi khai báo bên ngoài hàm

Các lệnh sau: tìm hiểu phạm vi có hiệu lực của biến khi khai báo bên ngoài hàm.

Biến khai báo bên ngoài hàm không có tác dụng bên trong hàm.

```plaintext
f(n):
t = n + 1
return t
```

Trong chương trình chính, biến `t` được khai báo bên ngoài hàm `f()` và gán giá trị 10. Khi gọi `f(5)`, `t` sẽ được gán 6.

Giá trị 6. Nhưng khi thoát khỏi `f()`, `t` vẫn có giá trị 10.

Biến khai báo bên ngoài hàm không có tác dụng bên trong hàm `f()`.



# N

Nếu muốn có tác dụng thì cần khai báo lại biến này trong khóa global.

## Hàm f(x, y)

Hàm \( f(x, y) \) được định nghĩa như sau:
\[
f(x, y) = 2 \cdot (x + y)
\]

## Câu hỏi

Kết quả nào được in ra khi thực hiện các lệnh sau?

### Biến

Viết hàm với đầu vào là danh sách \( A \) chứa các số và số thách kết quả \( B \) từ danh sách \( A \) bằng cách chỉ giữ lại các phần tử.

- Biến \( B \) kiểu danh sách cần được định nghĩa trong hàm.



```markdown
## Chương trình xử lý chuỗi

### Hàm `tu(Str, c)`

```python
def tu(Str, c):
A = Str.split()
for k in range(len(A)):
if c == 0:
A[k] = A[k].upper()
elif c == 1:
A[k] = A[k].lower()
elif c == 2:
A[k] = A[k].title()
return A
```

### Bài tập

3. Viết chương trình yêu cầu thực hiện lần lượt các việc sau:

- Nhập từ bàn phím một dãy các số nguyên, mỗi số cách nhau bởi dấu cách vào danh sách A và in danh sách A ra màn hình.
- Tạo danh sách B gồm các phần tử lớn hơn một giá trị cho trước.
- Tạo danh sách C gồm các phần tử nhỏ hơn một giá trị cho trước.
```



It seems that the text you provided is a bit fragmented and contains some formatting issues. However, I will do my best to extract and format the content accurately based on the structure you've indicated. Here’s the extracted content:

----

### ÂP

1. Với đầu vào; đầu ra như sau:
- Là danh sách `sList`, các phần tử là xâu kí tự.
- Là danh sách `cList`, các phần tử là kí tự đầu tiên của các phần tử trong danh sách `sList`.

2. Hàm `Tach_day()` với đầu vào là danh sách `A`, đầu ra là hai danh sách như sau:
- Danh sách `B` thu được từ `A` bằng cách lấy ra các phần tử có chỉ số chẵn.
- Danh sách `C` thu được từ `A` bằng cách lấy ra các phần tử có chỉ số lẻ.

----

If you have more specific sections or additional content that you would like me to extract or format, please provide that, and I will assist you further!
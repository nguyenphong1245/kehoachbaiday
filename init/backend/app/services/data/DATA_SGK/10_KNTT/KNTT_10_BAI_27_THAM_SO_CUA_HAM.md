# Tiêu đề bài học
Hàm và Tham số trong lập trình

## Nội dung lý thuyết
Hàm là một khối mã lệnh có thể được gọi để thực hiện một nhiệm vụ cụ thể. Hàm có thể nhận đầu vào thông qua các tham số và có thể trả về giá trị. Có hai loại tham số trong hàm: tham số và đối số.

1. **Phân biệt tham số và đối số**
- Tham số là các biến được định nghĩa trong phần đầu của hàm, dùng để nhận giá trị khi hàm được gọi.
- Đối số là các giá trị thực tế được truyền vào hàm khi gọi hàm.

### Ví dụ minh họa
```python
def f_sum(a, b, c):
return a + b + c

x = 10
y = 18
result = f_sum(x, y, 25)  # Gọi hàm với các đối số cụ thể
print(result)  # Kết quả sẽ là 53
```

## Bài tập và câu hỏi
1. Viết một hàm có tên `f_product` nhận ba tham số và trả về tích của chúng.
2. Giải thích sự khác nhau giữa tham số và đối số trong hàm.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa cách thức hoạt động của hàm và cách truyền tham số vào hàm.)

## Bảng biểu
| Tham số | Đối số | Mô tả                      |
|---------|--------|----------------------------|
| a       | 10     | Giá trị đầu vào thứ nhất   |
| b       | 18     | Giá trị đầu vào thứ hai    |
| c       | 25     | Giá trị đầu vào thứ ba     |




**Tiêu đề bài học: Sử dụng tham số và đối số trong hàm**

**Nội dung lý thuyết:**
Trong lập trình, tham số (parameter) là các biến được định nghĩa trong phần khai báo của hàm, trong khi đối số (argument) là các giá trị được truyền vào hàm khi gọi hàm. Số lượng đối số phải tương ứng với số lượng tham số trong khai báo của hàm.

- Khi khai báo hàm có một tham số, nhưng khi gọi hàm có thể truyền vào nhiều giá trị khác nhau.
- Ví dụ, hàm có hai tham số x, y khi khai báo, hàm sẽ trả lại giá trị x + y. Nếu số lượng đối số không khớp với số lượng tham số, sẽ xảy ra lỗi.

**Ví dụ minh họa:**
```python
def add(x, y):
return x + y

result = add(5, 3)  # Kết quả sẽ là 8
```

**Bài tập và câu hỏi:**
1. Viết một hàm có một tham số để kiểm tra xem một số có phải là số nguyên tố hay không.
2. Gọi hàm đó với các giá trị khác nhau và in ra kết quả.
3. Giải thích tại sao số lượng đối số phải khớp với số lượng tham số trong khai báo hàm.

**Hình ảnh mô tả:**
- Hình ảnh minh họa cho cách gọi hàm và truyền tham số (ghi chú về hình ảnh: Hình ảnh mô tả quy trình gọi hàm với các tham số và đối số).

**Bảng biểu:**
| Tham số | Đối số | Kết quả |
|---------|--------|---------|
| x       | 5      |         |
| y       | 3      | 8       |
| n       | 10     |         |

**Ghi chú:** Hình ảnh và bảng biểu cần được bổ sung để minh họa rõ hơn cho nội dung lý thuyết.



**Tiêu đề bài học:** Tính tổng các số dương trong một dãy số

**Nội dung lý thuyết:**
Trong bài học này, chúng ta sẽ thiết lập hàm `tongduong(A)` để tính tổng của một dãy số A. Hàm này sẽ lặp qua từng phần tử của dãy và cộng dồn các số dương.

**Ví dụ minh họa:**
Chương trình chính có thể được viết như sau:

```python
def tongduong(A):
S = 0
for k in A:
if k > 0:
S = S + k
return S

# Chương trình chính
A = [0, 2, -1, 5, 10, -3]
B = [1, -10, -11, 8, 2, 0, -5]

# Sử dụng hàm tongduong tính tổng các số dương
tong_A = tongduong(A)  # Kết quả: 12
tong_B = tongduong(B)  # Kết quả: 10
```

**Bài tập và câu hỏi:**
1. Viết hàm `tongduong` cho một dãy số khác và tính tổng các số dương trong dãy đó.
2. Thay đổi dãy số A và B trong chương trình chính và quan sát kết quả.
3. Giải thích cách hoạt động của hàm `tongduong`.

**Hình ảnh mô tả:**
(Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một sơ đồ luồng thể hiện cách mà hàm `tongduong` hoạt động, với các bước lặp qua từng phần tử và kiểm tra điều kiện.)

**Bảng biểu:**
| Dãy số A          | Tổng các số dương |
|-------------------|--------------------|
| [0, 2, -1, 5, 10, -3] | 12                 |
| [1, -10, -11, 8, 2, 0, -5] | 10                 |




**Tiêu đề bài học:** Hàm và Xử lý Chuỗi trong Python

**Nội dung lý thuyết:**
Trong Python, hàm là một khối mã lệnh được định nghĩa để thực hiện một nhiệm vụ cụ thể. Hàm có thể nhận tham số đầu vào và trả về giá trị đầu ra. Việc sử dụng hàm giúp cho mã nguồn trở nên gọn gàng và dễ bảo trì hơn.

Một trong những ứng dụng phổ biến của hàm là xử lý chuỗi. Chúng ta có thể sử dụng các hàm để tách, đếm và thao tác với các chuỗi ký tự.

**Ví dụ minh họa:**
1. Để tách xâu `msg` thành các từ, chúng ta dùng lệnh `split()`:
```python
msg = "Học lịch sử"
words = msg.split()
print(words)  # Kết quả: ['Học', 'lịch', 'sử']
```

2. Thiết lập hàm `f_dem(msg, sep)` có chức năng đếm số ký tự tách từ là `sep`:
```python
def f_dem(msg, sep):
return msg.count(sep)

print(f_dem("Học lịch sử", " "))  # Trả lại giá trị 2
print(f_dem("Học-lịch-sử", "-"))   # Trả lại giá trị 2
```

**Bài tập và câu hỏi:**
1. Viết hàm `dem_tu(msg)` để đếm số từ trong chuỗi `msg`.
2. Sử dụng hàm `split()` để tách chuỗi sau thành các từ: `"Tin học là môn học thú vị"`.
3. Thay đổi hàm `f_dem` để nó có thể đếm số lần xuất hiện của một ký tự bất kỳ trong chuỗi.

**Hình ảnh mô tả:**
- Hình ảnh minh họa cho hàm `split()` và cách hoạt động của nó trong Python (ghi chú về hình ảnh: Hình ảnh cho thấy cách tách chuỗi thành danh sách các từ).

**Bảng biểu:**
| Ký tự tách | Số lần xuất hiện |
|------------|------------------|
| " "        | 2                |
| "-"        | 2                |
| ","        | 1                |

Lưu ý: Bảng trên chỉ là ví dụ, số liệu có thể thay đổi tùy thuộc vào chuỗi đầu vào.



# Bài học 11: Hàm và Chương trình

## Nội dung lý thuyết
Hàm là một đoạn mã được định nghĩa để thực hiện một nhiệm vụ cụ thể. Hàm có thể nhận tham số đầu vào và trả về giá trị đầu ra. Trong lập trình, việc sử dụng hàm giúp cho mã nguồn trở nên gọn gàng, dễ hiểu và dễ bảo trì.

### Ví dụ minh họa
1. **Hàm power(a, b, c)**: Hàm này nhận ba tham số là a, b, c (các số nguyên) và trả về giá trị a^b mod c.
```python
def power(a, b, c):
return (a ** b) % c
```

2. **Chương trình tính tổng n số tự nhiên**:
```python
n = int(input("Nhập số lượng số tự nhiên: "))
S = 0
for i in range(n):
S += int(input("Nhập số thứ {}: ".format(i + 1)))
print("Tổng các số là:", S)
```

3. **Chương trình tìm ước chung lớn nhất (ƯCLN)**:
```python
a = int(input("Nhập số tự nhiên a: "))
b = int(input("Nhập số tự nhiên b: "))
while b != 0:
a, b = b, a % b
print("ƯCLN là:", a)
```

4. **Hàm change()**: Hàm này có hai tham số là xâu họ tên và số c. Nếu c = 0, hàm trả về xâu họ tên in hoa. Nếu c khác 0, hàm trả về xâu họ tên in thường.
```python
def change(name, c):
if c == 0:
return name.upper()
else:
return name.lower()
```

## Bài tập và câu hỏi
1. Viết hàm tính giai thừa của một số nguyên dương n.
2. Viết chương trình nhập vào hai số thực và in ra tổng, hiệu, tích, thương của chúng.
3. Viết hàm kiểm tra một số có phải là số nguyên tố hay không.
4. Viết chương trình nhập vào một chuỗi và in ra chuỗi đó với các ký tự in hoa.

## Hình ảnh mô tả
- Hình ảnh minh họa cho cấu trúc hàm trong lập trình.
- Hình ảnh biểu diễn quy trình tính ƯCLN bằng thuật toán Euclid.

## Bảng biểu
| Tham số | Kiểu dữ liệu | Mô tả                      |
|---------|--------------|----------------------------|
| a       | int          | Số nguyên a                |
| b       | int          | Số nguyên b                |
| c       | int          | Số nguyên c                |
| name    | str          | Xâu họ tên                 |
| c       | int          | Tham số điều kiện (0 hoặc 1) |

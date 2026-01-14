# Giá trị dữ liệu cụ thể và lợi ích của việc sử dụng biến

## Lệnh gán

1. Tìm hiểu khái niệm biến và lệnh gán
- Các lệnh sau, n ở đây được hiểu là gì?
- Sau khi gán \( n = 5 \), n sẽ được hiểu là đối tượng nguyên có giá trị 5.

- (định danh) của một vùng nhớ dùng để lưu trữ giá trị (dữ liệu có thể thay đổi khi thực hiện chương trình): Biến trong Python.
- Lệnh gán. Cú pháp của lệnh gán như sau:
```
<giá trị="">
```</giá>



# Giá trị biểu thức và biến trong Python

Trong Python, bạn có thể gán giá trị của một biểu thức cho một biến. Câu lệnh có cấu trúc như sau:

```
<biểu thức=""> = <giá trị="">
```

Khi thực hiện lệnh này, Python sẽ tính giá trị của `<biểu thức="">` và gán giá trị đó cho biến. Mọi biến có trong `<biểu thức="">` đều cần được xác định trước.

## Ví dụ

Giả sử:

- \( x \) là biến kiểu số nguyên có giá trị bằng 5
- \( y \) là biến kiểu số nguyên có giá trị bằng 10
- \( z \) là biến kiểu số thực có giá trị bằng 3.14

Bạn có thể gán giá trị cho biến bằng cách sử dụng biểu thức với các biến đã được xác định trước.

```python
x = 5
y = 10
z = 3.14
result = x + y + z
```

Trong ví dụ trên, biến `result` sẽ nhận giá trị bằng 18.14.

## Lưu ý

Tên biến thường được đặt sao cho dễ nhớ và có ý nghĩa. Ví dụ:

```python
ten = "Hoài Nam"
print("Xin chào", ten)
```

Khi chạy đoạn mã trên, kết quả sẽ là:

```
Xin chào Hoài Nam
```</biểu></biểu></giá></biểu>



# Bài 12

## Câu hỏi
C. My country
D. m123&#x26;b

### Câu hỏi dưới đây: các biến x, y nhận giá trị bao nhiêu?
1. \( x^2 = 10 \)
2. \( x/2 + y = 1 \)

### Giá trị gì sau các lệnh sau?
1. \( a = 2,3 \)
2. \( b = a + b, a - b \)

## Ép toán trên một số kiểu dữ liệu

### 1. Các phép toán trên dữ liệu kiểu số và kiểu xâu kí tự
- Các phép toán trên dữ liệu kiểu số.
- Các phép toán trên dữ liệu kiểu xâu kí tự.



# Nội dung SGK

## 1. Biểu thức và phép toán

### 1.1. Biểu thức có dấu ngoặc
Nếu có ngoặc thì biểu thức trong ngoặc được ưu tiên thực hiện.

### 1.2. Phép toán với dữ liệu kiểu xâu kí tự
- Hà Nội
- Việt Nam

### 1.3. Các phép toán với xâu kí tự
1. Phép nối hai xâu kí tự.
2. Phép lặp n lần xâu gốc.
3. Nếu n với số n &#x3C; 0 thì được kết quả.

### 1.4. Kết quả của biểu thức
Biểu thức có cả số thực và số nguyên thì kết quả sẽ có kiểu số thực.

### 1.5. Các phép toán trên dữ liệu kiểu số
- Phép chia: `1 %`
- Phép nhân: `Xx`

### 1.6. Các phép toán trên dữ liệu kiểu vâu
- Phép cộng: `Inái vâu`
- Phép trừ: `X (lăn)`

## 2. Ví dụ về biểu thức
```plaintext
(2**4)  5//(2**2)
```

### 2.1. Kết luận
Các phép toán trên dữ liệu kiểu số và kiểu xâu kí tự có những quy tắc riêng biệt cần được nắm rõ để thực hiện chính xác.



# VUI cu Uu

## Khóa if và with nên bị báo lỗi.
Khóa trong Python phiên bản 3.x.

- break
- else
- if
- not
- as
- from

- class
- except
- import
- or
- assert
- global

- continue
- finally
- in
- pass
- del
- lambda

- def
- for
- is
- raise
- elif
- nonlocal

### Từ khóa
Từ khóa là các từ đặc biệt tham gia vào cấu trúc của ngôn ngữ lập trình. Chúng không được phép đặt tên biến hay các định danh trùng với các từ khóa này.

### Câu hỏi
Có hợp lệ không?
1. a) global
2. b) nonlocal
3. c) return



# Soạn thảo chương trình

## Chương trình tính diện tích và chu vi hình tròn

Viết chương trình sau trong môi trường lập trình F:

- Chu vi hình tròn là: \( C = 2 \cdot R \cdot \pi \)
- Diện tích hình tròn là: \( S = \pi \cdot R^2 \)

### Kiểm tra kết quả

- So sánh với chế độ gõ lệnh.

### Lỗi có thể gặp

1. Nếu bạn gặp lỗi sau:
```python
a = X + 1
```
- **Lỗi**: `Error: invalid syntax`
- **Kết quả in ra**: `t (¹ᴵđồ rê mi "*3 + 11pha son la si đô '*2)`

### Ghi chú

- Hãy kiểm tra lại cú pháp và các biến đã được định nghĩa trước khi chạy chương trình.
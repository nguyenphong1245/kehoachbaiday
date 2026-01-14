# Lập Trình Căn Bản

## 1. Khái niệm biểu thức lôgic

### Lệnh 1
Em hãy điền thông tin ở tình huống trên `&#x3C;Điều kiện>` và lệnh tương ứng trong sơ đồ rẽ nhánh ở Hình 19.1.

### Các biểu thức lôgic
Biểu thức lôgic là biểu thức chỉ nhận giá trị True (đúng) hoặc False (sai). Biểu thức lôgic đơn giản nhất là các biểu thức so sánh số.

#### Các phương án:
- A. a + b > 1
- B. a * b &#x3C; a + b
- C. 12 + 15 - 10

Các phương án B, C, D là biểu thức lôgic.

### Kiểu dữ liệu lôgic
Sử dụng các lệnh sau để nhận biết kiểu dữ liệu lôgic:
```plaintext
a = 10
b = 2
s = ""
```

## Hình 19.1
*Hình ảnh mô tả sơ đồ rẽ nhánh (không có hình ảnh thực tế trong văn bản này).*



# Cấu trúc lệnh if trong Python

Có b = X &#x3C; 11 and Z 5 nhận giá trị đúng.
X > 15 sai (vì X = 10) nhưng y &#x3C; 9 đúng (vì y = 5)
Y ra c = X 15 or y &#x3C; 9 nhận giá trị đúng.
Vì b là đúng nên a 2 not b sẽ nhận giá trị sai.

**Biểu thức lôgic** là biểu thức chỉ nhận giá trị True hoặc False.
**Biểu thức lôgic** thuộc kiểu bool.
Các phép toán trên kiểu dữ liệu lôgic là and (và), or (hoặc) và not (không).

**Câu hỏi:**
Cấu trúc lệnh if trong Python có giá trị True hay False?
a) 0
b) 111//5 != 20 or 2093 != 0

**Ví dụ:**
Số tự nhiên n (được gán hoặc nhập từ bàn phím). Đoạn kiểm tra n > 0 thì thông báo "n là số lớn hơn 0".



# Khối Lệnh trong Python

Các khối lệnh trong Python đều cần viết sau dấu `:` và lùi vào. Đây là điểm khác biệt của Python với các ngôn ngữ lập trình khác.

## Câu lệnh điều kiện `if`

Câu lệnh điều kiện `if` thể hiện cấu trúc rẽ nhánh trong Python. Các nhánh của `if` được viết sau dấu `:` và cần viết lùi vào.

### Ví dụ

```python
if a == b:
print("a bằng b")
else:
print("a không bằng b")
```

### Câu hỏi

Chương trình sau thực hiện công việc gì?

```python
n = int(input("Nhập một số nguyên dương: "))
if n &#x3C; 0:
print("Bạn nhập sai")
```

### Ghi chú

Liên quan đến kiểu dữ liệu `bool` và lệnh `if`.



```markdown
1. Sử dụng lệnh `round(t)` để làm tròn số thực `t`. Chú ý tròn các số thập phân. Chương trình có thể như sau:

```python
kWh = float(input("Nhập số kWh tiêu thụ điện nhà em: "))
if kWh &#x3C;= 50:
tien_dien = 50 * 1.678
elif kWh &#x3C;= 100:
tien_dien = 50 * 1.678 + (kWh - 50) * 1.734
else:
tien_dien = 50 * 1.678 + 50 * 1.734 + (kWh - 100) * 2.014

tien_dien_phai_tra = round(tien_dien, 0)
print("Tiền điện phải trả là: ", tien_dien_phai_tra, "nghìn đồng")
```

### 1. Thức lôgic ứng với mỗi câu sau:
- \( X \) nằm trong khoảng \( (0; 10) \).
- \( Y \) nằm ngoài đoạn \( [1; 2] \).
- \( Z \) nằm trong đoạn \( [0; 1] \) hoặc \( [5; 10] \).

### Vài giá trị \( m, n \) thoả mãn các biểu thức sau:
- \( 0 &#x3C; m &#x3C; 10 \)
- \( n &#x3C; 1 \) hoặc \( n > 2 \)
- \( 0 \leq Z \leq 1 \) hoặc \( 5 \leq Z \leq 10 \)
```
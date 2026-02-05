**Tiêu đề bài học:** Biểu thức lôgic trong lập trình

**Nội dung lý thuyết:**
Biểu thức lôgic là biểu thức chỉ nhận giá trị True (đúng) hoặc False (sai). Biểu thức lôgic đơn giản nhất là các biểu thức so sánh số. Ví dụ, các phương án sau đây đều là biểu thức lôgic:
- A. a + b > 1
- B. a * b &#x3C; a + b
- C. 12 + 15 - 10

**Ví dụ minh họa:**
Giả sử ta có các biến a và b được gán giá trị như sau:
- a = 10
- b = 2

Ta có thể sử dụng các biểu thức lôgic để kiểm tra các điều kiện như:
- a + b > 1 (True)
- a * b &#x3C; a + b (False)

**Bài tập và câu hỏi:**
1. Hãy điền thông tin ở tình huống sau vào vị trí &#x3C;điều kiện> trong lệnh điều kiện của các ngôn ngữ lập trình bậc cao:
- &#x3C;Điều kiện> thì <lệnh>
2. Cho các biểu thức lôgic sau, hãy xác định giá trị của chúng khi a = 10 và b = 2:
- A. a + b > 1
- B. a * b &#x3C; a + b
- C. 12 + 15 - 10

**Hình ảnh mô tả:**
- Hình 19.1: Sơ đồ rẽ nhánh trong lập trình (Ghi chú: Hình ảnh này mô tả cách thức hoạt động của lệnh điều kiện trong lập trình, thể hiện các nhánh khác nhau dựa trên giá trị của biểu thức lôgic).

**Bảng biểu:**
| Biểu thức lôgic          | Giá trị khi a = 10, b = 2 |
|--------------------------|---------------------------|
| a + b > 1                | True                      |
| a * b &#x3C; a + b            | False                     |
| 12 + 15 - 10             | True                      |</lệnh>



**Tiêu đề bài học: Cấu trúc lệnh if trong Python**

**Nội dung lý thuyết:**
Cấu trúc lệnh if trong Python được sử dụng để kiểm tra điều kiện và thực hiện các lệnh khác nhau dựa trên kết quả của điều kiện đó. Nếu điều kiện là đúng (True), thì khối lệnh bên trong sẽ được thực thi; nếu điều kiện là sai (False), khối lệnh đó sẽ bị bỏ qua.

**Ví dụ minh họa:**
```python
n = int(input("Nhập một số tự nhiên: "))
if n > 0:
print("n là số lớn hơn 0")
```

**Bài tập và câu hỏi:**
1. Viết chương trình kiểm tra xem một số nhập vào có phải là số âm hay không.
2. Thay đổi chương trình trên để thông báo nếu số nhập vào là 0.

**Hình ảnh mô tả:**
(Ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc lệnh if trong Python với các nhánh điều kiện và kết quả.)

**Bảng biểu:**
| Điều kiện         | Kết quả                |
|-------------------|-----------------------|
| n > 0             | "n là số lớn hơn 0"   |
| n &#x3C;= 0            | "n không phải là số lớn hơn 0" |




# Khối Lệnh trong Python

## Nội dung lý thuyết
Các khối lệnh trong Python đều cần viết sau dấu hai chấm (:) và lùi vào. Đây là điểm khác biệt của Python với các ngôn ngữ lập trình khác. Câu lệnh điều kiện `if` thể hiện cấu trúc rẽ nhánh trong Python. Các nhánh của `if` được viết sau dấu hai chấm và cần viết lùi vào.

## Ví dụ minh họa
```python
a = int(input("Nhập một số nguyên dương: "))
if a > 0:
print("Bạn đã nhập một số dương.")
else:
print("Bạn nhập sai.")
```

## Bài tập và câu hỏi
1. Viết chương trình kiểm tra một số nguyên dương và in ra thông báo tương ứng.
2. Giải thích cấu trúc của câu lệnh `if` trong Python.
3. Thay đổi chương trình trên để kiểm tra xem số đó có phải là số chẵn hay không.

## Hình ảnh mô tả
*Hình ảnh mô tả cấu trúc khối lệnh trong Python và cách sử dụng câu lệnh `if`.*

## Bảng biểu
| Câu lệnh | Mô tả                          |
|----------|--------------------------------|
| `if`     | Kiểm tra điều kiện            |
| `else`   | Thực hiện nếu điều kiện sai   |
| `elif`   | Kiểm tra điều kiện bổ sung    |




**Tiêu đề bài học:** Sử dụng lệnh round() trong lập trình

**Nội dung lý thuyết:**
Lệnh `round(t)` được sử dụng để làm tròn số thực `t`. Khi sử dụng lệnh này, bạn có thể chỉ định số chữ số thập phân mà bạn muốn làm tròn. Nếu không chỉ định, số sẽ được làm tròn đến số nguyên gần nhất.

**Ví dụ minh họa:**
Giả sử bạn có một chương trình tính tiền điện dựa trên số kWh tiêu thụ. Chương trình có thể như sau:

```python
kWh = float(input("Nhập số kWh tiêu thụ điện nhà em: "))
if kWh &#x3C;= 50:
tien_dien = kWh * 1.678
elif kWh &#x3C;= 100:
tien_dien = 50 * 1.678 + (kWh - 50) * 1.734
else:
tien_dien = 50 * 1.678 + 50 * 1.734 + (kWh - 100) * 2.014

tien_dien = round(tien_dien, 0)  # Làm tròn số tiền điện
print("Tiền điện phải trả là:", tien_dien, "nghìn đồng")
```

**Bài tập và câu hỏi:**
1. Viết một chương trình tương tự để tính tiền điện cho các mức tiêu thụ khác nhau.
2. Giải thích cách hoạt động của lệnh `round()` trong chương trình trên.
3. Hãy thử nghiệm với các giá trị khác nhau cho `kWh` và ghi lại kết quả.

**Hình ảnh mô tả:**
(Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một biểu đồ thể hiện mức tiêu thụ điện và tiền điện phải trả tương ứng.)

**Bảng biểu:**
| Mức tiêu thụ (kWh) | Đơn giá (nghìn đồng/kWh) | Tiền điện (nghìn đồng) |
|---------------------|--------------------------|-------------------------|
| 0 - 50              | 1.678                    |                         |
| 51 - 100            | 1.734                    |                         |
| Trên 100            | 2.014                    |                         |

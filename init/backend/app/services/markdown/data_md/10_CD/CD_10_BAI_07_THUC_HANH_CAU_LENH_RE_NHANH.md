# BÀI THỰC HÀNH
## CÂU LỆNH RẼ NHÁNH

Học xong bài này; em sẽ:
- Viết được chương trình đơn giản có sử dụng câu lệnh rẽ nhánh.

### Bài 1. Lấy ví dụ về câu lệnh if
Bảng sau đây cho một ví dụ về viết câu lệnh if tương ứng với mô tả điều kiện để đưa ra một thông báo trên màn hình:

| Mô tả                                                    | Câu lệnh if                                      |
|---------------------------------------------------------|--------------------------------------------------|
| Nếu age lớn hơn hoặc bằng 18 đưa ra                     | `age >= 18`                                      |
| thông điệp "Bạn đã đủ tuổi bầu cử"                      | `print("Bạn đã đủ tuổi bầu cử")`                |

Em hãy cho thêm hai ví dụ nữa tương tự như ví dụ đã có trong bảng.

### Bài 2. Chia kẹo
Có 1 chiếc kẹo và m em bé. Hãy viết chương trình nhập vào hai số nguyên dương n và m, và kiểm tra n chiếc kẹo có chia đều được cho m em bé hay không (thông báo ra màn hình "Có?" hoặc "Không"). Chạy chương trình ba lần, mỗi lần với bộ dữ liệu n, m khác nhau:

Gợi ý: Để có thể chia đều số kẹo thì n phải chia hết cho m, như vậy ở đây cần kiểm tra số dư của phép chia n cho m có bằng 0 hay không, tức là kiểm tra điều kiện \( n \mod m = 0 \).

### Bài 3. Tìm lỗi sai
Ba bạn Bình, An, Phúc thảo luận với nhau để viết chương trình Python nhập vào từ bàn phím ba số thực khác nhau và in ra màn hình số đứng giữa trong ba số (số đó không là lớn nhất và cũng không là nhỏ nhất).

Mỗi bạn soạn thảo chương trình và chạy thử trên máy tính của mình nhưng mỗi bạn đều gặp báo lỗi của Python (Hình 1a, Hình 1b và Hình 1c). Em hãy xác định lỗi ở chương trình của mỗi bạn; sửa lỗi cho từng bạn sao cho chương trình chạy được và đưa ra kết quả đúng.

```python
# Giữ giá trị nhỏ
if a &#x3C; b:
u = a
else:
u = b  # Giữ giá trị lớn
if a != u and a != v:
print("Số giữa là a")
if b != u and b != v:
print("Số giữa là b")
if c != u and c != v:
print("Số giữa là c")
```

Hình 1a: Báo lỗi ở chương trình của bạn Bình

Đọc sách tại hoc1O.vn



# Bài 4. Tìm số lớn nhất

Viết chương trình nhập vào từ bàn phím ba số nguyên mỗi số ghi trên một dòng và đưa ra màn hình giá trị lớn nhất trong các số đã nhập. Em hãy chạy chương trình với một số bộ dữ liệu vào khác nhau:

## Ví dụ:
| INPUT | OUTPUT |
|-------|--------|
| 2     | Max 10 |
| b     | 10     |

Em hãy đọc hiểu sơ đồ khối và chương trình ở Hình 2, thực hiện chương trình và cho nhận xét.

### Bắt đầu

Nhập a, b, c

```python
max = int(input("a: "))
max = int(input("b: "))
max = int(input("c: "))
if max &#x3C; b:
max = b
if max &#x3C; c:
max = c
print("Max:", max)
```

### Kết thúc

----

### Hình ảnh mô tả
- Hình 1: Báo lỗi ở chương trình của bạn
- Hình 2: Báo lỗi ở chương trình của bạn

### Lưu ý
- Đảm bảo rằng các giá trị nhập vào là số nguyên.
- Chương trình cần xử lý các trường hợp nhập không hợp lệ.



# Tiền điện

Tiêu thụ x (kWh) điện:
- Nếu \( x &#x3C; a \) thì số tiền phải trả là \( d \)
- Nếu \( a &#x3C; x &#x3C; b \) thì số tiền phải trả là \( d + (x - a) \cdot d_1 \)
- Nếu \( x > b \) thì số tiền phải trả là \( a \cdot d + (b - a) \cdot d_1 + (x - b) \cdot d_2 \)

Em hãy viết chương trình nhập vào từ bàn phím các số nguyên dương \( a, b, d, d_1, d_2; \) và \( x \) tính và đưa ra màn hình số tiền điện phải trả: Tìm hiểu bảng giá điện hiện hành và chạy chương trình một số lần sao cho có đủ các bộ dữ liệu đầu vào đại diện cho các mức tính tiền điện.

## BÀI TÌM HIỂU THÊM

### CÂU LỆNH IF VÀ NHIỀU NHÁNH RẼ

Có thể dùng câu lệnh if để rẽ nhiều nhánh (Hình 3), các nhánh lồng được bắt đầu bằng từ khóa `elif` và có khoảng cách các dòng giống ở dòng câu lệnh if:

```
if &#x3C;Điều kiện 1>:
Nhóm câu lệnh 1
elif &#x3C;Điều kiện 2>:
Nhóm câu lệnh 2
else:
Nhóm câu lệnh 3
```

#### Hình 3. Cấu trúc và sơ đồ khối của câu lệnh if lồng nhau

Ví dụ: Một người cân nặng \( w \) (kg) và cao \( h \) (m) sẽ có chỉ số BMI là \( \frac{w}{h^2} \). Bảng bên là bảng đánh giá sức khoẻ cho người châu Á theo chỉ số BMI.

| BMI          | Đánh giá     |
|--------------|--------------|
| \( BMI &#x3C; 18.5 \) | Thiểu cân   |
| \( 18.5 &#x3C; BMI &#x3C; 22.9 \) | Bình thường |
| \( BMI > 22.9 \) | Thừa cân    |

Trong Python, để viết chương trình đánh giá sức khoẻ theo chỉ số BMI ta có thể sử dụng các lệnh if lồng nhau như ở Hình 4.

```python
weight = float(input("Cân nặng (kg): "))
height = float(input("Chiều cao (m): "))
BMI = weight / (height ** 2)

if BMI &#x3C; 18:
print("Thiếu cân")
elif BMI &#x3C; 22:
print("Bình thường")
else:
print("Thừa cân")
```

#### Kết quả ví dụ

```
Cân nặng (kg): 55
Chiều cao (m): 1.65
Bình thường
```

#### Hình 4. Chương trình sử dụng câu lệnh if lồng nhau

Đọc sách tại học O.vn 79
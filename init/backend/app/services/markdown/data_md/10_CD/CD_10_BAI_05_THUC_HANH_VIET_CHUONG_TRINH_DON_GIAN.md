# BÀI 5: THỰC HÀNH VIẾT CHƯƠNG TRÌNH ĐƠN GIẢN

Học xong bài này, em sẽ:
- Viết và thực hiện được một vài chương trình Python đơn giản với dữ liệu nhập vào từ bàn phím.
- Sử dụng được một vài hàm toán học do Python cung cấp.
- Nhận biết được chú thích trong một chương trình Python.

## Bài 1: Giải phương trình bậc nhất

Chương trình ở Hình 1a được viết để giải phương trình bậc nhất \( ax + b = 0 \) với \( a, b \) là hai số được nhập từ bàn phím (\( a \neq 0 \)) và nghiệm được thông báo ra màn hình. Tuy nhiên, chương trình đó còn viết thiếu ở những vị trí. Em hãy hoàn thiện chương trình và kiểm thử xem với dữ liệu vào \( a = 1 \) và \( b = 2 \), cho kết quả giống như Hình 1b không? Chương trình em vừa hoàn thiện có:

### Chương trình

```python
a = float(input("Nhập a: "))
b = float(input("Nhập b: "))
if a != 0:
x = -b / a
print("Nghiệm của phương trình là:", x)
else:
print("Giá trị a không được bằng 0.")
```

### Ví dụ chạy chương trình với \( a = 1, b = 2 \)

- Hình 1a
- Hình 1b

Chương trình sẽ đưa ra màn hình thông tin gì nếu nhập vào giá trị \( a = 0 \)?

## Bài 2: An ninh lương thực

Trung bình mỗi người cần có \( a \) kg gạo để ăn, chế biến và phục vụ chăn nuôi trong một năm. Để đảm bảo an ninh lương thực, số gạo dự trữ phải chia cho đầu người lớn hơn hoặc bằng \( b \) kg.

Một nước có số dân là \( b \) thì cần dự trữ tối thiểu bao nhiêu kg gạo? Em hãy viết chương trình nhập từ bàn phím hai số \( a, b \) và đưa ra màn hình khối lượng gạo tối thiểu cần dự trữ.

----

Đọc sách tại học O.vn 69



# Yêu cầu: Cần đưa ra màn hình hướng dẫn nhập dữ liệu và thông báo kết quả bằng tiếng Việt có dấu:

## Ví dụ:
| INPUT      | OUTPUT         |
|------------|----------------|
| 365        | Số gạ0 cân dụ trũ: |
| 91086294   | 33246497310    |

## Bài 3. Tìm ước chung lớn nhất
Em hãy viết chương trình nhập vào từ bàn phím hai số nguyên a và b, tính và đưa ra màn hình ước chung lớn nhất của hai số đó.

### Gợi ý
Hay sử dụng một số hàm toán học thường dùng trong Python.

### Một số hàm toán học thường dùng
Để hỗ trợ cho người dùng trong các chương trình tính toán; mỗi ngôn ngữ lập trình bậc cao đều cung cấp sẵn nhiều hàm toán học. Các hàm tính toán có sẵn như vậy thường được lưu trữ trong một thư viện thuộc hệ thống lập trình của ngôn ngữ bậc cao đó.

Trong Python, các hàm toán học lưu trữ trong thư viện `math`. Bảng 1 nêu một số hàm thường dùng:

| Hàm         | Nghĩa toán học                                      |
|-------------|----------------------------------------------------|
| `abs(x)`    | Tính giá trị tuyệt đối của x                       |
| `ceil(x)`   | Trả về số nguyên nhỏ nhất, lớn hơn hoặc bằng giá trị x |
| `gcd(x, y)` | Tính ước chung lớn nhất của số nguyên x và y     |
| `sqrt(x)`   | Tính căn bậc hai của x                             |
| `log(x)`    | Tính logarit tự nhiên của x                        |
| `exp(x)`    | Tính e^x                                          |

Hàm `abs()` có thể sử dụng trực tiếp. Với các hàm còn lại như `ceil()`, `gcd()` ta cần đưa vào chương trình câu lệnh `import math` trước khi gọi hàm lần đầu tiên. Thông thường câu lệnh này được viết ngay ở đầu chương trình (Hình 2).

### Lời gọi tới hàm có dạng:
```python
math.<tên hàm="">
```

Đã đọc sách tại hoc1O.vn</tên>



```markdown
# Bài 4. Làm quen với ghi chú thích trong chương trình

Em hãy soạn thảo rồi chạy thử chương trình ở Hình 3 sau đây trong hai trường hợp là có chú thích và không có chú thích. Em có nhận xét gì khi so sánh kết quả thực hiện chương trình trong hai trường hợp nêu trên?

## Tìm hiểu về chú thích trong chương trình

Khi soạn thảo chương trình, ngoài các câu lệnh, lập trình có thể viết thêm các dòng chú thích. Các chú thích không ảnh hưởng đến nội dung chương trình mà chỉ giúp cho người đọc nhanh chóng biết được mục đích của các câu lệnh và ý nghĩa của chương trình. Trong Python, thông tin chú thích viết trên một dòng, bắt đầu bằng ký tự `#`. Nhờ ký tự đánh dấu đó mà máy tính nhận biết được dòng chú thích.

```python
# Giải phương trình bậc hai                                     # Chú thích cho biết mục đích của chương trình
import math                                                     # Thư viện hàm toán học
a = 1
b = -b
c = 0
x1 = (-b + math.sqrt(b*b - 4*a*c)) / (2*a)                   # Chú thích cho biết kiến thức
x2 = (-b - math.sqrt(b*b - 4*a*c)) / (2*a)                   # Định lý Viet
print(x1)
print(x2)
```

Hình 3. Ghi chú thích trong chương trình

Viết chương trình tính và đưa ra màn hình vận tốc v (m/s) khi chạm mặt đất của một vật rơi tự do từ độ cao h, biết \( V = \sqrt{2gh} \) trong đó g là gia tốc trọng trường (g ~ 9.8 m/s²). Độ cao h tính theo mét được nhập từ bàn phím.
```
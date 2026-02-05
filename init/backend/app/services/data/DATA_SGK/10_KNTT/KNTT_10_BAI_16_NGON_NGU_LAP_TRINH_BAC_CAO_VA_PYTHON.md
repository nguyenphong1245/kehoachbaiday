# Bài học: Ngôn ngữ lập trình và ngôn ngữ máy

## Nội dung lý thuyết
Ngôn ngữ lập trình là một hệ thống quy tắc cho phép con người viết các chương trình máy tính. Ngôn ngữ máy là ngôn ngữ mà máy tính có thể hiểu và thực thi trực tiếp. Mỗi loại ngôn ngữ lập trình có những đặc điểm riêng, từ cú pháp đến cách thức hoạt động.

### Ngôn ngữ máy
Ngôn ngữ máy được biểu diễn bằng các mã nhị phân (0 và 1). Đây là ngôn ngữ duy nhất mà máy tính có thể hiểu và thực thi. Ví dụ, một đoạn mã máy có thể trông như sau:

```
1001    01101110     00100000
0000    01110100     01110010
1010    10100001     01101110
```

### Ngôn ngữ lập trình bậc cao
Ngôn ngữ lập trình bậc cao như Python, Java, C++ cho phép lập trình viên viết mã dễ hiểu hơn, gần gũi với ngôn ngữ tự nhiên. Ví dụ, đoạn mã Python sau đây cho phép người dùng nhập vào một dãy số và tính tổng:

```python
n = int(input("Nhập số tự nhiên n: "))
tổng = 0
for i in range(n):
a = int(input("Nhập số thứ {}: ".format(i + 1)))
tổng += a
print("Tổng các số đã nhập là:", tổng)
```

## Ví dụ minh họa
Hình 16.1 mô tả một đoạn mã máy và mã nguồn tương ứng trong ngôn ngữ lập trình bậc cao.

### Hình ảnh mô tả
- **Hình 16.1**: So sánh giữa ngôn ngữ máy và ngôn ngữ lập trình bậc cao.

## Bài tập và câu hỏi
1. Hãy viết một chương trình bằng ngôn ngữ Python để tính tổng của n số nguyên dương mà người dùng nhập vào.
2. Giải thích sự khác biệt giữa ngôn ngữ máy và ngôn ngữ lập trình bậc cao.
3. Tại sao ngôn ngữ lập trình bậc cao lại được ưa chuộng hơn ngôn ngữ máy trong lập trình hiện đại?

## Bảng biểu
| Ngôn ngữ        | Đặc điểm                          |
|------------------|-----------------------------------|
| Ngôn ngữ máy     | Dễ hiểu cho máy, khó cho con người |
| Ngôn ngữ bậc cao | Dễ hiểu cho con người, khó cho máy |

## Ghi chú về hình ảnh
- Hình 16.1 minh họa sự khác biệt giữa ngôn ngữ máy và ngôn ngữ lập trình bậc cao, cho thấy cách mà các câu lệnh được biểu diễn trong từng loại ngôn ngữ.



# Bài học: Làm quen với môi trường lập trình Python

## Nội dung lý thuyết
Môi trường lập trình Python cho phép người dùng viết và thực hiện các lệnh trong hai chế độ: chế độ gõ lệnh trực tiếp và chế độ soạn thảo chương trình. Màn hình làm việc của Python có dạng tương tự như sau:

```
IDLE Shell 3.9.1
File  Edit  Debug  Options  Help
```

### Chế độ gõ lệnh trực tiếp
Trong chế độ này, người dùng có thể nhập lệnh trực tiếp vào shell. Sau khi nhập xong, nhấn phím Enter để thực hiện lệnh.

### Chế độ soạn thảo chương trình
Người dùng có thể viết các đoạn mã lệnh trong một cửa sổ soạn thảo và lưu lại để sử dụng sau này.

## Ví dụ minh họa
Khi bạn mở IDLE, bạn sẽ thấy một màn hình tương tự như sau:

```
Python 3.9.1 (tags/v3.9.1: le5d33e, Dec  7 2020, 17:08:20)
[GCC 8.3.0] on win32
Type "help", "copyright", "credits" or "license()" for more information
>>>
```

- Đây là nơi nhập lệnh. Sau khi nhập xong, nhấn phím Enter để thực hiện lệnh.
- Đây là dấu nhắc của Python.

## Bài tập và câu hỏi
1. Mô tả hai chế độ làm việc trong môi trường lập trình Python.
2. Hãy mở IDLE và thực hiện một lệnh đơn giản như `print("Hello, World!")`. Ghi lại kết quả.

## Hình ảnh mô tả
- **Hình 16.2**: Màn hình làm việc của Python.

## Bảng biểu
| Tính năng         | Chế độ gõ lệnh trực tiếp | Chế độ soạn thảo chương trình |
|-------------------|--------------------------|-------------------------------|
| Nhập lệnh         | Có                       | Không                         |
| Lưu chương trình  | Không                    | Có                            |
| Thực hiện lệnh    | Ngay lập tức             | Sau khi lưu                   |




# Bài học: Làm quen với Python

## Nội dung lý thuyết
Python là một ngôn ngữ lập trình mạnh mẽ và dễ học. Môi trường lập trình của Python có hai chế độ: chế độ gõ lệnh và chế độ soạn thảo. Trong chế độ gõ lệnh, người dùng có thể nhập các câu lệnh trực tiếp và nhận kết quả ngay lập tức. Chế độ soạn thảo cho phép người dùng viết và lưu trữ các chương trình Python.

## Ví dụ minh họa
```python
print("Xin chào")
print((5 + 2) * 7)
```
Khi nhập `5`, Python hiểu rằng đó là số nguyên.

## Bài tập và câu hỏi
1. Hãy viết một câu lệnh Python để in ra tên của bạn.
2. Tính giá trị của biểu thức `(10 - 3) * 4` và in kết quả ra màn hình.
3. Giải thích sự khác nhau giữa chế độ gõ lệnh và chế độ soạn thảo trong Python.

## Hình ảnh mô tả
*Ghi chú về hình ảnh: Hình ảnh mô tả giao diện của môi trường lập trình Python, bao gồm các phần như cửa sổ soạn thảo và cửa sổ gõ lệnh.*

## Bảng biểu
| Câu lệnh Python | Mô tả                       |
|------------------|-----------------------------|
| `print()`        | In ra màn hình              |
| `input()`        | Nhận dữ liệu từ người dùng  |
| `int()`          | Chuyển đổi sang số nguyên   |

----

Lưu ý: Nội dung trên được trích xuất và định dạng lại từ tài liệu gốc.



# Bài học: Nhập và xuất dữ liệu trong Python

## Nội dung lý thuyết
Trong Python, việc nhập và xuất dữ liệu là rất quan trọng. Để nhập dữ liệu từ bàn phím, chúng ta thường sử dụng hàm `input()`. Để xuất dữ liệu ra màn hình, chúng ta sử dụng hàm `print()`.

Hàm `print()` có thể in ra nhiều giá trị đồng thời, và các giá trị này có thể là số thực, số nguyên, hoặc chuỗi ký tự. Python hỗ trợ thực hiện các phép toán cơ bản như cộng, trừ, nhân, chia với các kiểu dữ liệu này.

## Ví dụ minh họa
```python
# Nhập dữ liệu từ người dùng
name = input("Nhập tên của bạn: ")
age = int(input("Nhập tuổi của bạn: "))

# Xuất dữ liệu ra màn hình
print("Tên của bạn là:", name)
print("Tuổi của bạn là:", age)
```

Kết quả của đoạn mã trên sẽ là:
```
Nhập tên của bạn: John
Nhập tuổi của bạn: 20
Tên của bạn là: John
Tuổi của bạn là: 20
```

## Bài tập và câu hỏi
1. Viết chương trình nhập vào hai số nguyên và in ra tổng của chúng.
2. Kết quả của mỗi lệnh sau là gì? Kết quả đó có kiểu dữ liệu nào?
- `1 + 1.5`
- `int("13")`
- `10 * 3 / 2`
- `3 * 2`
- `13 + 10 * 3 / 2 + 3 * 2`

## Hình ảnh mô tả
*Hình ảnh mô tả có thể là một sơ đồ minh họa cách hoạt động của hàm `input()` và `print()` trong Python, nhưng không có hình ảnh cụ thể trong văn bản này.*

## Bảng biểu
| Phép toán         | Kết quả | Kiểu dữ liệu |
|-------------------|---------|--------------|
| `1 + 1.5`         | `2.5`   | float        |
| `int("13")`      | `13`    | int          |
| `10 * 3 / 2`      | `15.0`  | float        |
| `3 * 2`           | `6`     | int          |
| `13 + 10 * 3 / 2 + 3 * 2` | `36.0` | float |




# Bài 1: Chương trình đầu tiên

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu về cách viết chương trình đầu tiên bằng ngôn ngữ lập trình Python. Chương trình đầu tiên thường là một chương trình đơn giản để in ra một thông điệp nào đó.

## Ví dụ minh họa
```python
print("Xin chào")
```
Khi chạy đoạn mã trên, màn hình sẽ hiển thị:
```
Xin chào
```

## Bài tập và câu hỏi
1. Hãy viết lệnh để tính giá trị các biểu thức sau trong chế độ gõ lệnh:
a) 20 - 7
b) 3 * 10 - 16
c) 12 / 5
d) Các biểu thức trên có lỗi không? Vì sao?

2. Viết lệnh in ra màn hình thông tin như sau:
a) "Bạn tên là Nguyễn Việt Anh"
b) "Bạn Hoa năm nay 16 tuổi"

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một giao diện của Python IDLE hoặc một trình soạn thảo mã nguồn với đoạn mã trên.)

## Bảng biểu
| Biểu thức         | Kết quả |
|-------------------|---------|
| 20 - 7            | 13      |
| 3 * 10 - 16       | 14      |
| 12 / 5            | 2.4     |

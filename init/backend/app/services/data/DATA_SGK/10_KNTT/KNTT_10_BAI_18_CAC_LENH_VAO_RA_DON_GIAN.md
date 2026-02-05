# Bài 1: Nhập và xuất dữ liệu trong Python

## Nội dung lý thuyết
Trong lập trình, việc nhập và xuất dữ liệu là rất quan trọng. Trong Python, lệnh `input()` được sử dụng để nhập dữ liệu từ bàn phím, trong khi lệnh `print()` được sử dụng để xuất dữ liệu ra màn hình.

Lệnh `input()` cho phép người dùng nhập dữ liệu và trả về giá trị đó dưới dạng chuỗi (string). Điều này có nghĩa là bất kỳ dữ liệu nào được nhập vào thông qua lệnh `input()` sẽ được coi là một chuỗi, cho dù đó là số hay ký tự.

## Ví dụ minh họa
```python
# Ví dụ sử dụng lệnh input()
number = input("Nhập một số: ")
print("Bạn đã nhập số:", number)
```
Khi chạy đoạn mã trên, nếu người dùng nhập `12`, chương trình sẽ xuất ra:
```
Bạn đã nhập số: 12
```

## Bài tập và câu hỏi
1. Hãy viết một chương trình sử dụng lệnh `input()` để yêu cầu người dùng nhập tên của họ và sau đó in ra lời chào.
2. Giải thích tại sao giá trị nhập vào từ lệnh `input()` luôn là chuỗi, ngay cả khi người dùng nhập số.

## Hình ảnh mô tả
*Hình ảnh mô tả có thể là một ảnh chụp màn hình của một chương trình Python đang chạy, hiển thị lệnh `input()` và kết quả đầu ra.*

## Bảng biểu
| Lệnh         | Chức năng                          |
|--------------|------------------------------------|
| `input()`    | Nhập dữ liệu từ bàn phím          |
| `print()`    | Xuất dữ liệu ra màn hình           |

----

Lưu ý: Nội dung trên được trích xuất và định dạng lại từ tài liệu gốc về Tin học.



**Tiêu đề bài học:** Các kiểu dữ liệu cơ bản trong Python

**Nội dung lý thuyết:**
Trong Python, có một số kiểu dữ liệu cơ bản mà người lập trình thường sử dụng. Các kiểu dữ liệu này bao gồm:

1. **Kiểu số nguyên (int):** Dùng để lưu trữ các số nguyên, ví dụ: 1, -5, 100.
- Ví dụ: `n = 10` (Biến n thuộc kiểu int số nguyên).

2. **Kiểu số thực (float):** Dùng để lưu trữ các số thực, ví dụ: 3.14, -0.001.
- Ví dụ: `x = 3.14` (Biến x thuộc kiểu float số thực).

3. **Kiểu xâu kí tự (str):** Dùng để lưu trữ chuỗi kí tự, ví dụ: "Hello", "Python".
- Ví dụ: `s = "Hello, World!"` (Biến s thuộc kiểu str xâu kí tự).

4. **Kiểu lôgic (bool):** Dùng để lưu trữ giá trị đúng hoặc sai, chỉ có hai giá trị là True (đúng) và False (sai).
- Ví dụ: Kết quả của phép so sánh `5 > 3` sẽ trả về True.

**Ví dụ minh họa:**
```python
n = 10          # Biến n thuộc kiểu int
x = 3.14       # Biến x thuộc kiểu float
s = "Hello"    # Biến s thuộc kiểu str
is_valid = True # Biến is_valid thuộc kiểu bool
```

**Bài tập và câu hỏi:**
1. Khai báo một biến thuộc kiểu int và gán cho nó giá trị 20.
2. Khai báo một biến thuộc kiểu float và gán cho nó giá trị 5.75.
3. Tạo một biến thuộc kiểu str và gán cho nó một câu chào.
4. Viết một biểu thức so sánh và in ra kết quả của nó (True hoặc False).

**Hình ảnh mô tả:**
- (Hình ảnh mô tả các kiểu dữ liệu cơ bản trong Python, bao gồm int, float, str, bool).

**Bảng biểu:**
| Kiểu dữ liệu | Ví dụ          | Mô tả                       |
|--------------|----------------|-----------------------------|
| int          | 10             | Số nguyên                   |
| float        | 3.14           | Số thực                     |
| str          | "Hello"       | Chuỗi kí tự                 |
| bool         | True/False     | Giá trị lôgic               |




Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các thông tin hoặc câu hỏi liên quan đến Tin học. Bạn cần hỗ trợ gì?



# Bài học: Nhập dữ liệu trong lập trình

## Nội dung lý thuyết
Trong lập trình, việc nhập dữ liệu từ người dùng là rất quan trọng. Chúng ta có thể sử dụng các lệnh để yêu cầu người dùng nhập thông tin và sau đó xử lý thông tin đó. Để nhập số nguyên, chúng ta thường sử dụng lệnh `int()` để chuyển đổi dữ liệu nhập từ bàn phím.

## Ví dụ minh họa
1. Nhập ba số nguyên m, n, p và tính tổng của chúng:
```python
m = int(input("Nhập số nguyên m: "))
n = int(input("Nhập số nguyên n: "))
p = int(input("Nhập số nguyên p: "))
print("Tổng ba số đã nhập là:", m + n + p)
```

2. Nhập họ tên và tuổi của người dùng:
```python
ten = input("Nhập họ tên: ")
tuoi = int(input("Nhập tuổi: "))
print("Bạn", ten, tuoi, "tuổi.")
```

## Bài tập và câu hỏi
1. Viết chương trình nhập ba số thực a, b, c và tính trung bình cộng của chúng.
2. Viết chương trình nhập tên của một người và in ra câu: "Xin chào, [tên]!"

## Hình ảnh mô tả
- Hình ảnh minh họa cho việc nhập dữ liệu từ bàn phím (ghi chú: hình ảnh này có thể là một ảnh chụp màn hình của một chương trình đang chạy).

## Bảng biểu
| Tên biến | Kiểu dữ liệu | Mô tả                     |
|----------|--------------|---------------------------|
| m        | int          | Số nguyên đầu vào thứ nhất|
| n        | int          | Số nguyên đầu vào thứ hai |
| p        | int          | Số nguyên đầu vào thứ ba  |
| ten      | str          | Họ tên người dùng         |
| tuoi     | int          | Tuổi của người dùng       |

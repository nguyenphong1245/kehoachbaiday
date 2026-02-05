# Bài học: Dữ liệu danh sách trong Python

## Nội dung lý thuyết
Dữ liệu danh sách (list) là một trong những kiểu dữ liệu cơ bản và được sử dụng phổ biến trong Python. Danh sách cho phép lưu trữ nhiều giá trị trong một biến duy nhất và có thể chứa các kiểu dữ liệu khác nhau.

### Khởi tạo và tìm hiểu dữ liệu kiểu danh sách
Danh sách trong Python được khởi tạo bằng cách sử dụng dấu ngoặc vuông `[]`. Ví dụ, một danh sách có thể được khởi tạo như sau:
```python
my_list = [1, 2, 3, 4, 5]
```
Bạn có thể truy cập từng phần tử của danh sách thông qua chỉ số. Chỉ số của danh sách bắt đầu từ 0. Ví dụ, để truy cập phần tử đầu tiên trong danh sách, bạn có thể sử dụng:
```python
first_element = my_list[0]  # Kết quả sẽ là 1
```

## Ví dụ minh họa
```python
# Khởi tạo danh sách
numbers = [1, 2, 3, 4, 5]

# Truy cập phần tử
print(numbers[0])  # In ra 1
print(numbers[2])  # In ra 3

# Thay đổi giá trị của phần tử
numbers[1] = 10
print(numbers)  # In ra [1, 10, 3, 4, 5]
```

## Bài tập và câu hỏi
1. Khởi tạo một danh sách chứa 5 tên của bạn bè.
2. Truy cập và in ra tên thứ hai trong danh sách.
3. Thay đổi tên thứ ba trong danh sách thành một tên khác và in ra toàn bộ danh sách.

## Hình ảnh mô tả
*Hình ảnh mô tả cách khởi tạo và truy cập phần tử trong danh sách sẽ được chèn vào đây.*

## Bảng biểu
| Chỉ số | Phần tử |
|--------|---------|
| 0      | 1       |
| 1      | 2       |
| 2      | 3       |
| 3      | 4       |
| 4      | 5       |

----

Lưu ý: Nội dung trên chỉ là một phần trong sách giáo khoa Tin học của Việt Nam về dữ liệu danh sách trong Python.



# Các phép ghép hai danh sách

## Nội dung lý thuyết
List là kiểu dữ liệu danh sách (dãy; mảng) trong Python, được tạo ra bằng lệnh gán với các phần tử trong cặp dấu ngoặc []. Các phần tử của danh sách có thể có các kiểu dữ liệu khác nhau. Bạn có thể thay đổi giá trị của từng phần tử thông qua chỉ số:
```
<danh sách="">[<chỉ số="">]
```
Chỉ số của danh sách bắt đầu từ 0 đến `len(<danh sách="">) - 1`, trong đó `len()` là lệnh tính độ dài danh sách.

Ví dụ danh sách A:
```
A = [1, 0, "One", 3, 9, 15, "Two", 3, True, False]
```
Các giá trị các phần tử:
- a) `A[7]`
- b) `A[2]`

## Ví dụ minh họa
Giả sử bạn có một danh sách các số:
```
A = [10, 20, 30, 40, 50]
```
Các lệnh sau thực hiện gì?
- a) `A[0]`
- b) `del A[0]`
- c) `A[2]`
- d) `A = A[1]*25`

## Bài tập và câu hỏi
1. Hãy tạo một danh sách mới và thực hiện các phép toán như thêm, xóa phần tử.
2. Viết một chương trình Python để tính tổng các phần tử trong một danh sách số nguyên.
3. Giải thích sự khác nhau giữa danh sách và tuple trong Python.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc của một danh sách trong Python với các chỉ số và giá trị tương ứng.)

## Bảng biểu
| Chỉ số | Giá trị |
|--------|---------|
| 0      | 1       |
| 1      | 0       |
| 2      | "One"   |
| 3      | 3       |
| 4      | 9       |
| 5      | 15      |
| 6      | "Two"   |
| 7      | 3       |
| 8      | True    |
| 9      | False   |</danh></chỉ></danh>



**Tiêu đề bài học: Thêm phần tử vào danh sách trong Python**

**Nội dung lý thuyết:**
Trong Python, danh sách là một kiểu dữ liệu rất linh hoạt cho phép lưu trữ nhiều giá trị khác nhau. Để thêm phần tử vào danh sách, chúng ta có thể sử dụng các lệnh đặc biệt. Một trong những phương thức phổ biến nhất là `append()`, cho phép thêm phần tử vào cuối danh sách.

**Ví dụ minh họa:**
```python
A = [1, 2, 3]
A.append(10)  # Thêm số 10 vào cuối danh sách A
print(A)  # Kết quả: [1, 2, 3, 10]
```

**Bài tập và câu hỏi:**
1. Viết chương trình in ra các số chẵn trong danh sách A.
2. Sử dụng phương thức `append()` để thêm các số nguyên dương vào danh sách B.

**Hình ảnh mô tả:**
- Hình ảnh mô tả cách sử dụng phương thức `append()` trong Python (ghi chú: hình ảnh minh họa cách thêm phần tử vào danh sách).

**Bảng biểu:**
| Phương thức  | Mô tả                          |
|--------------|--------------------------------|
| `append()`   | Thêm phần tử vào cuối danh sách |
| `insert()`   | Thêm phần tử vào vị trí chỉ định |
| `extend()`   | Thêm nhiều phần tử vào danh sách |

**Chú ý:** Hãy đảm bảo rằng bạn đã hiểu cách sử dụng các phương thức này để thao tác với danh sách trong Python.



Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các câu hỏi hoặc chủ đề liên quan đến Tin học. Bạn cần hỗ trợ gì?
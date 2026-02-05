# DANH SÁCH VỚI TOÁN TỬ IN

## Nội dung lý thuyết
Toán tử `in` được sử dụng để kiểm tra xem một phần tử có nằm trong một danh sách hay không. Khi sử dụng toán tử này, bạn có thể dễ dàng xác định sự tồn tại của một giá trị trong danh sách mà không cần phải duyệt qua từng phần tử.

## Ví dụ minh họa
Giả sử bạn có một danh sách số nguyên như sau:
```python
A = [1, 2, 3, 4, 5]
```
- Kiểm tra xem số nguyên 2 có nằm trong danh sách A hay không:
```python
2 in A  # Kết quả trả lại: True
```
- Kiểm tra xem số 10 có nằm trong danh sách A hay không:
```python
10 in A  # Kết quả trả lại: False
```

## Bài tập và câu hỏi
1. Tạo một danh sách các tên học sinh và sử dụng toán tử `in` để kiểm tra xem một tên cụ thể có trong danh sách hay không.
2. Viết một đoạn mã kiểm tra xem số 5 có nằm trong danh sách các số từ 1 đến 10 hay không.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một đoạn mã Python hiển thị cách sử dụng toán tử `in` với danh sách.)

## Bảng biểu
| Phần tử | Kết quả |
|---------|---------|
| 2 in A  | True    |
| 10 in A | False   |




**Tiêu đề bài học: Danh sách trong Python**

**Nội dung lý thuyết:**
Danh sách trong Python là một cấu trúc dữ liệu cho phép lưu trữ nhiều giá trị trong một biến. Danh sách có thể chứa các phần tử khác nhau và có thể thay đổi kích thước. Một số phương thức quan trọng của danh sách bao gồm:

- `clear()`: Xoá toàn bộ một danh sách.
- `remove(value)`: Xoá phần tử đầu tiên của danh sách có giá trị bằng `value`. Nếu không có phần tử nào như vậy, sẽ báo lỗi.
- `insert(index, value)`: Chèn phần tử `value` vào danh sách tại vị trí `index`.

**Ví dụ minh họa:**
```python
# Khởi tạo danh sách
my_list = [22, 3, 4, 5]

# Sử dụng clear()
my_list.clear()  # Danh sách sẽ trở thành []

# Khởi tạo lại danh sách
my_list = [22, 3, 4, 5]

# Sử dụng remove()
my_list.remove(3)  # Danh sách sẽ trở thành [22, 4, 5]

# Sử dụng insert()
my_list.insert(1, 10)  # Danh sách sẽ trở thành [22, 10, 4, 5]
```

**Bài tập và câu hỏi:**
1. Viết một chương trình sử dụng danh sách để lưu trữ 5 số nguyên và thực hiện các thao tác thêm, xoá, và chèn phần tử.
2. Giải thích sự khác nhau giữa phương thức `remove()` và `pop()` trong danh sách.

**Hình ảnh mô tả:**
- Hình ảnh mô tả cấu trúc danh sách và các phương thức hoạt động trên danh sách (ghi chú về hình ảnh: Hình ảnh minh họa các phương thức `clear()`, `remove()`, và `insert()`).

**Bảng biểu:**
| Phương thức  | Mô tả                                      |
|--------------|--------------------------------------------|
| `clear()`    | Xoá toàn bộ danh sách                     |
| `remove(value)` | Xoá phần tử đầu tiên có giá trị `value` |
| `insert(index, value)` | Chèn `value` vào vị trí `index`   |




# Bài học: Làm việc với dữ liệu kiểu danh sách

## Nội dung lý thuyết
Trong lập trình, danh sách là một kiểu dữ liệu rất quan trọng, cho phép lưu trữ nhiều giá trị trong một biến. Danh sách có thể chứa các kiểu dữ liệu khác nhau và có thể thay đổi kích thước linh hoạt. Một trong những thao tác phổ biến khi làm việc với danh sách là chèn (insert) một phần tử vào một vị trí cụ thể trong danh sách.

## Ví dụ minh họa
Giả sử bạn muốn nhập danh sách tên học sinh từ bàn phím và in ra danh sách đó theo thứ tự ngược lại. Bạn có thể sử dụng lệnh `insert()` để chèn tên học sinh vào đầu danh sách.

```python
n = int(input("Nhập số học sinh trong lớp: "))
danh_sach_hoc_sinh = []

for i in range(n):
name = input("Nhập họ tên học sinh thứ {}: ".format(i + 1))
danh_sach_hoc_sinh.insert(0, name)

print("Danh sách học sinh đã nhập theo thứ tự ngược lại:")
for student in danh_sach_hoc_sinh:
print(student)
```

## Bài tập và câu hỏi
1. Hãy viết chương trình nhập vào danh sách n số nguyên và in ra danh sách đó theo thứ tự ngược lại.
2. Giải thích cách hoạt động của lệnh `insert()` trong ví dụ trên.
3. Thay đổi chương trình để in ra danh sách học sinh theo thứ tự đã nhập mà không cần sử dụng lệnh `insert()`.

## Hình ảnh mô tả
*Hình ảnh mô tả có thể là một sơ đồ minh họa cách hoạt động của danh sách và lệnh `insert()`, nhưng không có hình ảnh cụ thể trong văn bản này.*

## Bảng biểu
| Thao tác         | Mô tả                                      |
|------------------|--------------------------------------------|
| Nhập số n       | Nhập vào số lượng phần tử trong danh sách |
| Nhập tên        | Nhập tên học sinh và chèn vào danh sách   |
| In danh sách     | In ra danh sách theo thứ tự ngược lại     |




Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các câu hỏi hoặc chủ đề liên quan đến Tin học. Bạn cần hỗ trợ gì?
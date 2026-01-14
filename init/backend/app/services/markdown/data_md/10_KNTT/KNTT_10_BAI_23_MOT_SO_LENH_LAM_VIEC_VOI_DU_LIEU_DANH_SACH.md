# 1. Lời mở đầu
Vào đầu ngày giờ giấc,

## 1.1. Kiểm tra một phần tử có nằm trong một danh sách không?

### DANH SÁCH VỚI TOÁN TỬ IN

1. Sử dụng toán tử `in` với danh sách
- Ví dụ sau để biết cách dùng toán tử `in` để duyệt một danh sách.
- Sử dụng toán tử `in` để kiểm tra một giá trị có nằm trong danh sách:
```python
A = [1, 2, 3, 4, 5]
```
- Số nguyên 2 nằm trong dãy A, kết quả trả lại `True`.
- Số 10 không nằm trong dãy A, kết quả trả lại `False`.

2. Dùng toán tử `in` để kiểm tra `<giá trị="">` có trong `<danh sách="">`:
- Trả về `True` nếu có, không thì trả về `False` như sau:
```python
in <danh sách="">
```</danh></danh></giá>



# Nội dung SGK

## Các Lệnh Xử Lý Danh Sách

### 1. Lệnh `clear()`
- **Chức năng**: Xoá toàn bộ một danh sách.
- **Cú pháp**:
```python
danh_sách.clear()
```

### 2. Lệnh `remove(value)`
- **Chức năng**: Xoá phần tử đầu tiên của danh sách có giá trị bằng `value`.
- **Cú pháp**:
```python
danh_sách.remove(value)
```
- **Lưu ý**: Nếu không có phần tử nào như vậy, sẽ báo lỗi.

#### Ví dụ:
```python
danh_sách = [22, 3, 4, 5]
danh_sách.remove(1)  # Lệnh báo lỗi nếu giá trị không có trong danh sách
```
- **Thông báo lỗi**:
```
Traceback (most recent call last):
File "yshell", line 1, in <module>
danh_sách.remove(10)
ValueError: list.remove(x): x not in list
```

### 3. Lệnh `insert(index, value)`
- **Chức năng**: Chèn phần tử vào danh sách tại vị trí chỉ định.
- **Cú pháp**:
```python
danh_sách.insert(index, value)
```

## Tóm tắt
- `clear()`: Xoá toàn bộ danh sách.
- `remove(value)`: Xoá phần tử đầu tiên có giá trị `value`.
- `insert(index, value)`: Chèn phần tử `value` vào vị trí `index` trong danh sách.</module>



# Chương A: Làm việc với dữ liệu kiểu danh sách

## 1. Nhập số n từ bàn phím, sau đó nhập danh sách n tên học sinh này; mỗi tên học sinh trên một dòng. Yêu cầu in danh sách học sinh theo thứ tự ngược lại với thứ tự đã nhập.

Chương trình sẽ yêu cầu nhập số tự nhiên n, sau đó sẽ nhập n tên học sinh. Tuy nhiên, do yêu cầu in danh sách học sinh theo thứ tự nhập nên cần dùng lệnh `insert()` để chèn tên học sinh vào danh sách. Chương trình có thể như sau:

```python
n = int(input("Nhập số học sinh trong lớp: "))
danh_sach_hoc_sinh = []
for i in range(n):
name = input("Nhập họ tên học sinh thứ " + str(i + 1) + ": ")
danh_sach_hoc_sinh.insert(0, name)

print("Danh sách học sinh đã nhập: ")
for name in danh_sach_hoc_sinh:
print(name)
```

### Giải thích:
- `insert(0, name)`: Chèn tên học sinh vào đầu danh sách, giúp danh sách được in ra theo thứ tự ngược lại với thứ tự đã nhập.



```markdown
# Nội dung SGK

## Bài 1: Tìm kiếm mẫu trong dãy số

### 1. Định nghĩa
Cho dãy số A và mẫu p. Nhiệm vụ là tìm vị trí của mẫu p trong dãy A.

### 2. Điều kiện
- Nếu độ dài của A là 3 và pkq == -1:
- Kiểm tra các điều kiện sau:
- `A[i] == p[0]`
- `A[i+1] == p[1]`
- `A[i+2] == p[2]`

### 3. Kết quả
- Nếu tìm thấy mẫu, in ra vị trí:
```plaintext
"Tìm thấy mẫu p tại vị trí" + pkq
```
- Nếu không tìm thấy mẫu:
```plaintext
"Không tìm thấy mẫu" + p
```

## Bài 2: Thao tác với dãy số

### 1. Đề bài
Cho dãy số:
```plaintext
số = [1, 2, 2, 3, 4, 5, 5]
```
- Viết lệnh thực hiện:
- Chèn số 1 vào ngay sau giá trị 1 của dãy.
- Chèn số 3 và số 4 vào danh sách để dãy có số 3 và số 4 liền nhau.

### 2. Yêu cầu
Viết chương trình thực hiện công việc sau:
- Chèn một phần tử ở chính giữa dãy nếu số phần tử của dãy là lẻ.
```
# Một cách ngắn gọn các bước cần thực hiện

## Lặp đi lặp lại
- Chương trình được gọi là cấu trúc lặp.
- Có thể xác định được trong mỗi ví dụ trên công việc nào cần lặp lại bao nhiêu lần không?

## 1. Làm quen với lệnh lặp `for`
- Đoạn chương trình sau trong chế độ gõ lệnh trực tiếp C:

```python
S = 0
for k in range(10):
S += k
```

- Tổng này có giá trị bao nhiêu? Giải thích kế.

- Trong chương trình trên, lệnh `range(10)` trả lại một vùng giá trị từ 0 đến 9. Lệnh `for` sẽ thực hiện 10 lần lặp, mỗi lần...



# Lệnh Lặp Trong Python

## 1. Lệnh Lặp Với Số Lần Biết Trước

Lệnh lặp thường được sử dụng khi bạn biết trước số lần lặp. Số lần lặp thường được xác định bởi giá trị của lệnh `range()`.

### Ví dụ:

```python
for k in range(1, n + 1):
# Thực hiện một số thao tác với k
```

## 2. Tìm Hiểu Vùng Giá Trị Xác Định Bởi Lệnh `range()`

Hãy xem xét lệnh `for` sau và so sánh kết quả đầu ra để biết vùng giá trị của `range()`. Lưu ý, lệnh `print()` có thêm tham số để in bên cạnh.

### Ví dụ:

```python
for k in range(3, 10):
print(k, end=' ')
```

**Đây là vùng `range(3, 10)`**:

- Giá trị đầu tiên: 3
- Giá trị cuối cùng: 9 (giá trị 10 không được bao gồm)

### Kết Quả Đầu Ra:

```
3 4 5 6 7 8 9
```

## 3. Kết Luận

Lệnh `range()` rất hữu ích trong việc xác định các giá trị mà bạn muốn lặp qua trong một lệnh lặp `for`. Hãy thử nghiệm với các giá trị khác nhau để hiểu rõ hơn về cách hoạt động của nó.



# Nội dung SGK

## Bài tập 1

### Mô tả
Viết chương trình nhập vào một số tự nhiên \( n \) và in ra tất cả các số tự nhiên từ 1 đến \( n \).

### Mã nguồn
```python
n = int(input("Nhập số tự nhiên n: "))
for k in range(1, n + 1):
print(k, end=' ')
```

## Bài tập 2

### Mô tả
Nhập số tự nhiên \( n \) từ bàn phím và đếm số các ước thực sự của \( n \) là số tự nhiên \( k &#x3C; n \) và là ước của \( n \). Tạo một biến có tên `count` để đếm số ước.

### Mã nguồn
```python
n = int(input("Nhập số tự nhiên n: "))
count = 0
for k in range(1, n):
if n % k == 0:
count += 1
print("Số ước thực sự của n là:", count)
```

## Câu hỏi
Chương trình sau in ra kết quả gì?
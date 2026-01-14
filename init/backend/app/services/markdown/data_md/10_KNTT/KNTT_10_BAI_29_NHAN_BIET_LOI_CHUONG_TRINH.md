# CHƯƠNG TRÌNH

## 1. Nhận biết và phân biệt một số loại lỗi chương trình

Các trường hợp chương trình gặp lỗi như sau; từ đó nhận biết được loại lỗi của chương trình.

### Hợp 1: Lỗi cú pháp

Người lập trình viết sai cú pháp lệnh; chương trình sẽ báo lỗi cú pháp.

```python
True print "Hello"
```
**Lỗi:** invalid syntax

### Hợp 2: Lỗi nhập dữ liệu

Người dùng nhập dữ liệu sai, chương trình thông báo lỗi khuôn dạng.

```python
n = int(input("Nhập số nguyên n: "))
```

## Hình 29.1
**Mô tả:** Hình minh họa cho các loại lỗi trong chương trình.



# Lỗi trong chương trình Python

## Các loại lỗi trong Python

1. **Lỗi cú pháp (Syntax Error)**:
- Khi có lệnh viết sai cú pháp hoặc sai cấu trúc ngôn ngữ, chương trình sẽ dừng lại và thông báo lỗi.

2. **Lỗi giá trị (ValueError)**:
- Khi người dùng nhập dữ liệu sai, hàm `int()` không thể chuyển đổi dữ liệu, chương trình dừng lại và báo lỗi. Mã lỗi là `ValueError` (lỗi trong khi đang thực hiện) hay còn gọi là lỗi ngoại lệ (Exception).

3. **Lỗi chỉ số (IndexError)**:
- Khi chương trình phát hiện lỗi chỉ số vượt quá giới hạn, chương trình dừng lại và báo lỗi. Mã lỗi là `IndexError`. Đây là lỗi Runtime.

4. **Lỗi ngữ nghĩa (Semantic Error)**:
- Chương trình không còn lỗi Runtime, nhưng kết quả trả về không đúng như mong đợi. Đây là lỗi ngữ nghĩa hoặc lỗi logic trong chương trình.

## Tổng kết

Tổng thể có thể phân biệt lỗi chương trình Python làm ba loại chính:
- Lỗi cú pháp
- Lỗi giá trị
- Lỗi chỉ số
- Lỗi ngữ nghĩa

Chương trình sẽ dừng lại và thông báo lỗi tương ứng với từng loại lỗi.



# Lỗi và Xử Lý Lỗi trong Lập Trình

## 1. Các loại lỗi thường gặp

### 1.1. Lỗi truy cập

- Lỗi xảy ra khi chương trình muốn tìm một tài nguyên nhưng chỉ số vượt quá giới hạn.

### 1.2. Lỗi kiểu dữ liệu

- Lỗi xảy ra khi lệnh truy cập một phần tử của danh sách không phải là số nguyên.
- Lệnh tính biểu thức số nhưng lại có một tham số không phải là số.

### 1.3. Lỗi liên quan đến giá trị của đối tượng

- Lỗi khi thực hiện lệnh chuyển đổi kiểu dữ liệu mà hàm không hỗ trợ. Ví dụ:
```python
int("1.55")
```
sẽ sinh lỗi loại này.

### 1.4. Lỗi thụt lề

- Lỗi khi các dòng lệnh thụt vào không đúng vị trí.

### 1.5. Lỗi cú pháp

- Lỗi cú pháp.

## 2. Xử lý lỗi

- Ghi lại mã lỗi ngoại lệ của mỗi lệnh sau nếu xảy ra lỗi.



# A. Nhập Chương Trình và Kiểm Tra Khả Năng Sinh Lỗi

1. Nhập chương trình sau và kiểm tra khả năng sinh lỗi:

```python
n = int(input("Nhập số tự nhiên n: "))
A = []
for k in range(n):
A.append(int(input("Nhập số thứ " + str(k + 1) + ": ")))
```

### Các khả năng sinh lỗi của chương trình:
- Nếu nhập không là số nguyên.
- Nếu dạng của danh sách nhập vào không là số nguyên.

### Câu hỏi:
1. Sau khi có sinh lỗi chương trình không? Nếu có thì mã lỗi là gì?

```python
A = [1, 3, 5, 10, 0]
S1 = "101010"
S2 = 51 + 52
for k in range(1, len(A) + 1):
# Thực hiện một số thao tác với A
```

### Ghi chú:
- Đảm bảo rằng các giá trị nhập vào là số nguyên để tránh lỗi trong quá trình thực thi chương trình.
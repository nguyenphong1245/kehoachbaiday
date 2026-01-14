# MỘT DÃY CÁC KÍ TỰ

## 1. Tìm hiểu cấu trúc của xâu kí tự

Các ví dụ sau để biết cấu trúc xâu kí tự, so sánh với danh sách (list).

### Cấu trúc xâu kí tự và cách truy cập đến từng kí tự của xâu.

- **Thời khoá biểu**

- Lệnh `len()` sẽ tính độ dài của các kí tự có trong xâu.
- Có thể truy cập từng kí tự của xâu.
- Chỉ số bắt đầu từ 0.



# Nguyên hợp lệ ở Câu 1 có độ dài bằng bao nhiêu?

## JYỆT KÍ TỰ CỦA XÂU

### 1. Tìm hiểu lệnh duyệt từng ký tự của xâu

Ác lệnh sau để biết cách duyệt từng ký tự của xâu ký tự bằng cách duyệt theo chỉ số và theo phần tử của xâu ký tự.

#### Hời khoá biểu

```python
for i in range(len(s)):  # Duyệt theo chỉ số với lệnh range
print(s[i], end = '')
```

#### Ký hiệu

```python
for ch in s:  # Duyệt theo ký tự của xâu ký tự
print(ch, end = '')
```

### 2. Biến i lần lượt chạy theo chỉ số của xâu ký tự s từ 0 đến n-1.



# LÀNH
## Cơ bản làm việc với xâu kí tự

1. Viết chương trình nhập số tự nhiên \( n \) là số học sinh, lưu họ và tên học sinh vào một danh sách. In danh sách trên một dòng. Chương trình có thể như sau:

```python
n = int(input("Nhập số học sinh trong lớp: "))
hoten = []
for i in range(n):
hoten.append(input("Nhập họ tên học sinh thứ " + str(i + 1) + ": "))
print("Danh sách lớp học:", hoten)
```



# Xâu Gốc và Xâu Con

## 1. Kiểm Tra Xâu

- **Xâu gốc có chứa xâu '10'**
- **Xâu gốc không chứa xâu '10'**

### Bài Tập

1. Viết đoạn lệnh trích ra xâu con của S bao gồm ba ký tự.
2. Viết chương trình kiểm tra xâu S có chứa chữ số không. Thông báo "S không chứa chữ số nào" nếu không có.

### Yêu Cầu

- Xâu S1, S2: Viết đoạn chương trình chèn xâu S1 vào S2.
- In kết quả ra màn hình.

### Bài Tập Thêm

- Viết chương trình nhập số học sinh và họ tên học sinh. Sau đó, kiểm tra có bao nhiêu bạn tên là "Hương".
# Đưa Dữ Liệu Ra Màn Hình và Nhập Dữ Liệu Từ Bàn Phím

## 1. Giới thiệu về lệnh `input()`

Lệnh `input()` trong Python được sử dụng để nhập dữ liệu từ bàn phím khi chương trình đang chạy.

### Cú Pháp và Chức Năng

Lệnh `input()` có cú pháp và chức năng như sau:

```python
input("Nhập một số: ")
```

### Đầu Vào và Đầu Ra Đơn Giản

Trong phần này, chúng ta đã biết quá trình xử lý thông tin trong máy tính. Do vậy, trong các ngôn ngữ lập trình bậc cao cần có các lệnh để nhập và xuất dữ liệu. Trong Python, lệnh `print()` được sử dụng để xuất dữ liệu ra màn hình, trong khi lệnh `input()` được sử dụng để đưa dữ liệu vào.

## 2. Tìm Hiểu Chức Năng Của Lệnh `input()`

Hãy chạy lệnh sau và trả lời các câu hỏi:

```python
số = input("Nhập một số: ")
```

### Câu Hỏi

- Lệnh `input()` cho phép giá trị được nhập sẽ là số hay xâu?

**Ví dụ:**

```
Nhập một số: 12
```

Trong ví dụ trên, giá trị nhập vào là `12`.



# Một số kiểu dữ liệu cơ bản của Python

## 1. Kiểu dữ liệu số

- **Biến n thuộc kiểu int**: số nguyên.
- **Biến x thuộc kiểu float**: số thực.
- **Biến s thuộc kiểu str**: xâu kí tự.

## 2. Kiểu dữ liệu lôgic

- Kiểu dữ liệu lôgic cũng là kiểu dữ liệu cơ bản và có giá trị thuộc kiểu lôgic.
- Các biểu thức so sánh chỉ nhận giá trị True (đúng) hoặc False (sai).
- Ví dụ dữ liệu kiểu lôgic là kết quả phép so sánh.

### Tên kiểu dữ liệu lôgic

- Tên kiểu dữ liệu lôgic là `bool`.



# Chương 10: Chuyển đổi kiểu dữ liệu trong Python

## 1. Hàm `tr()`
Hàm `tr()` dùng để chuyển đổi các kiểu dữ liệu khác thành xâu.

### Ví dụ:
```python
2 + 34
```
```python
2.567
```
```python
> 3
```

## 2. Chuyển đổi xâu
Các lệnh `int()`, `float()` chỉ có thể chuyển đổi các xâu có công thức. Ví dụ:
```python
12 + 45
```
```
(most recent call last):
pyshell#27>  line 1, in <module>
12 + 45
r: invalid literal for int() with base 10: 12 + 45
```

## 3. Chức năng của các lệnh
Các lệnh `int()`, `float()`, `str()` có chức năng chuyển các kiểu khác tương ứng về kiểu số nguyên, số thực và xâu.</module>



# Lập trình cơ bản

## Bài tập 1

1. Cần thực hiện lần lượt ba lệnh nhập các số `m`, `n`, `p`. Chú ý dùng lệnh `int()` để chuyển đổi dữ liệu nhập từ bàn phím như sau:
```python
m = int(input("Nhập số nguyên m: "))
n = int(input("Nhập số nguyên n: "))
p = int(input("Nhập số nguyên p: "))
print("Ba số đã nhập là", m + n + p)
```

## Bài tập 2

2. Viết chương trình nhập họ tên, sau đó nhập tuổi của họ và thông báo; ví dụ: "Bạn Nguyễn Hoà Bình 15 tuổi."
- Cần thực hiện hai lệnh nhập dữ liệu, một lệnh nhập tên, một lệnh nhập tuổi, sau đó thông báo ra màn hình. Chú ý khi nhập tuổi:
```python
ten = input("Nhập họ tên học sinh: ")
tuoi = int(input("Nhập tuổi: "))
print(ten, "có", tuoi, "tuổi")
```
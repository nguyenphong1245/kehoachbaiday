# Sách Giáo Khoa - Lập Trình

## Bài Tập

### 1. Bài Tập Về Nhà
- Em làm các bài tập về nhà đến giờ ăn dừng lại.
- 15 xô nước giúp mẹ. Em xách các xô nước giúp mẹ cho đến thùng nước.

### 2. Câu Hỏi
- Nỗi hàng, em hãy cho biết công việc được lặp đi lặp lại là gì? Số lần thực hiện việc lặp giữa hai cột có gì?

## Làm Quen Với Lệnh Lặp While

### 1. Giới Thiệu
- Viết đoạn chương trình sau; giải thích kết quả in ra.
- Điều kiện lặp: nếu `&#x3C;điều kiện>` là False thì dừng lặp.

### 2. Đoạn Chương Trình
```python
for k in range(100):
S = S + k
k = k + 1
```
- Khối các lệnh lặp được viết lùi vào và thẳng hàng.
- Sau mỗi vòng lặp, k tăng lên 1.



# Vòng lặp While trong Lập trình

## 1. Khái niệm
Vòng lặp `while` là lệnh lặp với số lần không biết trước. Số lần lặp phụ thuộc vào điều kiện của lệnh.

## 2. Cấu trúc
Vòng lặp `while` kiểm tra điều kiện trước khi thực hiện khối lệnh trong chương trình.

### Ví dụ:
Chương trình tính tổng các số chẵn từ 2 đến 100 sử dụng lệnh `while` không biết trước số lần lặp, mà phụ thuộc vào điều kiện của lệnh `while` để tránh bị lặp vô hạn.

```python
k = 2
while k &#x3C;= 100:
print(k)
k += 2
```

### Kết quả:
```
2
4
6
8
10
12
14
16
18
20
22
24
26
28
30
32
34
36
38
40
42
44
46
48
50
52
54
56
58
60
62
64
66
68
70
72
74
76
78
80
82
84
86
88
90
92
94
96
98
100
```

## 3. Dừng vòng lặp
Trong trường hợp muốn dừng và thoát ngay khỏi vòng lặp, ta sử dụng lệnh `break`.

### Ví dụ:
```python
for i in range(10):
if i == 5:
break
print(i)
```

### Kết quả:
```
0
1
2
3
4
```

## 4. Lưu ý
- Vòng lặp `while` sẽ dừng khi điều kiện không còn đúng.
- Cần cẩn thận để tránh vòng lặp vô hạn.



# Giáo Dục - Sách Giáo Khoa

## 1. Mở phần mềm Python và nhập chương trình sau:

```python
for k in range(65, 91):
if (k - 65) % 10 == 0 and k != 65:
print()  # Xuống dòng
print(chr(k), end=' ')
```

## 2. Viết chương trình in ra màn hình dãy các chữ cái tiếng Anh

- Hàng ngang trên màn hình, hai hàng ngang đầu có 10 chữ cái.
- Chúng ta đã biết các chữ cái tiếng Anh từ A đến Z trong bảng mã ASCII. Với số thứ tự k của bảng mã ASCII, chương trình sẽ trả lại kí tự tương ứng trong bảng mã này.

### Bảng mã ASCII cho các chữ cái tiếng Anh

| Số thứ tự | Kí tự |
|-----------|-------|
| 65        | A     |
| 66        | B     |
| 67        | C     |
| 68        | D     |
| 69        | E     |
| 70        | F     |
| 71        | G     |
| 72        | H     |
| 73        | I     |
| 74        | J     |
| 75        | K     |
| 76        | L     |
| 77        | M     |
| 78        | N     |
| 79        | O     |
| 80        | P     |
| 81        | Q     |
| 82        | R     |
| 83        | S     |
| 84        | T     |
| 85        | U     |
| 86        | V     |
| 87        | W     |
| 88        | X     |
| 89        | Y     |
| 90        | Z     |

### Chú thích

- Với các chữ cái ở cuối hàng sẽ xuống dòng.
- Với các chữ cái khác thì in ra trên cùng một hàng.
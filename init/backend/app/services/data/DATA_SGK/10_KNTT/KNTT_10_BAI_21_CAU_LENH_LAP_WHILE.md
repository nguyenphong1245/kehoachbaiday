**Tiêu đề bài học: Làm quen với lệnh lặp while**

**Nội dung lý thuyết:**
Lệnh lặp while là một trong những cấu trúc điều khiển trong lập trình, cho phép thực hiện một khối lệnh nhiều lần cho đến khi một điều kiện nhất định trở thành sai (False). Cú pháp cơ bản của lệnh lặp while như sau:

```
while &#x3C;điều kiện>:
# Khối lệnh thực hiện
```

Trong đó, khối lệnh sẽ được thực hiện liên tục cho đến khi điều kiện trở thành sai.

**Ví dụ minh họa:**
Xét đoạn chương trình sau:

```python
k = 0
S = 0
while k &#x3C; 100:
S = S + k
k = k + 1
```

**Giải thích kết quả in ra:**
- Biến `k` bắt đầu từ 0 và sẽ tăng dần lên 1 sau mỗi vòng lặp.
- Biến `S` sẽ lưu tổng của các giá trị từ 0 đến 99.
- Khi `k` đạt giá trị 100, điều kiện `k &#x3C; 100` sẽ trở thành sai và vòng lặp sẽ dừng lại.

**Bài tập và câu hỏi:**
1. Hãy viết một chương trình sử dụng lệnh lặp while để tính tổng các số từ 1 đến 50.
2. Giải thích sự khác nhau giữa lệnh lặp while và lệnh lặp for.
3. Trong đoạn chương trình trên, nếu điều kiện lặp là `k &#x3C;= 100`, kết quả của biến `S` sẽ thay đổi như thế nào?

**Hình ảnh mô tả:**
(Ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc lệnh lặp while trong lập trình, có thể là một sơ đồ hoặc biểu đồ thể hiện quá trình lặp.)

**Bảng biểu:**
| Giá trị của k | Giá trị của S |
|---------------|----------------|
| 0             | 0              |
| 1             | 1              |
| 2             | 3              |
| ...           | ...            |
| 99            | 4950           |




# Bài học: Vòng lặp While trong lập trình

## Nội dung lý thuyết
Vòng lặp `while` là một cấu trúc lặp trong lập trình cho phép thực hiện một khối lệnh nhiều lần cho đến khi một điều kiện nhất định không còn đúng. Vòng lặp này rất hữu ích khi số lần lặp không được xác định trước mà phụ thuộc vào điều kiện.

Cú pháp cơ bản của vòng lặp `while` như sau:
```python
while điều_kiện:
# Khối lệnh thực hiện
```

Vòng lặp `while` sẽ kiểm tra điều kiện trước khi thực hiện khối lệnh. Nếu điều kiện đúng, khối lệnh sẽ được thực hiện. Nếu điều kiện sai, vòng lặp sẽ dừng lại.

## Ví dụ minh họa
Dưới đây là một ví dụ về việc sử dụng vòng lặp `while` để in ra các số từ 14 đến 50, tăng lên 3 đơn vị mỗi lần lặp:
```python
k = 14
while k &#x3C;= 50:
print(k)
k += 3
```
Kết quả sẽ in ra:
```
14
17
20
23
26
29
32
35
38
41
44
47
```

## Bài tập và câu hỏi
1. Viết chương trình sử dụng vòng lặp `while` để tính tổng các số chẵn từ 2 đến 100.
2. Giải thích cách sử dụng lệnh `break` trong vòng lặp `while`. Viết một ví dụ minh họa.

## Hình ảnh mô tả
*Hình ảnh mô tả cấu trúc của vòng lặp `while` và cách hoạt động của nó trong chương trình.*

## Bảng biểu
| Giá trị của k | Kết quả in ra |
|---------------|---------------|
| 14            | 14            |
| 17            | 17            |
| 20            | 20            |
| 23            | 23            |
| 26            | 26            |
| 29            | 29            |
| 32            | 32            |
| 35            | 35            |
| 38            | 38            |
| 41            | 41            |
| 44            | 44            |
| 47            | 47            |




# Bài học: Làm quen với Python

## Nội dung lý thuyết
Python là một ngôn ngữ lập trình mạnh mẽ và dễ học. Nó được sử dụng rộng rãi trong nhiều lĩnh vực như phát triển web, phân tích dữ liệu, trí tuệ nhân tạo, và nhiều hơn nữa. Trong bài học này, chúng ta sẽ tìm hiểu cách sử dụng Python để in ra các ký tự trong bảng mã ASCII.

## Ví dụ minh họa
Chương trình dưới đây sẽ in ra dãy các chữ cái tiếng Anh từ A đến Z. Mỗi hàng sẽ có 10 ký tự.

```python
for k in range(65, 91):  # 65 là mã ASCII của 'A', 91 là mã ASCII của 'Z' + 1
if (k - 65) % 10 == 0 and k != 65:  # Xuống dòng sau mỗi 10 ký tự
print()
print(chr(k), end=' ')  # In ký tự tương ứng với mã ASCII
```

## Bài tập và câu hỏi
1. Chỉnh sửa chương trình trên để in ra các chữ cái từ Z đến A.
2. Viết một chương trình in ra các số từ 1 đến 100, mỗi hàng có 10 số.
3. Giải thích cách hoạt động của hàm `chr()` trong Python.

## Hình ảnh mô tả
*Hình ảnh mô tả có thể là một ảnh chụp màn hình của kết quả chương trình chạy trên Python, hiển thị các chữ cái từ A đến Z.*

## Bảng biểu
| Ký tự | Mã ASCII |
|-------|----------|
| A     | 65       |
| B     | 66       |
| C     | 67       |
| D     | 68       |
| E     | 69       |
| F     | 70       |
| G     | 71       |
| H     | 72       |
| I     | 73       |
| J     | 74       |
| K     | 75       |
| L     | 76       |
| M     | 77       |
| N     | 78       |
| O     | 79       |
| P     | 80       |
| Q     | 81       |
| R     | 82       |
| S     | 83       |
| T     | 84       |
| U     | 85       |
| V     | 86       |
| W     | 87       |
| X     | 88       |
| Y     | 89       |
| Z     | 90       |

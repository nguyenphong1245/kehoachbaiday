# Bài học: Làm quen với lệnh lặp for

## Nội dung lý thuyết
Lệnh lặp for trong lập trình được gọi là cấu trúc lặp. Cấu trúc này cho phép thực hiện một đoạn mã nhiều lần mà không cần phải viết lại mã đó. Điều này giúp tiết kiệm thời gian và công sức cho lập trình viên.

## Ví dụ minh họa
Xem đoạn chương trình sau trong chế độ gõ lệnh trực tiếp:
```python
S = 0
for k in range(10):
S = S + k
print(S)
```
Trong chương trình trên, lệnh `range(10)` trả lại một vùng giá trị từ 0 đến 9. Lệnh for sẽ thực hiện 10 lần lặp, mỗi lần cộng giá trị của k vào S.

## Bài tập và câu hỏi
1. Chạy đoạn chương trình trên và cho biết giá trị của S sau khi thực hiện xong.
2. Thay đổi giá trị trong `range(10)` thành `range(5)` và quan sát sự thay đổi của giá trị S.
3. Viết một chương trình sử dụng lệnh lặp for để tính tổng các số chẵn từ 0 đến 20.

## Hình ảnh mô tả
*Hình ảnh mô tả cấu trúc lặp for và cách hoạt động của nó trong chương trình.*

## Bảng biểu
| Giá trị của k | Giá trị của S |
|---------------|----------------|
| 0             | 0              |
| 1             | 1              |
| 2             | 3              |
| 3             | 6              |
| 4             | 10             |
| 5             | 15             |
| 6             | 21             |
| 7             | 28             |
| 8             | 36             |
| 9             | 45             |

*Bảng trên thể hiện giá trị của S sau mỗi lần lặp trong chương trình.*



**Tiêu đề bài học: Lệnh lặp với số lần biết trước**

**Nội dung lý thuyết:**
Lệnh lặp là một trong những cấu trúc điều khiển quan trọng trong lập trình. Lệnh lặp với số lần biết trước thường được sử dụng để thực hiện một đoạn mã lặp đi lặp lại một số lần nhất định. Số lần lặp thường được xác định bởi giá trị của lệnh `range()`.

**Ví dụ minh họa:**
```python
for k in range(1, n + 1):
print(k)
```
Trong đoạn chương trình trên, lệnh `for` sẽ lặp từ 1 đến n (bao gồm n).

**Bài tập và câu hỏi:**
1. Hãy viết một chương trình sử dụng lệnh `for` để in ra các số từ 3 đến 9.
2. Giải thích ý nghĩa của lệnh `range(3, 10)` trong đoạn mã sau:
```python
for k in range(3, 10):
print(k, end=' ')
```

**Hình ảnh mô tả:**
- Hình ảnh mô tả vùng giá trị xác định bởi lệnh `range()`. Lưu ý, lệnh `print()` có thêm tham số `end` để in trên cùng một dòng.

**Bảng biểu:**
| Giá trị của n | Kết quả in ra |
|---------------|---------------|
| 1             | 1             |
| 2             | 1 2           |
| 3             | 1 2 3         |
| 4             | 1 2 3 4       |
| 5             | 1 2 3 4 5     |




**Tiêu đề bài học: Đếm số ước của một số tự nhiên**

**Nội dung lý thuyết:**
Trong lập trình, việc đếm số ước của một số tự nhiên là một bài toán cơ bản. Một ước của số tự nhiên n là một số tự nhiên k mà n chia hết cho k. Để đếm số ước thực sự của n, chúng ta cần tìm các số k thỏa mãn điều kiện 0 &#x3C; k &#x3C; n và n chia hết cho k.

**Ví dụ minh họa:**
Giả sử chúng ta có số n = 12. Các ước thực sự của 12 là: 1, 2, 3, 4, 6. Như vậy, số lượng ước thực sự của 12 là 5.

**Bài tập và câu hỏi:**
1. Nhập số tự nhiên n từ bàn phím và đếm số các ước thực sự của n.
2. Viết chương trình in ra các ước thực sự của n.
3. Thay đổi chương trình để đếm số ước thực sự của n mà không tính n.

**Hình ảnh mô tả:**
(Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một sơ đồ thể hiện các ước của một số tự nhiên, ví dụ như số 12 với các ước 1, 2, 3, 4, 6 được đánh dấu.)

**Bảng biểu:**
| Số tự nhiên n | Các ước thực sự | Số lượng ước |
|---------------|------------------|---------------|
| 12            | 1, 2, 3, 4, 6    | 5             |
| 15            | 1, 3, 5          | 3             |
| 20            | 1, 2, 4, 5, 10   | 5             |

**Chương trình mẫu:**
```python
n = int(input("Nhập số tự nhiên n: "))
count = 0
for k in range(1, n):
if n % k == 0:
count += 1
print("Số ước thực sự của n là:", count)
```

**Câu hỏi:**
Chương trình trên in ra kết quả gì?
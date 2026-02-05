# BÀI 25     THỰC HÀNH XÁC ĐỊNH ĐỘ PHỨC TẠP THỜI GIAN THUẬT TOÁN

## SAU BÀI HỌC NÀY EM SẼ:
Thực hành xác định độ phức tạp (O-lớn) của hàm thời gian.

Biết cách phân tích đánh giá độ phức tạp thuật toán là kĩ năng quan trọng của người thiết kế thuật toán và chương trình: Các quy tắc đơn giản tính độ phức tạp thời gian mang lại cho em điều gì khi đánh giá thuật toán?

### Nhiệm vụ 1
Xác định độ phức tạp thời gian tính toán của thuật toán tìm kiếm tuần tự được thể hiện bằng chương trình sau:

```python
def LinearSearch(A, K):
for i in range(len(A)):
if A[i] == K:
return
return -1
```

### Hướng dẫn:
**Bước 1. Phân tích thời gian tính toán của thuật toán.**

Gọi n là kích thước của mảng đầu vào; T(n) là thời gian thực hiện thuật toán. Đối với mã lệnh trên, chương trình sẽ thực hiện duyệt mảng và với mỗi bước lặp sẽ kiểm tra phần tử thứ i có bằng với phần tử cần tìm kiếm không (dòng 3). Nếu bằng, thì chương trình sẽ trả về chỉ số của phần tử tìm thấy và kết thúc (dòng 4). Như vậy, chương trình có thể kết thúc khi chưa duyệt hết mảng và tối đa là duyệt hết mảng. Như vậy, trong trường hợp đã tìm thấy phần tử, nhất vòng lặp ở dòng 2 sẽ thực hiện n bước lặp, mỗi bước lặp sẽ thực hiện lệnh so sánh ở dòng 3 tốn 1 đơn vị thời gian.

Lệnh trả về sẽ được thực hiện duy nhất 1 lần ở dòng 4 (trường hợp tìm thấy phần tử trong mảng) hoặc dòng 5 (trường hợp không tìm thấy phần tử trong mảng) mất 1 đơn vị thời gian. Do đó tổng số phép tính cơ bản của chương trình trong trường hợp tồi nhất là:

\[ T(n) = n + 1 \]

**Bước 2. Xác định độ phức tạp O-lớn của thuật toán**

\[ T(n) = n + 1 = O(n + 1) = O(max(n; 1)) = O(n) \]

Vậy thuật toán tìm kiếm tuần tự có độ phức tạp tuyến tính.



# Nhiệm vụ 2
## Xác định độ phức tạp của thuật toán sắp xếp chọn

### Nội dung lý thuyết
Thuật toán sắp xếp chọn (Selection Sort) là một thuật toán sắp xếp đơn giản. Ý tưởng của thuật toán là tại mỗi bước thứ i của vòng lặp, sẽ tìm phần tử nhỏ nhất trong dãy từ A[i] đến A[n-1] và đổi chỗ phần tử nhỏ nhất này với A[i].

Gọi n là kích thước của mảng A, T(n) là thời gian chạy của thuật toán. Thời gian chạy của thuật toán được phân tích như sau:

- Lệnh gán ở dòng 2 tốn 1 đơn vị thời gian.
- Vòng lặp tại dòng 3 biến i sẽ chạy từ 0 đến n - 2, vậy vòng lặp này có n - 1 bước lặp.
- Tại mỗi bước lặp của lệnh for tại dòng 3, chương trình sẽ thực hiện các lệnh sau:
- Lệnh gán tại dòng 4 tốn 1 đơn vị thời gian.
- Vòng lặp for tại lệnh 5, biến j sẽ chạy từ i + 1 đến n - 1, nên vòng lặp này có n - i - 1 bước lặp.

### Kết luận
Với mỗi bước lặp tại dòng 5, chương trình sẽ thực hiện:
- Lệnh so sánh tại dòng 6 tốn 1 đơn vị thời gian và một lệnh gán tại dòng 7 tốn 1 đơn vị thời gian (nếu điều kiện thoả mãn).
- Như vậy, mỗi bước lặp tại dòng 5 sẽ tốn tối đa 2 đơn vị thời gian.
- Lệnh đổi chỗ tại dòng 8 tốn 3 đơn vị thời gian.

Tổng hợp lại, ta thấy thời gian chạy chương trình trên là:
\[ T(n) = 1 + 4(n - 1) + 2(n - i - 1) + 3 \]

### Bài tập và câu hỏi
1. Hãy phân tích độ phức tạp của thuật toán sắp xếp chọn và so sánh với các thuật toán sắp xếp khác như sắp xếp nổi bọt (Bubble Sort) và sắp xếp nhanh (Quick Sort).
2. Viết chương trình thực hiện thuật toán sắp xếp chọn và kiểm tra độ phức tạp của nó với các kích thước mảng khác nhau.

### Hình ảnh mô tả
*Ghi chú về hình ảnh: Hình ảnh minh họa quá trình thực hiện thuật toán sắp xếp chọn, cho thấy các bước tìm kiếm phần tử nhỏ nhất và việc đổi chỗ các phần tử trong mảng.*

### Bảng biểu
| Bước lặp | Giá trị i | Giá trị j | Phần tử nhỏ nhất |
|----------|-----------|-----------|-------------------|
| 1        | 0         | 1         | A[0]              |
| 2        | 1         | 2         | A[1]              |
| 3        | 2         | 3         | A[2]              |
| ...      | ...       | ...       | ...               |
| n-1      | n-2       | n-1       | A[n-2]            |




# Bài học: Độ phức tạp thuật toán

## Nội dung lý thuyết
Độ phức tạp thuật toán là một khái niệm quan trọng trong Tin học, giúp đánh giá hiệu suất của một thuật toán dựa trên thời gian và không gian mà nó sử dụng. Độ phức tạp thường được biểu diễn bằng ký hiệu O-lớn (Big O notation), cho biết cách mà thời gian hoặc không gian yêu cầu của thuật toán tăng lên khi kích thước đầu vào tăng.

### Ví dụ minh họa
Xét thuật toán sắp xếp chọn (Selection Sort) có độ phức tạp thời gian là O(n²). Để xác định độ phức tạp O-lớn của thuật toán, ta có thể phân tích như sau:

- T(n) = n² + 3n - 3
- O(max(n², 3n, -3)) = O(n²)

Vậy thuật toán sắp xếp chọn có độ phức tạp thời gian bình phương.

## Bài tập và câu hỏi
1. Xác định độ phức tạp của thuật toán sắp xếp nổi bọt sau:
```python
def BubbleSort(A):
n = len(A)
for i in range(n-1):
for j in range(n-1-i):
if A[j] > A[j+1]:
A[j], A[j+1] = A[j+1], A[j]
```

2. Cho biết hàm sau sẽ trả về giá trị là bao nhiêu? Xác định độ phức tạp thời gian O-lớn của chương trình.
```python
def Mystery(n):
r = 0
for i in range(n-1):
for j in range(i+1, n):
for k in range(1, j):
r = r + 1
return r
```

## Hình ảnh mô tả
*Hình ảnh mô tả có thể bao gồm sơ đồ hoặc biểu đồ thể hiện độ phức tạp của các thuật toán khác nhau, nhưng không có hình ảnh cụ thể trong văn bản này.*

## Bảng biểu
*Bảng biểu có thể bao gồm các độ phức tạp của các thuật toán khác nhau, nhưng không có bảng biểu cụ thể trong văn bản này.*

## LUYÊN TÂP
1. Giả sử rằng mỗi phép tính đơn được thực hiện trong micro giây (1 µs = một phần triệu giây). Hãy xác định giá trị lớn nhất của n trong các thuật toán tìm kiếm tuần tự, sắp xếp chèn và sắp xếp chọn nếu thời gian thực thi các thuật toán là giây; phút và giờ?

2. Hãy cho biết hàm sau thực hiện công việc gì? Xác định độ phức tạp thời gian của thuật toán.
```python
def func(A):
n = len(A)
for i in range(n-1):
for j in range(i+1, n):
if A[i] > A[j]:
A[i], A[j] = A[j], A[i]
```
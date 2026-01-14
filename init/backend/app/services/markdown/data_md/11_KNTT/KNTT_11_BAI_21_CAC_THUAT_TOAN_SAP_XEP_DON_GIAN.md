# BÀI 21: CÁC THUẬT TOÁN SẮP XẾP ĐƠN GIẢN

## SAU BÀI HỌC NÀY EM SẼ:
- Biết và thực hiện được một số thuật toán sắp xếp đơn giản.

Bài học trước cho em thấy việc tìm kiếm trên một dãy đã sắp xếp nhanh hơn so với việc tìm kiếm tuần tự. Vì vậy, bài toán tìm kiếm liên quan mật thiết đến bài toán sắp xếp. Bài toán sắp xếp cơ bản có dạng như sau:

Cho dãy A gồm n phần tử:
\[ A[0], A[1], \ldots, A[n-1] \]  (1)

Cần xếp dãy A theo thứ tự tăng dần:
\[ A[0] &#x3C; A[1] &#x3C; \ldots &#x3C; A[n-1] \]  (2)

Em hãy trình bày ý tưởng của mình để giải bài toán sắp xếp với dãy có bốn phần tử.

## 1. THUẬT TOÁN SẮP XẾP CHÈN

### Hoạt động 1: Tìm hiểu ý tưởng thuật toán sắp xếp chèn
Quan sát sơ đồ mô phỏng, trao đổi, thảo luận về ý tưởng chính của thuật toán sắp xếp chèn.

| Vòng lặp | Chỉ số | Hoạt động |
|----------|--------|-----------|
| Trước vòng lặp | - | Cho dãy A = [5, 3, 9, 7, 2] |
| Vòng lặp 1, i = 1 | - | Duyệt phần tử thứ hai, vì 3 nhỏ hơn 5 nên chèn 3 vào trước vị trí số 5. |
| Sau vòng lặp | - | Dãy A = [3, 5, 9, 7, 2] |
| Vòng lặp 2, i = 2 | - | Duyệt phần tử thứ ba, vì 9 đã lớn hơn 3 và 5 nên giữ nguyên vị trí. |
| Sau vòng lặp | - | Dãy A = [3, 5, 9, 7, 2] |
| Vòng lặp 3, i = 3 | - | Duyệt phần tử thứ tư, vì 5 &#x3C; 7 &#x3C; 9 nên chèn 7 vào giữa vị trí của 5 và 9. |
| Sau vòng lặp | - | Dãy A = [3, 5, 7, 9, 2] |
| Vòng lặp 4, i = 4 | - | Duyệt phần tử thứ năm, vì 2 &#x3C; 3 nên chèn 2 vào trước vị trí số 3. |
| Kết thúc | - | Dãy A = [2, 3, 5, 7, 9] |

**Hình 21.1. Mô phỏng thuật toán sắp xếp chèn**



# Quan sát sơ đồ mô phỏng và trả lời các câu hỏi sau:

1. So sánh số bước lặp với độ dài của dãy số ban đầu.
2. Vị trí xuất phát của mũi tên màu đỏ có quan hệ gì với chỉ số bước lặp?
3. Khi kết thúc lặp ta thu được kết quả gì? (phần tử thứ hai của dãy)

Tưởng tượng của thuật toán sắp xếp chèn là cho chỉ số i chạy từ 1 đến n - 1. Vòng lặp như vậy sẽ "chèn" phần tử A[i] vào vị trí đúng của dãy con đã sắp xếp A[0], A[1], ..., A[i-1]. Như vậy sau n - 1 bước lặp thì dãy được sắp xếp xong.

Thao tác "chèn" A[i] vào vị trí đúng trong dãy con A[0], A[1], ..., A[i-1] có thể được mô tả bằng cách "nhấc" A[i] lên và chuyển các phần tử bên trái A[i] nhưng lớn hơn A[i] sang phải, sau đó đặt A[i] vào vị trí đúng.

```plaintext
value = A[i]
j = i - 1
while j >= 0 and A[j] > value:
A[j + 1] = A[j]
j = j - 1
A[j + 1] = value
```

Thuật toán sắp xếp chèn có thể mô tả bằng hàm `InsertionSort(A)` như sau:

```python
def InsertionSort(A):
n = len(A)
for i in range(1, n):
value = A[i]
j = i - 1
while j >= 0 and A[j] > value:
A[j + 1] = A[j]
j = j - 1
A[j + 1] = value
```

Tưởng tượng của thuật toán sắp xếp chèn là thực hiện vòng lặp duyệt từ phần tử thứ hai đến cuối dãy. Sau mỗi bước lặp, phần tử tương ứng sẽ được chèn vào vị trí đúng của dãy con đã sắp xếp.

1. Mô phỏng chi tiết các bước lặp sắp xếp chèn dãy A = [5, 4, 2, 3].
2. Nếu dãy ban đầu đã được sắp xếp thì thuật toán sắp xếp chèn sẽ thực hiện như thế nào?

## 2. THUẬT TOÁN SẮP XẾP CHỌN

### Hoạt động 2: Tìm hiểu ý tưởng thuật toán sắp xếp chọn

Quan sát sơ đồ mô phỏng; trao đổi, thảo luận về ý tưởng chính của thuật toán sắp xếp chọn.

Xét dãy A = [5, 3, 9, 7, 2]. Sơ đồ sau mô phỏng các bước thực hiện thuật toán sắp xếp chọn. Quan sát sơ đồ và trả lời các câu hỏi sau:

1. Có bao nhiêu vòng lặp? Chỉ số i bắt đầu bằng bao nhiêu?
2. Tại mỗi vòng lặp đều có một thao tác đổi chỗ hai phần tử, đó là các phần tử nào?
3. Khi kết thúc vòng lặp ta thu được kết quả gì?



# Chỉ số của dãy

## Trước vòng Iặp
3

## Vòng lặp 1, i = 0
2 là phần tử nhỏ nhất, đổi chỗ 2 với 5

## Sau vòng lặp
'phần tử nhỏ nhất không tính
3 là phần -

## Vòng lặp 2, i = 1
đầu tiên, giữ nguyên vị trí dãy số tử

## Sau vòng lặp
2

## Vòng lặp 3, i = 2
5 là phần tử nhỏ nhất không tính hai phần tử đầu tiên, đổi chỗ 5 và 9

## Sau vòng lặp
2

## Vòng lặp 4, i = 3
7 là phần tử nhỏ nhất không tính 3 phần tử đầu tiên, giữ nguyên vị trí dãy số

## Kết thúc

### Hình 21.2. Mô phỏng thuật toán sắp xếp chọn
Tưởng của thuật toán sắp xếp chọn là cho chỉ số chạy từ 0 (phần tử đầu tiên) đến n - 2 (phần tử cuối). Tại mỗi bước lặp; cần tìm phần tử nhỏ nhất nằm trong dãy A[i], A[i+1], A[n-1] và đổi chỗ phần tử nhỏ nhất này với A[i].

### Mô tả thuật toán chọn như sau:
```python
for i in range(n-1):
# Chọn phần tử nhỏ nhất trong dãy A[i], A[i+1], A[n-1]
# Đổi chỗ phần tử này với A[i]
```

Bước chọn phần tử tại dòng ~2 và đổi chỗ tại dòng lệnh 3 có thể viết như sau:
```python
iMin = i
for j in range(i+1, n):
if A[j] &#x3C; A[iMin]:
iMin = j
# Đổi chỗ A[i] và A[iMin]
```
Đây sử dụng biến `iMin` để lưu chỉ số phần tử nhỏ nhất của dãy A[i], A[i+1], A[n-1].

### Thuật toán sắp xếp chọn có thể được mô tả bằng hàm `SelectionSort(A)` như sau:
```python
def SelectionSort(A):
n = len(A)
for i in range(n-1):
iMin = i
for j in range(i+1, n):
if A[j] &#x3C; A[iMin]:
iMin = j
A[i], A[iMin] = A[iMin], A[i]
```

----

**Chú thích:** Nội dung trên mô tả thuật toán sắp xếp chọn, bao gồm các bước lặp và cách tìm phần tử nhỏ nhất trong dãy số.



# Thuật toán sắp xếp chọn

Thuật toán sắp xếp chọn thực hiện một vòng lặp với chỉ số \( i \) chạy từ 0 (phần tử đầu tiên) đến \( n - 2 \) (phần tử gần cuối). Tại mỗi bước lặp, chọn phần tử nhỏ nhất nằm trong dãy \( A[i], A[i+1], \ldots, A[n-1] \) và đổi chỗ phần tử này với \( A[i] \):

1. Thực hiện mô phỏng sắp xếp theo thuật toán sắp xếp chọn dãy sau: 4, 5, 2, 1, 3
2. Theo thuật toán sắp xếp chọn; sau mỗi bước thứ \( i \) thì các phần tử \( A[0], A[1], \ldots, A[i] \) đã được sắp xếp đúng. Đúng hay sai?

# THUẬT TOÁN SẮP XẾP NỔI BỌT

## Hoạt động 3

Tìm biểu các tưởng thuật toán sắp xếp nổi bọt. Cùng trao đổi, thảo luận về các ý tưởng của thuật toán sắp xếp nổi bọt.

Thuật toán sắp xếp nổi bọt lấy ý tưởng từ hiện tượng "nổi bọt" của không khí dưới nước. Các bọt khí nổi dần lên mặt nước. Ý tưởng của thuật toán nổi bọt là liên tục đổi chỗ hai phần tử cạnh nhau nếu chúng chưa được sắp thứ tự đúng.

Thuật toán này sẽ thực hiện nhiều vòng lặp. Quan sát vòng lặp sau để hiểu cách thực hiện: chỉ số chạy từ 0 đến \( n - 2 \) và kiểm tra hai phần tử liền nhau \( A[j], A[j+1] \):

```python
for j in range(n-1):
if A[j] > A[j+1]:
# Đổi chỗ A[j], A[j+1]
```

Quan sát vòng lặp đầu tiên của thuật toán nổi bọt để thấy sau vòng lặp này, phần tử lớn nhất được chuyển về cuối dãy \( A \).

## Chỉ số của dãy:

| Chỉ số | Trước vòng lặp | Bước lặp 1, \( j = 0 \) | Bước lặp 2, \( j = 1 \) | Bước lặp 3, \( j = 2 \) | Bước lặp 4, \( j = 3 \) |
|--------|----------------|-------------------------|-------------------------|-------------------------|-------------------------|
|        | 6 8 0 4 1 6   | So sánh phần tử thứ nhất và phần tử thứ hai | So sánh phần tử thứ hai và phần tử thứ ba | So sánh phần tử thứ ba và phần tử thứ tư | So sánh phần tử thứ tư và phần tử thứ năm |

Kết thúc vòng lặp: 3 5 7

Trong sơ đồ trên, mũi tên màu đỏ cho biết có đổi chỗ hai phần tử, mũi tên màu tím cho biết không thay đổi vị trí:

**Hình 21.3. Mô phỏng thuật toán sắp xếp nổi bọt**



# Thuật Toán Sắp Xếp Nổi Bọt

Sau vòng lặp thứ nhất, phần tử lớn nhất được chuyển về cuối dãy. Sau vòng lặp thứ hai, phần tử lớn thứ hai được chuyển về đúng vị trí ở cuối dãy. Cứ như vậy, sau \( n - 1 \) vòng lặp thì dãy được sắp xếp. Có thể mô tả thuật toán nổi bọt như sau:

```python
for i in range(n-1):
for j in range(n-1):
if A[j] > A[j+1]:
Đổi chỗ A[j], A[j+1]
```

Quan sát dòng 2, ta thấy không cần phải có đủ \( n - 1 \) bước lặp vì sau \( i \) vòng lặp thì phần tử lớn nhất đã chuyển về đúng vị trí ở cuối dãy; nên với chỉ số \( i \) vòng lặp ở dòng 2 chỉ cần \( n - 1 - i \) bước lặp. Thuật toán sắp xếp nổi bọt được mô tả bằng hàm `BubbleSort(A)` như sau:

```python
def BubbleSort(A):
n = len(A)
for i in range(n-1):
for j in range(n-1-i):
if A[j] > A[j+1]:
A[j], A[j+1] = A[j+1], A[j]
```

Thuật toán sắp xếp nổi bọt thực hiện nhiều vòng lặp, kiểm tra hai phần tử cạnh nhau; nếu chúng chưa sắp xếp đúng thì đổi chỗ. Có nhiều cách thể hiện thuật toán này; nhưng cách thường dùng là sử dụng hai vòng lặp lồng nhau; vòng lặp trong thực hiện thao tác đổi chỗ hai phần tử cạnh nhau cho đến khi dãy được sắp xếp xong.

## KẾT NỐI THỰC HÀNH

1. Mô tả các bước thuật toán sắp xếp nổi bọt của dãy \( A = [4, 3, 1, 2] \).
2. Khi nào thì các mũi tên ở tất cả các bước trong sơ đồ mô phỏng thuật toán sắp xếp nổi bọt đều có màu đỏ?

## LUYỆN TẬP

1. Cho dãy \( A = [5, 8, 1, 0, 10, 4, 3] \). Viết các chương trình sắp xếp dãy \( A \) theo thứ tự tăng dần theo các thuật toán sắp xếp chèn, sắp xếp chọn và sắp xếp nổi bọt.
2. Viết chương trình nhập một dãy số từ bàn phím; các số cách nhau bởi dấu cách, thực hiện sắp xếp dãy đã nhập theo một trong các thuật toán sắp xếp rồi in kết quả ra màn hình.

## VẬN DỤNG

1. Viết lại các thuật toán sắp xếp trong bài theo thứ tự giảm dần.
2. Nêu ý nghĩa thực tế của các thuật toán sắp xếp đã học; chẳng hạn sắp xếp các học sinh trong lớp theo chiều cao tăng dần.
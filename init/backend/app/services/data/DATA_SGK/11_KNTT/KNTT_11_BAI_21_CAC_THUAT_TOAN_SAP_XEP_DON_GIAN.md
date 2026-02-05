# BÀI 21: CÁC THUẬT TOÁN SẮP XẾP ĐƠN GIẢN

## SAU BÀI HỌC NÀY EM SẼ:
- Biết và thực hiện được một số thuật toán sắp xếp đơn giản.

Bài học trước cho em thấy việc tìm kiếm trên một dãy đã sắp xếp nhanh hơn so với việc tìm kiếm tuần tự. Vì vậy, bài toán tìm kiếm liên quan mật thiết đến bài toán sắp xếp. Bài toán sắp xếp cơ bản có dạng như sau:
Cho dãy A gồm n phần tử:
A[0], A[1], ..., A[n-1]
Cần xếp dãy A theo thứ tự tăng dần:
A[0] &#x3C; A[1] &#x3C; ... &#x3C; A[n-1]
Em hãy trình bày ý tưởng của mình để giải bài toán sắp xếp với dãy có bốn phần tử.

## 1. THUẬT TOÁN SẮP XẾP CHÈN

### Hoạt động 1: Tìm hiểu ý tưởng thuật toán sắp xếp chèn
Quan sát sơ đồ mô phỏng, trao đổi, thảo luận về ý tưởng chính của thuật toán sắp xếp chèn.

#### Sơ đồ mô phỏng thuật toán sắp xếp chèn
Cho dãy A = [5, 3, 9, 7, 2]. Sơ đồ sau mô phỏng các bước của thuật toán sắp xếp chèn.

| Chỉ số của dãy | Trước vòng lặp | Vòng lặp 1, i = 1 | Sau vòng lặp | Vòng lặp 2, i = 2 | Sau vòng lặp | Vòng lặp 3, i = 3 | Sau vòng lặp | Vòng lặp 4, i = 4 | Kết thúc |
|----------------|----------------|-------------------|---------------|-------------------|---------------|-------------------|---------------|-------------------|----------|
|                |                | Duyệt phần tử thứ hai, vì 3 nhỏ hơn 5 nên chèn 3 vào trước vị trí số 5 |               | Duyệt phần tử thứ ba, vì 9 đã lớn hơn 3 và 5 nên giữ nguyên vị trí |               | Duyệt phần tử thứ tư, vì 5 &#x3C; 7 &#x3C; 9 nên chèn 7 vào giữa vị trí của 5 và 9 |               | Duyệt phần tử thứ năm, vì 2 &#x3C; 3 nên chèn 2 vào trước vị trí số 3 |          |

### Hình 21.1: Mô phỏng thuật toán sắp xếp chèn

----

### Bài tập và câu hỏi
1. Hãy mô tả lại các bước của thuật toán sắp xếp chèn với dãy số khác.
2. So sánh thuật toán sắp xếp chèn với các thuật toán sắp xếp khác mà em đã học.

### Hình ảnh mô tả
- Hình 21.1 mô phỏng thuật toán sắp xếp chèn, thể hiện các bước thực hiện thuật toán với dãy số cụ thể.



# Bài học: Thuật toán sắp xếp chèn

## Nội dung lý thuyết
Thuật toán sắp xếp chèn là một phương pháp sắp xếp đơn giản, trong đó các phần tử được chèn vào vị trí đúng của dãy con đã sắp xếp. Ý tưởng chính của thuật toán là duyệt từ phần tử thứ hai đến cuối dãy, sau mỗi bước lặp, phần tử tương ứng sẽ được chèn vào vị trí đúng của dãy con đã sắp xếp.

### Mô tả thuật toán
1. Bắt đầu từ phần tử thứ hai (A[1]) và so sánh với các phần tử trước đó.
2. Nếu phần tử hiện tại (A[i]) nhỏ hơn phần tử trước đó (A[j]), thì "nhấc" A[i] lên và dịch các phần tử lớn hơn sang phải.
3. Đặt A[i] vào vị trí đúng trong dãy con đã sắp xếp.

### Cấu trúc hàm
```python
def InsertionSort(A):
for i in range(1, len(A)):
value = A[i]
j = i - 1
while j >= 0 and A[j] > value:
A[j + 1] = A[j]
j -= 1
A[j + 1] = value
```

## Ví dụ minh họa
Mô phỏng chi tiết các bước lặp sắp xếp chèn dãy A = [5, 3, 9, 7, 2]:
1. Bước 1: [3, 5, 9, 7, 2]
2. Bước 2: [2, 3, 5, 7, 9]

Nếu dãy ban đầu đã được sắp xếp thì thuật toán sắp xếp chèn sẽ không cần thực hiện bất kỳ thao tác nào, vì tất cả các phần tử đã ở vị trí đúng.

----

# Bài học: Thuật toán sắp xếp chọn

## Nội dung lý thuyết
Thuật toán sắp xếp chọn là một phương pháp sắp xếp khác, trong đó tìm phần tử nhỏ nhất trong dãy và đổi chỗ với phần tử đầu tiên, sau đó lặp lại cho các phần tử còn lại.

### Ý tưởng chính
1. Tìm phần tử nhỏ nhất trong dãy.
2. Đổi chỗ phần tử nhỏ nhất với phần tử đầu tiên.
3. Lặp lại cho các phần tử còn lại cho đến khi dãy được sắp xếp.

## Ví dụ minh họa
Xét dãy A = [5, 3, 9, 7, 2]. Sơ đồ sau mô phỏng các bước thực hiện thuật toán sắp xếp chọn:
1. Bước 1: [2, 3, 9, 7, 5]
2. Bước 2: [2, 3, 5, 7, 9]

## Bài tập và câu hỏi
1. Có bao nhiêu vòng lặp? Chỉ số i bắt đầu bằng bao nhiêu?
2. Tại mỗi vòng lặp đều có một thao tác đổi chỗ hai phần tử, đó là các phần tử nào?
3. Khi kết thúc vòng lặp ta thu được kết quả gì?

## Hình ảnh mô tả
- Hình ảnh mô phỏng các bước thực hiện thuật toán sắp xếp chèn và sắp xếp chọn (ghi chú về hình ảnh: các bước lặp được thể hiện rõ ràng với các phần tử được đánh dấu).

## Bảng biểu
| Thuật toán         | Số bước lặp | Kết quả cuối cùng |
|--------------------|-------------|-------------------|
| Sắp xếp chèn       | n - 1       | Dãy đã sắp xếp    |
| Sắp xếp chọn       | n           | Dãy đã sắp xếp    |




# Chỉ số của dãy

## Nội dung lý thuyết
Thuật toán sắp xếp chọn (Selection Sort) là một trong những thuật toán sắp xếp đơn giản. Ý tưởng của thuật toán là chia dãy số thành hai phần: phần đã sắp xếp và phần chưa sắp xếp. Tại mỗi bước, thuật toán tìm phần tử nhỏ nhất trong phần chưa sắp xếp và đổi chỗ nó với phần tử đầu tiên của phần chưa sắp xếp.

## Ví dụ minh họa
Giả sử ta có dãy số: [5, 2, 9, 1, 7]

- **Trước vòng lặp**: [5, 2, 9, 1, 7]
- **Vòng lặp 1, i = 0**: 2 là phần tử nhỏ nhất, đổi chỗ 2 với 5
- **Sau vòng lặp**: [2, 5, 9, 1, 7]
- **Vòng lặp 2, i = 1**: 5 là phần tử nhỏ nhất, giữ nguyên vị trí
- **Sau vòng lặp**: [2, 5, 9, 1, 7]
- **Vòng lặp 3, i = 2**: 1 là phần tử nhỏ nhất, đổi chỗ 1 và 9
- **Sau vòng lặp**: [2, 5, 1, 9, 7]
- **Vòng lặp 4, i = 3**: 7 là phần tử nhỏ nhất, đổi chỗ 7 và 9
- **Sau vòng lặp**: [2, 5, 1, 7, 9]

## Bài tập và câu hỏi
1. Giải thích thuật toán sắp xếp chọn.
2. Viết mã giả cho thuật toán sắp xếp chọn.
3. Thực hiện sắp xếp dãy số sau bằng thuật toán sắp xếp chọn: [8, 3, 6, 4, 5].

## Hình ảnh mô tả
- **Hình 21.2**: Mô phỏng thuật toán sắp xếp chọn. Hình ảnh này minh họa quá trình tìm kiếm phần tử nhỏ nhất và đổi chỗ trong dãy số.

## Bảng biểu
| Vòng lặp | Giá trị i | Phần tử nhỏ nhất | Dãy sau vòng lặp |
|----------|-----------|------------------|-------------------|
| 1        | 0         | 2                | [2, 5, 9, 1, 7]   |
| 2        | 1         | 5                | [2, 5, 9, 1, 7]   |
| 3        | 2         | 1                | [2, 5, 1, 9, 7]   |
| 4        | 3         | 7                | [2, 5, 1, 7, 9]   |




# Thuật toán sắp xếp chọn

## Nội dung lý thuyết
Thuật toán sắp xếp chọn thực hiện một vòng lặp với chỉ số i chạy từ 0 (phần tử đầu tiên) đến n - 2 (phần tử gần cuối). Tại mỗi bước lặp, chọn phần tử nhỏ nhất nằm trong dãy A[i], A[i+1], ..., A[n-1] và đổi chỗ phần tử này với A[i].

## Ví dụ minh họa
1. Thực hiện mô phỏng sắp xếp theo thuật toán sắp xếp chọn dãy sau: 4, 5, 2, 1, 3.
2. Theo thuật toán sắp xếp chọn; sau mỗi bước thứ i thì các phần tử A[0], A[1], ..., A[i] đã được sắp xếp đúng. Đúng hay sai?

----

# THUẬT TOÁN SẮP XẾP NỔI BỌT

## Nội dung lý thuyết
Hoạt động 3: Tìm biểu các ý tưởng thuật toán sắp xếp nổi bọt. Cùng trao đổi, thảo luận về các ý tưởng của thuật toán sắp xếp nổi bọt.

Thuật toán sắp xếp nổi bọt lấy ý tưởng từ hiện tượng "nổi bọt" của không khí dưới nước. Các bọt khí nổi dần lên mặt nước. Ý tưởng của thuật toán nổi bọt là liên tục đổi chỗ hai phần tử cạnh nhau nếu chúng chưa được sắp thứ tự đúng.

Thuật toán này sẽ thực hiện nhiều vòng lặp. Quan sát vòng lặp sau để hiểu cách thực hiện: chỉ số chạy từ 0 đến n - 2 và kiểm tra hai phần tử liền nhau A[j], A[j+1].

```python
for j in range(n-1):
if A[j] > A[j+1]:
Đổi chỗ A[j], A[j+1]
```

Quan sát vòng lặp đầu tiên của thuật toán nổi bọt để thấy sau vòng lặp này, phần tử lớn nhất được chuyển về cuối dãy A.

## Bảng biểu
| Chỉ số của dãy | Trước vòng lặp | Bước lặp 1, j = 0 | Bước lặp 2, j = 1 | Bước lặp 3, j = 2 | Bước lặp 4, j = 3 |
|----------------|----------------|--------------------|--------------------|--------------------|--------------------|
|                | 6 8 0 4 1 6    | So sánh phần tử thứ nhất và phần tử thứ hai | So sánh phần tử thứ hai và phần tử thứ ba | So sánh phần tử thứ ba và phần tử thứ tư | So sánh phần tử thứ tư và phần tử thứ năm |

Kết thúc vòng lặp: 3 5 7

Trong sơ đồ trên, mũi tên màu đỏ cho biết có đổi chỗ hai phần tử, mũi tên màu tím cho biết không thay đổi vị trí.

## Hình ảnh mô tả
**Hình 21.3. Mô phỏng thuật toán sắp xếp nổi bọt**



# Bài học: Thuật toán sắp xếp nổi bọt

## Nội dung lý thuyết
Thuật toán sắp xếp nổi bọt (Bubble Sort) là một trong những thuật toán sắp xếp đơn giản nhất. Nguyên lý hoạt động của thuật toán này là so sánh từng cặp phần tử liền kề trong dãy và đổi chỗ chúng nếu chúng không theo thứ tự mong muốn. Quá trình này được lặp lại cho đến khi không còn phần tử nào cần đổi chỗ, tức là dãy đã được sắp xếp.

### Mô tả thuật toán
1. Bắt đầu từ phần tử đầu tiên trong dãy.
2. So sánh phần tử hiện tại với phần tử tiếp theo.
3. Nếu phần tử hiện tại lớn hơn phần tử tiếp theo, đổi chỗ chúng.
4. Tiếp tục so sánh phần tử hiện tại với phần tử tiếp theo cho đến khi đến cuối dãy.
5. Lặp lại quá trình cho đến khi không còn phần tử nào cần đổi chỗ.

### Cấu trúc thuật toán
```python
def BubbleSort(A):
n = len(A)
for i in range(n-1):
for j in range(n-1-i):
if A[j] > A[j+1]:
A[j], A[j+1] = A[j+1], A[j]
```

## Ví dụ minh họa
Mô tả các bước thuật toán sắp xếp nổi bọt của dãy A = [4, 3, 1, 2]:
- Sau vòng lặp thứ nhất, phần tử lớn nhất được chuyển về cuối dãy.
- Sau vòng lặp thứ hai, phần tử lớn thứ hai được chuyển về đúng vị trí ở cuối dãy.
- Cứ như vậy, sau n-1 vòng lặp thì dãy được sắp xếp.

## Bài tập và câu hỏi
1. Khi nào thì các mũi tên ở tất cả các bước trong sơ đồ mô phỏng thuật toán sắp xếp nổi bọt đều có màu đỏ?
2. Cho dãy A = [5, 8, 1, 0, 10, 4, 3]. Viết các chương trình sắp xếp dãy A theo thứ tự tăng dần theo các thuật toán sắp xếp chèn, sắp xếp chọn và sắp xếp nổi bọt.
3. Viết chương trình nhập một dãy số từ bàn phím; các số cách nhau bởi dấu cách, thực hiện sắp xếp dãy đã nhập theo một trong các thuật toán sắp xếp rồi in kết quả ra màn hình.

## Vận dụng
1. Viết lại các thuật toán sắp xếp trong bài theo thứ tự giảm dần.
2. Nêu ý nghĩa thực tế của các thuật toán sắp xếp đã học; chẳng hạn sắp xếp cách học sinh trong lớp theo chiều cao tăng dần.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh mô phỏng quá trình sắp xếp nổi bọt với các mũi tên chỉ ra các phần tử đang được so sánh và đổi chỗ.)

## Bảng biểu
| Thuật toán         | Độ phức tạp thời gian | Độ phức tạp không gian |
|--------------------|-----------------------|-------------------------|
| Sắp xếp nổi bọt    | O(n^2)                | O(1)                    |
| Sắp xếp chèn       | O(n^2)                | O(1)                    |
| Sắp xếp chọn       | O(n^2)                | O(1)                    |

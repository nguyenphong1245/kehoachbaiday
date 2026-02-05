# BÀI 24: ĐÁNH GIÁ ĐỘ PHỨC TẠP THỜI GIAN THUẬT TOÁN

## SAU BÀI HỌC NÀY EM SẼ:
- Biết cách phân tích độ phức tạp thời gian thuật toán.
- Nhận biết được phép toán tích cực trong chương trình.
- Biết và thực hiện được tính toán độ phức tạp thời gian của một số thuật toán đã biết.

## NỘI DUNG LÝ THUYẾT
Quan sát Hình 24.1, chúng ta dễ thấy phép nhân 2 số có n chữ số sẽ cần n² phép nhân và 2n phép cộng, vậy tổng số các phép tính đơn của phép nhân này là n² + 2n, chúng ta nói độ phức tạp thời gian của phép nhân này có bậc n². Năm 1960, trong một tiết dạy về công nghệ thông tin, nhà toán học Nga, Viện sĩ Kolmogorov đã hỏi các sinh viên của mình là có ai tìm được cách tính phép nhân trên với thời gian tốt hơn bậc n² được không? Khi đó đây là một bài toán chưa có lời giải. Đúng một tuần sau, một sinh viên tên là Karatsuba đã đưa GS Kolmogorov một lời giải tốt hơn về phép tính nhân trên chỉ với độ phức tạp thời gian bậc n¹,⁵⁸⁴⁹⁶.

## VÍ DỤ MINH HỌA
Quan sát và ước lượng thời gian thực hiện các đoạn chương trình trong Hình 24.2. Chương trình nào chạy nhanh hơn? Vì sao?

### Chương trình 1
```python
C = 0
for k in range(n):
C = C + 1
print(C)
```

### Chương trình 2
```python
C = 0
for i in range(n):
for j in range(n):
C = C + 1
print(C)
```

## HÌNH ẢNH MÔ TẢ
- **Hình 24.1**: Minh họa phép nhân 2 số có n chữ số.
- **Hình 24.2**: So sánh thời gian thực hiện của hai chương trình.

## ĐÁNH GIÁ THỜI GIAN THỰC HIỆN CHƯƠNG TRÌNH
Có thể không cần cài đặt và chạy chương trình mà vẫn ước lượng được thời gian chạy dựa trên việc tính tổng thời gian các phép tính đơn và các lệnh đơn của chương trình. Cách tính này có thể không chính xác hoàn toàn như thời gian thực nhưng có thể dùng để so sánh và ước lượng thời gian chạy chương trình khá chính xác. Khi tính thời gian chạy chương trình, có thể coi tất cả các lệnh đơn (ví dụ lệnh gán) và các phép tính đơn (ví dụ phép tính số học, phép so sánh) có thời gian chạy như nhau, được gọi chung là một đơn vị thời gian. Cách tính này sẽ làm đơn giản hóa cách phân tích thời gian tính toán nhưng vẫn bảo đảm độ chính xác của tính toán.



# Tiêu đề bài học
**Đánh giá thời gian thực hiện chương trình**

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách đánh giá thời gian thực hiện của các chương trình. Để làm điều này, chúng ta sẽ quan sát và thực hiện đánh giá thời gian chạy của các chương trình.

### Chương trình 1
Gọi T₁ là thời gian chạy của chương trình này. Mỗi lệnh tại dòng 1 và 2 cần 1 đơn vị thời gian để thực hiện:
- Vòng lặp tại dòng 3 có n bước lặp, mỗi bước của vòng lặp sẽ thực hiện lệnh tại dòng 4, lệnh này cần 1 đơn vị thời gian. Vậy suy ra tổng thời gian của vòng lặp 3 là n đơn vị thời gian.
- Lệnh cuối tại dòng 5 cần 1 đơn vị thời gian.

Vậy để thực hiện toàn bộ chương trình 1 cần:
\[ T₁ = T(n) = 2 + n + 1 = n + 3 \text{ đơn vị thời gian} \]

### Chương trình 2
Gọi T₂ là thời gian chạy của chương trình này. Mỗi lệnh tại dòng 1 và 2 cần 1 đơn vị thời gian.
- Các lệnh tại dòng 3, 4 là hai vòng lặp lồng nhau. Mỗi vòng lặp có n bước, như vậy thực chất có n² bước lặp của hai lệnh này. Mỗi bước lặp sẽ thực hiện các lệnh tại dòng 5, lệnh này cần 1 đơn vị thời gian. Vậy suy ra tổng thời gian của vòng lặp 3, 4 là n² đơn vị thời gian.
- Lệnh cuối tại dòng 6 cần 1 đơn vị thời gian.

Vậy tổng hợp toàn bộ chương trình 2 ta có:
\[ T₂ = T₂(n) = 2 + n² + 1 = n² + 3 \text{ đơn vị thời gian} \]

### Nguyên tắc đánh giá thời gian chạy chương trình
Cách đánh giá thời gian chạy chương trình được dựa trên một bộ khung các nguyên tắc dùng làm căn cứ để tính toán. Các nguyên tắc khung như sau:
1. Các phép toán đơn giản như phép tính số học, phép lấy thương nguyên và số dư, các phép so sánh sẽ tính là 1 đơn vị thời gian.
2. Các phép toán lôgic cơ bản như AND, OR, NOT sẽ tính là 1 đơn vị thời gian.
3. Các lệnh đơn như lệnh gán, lệnh in, đọc dữ liệu tính là 1 đơn vị thời gian.
4. Vòng lặp for hoặc while sẽ được tính thời gian bằng tổng đơn vị thời gian thực hiện của mỗi bước lặp.
5. Lệnh if với nhiều trường hợp rẽ nhánh sẽ được tính thời gian bằng đơn vị thời gian lớn nhất của các lệnh nhánh.

Áp dụng các nguyên tắc tính khung thời gian trên, chúng ta có thể tính được gần chính xác thời gian thực hiện chương trình mà không cần cài đặt và chạy chương trình trên máy tính.

**Lưu ý:** Trong một chương trình, phép toán được thực hiện nhiều nhất và đóng vai trò chính khi thực hiện tính thời gian, được gọi là phép toán tích cực. Ví dụ trong chương trình 1, phép toán tích cực là phép cộng \( C = C + 1 \) tại dòng 4. Với chương trình 2, phép cộng \( C = C + 1 \) tại dòng 6 chính là phép toán tích cực.

## Ví dụ minh họa
- **Chương trình 1:**
```plaintext
1. Lệnh 1
2. Lệnh 2
3. for i = 1 to n do
4.     Lệnh 4
5. Lệnh 5
```

- **Chương trình 2:**
```plaintext
1. Lệnh 1
2. Lệnh 2
3. for i = 1 to n do
4.     for j = 1 to n do
5.         Lệnh 5
6. Lệnh 6
```

## Bài tập và câu hỏi
1. Hãy tính thời gian thực hiện của một chương trình có cấu trúc tương tự như chương trình 1 nhưng có 5 bước lặp trong vòng lặp.
2. Giải thích tại sao phép toán tích cực lại quan trọng trong việc đánh giá thời gian thực hiện chương trình.

## Hình ảnh mô tả
- **Hình 24.2:** Mô tả cấu trúc của các chương trình và thời gian thực hiện của chúng.

## Bảng biểu
| Chương trình | Thời gian thực hiện |
|--------------|----------------------|
| Chương trình 1 | \( n + 3 \) đơn vị thời gian |
| Chương trình 2 | \( n² + 3 \) đơn vị thời gian |




# Bài học: Phân Tích Độ Phức Tạp Thời Gian Thuật Toán

## Nội dung lý thuyết
Trong phạm vi kiến thức phổ thông, độ phức tạp thời gian thuật toán được hiểu là khối lượng thời gian cần thiết để chạy chương trình thể hiện thuật toán. Một trong các cách phân loại thuật toán là dựa trên việc ước lượng độ phức tạp thời gian thuật toán. Độ phức tạp thời gian, trong trường hợp tổng quát, có thể coi là một hàm số T(n) với n là một số tự nhiên được xác định tùy thuộc từng bài toán cụ thể liên quan tới dữ liệu đầu vào.

Giá trị của T(n) thường được xác định trên cơ sở số lượng các phép toán/câu lệnh cần thực hiện trong chương trình/thuật toán. Khi n càng lớn thì thời gian T(n) sẽ tăng lên nhưng tốc độ tăng khác nhau. Để phân loại được các hàm thời gian này, các nhà khoa học đã đưa vào định nghĩa O-lớn. Kí hiệu O-lớn (big-O) dùng để so sánh và phân tích bậc của hàm thời gian T(n) khi n tăng lên vô cùng.

Ví dụ, chương trình ở Hình 24.2 có độ phức tạp thời gian bậc n và viết là T1(n) = O(n), ý nghĩa là khi n tiến tới vô cùng, T(n) sẽ tăng nhưng không quá bậc của n. Tương tự, chương trình 2 có độ phức tạp thời gian bậc n², và viết là T2(n) = O(n²), ý nghĩa là khi n tăng lên thì T2(n) sẽ tăng không vượt quá bậc của n².

### Định nghĩa kí hiệu O-lớn:
Cho f(n) và g(n) là hai hàm có đối số tự nhiên: Ta viết f(n) = O(g(n)) và nói f(n) có bậc O-lớn của g(n) nếu tồn tại hằng số c > 0 và số tự nhiên n₀ sao cho với mọi n ≥ n₀ ta có f(n) &#x3C; c.g(n). Nếu f(n) là O-lớn của g(n) thì có thể viết: f(n) = O(g(n)).

### Ví dụ minh họa
- Chương trình ở Hình 24.2 có hàm thời gian T(n) = n + 3. Chọn c = 2, n₀ = 3. Khi đó với n ≥ n₀ ta có: T(n) = n + 3 &#x3C; n + n = c.n. Do đó T(n) = O(n). Chúng ta nói chương trình 1 có độ phức tạp thời gian O(n) - tuyến tính.

- Chương trình 2 ở Hình 24.2 có hàm thời gian T₂(n) = n² + 3. Chọn c = 2, n₀ = 2. Khi đó với n ≥ n₀ ta có: T₂(n) = n² + 3 &#x3C; n² + n² = 2n² = c.n². Vậy suy ra T₂(n) = O(n²). Ta nói chương trình 2 ở trên có độ phức tạp thời gian O(n²) - bình phương.

### Kí hiệu O-lớn dùng để đánh giá và phân loại độ phức tạp thời gian của thuật toán khi kích thước đầu vào của bài toán tăng lên vô cùng:
- Hằng số: O(1)
- Logarit: O(log n)
- Tuyến tính: O(n)
- Tuyến tính logarit: O(n log n)
- Bình phương: O(n²)
- Đa thức: O(n^k)
- Lũy thừa: O(a^n)
- Giai thừa: O(n!)

## Bài tập và câu hỏi
1. Các lệnh và đoạn chương trình sau cần chạy trong bao nhiêu đơn vị thời gian?
- a)
```python
for k in range(n):
if k % 3:
print(k)
```
- b)
```python
for k in range(0, n, b):
print(k)
```

2. Khẳng định "Trong mọi chương trình chỉ có đúng một phép toán tích cực" là đúng hay sai?

## Hình ảnh mô tả
- Hình 24.2: Minh họa độ phức tạp thời gian của các chương trình.

## Bảng biểu
| Độ phức tạp | Kí hiệu   |
|-------------|-----------|
| Hằng số     | O(1)     |
| Logarit     | O(log n) |
| Tuyến tính  | O(n)     |
| Tuyến tính logarit | O(n log n) |
| Bình phương | O(n²)    |
| Đa thức     | O(n^k)   |
| Lũy thừa    | O(a^n)   |
| Giai thừa   | O(n!)    |




# Tính độ phức tạp của các hàm thời gian

## Nội dung lý thuyết

### Một số quy tắc đơn giản để tính độ phức tạp thời gian thuật toán

- **QT1. Quy tắc cộng**:
- \( O(f(n) + g(n)) = O(\max(f(n), g(n))) \)
- Quy tắc này được áp dụng khi tính độ phức tạp thời gian cho hai chương trình được thực hiện nối tiếp nhau.

- **QT2. Quy tắc nhân**:
- Phép nhân với hằng số: \( O(Cf(n)) = O(f(n)) \) với \( C \) là hằng số bất kỳ.
- Phép nhân với hàm số: \( O(f(n) \cdot g(n)) = O(f(n)) \cdot O(g(n)) \). Quy tắc này được áp dụng khi tính độ phức tạp thời gian cho chương trình có hai vòng lặp lồng nhau.

### Ví dụ minh họa

- \( T(n) = 10n^2 = O(n^2) \) (Quy tắc nhân với hằng số).
- \( T(n) = 3n^2 + n \log n = O(\max(3n^2, n \log n)) \) (Quy tắc cộng) \( = O(3n^2) = O(n^2) \).

### Áp dụng các quy tắc trên để tính độ phức tạp của các hàm thời gian sau:

- a) \( T(n) = n^3 + n \log n + 2n + 1 \)
- b) \( T(n) = 3n^4 + 2n^2 \log n + 10 \)

## Bài tập và câu hỏi

1. Xác định độ phức tạp thời gian tính toán cho chương trình sau:
```python
for i in range(1000):
print(i)
```

2. Xác định độ phức tạp thời gian tính toán cho chương trình sau:
```python
Sum = 0
while n:
Sum += i * 2
n -= 1
print(Sum)
```

## Vận dụng

1. Xác định độ phức tạp thời gian của thuật toán sắp xếp chọn đã được học trong Bài 21.
2. Em hãy thiết lập chương trình và tính thời gian chạy thực tế trên máy tính của các chương trình 1 và 2 với các giá trị \( n \) khác nhau; từ đó thấy được ý nghĩa sự khác biệt độ phức tạp thời gian của hai chương trình này.

## Hình ảnh mô tả
- (Ghi chú về hình ảnh: Hình 24.2 mô tả các chương trình và cách tính thời gian chạy thực tế trên máy tính).

## Bảng biểu
- (Ghi chú về bảng biểu: Bảng so sánh độ phức tạp thời gian của các thuật toán khác nhau).
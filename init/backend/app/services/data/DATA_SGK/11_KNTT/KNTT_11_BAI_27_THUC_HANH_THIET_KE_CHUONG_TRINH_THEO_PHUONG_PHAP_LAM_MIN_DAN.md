# BÀI 27                  THỰC HÀNH
## THIẾT KẾ CHƯƠNG TRÌNH THEO PHƯƠNG PHÁP LÀM MỊN DẦN

### SAU BÀI HỌC NÀY EM SẼ:
Thực hành thiết kế chương trình theo phương pháp làm mịn dần.

Phương pháp làm mịn dần là một trong các cách tiếp cận tổng quát khi giải quyết các bài toán cụ thể. Em có thể sử dụng sơ đồ hình cây để mô tả phương pháp này không?

### Nhiệm vụ 1. Kiểm tra hoán vị
Cho trước một dãy n số, các số được kí hiệu A[0], A[1], ..., A[n-1]. Cần thiết kế chương trình kiểm tra xem dãy trên có phải là một hoán vị của dãy số 1, 2, ..., n hay không. Chương trình cần thông báo kết quả là CÓ hoặc KHÔNG.

#### Hướng dẫn: Phân tích thiết kế
a) Tìm hiểu bài toán
- Bài toán gốc: Cho trước dãy số A gồm n phần tử, cần kiểm tra xem A có phải là một hoán vị của dãy số 1, 2, ..., n hay không.

b) Thiết kế theo phương pháp làm mịn dần
- **Bước 1. Thiết lập ý tưởng thiết kế ban đầu:**
Ý tưởng ban đầu để giải bài toán này khá đơn giản: Sắp xếp A theo thứ tự tăng dần. Sau đó chỉ cần so sánh A có trung khít với dãy [1, 2, ..., n] hay không. Như vậy sơ đồ khung ban đầu của lời giải sẽ như sau:

```
Sắp xếp dãy A theo thứ tự tăng dần.     hay không
Kiểm tra     có phải là dãy 1, 2, ..., n
```

- **Bước 2. Sắp xếp dãy A:**
Việc sắp xếp dãy A theo thứ tự tăng dần được mô tả bằng hàm `sapxep(A)` theo một trong các thuật toán sắp xếp mà chúng ta đã biết. Ví dụ bằng thuật toán sau:

```python
def sapxep(A):
for i in range(len(A)):
j = i
while j > 0 and A[j] &#x3C; A[j-1]:
A[j], A[j-1] = A[j-1], A[j]
j = j - 1
```

- **Bước 3. Với dãy A đã được sắp xếp, kiểm tra A có phải là dãy [1, 2, ..., n]?**
Việc kiểm tra này có thể được thực hiện đơn giản như sau:
Kiểm tra lần lượt các phần tử của A với các phần tử tương ứng của dãy 1, 2, ..., n. Nếu tất cả các so sánh đều bằng nhau thì trả về kết quả True, ngược lại trả về False.

### Bài tập và câu hỏi
1. Viết chương trình kiểm tra hoán vị theo phương pháp đã nêu.
2. Thử nghiệm với các dãy số khác nhau và ghi lại kết quả.
3. Giải thích tại sao phương pháp làm mịn dần lại hiệu quả trong bài toán này.

### Hình ảnh mô tả
- (Ghi chú về hình ảnh: Hình ảnh mô tả sơ đồ khung của phương pháp làm mịn dần có thể được vẽ để minh họa cho các bước trong thiết kế chương trình.)

### Bảng biểu
- (Ghi chú về bảng biểu: Bảng có thể được sử dụng để so sánh các kết quả kiểm tra hoán vị với các dãy số khác nhau.)



# Bài học: Kiểm tra hoán vị của dãy số

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách kiểm tra xem một dãy số có phải là hoán vị của dãy số từ 1 đến n hay không. Để thực hiện điều này, chúng ta sẽ sử dụng một hàm để sắp xếp dãy số và sau đó so sánh từng phần tử của dãy đã sắp xếp với chỉ số của nó.

## Ví dụ minh họa
Giả sử chúng ta có dãy số A = [2, 1, 9, 10, 8, 6, 5, 2, 3, 1]. Để kiểm tra xem dãy số này có phải là hoán vị của dãy số [1, 2, ..., n] hay không, chúng ta sẽ thực hiện các bước sau:

1. Sắp xếp dãy số A.
2. So sánh từng phần tử của dãy số đã sắp xếp với chỉ số của nó.

### Đoạn mã thực hiện
```python
def sapxep(A):
for i in range(len(A)):
j = i
while j > 0 and A[j] &#x3C; A[j-1]:
A[j], A[j-1] = A[j-1], A[j]
j = j - 1

def kt_hoanvi(A):
sapxep(A)
kq = True
for i in range(len(A)):
if A[i] != i + 1:
kq = False
break
return kq

# Chương trình chính
A = [2, 1, 9, 10, 8, 6, 5, 2, 3, 1]
```

## Bài tập và câu hỏi
1. Viết hàm kiểm tra xem dãy số A = [3, 1, 2] có phải là hoán vị của dãy số [1, 2, 3] hay không.
2. Thay đổi dãy số A thành [1, 2, 3, 4, 5] và kiểm tra lại.
3. Giải thích cách hoạt động của hàm `sapxep()`.

## Hình ảnh mô tả
- Hình ảnh mô tả quá trình sắp xếp dãy số và so sánh các phần tử (ghi chú về hình ảnh: Hình ảnh minh họa quá trình sắp xếp và kiểm tra hoán vị).

## Bảng biểu
| Chỉ số | Giá trị A[i] | So sánh với | Kết quả |
|--------|--------------|--------------|---------|
| 0      | 1            | 1            | Đúng    |
| 1      | 2            | 2            | Đúng    |
| 2      | 3            | 3            | Đúng    |
| ...    | ...          | ...          | ...     |

Kết quả cuối cùng sẽ cho biết dãy số A có phải là hoán vị của dãy số từ 1 đến n hay không.



# Tiêu đề bài học
**Nhiệm vụ 2: Đếm số lần lặp**

## Nội dung lý thuyết
Thiết kế và viết chương trình theo phương pháp làm mịn dần cho bài toán sau: Cho trước dãy số A[0], A[1], A[n-1]. Cần tính được mỗi giá trị của các phần tử của dãy trên được lặp lại bao nhiêu lần trong dãy đó. Kết quả cần được đưa ra dãy B.

Như vậy dãy B sẽ có ý nghĩa như sau: B[k] = số lần lặp của phần tử A[k] trong dãy A.

## Ví dụ minh họa
Nếu A = [2, 1, 1, 3, 5, 10, 2, 5] thì B = [2, 2, 2, 1, 2, 1, 2, 2].

## Hướng dẫn: Phân tích thiết kế
### a) Tìm hiểu bài toán
Bài toán gốc: cho trước dãy số A có n phần tử. Cần tạo ra một dãy mới là số các lần lặp của các phần tử tương ứng trong A.

### b) Thiết kế theo phương pháp làm mịn dần
**Bước 1:** Thiết lập ý tưởng thiết kế ban đầu:
Theo yêu cầu, chúng ta cần xây dựng dãy B có cùng kích thước với dãy A và các phần tử của B liên hệ với dãy A như sau: B[k] = số lần lặp của phần tử A[k] trong dãy.

Do vậy, thiết kế lược sơ lược ban đầu của bài toán như sau:
- Thiết lập dãy rỗng.
- Tính số lần lặp của A[i] trong dãy.
- Bổ sung giá trị này vào dãy.
- Trả về dãy.

**Bước 2:** Thiết lập dãy B rỗng.
Việc này được thực hiện đơn giản bằng lệnh `B = []`.

**Bước 3:** Tính số lần lặp của A[i] trong dãy.
Công việc này có thể được thực hiện thông qua lời gọi hàm `lap(x, A)` tính số lần lặp của một giá trị bất kỳ trong dãy A. Hàm `lap(x, A)` có thể được viết như sau:
```python
def lap(x, A):
count = 0
for a in A:
if a == x:
count += 1
return count
```

**Bước 4:** Bổ sung số lần lặp vào dãy B.
Tổng hợp kết quả của các bước trên, chúng ta thu được đoạn chương trình hoàn chỉnh đã nêu ở bước 1 như sau:
```python
for i in range(len(A)):
B.append(lap(A[i], A))
return B
```

## Bài tập và câu hỏi
1. Viết chương trình để kiểm tra số lần lặp của các phần tử trong một dãy số khác.
2. Thay đổi chương trình để chỉ in ra các phần tử có số lần lặp lớn hơn 1.

## Hình ảnh mô tả
*Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một sơ đồ thể hiện mối quan hệ giữa dãy A và dãy B, cùng với các bước thực hiện trong chương trình.*

## Bảng biểu
| Phần tử A | Số lần lặp B |
|-----------|---------------|
| 2         | 2             |
| 1         | 3             |
| 3         | 1             |
| 5         | 2             |
| 10        | 1             |




# Bài học: Thiết kế chương trình kiểm tra dãy số và xâu ký tự

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách thiết kế chương trình để kiểm tra các điều kiện trong dãy số và xâu ký tự. Chúng ta sẽ áp dụng phương pháp làm mịn dần để phát triển chương trình một cách có hệ thống.

## Ví dụ minh họa
### Ví dụ 1: Kiểm tra dãy số
Chúng ta có dãy số A và cần kiểm tra xem trong dãy có hai phần tử nào trùng nhau hay không.

```python
def lap(x, A):
S = 0
for a in A:
if a == x:
S += 1
return S

def tinh_lap(A):
B = []
for a in A:
B.append(lap(a, A))
return B

# Chương trình chính
A = [2, 1, 1, 3, 5, 10, 2, 5, 2]
B = tinh_lap(A)
print(B)  # Kết quả sẽ cho biết số lần xuất hiện của mỗi phần tử trong A
```

### Ví dụ 2: Kiểm tra xâu ký tự đối xứng
Xâu ký tự được gọi là đối xứng nếu khi thay đổi thứ tự ngược lại các ký tự của xâu thì vẫn nhận được dãy ban đầu.

```python
def kiem_tra_doi_xung(s):
return s == s[::-1]

# Chương trình chính
xau = "abcdcba"
if kiem_tra_doi_xung(xau):
print("Xâu là đối xứng")
else:
print("Xâu không phải là đối xứng")
```

## Bài tập và câu hỏi
1. Thiết kế thuật toán cho nhiệm vụ 1 với ý tưởng như sau: Dãy A là một hoán vị của dãy các số từ 1 đến n khi và chỉ khi dãy A có độ dài n và mọi số từ 1 đến n đều nằm trong A.
2. Trong Nhiệm vụ 2, nếu dãy A đã được sắp xếp theo thứ tự tăng dần thì có thể cải tiến thuật toán tốt hơn được không?

## Vận dụng
1. Cho dãy số A = [A[0], A[1], ..., A[n-1]]. Thiết kế và viết chương trình kiểm tra trong dãy A có hai phần tử nào trùng nhau hay không. Cần đưa ra câu trả lời là "có" hay "không". Yêu cầu đưa ra quy trình thiết kế theo phương pháp làm mịn dần.
2. Thiết kế và viết chương trình kiểm tra một xâu ký tự cho trước có là đối xứng hay không. Yêu cầu đưa ra quy trình thiết kế theo phương pháp làm mịn dần.

## Hình ảnh mô tả
(Ghi chú: Hình ảnh mô tả có thể bao gồm sơ đồ thuật toán hoặc minh họa cho các ví dụ trên)

## Bảng biểu
| Dãy số A         | Kết quả kiểm tra |
|------------------|------------------|
| [2, 1, 1, 3, 5]  | Có               |
| [1, 2, 3, 4, 5]  | Không            |
| [1, 1, 2, 3, 4]  | Có               |

----

Lưu ý: Nội dung trên chỉ là một phần trong chương trình học Tin học và có thể được mở rộng thêm với nhiều ví dụ và bài tập khác.
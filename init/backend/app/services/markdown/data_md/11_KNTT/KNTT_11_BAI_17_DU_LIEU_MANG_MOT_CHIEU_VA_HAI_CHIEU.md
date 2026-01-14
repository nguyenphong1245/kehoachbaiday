# Kĩ thuật lập trình

## BÀI 17: DỮ LIỆU MẢNG MỘT CHIỀU VÀ HAI CHIỀU

### SAU BÀI HỌC NÀY EM SẼ:
- Biết cách thiết lập và làm việc với cấu trúc dữ liệu mảng một chiều và hai chiều.
- Em đã biết thiết lập cấu trúc dữ liệu đóng vai trò quan trọng khi giải quyết trong các bài toán thực tế trên máy tính. Trong các bài toán thực tế sau em sẽ thiết lập cấu trúc dữ liệu như thế nào?
- Lập danh sách họ tên các bạn học sinh lớp em để có thể tìm kiếm, sắp xếp và thực hiện các bài toán quản lý khác.
- Giả sử lớp em cần khảo sát ý kiến theo một yêu cầu của ban giám hiệu: Mỗi học sinh cần có đánh giá theo 4 mức, ký hiệu lần lượt là Đồng ý (2); Không phản đối (1); Không ý kiến (0); Phản đối (-1). Em sẽ tổ chức dữ liệu khảo sát như thế nào để có thể dễ dàng cập nhật và tính toán theo dữ liệu khảo sát?
- Em được giao nhiệm vụ thiết lập và lưu trữ một danh sách các địa điểm là nơi các bạn trong lớp sẽ thường xuyên đến để tham quan và trải nghiệm thực tế. Mỗi địa điểm như vậy cần nhiều thông tin; nhưng thông tin quan trọng nhất là tọa độ (x; y) của thông tin đó trên bản đồ. Em sẽ dùng cấu trúc dữ liệu gì để mô tả danh sách các địa điểm này?

## CẤU TRÚC DỮ LIỆU MẢNG MỘT CHIỀU
Trong Tin học, dữ liệu mảng một chiều, thường được gọi là cấu trúc dữ liệu tuyến tính, là cấu trúc dữ liệu bao gồm một dãy các phần tử dữ liệu có cùng kiểu. Các tử của mảng sẽ được truy cập theo chỉ số, cho phép các thao tác đơn giản như cập nhật và thay đổi giá trị.

Trong Python, dữ liệu mảng một chiều có thể được biểu diễn bằng danh sách (list) với các phần tử có cùng kiểu dữ liệu.

### Hoạt động 1: Tìm hiểu cấu trúc dữ liệu mảng một chiều trong Python
Thực hiện các thao tác sau; quan sát; trao đổi và thảo luận; từ đó nhận biết về cấu trúc dữ liệu mảng một chiều trong Python:
- Thiết lập các mảng một chiều; thông qua kiểu dữ liệu list; rất đơn giản trong Python.

```python
A = [1, 3, 5, 7, 9, 11]
B = ["Hà", "Bình", "Ngọc", "Anh"]
C = [9.5, 8.0, 10, 7.2]
```



```markdown
## b) Có thể truy cập từng phần tử của mảng một chiều theo chỉ số.
Toán tử `in` kiểm tra một đối tượng có nằm trong mảng hay không. Trong Python, chỉ số bắt đầu từ 0.
```python
>>> 7 in A
True
```

### c) Có thể dễ dàng duyệt từng phần tử của mảng một chiều bằng lệnh `for`.
```python
>>> for hs in B:
print(hs, end = " ")
```
Hà Bình Ngọc Anh

### d) Các lệnh làm việc chính với danh sách trong Python đã được học trong chương trình Tin học 10, ví dụ các lệnh:
- `append` (bổ sung phần tử vào cuối)
- `remove` (xoá phần tử)
- `insert` (bổ sung phần tử vào vị trí bất kỳ)
- `clear` (xoá toàn bộ các phần tử của danh sách).

**Chú ý:** Mặc dù mảng được biểu diễn bằng dữ liệu List, nhưng không được đồng nhất khái niệm mảng của khoa học máy tính với kiểu dữ liệu List trong Python:

Cấu trúc dữ liệu mảng một chiều trong Python có thể biểu diễn bằng kiểu dữ liệu danh sách (list) với chức năng truy cập dễ dàng từng phần tử theo chỉ số, truy cập theo vùng chỉ số. Toán tử `in` và lệnh `for in` sẽ hỗ trợ duyệt từng phần tử của mảng:

1. Sử dụng hàm `sum()` tính tổng các số của một dãy; hãy viết câu lệnh tính giá trị trung bình của dãy số A cho trước.
2. Có thể duyệt các phần tử của mảng theo chiều ngược lại; từ cuối về đầu, được không?

## 2. CẤU TRÚC DỮ LIỆU MẢNG HAI CHIỀU
### Hoạt động 2: Mô hình list trong list của Python
Thực hiện các lệnh sau; quan sát, trao đổi và thảo luận, từ đó nhận biết về mô hình danh sách trong danh sách của Python.

**Thông tin:** Xét dữ liệu biểu diễn điểm của học sinh trong lớp, mỗi phần tử sẽ bao gồm hai thông tin là tên học sinh và điểm số. Lệnh sau sẽ tạo một bộ dữ liệu như vậy: Ta thấy mỗi phần tử của dãy này lại là một danh sách bao gồm hai phần tử.
```python
>>> DS_diem = [["Quang", 7.5], ["Hà", 8.0], ["Bình", 9.5]]
```
b) Nếu truy cập một phần tử của danh sách; ta nhận được một dãy bao gồm tên và điểm của học sinh tương ứng.
```python
>>> DS_diem[1]
['Hà', 8.0]
```
```plaintext
82
```



# Giáo Dục - Sách Giáo Khoa

## 1. Truy cập giá trị điểm cụ thể

Muốn truy cập một giá trị điểm cụ thể, ví dụ điểm của học sinh tên "Quang", cần thực hiện lệnh sau:

```python
DS_diem[0][1]
```
Kết quả:
```
7.5
```

## 2. Duyệt danh sách điểm

Lệnh duyệt các điểm:

```python
for hs, diem in DS_diem:
print(hs, diem)
```

Kết quả:
```
Quang 7.5
Hà 8.0
Bình 9.5
```

## 3. Mô hình dữ liệu trong Python

Python hỗ trợ mô hình dữ liệu danh sách trong danh sách, tức là mỗi phần tử của danh sách là một đối tượng dạng danh sách khác.

### 3.1. Thiết lập mảng

1. Thiết lập mảng bao gồm dữ liệu là tọa độ các điểm trên mặt phẳng, mỗi điểm \( p \) được cho bởi hai tọa độ \( (px, py) \).
2. Thiết lập mảng bao gồm dãy các thông tin là danh sách học sinh và thông tin 3 điểm thi của học sinh tương ứng các bài thi số 1, 2, 3. Viết đoạn lệnh nhập bộ dữ liệu trên và chương trình in ra danh sách học sinh cùng với điểm trung bình của các bài thi.

## 4. Hoạt động 3: Mô hình mảng hai chiều của Python

Đọc, trao đổi, thảo luận về cấu trúc dữ liệu mảng hai chiều trong Python.

### 4.1. Cấu trúc dữ liệu hai chiều

Trong tin học, một cấu trúc dữ liệu hai chiều được hiểu là một bảng hay còn gọi là ma trận; bao gồm các hàng và cột dữ liệu. Bảng có thể có kích thước vuông \( n \times n \) hoặc kích thước bất kỳ \( m \times n \).

#### 4.1.1. Ví dụ về ma trận

Một bảng (hay ma trận) vuông tổng quát mô hình bảng bậc \( m \times n \) có dạng như sau:

\[
A = \begin{bmatrix}
12 &#x26; 10 &#x26; 91 \\
11 &#x26; 45 &#x26; 20 \\
15 &#x26; 34 &#x26; 55
\end{bmatrix}
\]

Phần tử nằm tại hàng \( i \) và cột \( j \) sẽ ký hiệu là \( a_{ij} \). Như vậy, \( a_{ij} \) là phần tử của ma trận tại vị trí hàng \( i \), cột \( j \).



# Ma trận và Cấu trúc Dữ liệu 2 Chiều trong Python

Ma trận kích thước \( m \times n \) sẽ bao gồm \( m \) phần tử, có cấu trúc bao gồm \( m \) hàng, mỗi hàng có \( n \) cột. Trong Python, mô hình ma trận \( m \times n \) sẽ dễ dàng được biểu diễn bởi cấu trúc list trong list với một mảng có \( m \) phần tử, mỗi phần tử đều có dạng list có \( n \) phần tử.

## Ví dụ

Ví dụ ma trận vuông bậc 3 ở trên có thể khai báo trong Python như sau:

```python
A = [[12, 10, 91], [11, 45, 20], [15, 34, 55]]
```

Vì mảng trong Python được đánh chỉ số từ 0 nên muốn truy cập phần tử tại hàng 3 cột 2, gõ lệnh:

```python
A[2][1]
```

Kết quả sẽ là:

```
34
```

### Duyệt Ma Trận

Với cấu trúc dữ liệu 2 chiều; ví dụ như ma trận bậc 3 ở trên, thao tác duyệt theo từng phần tử sẽ được thực hiện bằng 2 lệnh duyệt lồng nhau. Ví dụ sau cho biết cách duyệt ma trận A có \( 3 \times 3 = 9 \) phần tử, kết quả thể hiện ma trận A theo đúng khuôn mẫu chuẩn là một bảng gồm 3 hàng, 3 cột như sau:

```python
for i in range(3):
for j in range(3):
print(A[i][j], end=' ')
print()
```

Kết quả sẽ là:

```
12 10 91
11 45 20
15 34 55
```

Trong Python, cấu trúc dữ liệu 2 chiều có thể được biểu diễn bằng mô hình list trong list. Có thể truy cập từng phần tử và duyệt cấu trúc dữ liệu 2 chiều bằng 2 lệnh for lồng nhau.

## Câu hỏi

1. Câu lệnh sau sẽ tạo dữ liệu thuộc loại gì?
```python
temp = [1, 2, 3, 4]
[temp, temp]
```

2. Nếu \( A \) là bảng (ma trận) kích thước \( m \times n \) thì đoạn chương trình sau sẽ in ra thông tin gì trên màn hình?
```python
for i in range(m):
for j in range(n):
print(A[i][j], end=' ')
print()
```



# LUYỆN TẬP

1. Giả sử số đo chiều cao các bạn trong lớp được cho trong dãy số A. Hãy viết đoạn chương trình tính:
- Số đo chiều cao trung bình của cả lớp.
- Số bạn có chiều cao lớn hơn chiều cao trung bình của cả lớp.

2. Viết chương trình nhập từ bàn phím số tự nhiên m, sau đó lần lượt nhập m dòng, mỗi dòng gồm n số cách nhau bởi dấu cách, đưa dữ liệu đã nhập vào ma trận A sau đó in ma trận A ra màn hình.

# VẬN DỤNG

1. Viết hàm số `UnitMatrix(n)` với n là số tự nhiên cho trước; hàm trả lại giá trị là ma trận bậc n như Hình 17.1.

```
E=
```

![Hình 17.1](#)

2. Viết chương trình cho phép người dùng nhập từ bàn phím một dãy số tự nhiên; hãy đếm với mỗi giá trị của dãy có bao nhiêu số lặp lại. Ví dụ nếu dãy ban đầu là:
```
0 1 5 7 0 2 5 1 1 2
```
thì chương trình cần thông báo như Hình 17.2.

![Hình 17.2](#)

Em ghi số tiền điện gia đình em theo từng tháng vào một danh sách gồm 12 số. Mỗi năm lại ghi lại tiền điện vào một danh sách và ghép với danh sách các năm trước. Như vậy em thu được một bảng số tiền điện của năm thứ k, trong đó hàng thứ k là số tiền điện theo tháng.

Thiết lập mảng mới tính số tiền điện trung bình của các năm; mỗi năm ghi một số.

b) Tính số tiền điện trung bình của tất cả các năm đã được ghi dữ liệu trong bảng.
# BÀI 30  THIẾT LẬP THƯ VIỆN CHO CHƯƠNG TRÌNH

## SAU BÀI HỌC NÀY EM SẼ:
- Tạo được một thư viện nhỏ của người lập trình.
- Trình bày được cấu trúc danh sách liên kết.

Em đã học về cấu trúc mảng (một chiều hoặc hai chiều). Cấu trúc mảng là một danh sách các tử được đánh chỉ số và quan hệ với nhau thông qua hệ thống phần tử, nếu thực hiện lệnh, chỉ số này: Giả sử A[0], A[1], A[n - 1] là ví dụ. Nếu A[1] bị xóa, thì các phần tử còn lại sẽ tự động điều chỉnh lại chỉ số để đối tượng vẫn là mảng (nhưng có n - 1 phần tử).

Cấu trúc danh sách liên kết (hay danh sách móc nối, linked list) là đối tượng có cấu trúc gần giống với mảng nhưng có liên kết không chặt chẽ như mảng: Một ví dụ của cấu trúc danh sách liên kết là mô hình các trang web. Khi duyệt web, em không thể đánh chỉ số cho từng trang web đã duyệt; mà chỉ có thể di chuyển đến các trang trước và trang sau. Em hãy tìm thêm các ví dụ thực tế của mô hình danh sách liên kết.

## 1. THIẾT LẬP THƯ VIỆN CHO CHƯƠNG TRÌNH
### Hoạt động 1: Tìm hiểu về thư viện chương trình
Em hãy đọc, thảo luận và trả lời các câu hỏi sau:
1. Vì sao lại cần thư viện chương trình?
2. Nghĩa của các hàm trong thư viện chương trình là gì?

### a) Một số hàm của thư viện math
Math là một thư viện các hàm chuẩn của Python liên quan đến các tính toán toán học. Ví dụ một số hàm thường dùng của thư viện math là hàm tính căn bậc hai `sqrt()`, làm tròn xuống `floor()` và làm tròn lên `ceil()`. Để đưa một thư viện vào bộ nhớ có thể dùng lệnh `import` hoặc `from <thư viện=""> import <các hàm="">` như sau:
- `import math`    đưa toàn bộ thư viện math vào bộ nhớ
- `from math import sqrt, floor, ceil`         chỉ đưa vào bộ nhớ ba hàm

### Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc danh sách liên kết và cách sử dụng thư viện math trong Python)

### Bảng biểu
| Hàm          | Mô tả                          |
|--------------|--------------------------------|
| `sqrt(x)`    | Tính căn bậc hai của x        |
| `floor(x)`   | Làm tròn x xuống số nguyên    |
| `ceil(x)`    | Làm tròn x lên số nguyên      |

### Bài tập và câu hỏi
1. Tạo một thư viện nhỏ với ít nhất 3 hàm tự định nghĩa.
2. Sử dụng thư viện math để thực hiện các phép toán sau: tính căn bậc hai của 16, làm tròn 4.7 xuống và làm tròn 4.3 lên.</các></thư>



# Tiêu đề bài học
**Thư viện trong Python**

# Nội dung lý thuyết
Thư viện trong Python là tập hợp các hàm được đặt trong các mô đun độc lập để dùng chung cho nhiều chương trình khác nhau. Các thư viện này có thể được sử dụng nhiều lần và có thể cập nhật, nâng cấp bất cứ lúc nào. Trong Python, lệnh `import` có chức năng đưa thư viện vào bộ nhớ để sẵn sàng sử dụng.

# Ví dụ minh họa
```python
from math import sqrt, floor, ceil
sqrt(5)  # Kết quả: 2.23606797749979
floor(8.7)  # Kết quả: 8
ceil(7.1)  # Kết quả: 8
```

b) Tự thiết lập thư viện
Cách thiết lập một thư viện rất đơn giản: Em đưa các hàm chuẩn vào một tệp chương trình và đặt tên của tệp này chính là tên thư viện muốn lưu trữ. Xét ví dụ sau; tệp chương trình `lib.py` đóng vai trò như một thư viện. Thư viện này có hai hàm như sau:

```python
# lib.py
def NhapDL():
return [int(x) for x in input("Nhập dãy số nguyên cách nhau bởi dấu cách: ").split()]

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

Chương trình sử dụng thư viện có thể như sau (đặt tệp chương trình này cùng thư mục với tệp thư viện `lib.py`):

```python
from lib import *  # Đưa tất cả các hàm của thư viện lib vào bộ nhớ
A = NhapDL()
InsertionSort(A)
print(A)
```

# Bài tập và câu hỏi
Những câu nào sau đây là sai về ý nghĩa của việc sử dụng thư viện khi viết chương trình?
- A. Chương trình sẽ ngắn hơn.
- B. Các hàm thư viện được viết một lần và sử dụng nhiều lần.
- C. Chương trình sáng sủa, dễ hiểu hơn.
- D. Chương trình sẽ chạy nhanh hơn.

# Hình ảnh mô tả
*Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một sơ đồ thể hiện cách thức hoạt động của thư viện trong Python, hoặc một ví dụ về cách sử dụng thư viện trong một chương trình thực tế.*

# Bảng biểu
*Ghi chú về bảng biểu: Bảng có thể liệt kê các thư viện phổ biến trong Python cùng với mô tả ngắn gọn về chức năng của chúng.*



# 2. CẤU TRÚC DANH SÁCH LIÊN KẾT

## Hoạt động 2: Tìm hiểu cấu trúc danh sách liên kết
Đọc, trao đổi và thảo luận để biết cấu trúc dữ liệu của danh sách liên kết và các thao tác dữ liệu cơ bản trên danh sách liên kết.

Mỗi danh sách liên kết sẽ bao gồm hai cấu trúc dữ liệu:
- **Cấu trúc Node** mô tả các phần tử độc lập của danh sách; tối thiểu mỗi node cần có thông tin dữ liệu `key` (khóa) và thuộc tính `next` dùng để kết nối sang phần tử tiếp theo trong danh sách.
- **Cấu trúc LL (linked list)** sẽ có thông tin `head` (đầu) sẽ luôn chỉ vào node đầu tiên của danh sách liên kết.

### Các node của danh sách
```
head                                                            None
key           'next                                        None là dữ liệu rỗng.
của node    chỉ sang node                                    Node cuối của danh
tiếp theo    sách next = None.
```

## Một số lệnh, thao tác chính với kiểu dữ liệu danh sách liên kết:
- Khởi tạo một danh sách liên kết mới.
- Bổ sung một phần tử với khóa k cho trước vào danh sách.
- Tìm kiếm phần tử có khóa k trong danh sách cho trước.
- Xóa phần tử có khóa k trong danh sách.

Ta sẽ thiết lập một số hàm là các thao tác chuẩn trên dữ liệu danh sách liên kết:
1. Hàm `insert(L, k)` sẽ bổ sung (chèn) node với khóa k vào đầu của danh sách L.

### Thao tác chèn node với khóa k vào đầu của danh sách.
```
head                 None
```

### Chương trình như sau:
```python
def insert(L, k):
node = Node(k)
node.next = L.head
L.head = node
```

## Bài tập và câu hỏi
1. Giải thích cấu trúc của một node trong danh sách liên kết.
2. Viết hàm để xóa một node có khóa k trong danh sách liên kết.
3. Thực hiện tìm kiếm một phần tử trong danh sách liên kết và trả về vị trí của nó.

## Hình ảnh mô tả
- Hình ảnh mô tả cấu trúc của danh sách liên kết và các thao tác trên nó (ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc node và danh sách liên kết).

## Bảng biểu
- Bảng mô tả các thao tác chính trên danh sách liên kết và thời gian thực hiện của chúng.



# Tiêu đề bài học: Các hàm thao tác với danh sách liên kết

## Nội dung lý thuyết

1. **Hàm delete_first(L)**: Hàm này sẽ xoá node đầu tiên của danh sách (nếu danh sách không rỗng).
- Thao tác xoá node đầu tiên của danh sách:
```
head                                                               None
```

- Chương trình như sau:
```python
def delete_first(L):
if L.head != None:
L.head = L.head.next
```

2. **Hàm tìm kiếm**: Hàm tìm kiếm phần tử có khoá k trong danh sách L. Nếu tìm thấy sẽ trả về phần tử (node) tương ứng; nếu không tìm thấy trả về None.
- Việc tìm kiếm bắt đầu từ node đầu tiên của danh sách. Lần lượt duyệt theo từng phần tử của danh sách cho đến khi nào tìm thấy phần tử có khoá k hoặc đi đến cuối danh sách thì dừng.
- Chương trình như sau:
```python
def search(L, k):
x = L.head
while x != None and x.key != k:
x = x.next
return x
```

3. **Hàm xoá phần tử có khoá k trong danh sách L**: Cách thực hiện hàm này như sau:
- Nếu phần tử cần tìm là node đầu tiên của danh sách thì cách xoá giống hàm delete_first().
- Trong trường hợp tổng quát cần duyệt để tìm phần tử của danh sách có khoá k. Trong quá trình tìm luôn lưu trữ biến z là node trước của biến y cần xoá. Nếu tìm thấy thì lệnh xoá được mô tả trong sơ đồ sau; chính là lệnh `z.next = y.next` trong chương trình tại dòng 11.
- Sơ đồ mô tả:
```
head                                                               None
```

- Chương trình như sau:
```python
def delete(L, k):
if L.head != None:
if L.head.key == k:
L.head = L.head.next
else:
y = L.head
while y != None and y.key != k:
z = y
y = y.next
if y != None:
z.next = y.next
```

## Ví dụ minh họa
- Giả sử danh sách liên kết có các phần tử: 1 -> 2 -> 3 -> 4
- Sau khi gọi `delete_first(L)`, danh sách sẽ trở thành: 2 -> 3 -> 4
- Sau khi gọi `search(L, 3)`, kết quả trả về sẽ là node chứa giá trị 3.
- Sau khi gọi `delete(L, 2)`, danh sách sẽ trở thành: 3 -> 4

## Bài tập và câu hỏi
1. Viết hàm để thêm một phần tử vào cuối danh sách liên kết.
2. Giải thích cách hoạt động của hàm `search`.
3. Thực hiện các thao tác thêm, xoá và tìm kiếm trên một danh sách liên kết mẫu.

## Hình ảnh mô tả
- Hình ảnh mô tả cấu trúc danh sách liên kết và các thao tác thêm, xoá, tìm kiếm.

## Bảng biểu
| Hàm                | Mô tả                                      |
|--------------------|--------------------------------------------|
| `delete_first(L)`  | Xoá node đầu tiên của danh sách           |
| `search(L, k)`     | Tìm kiếm phần tử có khoá k trong danh sách|
| `delete(L, k)`     | Xoá phần tử có khoá k trong danh sách    |




# Bài học: Danh sách liên kết trong Python

## Nội dung lý thuyết
Danh sách liên kết là một cấu trúc dữ liệu cho phép lưu trữ một tập hợp các phần tử, trong đó mỗi phần tử (gọi là nút) chứa một giá trị và một tham chiếu đến nút tiếp theo trong danh sách. Cấu trúc này rất linh hoạt và cho phép thêm, xóa các phần tử một cách dễ dàng.

### Cấu trúc của danh sách liên kết
Mỗi nút trong danh sách liên kết bao gồm:
- **key**: giá trị của nút.
- **next**: tham chiếu đến nút tiếp theo.

### Các hàm cơ bản
1. **Hàm khởi tạo**: Tạo một danh sách liên kết rỗng.
2. **Hàm chèn**: Thêm một nút mới vào đầu danh sách.
3. **Hàm xóa**: Xóa nút đầu tiên trong danh sách.
4. **Hàm tìm kiếm**: Tìm một nút theo giá trị.
5. **Hàm hiển thị**: Hiển thị toàn bộ danh sách.

## Ví dụ minh họa
```python
class Node:
def __init__(self, key):
self.key = key
self.next = None

class LL:
def __init__(self):
self.head = None

def insert(L, k):
node = Node(k)
node.next = L.head
L.head = node

def delete_first(L):
if L.head != None:
L.head = L.head.next

def search(L, k):
x = L.head
while x != None and x.key != k:
x = x.next
return x

def delete(L, k):
if L.head != None:
if L.head.key == k:
L.head = L.head.next
else:
y = L.head
while y.next != None and y.next.key != k:
y = y.next
if y.next != None:
y.next = y.next.next

def show(L):
x = L.head
while x != None:
print(x.key, end=' ')
x = x.next
print()
```

## Bài tập và câu hỏi
1. Viết hàm để chèn một nút vào cuối danh sách liên kết.
2. Viết hàm để xóa một nút theo giá trị.
3. Giải thích cách hoạt động của hàm tìm kiếm trong danh sách liên kết.

## Hình ảnh mô tả
- Hình ảnh mô tả cấu trúc của danh sách liên kết với các nút và tham chiếu giữa chúng.

## Bảng biểu
| Hàm         | Mô tả                                      |
|-------------|--------------------------------------------|
| `insert`    | Thêm nút mới vào đầu danh sách             |
| `delete`    | Xóa nút theo giá trị                       |
| `search`    | Tìm nút theo giá trị                       |
| `show`      | Hiển thị toàn bộ danh sách                 |




# Bài học: Cấu trúc dữ liệu Linked List

## Nội dung lý thuyết
Danh sách liên kết là cấu trúc dữ liệu bao gồm:
- Cấu trúc node mô tả các phần tử của danh sách. Mỗi node sẽ có dữ liệu khoá (key) là thông tin chính và phần thông tin next để kết nối sang node tiếp theo của danh sách.
- Cấu trúc head là đầu của mỗi danh sách liên kết. Head luôn chỉ vào node đầu tiên của danh sách (có thể là danh sách rỗng).
- Node cuối cùng của danh sách sẽ có thông tin next = None (dữ liệu).

Có thể thiết lập các hàm tìm kiếm, bổ sung hoặc xoá thông tin trên danh sách liên kết.

## Ví dụ minh họa
### Một số ví dụ thiết lập cấu trúc dữ liệu Linked List:
a) Thiết lập một danh sách rỗng.
```python
LL()
```
b) Thiết lập một danh sách bao gồm hai node có khoá là 5, 2.
```python
LL()
insert(L, 5)
insert(L, 2)
```
c) Thiết lập một danh sách bao gồm các phần tử lấy từ dãy A cho trước.
```python
A = [5, 2, 8, 10, 0, 3]
LL()
for k in A:
insert(L, k)
```

## Bài tập và câu hỏi
1. Đoạn chương trình sau thực hiện công việc gì?
```python
from LinkedList import *
L = LL()
insert(L, 10)
insert(L, 20)
show(L)
```
2. Viết đoạn chương trình ngắn sử dụng thư viện LinkedList để thiết lập một danh sách liên kết và bổ sung các tên "Binh", "Hoa", "Hà" vào danh sách này.

## LUYỆN TẬP
1. Viết một thư viện bao gồm các hàm nhập dữ liệu là một dãy số và các hàm thư viện bao gồm sắp xếp chèn, sắp xếp chọn và sắp xếp nổi bọt.
2. Cho trước danh sách liên kết L với cấu trúc như đã mô tả trong bài học; muốn lấy ra khoá của node đầu tiên của danh sách thì dùng lệnh nào?

## VẬN DỤNG
1. Cho trước một danh sách liên kết L. Viết một hàm đếm số lượng phần tử của danh sách liên kết này.
2. Viết hàm `delete_last(L)` có chức năng xoá phần tử cuối cùng của danh sách liên kết L.
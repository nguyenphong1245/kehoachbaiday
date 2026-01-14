# BÀI 20 THỰC HÀNH
## BÀI TOÁN TIM KIẾM

### SAU BÀI HỌC NÀY EM SẼ:
- Biết được cách đọc dữ liệu từ tệp dữ liệu trong máy tính
- Áp dụng được thuật toán tìm kiếm trong một vài bài toán cụ thể.

Trong bài học trước, các em đã được học cách triển khai thuật toán tìm kiếm tuần tự và tìm kiếm nhị phân; vậy chúng ta có thể áp dụng các thuật toán tìm kiếm đã học vào thực tế như thế nào? Trong các bài toán thực tế, các dữ liệu thường không được viết trực tiếp vào chương trình mà thường được lưu trong các tệp chứa dữ liệu. Ở bài học này, chúng ta sẽ được học cách đọc dữ liệu từ tệp chứa dữ liệu trong máy tính.

### Nhiệm vụ 1. Đọc và ghi tệp trong Python
#### Hướng dẫn:
Để thực hiện được các bài tập thực hành trong sách, em cần biết một số lệnh và thao tác đọc, ghi dữ liệu từ tệp văn bản.

#### a) Đối tượng tệp
Python cho phép đọc, ghi dữ liệu với tệp văn bản (text file) rất dễ dàng. Các tệp đều được mở để đọc và ghi dưới dạng văn bản: Đối tượng tệp được tạo ra bằng lệnh `open()` với các cách như sau:

- **Lệnh mở tệp để đọc:**
```python
open(<file name="">, "r", encoding="UTF-8")
```
Chú ý, tham số `"r"` có thể bỏ qua. Tham số `encoding` dùng khi mở tệp văn bản có mã Unicode; ví dụ tiếng Việt. Nếu không có tham số `encoding` thì chỉ đọc được văn bản có mã ASCII.

- **Lệnh mở tệp để ghi dữ liệu từ đầu:**
```python
open(<file name="">, "w", encoding="UTF-8")
```
Chú ý, tham số `"w"` là bắt buộc.

- **Lệnh mở tệp để ghi tiếp dữ liệu:**
```python
open(<file name="">, "a", encoding="UTF-8")
```
Chú ý, tham số `"a"` là bắt buộc.

Sau khi mở tệp thì có thể tiến hành đọc (hoặc ghi) dữ liệu. Sau khi thực hiện xong các thao tác đọc, ghi thì cần đóng đối tượng tệp bằng lệnh sau:
```python
f.close()
```</file></file></file>



```markdown
## b) Các lệnh đọc dữ liệu từ tệp văn bản

Dữ liệu trong các tệp văn bản được lưu dưới dạng các dòng; mỗi dòng là một xâu ký tự. Sau khi mở tệp bằng lệnh `open()`, con trỏ đọc mặc định ở đầu của tệp sẵn sàng chờ lệnh đọc.

Bảng 20.1 mô tả và minh hoạ kết quả của các lệnh đọc dữ liệu từ đối tượng `f` trong Python với tệp `Data.inp`.

### Bảng 20.1. Các lệnh đọc dữ liệu từ đối tượng f trong Python

| Lệnh đọc dữ liệu | Nghĩa | Kết quả dữ liệu |
|------------------|-------|------------------|
| `readline()`     | Đọc một dòng tiếp theo từ `f`. | Kết quả là từng dòng của tệp `f`. |
| `f.readlines()`  | Đọc toàn bộ dữ liệu tệp, đưa kết quả vào một danh sách (list) | `['Hà 9.6In', 'Binh 8.5In', 'Quang 7.2']` mỗiphần tử là một dòng. |
| `list(f)`       | Đưa toàn bộ nội dung `f` vào list `L`, mỗi dòng là một phần tử. | Lệnh này tương đương nhóm lệnh:
`for line in f:`
`list(f)`
`for line in L:` |

### Ví dụ 1

Với bộ dữ liệu trên; cần đọc và đưa vào hai list là `TenHS` và `DiemHS`. Chương trình sau đọc dữ liệu từ tệp `Data.inp`, đưa dữ liệu vào hai mảng trên và hiển thị kết quả ra màn hình.

```python
fname = "Data.inp"
def NhapDL(fname):
f = open(fname, encoding="UTF-8")
TenHS = []
DiemHS = []
for line in f:
L = line.split()
TenHS.append(L[0])
DiemHS.append(float(L[1]))
f.close()
return TenHS, DiemHS

TenHS, DiemHS = NhapDL(fname)
for i in range(len(TenHS)):
print(TenHS[i], DiemHS[i])
```
```



### c) Ghi dữ liệu ra tệp văn bản

Việc ghi dữ liệu ra tệp văn bản đơn giản nhất là sử dụng lệnh `print()`. Cú pháp lệnh `print()` như sau:

```python
print(<vl>, <v2>, file=&#x3C;đối tượng file>)
```

Chú ý, tham số `file=&#x3C;đối tượng file>` là bắt buộc khi cần đưa dữ liệu ra tệp. Tất cả các tham số khác của lệnh `print()` vẫn có giá trị khi đưa dữ liệu ra tệp.

#### Ví dụ 2
Giả sử có hai mảng `TenHS` và `DiemHS` tương ứng với dữ liệu tên và điểm của các học sinh trong lớp. Chương trình sau ghi những thông tin này ra tệp `Data.out` có định dạng tương tự như `Data.inp`.

```python
fname = "Data.out"
TenHS = ['Hà', 'Bình', 'Quang']
DiemHS = [9.6, 8.5, 7.2]

f = open(fname, 'w', encoding="UTF-8")
for i in range(len(TenHS)):
print(TenHS[i], DiemHS[i], file=f)
f.close()
```

### Nhiệm vụ 2. Viết chương trình tra cứu điểm thi

**Yêu cầu:** Viết chương trình tra cứu điểm thi theo tên các học sinh trong lớp. Chương trình cho phép người dùng nhập tên của học sinh cần tra cứu; sau đó kiểm tra và thông báo điểm số của học sinh cần tìm.

#### Nhập dữ liệu:
Yêu cầu người dùng nhập dữ liệu điểm học sinh từ tệp trên máy tính. Tệp bao gồm nhiều hàng; mỗi hàng gồm tên học sinh và điểm cách nhau bởi dấu cách. Ví dụ tệp có cấu trúc như Hình 20.1.

#### Tra cứu dữ liệu:
Cho phép người dùng nhập tên học sinh cần tra cứu; tìm và in ra màn hình kết quả điểm thi của học sinh đó: Nếu không tìm thấy tên học sinh trong danh sách đã nhập, thông báo "không tìm thấy dữ liệu của học sinh".

### Hướng dẫn:
Phân tích bài toán: Nhiệm vụ này có thể được thực hiện thông qua thuật toán tìm kiếm. Với dữ liệu đầu vào là tên của học sinh, chương trình cần sử dụng thuật toán tìm kiếm để kiểm tra xem tên của học sinh có tồn tại trong danh sách không. Nếu tồn tại thì học sinh cần tìm nằm ở vị trí nào trong danh sách. Do tên học sinh và điểm số được nhập vào danh sách theo cùng một thứ tự, từ vị trí tên học sinh trong danh sách tên, chúng ta có thể suy ra điểm số của học sinh đó trong danh sách điểm.

Chương trình có thể như sau:

```python
input_file = open('diem.inp', encoding='utf8')  # encoding utf8 để đọc được tiếng Việt
```

### Hình 20.1
*Hình minh họa cấu trúc tệp dữ liệu điểm học sinh.*</v2></vl>



# Nhiệm vụ 3: Viết chương trình kiểm tra điểm thi

Yêu cầu: Viết chương trình kiểm tra điểm thi của các học sinh trong một lớp học. Điểm thi của học sinh được ghi trong tệp `diemthi_sx.inp`, trong đó mỗi điểm thi của các học sinh được viết trong một hàng và được sắp xếp theo thứ tự tăng dần. Chương trình đọc dữ liệu điểm thi từ tệp; sau đó cho phép dùng nhập một điểm số cần kiểm tra. Nếu điểm số có tồn tại thì in ra vị trí mà điểm số đó xuất hiện trong tệp; nếu điểm số không tồn tại thì in ra thông báo điểm số không tồn tại. Ví dụ tệp có cấu trúc như Hình 20.2.

## Hướng dẫn:
Phân tích bài toán: Tương tự như Nhiệm vụ 2, nhiệm vụ này vẫn được thực hiện bằng cách sử dụng thuật toán tìm kiếm. Trong nhiệm vụ này, dữ liệu điểm số đã được sắp xếp theo thứ tự tăng dần do đó chúng ta có thể áp dụng thuật toán tìm kiếm nhị phân để gia tăng tốc độ tìm kiếm.

### Chương trình có thể như sau:

```python
def BinarySearch(A, K):
left = 0
right = len(A) - 1
while left &#x3C;= right:
mid = (left + right) // 2
if A[mid] == K:
return mid
elif A[mid] &#x3C; K:
left = mid + 1
else:
right = mid - 1
return -1
```

### Mô tả chương trình:
- `ten_list`: Danh sách chứa tên học sinh.
- `diem_list`: Danh sách chứa điểm thi của học sinh.
- Đọc từng dòng trong tệp và tách tên và điểm.
- Kiểm tra tên học sinh cần tra cứu và in ra điểm số tương ứng.

### Ví dụ:
- Nhập tên học sinh cần tra cứu, nhập từ khóa `end` để kết thúc.
- Nếu tên không tồn tại trong danh sách, in ra thông báo "Không tìm thấy học sinh trong danh sách".
- Nếu tên tồn tại, in ra "Điểm số của học sinh là: [điểm]".



```python
left = mid + 1
else:
right = mid - 1
return -1

input_file = open("diemthi_sx.inp")  # đọc dữ liệu từ file diemthi_sx.inp
ds_diem = []  # khởi tạo danh sách để chứa điểm số đọc từ file
for line in input_file.readlines():
ds_diem.append(float(line))  # lần lượt đọc các dòng của file và đưa vào danh sách điểm thi
input_file.close()

diem = float(input("Nhập điểm số cần kiểm tra: "))
vitri = BinarySearch(ds_diem, diem)  # gọi đến hàm BinarySearch kiểm tra xem có phần tử diem trong danh sách ds_diem hay không
if vitri == -1:
print('Không tồn tại điểm số cần tìm trong danh sách')
else:
print(f'Điểm cần tìm nằm hàng thứ {vitri}, trong danh sách')
```

## LUYÊN TÂP
Chỉnh sửa lại chương trình của Nhiệm vụ 3 để cho phép chương trình có thể tìm kiếm điểm số trên danh sách điểm số được sắp xếp theo thứ tự giảm dần:

## VẬN DỤNG
Viết chương trình tra cứu tên theo điểm thi của học sinh trong lớp. Chương trình cho phép người dùng nhập vào khoảng điểm số cần tìm kiếm (ví dụ từ 6 đến 8). Chương trình kiểm tra và thông báo tên của học sinh có điểm số nằm trong khoảng tương ứng: Giải bài toán trong hai trường hợp: điểm được sắp xếp theo thứ tự ngẫu nhiên như trong Nhiệm vụ hoặc điểm được sắp xếp theo thứ tự tăng dần như sau:

| Tên   | Điểm |
|-------|------|
| Sơn   | 5.6  |
| Huyền | 7.4  |
| Nam   | 7.8  |
| Hùng  | 8.4  |
| Hương | 8.9  |
| Hà    | 9.5  |
```
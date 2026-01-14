# BÀI 14: KIỂU DỮ LIỆU DANH SÁCH

## Mục tiêu
Học xong bài này, em sẽ:
- Nhận biết được sơ lược cấu trúc của kiểu dữ liệu mảng trong các ngôn ngữ lập trình bậc cao.
- Mô tả được kiểu danh sách trong Python có cấu trúc giống như kiểu mảng.
- Viết được câu lệnh trong Python để khởi tạo và truy cập tới các phần tử của danh sách.
- Sử dụng được một số hàm xử lý danh sách thường dùng.

Có nhiều bài toán thực tế cần giải quyết mà trong đó dữ liệu có được ở dạng một bản liệt kê tuần tự (thường gọi là danh sách). Ví dụ: Từ danh sách kết quả một cuộc thi, hãy đưa ra danh sách những người đỗ trong kỳ thi đó. Em hãy đưa thêm ví dụ.

## Kiểu dữ liệu danh sách
Nhiều khi chúng ta cần lưu trữ nhiều phần tử dữ liệu cùng với nhau thành một dãy mà thứ tự của mỗi phần tử dữ liệu là quan trọng. Với những dãy dữ liệu như thế, ta có thể truy cập, xem hoặc thay đổi được một phần tử của dãy khi biết vị trí của nó trong dãy.

### Bảng 1. Nhiệt độ cao nhất ở Hà Nội của các ngày trong tuần

| Ngày       | Thứ Hai | Thứ Ba | Thứ Tư | Thứ Năm | Thứ Sáu | Thứ Bảy | Chủ nhật |
|------------|---------|--------|--------|---------|---------|---------|----------|
| Nhiệt độ °C| 38      | 36     | 37     | 36      | 38      | 38      | 37       |

Nhiều ngôn ngữ lập trình bậc cao cho phép sử dụng kiểu dữ liệu theo cấu trúc mảng. Thay vì nhiều biến riêng lẻ chứa các đại lượng cùng một kiểu dữ liệu, ta có thể dùng một biến kiểu mảng chứa cả dãy các đại lượng đó.

Trong Python, có kiểu dữ liệu danh sách (list) để lưu trữ dãy các đại lượng có thể ở các kiểu dữ liệu khác nhau và cho phép truy cập tới mỗi phần tử của dãy theo vị trí (chỉ số) của phần tử đó. Khi tất cả các phần tử trong danh sách đều có cùng một kiểu dữ liệu thì danh sách đó tương ứng với mảng ở nhiều ngôn ngữ lập trình bậc cao khác. Các phần tử trong danh sách của Python được đánh chỉ số bắt đầu từ 0.



# Ví dụ 1

Thay vì dùng sáu biến kiểu kí tự để lưu trữ tên sáu bạn (Hình 1a), có thể dùng một biến kiểu danh sách (Hình 1b).

| Biến     | Tên bạn        |
|----------|----------------|
| friend1  | Anh Mong'      |
| friend2  | Hinh Hfng      |
| friend3  | Iuyét "ga      |
| friend4  | Tuan Thanh'    |
| friend5  | Anh Quan       |
| friend6  | Thuy Anh       |

Hình 1a. Dùng sáu biến để lưu trữ tên sáu bạn
Hình 1b. Dùng một biến kiểu danh sách

### Các bước thực hiện

1. Viết câu lệnh in ra phần tử thứ ba của danh sách được tạo ở yêu cầu 1.
2. Dùng hàm `type()` kiểm tra lại kiểu dữ liệu của biến vừa tạo ra.
3. Dùng hàm `len()` để biết kích thước của danh sách (độ dài hay số phần tử của danh sách).

### Khởi tạo danh sách

Có nhiều cách khởi tạo danh sách; ba cách trong số các cách đó là:

- Dùng phép gán, ví dụ:
```python
ds = [1, 1, 2, 3, 5, 8]
```
- Dùng câu lệnh lặp `for` gán giá trị trong khoảng cho danh sách; ví dụ:
```python
ds = [i for i in range(6)]
```
- Khởi tạo danh sách số nguyên hay thực từ dữ liệu nhập vào:
```python
ds = [int(i) for i in input().split()]
```

Câu lệnh cho phép nhập một dãy số nguyên trên cùng một dòng:
```python
print("Nhập một danh sách gồm các số nguyên")
a = [int(i) for i in input().split()]
print(a)
```

Hình 2a. Một chương trình nhập danh sách các số nguyên
Hình 2b. Kết quả chạy chương trình ở Hình 2a hay một số dấu cách

Đọc sách tại hoc1O.vn



# Truy cập đến phần tử trong danh sách

Nêu tên danh sách và chỉ số của tử; chỉ số cần đặt trong cặp dấu ngoặc vuông. Chỉ số có thể là một biểu thức số học. Trong Ví dụ 1, với danh sách `friends`; `friends[5]` là tử thứ ba trong danh sách và có giá trị là 'Thuý Anh' (Hình 3).

### Yêu cầu
- Cho biết tử đầu tiên của danh sách `friends`: `friends[0]` là 'Anh Mong'.
- Cho biết tử ở vị trí thứ sáu của danh sách `friends`: `friends[5]` là 'Thuy Anh'.

## Một số hàm và thao tác xử lý danh sách

Hãy hình dung nhóm em dùng một danh sách trong Python để lưu trữ và quản lý danh sách các bạn trong Câu lạc bộ Lập trình của lớp em. Trong tình huống ấy, nhóm em mong muốn Python cung cấp sẵn những công cụ nào ở dạng hàm để dễ thực hiện được việc quản lý danh sách câu lạc bộ?

Bảng dưới đây giới thiệu một số hàm Python cung cấp để người lập trình xử lý danh sách nhanh chóng, thuận lợi. Ngoài ra, còn có nhiều hàm khác nữa có thể dùng trong xử lý danh sách mà lập trình viên có thể dễ dàng tra cứu và tìm hiểu.

### Bảng 2. Một số hàm xử lý danh sách trong Python

| Hàm xử lý danh sách | Nghĩa |
|---------------------|-------|
| `a.append(x)`      | Bổ sung phần tử x vào cuối danh sách a. |
| `a.pop(i)`         | Xoá phần tử đứng ở vị trí i trong danh sách a và đưa ra phần tử này. |
| `a.insert(i, x)`   | Bổ sung phần tử x vào trước phần tử đứng ở vị trí i trong danh sách a. `a.insert(0, x)` sẽ bổ sung x vào đầu danh sách. |
| `a.sort()`         | Sắp xếp các phần tử của danh sách a theo thứ tự không giảm. |

Đọc sách tại hoc O.vn 103



# Ví dụ 2
Hình 3 minh hoạ chương trình Python sử dụng một số để xử lý danh sách:

```
File   Edit   Shell   Debug   Options   Window   Help

22> friends                 'Mai'  'Minh'  'Nga'  'Anh'  'Giang'  'Lan'
2>> friends.append('Hoa')
2>> friends[6]
'Hoa'
2>> friends.pop(2)
'Nga'
>>> friends.insert(0, 'Phan')
7>> friends[0]
'Phan'
>>> friends.sort()
>>> print(friends)
['Anh', 'Giang', 'Hoa', 'Lan', 'Mai', 'Minh', 'Phan']
```

**Hình 3. Một chương trình xử lý danh sách**

## Ghép các danh sách thành một danh sách
Phép được dùng để ghép nối hai danh sách.

# Ví dụ 3
Chương trình ở Hình 4 thực hiện ghép hai danh sách:

```
File   Edit   Shell   Debug   Options   Window   Help

[1, 2, 3]
2>> c = ["Hồng", "Cúc", "Lan", "Mai"]
2>>
7>> print(c)
[1, 'Hồng', 'Cúc', 'Lan', 'Mai']
```

**Hình 4. Chương trình ghép nối hai danh sách**

## Duyệt các tử trong danh sách theo thứ tự lưu trữ
Gọi a là một danh sách; câu lệnh duyệt danh sách có dạng:

```python
for item in a:
# Các câu lệnh xử lý
```

# Ví dụ 4
Hình 5 minh hoạ chương trình và kết quả duyệt danh sách bằng câu lệnh for:

```
File   Edit   Format   Run   Options   Window   Help
[4, 1, 4, 2, 2, 5]
for i in a:
(i * i)
print()
```

**Hình 5. Chương trình duyệt danh sách bằng câu lệnh for**

Đọc sách tại hoc1O.vn



# Bài 1
Đọc chương trình sau đây và cho biết kết quả in ra màn hình. Em hãy soạn thảo và chạy chương trình để kiểm tra dự đoán của em.

```python
ds = [int(i) for i in input().split()]
sonho = 0
for i in ds:
if i &#x3C;= 100:
sonho += i
print(sonho)
```

# Bài 2
Bạn Thanh muốn tính trung bình cộng của nhiệt độ trung bình các ngày trong tuần. Thanh đã viết đoạn chương trình tính nhiệt độ trung bình của bảy ngày trong tuần vào một danh sách (Hình 6). Em hãy giúp bạn Thanh viết tiếp những câu lệnh còn thiếu vào chỗ trống để máy tính đưa ra màn hình kết quả.

```python
nh = [float(i) for i in input().split()]
tb = sum(nh) / 7
print("Nhiệt độ trung bình:", tb)
```

Hình 6: Chương trình tính nhiệt độ trung bình của bảy ngày trong tuần.

----

Camera đặt cạnh trạm thu phí đường cao tốc ghi nhận nhiều thông tin, trong đó có mã số nhận dạng loại ô tô qua. Mỗi loại ô tô được mã hóa thành một số nguyên dương. Cho dãy số, mỗi số là mã hóa về loại của một ô tô đi qua trạm thu phí. Em hãy viết chương trình nhập dãy số mã hóa xe vào từ bàn phím và đưa ra màn hình số loại xe khác nhau đã được nhận dạng.

**Ví dụ:**

| INPUT                     | OUTPUT |
|---------------------------|--------|
| 2 4 2 5 4 5 2 5 4 5 5     | 4      |

----

Trong các câu sau đây, những câu nào đúng?
1) Trong các ngôn ngữ lập trình bậc cao đều có kiểu dữ liệu để lưu trữ một dãy hữu hạn các phần tử.

Đọc sách tại học O.vn 105



# Trong ngôn ngữ lập trình Python

1) Dữ liệu kiểu danh sách là một dãy hữu hạn các phần tử cho phép truy cập đến từng phần tử của nó.

2) Python bắt buộc các phần tử của một danh sách phải có cùng một kiểu dữ liệu.

3) Phải khởi tạo một danh sách trong Python bằng phép gán trong chương trình; không thể nhập các phần tử của danh sách từ bàn phím.

4) Python chỉ cung cấp những hàm sau đây để xử lý danh sách:
- `append()`
- `pop()`
- `insert()`
- `sort()`
- `clear()`

## Tóm tắt bài học

Trong Python, list là kiểu dữ liệu có cấu trúc dùng để nhóm một tập dữ liệu thành một dãy giá trị được đánh số và có thể truy cập đến từng giá trị. Có thể khởi tạo cho list trong Python bằng cách gán trực tiếp hoặc nhập giá trị các phần tử vào từ thiết bị vào chuẩn.

Python cung cấp nhiều thao tác hữu dụng trên list; một số hàm dùng là:
- `len()`
- `append()`
- `pop()`
- `insert()`
- `sort()`

## BÀI TÌM HIỂU THÊM

### NHẬP DANH SÁCH TỪ FILE

Có thể nhập một danh sách từ file như chương trình ở Hình 7. Nếu danh sách cần xử lý rất dài thì chúng ta sẽ thấy được rõ tính ưu việt của việc nhập dữ liệu từ file. Ví dụ chương trình dưới đây nhập danh sách các số nguyên từ file `input.txt` và ghi tổng các số nguyên đó ra file `output.txt`.

```python
import sys
fo = open("output.txt", "w", encoding="utf-8")
a = [int(i) for i in sys.stdin.read().split()]
print(sum(a), file=fo)
fo.close()
```

Hình 7. Minh họa chương trình nhập danh sách từ file.
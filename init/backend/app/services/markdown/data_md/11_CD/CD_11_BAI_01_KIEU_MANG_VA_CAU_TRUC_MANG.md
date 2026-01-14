# CHỦ ĐỀ Fcs

## IHUẬI LaP IRINHI

### BÀI  KẾT CẤU MẢNG VÀ CẤU TRÚC MẢNG

Học xong bài này; em sẽ:
- Trình bày được cấu trúc dữ liệu mảng một chiều.
- Biết và sử dụng được một số hàm có sẵn trong Python để thao tác với biến kiểu mảng.

Khi lập trình Python; nếu cần xử lý một dãy số thì em dùng kiểu dữ liệu gì?

### Biến mảng và cấu trúc mảng

Xét bài toán phân tích kết quả học tập cuối năm của một lớp. Ví dụ: Lớp IA có 45 học sinh. Đầu vào là bảng điểm tổng kết của tất cả học sinh trong lớp; có các cột:
- Họ và tên
- Điểm Toán
- Điểm Ngữ văn
- Điểm Tin học

Cần viết chương trình máy tính cho biết các kết quả như: điểm trung bình mỗi môn học, điểm cao nhất từng môn học, họ và tên học sinh đạt được điểm cao nhất đó.

Mỗi cột điểm môn học là một dãy số thực gồm 45 số. Hầu hết các ngôn ngữ lập trình bậc cao đều có sẵn kiểu dữ liệu mảng (array) phù hợp để chứa một dãy số nguyên hay dãy số thực có độ dài định trước.

### Khai báo mảng một chiều

Khai báo tức là cung cấp đủ các thông tin: tên biến mảng; kiểu dữ liệu, kích thước.

**Ví dụ:**
- Tên biến mảng: `diemTin`
- Kiểu dữ liệu của mảng: Số thực.
- Kích thước: 45

### Tổ chức mảng một chiều

Trong bộ nhớ, mảng một chiều được lưu trữ thành một khối các ô nhớ liên kề liên tục, dung lượng bằng tích kích thước và độ dài kiểu dữ liệu. (Hình 1). Ví dụ, nếu để lưu trữ một số thực (float) cần dung 32 bit (4 byte) thì mảng 10 gồm 10 phần tử trong bộ nhớ sẽ chiếm 40 byte.

Đọc bản mới nhất trên hoc10 vn. Bản sách mẫu.



# Mảng

Mảng được đánh chỉ số từ 0 đến n - 1.

## Phần tử

Có kích thước n thì các phần tử mảng:

| Tên mảng   | diemTin[0] | diemTin[1] | diemTin[2] | diemTin[3] | diemTin[4] |
|------------|-------------|-------------|-------------|-------------|-------------|
| Giá trị    | 7.5        | 5.0        | 8.5        | 4.3        | 5.0        |

### Hình

Phần đầu của mảng diemTin (5 phần tử) trong bộ nhớ.

Có thể hình dung bộ nhớ RAM là một dãy bit rất dài, chia thành nhiều ô nhớ liên nhau. Mỗi ô nhớ được đánh số gọi là địa chỉ truy cập. Tùy theo cách tổ chức bộ nhớ cho chương trình máy tính, một ô nhớ có thể dài 1 byte, 2 byte hay 4 byte.

- Một số nguyên (integer) có thể chiếm 1 byte hoặc 2 byte.
- Một số thực (float, double) có thể chiếm 4 byte hoặc 8 byte.

Để dễ minh họa với mảng số thực, ta coi một ô nhớ chứa giá trị một số thực.

## Truy cập ngẫu nhiên

Các thông tin có trong khai báo mảng sẽ được máy tính dùng để xác định độ lớn phần bộ nhớ dành cho một biến mảng. Nó cũng cho phép tìm được vị trí chính xác của từng phần tử trong mảng khi biết chỉ số tương ứng.

Ví dụ, nếu mảng diemTin được lưu trữ trong bộ nhớ bắt đầu từ địa chỉ A thì chỉ số phần tử mảng `diemTin[i]` sẽ được lưu trữ tại ô nhớ cách vị trí bắt đầu của mảng đúng ô nhớ. Địa chỉ ô nhớ chứa `diemTin[3]` sẽ là \( A + 3 \). Máy tính tìm ngay được địa chỉ này. Nếu mảng rất dài, ví dụ gồm 10,000 phần tử thì máy tính cũng tìm ngay được địa chỉ phần tử chỉ số i bất kỳ theo cách tính trên.

Mảng được sử dụng nhiều vì thời gian truy cập để đọc giá trị hay gán giá trị mới cho một phần tử bất kỳ (đã cho biết chỉ số) là hằng số.



# Mảng một chiều trong Python

Cú pháp khai báo mảng một chiều trong Python như sau:

Khai báo sử dụng mô đun `array` đầu chương trình.
Khai báo biến kiểu mảng theo mẫu dưới đây:

```
mang       = array('i', [...])
mang_2     = array('f', [...])
```

Trong đó:
- Kí tự `'i'` là viết tắt của `integer`;
- Kí tự `'f'` là viết tắt của `float`.

Thay cho dấu `[...]` ở dòng thứ nhất là một danh sách các số nguyên trong mảng.
Thay cho dấu `[...]` ở dòng thứ hai là một danh sách các số thực trong `mang_2`.

Hình 2 là một ví dụ khai báo mảng trong Python kèm giải thích câu lệnh.

```python
# Khai báo sử dụng mô đun array đầu chương trình
from array import array

# Khai báo mảng số nguyên, tên là mangNguyen
mangNguyen = array('i', [1])

# Khai báo mảng số thực, tên là mangThuc
mangThuc = array('f', [8, 5, 4, 5, 5.0])
```

**Hình 2. Ví dụ khai báo mảng trong Python**

## Dùng danh sách Python làm mảng

Có thể dùng kiểu danh sách của Python làm mảng một chiều. Không những thế, kiểu danh sách linh hoạt hơn nhiều và có thêm một số hàm (chính xác hơn là các phương thức) mà kiểu mảng không áp dụng được.

Danh sách dùng làm mảng được khai báo và sử dụng như một danh sách Python thông thường.

Em hãy khám phá các phép toán cơ sở với mảng trong Python; sao chép lại và chạy thử các câu lệnh ở Hình 3 và Hình 4; thêm dần từng dòng lệnh sau đó thực hiện các công việc sau:
1. Đoán trước kết quả và chạy chương trình để kiểm tra.
2. Xem kết quả và cho biết có sự tương tự giữa mảng với danh sách hay không.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Fornal Options Window Mclu

```python
from array import array
mangNguyen = array([2, 5, 4, 3, 1])
mangThuc = array([7.5, 5.0, 8.5, 4.5, 5.0])
dsNguyen = [2, 5, 4, 3, 1]
dsThuc = [7.5, 5.0, 8.5, 4.5, 5.0]

# Đọc giá trị; gán giá trị cho phần tử mảng và danh sách tương tự nhau
print(dsNguyen[1])
print(mangNguyen[2])
mangThuc[3] = 7.0
print(mangThuc[3])
print(dsThuc)
mangNguyen[3] = 3.5  # Bảo 101 5a1 kiểu phần
dsNguyen[3] = 3.5
print(mangThuc[3])  # In
```

### Hình 5: Ví dụ sử lý mảng một chiều

```python
# Hàm sorted() để sắp xếp mặc định theo thứ tự tăng dần
# Dãy sau kết quả bản sao khác; dãy 50 bản đầu giữ nguyên
print(sorted(mangThuc))
print(mangThuc)

# Phương thức sort() không dùng được cho mảng
mangThuc.sort()

# Hàm tolist() chuyển mảng thành danh sách, sau đó mới áp dụng sort
mangThuc.tolist()
sort()
print(ds)
```

### Hình: Minh họa về hàm không áp dụng được cho mảng

Có thể dùng kiểu mảng hay kiểu danh sách của Python để biểu diễn mảng một chiều.

## Một số hàm gộp và hàm phân tích thống kê

Các hàm gộp `max`, `min`, `sum` đã có sẵn và có thể sử dụng ngay cho kiểu mảng cũng như kiểu danh sách. Python có một số hàm phân tích thống kê áp dụng cho kiểu mảng và kiểu danh sách các số. Để sử dụng các hàm trong mô đun này cần khai báo mô đun statistics ở đầu chương trình theo cú pháp như sau:

```python
from statistics import *
```

Đọc bản mới nhất trên hoc10.vn    Bản sách mẫu



# Khám Phá Các Hàm Gộp và Hàm Phân Tích Thống Kê

Em hãy khám phá các hàm gộp và hàm phân tích thống kê (tham khảo Hình 5). Thử áp dụng từng hàm với mảng và với danh sách rồi quan sát kết quả.

## Các Hàm Phân Tích Thống Kê

| Tên hàm | Chức năng |
|---------|-----------|
| `print(mean(mangThuc))` | Trả về trung bình cộng phần tử |
| `print(median(dsThuc))` | Trả về từng vị trí |
| `print(mode(mangThuc))` | Trả về giá trị xuất hiện nhiều lần nhất trong dãy số |

Hình 5: Một số hàm phân tích thống kê

### Câu Hỏi

1. Hãy kể tên một số hàm Python áp dụng được cho cả danh sách và mảng.
2. Hãy kể tên một hàm Python áp dụng cho danh sách nhưng không áp dụng cho mảng.

Cho `dienTin` là dãy điểm tổng kết môn Tin học của lớp HA. Lập trình đưa ra màn hình các phân tích thống kê: điểm cao nhất, điểm thấp nhất, điểm trung bình, dãy điểm sắp xếp theo thứ tự từ cao xuống thấp.

**Gợi ý:** Hàm `sorted` có lựa chọn sắp thứ tự giảm dần.

**Cú pháp:**

```python
sorted(biến_mang, reverse=True)
```

### Câu Hỏi

1. Khai báo mảng là cung cấp thông tin gì?
2. Nói thời gian thực hiện câu lệnh là hằng có nghĩa là gì?

## Tóm Tắt Bài Học

Mảng là một tập hợp các phần tử có kiểu dữ liệu, được lưu trữ thành một khối nhiều ô nhớ liền kề trong bộ nhớ. Các phần tử mảng được đánh chỉ số tuần tự và có thể truy cập ngẫu nhiên với thời gian hằng số.

Trong Python, mảng và danh sách có nhiều điểm tương tự; có thể dùng danh sách thay cho mảng.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.
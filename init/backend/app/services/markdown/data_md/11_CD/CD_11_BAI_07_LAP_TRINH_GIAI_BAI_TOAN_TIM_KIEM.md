# BÀI LẬP TRÌNH GIẢI BÀI TOÁN TÌM KIẾM

Học xong bài này, em sẽ:
- Phát biểu được bài toán tìm kiếm.
- Viết được chương trình cho một số thuật toán tìm kiếm.
- Vận dụng được quy tắc thực hành xác định được độ phức tạp của một vài thuật toán tìm kiếm đơn giản.

Khi tạo mới một tài khoản người dùng, em được yêu cầu nhập tên người dùng. Có trường hợp em phải nhập lại tên khác vì tên vừa nhập đã có người sử dụng rồi. Theo em, máy tính làm gì ngay sau khi nhận được yêu cầu tạo mới một tài khoản? Hãy phát biểu thành một bài toán.

## Bài toán tìm kiếm

### Khái niệm bài toán tìm kiếm
Các ví dụ thực tế dẫn đến bài toán tìm kiếm:
- Cho mã cuốn sách hãy tìm cuốn sách trong kho sách của thư viện.
- Tìm một tên người dùng, lên hàng hóa trong danh sách liệt kê.
- Tìm bản ghi có khóa là k trong bảng T của một cơ sở dữ liệu.

Nghĩa chung nhất, bài toán tìm kiếm là: Cho một yêu cầu tìm kiếm và một tập hợp dữ liệu là phạm vi tìm kiếm. Tìm mục (các mục) dữ liệu đáp ứng yêu cầu đó.

Tùy theo yêu cầu và phạm vi tìm kiếm mà bài toán tìm kiếm là dễ hay khó. Một nhiệm vụ của máy tìm kiếm trên Internet nhằm giải quyết bài toán tìm kiếm có phạm vi kiếm là dữ liệu văn bản (hình ảnh hoặc giọng nói) trên Internet.

### Tìm kiếm tuần tự bằng hàm của Python
Python có phương thức `index` thực hiện tìm kiếm phần tử x trong một dãy tuần tự (xâu ký tự, mảng hoặc danh sách) và trả về chỉ số của lần xuất hiện đầu tiên nếu xuất hiện nhiều lần.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Giáo Trình Học Tập

## Phương thức `index`

Phương thức `index` có hai tham số tùy chọn để hạn chế thực hiện tìm kiếm chỉ trong đoạn con của dãy số, bắt đầu từ chỉ số `low` và kết thúc ở `high`. Cú pháp:

```python
day_s8.index(gia_tri, low, high)
```

### Ví dụ

Với mảng:

```python
a = [1, 2, 3, 4, 5, 6]
```

Câu lệnh:

```python
print(a.index(3, 1, 4))
```

sẽ in ra màn hình kết quả là `2`, cho biết vị trí của phần tử `3` trong đoạn `[1, 4]` ở mảng `a`.

## Thuật toán tìm kiếm tuần tự

### Chi tiết từng bước thuật toán tìm kiếm tuần tự

Hình 1 mô tả các bước của thuật toán tìm kiếm tuần tự với một số `x`:

1. **Số đang xét** là số ở đầu dãy.
2. **Lặp** khi chưa hết dãy số:
- Nếu **Số đang xét** là `x`:
- Thông báo vị trí tìm thấy `x` và kết thúc.
- **Hết nhánh**.
3. **Hết lặp**.
4. Thông báo không tìm thấy `x` và kết thúc.

### Hình 1: Thuật toán tìm kiếm tuần tự

```python
i = 0  # Số đang xét là số ở đầu dãy
while (i &#x3C; n):  # (1 &#x3C; n) tức là chưa hết dãy số
if a[i] == x:  # Chuyển đến xét số tiếp theo
return i  # Đã tìm thấy
i += 1
return -1  # Không tìm thấy
```

### Hình 2: Kết quả thay thế

Đọc bản mới nhất trên hoc10.vn.



# Thuật toán tìm kiếm nhị phân

Dựa trên mô tả thuật toán tìm kiếm nhị phân cho Hình 3, em hãy nêu tóm tắt ý tưởng của thuật toán này.

Nếu dãy số đã sắp thứ tự thì có thể áp dụng thuật toán tìm kiếm nhị phân như mô tả trong Hình 3:

## Xuất phát:
- Phạm vi tìm kiếm là dãy ban đầu.

## Lặp khi vẫn còn phạm vi tìm kiếm:
1. Xác định phần tử ở giữa phạm vi tìm kiếm.
2. Nếu \( x = 0 \):
- Thông báo tìm thấy \( x \) ở vị trí \( m \) và kết thúc.
3. Trở lại:
- Nếu không:
- Loại bỏ nửa dãy chắc chắn không chứa \( x \).
- Phạm vi tìm kiếm là nửa dãy con còn lại.
4. Hết nhánh.

## Hết lặp:
- Thông báo không tìm thấy \( x \) và kết thúc.

### Hình 1: Liệt kê các bước của thuật toán tìm kiếm nhị phân sắp thứ tự tăng dần (không giảm).

### Hình 4: Minh họa cho dãy số.

- Chắc chắn nửa đầu dãy không chứa \( x \); loại bỏ bớt.
- Chắc chắn nửa cuối dãy không chứa \( x \); loại bỏ bớt.

### Tinh 4: Sơ đồ một bước thuật toán tìm kiếm nhị phân.

Hướng dẫn viết mã giả của thuật toán tìm kiếm nhị phân:
- Xác định các cụm từ cần làm chi tiết hơn bằng mã giả:
- "Phạm vi tìm kiếm là dãy ban đầu": "Vẫn còn phạm vi tìm kiếm".
- "Xác định phần tử ở giữa phạm vi tìm kiếm".



# Loại bỏ nửa dãy chắc chắn

Phạm vi tìm kiếm là nửa dãy còn lại.
Thông không không chứa x,
bảo tìm thấy x và kết thúc.
Bổ sung thêm 10 là chỉ số con và hi là chỉ số.

## Công thức tính chỉ số m của phần tử ở đoạn con

Công thức tính chỉ số m của phần tử ở đoạn con là \(\frac{lo}{h1}/2\), kết quả đảm bảo là số nguyên.

## Thực hành lập trình giải bài toán tìm kiếm

### Nhiệm vụ 1

Em hãy thực hiện các yêu cầu sau:

1. Viết mã giả cho thuật toán tìm kiếm nhị phân.
2. Ước lượng số lần thực hiện vòng lặp trong thuật toán tìm kiếm nhị phân.
3. Ước lượng độ phức tạp thời gian của thuật toán tìm kiếm nhị phân.

**Hướng dẫn:** Sau lần chia đôi đầu tiên, phạm vi tìm kiếm còn lại 2 số; sau khi chia đôi lần thứ hai, dãy còn lại 1 số; sau khi chia đôi lần thứ ba, dãy còn lại 0 số. Kết thúc khi \(2^n\).

### Nhiệm vụ 2

Em hãy thực hiện các yêu cầu sau:

a) Viết chương trình Python thực hiện tìm kiếm tuần tự.
b) Viết phiên bản tìm kiếm tuần tự thứ hai, dùng vòng lặp for thay cho vòng lặp while (hoặc ngược lại).
c) Viết phiên bản tìm kiếm tuần tự có thêm hai tham số đầu vào là lo và hi tương tự như của hàm index. So sánh kết quả với phương thức index của Python.

### Nhiệm vụ 3

Viết hàm thực hiện tìm kiếm nhị phân nhận hai tham số đầu vào: dãy số và giá trị x cần tìm.
Viết chương trình tìm kiếm vị trí tên của một người trong mỗi danh sách sau đây:

a) Danh sách học sinh của lớp em (không dấu) và đã sắp xếp.
b) Danh sách tên các chủ tài khoản ngân hàng (kí tự tự theo bảng chữ cái).

## Câu hỏi

Câu 1. Em hãy nêu ra một vài ví dụ về bài toán tìm kiếm trong thực tế.
Câu 2. Theo em, với dãy đã sắp xếp và cho một số x cụ thể:

a) Trường hợp nào tìm kiếm tuần tự nhanh hơn tìm kiếm nhị phân?
b) Về trung bình, thuật toán tìm kiếm tuần tự hay thuật toán tìm kiếm nhị phân tốt hơn?

----

Đọc bản mới nhất trên hoc10.vn
Bản sách mẫu



# Tóm tắt bài học
- Thực hiện tìm kiếm tuần tự bằng phép lặp duyệt từ đầu dãy số với điều kiện dừng khi "tìm thấy" hoặc "đã xét hết dãy số".
- Phép lặp thực hiện tìm kiếm nhị phân chia đôi dãy số tại điểm "giữa" có chỉ số \( \frac{(10 + h1)}{2} \) bỏ bớt nửa dãy cho đến khi "tìm thấy" hoặc hết dãy.

## BÀI TÌM HIỂU THÊM

### CÁC THAM SỐ TÙY CHỌN CHO MỘT HÀM
- Các hàm thực hiện tìm kiếm của Python đều có các tham số tùy chọn \( 10 \) và \( hi \).
- Xác định một phạm vi tìm kiếm là đoạn con của dãy số đầu vào. Ta đã viết các hàm tìm kiếm có thêm hai tham số \( 10 \) và \( hi \) có vai trò tương tự. Tuy nhiên, đây không phải là những tham số tùy chọn vì chúng bắt buộc phải có trong lời gọi sử dụng các hàm này. Làm thế nào để chúng trở thành tùy chọn?
- Một pháp là dùng bộ (tuple) các tham số `*args` trong định nghĩa hàm.

1. Dấu sao (*) là ký hiệu toán tử, sau dấu là một tên bộ, gộp nhiều tham số. Có thể thông thường thấy tên bộ `args` chỉ là.
2. Quy định `*args` phải dùng tất cả các tham số bắt buộc của hàm.

Theo mẫu trong Hình 5, thể định nghĩa các hàm có tham số tùy chọn.

```python
def timKiemNhiPhan(a, *args):
# Nếu có đủ 2 tham số trong args
if len(args) == 2:
lo = args[0]
hi = args[1]
# Nếu không có trong lời gọi hàm
else:
# Giá trị mặc định
lo = 0
hi = len(a) - 1

while (lo &#x3C;= hi):
# Logic tìm kiếm
```

### Hình
Một hàm tự định nghĩa có tham số tùy chọn.

Đọc bản mới nhất trên hoc10.vn                                           Bản sách mẫu
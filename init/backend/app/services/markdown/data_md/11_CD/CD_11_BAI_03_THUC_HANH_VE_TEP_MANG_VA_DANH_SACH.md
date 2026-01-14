# THỰC HÀNH VỀ TỆP, MẢNG VÀ DANH SÁCH

Học xong bài này; em sẽ:
- Sử dụng được lát cắt để xử lý mảng; danh sách theo ý muốn
- Biết và sử dụng được một số hàm xử lý tệp dữ liệu đầu vào, đầu ra

## Nhiệm vụ 1. Lát cắt

### Yêu cầu:
Cho `a` là mảng (danh sách) các số. Hãy dùng lát cắt tạo danh sách `b` và dùng vòng lặp `for in` kết quả ra màn hình (xem mẫu ở Hình 1) để kiểm tra kết quả trong mỗi trường hợp sau:

```python
b = a[.. . ]
print(x)  # Thay dấu bẳng mệt danh sách các
```

- b là nửa cuối của `a`
- b là một phần tử kề từ đầu trái của `a`
- b là các phần tử chỉ số lẻ của `a`

### Gợi ý:
Toán tử lát cắt (Hình 2) trích ra đoạn con liền mạch hay dãy con (có bước nhảy `step` cách quãng) từ một dãy tuần tự nhiều mục dữ liệu, ví dụ như một biển kiểu danh sách.

| Cú pháp          | Mô tả                                                                 |
|------------------|-----------------------------------------------------------------------|
| `a[lo:hi]`       | Cắt đoạn con, từ chỉ số `lo` đến chỉ số `hi-1`.                     |
| `a[:hi]`        | Cắt đoạn đầu danh sách (mặc định `lo=0`) đến chỉ số `hi-1`.         |
| `a[lo:]`        | Cắt đoạn cuối danh sách từ vị trí `lo` đến cuối danh sách.          |
| `a[lo:hi:step]` | Cắt danh sách con, từ chỉ số `lo` đến chỉ số `hi-1`, với bước nhảy `step`. |

### Hình 1. Mẫu xử lý dùng vòng lặp for

### Hình 2. Các lát cắt

----

## Nhiệm vụ 2. Ma trận

Cho `a` là ma trận (bảng số) hình vuông (dùng lát cắt khi có thể) để in kết quả ra màn hình và kiểm tra kết quả trong mỗi trường hợp sau:
- Hai phần tử đầu tiên của hàng đầu tiên của `a`.
- Hai cột đầu tiên của `a`.
- Các cột chỉ số lẻ của `a`.

----

Đọc bản mới nhất trên hoc10.vn                                             Bản sách mẫu



# Lưu ý
Nếu bước nhảy `step` nhận giá trị âm thì toán tử lát cắt sẽ đảo chiều, đi từ
cuối danh sách lên đầu danh sách, từ phải sang trái, kết quả nhận được giống như
phương thức `reverse()` (xem ví dụ Hình 3).

```python
dsLui = ds[::-1]  # dsLui = [2, 1]
```

## Hình
Ví dụ về lát cắt

### Nhiệm vụ 2. Vòng lặp
Chiều hình lương hàng và cột các số thực.

**Yêu cầu:** Cho `a` là mảng hai chiều gồm:

Hãy tính:
1. Tổng phần tử chỉ số chẵn ở hàng các phần tử của `a`.
2. Tổng các phần tử âm; trong các không âm hàng phần tử của `a`.
3. In ra chỉ số các phần tử.

**Gợi ý:** Vòng lặp `for` hoặc `while` duyệt qua các phần tử trong danh sách `a` và thân vòng lặp có thể xử lý lần lượt tất cả các phần tử hoặc chọn một số phần tử thỏa mãn điều kiện nào đó: theo chỉ số hoặc theo giá trị.

### Nhiệm vụ 3. Đọc dữ liệu từ tệp đầu vào và viết ra tệp
**Yêu cầu:**
Cho tệp "bangDiem.txt" gồm nhiều dòng; các mục dữ liệu cách nhau khoảng trống:
- Dòng thứ nhất: Hai số nguyên dương `n` và `m`: với `n` là số học sinh, `m` là số môn học.
- Dòng thứ hai: Tên HS Toán Văn Tin... gồm `(m + 1)` trường.
- Dòng tiếp theo, dòng có tên học sinh và điểm các môn học của học sinh đó.

Hãy viết một hàm `nhapTuTep()` để đọc tệp dữ liệu đầu vào `bangDiem.txt` khởi tạo dữ liệu sẵn sàng để tính toán phân tích kết quả học tập:
1. Một mảng hai chiều `n x m` các số thực.
2. Hai danh sách: danh sách tên học sinh và danh sách tên môn học.

**Hướng dẫn thực hiện:**
- Có thể tạo tệp "bangDiem.txt" bằng cách chỉnh sửa và bổ sung bảng trong Hình 1a ở Bài 2: từ Word hay Excel. Thao tác Copy/Paste vào cửa sổ của Notepad hay của sổ soạn thảo của Python: ghi lưu thành tệp có định dạng text.
- Đọc từng dòng tệp đầu vào.
- Chuyển đổi mỗi mục của danh sách sang kiểu dữ liệu cần thiết và nối thêm vào danh sách tương ứng trong chương trình (tham khảo chương trình ở Hình 4).

Đọc bản mới nhất trên hoc10.vn                                       Bản sách mẫu



# Các thao tác với tệp dữ liệu

## Đầu vào
Là tệp thuần văn bản chữ và số (đuôi tên tệp "txt") gồm nhiều dòng: mỗi dòng gồm nhiều tử, mỗi tử là một mục dữ liệu, phân cách bằng khoảng trắng.

### Các bước thực hiện như sau:

### Bước 1: Mở tệp để đọc/viết
Sử dụng hàm `open()` như ví dụ ở Hình 5.

```python
open(name, mode)  # name là đường dẫn tên tệp
# mode = "r" mở để đọc (đây là trường hợp mặc định)
# mode = "w" mở để viết vào; mode = "a" mở để viết thêm
```

![Hình 5. Cách mở tệp để đọc, viết và viết thêm](#)

### Bước 2: Đọc từ tệp
Có thể dùng các phương thức `read()`, `readline()`, `readlines()` kết hợp với `split()`.

- `read().split()`: Đọc từng từ và nối toàn bộ các từ thành một danh sách.
- `readline().split()`: Đọc một dòng trả về danh sách các từ thường.
- `readlines()`: Đọc toàn bộ tệp; trả về danh sách các dòng, mỗi dòng là một xâu ký tự, kết thúc bằng ký tự xuống dòng.

### Bước 3: Xuất ra tệp thuần văn bản
Có thể sử dụng hàm `print()` khi đã chuyển đầu ra chuẩn từ màn hình sang tệp đã mở để viết vào như sau:

```python
sys.stdout  # f: tên biến tệp để viết vào
```

### Bước 4: Đóng tệp
Sử dụng phương thức `close()`.

**Lưu ý:** Nếu giữa các tử được phân cách nhau bằng dấu phẩy thì ta có tệp kiểu CSV (comma separated value) và để cắt ra dùng `split(',')` thay vì dạng mặc định `split()`.

----

## Ví dụ câu lệnh thêm một hàng vào mảng

Trong Python, nếu một dòng có nhiều mục khác kiểu dữ liệu, cách nhau - thì phải truy cập từng phần tử của danh sách và chuyển từ xâu ký tự thành kiểu dữ liệu đúng.

```python
for i in range(n):
hang = [float(d) for d in dong]
a.append(hang)  # Thêm một hàng vào mảng a
```

----

## Tóm tắt
- Mở tệp với `open()`.
- Đọc tệp với `read()`, `readline()`, `readlines()`.
- Xuất ra tệp với `print()`.
- Đóng tệp với `close()`.
- Sử dụng `split(',')` cho tệp CSV.



# Đọc và viết tệp văn bản có chữ tiếng Việt

Một số kí tự trong tiếng Việt không có trong bảng mã ASCII. Để đọc, viết tệp văn bản có chữ tiếng Việt hay các văn bản nói chung, cần sử dụng các ký tự không phải ASCII, thì cần thêm tham số tùy chọn `encoding = utf-8` vào các hàm xử lý tệp.

## Tạo dãy số thực ngẫu nhiên

Sử dụng các hàm `mean`, `median`, `mode` trong mô-đun `statistics` để:
1. Tìm mean của a và đếm số phần tử bé hơn, bằng, lớn hơn mean.
2. Tìm median của a và cho biết đó là phần tử nào hay nó ở giữa hai phần tử nào.
3. Tìm mode của a và cho biết số lần xuất hiện và dãy các chỉ số tương ứng.
4. Áp dụng để phân tích dãy điểm môn học của lớp HIA.

# BÀI Tìm hiểu Thêm

## LIỆT KÊ MỘT SỐ 50 PHƯƠNG THỨC TRONG PYTHON

Python sẵn nhiều phương thức áp dụng cho kiểu danh sách. Bảng dưới đây liệt kê một số phương thức chưa được thực hành nhiều. Ký hiệu `ds` là tên của một biến kiểu danh sách.

| Phương thức                | Kết quả                                      |
|----------------------------|----------------------------------------------|
| `ds.clear()`               | Xóa toàn bộ ds                              |
| `ds.copy()`                | Tạo bản sao của ds                          |
| `ds.reverse()`             | Đảo ngược vị trí các phần tử trong ds      |
| `ds.sort()`                | Sắp xếp ds theo thứ tự tăng dần            |
| `ds.append(x)`             | Thêm một phần tử x vào cuối ds             |
| `ds.extend(ds2)`           | Nối thêm danh sách ds2 vào cuối ds         |
| `ds.index(x)`              | Tìm vị trí xuất hiện của phần tử x trong ds|
| `ds.count(x)`              | Đếm số lần xuất hiện phần tử x trong ds    |
| `ds.insert(i, x)`          | Chèn thêm x thành phần tử chỉ số i trong ds|
| `ds.pop(i)`                | Gỡ bỏ tử chỉ số i                          |
| `ds.clear(i)`              | Xóa các phần tử bắt đầu từ vị trí i đến hết ds|
| `ds.remove(x)`             | Xóa phần tử x gặp đầu tiên trong ds        |

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.
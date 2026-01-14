# BÀI 11: THỰC HÀNH LẬP TRÌNH VỚI HÀM VÀ THƯ VIỆN

Học xong bài này, em sẽ:
- Chạy và kiểm thử được chương trình.
- Rèn luyện được kĩ năng viết chương trình có khai báo và gọi hàm.
- Tìm hiểu và sử dụng được hàm `time` có trong thư viện.

## Khai báo hàm Giải phương trình bậc nhất GPTB1
## Khai báo hàm Giải phương trình bậc hai GPTB2

Tạo bảng chọn việc:
```python
while True:
print("****")
print("BẢNG CHỌN VIỆC")
print("1. Giải phương trình bậc nhất")
print("2. Giải phương trình bậc hai")
print("3. Thoát khỏi công việc")
print("****")
chon = input("Hãy chọn: ")
if chon == "1":
print("Giải phương trình bậc nhất")
# gọi hàm GPTB1
elif chon == "2":
print("Giải phương trình bậc hai")
# gọi hàm GPTB2
else:
print("Tạm biệt!")
break
```

## Bài 2: Thời gian gặp nhau

Hẹn tái, alu tral Kaml Namn đang ở thành phố A còn em gái Sương Mai đang ở thành phố B. Khoảng cách giữa hai thành phố đó là d km: Hai anh em đi ô tô xuất phát từ A về B với tốc độ không đổi cùng một thời điểm từ hai thành phố, v1 km/h, ô tô khởi hành từ B đi đến A với tốc độ không đổi v2 km/h; trong đó d, v1, v2 là các số thực.

Chương trình ở Hình 2 khai báo hàm `mtime` với các tham số d, v1, v2 để xác định thời gian hai ô tô gặp nhau tính từ lúc xuất phát. Em hãy:
- Hoàn thiện chương trình ở Hình 2 bằng cách bổ sung cho chương trình lời gọi hàm `mtime` với dữ liệu nhập từ bàn phím.
- Chạy chương trình với ít nhất hai bộ dữ liệu vào khác nhau.

### Hướng dẫn:
Viết hàm `mtime` với tham số d, v1, v2 và trả về thời gian gặp nhau:

```python
def mtime(d, v1, v2):
return d / (v1 + v2)
```

## Hình 1: Chương trình giải phương trình

## Hình 2: Chương trình tính thời gian gặp nhau

----

Đa92 sách tai hoc1O.vn



# Chương Trình Thời Gian Gặp Nhau

## Định nghĩa hàm mtime

```python
def mtime(d, v1, v2):
return d / (v1 + v2)
```

### Nhập dữ liệu

```python
d = float(input("d: "))
v1 = float(input("v1: "))
v2 = float(input("v2: "))
```

### Xuất kết quả

```python
print("Hai xe gặp nhau sau", mtime(d, v1, v2), "giờ")
```

### Hình 2. Ví dụ một chương trình cho bài toán thời gian gặp nhau

## Bài 3. Thời gian thực hiện chương trình

Hàm `time()` (với lời gọi `time()`) trong thư viện `time` cho biết thời gian tại thời điểm hiện tại (tính theo giây). Để biết thời gian thực hiện chương trình, người ta ghi nhận thời điểm lúc bắt đầu thực hiện chương trình, thời điểm lúc kết thúc chương trình và đưa ra hiệu các thời điểm đã xác định. Em hãy gắn hàm `time` từ thư viện `time` vào một số chương trình đã có của em và đưa ra thời gian thực hiện chương trình:

### Hướng dẫn:

1. Gắn thư viện `time` vào chương trình:
```python
import time
```

2. Để ghi nhận thời điểm bắt đầu, viết câu lệnh đầu tiên là:
```python
tb = time.time()
```

3. Cuối chương trình, đưa ra thời gian thực hiện:
```python
print("Thời gian thực hiện:", time.time() - tb)
```

4. Để cho đẹp: Nên dùng quy cách `%.4f` để đưa ra thời gian thực hiện chương trình với bốn chữ số ở phần thập phân.

### Hình 3. Minh họa cách sử dụng hàm time

```python
import time
tb = time.time()
# Một số lệnh khác
print("Thời gian thực hiện: %.4f sec" % (time.time() - tb))
```

## Bài Tập: Vẽ Hình Chữ Nhật

Viết chương trình vẽ một hình chữ nhật bằng các dấu `#` với một cạnh có độ dài bằng 10, một cạnh có độ dài bằng `a`. Ví dụ với `a = 4`, hình chữ nhật cần vẽ như hình bên:

### Yêu cầu

Xây dựng một hàm `Drawbox(a)` với tham số `a`, hàm này đưa ra màn hình các dòng; mỗi dòng chứa 10 dấu `#` liên tiếp và tham số `a` quyết định số dòng sẽ được đưa ra. Chương trình gọi hàm `Drawbox(a)` với `a` nhập vào từ bàn phím.

----

Đọc sách tại học O.vn.
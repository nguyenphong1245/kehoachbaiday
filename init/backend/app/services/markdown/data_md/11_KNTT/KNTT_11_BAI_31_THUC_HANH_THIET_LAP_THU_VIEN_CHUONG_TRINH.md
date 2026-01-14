# BÀI 37 THỰC HÀNH THIẾT LẬP THƯ VIỆN CHƯƠNG TRÌNH

## SAU BÀI HỌC NÀY EM SẼ:
- Viết được chương trình vận dụng những kiến thức tích hợp liên môn để giải quyết vấn đề.

Trong Bài 30, em đã tìm hiểu ý nghĩa và cách thiết lập thư viện chương trình. Em có thể thấy xung quanh em, đặc biệt là trong các lĩnh vực khoa học tự nhiên như Toán học, Vật lý và Hóa học, thường xuất hiện nhiều vấn đề hoặc nhiệm vụ tính toán mang tính tổng quát. Em hãy triển khai thuật toán cho các vấn đề như vậy thành các thư viện để có thể sử dụng lại nhiều lần cũng như làm toàn bộ chương trình có cấu trúc trong sáng, rõ ràng, dễ phát triển; dễ bảo trì hơn.

## Nhiệm vụ 1
Viết thư viện `hinh_tron` gồm hai hàm để tính chu vi và diện tích của hình tròn với tham số của hàm số là bán kính. Trong thư viện này, hãy sử dụng hằng số `math.pi` là giá trị của số Pi được định nghĩa ở thư viện `math`. Sau đó, viết một tệp mã nguồn `main.py` để yêu cầu người dùng nhập bán kính đường tròn là một số dương rồi sử dụng thư viện trên để tính diện tích và chu vi hình tròn.

### Hướng dẫn:
Nhiệm vụ này được thực hiện bằng cách định nghĩa hai hàm `tinhChuVi` và `tinhDienTich` được viết trong tệp `circle.py` và đoạn mã nguồn sử dụng thư viện `hinh_tron` trong tệp `main.py`.

#### `hinh_tron.py`
```python
import math  # Khai báo sử dụng thư viện math từ thư viện chuẩn của python

def tinhChuVi(r):
return 2 * math.pi * r

def tinhDienTich(r):
return math.pi * r * r
```

#### `main.py`
```python
import hinh_tron  # Khai báo sử dụng thư viện hinh_tron vừa định nghĩa

r = float(input("Nhập bán kính hình tròn: "))
p = hinh_tron.tinhChuVi(r)
print("Chu vi hình tròn là", p)
s = hinh_tron.tinhDienTich(r)
print(f"Diện tích hình tròn là", s)
```

----

**Chú thích:** Đoạn mã trên sẽ yêu cầu người dùng nhập bán kính hình tròn và sau đó tính toán và in ra chu vi và diện tích của hình tròn dựa trên giá trị bán kính đã nhập.



# Nhiệm vụ 2

Tạo thư viện `cong_thuc_ly` gồm hai hàm `machSongsong(dsDienTro)` và `machNoiTiep(dsDienTro)` để tính điện trở tương đương của mạch nối tiếp và song song gồm các điện trở được cho giá trị tính theo Ohm trong mảng `dsDienTro`: Hãy viết chương trình trong tệp `main.py` sử dụng hai hàm vừa định nghĩa để tính điện trở tương đương của mạch gồm các điện trở với giá trị 3, 6 và 8 Ohm.

## Hướng dẫn:
Áp dụng kiến thức vật lý: điện trở tương đương của mạch gồm các điện trở mắc nối tiếp bằng tổng các điện trở và mạch gồm các điện trở mắc song song bằng nghịch đảo của tổng các nghịch đảo giá trị điện trở thành phần. Ngoài ra kiểm tra nếu có một giá trị điện trở không hợp lệ (nhỏ hơn hoặc bằng 0) thì in thông báo và hàm trả về giá trị -1 với ý nghĩa dữ liệu không hợp lệ.

### `cong_thuc_ly.py`
```python
def machSongSong(dsDienTro):
for r in dsDienTro:
if r &#x3C;= 0:
print("Dữ liệu không hợp lệ, tồn tại một điện trở &#x3C;= 0")
return -1
return sum(dsDienTro)

def machNoiTiep(dsDienTro):
tongNghichDao = 0
for r in dsDienTro:
if r &#x3C;= 0:
print("Dữ liệu không hợp lệ, tồn tại một điện trở &#x3C;= 0")
return -1
tongNghichDao += 1/r
return round(1/tongNghichDao, 2)
```

### `main.py`
```python
from cong_thuc_ly import *

dsDienTro = [3, 6, 8]
print("Điện trở tương đương của mạch mắc nối tiếp:", machNoiTiep(dsDienTro))
print("Điện trở tương đương của mạch mắc song song:", machSongSong(dsDienTro))
```

# Nhiệm vụ 3

Em hãy định nghĩa hàm `tinhNtkTB(dsNtk, dstyLe)` trong file `cong_thuc_hoa.py` để tính nguyên tử khối trung bình của một nguyên tố hóa học trong đó tham số `dsNtk` là mảng giá trị các nguyên tử khối của các đồng vị và `dstyLe` là tỉ lệ phần trăm số nguyên tử của các đồng vị của nguyên tố đó. Sau đó, em hãy viết chương trình trong tệp `main.py` để sử dụng hàm `tinhNtkTB` tính nguyên tử khối trung bình của Carbon biết Carbon có hai đồng vị bền là \(^{12}C\) chiếm 98,89% và \(^{13}C\) chiếm 1,11%.

## Hướng dẫn:
Áp dụng kiến thức hóa học: nguyên tử khối trung bình của một nguyên tố gồm đồng vị được tính theo công thức:

\[
ntk_{TB} = \frac{\sum (ntk_i \cdot tyLe)}{100}
\]

trong đó \(ntk_i > 0\) và \(tyLe\) là tỉ lệ phần trăm.



# Nguyên Tử Khối và Tỉ Lệ Phần Trăm của Các Đồng Vị

Tỉ lệ phần trăm của các đồng vị thứ \( (1, 2, \ldots, n) \) của nguyên tố đó.

## Công Thức Hóa

```python
def tinhNtkTB(dsNtk, dstyLe):
if len(dstyLe) and len(dsNtk) == len(dstyLe):
tong = 0
for i in range(len(dsNtk)):
tong += dsNtk[i] * dstyLe[i]
return tong / 100
else:
return

from cong_thuc_hoa import tinhNtkTB

dsNtk = [12, 13]
dsTyLe = [98.89, 1.11]
ntkTB = tinhNtkTB(dsNtk, dsTyLe)
print('Nguyên tử khối trung bình của Carbon là', ntkTB)
```

## Luyện Tập

1. Đặt tất cả các tệp thư viện đã định nghĩa ở nhiệm vụ 1, 2 và 3 vào thư mục `myLibs` rồi viết mã nguồn ở tệp `main.py` (đặt cùng đường dẫn với thư mục `myLibs`) để sử dụng các hàm trong các thư viện đó.
2. Sửa lại thư viện `hinh_tron` ở nhiệm vụ 1 bằng cách không sử dụng thư viện chuẩn `math` mà hãy định nghĩa thư viện `my_math` trong đó có định nghĩa hằng số Pi.

## Vận Dụng Kết Nối Tri Thức

1. Tạo thư viện `phuong_trinh` gồm hàm `phuongTrinhBac2(a, b, c)` với \( a, b, c \) là các hệ số của phương trình \( ax^2 + bx + c = 0 \). Tùy vào các giá trị của các tham số, hàm sẽ in ra thông báo nghiệm của phương trình.
2. Viết chương trình quản lý các bài hát trong một đĩa CD hay một playlist; sử dụng cấu trúc `LinkedList` đã được định nghĩa ở bài trước. Chương trình gồm hai tệp:
- Tệp `quan_ly_cd.py` gồm ba hàm:
- Hàm `nhapDL()`: Yêu cầu người nhập số lượng bài hát; rồi sau đó nhập lần lượt tên các bài hát và bổ sung vào đĩa CD (hay playlist) trả lại biến kiểu `LinkedList` chứa các bài hát.
- Hàm `timBai()`: Tham số gồm đối tượng `LinkedList` và tên bài hát `<ten_bai>`. Nếu có bài hát cần tìm, hàm in ra vị trí đầu tiên xuất hiện bài hát, nếu không in ra thông báo "Không tìm thấy bài hát `<ten_bai>`".
- Hàm `inTT()`: Tham số là đối tượng `LinkedList`; thực hiện in mỗi bài hát trên một dòng theo định dạng `<số thứ="" tự="">. <tên bài="" hát="">`.
- Tệp `main.py` sử dụng thư viện `quan_ly_cd`.</tên></số></ten_bai></ten_bai>
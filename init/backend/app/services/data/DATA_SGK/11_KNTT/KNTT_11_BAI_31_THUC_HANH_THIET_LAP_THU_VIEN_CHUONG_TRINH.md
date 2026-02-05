# BÀI 37: THỰC HÀNH THIẾT LẬP THƯ VIỆN CHƯƠNG TRÌNH

## SAU BÀI HỌC NÀY EM SẼ:
Viết được chương trình vận dụng những kiến thức tích hợp liên môn để giải quyết vấn đề.

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

### Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa có thể là biểu đồ hình tròn với các thông số chu vi và diện tích được ghi chú rõ ràng.)

### Bảng biểu
| Tham số | Ý nghĩa               |
|---------|----------------------|
| r       | Bán kính hình tròn   |
| p       | Chu vi hình tròn     |
| s       | Diện tích hình tròn  |




# Nhiệm vụ 2

## Tiêu đề bài học
Tạo thư viện `cong_thuc_ly` gồm hai hàm `machSongsong(dsDienTro)` và `machNoiTiep(dsDienTro)` để tính điện trở tương đương của mạch nối tiếp và song song.

## Nội dung lý thuyết
Điện trở tương đương của mạch gồm các điện trở mắc nối tiếp được tính bằng tổng các điện trở. Mạch gồm các điện trở mắc song song được tính bằng nghịch đảo của tổng các nghịch đảo giá trị điện trở thành phần. Nếu có một giá trị điện trở không hợp lệ (nhỏ hơn hoặc bằng 0), thì in thông báo và hàm trả về giá trị -1 với ý nghĩa dữ liệu không hợp lệ.

## Ví dụ minh họa
```python
# cong_thuc_ly.py
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

# main.py
from cong_thuc_ly import *
dsDienTro = [3, 6, 8]
print("Điện trở tương đương của mạch mắc nối tiếp:", machNoiTiep(dsDienTro))
print("Điện trở tương đương của mạch mắc song song:", machSongSong(dsDienTro))
```

## Bài tập và câu hỏi
1. Viết chương trình sử dụng các hàm đã định nghĩa để tính điện trở tương đương của mạch gồm các điện trở với giá trị khác nhau.
2. Kiểm tra các trường hợp đầu vào không hợp lệ và đảm bảo chương trình hoạt động đúng.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh mô tả các mạch điện nối tiếp và song song có thể được thêm vào để minh họa cho bài học.)

## Bảng biểu
| Điện trở (Ohm) | Mắc nối tiếp | Mắc song song |
|----------------|--------------|----------------|
| 3              |              |                |
| 6              |              |                |
| 8              |              |                |
| Tổng           |              |                |

----

# Nhiệm vụ 3

## Tiêu đề bài học
Định nghĩa hàm `tinhNtkTB(dsNtk, dstyLe)` trong file `cong_thuc_hoa.py` để tính nguyên tử khối trung bình của một nguyên tố hóa học.

## Nội dung lý thuyết
Nguyên tử khối trung bình của một nguyên tố gồm đồng vị được tính theo công thức:
\[ ntkTB = \sum \left( ntki \times \frac{tyLe}{100} \right) \]
Trong đó, `ntki` là nguyên tử khối của đồng vị và `tyLe` là tỉ lệ phần trăm số nguyên tử của các đồng vị.

## Ví dụ minh họa
```python
# cong_thuc_hoa.py
def tinhNtkTB(dsNtk, dstyLe):
ntkTB = 0
for i in range(len(dsNtk)):
ntkTB += dsNtk[i] * (dstyLe[i] / 100)
return round(ntkTB, 2)

# main.py
dsNtk = [12, 13]
dstyLe = [98.89, 1.11]
print("Nguyên tử khối trung bình của Carbon:", tinhNtkTB(dsNtk, dstyLe))
```

## Bài tập và câu hỏi
1. Viết chương trình sử dụng hàm `tinhNtkTB` để tính nguyên tử khối trung bình của các nguyên tố hóa học khác.
2. Kiểm tra các trường hợp đầu vào không hợp lệ và đảm bảo chương trình hoạt động đúng.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh mô tả cấu trúc nguyên tử và đồng vị có thể được thêm vào để minh họa cho bài học.)

## Bảng biểu
| Đồng vị | Nguyên tử khối (g/mol) | Tỉ lệ phần trăm (%) |
|---------|------------------------|----------------------|
| 12C     | 12                     | 98.89                |
| 13C     | 13                     | 1.11                 |
| Tổng    |                        |                      |




**Tiêu đề bài học: Tính toán nguyên tử khối trung bình**

**Nội dung lý thuyết:**
Nguyên tử khối trung bình của một nguyên tố được tính dựa trên tỉ lệ phần trăm của các đồng vị và nguyên tử khối của chúng. Công thức tính nguyên tử khối trung bình được biểu diễn như sau:

\[
\text{NtkTB} = \frac{\sum (\text{Nguyên tử khối} \times \text{Tỉ lệ})}{100}
\]

**Ví dụ minh họa:**
Giả sử có hai đồng vị của Carbon với nguyên tử khối lần lượt là 12 và 13, tỉ lệ phần trăm của chúng là 98.89% và 1.11%. Ta có thể tính nguyên tử khối trung bình của Carbon như sau:

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

**Bài tập và câu hỏi:**
1. Đặt tất cả các tệp thư viện đã định nghĩa ở nhiệm vụ 1, 2 và 3 vào thư mục `myLibs` rồi viết mã nguồn ở tệp `main.py` (đặt cùng đường dẫn với thư mục `myLibs`) để sử dụng các hàm trong các thư viện đó.
2. Sửa lại thư viện `hinh_tron` ở nhiệm vụ 1 bằng cách không sử dụng thư viện chuẩn `math` mà hãy định nghĩa thư viện `my_math` trong đó có định nghĩa hằng số Pi.

**Vận dụng kiến thức:**
1. Tạo thư viện `phuong_trinh` gồm hàm `phuongTrinhBac2(a, b, c)` với a, b, c là các hệ số của phương trình \( ax^2 + bx + c = 0 \). Tùy vào các giá trị của các tham số, hàm sẽ in ra thông báo nghiệm của phương trình.
2. Viết chương trình quản lý các bài hát trong một đĩa CD hay một playlist; sử dụng cấu trúc `LinkedList` đã được định nghĩa ở bài trước. Chương trình gồm hai tệp:
- Tệp `quan_ly_cd.py` gồm ba hàm:
- Hàm `nhapDL()`: Yêu cầu người nhập số lượng bài hát; rồi sau đó nhập lần lượt tên các bài hát và bổ sung vào đĩa CD (hay playlist) trả lại biến kiểu `LinkedList` chứa các bài hát.
- Hàm `timBai()`: Tham số gồm đối tượng `LinkedList` và tên bài hát `<ten_bai>`. Nếu có bài hát cần tìm, hàm in ra vị trí đầu tiên xuất hiện bài hát, nếu không in ra thông báo "Không tìm thấy bài hát <ten_bai>".
- Hàm `inTT()`: Tham số là đối tượng `LinkedList`; thực hiện in mỗi bài hát trên một dòng theo định dạng `<số thứ="" tự=""> . <tên bài="" hát="">`.
- Tệp `main.py` sử dụng thư viện `quan_ly_cd`.</tên></số></ten_bai></ten_bai>
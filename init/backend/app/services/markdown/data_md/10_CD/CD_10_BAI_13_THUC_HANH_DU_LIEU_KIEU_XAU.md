# BÀI 13 THỰC HÀNH DỮ LIỆU KIỂU XÂU

Học xong bài này em sẽ:
- Tìm và xoá được kí tự trong xâu.
- Tách được xâu con; thay thế được xâu con.
- Đếm được số lần xuất hiện kí tự cho trước trong xâu.

## Bài 1: Xoá kí tự trong xâu
Em hãy viết chương trình tạo một xâu mới từ xâu `s` đã cho bằng việc xoá những kí tự được chỉ định trước.

### Hướng dẫn:
Xoá kí tự tương đương với việc thay kí tự đó bằng kí tự rỗng. (Hình 1)

b) Em hãy chạy thử chương trình và kiểm tra kết quả.

**Ví dụ:**
```
INPUT          OUTPUT
123a45a6a78    12345678
```
```python
str (input('Nhập Xâu 5: '))
input()
replace(c, '')
print(w)
```

**Hình 1. Chương trình xoá kí tự trong xâu**

## Bài 2: Giúp bạn tìm và sửa lỗi chương trình
Tên tệp thường gồm hai phần được ngăn cách nhau bởi dấu chấm. Ví dụ, các tệp chương trình Python có phân mở rộng là 'py', các tệp văn bản không mở rộng là 'wdoc' hoặc 'docx'. Trong hệ điều hành Windows, tên tệp có phân biệt chữ hoa và chữ thường. Bạn Khánh Linh muốn viết chương trình (Hình 2) nhập vào một xâu là tên của một tệp và kiểm tra xem tên tệp đó có phải là tên của tệp chương trình Python trong hệ điều hành Windows không.

**File   Edit   Format   Run   Options   Window   Help**
```
fileName = input('Nhập một tên tệp: ')
Length = len(fileName)
extensionName = fileName[Length - 2:]  # Lấy hai kí tự cuối cùng của xâu fileName
extensionName = 'py'
if extensionName == 'py':
print(fileName + " là tệp mã nguồn Python")
else:
print(fileName + " không phải là tệp mã nguồn Python")
```

**Hình 2. Chương trình Khánh Linh viết**

Đọc sách tại hoc1O.vn



# Khánh Linh đã nghĩ ra thuật toán

Bằng cách lấy ra hai ký tự cuối cùng của xâu rồi so sánh với xâu 'py'. Tuy nhiên, chương trình do Khánh Linh viết vẫn còn có lỗi. Em hãy giúp bạn Khánh Linh tìm và sửa lỗi để chương trình chạy được và đưa ra kết quả đúng.

## Gợi ý:
Nếu Python báo lỗi cú pháp, em hãy sửa hết lỗi cú pháp để chương trình chạy được. Sau đó hãy chạy thử với một số dữ liệu vào khác nhau, ví dụ 'Hello py', 'Hello PY' và kiểm tra xem kết quả nhận được có đúng không.

----

# Bài 3. Xác định tọa độ

## a) Tìm hiểu bài toán:
Robot thám hiểm Sao Hỏa đang ở điểm có tọa độ (0; 0) nhận được dòng lệnh điều khiển từ Trái Đất: Dòng lệnh chỉ chứa các ký tự từ tập ký tự {E, S, W, N}, mỗi ký tự là một lệnh di chuyển với quãng đường bằng một đơn vị độ dài.

- Lệnh E: đi về hướng đông
- Lệnh S: đi về hướng nam
- Lệnh W: đi về hướng tây
- Lệnh N: đi về hướng bắc

Trục Ox của hệ tọa độ chạy từ tây sang đông, trục Oy chạy từ nam lên bắc. Em hãy xác định tọa độ của robot sau khi thực hiện lệnh di chuyển nhận được.

### Ví dụ:
Với lệnh 'ENENWWWS', sau khi thực hiện robot sẽ tới vị trí (-1; 1) (Hình 3).

## Gợi ý:
- Tọa độ x của đích tới bằng số lượng ký tự 'E' trừ số lượng ký tự 'W'.
- Tọa độ y của đích tới bằng số lượng ký tự 'N' trừ số lượng ký tự 'S'.

## b) Em hãy đọc hiểu và chạy thử chương trình ở Hình 4 và cho biết chương trình đó có giải quyết được bài toán ở mục a) hay không.

----

### Giải

```
File Edit Format Run Options Window Help
input 'Dòng lệnh                       Kết quả thực hiện
count (                                          quà
count
count                                  File   Edit   Shell   Debug   Options   Window   Help
count (
Dòng lệnh: ENENVWTS
print 'Tọa độ hiện tại của robot                    Tọa độ hiện tại của robot: (-1, 1)
```

### Hình 4: Chương trình bài toán xác định tọa độ

----

## Tên gọi chữ số bằng tiếng Anh
### Ví dụ:
Em hãy viết chương trình nhập vào từ bàn phím một chữ số trong hệ thập phân, đưa ra màn hình tên gọi của chữ số đó.

| INPUT | OUTPUT |
|-------|--------|
| 5     | five   |

----

Địa chỉ sách tại hoc10.vn
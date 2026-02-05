# BÀI 28  THIẾT KẾ CHƯƠNG TRÌNH THEO MÔ ĐUN

## SAU BÀI HỌC NÀY EM SẼ:
- Biết và vận dụng được cách thiết kế chương trình theo mô đun cho một số bài toán cụ thể.
- Nhận biết được lợi ích của phương pháp thiết kế chương trình theo mô đun.

Em được giao việc quản lí cho cửa hàng bán thực phẩm của gia đình. Hằng ngày, em phải nhập danh sách các mặt hàng và doanh số bán hàng. Cuối ngày, em cần báo cáo ba mặt hàng có doanh số cao nhất và ba mặt hàng có doanh số thấp nhất trong ngày.

Các mặt hàng mới nhập sẽ được lưu trong tệp văn bản bao gồm nhiều dòng, mỗi dòng là tên mặt hàng và doanh số được ngăn cách bằng dấu phẩy. Tên tệp đầu vào là `Data.inp`. Báo cáo cuối ngày là tệp văn bản `Data.out` gồm 6 dòng, ba dòng đầu tiên là tên ba mặt hàng có doanh số cao nhất; ba dòng cuối là tên ba mặt hàng có doanh số thấp nhất; cần có cả tên hàng và doanh số.

### Ví dụ minh họa:
**Dữ liệu đầu vào (`Data.inp`):**
```
Cà rốt, 1350
Khoai tây, 4400
Hành tươi, 1367.5
Bắp cải, 3400
Cà chua, 5609
Khoai lang, 2100
Gạo ST25, 19221
Gạo thường, 23124
Cam, 9800
Chuối, 7823
```

**Báo cáo đầu ra (`Data.out`):**
```
Gạo thường, 23124
Gạo ST25, 19221
Cam, 9800
Khoai lang, 2100
Cà rốt, 1350
Hành tươi, 1367.5
```

Em sẽ thiết kế chương trình như thế nào? Trao đổi với bạn về cách thiết kế chương trình sao cho hợp lý nhất.

## 1. THIẾT KẾ CHƯƠNG TRÌNH THEO MÔ ĐUN
### Hoạt động 1: Thiết kế chương trình theo mô đun
Thực hiện các bước thiết kế giải bài toán trên theo phương pháp làm mịn dần, trao đổi và thảo luận để biết được cách thiết kế chương trình theo mô đun.



# Bài học: Thiết kế chương trình xử lý dữ liệu

## Nội dung lý thuyết
Trong quá trình thiết kế chương trình xử lý dữ liệu, chúng ta có thể chia bài toán thành ba công việc chính, các công việc này tương đối độc lập với nhau:
1. **Công việc nhập dữ liệu**: Dữ liệu được nhập vào tệp `Data.inp` và được đọc để đưa vào chương trình.
2. **Công việc xử lý dữ liệu**: Các công việc chuẩn bị tính toán dữ liệu theo yêu cầu của bài toán.
3. **Báo cáo, đưa dữ liệu ra theo yêu cầu**.

### Bước 1: Thiết kế công việc nhập dữ liệu
Thiết lập hàm `NhapDL(fin)` có tính năng đọc dữ liệu từ tệp `Data.inp` và đưa vào hai mảng `P` (mặt hàng) và `S` (doanh số). Hàm được mô tả tổng quát như sau:

```python
def NhapDL(fin):
fin = open(fin, encoding="UTF-8")
P = []
S = []
for line in fin:
A = line.split(",")
P.append(A[0])
S.append(float(A[1]))
fin.close()
return P, S
```

### Bước 2: Thiết lập công việc xử lý dữ liệu
Yêu cầu chính của báo cáo là lấy được thông tin của các mặt hàng có doanh số cao nhất và thấp nhất. Do vậy, công việc xử lý dữ liệu chính là cần sắp xếp lại các mảng `P` và `S` theo thứ tự tăng dần của `S` (doanh số). Hàm `Sapxep(A, B)` được thiết kế tổng quát sẽ sắp xếp lại hai mảng `A`, `B` nhưng theo thứ tự tăng dần của `A`.

```python
def Sapxep(A, B):
n = len(A)
for i in range(1, n):
j = i
while j > 0 and A[j] &#x3C; A[j-1]:
A[j], A[j-1] = A[j-1], A[j]
B[j], B[j-1] = B[j-1], B[j]
j = j-1
```

### Bước 3: Thiết lập báo cáo, đưa dữ liệu ra
Cuối cùng là chức năng đưa dữ liệu ra tệp `Data.out`, sẽ được mô tả trong hàm `GhiDL(P, S, fout)`. Hàm này lấy dữ liệu từ các mảng `P`, `S` và đưa dữ liệu ra tệp `fout`.

```python
def GhiDL(P, S, fout):
fout = open(fout, encoding="UTF-8")
n = len(P)
for i in range(n-1, n-4, -1):
fout.write(f"{P[i]},{S[i]}\n")
fout.close()
```

## Ví dụ minh họa
Giả sử tệp `Data.inp` có nội dung như sau:
```
Sản phẩm A,100
Sản phẩm B,200
Sản phẩm C,150
```
Sau khi thực hiện các bước trên, tệp `Data.out` sẽ có nội dung:
```
Sản phẩm B,200
Sản phẩm C,150
Sản phẩm A,100
```

## Bài tập và câu hỏi
1. Hãy viết hàm để tính tổng doanh số của tất cả các mặt hàng.
2. Hãy mở rộng chương trình để cho phép người dùng nhập thêm mặt hàng mới và doanh số của nó.
3. Giải thích cách hoạt động của hàm `Sapxep`.

## Hình ảnh mô tả
*Hình ảnh mô tả quá trình nhập dữ liệu từ tệp và xuất dữ liệu ra tệp có thể được thêm vào đây.*

## Bảng biểu
| Mặt hàng     | Doanh số |
|--------------|----------|
| Sản phẩm A   | 100      |
| Sản phẩm B   | 200      |
| Sản phẩm C   | 150      |




# Bài học: Thiết kế chương trình theo mô đun

## Nội dung lý thuyết
Trong lập trình, việc thiết kế chương trình theo mô đun là một phương pháp quan trọng giúp tách biệt các phần của chương trình thành các đơn vị nhỏ hơn, dễ quản lý và bảo trì. Mỗi mô đun thường là một chức năng độc lập, thực hiện một nhiệm vụ cụ thể trong chương trình.

Phương pháp này cho phép lập trình viên phát triển, kiểm tra và sửa lỗi từng mô đun một cách độc lập, từ đó giảm thiểu sự phức tạp của chương trình lớn. Chương trình chính sẽ gọi các mô đun này để thực hiện các chức năng cần thiết.

### Ví dụ minh họa
```python
for i in range(2, -1, -1):
print(P[i], S[i], file=f)
f.close()
```
Sau các bước trên, chúng ta đã thực hiện xong việc thiết kế các công việc chính được đặt ra ban đầu: Mỗi công việc đó được viết thành một hàm riêng biệt, độc lập với nhau. Các hàm này được gọi là các mô đun con của chương trình.

Chương trình chính sử dụng các chương trình con trên được mô tả đơn giản như sau:
```python
fin = 'Data.inp'
fout = "Data.out"
P, S = NhapDL(fin)
Sapxep(S, P)
GhiDL(P, S, fout)
```

## Bài tập và câu hỏi
1. Chương trình trên được thiết kế có bao nhiêu mô đun?
2. Các mô đun của chương trình trên có quan hệ với nhau như thế nào?

## Lợi ích của phương pháp thiết kế theo mô đun
### Hoạt động 2: Tìm hiểu lợi ích của phương pháp thiết kế theo mô đun
Với chương trình đã có trong Hoạt động 1, em sẽ làm gì nếu có các yêu cầu bổ sung như sau:
1. Yêu cầu thay đổi thông tin trong báo cáo: Ghi hai mặt hàng có doanh số cao nhất và bốn mặt hàng có doanh số thấp nhất.
2. Cập nhật; bổ sung các mặt hàng mới và doanh số trong ngày.
3. Yêu cầu làm thêm một báo cáo trong đó ghi doanh số bán trung bình trong ngày và danh sách các mặt hàng có doanh số lớn hơn doanh số trung bình này; kết quả đưa ra tệp Data2.out.

Em có nhận xét gì về việc thực hiện các công việc bổ sung này?

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa cho cấu trúc chương trình theo mô đun, thể hiện các mô đun và mối quan hệ giữa chúng.)

## Bảng biểu
| Mô đun        | Chức năng                          |
|--------------|------------------------------------|
| NhapDL       | Nhập dữ liệu từ tệp              |
| Sapxep       | Sắp xếp dữ liệu                    |
| GhiDL        | Ghi dữ liệu ra tệp                |

Phương pháp thiết kế chương trình theo mô đun sẽ tách bài toán lớn thành các bài toán nhỏ hơn; hay thành các mô đun; tương đối độc lập với nhau; sau đó tiến hành thiết kế thuật toán và chương trình cho từng mô đun con. Mỗi mô đun có thể là một số hàm hoặc thủ tục độc lập. Chương trình chính là một bản ghép nối các hàm và thủ tục con.



# Bài học: Nâng cấp hàm GhiDL() và xây dựng hàm BC2()

## Nội dung lý thuyết
Công việc bổ sung 1:
Đây là công việc cần nâng cấp hàm GhiDL() và độc lập với các mô đun khác. Việc nâng cấp này rất đơn giản và được mô tả trong chương trình sau: Thay đổi chỉ ở hai lệnh tại dòng 4 và 6.

```python
def GhiDL(P, S, fout):
open(fout, encoding="UTF-8")  # So với mô đun gốc
for i in range(n-1, n-3, -1):  # bản nâng cấp này chỉ cần sửa hai dòng
for i in range(3, -1, -1):
print(P[i], S[i], file=f)
f.close()
```

Công việc bổ sung 2:
Công việc này rất đơn giản là mở tệp Data.inp và bổ sung thêm thông tin các mặt hàng mới và doanh số, không cần phải sửa chương trình.

Công việc bổ sung 3:
Công việc này mới và độc lập hoàn toàn với các công việc khác của bài toán nên có thể tách thành một hàm (mô đun) độc lập, có thể giao cho một nhóm khác thực hiện. Hàm mới sẽ đặt tên là BC2() và có nội dung đơn giản như sau:

```python
def BC2(P, S, fout):
open(fout, encoding="UTF-8")
n = len(P)
average = sum(S) / n
print("Doanh số trung bình:", average, file=f)
for i in range(n):
if S[i] > average:
print(P[i], S[i], file=f)
f.close()
```

Trong chương trình chính cần bổ sung lệnh sau đây để thực hiện báo cáo mới này:
```python
BC2(P, S, 'Data2.out')
```

### Ưu điểm của thiết kế thuật toán và chương trình theo mô đun:
- Chương trình ngắn gọn, sáng sủa, dễ hiểu.
- Các mô đun được thiết lập một lần và sử dụng nhiều lần.
- Dễ dàng thay đổi, chỉnh sửa mà không mất công sửa lại toàn bộ chương trình.
- Dễ dàng bổ sung các mô đun mới.
- Có thể chia sẻ trong môi trường làm việc nhóm; ví dụ phân công mỗi người một công việc độc lập.

## Ví dụ minh họa
- Ví dụ về cách sử dụng hàm GhiDL() và BC2() trong chương trình chính.

## Bài tập và câu hỏi
1. Hãy mô tả cách thức hoạt động của hàm GhiDL() sau khi được nâng cấp.
2. Viết một hàm tương tự như BC2() nhưng tính toán doanh số trung bình cho một danh sách khác.
3. Giải thích tại sao việc thiết kế theo mô đun lại có lợi trong lập trình.

## Hình ảnh mô tả
- (Ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc chương trình và cách các mô đun tương tác với nhau.)

## Bảng biểu
- (Ghi chú về bảng biểu: Bảng thống kê doanh số của các mặt hàng trước và sau khi thực hiện các công việc bổ sung.)



# Bài học: Phân loại công việc và thiết kế chương trình

## Nội dung lý thuyết
Trong quá trình phát triển phần mềm, việc phân loại các công việc bổ sung là rất quan trọng để xác định cách thức thực hiện và phân bổ nguồn lực. Các công việc có thể được chia thành ba loại chính:
1. **Công việc mới hoàn toàn**: Là những tính năng hoặc chức năng chưa từng có trong hệ thống.
2. **Công việc nâng cấp một mô đun cũ**: Là việc cải tiến hoặc mở rộng các chức năng đã có.
3. **Công việc không liên quan đến thuật toán và lập trình**: Là các công việc mang tính chất hành chính, tổ chức hoặc tài liệu.

## Ví dụ minh họa
Giả sử có một yêu cầu nhập một giá trị số K để tìm trong danh sách các mặt hàng có doanh số xấp xỉ K (hơn kém nhau không quá C = 1). Công việc này thuộc nhóm công việc nâng cấp một mô đun cũ, vì nó yêu cầu cải tiến chức năng tìm kiếm trong danh sách sản phẩm.

## Bài tập và câu hỏi
1. Nếu công việc bổ sung 3 có thêm yêu cầu in ra số lượng mặt hàng đã bán trong ngày, cần thêm hay sửa lệnh nào của chương trình BC2()?
2. Viết thêm một chương trình cho công việc bổ sung 4 như sau: Cần in ra danh sách 1/3 số mặt hàng có doanh số thấp nhất trong ngày.

## Vận dụng
1. Thiết lập chương trình cho công việc thường làm vào cuối giờ bán hàng: Cho trước số K (một doanh số giả định) cần tìm ra mặt hàng có doanh số nhỏ hơn K nhưng gần với K nhất. Bài toán này có thể sử dụng thuật toán tìm kiếm nào để giải?
2. Thiết kế thuật toán và chương trình theo mô đun cho bài toán sau: Một công ty du lịch có n địa điểm tham quan được đánh số theo thứ tự 0, 1, 2, ..., n - 1. Công ty này luôn tổ chức các tour du lịch đi lần lượt từ vị trí 0, 1, 2 và kết thúc tại vị trí cuối cùng n - 1. Để thuận tiện cho việc quảng bá du lịch, công ty đã lấy ý kiến khách hàng đánh giá bằng điểm số cho các địa điểm du lịch. Điểm số có thể là các số dương hoặc số âm bất kỳ. Số lớn hơn 0 biểu thị đánh giá tốt, số nhỏ hơn 0 biểu thị đánh giá xấu về địa điểm đó. Mỗi khách hàng sẽ gửi lên công ty du lịch bảng đánh giá của mình, được biểu thị bằng một dãy n số, ví dụ như sau:
```
1, -3, 4, 10, 0, -5, -8, 2, -1, 7, 2
```
Công ty du lịch hứa sẽ tổ chức một tour riêng cho mỗi khách hàng, bảo đảm sự hài lòng cao nhất của khách hàng. Tour du lịch riêng của khách hàng sẽ là một dãy các vị trí liên tục các địa điểm, ví dụ từ vị trí i đến j, tức là xuất phát từ i, khách hàng sẽ lần lượt đi qua các vị trí i, i + 1, ..., j và kết thúc tại j. Công ty du lịch bảo đảm rằng tổng các đánh giá của khách hàng trên tour riêng của mình là lớn nhất. Hãy giúp công ty du lịch thiết lập tour du lịch tối ưu cho khách hàng nếu biết trước các đánh giá của khách hàng đó.

## Hình ảnh mô tả
*Ghi chú về hình ảnh*: Hình ảnh minh họa có thể bao gồm sơ đồ các địa điểm du lịch và các tuyến đường kết nối giữa chúng, cùng với các điểm đánh giá của khách hàng.

## Bảng biểu
*Bảng đánh giá của khách hàng*:
| Khách hàng | Địa điểm 0 | Địa điểm 1 | Địa điểm 2 | Địa điểm 3 | Địa điểm 4 | Địa điểm 5 | Địa điểm 6 | Địa điểm 7 | Địa điểm 8 | Địa điểm 9 | Địa điểm 10 |
|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|------------|-------------|
| Khách 1    | 1          | -3         | 4          | 10         | 0          | -5         | -8         | 2          | -1         | 7          | 2           |
| Khách 2    | ...        | ...        | ...        | ...        | ...        | ...        | ...        | ...        | ...        | ...        | ...         |

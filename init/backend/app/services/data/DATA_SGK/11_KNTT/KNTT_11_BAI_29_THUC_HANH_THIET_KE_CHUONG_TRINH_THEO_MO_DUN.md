# BÀI 29: THỰC HÀNH THIẾT KẾ CHƯƠNG TRÌNH THEO MÔ ĐUN

## SAU BÀI HỌC NÀY EM SẼ:
Thực hành thiết kế một số chương trình hoàn chỉnh theo mô đun.

Trong Bài 28, em đã biết tầm quan trọng và ý nghĩa của việc thiết kế chương trình theo mô đun. Mỗi mô đun chính là một chương trình con được xác định khi phân tích thiết kế bài toán lớn. Mỗi mô đun được viết một cách độc lập, có thể sử dụng lại như các thư viện và có thể chia sẻ trong nhóm làm việc. Trong bài thực hành này em sẽ được tự mình thiết kế chương trình cho một bài toán hoàn chỉnh theo mô đun.

## Nhiệm vụ: Tính điểm tổng hợp của vận động viên
Trong một cuộc thi đấu thể thao khu vực dạng Sea Games; các cầu thủ tham gia thi đấu ở các bộ môn khác nhau và do sự phức tạp của truyền tin nên ban tổ chức (BTC) đã quyết định nhập thông tin kết quả thi đấu của các vận động viên vào các tệp văn bản; sau đó các tệp này được chuyển về trung tâm để xử lý. Mỗi bộ môn thể thao sẽ có số lượng ban giám khảo khác nhau: Mỗi tệp dữ liệu lưu thông tin sẽ có khuôn dạng gồm nhiều dòng, mỗi dòng là thông tin của một vận động viên thi đấu tại một bộ môn nào đó. Mỗi dòng của tệp thông tin sẽ bao gồm:
- Đầu tiên là mã số của vận động viên.
- Tiếp theo là điểm cho của các giám khảo; giữa các điểm số đều có dấu cách.
- Điểm số được cho có thể là số nguyên hoặc số thập phân; thang điểm 10.

Theo quy định của BTC, quy định tính điểm chung cho mỗi vận động viên như sau:
- Điểm tổng hợp của mỗi vận động viên là trung bình cộng điểm của ban giám khảo.
- Tuy nhiên trong mỗi ban giám khảo luôn có hai giám khảo đặc biệt; hai giám khảo này có hệ số tổng hợp là 2, trong khi các giám khảo khác có hệ số 1. Theo quy định của BTC thì các giám khảo đặc biệt sẽ ở vị trí đầu tiên và cuối cùng của danh sách. Ở tất cả các bộ môn thể thao số lượng thành viên ban giám khảo phải lớn hơn 2.

Nhiệm vụ của em là tính điểm tổng hợp của các vận động viên từ tệp văn bản SeaGames.inp. Kết quả ghi ra tệp ketqua.out có dạng như sau:
- Tệp sẽ có nhiều dòng, số dòng bằng đúng số dòng của tệp đầu vào.
- Trên mỗi dòng ghi mã của vận động viên và điểm tổng hợp tương ứng. Yêu cầu ghi điểm tổng hợp với hai chữ số sau dấu phẩy.



# Bài học: Xử lý dữ liệu từ tệp

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách xử lý dữ liệu từ tệp, cụ thể là tệp chứa kết quả thi đấu của các vận động viên trong một sự kiện thể thao. Chương trình sẽ được chia thành ba mô đun độc lập để thực hiện các công việc khác nhau.

### Các mô đun:
1. **Mô đun 1**: Đọc dữ liệu từ tệp.
2. **Mô đun 2**: Xử lý dữ liệu đã đọc.
3. **Mô đun 3**: Ghi dữ liệu đã xử lý ra tệp theo yêu cầu.

Chương trình chính sẽ kết hợp và kết nối các mô đun này lại với nhau.

## Ví dụ minh họa
Giả sử chúng ta có tệp `SeaGames.inp` với nội dung như sau:
```
101 7.5 8.0 9.0 9.5 7.1 6.8
200 8.5 9.1 9.5 8.6 9.9
003 6.6 7.0 7.5 6.8 5.9 8.1
045 8.5 7.9 9.3 9.0 8.9
901 9.2 9.7 8.6
```
Khi đọc dữ liệu từ tệp này, chúng ta sẽ tạo ra hai mảng:
- Mảng `DS` chứa mã số của các vận động viên.
- Mảng `Diem` chứa các điểm số mà ban giám khảo chấm cho từng vận động viên.

## Bài tập và câu hỏi
1. Viết hàm `nhapDL()` để đọc dữ liệu từ tệp và trả về hai mảng `DS` và `Diem`.
2. Thực hiện xử lý dữ liệu để tính điểm trung bình cho mỗi vận động viên.
3. Ghi kết quả ra tệp theo định dạng yêu cầu.

## Hình ảnh mô tả
- Hình ảnh mô tả cấu trúc tệp dữ liệu và cách thức đọc dữ liệu từ tệp sẽ được cung cấp trong tài liệu hướng dẫn.

## Bảng biểu
| Mã số | Điểm số                     |
|-------|-----------------------------|
| 101   | 7.5, 8.0, 9.0, 9.5, 7.1, 6.8 |
| 200   | 8.5, 9.1, 9.5, 8.6, 9.9     |
| 003   | 6.6, 7.0, 7.5, 6.8, 5.9, 8.1 |
| 045   | 8.5, 7.9, 9.3, 9.0, 8.9     |
| 901   | 9.2, 9.7, 8.6               |

## Mô đun nhập dữ liệu
Hàm `nhapDL(fin)` được mô tả như sau:
```python
def nhapDL(finp):
A = []
B = []
with open(finp) as f:
for line in f:
s = line.split()
A.append(s[0])
temp = s[1:len(s)]
temp = [float(x) for x in temp]
B.append(temp)
return A, B
```
Hàm này sẽ đọc dữ liệu từ tệp, tách mã số và điểm số, sau đó lưu vào hai mảng `A` và `B`.



# Thiết kế mô đun xử lí dữ liệu chính

## Nội dung lý thuyết
Mục đích của mô đun này là tính điểm tổng hợp cho mỗi vận động viên. Mỗi vận động viên sẽ tương ứng với một dãy các điểm số được lấy từ mảng `Diem`. Từ dãy này sẽ tính được điểm tổng hợp theo cách tính đặc biệt của BTC. Mô đun này sẽ cần hai hàm:

### Hàm `diem_gk()`
Hàm `diem_gk()` sẽ tính điểm tổng hợp các giám khảo từ dãy các điểm. Theo yêu cầu, các giám khảo đầu tiên và cuối cùng có hệ số 2 nên cần tính điểm các giám khảo này 2 lần. Điều này được mô tả tại dòng lệnh 2. Hàm này được thiết kế chi tiết như sau:

```python
def diem_gk(d):
diem = sum(d) + d[0] + d[len(d)-1]
diem = diem / (len(d) + 2)
return round(diem, 2)
```

### Hàm `Xuly()`
Hàm `Xuly()` sẽ tính toán điểm tổng hợp cho tất cả các vận động viên với đầu vào là dãy `Diem`. Hàm này sẽ sử dụng hàm `diem_gk()` đã thiết lập ở phần trên. Kết quả tính toán là một dãy điểm tổng hợp và là giá trị trả lại của hàm này. Kết quả của hàm `Xuly()` là dãy `kq`.

```python
def Xuly(B):
kq = []
for i in range(len(B)):
diem = diem_gk(B[i])
kq.append(diem)
return kq
```

## Thiết kế mô đun đưa kết quả
Cuối cùng là mô đun đưa kết quả ra tệp đầu ra theo yêu cầu của bài toán. Hàm `ghiDL()` sẽ có ba tham số đầu vào là tên tệp dữ liệu ra; hai mảng `DS` và `kq`. Khai báo của hàm này là `ghiDL(fout, A, B)`, trong đó `fout` là tên tệp dữ liệu đầu ra, `A` là mảng danh sách các mã số của vận động viên; `B` là mảng ghi kết quả điểm tổng hợp của các vận động viên. Kết quả đưa ra màn hình.

```python
def ghiDL(fout, A, B):
f = open(fout, "w")
for i in range(len(A)):
print(A[i], B[i], file=f)
f.close()
```

## Tổng hợp chương trình chính
```python
finp = "SeaGames.inp"
fout = "ketqua.out"
DS, Diem = nhapDL(finp)
kq = Xuly(Diem)
ghiDL(fout, DS, kq)
```

### Hình ảnh mô tả
- Hình ảnh mô tả có thể bao gồm sơ đồ luồng dữ liệu giữa các hàm và cách thức hoạt động của chương trình.

### Bảng biểu
- Bảng biểu có thể được sử dụng để trình bày các điểm số của từng vận động viên và điểm tổng hợp tương ứng.



# Tiêu đề bài học
Chương trình xử lý dữ liệu SeaGames

# Nội dung lý thuyết
Chương trình này được viết bằng ngôn ngữ lập trình Python, có chức năng nhập dữ liệu từ file, tính toán điểm trung bình và ghi kết quả ra file.

# Ví dụ minh họa
Dưới đây là mã nguồn của chương trình:

```python
def nhapDL(finp):
f = open(finp)
A = []
B = []
for line in f:
s = line.split()
A.append(s[0])
temp = s[1:len(s)]
temp = [float(x) for x in temp]
B.append(temp)
f.close()
return A, B

def diem_gk(d):
diem = sum(d) / (len(d) + 2)
return round(diem, 2)

def Xuly(B):
kq = []
for i in range(len(B)):
diem = diem_gk(B[i])
kq.append(diem)
return kq

def ghiDL(fout, A, B):
f = open(fout, "w")
for i in range(len(A)):
print(A[i], B[i], file=f)
f.close()

# Chương trình chính
finp = "SeaGames.inp"
fout = "ketqua.out"
DS, Diem = nhapDL(finp)
kq = Xuly(Diem)
ghiDL(fout, DS, kq)
```

# Bài tập và câu hỏi
1. Giải thích chức năng của từng hàm trong chương trình.
2. Thay đổi chương trình để tính điểm trung bình theo cách khác.
3. Viết một hàm để đọc dữ liệu từ file và in ra màn hình.

# Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh có thể là sơ đồ luồng chương trình hoặc giao diện người dùng khi chạy chương trình.)

# Bảng biểu
| Hàm         | Chức năng                                      |
|-------------|------------------------------------------------|
| nhapDL     | Nhập dữ liệu từ file                          |
| diem_gk    | Tính điểm trung bình                          |
| Xuly       | Xử lý danh sách điểm                          |
| ghiDL      | Ghi kết quả ra file                           |




# LUYỆN TẬP

## 1. Hãy chỉnh sửa lại chương trình trên nếu bổ sung thêm điều kiện sau vào nhiệm vụ:
Trong tệp kết quả đầu ra, thứ tự các vận động viên được ghi theo thứ tự dần giảm của điểm đánh giá.

## 2. Trong nhiệm vụ trên; nếu công thức tính điểm tổng hợp của Sea Games thay đổi thì chúng ta có phải sửa lại toàn bộ chương trình hay không? Nếu cần thì chỉ phải sửa mô đun nào? Hàm nào?

----

# VẬN DỤNG

## Thiết lập chương trình thiết kế theo mô đun cho các bài toán sau:

### 1. Cho trước số tự nhiên n, cần in ra trên màn hình dãy n số nguyên tố đầu tiên.
**Ví dụ:** nếu n = 5 thì dãy cần in ra sẽ là 2, 3, 5, 7, 11.

### 2. Trong một kỳ thi Tin học trẻ, mỗi học sinh sẽ phải làm 3 bài thi.
Với mỗi bài, nếu học sinh làm sẽ được ban giám khảo chấm và cho điểm; nếu không làm thì sẽ không tính điểm: Sau khi thi, dữ liệu điểm thi của học sinh sẽ được lưu trong một tệp văn bản và gửi về ban tổ chức. Mẫu một tệp điểm thi có dạng sau:

```
Diemthi.inp
A12 12 15
B123 14 -1
C11 10 12 18
A110 10 -1 71
B01 12 10
```

**Quy định ghi trong tệp trên như sau:**
- Mỗi dòng sẽ bắt đầu bằng số báo danh của thí sinh; tiếp theo là ba giá trị điểm tương ứng với ba bài thi.
- Điểm thi sẽ là một số tự nhiên từ 0 đến 20.
- Nếu học sinh không làm thì bài đó ghi -1.

Em có nhiệm vụ tính toán tổng số điểm thi của các bạn học sinh và đưa dữ liệu ra tệp `ketqua.out` là danh sách ba bạn có tổng điểm cao nhất được sắp xếp giảm dần từ trên xuống dưới. Khuôn dạng dữ liệu đưa ra bao gồm: số báo danh, các điểm thi từng bài và cuối cùng là tổng điểm cả ba bài.

**Ví dụ với dữ liệu trên thì kết quả như sau:**

```
ketqua.out
C11 10 12 18 40
A12 12 -1 15 27
B01 12 10 4 26
```

----

### Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa cho cấu trúc tệp dữ liệu và kết quả đầu ra có thể được thêm vào để làm rõ hơn về cách thức hoạt động của chương trình.)

### Bảng biểu
(Bảng biểu có thể được sử dụng để trình bày các điểm thi của từng học sinh và tổng điểm của họ, giúp dễ dàng so sánh và phân tích kết quả.)
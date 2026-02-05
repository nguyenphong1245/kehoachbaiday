# BÀI 17: DỮ LIỆU MẢNG MỘT CHIỀU VÀ HAI CHIỀU

## SAU BÀI HỌC NÀY EM SẼ:
- Biết cách thiết lập và làm việc với cấu trúc dữ liệu mảng một chiều và hai chiều.
- Em đã biết thiết lập cấu trúc dữ liệu đóng vai trò quan trọng khi giải quyết trong các bài toán thực tế trên máy tính. Trong các bài toán thực tế sau em sẽ thiết lập cấu trúc dữ liệu như thế nào?
- Lập danh sách họ tên các bạn học sinh lớp em để có thể tìm kiếm, sắp xếp và thực hiện các bài toán quản lý khác.
- Giả sử lớp em cần khảo sát ý kiến theo một yêu cầu của ban giám hiệu: Mỗi học sinh cần có đánh giá theo 4 mức, ký hiệu lần lượt là Đồng ý (2); Không phản đối (1); Không ý kiến (0); Phản đối (-1). Em sẽ tổ chức dữ liệu khảo sát như thế nào để có thể dễ dàng cập nhật và tính toán theo dữ liệu khảo sát?
- Em được giao nhiệm vụ thiết lập và lưu trữ một danh sách các địa điểm là nơi các bạn trong lớp sẽ thường xuyên đến để tham quan và trải nghiệm thực tế. Mỗi địa điểm như vậy cần nhiều thông tin; nhưng thông tin quan trọng nhất là tọa độ (x; y) của thông tin đó trên bản đồ. Em sẽ dùng cấu trúc dữ liệu gì để mô tả danh sách các địa điểm này?

## CẤU TRÚC DỮ LIỆU MẢNG MỘT CHIỀU
Trong Tin học, dữ liệu mảng một chiều, thường được gọi là cấu trúc dữ liệu tuyến tính, là cấu trúc dữ liệu bao gồm một dãy các phần tử dữ liệu có cùng kiểu. Các tử của mảng sẽ được truy cập theo chỉ số, cho phép các thao tác đơn giản như cập nhật và thay đổi giá trị.

Trong Python, dữ liệu mảng một chiều có thể được biểu diễn bằng danh sách (list) với các phần tử có cùng kiểu dữ liệu.

### Hoạt động 1: Tìm hiểu cấu trúc dữ liệu mảng một chiều trong Python
Thực hiện các thao tác sau; quan sát; trao đổi và thảo luận; từ đó nhận biết về cấu trúc dữ liệu mảng một chiều trong Python:
- Thiết lập các mảng một chiều; thông qua kiểu dữ liệu list; rất đơn giản trong Python.
```python
A = [1, 3, 5, 7, 9, 11]
B = ["Hà", "Bình", "Ngọc", "Anh"]
C = [9.5, 8.0, 10, 7.2]
```

## Bài tập và câu hỏi
1. Hãy lập một danh sách các môn học mà em đang học và thực hiện các thao tác thêm, xóa, sửa trong danh sách đó.
2. Giả sử em có một danh sách điểm số của 5 môn học, hãy tính trung bình điểm của các môn học đó.
3. Tổ chức một danh sách các địa điểm tham quan và lưu trữ thông tin về tọa độ của từng địa điểm.

## Hình ảnh mô tả
- (Ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc dữ liệu mảng một chiều trong Python, bao gồm các ví dụ về cách khai báo và sử dụng mảng.)

## Bảng biểu
- (Ghi chú về bảng biểu: Bảng biểu mô tả các thao tác cơ bản trên mảng một chiều như thêm, xóa, sửa và truy cập phần tử.)



# Bài học: Cấu trúc dữ liệu mảng một chiều và hai chiều trong Python

## Nội dung lý thuyết

### 1. Mảng một chiều
- Có thể truy cập từng phần tử của mảng một chiều theo chỉ số. Toán tử `in` kiểm tra một đối tượng có nằm trong mảng hay không. Trong Python, chỉ số bắt đầu từ 0.

```python
>>> 7 in A
True
```

- Có thể dễ dàng duyệt từng phần tử của mảng một chiều bằng lệnh `for`.

```python
>>> for hs in B:
print(hs, end=' ')
```

- Các lệnh làm việc chính với danh sách trong Python đã được học trong chương trình Tin học 10, ví dụ các lệnh: `append` (bổ sung phần tử vào cuối), `remove` (xoá phần tử), `insert` (bổ sung phần tử vào vị trí bất kỳ), `clear` (xoá toàn bộ các phần tử của danh sách).

**Chú ý:** Mặc dù mảng được biểu diễn bằng dữ liệu List, nhưng không được đồng nhất khái niệm mảng của khoa học máy tính với kiểu dữ liệu List trong Python. Cấu trúc dữ liệu mảng một chiều trong Python có thể biểu diễn bằng kiểu dữ liệu danh sách (list) với chức năng truy cập dễ dàng theo chỉ số, truy cập theo vùng chỉ số. Toán tử `in` và lệnh `for in` sẽ hỗ trợ duyệt từng phần tử của mảng.

### Ví dụ minh họa
1. Sử dụng hàm `sum()` tính tổng các số của một dãy; hãy viết câu lệnh tính giá trị trung bình của dãy số A cho trước.
2. Có thể duyệt các phần tử của mảng theo chiều ngược lại; từ cuối về đầu, được không?

## 2. Cấu trúc dữ liệu mảng hai chiều
### Hoạt động 2: Mô hình list trong list của Python
Thực hiện các lệnh sau; quan sát, trao đổi và thảo luận, từ đó nhận biết về mô hình danh sách trong danh sách của Python.

- Xét dữ liệu biểu diễn điểm của học sinh trong lớp, mỗi phần tử sẽ bao gồm hai thông tin là tên học sinh và điểm số. Lệnh sau sẽ tạo một bộ dữ liệu như vậy: Ta thấy mỗi phần tử của dãy này lại là một danh sách bao gồm hai phần tử.

```python
>>> DS_diem = [["Quang", 7.5], ["Hà", 8.0], ["Bình", 9.5]]
```

- Nếu truy cập một phần tử của danh sách; ta nhận được một dãy bao gồm tên và điểm của học sinh tương ứng.

```python
>>> DS_diem[1]
['Hà', 8.0]
```

## Bài tập và câu hỏi
1. Viết chương trình Python để tính giá trị trung bình của một dãy số cho trước.
2. Hãy thử duyệt các phần tử của mảng `DS_diem` theo chiều ngược lại và in ra kết quả.

## Hình ảnh mô tả
- Hình ảnh mô tả cấu trúc dữ liệu mảng một chiều và hai chiều trong Python (ghi chú về hình ảnh: Hình ảnh minh họa cách thức hoạt động của mảng trong Python).

## Bảng biểu
- Bảng biểu mô tả các lệnh chính với danh sách trong Python:

| Lệnh     | Chức năng                                 |
|----------|-------------------------------------------|
| append   | Bổ sung phần tử vào cuối danh sách       |
| remove   | Xoá phần tử khỏi danh sách               |
| insert   | Bổ sung phần tử vào vị trí bất kỳ        |
| clear    | Xoá toàn bộ các phần tử của danh sách    |




    Muốntruycập một giá trị điểm cụ thể, ví dụ điểm của học sinh tên "Quang" , cần
thực hiện Iệnh sau:
> > > DS_diem[0] [1]
7 .5
                           tử của dãy gốc có dạng mở rộng như' sau:
                      phần
d) Lệnh duyệt các
> > > for hs,diem in DS diem:
print(hs,diem)
Quang 7.5
Hà 8.0
Bình 9.5

      Python hỗ trợ mô hinh dữ liệu danh sách trong danh sách, tức là mỗi
      phần tử của danh sách là một đối tượng dạng danh sách khác.

1. Thiết Iập mảng bao gồm dữ liệu làtoạ độ các điểm trên mặt phẳng, mỗi điểm p
được cho bởi hai toạ độ (px; py).
 2 Thiết lập mảng bao gồm dãy các thông tin là danh sách học sinh và thông tin 3
điểm thi của học sinh tương ứng các bài thi số 1,2, 3. Viết đoạn Iệnh nhập bộ dữ
 liệu trên và chương trinh in ra danh sách học sinh cùng với điểm trung binh của
các bài thi.

Hoạt động 3  Mô hinh màng hai chiêu cua Python
Đọc,trao đổi, thảo luận về cấu trúc dữ liệu mảng hai chiều trong Python

                                              bảng
    Trong tin học; một cấu trúc dữ liệu hai chiều được hiểu là mộtP     hay còn gọi
là ma trận; bao gồm các hàng và cột dữ liệu:Bảngcó thể có kích thước vuông n * n
hoặc kích thước bất kì m x n
Ví dụ mộtbảng(hay ma trận) vuông  Tổng quát mô hinhbảng |bậcm * n
bậc ba có dạng như sau:           có dạng nhu sau:

         A = 12 10 91                         a11 a12' *             ain
             11 45 20             A= a21 922                         a2n
             15 34 55
                                              am2
                                              am1                    amn
Phần tử nằm tại hàng i và cộtj sẽ kí hiệu là aij: Như vậy aij là phần tử của ma trận
tại vị tríhàngi,cột j.

83



# Bài học: Ma trận trong Python

## Nội dung lý thuyết
Ma trận kích thước m x n sẽ bao gồm m phần tử, có cấu trúc bao gồm m hàng x n cột. Trong Python, mô hình ma trận m x n sẽ dễ dàng được biểu diễn bởi cấu trúc list trong list với một mảng có m phần tử, mỗi phần tử đều có dạng list có n phần tử.

Ví dụ ma trận vuông bậc 3 ở trên có thể khai báo trong Python như sau:
```python
A = [[12, 10, 91], [11, 45, 20], [15, 34, 55]]
```
Vì mảng trong Python được đánh chỉ số từ 0 nên muốn truy cập phần tử tại hàng 3 cột 2, gõ lệnh:
```python
A[2][1]
```
Kết quả sẽ là:
```
34
```

Với cấu trúc dữ liệu 2 chiều; ví dụ như ma trận A bậc 3 ở trên, thao tác duyệt theo từng phần tử sẽ được thực hiện bằng 2 lệnh duyệt lồng nhau. Ví dụ sau cho biết cách duyệt ma trận A có 3 * 3 = 9 phần tử, kết thể hiện ma trận A theo đúng khuôn mẫu chuẩn là một bảng gồm 3 hàng, 3 cột như sau:

```python
for i in range(3):
for j in range(3):
print(A[i][j], end=' ')
print()
```
Kết quả sẽ là:
```
12 10 91
11 45 20
15 34 55
```

Trong Python, cấu trúc dữ liệu 2 chiều có thể được biểu diễn bằng mô hình list trong list. Có thể truy cập từng phần tử và duyệt cấu trúc dữ liệu 2 chiều bằng 2 lệnh for lồng nhau.

## Ví dụ minh họa
1. Câu lệnh sau sẽ tạo dữ liệu thuộc loại gì?
```python
temp = [1, 2, 3, 4]
data = [temp, temp]
```

2. Nếu A là bảng (ma trận) kích thước m x n thì đoạn chương trình sau sẽ in ra thông tin gì trên màn hình?
```python
for i in range(m):
for j in range(n):
print(A[i][j], end=' ')
print()
```

## Bài tập và câu hỏi
1. Hãy viết một chương trình Python để tạo một ma trận 4x4 và in ra các phần tử của nó.
2. Giải thích cách truy cập phần tử trong ma trận 2 chiều trong Python.

## Hình ảnh mô tả
- Hình ảnh mô tả cấu trúc ma trận 2 chiều trong Python (ghi chú về hình ảnh: Hình ảnh minh họa cách tổ chức dữ liệu trong ma trận).

## Bảng biểu
| Hàng | Cột 0 | Cột 1 | Cột 2 |
|------|-------|-------|-------|
| 0    | 12    | 10    | 91    |
| 1    | 11    | 45    | 20    |
| 2    | 15    | 34    | 55    |




# LUYỆN TẬP

## 1. Giả sử số đo chiều cao các bạn trong lớp được cho trong dãy số A. Hãy viết đoạn chương trình tính:
- Số đo chiều cao trung bình của cả lớp.
- Số bạn có chiều cao lớn hơn chiều cao trung bình của cả lớp.

## 2. Viết chương trình nhập từ bàn phím số tự nhiên m, sau đó lần lượt nhập m dòng, mỗi dòng bao gồm n số cách nhau bởi dấu cách, đưa dữ liệu đã nhập vào ma trận A sau đó in ma trận A ra màn hình.

----

# VẬN DỤNG

## 1. Viết hàm số `UnitMatrix(n)` với n là số tự nhiên cho trước; hàm trả lại giá trị là ma trận bậc n như Hình 17.1.

```
E =
```
![Hình 17.1](#)

## 2. Viết chương trình cho phép người dùng nhập từ bàn phím một dãy số tự nhiên; hãy đếm với mỗi giá trị của dãy có bao nhiêu số lặp lại. Ví dụ nếu dãy ban đầu là:
```
0 1 5 7 0 2 5 1 1 2
```
thì chương trình cần thông báo như:
![Hình 17.2](#)

----

## Ghi chú về hình ảnh:
- Hình 17.1: Mô tả ma trận đơn vị.
- Hình 17.2: Giao diện chương trình hiển thị số lần lặp lại của các số trong dãy.

----

## Bảng biểu:
- Em ghi số tiền điện gia đình em theo từng tháng vào một danh sách gồm 12 số. Mỗi năm lại ghi lại tiền điện vào một danh sách và ghép với danh sách các năm trước. Như vậy em thu được một bảng số tiền điện của năm thứ k, cột tương ứng số tiền điện theo tháng.

### Thiết lập mảng mới tính số tiền điện trung bình của các năm; mỗi năm ghi một số.
- b) Tính số tiền điện trung bình của tất cả các năm đã được ghi dữ liệu trong bảng.
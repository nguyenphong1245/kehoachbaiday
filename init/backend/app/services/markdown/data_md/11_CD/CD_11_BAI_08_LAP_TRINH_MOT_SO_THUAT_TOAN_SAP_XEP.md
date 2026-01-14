# BÀI LẬP TRÌNH MỘT SỐ THUẬT TOÁN SẮP XẾP

Học xong bài này em sẽ:
- Phát biểu được bài toán sắp xếp.
- Viết được chương trình cho một vài thuật toán sắp xếp.

Trình quản lý tệp của hệ điều hành cho phép lựa chọn hiển thị nội dung của thư mục được sắp xếp theo nhiều cách khác nhau. Em hãy cho biết một trong số các lựa chọn này và giải thích rõ thêm tiêu chí (yêu cầu) sắp xếp tương ứng:

## Bài toán sắp xếp
Một số bài toán sắp xếp như sau:
- Cho dãy các số yêu cầu sắp xếp "theo thứ tự tăng dần (giảm dần)".
- Cho dãy các chuỗi ký tự, yêu cầu sắp xếp "theo thứ tự bảng chữ cái theo độ dài".

Sắp xếp các dữ liệu trong một bảng gồm nhiều cột (hay bản ghi trong bảng kết quả học tập) theo một cột nào đó. Ví dụ: gồm các cột Họ và tên, Điểm Toán, Điểm Ngữ văn, Điểm Tin học, yêu cầu sắp xếp theo điểm môn Tin học giảm dần. Cách sắp xếp trong bảng có dạng như sau:

| Họ và tên         | Điểm Toán | Điểm Ngữ văn | Điểm Tin học |
|-------------------|-----------|---------------|---------------|
| Nguyen Van        | 7.5       | 8.0           | 6.5           |
| Tran Thi Binh     | 6.5       | 0             | 4.5           |
| Phan Minh Châu    | 3.5       | 9.5           | 8.5           |

Trong tin học, thuật ngữ sắp xếp đề cập đến việc tổ chức lại một tập hợp dữ liệu theo một tiêu chí sắp xếp, tức là đáp ứng một yêu cầu cụ thể về trình tự. Kết quả sắp xếp là một danh sách theo đúng thứ tự yêu cầu. Sắp xếp giúp tìm kiếm nhanh hơn.

Yêu cầu sắp xếp cần chỉ rõ cách so sánh hai mục dữ liệu để quyết định thứ tự.

Dưới đây trình bày bài toán sắp xếp đơn giản và minh họa:

- **Đầu vào**: Dãy n số \( a \) (không)
- **Đầu ra**: Dãy được sắp theo thứ tự tăng dần (giảm)

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Sắp xếp tại chỗ và không tại chỗ

Một thuật toán được gọi là sắp xếp tại chỗ khi không phải dùng thêm một dãy khác bên ngoài dãy ban đầu để thực hiện sắp xếp. Nó chỉ đổi chỗ các phần tử trong dãy ban đầu. Yêu cầu này rất quan trọng khi dãy cần sắp xếp rất dài.

Nếu thuật toán sử dụng một dãy khác ở bên ngoài dãy ban đầu để chứa kết quả thì gọi là sắp xếp không tại chỗ.

Các thuật toán được trình bày trong bài học đều có yêu cầu hiện với cấu trúc mang tính chuyên đề lấy chỗ trống khi thao tác chen để thay đổi vị trí.

## Nghịch thể

Hai phần tử (a, b) gọi là một nghịch thể. Nếu \( i &#x3C; j \) mà \( a \) không được sắp đúng thứ tự thì còn ít nhất một nghịch thể. Một số thuật toán sắp xếp dựa trên tưởng giảm dần và tiến đến triệt tiêu hết các nghịch thể trong dãy: Dãy được sắp xếp xong khi không còn nghịch thể nào.

## Thuật toán sắp xếp nổi bọt (Bubble Sort)

Dựa trên minh hoạ diễn biến từng bước của thuật toán sắp xếp nổi bọt được trình bày như ở Hình 1, em hãy nêu tóm tắt ý tưởng của thuật toán này.

### Hình 1

Hình trình bày diễn biến từng vòng lặp khi thực hiện thuật toán sắp xếp nổi bọt. Ký hiệu € thể hiện thao tác đổi chỗ khi có nghịch thể (cặp phần tử màu đỏ).

| Giai thích diễn biến từng vòng lặp |
|-------------------------------------|
| **Vòng lặp 1:** 55 > 12, 55 > 42, 55 &#x3C; 94, 94 > 182, 94 > 672 |
| **Sau vòng lặp 1:** |
| **Vòng lặp 2:** 19 &#x3C; 42, 42 &#x3C; 55, 55 > 18 € , 55 &#x3C; 67, 67 &#x3C; 94 |
| **Sau vòng lặp 2:** |
| **Vòng lặp 3:** 19 &#x3C; 42, 42 > 18 €, 42 &#x3C; 55, 67 &#x3C; 94 |
| **Sau vòng lặp 3:** |
| **Vòng lặp 4:** 19 > 18 €, 19 &#x3C; 42, 42 &#x3C; 55, 67 &#x3C; 94 |
| **Sau vòng lặp 4:** |
| **Vòng lặp 5:** 18 &#x3C; 19, 19 &#x3C; 42, 42 &#x3C; 55, 67 &#x3C; 94 |

### Hình 1

Diễn biến từng vòng lặp của thuật toán.



# Vòng lặp

## 5. Không nghịch thế nào nên không xảy ra đổi chỗ. Dãy đã được tìm ra đúng.

Sắp xếp thứ tự. Để biết khi nào hết thế sắp xếp xong - ta có một biến logic "có đổi chỗ" mang giá trị True hay False tùy theo có xảy ra đổi hay không.

Hình 2 là mã giả của thuật toán sắp xếp nổi bọt phiên bản thô nhất.

### Nhận xét:

```plaintext
while (True)
```

Có thể minh sau vòng lặp 1 thì số lớn nhất trong dãy sẽ được chuyển đến vị trí cuối dãy. Tức là phần tử a[n-1] đã ở đúng vị trí. Như vậy vòng lặp 2 chỉ cần nghịch thế và đổi chỗ đến vị trí n.

Ta có:

```plaintext
for i in range(0, n-1):
if a[i] > a[i + 1]:
CoDoiC'ho = True
swap(a[i], a[i + 1])
```

```plaintext
if (not CoDoiC'ho)
return
```

Sau vòng lặp 1, dãy đã ở đúng vị trí.

### Hình 2: Mã giả của thuật toán sắp xếp nổi bọt

## Thuật toán sắp xếp chèn tuyến tính (Insertion Sort)

### Mô tả thuật toán chèn tuyến tính:

- Với dãy con a chỉ có một phần tử, nên dãy con này có thứ tự.
- Lặp lại việc chèn a với i từ 1 đến n như sau:
- Xét dãy con a đã có thứ tự, ta chèn a vào dãy con này sao cho dãy con sau khi chèn sẽ có thứ tự.

### Hình 3: Minh họa diễn biến từng bước của thuật toán sắp xếp chèn tuyến tính

| Bước | Diễn biến |
|------|-----------|
| 1    | Xét a[1] = 55 > 19. Lấy ra 19. Dịch chuyển 55 qua phải, chèn 19 vào trước 55. |
| 2    | Xét a[2] = 42. 55 > 42; 19 &#x3C; 42. Lấy ra 42. Dịch chuyển 55 qua phải, chèn 42 vào trước 55. |
| 3    | Xét a[3] = 94. 55 &#x3C; 94. 94 đã nằm đúng chỗ. |
| 4    | Xét a[4] = 18. 94 > 18; 55 > 18; 42 > 18; 19 > 18. Lấy ra 18. Dịch chuyển dãy con 19, 94 qua phải, chèn 18 vào trước 19. |
| 5    | Xét a[5] = 67. 94 > 67. Lấy ra 67. Dịch chuyển 94 qua phải, chèn 67 vào trước 94. |
|      | Sắp xếp xong. |

### Hình 4: Minh họa thuật toán sắp xếp chèn tuyến tính

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Mô tả các bước của thuật toán như sau:

## Bước 0:
- i = 1;

## Bước 1:
- if i >= n: kết thúc;
- else: val = a; k = i - 1;

## Bước 2:
- if k >= 0:
- a[k + 1] = a[k];
- k = k - 1;
- đến Bước 2:
- if a[k + 1] > val:

## Bước 3:
- a[k + 1] = val;
- i = i + 1;
- đến Bước 1:

Để chèn a vào đúng chỗ của nó trong dãy, cần:
- Tìm được chỗ đúng thứ tự của a; cho k đi từ i - 1 qua trái cho đến khi a[k + 1] &#x3C; a hoặc k == -1.

b) Lấy a ra khỏi dãy: dịch chuyển dãy sang phải một vị trí để có chỗ trống cho a vào.

### Mã giả thuật toán sắp xếp chèn tuyến tính
- Thực hiện đồng thời hai việc a) và b) theo thuật toán sắp xếp chèn tuyến tính kết hợp làm cách dịch chuyển dãy lùi bước sang trái từ vị trí l.

```python
for i in range(1, n):
val = a[i]  # Xét dãy a
k = i - 1
while k >= 0 and a[k] > val:  # Chép a vào a
a[k + 1] = a[k]  # k di chuyển qua trái
k = k - 1
a[k + 1] = val
```

### Vòng lặp for bên ngoài
- Kiểm soát việc thực hiện bước (xem Hình 4).

### Vòng lặp while bên trong
- Thực hiện đồng thời cả hai việc a) và b) trong mỗi bước (xem Hình).

## Thực hành
### Nhiệm vụ 1:
- Em hãy thực hiện các công việc sau:
a) Tính số lần lặp của vòng lặp bên trong của thuật toán sắp xếp chèn tuyến tính.
b) Tính số lần lặp của vòng lặp bên ngoài của thuật toán sắp xếp chèn tuyến tính.
c) Ước lượng độ phức tạp thời gian của thuật toán sắp xếp chèn tuyến tính.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Nhiệm vụ 2
Em hãy viết chương trình Python thực hiện thuật toán sắp xếp nổi bọt:

# Nhiệm vụ 3
Em hãy viết chương trình Python thực hiện thuật toán sắp xếp chèn tuyển tính dựa trên mã giả đã cho trong bài học.

Cho danh sách Bảng điểm là kết quả học tập gồm các cột Họ và tên, điểm Toán, điểm Ngữ văn, điểm Tin học. Hãy viết chương trình sắp xếp Bảng điểm theo điểm môn Tin học giảm dần.

**Gợi ý:** Mỗi phần tử của Bảng điểm là một danh sách con; ứng với một học sinh. So sánh theo thành phần điểm Tin học của danh sách con để sắp xếp.

Theo em, thuật toán sắp xếp nổi bọt và thuật toán sắp xếp chèn, thuật toán nào đơn giản và dễ cài đặt hơn?

# Tóm tắt bài học
Thuật toán sắp xếp nổi bọt có hai vòng lặp lồng nhau: vòng lặp trong thực hiện đổi chỗ một lượt các cặp phần tử là nghịch thế, vòng lặp ngoài kiểm tra điều kiện "không xảy ra đổi chỗ".

Việc tìm vị trí chèn đúng chỗ trong thuật toán sắp xếp chèn có thể thực hiện bằng cách dịch dần từng bước.

## Bài Tìm hiểu Thêm
### CÁC HÀM PYTHON SẮP XẾP DÃY SỐ
Python có hai hàm để sắp xếp dãy số:

- **Hàm sorted:** Sắp xếp dãy đầu vào theo thứ tự tăng dần, gồm các phần tử trong dãy cũ nhưng đã sắp xếp lại theo yêu cầu. Dãy cũ vẫn còn đó.

- **Hàm sort:** Thực hiện sắp xếp tại chỗ, tức là đổi chỗ các phần tử trong dãy. Hàm này trả về None để tránh nhầm lẫn.

**Chu Ý:** `sort` áp dụng cho danh sách; trái lại `sorted` áp dụng tổng quát hơn.

**Cú pháp:**
```python
sorted(danh_sách, key=None, reverse=False)
```
```python
danh_sách.sort(key=None, reverse=False)
```

Trong đó:
- `reverse` nghĩa là xếp theo thứ tự giảm dần, mặc định là `reverse=False`.
- `key` dùng để xác định một hàm (key function) được áp dụng cho mỗi phần tử trong dãy trước khi làm phép so sánh.

Đọc bản mới nhất trên hoc10.vn.
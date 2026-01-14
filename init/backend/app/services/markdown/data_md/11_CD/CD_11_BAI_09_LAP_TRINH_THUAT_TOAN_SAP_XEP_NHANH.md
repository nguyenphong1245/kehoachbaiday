# Bài Lập Trình Thuật Toán Sắp Xếp Nhanh

Học xong bài này, em sẽ:
- Hiểu được ý tưởng của thuật toán sắp xếp nhanh
- Viết được chương trình thực hiện sắp xếp nhanh một dãy số dựa trên các mã lệnh thuật toán phân đoạn cho trước

Nếu cần chọn một trong hai việc sau đây; em sẽ chọn làm việc nào? Vì sao?
1. Từ mô tả thuật toán bằng liệt kê các bước, viết chương trình Python thực hiện thuật toán.
2. Từ chương trình Python thực hiện thuật toán, viết lại ngắn gọn ý tưởng chính của thuật toán.

## Lược đồ phân đoạn trong sắp xếp nhanh

### Thuật toán sắp xếp nhanh (Quick Sort)

Thuật toán theo chiến lược chia để trị, lặp lại nhiều lần việc phân đoạn dãy số vào thành hai đoạn con. Sau một lần phân đoạn, chỉ cần sắp xếp trong nội bộ hai đoạn con. Bài toán sắp xếp ban đầu được chia thành hai bài toán con nhỏ hơn. Việc phân đoạn lặp lại nhiều lần. Hai đoạn con lại được tiếp tục phân đoạn thành các đoạn con cho đến khi tất cả các đoạn con đều chỉ còn không quá một phần tử. Dãy ban đầu được sắp xếp xong.

### Lược đồ phân đoạn dãy số

Lấy giá trị của một phần tử trong dãy làm pivot (giá trị chốt). Giá trị pivot có thể là bất cứ tử nào trong dãy, phần tử này cũng được là pivot cho ngắn gọn.

| Phần tử | Giá trị |
|---------|---------|
| Kết quả phân đoạn (Hình 7): | Đoạn con bên trái chỉ gồm các số nhỏ hơn hay bằng pivot; đoạn con bên phải chỉ gồm các số lớn hơn hay bằng số làm pivot được chọn để dùng phân tách hai đoạn. |

Hàm thực hiện phân đoạn cần trả về vị trí phân tách dãy thành hai đoạn con, và sau đó sẽ sắp xếp trong nội bộ hai đoạn con. Sau khi phân đoạn chỉ cần sắp xếp trong nội bộ hai đoạn con thì hoàn thành việc sắp xếp cả dãy số. Bài toán sắp xếp ban đầu được chia thành hai bài toán con nhỏ hơn.

### Kết quả phân đoạn

Đoạn trái: \( lo &#x3C; i &#x3C; p \)
Đoạn phải: \( p + 1 &#x3C; i &#x3C; hi \)

Có nhiều lược đồ phân đoạn khác nhau để đạt mục đích trên.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Thuật toán sắp xếp nhanh áp dụng phân đoạn Lomuto

Em hãy cho biết liệu đồ phân đoạn Lomuto theo mã giả cho trong Hình 2 có đáp ứng cầu phân đoạn để sắp xếp nhanh như trình bày ở mục hay yêu.

Hình 2 là mã giả của thuật toán Lomuto phân đoạn dãy số \( a \); \( 10 \) là chỉ số đầu mút trái; \( hi \) là chỉ số đầu mút phải.

```plaintext
pivot = a[hi]
for j in range(lo, hi):
if a[j] &#x3C;= pivot:
swap(a[i], a[j])
return (i + 1)  # trả về chỉ số phân tách
```

### Hình 2: Mã giả thực hiện phân đoạn Lomuto

Hướng thuật toán Lomuto chọn pivot là giá trị phần tử cuối dãy số. Duy trì chỉ số ở vị trí phân tách; duyệt dãy số bằng một chỉ số \( j \) khác và dao giá trị các phần tử sao cho các phần tử ở vị trí từ \( lo \) đến \( j \) nhỏ hơn hoặc bằng pivot; các phần tử từ vị trí \( j + 1 \) đến \( hi \) lớn hơn pivot; riêng phần tử ở vị trí \( j \) đúng bằng pivot.

### Hình 3: Mã lệnh Python thực hiện sắp xếp nhanh phân đoạn Lomuto

```python
def phandoanLomuto(a, lo, hi):
pivot = a[hi]  # giá trị phân tách
i = lo - 1
for j in range(lo, hi):  # Duyệt dãy a[lo, hi]
if a[j] &#x3C;= pivot:  # Phần tử a[j] &#x3C;= Pivot
i += 1  # Tăng lên
a[i], a[j] = a[j], a[i]  # Đổi giá trị a[i], a[j]
a[i + 1], a[hi] = a[hi], a[i + 1]  # Đổi giá trị a[i + 1], a[hi]
return (i + 1)  # Hết vòng lặp, trả về chỉ số phân đoạn a[i] là pivot

def quicksort(a, lo, hi):
if lo &#x3C; hi:
p = phandoanLomuto(a, lo, hi)  # Phân đoạn
quicksort(a, lo, p - 1)  # Sắp xếp đoạn bên trái
quicksort(a, p + 1, hi)  # Sắp xếp đoạn bên phải
```

### Hình: Mã lệnh Python thuật toán sắp xếp nhanh sử dụng phân đoạn Lomuto

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Thuật toán sắp xếp nhanh áp dụng phân đoạn Hoare

## Lược đồ phân đoạn Hoare

Hoare là tác giả của thuật toán sắp xếp nhanh. Tưởng chínl của thuật toán là đôi chỗ nhảy qua điểm phân tách (pivot); rà soát từ hai phía, trái và phải, cùng tiến dần từng bước vào giữa.

### Các bước thực hiện:

1. **Bước 1**: Chọn pivot.
2. **Bước 2**:
- Tìm tử qua phải đến khi \( a[i] \) lớn hơn pivot:
- Tìm tử qua trái đến khi \( a[j] \) nhỏ hơn pivot:
- Nếu \( i &#x3C; j \):
- Hoán đổi \( a[i] \) với \( a[j] \).
- Ngược lại:
- Phân đoạn = False (Kết thúc phân đoạn).

Kết thúc: \( a[lo..hi] \) và \( a[i..j] \).

### Hình 4: Mã giả thực hiện phân đoạn Hoare

```plaintext
def partitionhoare(a, lo, hi):
pivot = a[lo]
phanDoan = True                           # Đang phân đoạn
while phanDoan:                           # Doạn
while a[i] &#x3C; pivot:                   # Qua phải đến khi a[i] > pivot
i += 1
while a[j] > pivot:                   # Qua trái đến khi a[j] &#x3C; pivot
j -= 1
# Hoán đổi a[i] với a[j]
if i &#x3C; j:
a[i], a[j] = a[j], a[i]          # Chưa gặp
else:
phanDoan = False                  # Kết thúc phân đoạn
return
```

### Hình 5: Mã lệnh thực hiện phân đoạn Hoare

```plaintext
def quicksorthoare(a, lo, hi):
if lo &#x3C; hi:
partitionhoare(a, lo, hi)
quicksorthoare(a, lo, hi)
quicksorthoare(a, lo + 1, hi)
```

Đọc bản mới nhất trên hoc10.vn                                                    Bản sách mẫu



# Thực hành

## Nhiệm vụ 1
Viết chương trình thực hiện sắp xếp nhanh một dãy số và chạy thử kiểm tra
- a) Dựa trên mã lệnh thuật toán cho trong Hình 3.
- b) Dựa trên mã lệnh thuật toán cho trong Hình 5.

## Nhiệm vụ
Bổ sung thêm các câu lệnh in kết quả trung gian vào các chương trình nói trên để có thể quan sát diễn biến từng bước thực hiện sắp xếp nhanh một dãy số.

Em hãy thực hiện các công việc sau:
1. Sửa lại thủ tục phân đoạn để có hàm `quickSort down` giảm dần.
- Gợi ý: Sửa đổi phép so sánh trong câu lệnh `if a[j] &#x3C;= pivot:` thành `if a[j] >= pivot`.
2. Tiếp tục sửa lại để có hàm `quickSort tuple down` sắp xếp danh sách các cặp (tên học sinh, điểm môn học) theo điểm môn học giảm dần.
- Gợi ý: Sửa đổi đầu vào thành danh sách các cặp (tên học sinh, điểm môn học) và thực hiện so sánh theo điểm môn học.

## Câu hỏi
Câu 1. Em hãy giải thích tại sao lại nói thuật toán sắp xếp nhanh (QuickSort) theo chiến lược chia để trị. Theo em thì diễn biến bước sắp xếp nhanh một dãy số cụ thể.

Câu 2. Phân đoạn Lomuto sẽ giống hay khác với phân đoạn Hoare?

## Tóm tắt bài học
Thuật toán sắp xếp nhanh có thể áp dụng một trong hai lược đồ phân đoạn: theo Lomuto hoặc theo Hoare.
- Lược đồ Lomuto thực hiện phân đoạn bằng cách kiểm tra theo một chiều từ trái sang phải; đổi chỗ và dịch chuyển đến vị trí phân tách hai dãy con cho đến khi thoả mãn yêu cầu phân đoạn.
- Lược đồ Hoare thực hiện phân đoạn bằng cách kiểm tra theo hai chiều; từ hai đầu dãy số tiến dần vào giữa, đổi chỗ để thoả mãn yêu cầu phân đoạn; kết thúc khi gặp nhau.
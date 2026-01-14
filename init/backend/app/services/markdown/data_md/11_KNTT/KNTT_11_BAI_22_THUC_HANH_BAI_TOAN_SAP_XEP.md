# BÀI 22 THỰC HÀNH
## BÀI TOÁN SẮP XẾP

### SAU BÀI HỌC NÀY EM SẼ
- Áp dụng được thuật toán sắp xếp trong một vài bài toán cụ thể.

Trong Bài 21, em đã được học cách triển khai thuật toán sắp xếp để sắp xếp các phần tử trong danh sách theo thứ tự tăng dần. Nếu cần sắp xếp theo thứ tự ngược lại thì câu lệnh so sánh tương ứng trong vòng lặp sẽ cần thay đổi như thế nào?

### Nhiệm vụ 1
Cho danh sách số lượng mỗi mặt hàng trong kho của một cửa hàng: Người quản lý kho cần xem các mặt hàng theo thứ tự số lượng tăng dần. Em hãy viết chương trình sắp xếp các mặt hàng trong kho theo thứ tự số lượng tăng dần; sử dụng thuật toán sắp xếp chèn; sau đó in ra màn hình dãy số vừa sắp xếp. Danh sách số lượng các mặt hàng được đọc từ tệp văn bản `kho.inp`, mỗi dòng bao gồm số lượng một mặt hàng.

#### Hướng dẫn:
**Phân tích:**
Chúng ta có thể sử dụng thuật toán sắp xếp chèn đã học ở bài học trước để sắp xếp các phần tử trong danh sách số lượng mặt hàng theo thứ tự tăng dần. Bài toán này bao gồm các bước sau:
1. Đầu tiên, chúng ta đọc số lượng các mặt hàng trong kho từ tệp văn bản.
2. Sau đó sử dụng thuật toán sắp xếp chèn để sắp xếp số lượng các mặt hàng.
3. Cuối cùng là in số lượng các mặt hàng đã sắp xếp ra màn hình.

```python
# quanlykho.py
def InsertionSort(A):
n = len(A)
for i in range(1, n):
value = A[i]
j = i - 1
while j >= 0 and A[j] > value:
A[j + 1] = A[j]
j -= 1
A[j + 1] = value

# Đọc số lượng các mặt hàng trong tệp và đưa vào danh sách
input_file = open("kho.inp", encoding="utf8")
soluong_ds = []
for line in input_file.readlines():
soluong_ds.append(int(line))
InsertionSort(soluong_ds)
print('Số lượng các mặt hàng trong kho theo thứ tự tăng dần là:')
for i in range(len(soluong_ds)):
print(soluong_ds[i])
```

### Kết quả
- Số lượng các mặt hàng trong kho theo thứ tự tăng dần sẽ được in ra màn hình.



# Nhiệm vụ 2

Cho danh sách điểm trung bình môn Tin học của các học sinh. Em hãy sử dụng thuật toán sắp xếp chọn để sắp xếp danh sách này theo thứ tự điểm trung bình giảm dần, sau đó in danh sách đã sắp xếp ra màn hình. Danh sách điểm trung bình được đọc từ tệp văn bản `diem.inp`, mỗi dòng bao gồm điểm trung bình của một học sinh.

## Hướng dẫn:

### Phân tích:
Chúng ta có thể sử dụng thuật toán sắp xếp chọn đã học ở bài học trước để sắp xếp danh sách điểm số. Chú ý đề bài yêu cầu sắp xếp danh sách theo thứ tự điểm trung bình giảm dần. Do đó ở mỗi vòng lặp của thuật toán sắp xếp chọn, chúng ta phải tìm kiếm phần tử có giá trị cao nhất; thay vì tìm phần tử có giá trị bé nhất. Bài toán này bao gồm các bước sau:

1. Đầu tiên, chúng ta đọc điểm trung bình từ tệp văn bản `diem.inp`.
2. Sau đó sử dụng thuật toán sắp xếp chọn đã học ở bài trước để sắp xếp điểm trung bình theo thứ tự giảm dần.
3. Cuối cùng là in danh sách điểm trung bình đã sắp xếp ra màn hình.

### Mã nguồn:
```python
def SelectionSort(A):
n = len(A)
for i in range(n-1):
iMax = i
for j in range(i+1, n):
if A[j] > A[iMax]:
iMax = j
A[i], A[iMax] = A[iMax], A[i]

input_file = open("diem.inp", encoding="utf8")
diem_ds = []
for line in input_file.readlines():
diem_ds.append(float(line))
SelectionSort(diem_ds)
print("Danh sách điểm theo thứ tự giảm dần là:")
for i in range(len(diem_ds)):
print(diem_ds[i])
```

## LUYÊN TÂP
1. Sử dụng thuật toán sắp xếp chọn viết lại chương trình trong Nhiệm vụ 1.
2. Sử dụng thuật toán sắp xếp nổi bọt viết lại chương trình trong Nhiệm vụ 2.

## VÂN DUNG
Một đi mua hàng với danh sách các mặt hàng cần mua; đơn giá từng mặt hàng và số lượng hàng cần mua được lưu trong tệp văn bản `muahang.inp`. Hãy sử dụng thuật toán nổi bọt để sắp xếp các mặt hàng theo thứ tự thành tiền của các mặt hàng tăng dần rồi in ra tên các mặt hàng và thành tiền tương ứng.
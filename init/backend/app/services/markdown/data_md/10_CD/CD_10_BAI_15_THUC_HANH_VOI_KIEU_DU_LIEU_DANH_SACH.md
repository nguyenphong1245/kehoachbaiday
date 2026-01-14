# BÀI 15: THỰC HÀNH VỚI KIỂU DỮ LIỆU DANH SÁCH

Học xong bài này, em sẽ:
- Viết được chương trình đơn giản sử dụng kiểu dữ liệu danh sách.
- Làm quen và khai thác được một số hàm xử lý danh sách.

## Bài 1: Cập nhật danh sách
Viết chương trình nhập vào từ bàn phím một danh sách các số nguyên, sau đó thực hiện:
- Thay thế các phần tử âm bằng -1
- Thay thế các phần tử dương bằng 1, giữ nguyên các phần tử tri 0

Đưa ra màn hình danh sách nhận được.

### Ví dụ:

| INPUT                          | OUTPUT                       |
|--------------------------------|------------------------------|
| -5 0 6 8 -3 -4 -2 0 4 6       | -1 0 1 1 -1 -1 -1 0 1 1     |

### Hướng dẫn:
- Tạo danh sách `a` từ dữ liệu nhập vào:
- Duyệt các phần tử (với `i` từ 0 đến `len(a) - 1`) và thay thế nếu `a[i] &#x3C; 0`.

Lưu ý: Lệnh `print()` chưa tham số `end` để thêm dấu cách giữa các phần tử của danh sách.

Tham khảo chương trình ở Hình 1.

```python
print("Nhập dãy số nguyên")
a = [int(i) for i in input().split()]
n = len(a)
for i in range(n):
if a[i] > 0:
a[i] = 1
elif a[i] &#x3C; 0:
a[i] = -1
for i in a:
print(i, end=' ')
```

### Hình 1: Một chương trình cho bài toán Cập nhật danh sách

Đọc sách tại học O.vn 107



# Bài 2: Các số đặc biệt của dãy số

Viết chương trình nhập vào từ bàn phím một dãy số nguyên `a`; đếm và đưa ra màn hình số lượng các tử lớn hơn và đúng trước và đúng sau nó.

## Ví dụ:
### INPUT
```
5 -3 0 4 -1 2 -6 -4 45 9 -12 15
```
### OUTPUT
```
...
```

## Hướng dẫn:
1. Tạo danh sách
2. Duyệt các phần tử `a` (với `i = 1, 2, ..., len(a) - 1`)
3. Đếm các phần tử `a` thỏa mãn điều kiện:
- Nếu \( a[i-1] &#x3C; a[i] > a[i+1] \) thì `count = count + 1`

Tham khảo chương trình ở Hình 2.

```python
print("Nhập một dãy số nguyên")
a = [int(i) for i in input().split()]
count = 0
for i in range(1, len(a) - 1):
if a[i-1] &#x3C; a[i] > a[i+1]:
count += 1
print(count)
```

### Hình 2. Một chương trình cho bài toán Các số đặc biệt của dãy số

----

# Bài 3: Giày Của Các Nhân Vật

Có n đôi giày cùng loại nhưng khác nhau về kích cỡ được xếp thành một hàng theo thứ tự ngẫu nhiên. Chủ trò bí mật lấy một chiếc giày và giấu đi, sau đó yêu cầu người chơi cho biết chiếc giày được giấu là chiếc giày trái hay phải và có số là bao nhiêu.

Hà My muốn viết một chương trình nhập vào một dãy, mỗi số trong dãy mô tả một chiếc giày. Số có giá trị âm cho biết đó là giày trái, số có giá trị dương cho biết đó là giày phải, trị tuyệt đối của số là kích cỡ của giày. Chương trình sẽ cho biết chiếc giày nào còn thiếu trong dãy.

### Hình 3. Ví dụ hai đôi giày bị giấu.

Chiếc giày kích cỡ 37 bên trái.



# Thường để tìm ra chiếc giày còn thiếu là đi ghép các đôi giày, tuy nhiên

Cách làm thông thường này sẽ mất nhiều thời gian: Một cách làm đơn giản là dựa trên nhận xét: Nếu dãy không thiếu chiếc giày nào thì tổng bằng 0, nên có thể xác định chiếc giày còn thiếu khi biết tổng các số trong dãy. Hình 4 là chương trình mà Hà My viết theo cách làm trên; tuy nhiên chương trình vẫn còn có lỗi. Em hãy giúp Hà My sửa các lỗi để nhận được chương trình chạy được và cho ra kết quả đúng:

```python
print("Nhập vào một dãy số size giày")
shoes = [int(s) for s in input().split()]
sum = 0
for i in range(len(shoes)):
sum += shoes[i]
if sum == 0:
print("Chiếc giày bên trái kích cỡ", sum)
else:
print("Chiếc giày bên phải kích cỡ", sum)
```

Hình 4: Chương trình Hà My viết

## Quản lí tiền điện

Viết chương trình nhập vào 12 số nguyên dương tương ứng là tiền điện của tháng trong năm vừa rồi của nhà em, đưa ra màn hình các thông tin sau:
- Tổng số tiền điện của cả năm và tiền điện trung bình theo tháng.
- Liệt kê các tháng có số tiền điện nhiều hơn tiền điện trung bình theo tháng.

### BÀI ĐỌC THÊM

#### DANH SÁCH LỒNG NHAU VÀ DANH SÁCH RỖNG

Python cho phép mỗi phần tử của một danh sách cũng có thể là một danh sách phân cấp.

Ví dụ:
```python
Danhsach1 = ["Cành điều", [2018, 2021, 2022]]
```
Phần tử cuối của Danhsach1 là một danh sách; đó là `[2018, 2021, 2022]`.

Danh sách Tổng là danh sách không có phần tử nào và được mô tả là: `[]`.

Ví dụ:
```python
Danhsach2 = []
```
Nếu thực hiện câu lệnh `print(Danhsach2)`, ta sẽ không thấy trên màn hình hiển thị gì.
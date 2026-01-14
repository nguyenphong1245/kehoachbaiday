# BÀI 8: CÂU LỆNH LẶP

Học xong bài này, em sẽ:
- Biết được có hai loại cấu trúc lặp để mô tả thuật toán: lặp với số lần biết trước và lặp với số lần không biết trước.
- Viết được câu lệnh lặp dạng `for` và dạng `while` trong Python.

Nếu em kiểm tra tuần tự dòng bảng điểm thi môn Tin học của lớp để biết được điểm của từng bạn trong lớp, thì số lần lặp là bao nhiêu? Nếu chỉ cần tìm được tên của một bạn được điểm 10 thì số lần lặp là bao nhiêu?

## Cấu trúc lặp trong mô tả thuật toán

Em đã biết, khi có một (hay nhiều) thao tác cần được thực hiện lặp lại một số lần liên tiếp trong trình thực hiện thuật toán thì cần dùng câu trúc lặp. Có những thuật toán mà ta biết trước được số lần lặp của những thao tác cần lặp lại. Nhưng cũng có những thuật toán ta không biết trước được số lần lặp mà chỉ đến khi thực hiện thuật toán với những dữ liệu đầu vào cụ thể mới biết được.

### Ví dụ 1
Thuật toán của việc in ra màn hình máy tính 10 dòng `Xin chào Python` là thuật toán có cấu trúc lặp với số lần biết trước.

### Ví dụ 2
Khi mô tả thuật toán cho máy tính hỏi và kiểm tra mật khẩu thì máy tính không tính trước đúng thì máy tính còn hỏi lại. Đây là thuật toán có cấu trúc lặp với số lần không biết trước.

Với hai mẫu mô tả cấu trúc lặp ở Hình 1, em hãy mô tả hai thuật toán ở Ví dụ 1 và Ví dụ 2.

| Mẫu mô tả cấu trúc lặp có số lần biết trước | Mẫu mô tả cấu trúc lặp không biết trước số lần lặp |
|---------------------------------------------|---------------------------------------------------|
| Lặp với đếm từ số đếm đầu đến số đếm cuối: | Lặp khi điều kiện lặp được thoả mãn:              |
| Câu lệnh hay nhóm câu lệnh                  | Câu lệnh hay nhóm câu lệnh                         |
| Hết lặp                                     | Hết lặp                                           |

Đa80 sách tai hoc1O.vn



# Các ngôn ngữ lập trình bậc cao

Các ngôn ngữ lập trình bậc cao đều cung cấp các câu lệnh để lập trình mô tả người được hai loại cấu trúc lặp nêu trên: Cũng như ở các mẫu mô tả cấu trúc lặp trong thuật toán (Hình 1), câu lệnh lặp với số lần biết trước trong ngôn ngữ lập trình bậc cao cần dùng một biến để đếm số lần lặp. Trong khi đó, ở câu lệnh lặp với số lần lặp không biết trước phải có biểu thức logic thể hiện điều kiện lặp.

## Câu lệnh lặp với số lần lặp biết trước trong Python

Trong Python, câu lệnh lặp với số lần biết trước có dạng:

```
for biến chạy in range(m, n):
# Khối lệnh cần lặp
```

### Danh sách quán lý số lần lặp

Hình 2. Cấu trúc câu lệnh lặp dạng `for`

Trong câu lệnh lặp `for`, hàm `range(m, n)` dùng để khởi tạo dãy số nguyên từ m đến n-1 (với m &#x3C; n). Trường hợp m = 0, hàm `range(n, n)` có thể viết gọn là `range(n)`.

### Ví dụ 3

Hình 3 minh họa một câu lệnh `for` trong Python và kết quả thực hiện.

```
for dem in range(1, 11):
print("Xin chào Python")
```

Kết quả:

```
Xin chào Python
Xin chào Python
Xin chào Python
Xin chào Python
Xin chào Python
Xin chào Python
Xin chào Python
Xin chào Python
Xin chào Python
Xin chào Python
```

Sau `for` phải lùi vào trong (còn gọi là thân vòng lặp).

Hình 3. Ví dụ một câu lệnh `for`

### Ví dụ 4

Viết chương trình nhập n từ bàn phím và tính tổng các số tự nhiên chia hết cho 3 nhỏ hơn n.

```python
n = int(input("n: "))
sum = 0
for i in range(1, n):
if i % 3 == 0:
sum += i
print("Tổng của các số tự nhiên nhỏ hơn n và chia hết cho 3 là:", sum)
```

Đọc sách tại học O.vn 81



# Câu lệnh lặp với số lần lặp không biết trước trong Python

Trong Python, câu lệnh lặp với số lần không biết trước có dạng:

```
while &#x3C;điều kiện>:
Câu lệnh hay nhóm câu lệnh
```

## Ví dụ 5

Các mang tính cá nhân thường dùng mật khẩu để xác nhận quyền sử dụng. Chương trình ở Hình 5 yêu cầu người dùng nhập mật khẩu. Người dùng sẽ được yêu cầu nhập lại cho đến khi nhập đúng mật khẩu (là HN123). Khi dữ liệu nhập vào đúng là HN123 thì thông điệp "Bạn đã nhập đúng mật khẩu" xuất hiện trên màn hình.

```python
password = input("Nhập mật khẩu: ")
while (password != "HN123"):
password = input("Nhập mật khẩu: ")
print("Bạn đã nhập đúng mật khẩu")
```

**Hình 5. Chương trình nhập mật khẩu đúng**

## Ví dụ 6

Chương trình ở Hình 6 khi thực hiện sẽ in ra màn hình các số từ 1 đến 6. Điều kiện lặp là `sodem &#x3C;= 6`. Khi điều kiện lặp đúng thì `sodem` được in ra màn hình và được tăng lên 1 đơn vị; rồi điều kiện lặp được kiểm tra lại. Quá trình trên được lặp lại cho đến khi `sodem > 6` thì vòng lặp kết thúc.

```python
sodem = 1
while (sodem &#x3C;= 6):
print(sodem)
sodem = sodem + 1
```

**Hình 6. Chương trình sử dụng câu lệnh while**

Trong chương trình ở Ví dụ 6, em có thể dùng câu lệnh `for` thay cho câu lệnh `while` để chương trình khi chạy vẫn cho cùng kết quả được không?

Để thuận lợi cho việc lập trình, các ngôn ngữ lập trình bậc cao thường cung cấp cả hai câu lệnh lặp `for` và `while` tương ứng thể hiện lặp với số lần biết trước và lặp với số lần không biết trước. Tuy nhiên, dùng câu lệnh `while` ta cũng thể hiện được cấu trúc lặp với số lần biết trước.



# Bài 1
Em hãy dự đoán chương trình hinh bên đưa ra màn hình những gì.

```python
for counter in range(1, 11):
print(counter)
```

# Bài 2
Trong các chương trình trò chơi, người dẫn chương trình thường đếm ngược để bắt đầu trò chơi. Em hãy viết chương trình nhập một số nguyên n, sau đó in ra các giá trị từ n về 1 để mô phỏng quá trình đếm ngược (Hình 7).

![Hình 7. Một kết quả chương trình đếm ngược](#)

Mẹ em dự định tiết kiệm một khoản tiền tại một ngân hàng có lãi suất 5% gửi một năm; nghĩa là sau mỗi năm tiền lãi nhận được là 5% số tiền gửi. Hết một năm; nếu mẹ không rút tiền thì cả vốn lẫn lãi sẽ tự động được gửi tính cho năm tiếp theo. Em hãy viết chương trình nhập vào số tiền T (đơn vị triệu đồng) sau đó tính lãi và đưa ra 10 dòng, mỗi dòng ghi số tiền sau mỗi năm trong 10 năm gửi liên tiếp cả gốc lẫn lãi để mẹ tham khảo.

## Trong các câu sau đây, những câu nào đúng?
1. Trong các ngôn ngữ lập trình bậc cao đều có câu lệnh thể hiện cấu trúc lặp.
2. Trong Python chỉ có câu lệnh lặp `while` để thể hiện cấu trúc lặp.
3. Trong Python chỉ có câu lệnh lặp `for` để thể hiện cấu trúc lặp.
4. Có thể sử dụng câu lệnh `while` để thể hiện cấu trúc lặp với số lần lặp biết trước.
5. Có thể sử dụng câu lệnh `for` để thể hiện cấu trúc lặp với số lần lặp chưa biết trước.

## Tóm tắt bài học
- Các ngôn ngữ lập trình bậc cao đều có câu lệnh thể hiện cấu trúc lặp của thuật toán.
- Câu lệnh thể hiện lặp với số lần biết trước cần phải sử dụng một biến để kiểm soát được số lần lặp.
- Câu lệnh thể hiện lặp với số lần không biết trước sử dụng một biểu thức logic làm điều kiện lặp.

### Câu lệnh lặp trong Python có hai cơ bản là:
```python
for biến_chạy in danh_sách_giá_trị:
```
```python
while &#x3C;điều kiện>:
```
- Câu lệnh `for` nhóm câu lệnh
- Câu lệnh `while` nhóm câu lệnh

Đọc sách tại học O.vn 83
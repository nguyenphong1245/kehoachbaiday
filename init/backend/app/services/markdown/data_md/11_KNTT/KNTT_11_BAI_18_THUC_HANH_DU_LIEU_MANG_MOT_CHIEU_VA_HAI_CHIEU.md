# BÀI 78  THỰC HÀNH DỮ LIỆU MẢNG
## MỘT CHIỀU VÀ HAI CHIỀU

### SAU BÀI HỌC NÀY EM SẼ:
- Sử dụng được mảng một chiều và hai chiều trong lập trình.
- Sử dụng được kiểu dữ liệu list trong một vài bài toán cụ thể.

## Nhiệm vụ 1
Viết chương trình quản lý điểm kiểm tra một môn học của một học sinh trong một học kỳ.

Chương trình được thực hiện như sau:
1. **Nhập điểm**: yêu cầu người dùng nhập các đầu điểm kiểm tra (từ hai đầu điểm trở lên).
2. **Thống kê điểm**: chương trình duyệt qua các đầu điểm rồi tính và in ra điểm trung bình kiểm tra, điểm thấp nhất, cao nhất.

### Hướng dẫn:
**Phân tích**: Nhiệm vụ này có thể được thực hiện bằng cách sử dụng mảng một chiều, cụ thể là sử dụng danh sách trong Python. Việc nhập điểm được thực hiện ngay trên màn hình. Sau khi đã có danh sách các đầu điểm, dùng cấu trúc `for` để lặp qua các phần tử của mảng để tính tổng điểm, thống kê điểm cao nhất, thấp nhất:

```python
marks = []
line = input("Hãy nhập các điểm kiểm tra cách nhau bởi dấu cách: ")
marks = [float(x) for x in line.split()]
total = 0
Min = marks[0]
Max = marks[0]
for m in marks:
total += m
if Min > m:
Min = m
if Max &#x3C; m:
Max = m
print("Điểm trung bình: ", total / len(marks))
print("Điểm cao nhất: ", Max)
print("Điểm thấp nhất: ", Min)
```

## Nhiệm vụ 2
Viết chương trình quản lý điểm kiểm tra một môn học trong một học kỳ của tất cả học sinh trong lớp.

Chương trình được thực hiện như sau:



# Nhập Dữ Liệu
Yêu cầu người dùng nhập số học sinh trong lớp; sau đó với mỗi học sinh hỏi người dùng nhập tên học sinh rồi nhập các đầu điểm của học sinh đó.

# Thống Kê Dữ Liệu
Chương trình in ra danh sách các học sinh với điểm trung bình kiểm tra của họ, tên học sinh có điểm trung bình cao nhất và điểm kiểm tra thấp nhất trong tất cả các đầu điểm.

## Hướng Dẫn
### Phân Tích
Nhiệm vụ này có thể được thực hiện bằng cách sử dụng một mảng hai chiều để lưu tất cả điểm của học sinh trong lớp, mỗi hàng là điểm của một sinh viên, điểm cụ thể là các phần tử của hàng. Để thống kê cần dùng vòng lặp để duyệt qua từng hàng, tính trung bình từng hàng và xét từng điểm để tìm ra đầu điểm thấp nhất. Trong khi tính, tìm điểm trung bình kiểm tra của từng học sinh, cần lưu lại số thứ tự của học sinh có điểm trung bình cao nhất để tham chiếu in ra tên của học sinh đó.

```python
# qldiem_ca_lop.py
names = []
marks_all = []

n = int(input("Hãy nhập số lượng học sinh: "))

for i in range(n):
name = input("Tên học sinh thứ " + str(i + 1) + ": ")
names.append(name)
line = input("Điểm kiểm tra của học sinh thứ " + str(i + 1) + ": ")
marks = [float(x) for x in line.split()]
marks_all.append(marks)

# Định nghĩa các biến để thống kê
max_avg = 0
index_max_avg = 0
Min = marks_all[0][0]

# Duyệt qua mảng 2 chiều
for i in range(n):
total = 0
for j in range(len(marks_all[i])):
total += marks_all[i][j]
if Min > marks_all[i][j]:
Min = marks_all[i][j]
avg = total / len(marks_all[i])
```

### Kết Quả
- Danh sách học sinh với điểm trung bình.
- Tên học sinh có điểm trung bình cao nhất.
- Điểm kiểm tra thấp nhất trong tất cả các đầu điểm.



```python
print("Điểm trung bình của", names[i], ":", avg)
if max_avg &#x3C; avg:
max_avg = avg
index_max_avg = i

# In ra kết quả
print(names[index_max_avg], "đạt điểm trung bình cao nhất lớp:", max_avg)
print("Điểm thấp nhất:", Min)

# LUYỆN TẬP
1. Chỉnh sửa lại chương trình của Nhiệm vụ 1 để bổ sung chức năng:
a) Thông báo điểm đầu tiên và điểm cuối cùng trong danh sách:
b) Cho phép người dùng tra cứu đầu điểm thứ n với quy ước n bắt đầu từ 1. Nếu n lớn hơn tổng số đầu điểm hoặc nhỏ hơn 1, cần thông báo không hợp lệ và yêu cầu người dùng nhập lại.

2. Chỉnh sửa lại chương trình để người dùng có thể:
a) Tra cứu các đầu điểm kiểm tra theo STT (số thứ tự) của học sinh. Quy ước số thứ tự bắt đầu từ 1. Nếu người dùng nhập STT lớn hơn số lượng học sinh thi, chương trình thông báo STT không hợp lệ và yêu cầu nhập lại.
b) Tra cứu điểm kiểm tra cụ thể lần thứ n của một học sinh theo STT. Nếu n và STT không hợp lệ, chương trình cần thông báo và yêu cầu nhập lại.

# VẬN DỤNG KẾT NỐI TRI THỨC
1. Viết chương trình nhập vào từ bàn phím danh sách tên (không gồm họ và đệm) học sinh cách nhau bởi dấu cách và lưu vào trong một mảng. Giả thiết rằng tên không gồm khoảng trắng. Sau đó hãy thống kê xem có bao nhiêu tên khác nhau và mỗi tên xuất hiện bao nhiêu lần trong danh sách.

2. Viết chương trình nhập từ bàn phím số tự nhiên m và n. Sau đó lần lượt nhập m dòng, mỗi dòng bao gồm n số cách nhau bởi dấu cách. Đưa dữ liệu đã nhập vào ma trận A, in ma trận A ra màn hình. Sau đó:
a) Tính tổng các phần tử ma trận A.
b) In ra dòng có tổng các phần tử lớn nhất (nếu có nhiều dòng bằng nhau thì in tất cả các dòng).
c) In ra giá trị các phần tử phân biệt trong ma trận tức là nếu có các giá trị xuất hiện nhiều lần trong ma trận A thì chỉ in ra một lần.

Cho phép người dùng tìm số lần xuất hiện của một số bất kỳ trong ma trận A; ví dụ người dùng nhập vào số 3, chương trình thông báo số 3 xuất hiện x lần trong ma trận tại các vị trí cột (i, j) cụ thể.
```
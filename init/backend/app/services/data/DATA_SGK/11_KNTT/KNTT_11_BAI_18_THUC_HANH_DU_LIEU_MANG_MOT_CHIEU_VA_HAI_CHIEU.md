# BÀI 78  THỰC HÀNH DỮ LIỆU MẢNG
## MỘT CHIỀU VÀ HAI CHIỀU

### SAU BÀI HỌC NÀY EM SẼ:
- Sử dụng được mảng một chiều và hai chiều trong lập trình.
- Sử dụng được kiểu dữ liệu list trong một vài bài toán cụ thể.

### Nhiệm vụ 1
Viết chương trình quản lý điểm kiểm tra một môn học của một học sinh trong một học kỳ.

Chương trình được thực hiện như sau:
- Nhập điểm: yêu cầu người dùng nhập các đầu điểm kiểm tra (từ hai đầu điểm trở lên).
- Thống kê điểm: chương trình duyệt qua các đầu điểm rồi tính và in ra điểm trung bình kiểm tra, điểm thấp nhất, cao nhất.

#### Hướng dẫn:
**Phân tích:** Nhiệm vụ này có thể được thực hiện bằng cách sử dụng mảng một chiều, cụ thể là sử dụng danh sách trong Python. Việc nhập điểm được thực hiện ngay trên màn hình. Sau khi đã có danh sách các đầu điểm, dùng cấu trúc for để lặp qua các phần tử của mảng để tính tổng điểm, thống kê điểm cao nhất, thấp nhất:

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

### Nhiệm vụ 2
Viết chương trình quản lý điểm kiểm tra một môn học trong một học kỳ của tất cả học sinh trong lớp.

Chương trình được thực hiện như sau:

*(Nội dung chi tiết cho Nhiệm vụ 2 chưa được cung cấp trong đoạn văn bản trên.)*



# Bài học: Nhập và Thống kê Điểm Học Sinh

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách nhập dữ liệu về điểm số của học sinh trong lớp và thống kê các thông tin liên quan đến điểm số đó. Chương trình sẽ yêu cầu người dùng nhập số lượng học sinh, tên của từng học sinh và các điểm kiểm tra của họ. Sau đó, chương trình sẽ in ra danh sách các học sinh cùng với điểm trung bình của họ, tên học sinh có điểm trung bình cao nhất và điểm kiểm tra thấp nhất trong tất cả các đầu điểm.

## Ví dụ minh họa
Giả sử có 3 học sinh trong lớp:
- Học sinh 1: Nguyễn Văn A, điểm: 8, 7, 9
- Học sinh 2: Trần Thị B, điểm: 6, 5, 7
- Học sinh 3: Lê Văn C, điểm: 9, 10, 8

Kết quả thống kê sẽ là:
- Danh sách học sinh và điểm trung bình:
- Nguyễn Văn A: 8.0
- Trần Thị B: 6.0
- Lê Văn C: 9.0
- Học sinh có điểm trung bình cao nhất: Lê Văn C
- Điểm kiểm tra thấp nhất: 5

## Bài tập và câu hỏi
1. Viết chương trình để nhập dữ liệu cho 5 học sinh và in ra danh sách cùng với điểm trung bình của họ.
2. Thay đổi chương trình để cho phép người dùng nhập số lượng học sinh tùy ý.
3. Tìm hiểu cách sử dụng mảng một chiều để lưu trữ điểm số thay vì mảng hai chiều.

## Hình ảnh mô tả
*Hình ảnh mô tả có thể là một sơ đồ luồng chương trình hoặc một bảng thống kê điểm số của học sinh.*

## Bảng biểu
| Tên Học Sinh   | Điểm 1 | Điểm 2 | Điểm 3 | Điểm Trung Bình |
|----------------|--------|--------|--------|------------------|
| Nguyễn Văn A   | 8      | 7      | 9      | 8.0              |
| Trần Thị B     | 6      | 5      | 7      | 6.0              |
| Lê Văn C       | 9      | 10     | 8      | 9.0              |

## Mã nguồn
```python
# Nhập dữ liệu
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
if avg > max_avg:
max_avg = avg
index_max_avg = i

# In kết quả
print("Học sinh có điểm trung bình cao nhất:", names[index_max_avg])
print("Điểm kiểm tra thấp nhất:", Min)
```



# Bài học: Lập trình Python cơ bản

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu về cách sử dụng các cấu trúc điều khiển trong Python, bao gồm vòng lặp và điều kiện. Chúng ta cũng sẽ học cách xử lý danh sách và mảng, cũng như cách nhập và xuất dữ liệu.

## Ví dụ minh họa
```python
names = ["An", "Bình", "Cường", "Duy"]
scores = [8, 9, 7, 6]
max_avg = 0
index_max_avg = 0

for i in range(len(scores)):
avg = scores[i]
print("Điểm trung bình của", names[i], "là", avg)
if max_avg &#x3C; avg:
max_avg = avg
index_max_avg = i

# In ra kết quả
print(names[index_max_avg], "đạt điểm trung bình cao nhất lớp:", max_avg)
print("Điểm thấp nhất:", min(scores))
```

## Bài tập và câu hỏi
1. Chỉnh sửa lại chương trình của Nhiệm vụ 1 để bổ sung chức năng:
a) Thông báo điểm đầu tiên và điểm cuối cùng trong danh sách.
b) Cho phép người dùng tra cứu điểm thứ n với quy ước n bắt đầu từ 1. Nếu n lớn hơn tổng số điểm hoặc nhỏ hơn 1, cần thông báo không hợp lệ và yêu cầu người dùng nhập lại.

2. Chỉnh sửa lại chương trình để người dùng có thể:
a) Tra cứu các điểm kiểm tra theo STT (số thứ tự) của học sinh. Quy ước số thứ tự bắt đầu từ 1. Nếu người dùng nhập STT lớn hơn số lượng học sinh thi, chương trình thông báo STT không hợp lệ và yêu cầu nhập lại.
b) Tra cứu điểm kiểm tra cụ thể lần thứ n của một học sinh theo STT. Nếu n và STT không hợp lệ, chương trình cần thông báo và yêu cầu nhập lại.

## Vận dụng kiến thức
1. Viết chương trình nhập vào từ bàn phím danh sách tên (không gồm họ và đệm) học sinh cách nhau bởi dấu cách và lưu vào trong một mảng. Giả thiết rằng tên không gồm khoảng trắng. Sau đó hãy thống kê xem có bao nhiêu tên khác nhau và mỗi tên xuất hiện bao nhiêu lần trong danh sách.

2. Viết chương trình nhập từ bàn phím số tự nhiên m và n. Sau đó lần lượt nhập m dòng, mỗi dòng bao gồm n số cách nhau bởi dấu cách. Đưa dữ liệu đã nhập vào ma trận A, in ma trận A ra màn hình. Sau đó:
a) Tính tổng các phần tử ma trận A.
b) In ra dòng có tổng các phần tử lớn nhất (nếu có nhiều dòng bằng nhau thì in tất cả các dòng).
c) In ra giá trị các phần tử phân biệt trong ma trận tức là nếu có các giá trị xuất hiện nhiều lần trong ma trận A thì chỉ in ra một lần. Cho phép người dùng tìm số lần xuất hiện của một số bất kỳ trong ma trận A; ví dụ người dùng nhập vào số 3, chương trình thông báo số 3 xuất hiện x lần trong ma trận tại các vị trí cột (i, j) cụ thể.

## Hình ảnh mô tả
*Hình ảnh mô tả có thể bao gồm các sơ đồ, biểu đồ hoặc hình ảnh minh họa cho các khái niệm đã học trong bài.*

## Bảng biểu
| Tên học sinh | Điểm |
|--------------|------|
| An           | 8    |
| Bình         | 9    |
| Cường       | 7    |
| Duy          | 6    |

*Bảng biểu này thể hiện danh sách tên học sinh và điểm số tương ứng của họ.*
**Tiêu đề bài học: Hàm thiết kế sẵn của Python**

**Nội dung lý thuyết:**
Trong chương trình, người ta chỉ cần thay cả khối lệnh bằng chương trình con tương ứng. Trong Python, các hàm chính có thể kể tên một số hàm trong số các lệnh đã học hay có những đặc điểm chung gì?

**1. Tìm hiểu một số hàm của Python:**
Một số câu lệnh trong Bảng 26.1 và cho biết những câu lệnh này có chức năng gì.

**Bảng 26.1. Một số lệnh trong Python:**
| Lệnh       | Chức năng                          |
|------------|------------------------------------|
| len( )     | Trả về độ dài của một đối tượng   |
| range( )   | Tạo một dãy số                     |
| bool( )    | Chuyển đổi giá trị thành kiểu boolean |
| float( )   | Chuyển đổi giá trị thành kiểu số thực |
| round( )   | Làm tròn số                        |
| chr( )     | Trả về ký tự tương ứng với mã ASCII |
| input( )   | Nhận dữ liệu từ người dùng        |
| divmod( )  | Trả về thương và số dư của phép chia |
| int( )     | Chuyển đổi giá trị thành kiểu số nguyên |
| print( )   | In giá trị ra màn hình            |

**Ví dụ minh họa:**
- Sử dụng hàm `len()` để tìm độ dài của một chuỗi:
```python
my_string = "Hello, World!"
print(len(my_string))  # Kết quả: 13
```

- Sử dụng hàm `range()` để tạo một dãy số:
```python
for i in range(5):
print(i)  # Kết quả: 0 1 2 3 4
```

**Bài tập và câu hỏi:**
1. Hãy viết một chương trình sử dụng hàm `input()` để nhận tên người dùng và in ra độ dài của tên đó.
2. Giải thích chức năng của hàm `divmod()` và cho ví dụ minh họa.

**Hình ảnh mô tả:**
(Ghi chú về hình ảnh: Hình ảnh minh họa các hàm trong Python có thể bao gồm biểu đồ hoặc sơ đồ thể hiện cách thức hoạt động của các hàm này.)

**Bảng biểu:**
- Bảng 26.1 đã được trình bày ở trên, thể hiện các lệnh và chức năng của chúng trong Python.



# TIÊU ĐỀ BÀI HỌC: CÁC HÀM TỰ ĐỊNH NGHĨA

## NỘI DUNG LÝ THUYẾT
Trong Python, bên cạnh các hàm thiết kế sẵn, người dùng còn có thể tự định nghĩa các hàm theo nhu cầu của mình. Các hàm tự định nghĩa giúp tổ chức mã nguồn tốt hơn và tái sử dụng mã hiệu quả.

### 1. Cách thiết lập hàm trong Python
Để định nghĩa một hàm trong Python, ta sử dụng từ khóa `def`, theo sau là tên hàm và danh sách các tham số.

### Ví dụ minh họa
#### a. Viết hàm có trả lại giá trị
```python
def inc(n):
return n + 1
```
- **Tên hàm**: `inc`
- **Tham số hàm**: số `n`
- **Giá trị trả lại**: số `n + 1`

#### b. Viết hàm không trả lại giá trị
```python
def thong_bao(msg):
print("Thông báo bạn:", msg)
```
- **Tên hàm**: `thong_bao`
- **Tham số hàm**: `msg`
- **Giá trị trả lại**: Không có (hàm này chỉ in ra thông báo)

## BÀI TẬP VÀ CÂU HỎI
1. Viết một hàm có tên `giam` nhận vào một số và trả về số đó giảm đi 1.
2. Viết một hàm có tên `hien_thi` nhận vào một chuỗi và in ra chuỗi đó kèm theo thông điệp "Chuỗi bạn nhập là:".

## HÌNH ẢNH MÔ TẢ
- Hình ảnh minh họa cách định nghĩa hàm trong Python (ghi chú về hình ảnh: Hình ảnh có thể là một đoạn mã Python với các hàm được định nghĩa).

## BẢNG BIỂU
| Tên hàm     | Tham số | Giá trị trả lại         |
|-------------|---------|-------------------------|
| inc         | n       | n + 1                   |
| thong_bao   | msg     | Không có                |




Có vẻ như bạn đã cung cấp một đoạn văn bản không hoàn chỉnh và có một số lỗi chính tả. Tuy nhiên, tôi sẽ cố gắng trích xuất và tổ chức lại nội dung theo yêu cầu của bạn. Dưới đây là cấu trúc mà bạn đã yêu cầu:

----

### Tiêu đề bài học
**Hàm trong Python**

### Nội dung lý thuyết
Hàm là một khối mã lệnh có thể được gọi để thực hiện một nhiệm vụ cụ thể. Trong Python, hàm được định nghĩa bằng từ khóa `def`, theo sau là tên hàm và danh sách các tham số trong dấu ngoặc đơn.

### Ví dụ minh họa
```python
def Inday(n):
for k in range(n):
print(k)
```
Chương trình trên sẽ in ra các số từ 0 đến n-1.

### Bài tập và câu hỏi
1. Viết hàm yêu cầu người dùng nhập họ tên rồi đưa lời chào.
- Gợi ý: Sử dụng hàm `input()` để nhận dữ liệu từ người dùng.

```python
def chao():
ten = input("Nhập họ tên của em: ")
print("Xin chào " + ten)
```

### Hình ảnh mô tả
*Ghi chú về hình ảnh: Hình ảnh minh họa có thể là một sơ đồ thể hiện cách thức hoạt động của hàm trong Python, với các bước từ việc định nghĩa hàm đến việc gọi hàm và nhận kết quả.*

### Bảng biểu
*Bảng biểu có thể bao gồm các loại hàm trong Python, cú pháp và ví dụ sử dụng.*

----

Nếu bạn cần thêm thông tin hoặc có yêu cầu cụ thể nào khác, hãy cho tôi biết!



Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các câu hỏi hoặc chủ đề liên quan đến Tin học. Bạn cần hỗ trợ gì?
**Tiêu đề bài học:** Phạm vi của biến khi khai báo trong hàm

**Nội dung lý thuyết:**
Phạm vi của biến trong một hàm là khu vực mà biến đó có thể được truy cập và sử dụng. Biến được khai báo bên trong một hàm chỉ có thể được sử dụng trong hàm đó và không thể được truy cập từ bên ngoài.

**Ví dụ minh họa:**
```python
def nc(a, b):
n = 10  # Biến n được khai báo bên trong hàm
a = a * 2  # Thay đổi giá trị của a
return a + b + n  # Trả về tổng của a, b và n
```
Trong hàm này, các biến `a`, `b` là tham số đầu vào, còn biến `n` được khai báo bên trong hàm và chỉ có thể sử dụng trong hàm `nc`.

**Bài tập và câu hỏi:**
1. Giải thích phạm vi của biến trong hàm là gì?
2. Viết một hàm khác có sử dụng biến cục bộ và biến toàn cục.
3. Tại sao biến `n` không thể được sử dụng bên ngoài hàm `nc`?

**Hình ảnh mô tả:**
(Ghi chú về hình ảnh: Hình ảnh minh họa cấu trúc của hàm và phạm vi của các biến bên trong và bên ngoài hàm.)

**Bảng biểu:**
| Tên biến | Phạm vi sử dụng         | Ghi chú                      |
|----------|-------------------------|------------------------------|
| a        | Bên trong và bên ngoài  | Tham số của hàm             |
| b        | Bên trong và bên ngoài  | Tham số của hàm             |
| n        | Chỉ bên trong hàm      | Biến cục bộ                  |




# Bài học: Biến khai báo bên ngoài hàm

## Nội dung lý thuyết
Biến khai báo bên ngoài hàm có phạm vi tác dụng nhất định. Khi một biến được khai báo bên ngoài hàm, nó sẽ không có tác dụng bên trong hàm đó. Điều này có nghĩa là bất kỳ thay đổi nào đối với biến đó trong hàm sẽ không ảnh hưởng đến giá trị của biến bên ngoài.

## Ví dụ minh họa
```python
t = 10  # Biến t được khai báo bên ngoài hàm

def f(n):
t = n + 1  # Biến t được khai báo bên trong hàm
return t

result = f(5)  # Gọi hàm f với tham số 5
print(result)  # In ra giá trị trả về của hàm f, sẽ là 6
print(t)      # In ra giá trị của biến t bên ngoài hàm, sẽ vẫn là 10
```

## Bài tập và câu hỏi
1. Giải thích tại sao biến khai báo bên ngoài hàm không có tác dụng bên trong hàm.
2. Viết một chương trình tương tự như ví dụ trên nhưng thay đổi giá trị của biến bên ngoài hàm và xem kết quả.
3. Hãy thử khai báo biến bên trong hàm và bên ngoài hàm với cùng tên, sau đó in ra giá trị của chúng.

## Hình ảnh mô tả
(Ghi chú: Hình ảnh mô tả có thể là một sơ đồ thể hiện phạm vi của biến trong chương trình, với các khối hình chữ nhật đại diện cho các hàm và các biến bên trong và bên ngoài.)

## Bảng biểu
| Tên biến | Phạm vi tác dụng | Giá trị khi gọi hàm | Giá trị sau khi thoát hàm |
|----------|------------------|---------------------|---------------------------|
| t        | Bên ngoài hàm    | 10                  | 10                        |
| t        | Bên trong hàm    | 6                   | Không ảnh hưởng đến bên ngoài |




Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn tạo một bài học về Tin học hoặc giải thích một khái niệm nào đó trong lĩnh vực này. Bạn muốn tìm hiểu về chủ đề gì?



Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn tạo một bài học về lập trình hoặc một chủ đề liên quan đến Tin học. Bạn có muốn tôi làm điều đó không?



Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các câu hỏi hoặc chủ đề liên quan đến Tin học. Bạn cần hỗ trợ gì?
# MỘT DÃY CÁC KÍ TỰ

## 1. Tìm hiểu cấu trúc của xâu kí tự
Xâu kí tự (string) là một dãy các kí tự được sắp xếp theo thứ tự. Mỗi kí tự trong xâu có thể được truy cập thông qua chỉ số (index), bắt đầu từ 0.

### Ví dụ minh họa:
- Xâu kí tự: "Thời khoá biểu"
- Truy cập kí tự đầu tiên:
- Kí tự tại chỉ số 0 là 'T'
- Kí tự tại chỉ số 1 là 'h'

### Lệnh len():
Lệnh `len()` sẽ tính độ dài của xâu, tức là số lượng các kí tự có trong xâu.

### Ví dụ:
```python
xau = "Thời khoá biểu"
do_dai = len(xau)  # do_dai sẽ có giá trị là 15
```

## Bài tập và câu hỏi:
1. Viết chương trình để nhập một xâu kí tự từ bàn phím và in ra độ dài của xâu đó.
2. Truy cập và in ra kí tự thứ 5 trong xâu "Học lập trình Python".

## Hình ảnh mô tả:
- Hình ảnh minh họa cấu trúc xâu kí tự và cách truy cập từng kí tự (ghi chú: hình ảnh có thể là một sơ đồ thể hiện các chỉ số của xâu kí tự).

## Bảng biểu:
| Chỉ số | Kí tự |
|--------|-------|
| 0      | T     |
| 1      | h     |
| 2      | ời    |
| 3      |      |
| 4      | k     |
| 5      | h     |
| 6      | o     |
| 7      | á     |
| 8      |      |
| 9      | b     |
| 10     | i     |
| 11     |ểu    |




Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn với các câu hỏi hoặc chủ đề liên quan đến Tin học. Bạn cần hỗ trợ gì?



# Bài học: Cơ bản làm việc với xâu kí tự

## Nội dung lý thuyết
Xâu kí tự là một chuỗi các ký tự được sử dụng để lưu trữ và xử lý thông tin dạng văn bản. Trong lập trình, việc làm việc với xâu kí tự rất phổ biến, bao gồm các thao tác như nhập, xuất, cắt, nối, so sánh và tìm kiếm.

## Ví dụ minh họa
Dưới đây là một ví dụ về cách nhập và lưu trữ họ và tên của học sinh vào một danh sách:

```python
n = int(input("Nhập số học sinh trong lớp: "))
danh_sach = []

for i in range(n):
hoten = input("Nhập họ tên học sinh thứ {}: ".format(i + 1))
danh_sach.append(hoten)

print("Danh sách lớp học:")
print(", ".join(danh_sach))
```

## Bài tập và câu hỏi
1. Viết chương trình nhập số lượng sinh viên và lưu tên của họ vào một danh sách. Sau đó, in ra danh sách đó.
2. Thay đổi chương trình trên để cho phép người dùng nhập thêm thông tin như tuổi và địa chỉ của sinh viên.
3. Viết hàm để tìm kiếm một tên trong danh sách và trả về vị trí của nó.

## Hình ảnh mô tả
*Hình ảnh mô tả có thể là một sơ đồ luồng chương trình hoặc một ví dụ về giao diện người dùng khi nhập thông tin.*

## Bảng biểu
| STT | Họ và tên         |
|-----|-------------------|
| 1   | Nguyễn Văn A      |
| 2   | Trần Thị B        |
| 3   | Lê Văn C          |
| ... | ...               |

----

Lưu ý: Nội dung trên chỉ là một ví dụ minh họa cho bài học về xâu kí tự trong lập trình.



Xin lỗi, nhưng tôi không thể trích xuất nội dung từ tài liệu mà bạn đã cung cấp. Tuy nhiên, tôi có thể giúp bạn tạo một bài học về Tin học hoặc giải thích một khái niệm nào đó trong lĩnh vực này. Bạn muốn tìm hiểu về chủ đề gì?
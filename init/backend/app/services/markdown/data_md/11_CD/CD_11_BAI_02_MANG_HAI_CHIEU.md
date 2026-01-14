# BÀI 2: MẢNG HAI CHIỀU

Học xong bài này, em sẽ:
- Trình bày được cấu trúc dữ liệu mảng hai chiều.
- Sử dụng được danh sách để thể hiện mảng hai chiều trong Python.

Em có biết nếu xếp nối tiếp nhau n mảng số thực cùng độ dài m phần tử trong bộ nhớ thì đó gọi là gì không?

## Mảng hai chiều
Mảng hai chiều dùng để lưu trữ một bảng số liệu hình chữ nhật gồm các phần tử được sắp xếp thành hàng và cột.

### Ma trận: (matrix)
- Bảng hai chiều

| Họ và tên         | Điểm Toán | Điểm Văn | bangDiem[0] | Cột 1 | Cột 2 | |
|-------------------|-----------|----------|--------------|-------|-------|---|
| Nguyễn Vân Anh    | 5.0       |          | 7.5          | 5.0   |       | |
| Hoàng Đinh Bảo    | 9.0       | 4.5      | bangDiem[1]  | 5.0   | 4.5   | |
| Trần Kim Cúc      | 8.0       | 8.0      | bangDiem[2]  | 8.0   | 8.0   | |
| Phạm Cao Dương    | 5.5       | 7.0      | bangDiem[3]  | 4.5   | 5.5   | 7.0 |

Hình Ia: Bảng điểm tổng kết các môn học
Hình Ib: Mảng hai chiều bangDiem

Mảng hai chiều là mảng một chiều mà mỗi phần tử là một mảng một chiều. Hầu hết các ngôn ngữ lập trình bậc cao đều có sẵn kiểu mảng hai chiều. Thậm chí, nếu cần thiết, có thể tạo ra cả mảng nhiều chiều (có hơn hai chiều).

### Khai báo mảng hai chiều
Khai báo mảng hai chiều cần cung cấp đủ các thông tin:
- Tên biến mảng
- Kiểu dữ liệu
- Kích thước, kích thước gồm hai số nguyên, mỗi số xác định kích thước một chiều của hình chữ nhật.

### Cấu trúc mảng hai chiều
Trong bộ nhớ, mảng hai chiều cũng được tổ chức tương tự như mảng một chiều, tức là lưu trữ thành một khối các ô nhớ liên tục, có độ lớn bằng số hàng nhân số cột, độ dài kiểu dữ liệu.



# Truy cập ngẫu nhiên

Các thông tin có trong khai báo mảng hai chiều giúp máy tính xác định dung lượng phần bộ nhớ dành cho một biến mảng hai chiều. Để phản ánh mảng hai chiều, cần biết hai chỉ số: chỉ số hàng và chỉ số cột.

**Cập nhật hàng**

Ví dụ, `bangDiem[4][2]` là phần tử ở hàng thứ tư, cột thứ hai của mảng `bangDiem` (Hình 1b). Các thông tin về mảng và hai chỉ số kèm theo cho phép tìm được vị trí chính xác của phần tử.

Thời gian thực hiện việc đọc giá trị hay gán giá trị phần tử mảng mở cho một hai chiều cũng là hằng số, không phụ thuộc vào kích thước mảng.

## Sử dụng danh sách làm mảng hai chiều trong Python

Kiểu danh sách (list) có sẵn trong Python, rất linh hoạt, hoàn toàn đáp ứng các nhu cầu xử lý dãy số (mảng một chiều) và bảng chữ nhật các số (mảng hai chiều).

Danh sách dùng làm mảng được khai báo và sử dụng như một danh sách Python thông thường. Cú pháp cụ thể như sau:

1. Khai báo danh sách dùng làm mảng (một chiều hoặc hai chiều) với các phần tử hay các danh sách con sẽ được thêm dần vào sau đó.
- Tên danh sách

2. Khai báo danh sách với cặp dấu chứa danh sách các danh sách con cùng độ dài cho kết quả là một danh sách dùng như mảng hai chiều.
- `Tên_danhsach = [[...], [...]]`

**Ví dụ:**
```python
matranThuc = [[7.5, 6.5, 5.0, 5.0, 9.0], [6.5, 8.5, 8.0, 8.0, 4.5]]
```
cho kết quả là một danh sách dùng như mảng hai chiều, gồm 2 hàng 5 cột.

Trong bộ nhớ máy tính, mảng hai chiều hàng và m cột được lưu trữ liên tiếp nhau, bắt đầu là hàng 1, tiếp theo là hàng 2, cho đến hết.

### Bài tập

Em hãy khai báo một danh sách để làm mảng hai chiều khi lập trình giải bài toán thực tế với dữ liệu đầu vào là bảng điểm tổng kết các môn học như mô tả ở trên. Để tiết kiệm thời gian, ta tạm thời minh họa với mảng 4 x 3 bằng bảng trích từ Hình 1a như sau:

```
1.5 6.5 5.0           # điểm các môn của học sinh thứ nhất
5.0 9.0               # điểm các môn của học sinh thứ hai
```

**Hình 2:** Bảng điểm trích từ Hình 1a

Đọc bản mới nhất trên hoc10.vn                                            Bản sách mẫu



# Thời gian thực hiện các phép toán của mảng

## 1. Thời gian thực hiện các phép toán trên mảng

- Phép chèn thêm hay xóa phần tử trong mảng có thời gian thực hiện phụ thuộc vào độ dài của mảng.
- Trường hợp hết chỗ phải di chuyển sang vùng nhớ mới thì thời gian thực hiện là tương đương với độ dài danh sách vào lúc đó.
- Phép chèn thêm hay gỡ bỏ ở vị trí bất kỳ trong mảng sẽ cần di chuyển các phần tử để tạo chỗ trống hoặc lấp chỗ trống.

### Hình 3: Dịch chuyển tạo chỗ trống khi chèn thêm vào mảng

## 2. Câu hỏi

Câu 1. Vì sao có thể nói mảng hai chiều là mảng của mảng một chiều?
Câu 2. Hãy cho ví dụ một bài toán thực tế cần tính toán trên một bảng số hình chữ nhật.

Hoạt động khám phá trong bài đã minh họa cấu trúc mảng hai chiều cũng chuẩn bị sẵn dữ liệu đầu vào là các dãy điểm số môn học. Hãy viết tiếp các câu lệnh thực hiện phân tích kết quả học tập:

- a) Cho chỉ số ứng với một học sinh nào đó trong danh sách: in ra tên học sinh kèm điểm cao nhất; điểm thấp nhất; điểm trung bình các môn.
- b) Cho chỉ số ứng với một môn học nào đó trong danh sách: in ra điểm cao nhất; điểm thấp nhất; điểm trung bình môn học.

## 3. Câu hỏi

Câu 1. Trong Python, danh sách dùng làm mảng một chiều và danh sách dùng làm mảng hai chiều có gì khác nhau?
Câu 2. Nói "Thời gian thực hiện (là) tuyến tính" nghĩa là gì?

## Tóm tắt bài học

Mảng hai chiều là bảng hình chữ nhật các phần tử có cùng kiểu dữ liệu, gồm n hàng và m cột. Có thể truy cập các phần tử bằng hai chỉ số: chỉ số hàng và chỉ số cột.

----

Đọc bản mới nhất trên hoc10.vn
Bản sách mẫu
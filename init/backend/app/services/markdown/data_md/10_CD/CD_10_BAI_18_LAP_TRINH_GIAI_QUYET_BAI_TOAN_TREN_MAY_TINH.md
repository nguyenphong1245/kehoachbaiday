# BÀI 18: LẬP TRÌNH GIẢI QUYẾT BÀI TOÁN TRÊN MÁY TÍNH

Học xong bài này, em sẽ:
- Trình bày tóm tắt được các bước cần thực hiện khi giải một bài toán bằng lập trình trên máy tính với một ngôn ngữ lập trình bậc cao.
- Theo em, cách phát biểu đề bài của một bài tập trong tin học và trong toán học khác nhau ra sao?

## Quá trình giải một bài toán bằng lập trình

1. Việc lập trình trên máy tính để giải quyết một bài toán gồm những bước nào?

Bài toán tin học thường gắn liền với các vấn đề thực tế trong cuộc sống và được phát biểu dưới dạng ngôn ngữ tự nhiên; gắn liền với bối cảnh xuất hiện bài toán. Dưới đây là một ví dụ cụ thể về một bài toán tin học và tinh giải bài toán này bằng lập trình:

### Ví dụ: Bài toán Quản lí tiền điện

Dữ liệu vào từ bàn phím gồm một dòng chứa 12 số nguyên; các số cách nhau bằng dấu cách; số thứ i là tiền điện (tính theo đơn vị nghìn đồng) phải chi trả ở tháng i (i = 1, 2, ..., 12).

Kết quả đưa ra màn hình:
- Dòng thứ nhất là tổng số tiền phải trả trong cả năm.
- Dòng thứ hai là thông báo về số tiền trung bình hàng tháng phải trả.
- Dòng thứ ba chứa danh sách các tháng dùng điện cao hơn mức trung bình.

Để giải một bài toán đã cho, trước hết cần xác định rõ bài toán yêu cầu tìm gì, dữ liệu cho ban đầu gồm những gì và được cho ở dạng nào. Trên cơ sở đó, ta có thể phát biểu lại bài toán dưới dạng tóm tắt; nêu các mối quan hệ toán học giữa các đại lượng đã cho. Đây là bước xác định bài toán.



# Bài toán Quản lí tiền điện

Cho dãy 12 số nguyên \( t_1, t_2, \ldots, t_{12} \)

## Yêu cầu:
- Tính tổng = các số trong dãy \( S = t_1 + t_2 + \ldots + t_{12} \)
- Tính trung bình cộng: \( \overline{a} = \frac{S}{12} \)
- Đưa ra các vị trí \( i \) thoả mãn điều kiện \( t_i > \overline{a} \)

![Hình 1. Tóm tắt bài toán Quản lí tiền điện](#)

Trên cơ sở phát biểu tóm tắt; rút gọn được bài toán như trên, tiếp đến cần tìm thuật toán giải bài toán và cách tổ chức dữ liệu tương ứng để có thể viết chương trình giải bài toán. Hình 2 là một mô tả thuật toán để giải bài toán đã phát biểu tóm tắt ở Hình 1.

## Thuật toán giải bài toán Quản lí tiền điện
1. Nhập dãy số tiền \( (t_1, t_2, \ldots, t_{12}) \)
2. Khởi tạo giá trị ban đầu: \( S = 0 \) (tổng)
3. Cộng dồn giá trị các số của dãy vào giá trị \( S \).
4. Đưa ra
5. Tính và đưa ra giá trị trung bình \( \overline{a} = \frac{S}{12} \).
6. Duyệt tuần tự từ \( t_1 \) đến \( t_{12} \): đưa ra \( i \) nếu \( t_i > \overline{a} \) (với \( i = 1, 2, \ldots, 12 \)).

![Hình 2. Mô tả thuật toán giải bài toán Quản lí tiền điện](#)

Khi đã xác định được thuật toán cùng với cách tổ chức dữ liệu, ta có thể tiến hành viết chương trình; tức là viết lại thuật toán trên một ngôn ngữ lập trình. Chương trình Python trong Hình 3 là kết quả viết chương trình thể hiện thuật toán mô tả ở Hình 2.

```python
t = []
for i in range(12):
t.append(int(input()))

S = 0
for i in t:
S += i

print("Số tiền điện phải trả cả năm:", S, "ngàn đồng")
average = S / 12
print("Số tiền điện hàng tháng:", average, "ngàn đồng")
print("Các tháng dùng điện nhiều hơn mức trung bình:")
for i in range(12):
if t[i] > average:
print(i + 1)
```

![Hình 3. Chương trình giải bài toán Quản lí tiền điện](#)

Đặt sách tại hoc1O.vn



# Các bước giải bài toán bằng lập trình

## 1. Xác định bài toán
Khi xác định bài toán, có thể cân bỏ qua bối cảnh thực tế nếu trong đề bài, xác định những giá trị đã cho và các mối quan hệ giữa chúng. Điều rất quan trọng là xác định được mối quan hệ các đại lượng đã cho với những trị cần tìm: Những mối quan hệ này thường biểu diễn được bằng công thức, phương trình, bất phương trình. Bởi vậy, bước này còn được gọi là bước xây dựng mô hình toán học. Nói một cách khác, mô hình toán học cô đọng, ngắn gọn sẽ giúp ta có cái nhìn bao quát về vấn đề cần giải quyết, thấy được các tình huống cần xem xét.

## 2. Tìm thuật toán giải bài toán và cách tổ chức dữ liệu
Đây là bước tìm thuật toán dựa trên kết quả quan trọng của bước xác định bài toán, dựa trên mối quan hệ giữa các đại lượng đã cho với những giá trị cần tìm. Cùng với việc tìm thuật toán, ta đồng thời xác định các cách tổ chức dữ liệu có thể sử dụng tương ứng với thuật toán đó.

Ví dụ như ở bài toán Quản lý tiền điện, thông tin về tiền điện được sử dụng hai lần: Lần đầu từ dữ liệu tiền điện của 12 tháng, ta tính tổng tiền điện và mức chi trung bình tháng. Lần thứ hai là xem lại tiền điện của từng tháng để đưa ra tháng nào dùng điện nhiều. Như vậy, dữ liệu tiền điện hàng tháng cần được lưu lại và do vậy ta nhận thấy cấu trúc dữ liệu thích hợp là mảng (hay danh sách trong Python).

## 3. Viết chương trình
Muốn viết chương trình cho máy tính thực hiện, ta cần nắm vững một ngôn ngữ lập trình. Có nhiều ngôn ngữ lập trình bậc cao khác nhau; tuy nhiên mỗi ngôn ngữ lập trình đều có những đặc điểm riêng.

## 4. Kiểm thử, chạy và hiệu chỉnh chương trình
Với chương trình vừa viết xong, cần phải chạy thử và kiểm tra xem chương trình có lỗi hay không và nếu tìm thấy thì sửa tất cả các lỗi tìm được. Đây là bước cuối cùng; phải bước kiểm thử, chạy và hiệu chỉnh chương trình.

Việc hiểu rõ hơn mục tiêu cũng như biết thêm một số lưu ý của từng bước nêu trên sẽ giúp việc lập trình trở nên nhanh chóng hơn và đạt hiệu quả cao hơn.



# Ngôn Ngữ Lập Trình Bậc Cao

Ngôn ngữ lập trình bậc cao được xây dựng trên những yếu tố cơ bản gồm:

- Bảng chữ cái (bộ các kí tự được phép sử dụng) của ngôn ngữ;
- Quy định về cách viết các thành tố như: tên câu lệnh, biểu thức;
- Loại dữ liệu cơ sở có thể lưu trữ và xử lý;
- Các phép tính và loại câu lệnh có thể thực hiện;
- Các kiểu dữ liệu có cấu trúc;
- Thư viện chương trình con cung cấp sẵn cho lập trình.

Trong quá trình giải quyết một bài toán trên máy tính; khi đã xác định được cấu trúc dữ liệu và thuật toán; bước viết chương trình trong một ngôn ngữ lập trình bậc cao cụ thể đòi hỏi ta cần sử dụng được:

- Các lệnh nhập dữ liệu vào và đưa kết quả ra;
- Các kiểu dữ liệu như số nguyên, số thực, ký tự, danh sách; và cách dùng chúng;
- Các câu lệnh tương ứng thể hiện cấu trúc rẽ nhánh, cấu trúc lặp của thuật toán;
- Các chương trình con đã cung cấp sẵn trong các thư viện của ngôn ngữ lập trình đó và cách tự xây dựng chương trình con.

Như ta đã biết, mọi dữ liệu trong máy tính đều là dãy các bit. Máy tính chỉ có thể "hiểu" được những chỉ dẫn bằng ngôn ngữ máy (ngôn ngữ viết bằng dãy bit). Vì vậy, để máy tính có thể hiểu và thực hiện được chương trình viết trên ngôn ngữ lập trình bậc cao, cần có công cụ dịch chương trình sang ngôn ngữ máy. Việc dịch có thể thực hiện theo nguyên tắc biên dịch (Compiler) hoặc dịch (Interpreter).

- **Chế độ biên dịch**: Chương trình không còn lỗi cú pháp sẽ được dịch sang ngôn ngữ máy. Chương trình trên ngôn ngữ máy này sẽ được gọi ra ở mỗi lần cần thực hiện.
- **Chế độ dịch**: Khi thực hiện chương trình; gặp đến câu lệnh nào thì câu lệnh đó sẽ được dịch ra ngôn ngữ máy để thực hiện. Trong quá trình thực hiện chương trình; nếu một câu lệnh được thực hiện bao nhiêu lần thì nó sẽ được dịch lại bấy nhiêu lần.

## Kiểm Thử, Chạy và Hiệu Chỉnh Chương Trình

Một chương trình viết xong chưa chắc đã chạy được ngay trên máy tính để cho ra kết quả mong muốn. Việc tìm lỗi, sửa lỗi, điều chỉnh lại chương trình cũng là một công việc quan trọng trong các giai đoạn giải bài toán máy tính.

Cần lưu ý là dù việc kiểm thử có làm tốt đến mức độ nào đi nữa thì trong hầu hết các trường hợp ta chỉ có thể khẳng định là chương trình cho kết quả đúng với nhiều bộ dữ liệu vào khác nhau.



# Bài 1. Có nhất thiết tìm được thuật toán trước khi viết chương trình để giải bài toán đó không?

# Bài 2. Nếu muốn học một ngôn ngữ lập trình bậc cao, em sẽ phải tìm hiểu những gì ở ngôn ngữ lập trình đó?

Em hãy giới thiệu một bài toán thực tế mà em biết và trình bày các bước cụ thể để giải quyết bài toán đó bằng máy tính:

## Trong các câu sau, những câu nào đúng?
1. Kết quả của bước xác định bài toán có ý nghĩa quan trọng đối với bước tìm thuật toán giải bài toán.
2. Nếu không biết thuật toán của một bài toán thì không thể viết được chương trình để máy tính giải quyết bài toán đó.
3. Việc viết chương trình không liên quan gì đến thuật toán và cách tổ chức dữ liệu.
4. Chỉ cần kiểm thử một chương trình khi không gặp báo lỗi trên màn hình: thực hiện được chương trình.

## Tóm tắt bài học
### Các bước giải bài toán trên máy tính:
- Xác định bài toán.
- Tìm thuật toán giải bài toán và cách tổ chức dữ liệu.
- Viết chương trình: mô tả thuật toán bằng ngôn ngữ lập trình.
- Kiểm thử chương trình.

Mỗi ngôn ngữ lập trình bậc cao đều có các yếu tố cơ bản:
- Bảng chữ cái
- Cú pháp
- Ngữ nghĩa
- Các kiểu dữ liệu
- Các câu lệnh
- Biểu thức
- Thư viện các hàm có sẵn

Có hai chế độ dịch chương trình viết trên ngôn ngữ lập trình bậc cao sang ngôn ngữ máy là biên dịch và thông dịch.

Đọc sách tại học O.vn 123
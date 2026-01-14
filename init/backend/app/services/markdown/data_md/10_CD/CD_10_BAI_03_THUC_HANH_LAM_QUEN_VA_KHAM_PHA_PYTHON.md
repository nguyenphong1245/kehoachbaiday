# BÀI THỰC HÀNH LÀM QUEN VÀ KHÁM PHÁ PYTHON

Học xong bài này, em sẽ:
- Viết và thực hiện được một vài chương trình Python đơn giản có sử dụng biểu thức số học.
- Bước đầu nhận thấy được cách báo lỗi của Python.
- Biết được Python dùng màu sắc để hỗ trợ người dùng.
- Viết được câu lệnh nhập dữ liệu là một dòng chữ.

## Bài 1. Tổng bình phương ba số

Em hãy gán giá trị số nguyên cho ba biến tương ứng a, b, c; mỗi giá trị có thể là số dương, số âm hoặc bằng 0 và có số chữ số tùy ý. Viết chương trình đưa ra màn hình tổng và tổng bình phương ba số đó.

**Ví dụ:**

| INPUT | OUTPUT |
|-------|--------|
|       | Tổng ba số: 10 |
|       | Tổng bình phương ba số: 38 |

Gợi ý: Có thể giải bài toán trên theo chế độ đối thoại (ở cửa sổ Shell) hoặc chế độ soạn thảo (ở cửa sổ Code).

Mỗi lần chạy: Các giá trị mới
Gõ lại các câu lệnh cho mỗi lần chạy.

```plaintext
Python 3.9.0 Shell
File Edit       Shell  Debug Options Window Help
Python                0   (tags /v3 9.0 :9cf6752 Oct 5  2020 , 15 :34 :40) [MSC  1927 64 bit (AMD64) ] on win32
Type "help", "copyright", "credits" or "license()" for more information.
2>>
2>>                                                           Có thể có hoặc không có dấu
7>>                                                           cách trước và sau dấu phẩy;
>>> print('Tổng ba số:', a + b + c)
Tổng ba số: 10
2>> print('Tổng bình phương ba số:', a*a + b*b + c*c)
Tổng bình phương ba số: 38
7>>
```

**Hình 1. Chế độ đối thoại**



# Chế độ soạn thảo

Vào mục File, chọn New File và soạn thảo chương trình như ở Hình 2a. Lưu lại với tệp có đuôi .py; vào mục Run; chọn Run module để thực hiện chương trình và có kết quả như ở Hình 26.

## Kết quả

```
int (input)
int (input)
int (input)
```

- Tổng ba số: 10
- Tổng bình phương ba: 50
- 38
- Tổng bình phương ba: 56
- \( a^2 + b^2 + c^2 \)

### Cửa sổ Code

### Cửa sổ Shell

Hình 2. Chế độ soạn thảo

Em hãy thực hiện chương trình với một số bộ dữ liệu khác nhau:

## Bài 2: Làm quen với hai cửa sổ lập trình của Python

Lần lượt theo các yêu cầu a, b và c sau đây; em hãy viết chương trình để trả lời được câu hỏi trong bài toán Tìm số lượng bi.

### Tìm số lượng bi

#### Yêu cầu a:
Có hai hộp đựng các viên bi. Hộp thứ nhất được dán nhãn bên ngoài là A; trong hộp có 20 viên bi. Hộp thứ hai được dán nhãn bên ngoài là B; số bi bằng số bi còn lại trong hộp A. Hãy cho biết số bi trong hộp B sau khi thực hiện thao tác sau: Bỏ 5 viên bi ra khỏi hộp A.

#### Yêu cầu b:
Trong cửa sổ Code, viết chương trình và lưu tệp chương trình với tên là "Tim-so-bi.py". Chạy chương trình đó để so sánh với kết quả ở yêu cầu a.

#### Yêu cầu c:
Sửa chương trình trong tệp "Tim-so-bi.py" với dữ liệu ban đầu là: hộp A có 30 viên bi, hộp B có 50 viên bi. Chạy lại chương trình để nhận kết quả với dữ liệu đầu vào mới.

Đọc sách tại học O.vn 61



# Bài 3. Làm quen với thông báo lỗi của Python

Python phân biệt chữ hoa và chữ thường, nên chương trình ở Hình 3 có lỗi.

```
Python 3.9.0 Shell
File    Edit Shell Debug  Options  Window Help
Python       0   (tags/v3          0 : 9cf6 752  Oct 5 2020 15 :34 : 40) [MSC  1927 64 bit (AMD64) ] on win32
Type "help"              "copyright" "credits" or "license()" for more information.
>>> N=20
print(n)
```

**Hình 3. Chương trình có lỗi**

Em hãy thực hiện chương trình này xem Python phản hồi như thế nào.

----

# Bài 4. Tìm hiểu Python sử dụng màu sắc trong chương trình

Em hãy tìm hiểu và cho biết màu sắc của những phần sau trong chương trình:

- Câu lệnh `print()`
- Thông báo lỗi Python đưa ra.
- Đoạn chữ nằm giữa cặp dấu nháy đơn (hoặc nháy kép)
- Kết quả đưa ra màn hình.

Em có thích Python dùng các màu khác nhau như thế không? Theo em, điều đó giúp gì cho lập trình?

----

# Bài 5. Làm quen với nhập dữ liệu là một dòng chữ

Hai đoạn chương trình (viết bằng hai ngôn ngữ lập trình khác nhau) ở Hình 4 có cùng mục đích: nhận vào từ bàn phím tên của một người và in ra màn hình lời chào dành cho người đó.

```
ask     Bạn tên là gì?
wait    File   Edit Format Run   Options Window   Help

set     Name = input("Bạn tên là gì?")
print  ("Chào bạn", Name)
```

**Chương trình Scratch**                   **Chương trình Python**

**Hình 4. Hai chương trình trên hai ngôn ngữ**

Em hãy viết thêm vào chương trình Python ở Hình 4 để khi chạy chương trình đó ta được đọc dòng chữ hướng dẫn nhập dữ liệu và sau khi nhập dữ liệu vào; máy tính sẽ hiển thị lại những gì vừa nhập (như ở Hình 5).

----

Đa số sách tại học 1O.vn



# Giáo Dục Việt Nam

## Đề bài

Gõ vào ngày tháng năm sinh: **05/09/2010**
**Hình 5b. Cửa sổ Shell**
Ngày sinh: **05/09/2010**

## Đề bài

Để lên đỉnh Phan Xi Păng (Hình 6), cần mua vé cáp treo 600 nghìn đồng/người lớn và 300 nghìn đồng/trẻ em. Vé xe lửa là 400 nghìn đồng/1 người lớn và 200 nghìn đồng/1 trẻ em. Đoàn du lịch có **x** người, trong số đó có **y** trẻ em. Hãy xác định số tiền cần chuẩn bị để mua vé cho cả đoàn và đưa kết quả ra màn hình.

### Dữ liệu

Các dữ liệu **a, b, l, v, x, y** là các số nguyên không âm (x > 0).

### Công thức tính

Số tiền = \( a \times (x - y) + u \times (x - y) + b \times y + v \times y \)

\[
= (a + u) \times (x - y) + (b + v) \times y
\]

**Lưu ý:** Có thể đưa ra dòng thông báo tùy chọn trước mỗi phép nhập dữ liệu và trước mỗi kết quả. Python cho phép đưa ra dòng thông báo dưới dạng tiếng Việt.

### Ví dụ

| INPUT | OUTPUT                     |
|-------|----------------------------|
| 60    | Tổng số tiền vé: 3850 nghìn đồng. |
| 30    |                            |
| 50    |                            |
| 25    |                            |
| 40    |                            |

Đọc sách tại học O.vn 63
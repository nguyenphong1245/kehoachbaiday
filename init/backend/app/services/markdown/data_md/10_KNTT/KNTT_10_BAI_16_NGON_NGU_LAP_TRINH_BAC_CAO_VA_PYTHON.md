# Chương trình và Ngôn ngữ Lập Trình

## Hình 16.1
Cho biết câu lệnh trong ngôn ngữ nào dễ hiểu hơn.

```
1001    01101110     00100000
0000    01110100     01110010
1010    10100001     01101110
0100    00100000     11000100           # Nhập từ bàn phím dãy n số và
0100    01110010     01100001           n 2 int(input( "Nhập số tự nhiên
```

### Ngôn ngữ máy
```
5 = 0
RESETA EQU        %00010011
CTLREG EQU        %00010001

INITA  LDA     A  #RESETA
04             STA     A  ACIA
LDA     A  #CTLREG
04             STA     A  ACIA

F1             JMP        SIGNON
```

### Ngôn ngữ Assembly
G Hình 16.1 0ILG

### Ngôn ngữ lập trình bậc cao
```python
n = int(input("Nhập số tự nhiên: "))
Tổng = 0
for i in range(n):
a = int(input("Nhập số thứ {}: ".format(i + 1)))
Tổng += a

print("Tổng các số đã nhập là:", Tổng)
```

### Ghi chú
- Hình 16.1 minh họa sự khác biệt giữa ngôn ngữ máy và ngôn ngữ lập trình bậc cao (Python).
- Ngôn ngữ lập trình bậc cao thường dễ hiểu hơn và gần gũi với con người hơn so với ngôn ngữ máy.



# MÔN HỌC: LẬP TRÌNH PYTHON

## 1. Làm quen với môi trường lập trình Python

### 1.1 Cách viết và thực hiện các lệnh trong môi trường lập trình

- Chế độ gõ lệnh trực tiếp
- Chế độ soạn thảo chương trình

Màn hình làm việc của Python có dạng tương tự như sau:

```
IDLE Shell 3.9.1
Shell   Debug     Window   Help
File  Edit          Debug Options      Help
Edit Shell             Options Window
```

```
Python 3.9.1 (tags/v3.9.1: le5d33e, Dec  7 2020, 17:08:20)
[MSC v.1927 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license()" for more information
```

### 1.2 Hướng dẫn sử dụng

- Đây là nơi nhập lệnh. Sau khi nhập xong, nhấn phím Enter để thực hiện lệnh.
- Đây là dấu nhắc của Python.

![Hình 16.2 Màn hình làm việc của Python](#)



# Python Programming Basics

## Giới thiệu

Chương này sẽ giúp bạn làm quen với ngôn ngữ lập trình Python và các môi trường lập trình phổ biến.

### Môi trường lập trình

Có hai chế độ trong môi trường lập trình Python:
- **Chế độ gõ lệnh**: Bạn có thể nhập các câu lệnh trực tiếp và nhận kết quả ngay lập tức.
- **Chế độ soạn thảo**: Bạn viết mã trong một tệp tin và chạy toàn bộ chương trình.

## Lệnh Python đầu tiên

### Làm quen với câu lệnh của Python

Dưới đây là một số lệnh cơ bản trong chế độ gõ lệnh:

```python
print("Xin chào")
print((5 + 2) * 7)
```

### Giải thích lệnh

- Khi bạn nhập `5`, Python hiểu rằng đó là số nguyên.
- Câu lệnh `print` sẽ hiển thị kết quả ra màn hình.

### Một số lưu ý

- Đảm bảo rằng bạn đã cài đặt môi trường lập trình Python như Wingware hoặc PyCharm.
- Hãy thử nghiệm với các lệnh khác nhau để hiểu rõ hơn về cách hoạt động của Python.

## Kết luận

Bây giờ bạn đã có cái nhìn tổng quan về Python và cách sử dụng các lệnh cơ bản. Hãy tiếp tục khám phá và thực hành để nâng cao kỹ năng lập trình của mình!



# Giáo Dục - Sách Giáo Khoa

## Nội Dung

1. **Giá trị cần đưa ra màn hình**
- `vn` là các giá trị cần đưa ra màn hình.

2. **Nhập giá trị**
- Khi nhập giá trị số hoặc xâu kí tự từ dòng lệnh; Python tụ dữ liệu.

3. **Phép toán trong Python**
- Python có thể thực hiện các phép toán thông thường với số thực và số nguyên.

4. **Lệnh print**
- Lệnh `print()` có chức năng in dữ liệu ra màn hình, có thể in nhiều giá trị đồng thời.

5. **Câu hỏi**
- Kết quả của mỗi lệnh sau là gì? Kết quả đó có kiểu dữ liệu nào?
1. `2 + 1.5`
2. `int("13 10*3/2 3*2 = 13 + 10*3/2 3*2")`

## Kết quả
- Dự đoán kết quả của các lệnh trên và kiểu dữ liệu tương ứng.



# Chương trình đầu tiên

```python
print("Xin chào")
```

## Các biểu thức cần tính giá trị

1. \( 20 - 7 \)
2. \( 3 \times 10 \)
3. \( 12/5 \)

### Câu hỏi
- Biểu thức sau có lỗi không? Vì sao?

### Thông tin học sinh
- Học sinh: Nguyễn Việt Anh
- Năm nay bạn Hoa 16 tuổi

### Lệnh in ra màn hình
- Lệnh để in ra màn hình thông tin như sau:
- \( x \times 5 \times 7 = 105 \)

### Cách viết xâu kí tự
- Xâu kí tự được viết giữa cặp dấu nháy đơn hoặc nháy kép.
- Nếu một xâu được viết giữa cặp ba dấu nháy kép.
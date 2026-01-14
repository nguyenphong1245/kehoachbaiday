# BÀI 2: BIẾN, PHÉP GÁN VÀ BIỂU THỨC SỐ HỌC

## Mục tiêu
Học xong bài này, em sẽ:
- Nêu được vai trò của biến và phép gán.
- Đặt được tên cho biến; sử dụng được phép gán và cách đưa ra giá trị của biến trong Python.
- Làm quen được với cửa sổ Code trong Python để soạn thảo, lưu và thực hiện chương trình.

## Giới thiệu
Khi giao cho máy tính giải quyết một bài toán, máy tính sẽ cần lưu trữ dữ liệu phục vụ cho quá trình thực hiện thuật toán giải bài toán đó. Em hãy lấy ví dụ về một bài toán đơn giản và chỉ ra những dữ liệu nào cần được lưu trữ, những dữ liệu nào sẽ thay đổi qua các bước xử lý của máy tính.

## Biến và phép gán
### Biến trong chương trình
Dù lập trình bằng ngôn ngữ nào, ta cũng phải biết sử dụng biến để lưu dữ liệu cần thiết cho chương trình; nhất là những chương trình được thực hiện nhiều lần. Biến là tên một vùng nhớ; trong quá trình thực hiện chương trình, giá trị của biến có thể thay đổi.

1. Em hãy chỉ ra các biến được sử dụng trong chương trình ở hình bên?

Đó là biến `a`.

### Hình 1
Hình 1 minh hoạ một ví dụ về chương trình trong Python sử dụng biến `a`.

| Biến | Giá trị |
|------|---------|
| a    | 12      |

```python
a = 12
print(a)
```

Câu lệnh `print()` in ra màn hình giá trị của biến đặt trong đơn ngoặc.

**Giá trị của biến `a`: 12**

**Hình 1. Một chương trình Python**

Đọc sách tại hoc1O.vn



# Lưu ý: Trong Python; các biến đều được đặt tên theo một số quy tắc.

- Không trung với từ khoá (được sử dụng với ý nghĩa xác định không thay đổi) của Python (Hình 2)
- Bắt đầu bằng chữ cái hoặc dấu
- Chỉ chứa chữ cái, chữ số và dấu

| Từ khóa     | Từ khóa     | Từ khóa     | Từ khóa     |
|-------------|-------------|-------------|-------------|
| False       | class       | None        | continue    |
| True        | def         | from        | and         |
| del         | as          | elif        | if          |
| assert      | else        | import      | break       |
| except      | finally     | is          | return      |
| lambda      | try         | nonlocal    | while       |
| global      | not         | with        | or          |
| Yield       | pass        | in          | raise       |

### Hình 2. Một số từ khóa thường dùng trong Python

## Ví dụ 1
- `n`, `delta`, `xl`, `Ab`, `t12`, `Trường_sa` là những tên biến đúng.
- `I2t` là tên biến sai (bắt đầu bằng chữ số).
- `A b` là tên biến sai (chứa dấu cách).

- `Ab` và `AB` là hai tên biến khác nhau.

### b) Phép gán trong chương trình
- Việc gán giá trị cho biến được thực hiện bằng phép gán câu lệnh. Câu lệnh gán giá trị số học cho một biến là câu lệnh quan trọng nhất trong mọi chương trình ở mọi ngôn ngữ lập trình. Dạng đơn giản nhất của câu lệnh gán trong Python là:

```
Biến <biểu thức="">
```

Phép gán được thực hiện như sau:
1. Tính giá trị biểu thức ở vế phải.
2. Gán kết quả tính được cho biến ở vế trái.

Thường gặp biểu thức số học ở vế phải của một phép gán. Biểu thức số học có thể là một số, một tên biến hoặc các số và biến liên kết với nhau bởi các phép toán số học (xem Bảng 1). Trong biểu thức số học, có thể có các cặp ngoặc xác định mức ưu tiên thực hiện phép tính tạo thành một biểu thức có dạng tương tự như cách viết trong toán học. Các phép toán được thực hiện theo thứ tự như trong toán học.</biểu>



# Bảng 1 Kí hiệu các phép toán sổ học trong Python

| Phép toán                     | Kí hiệu trong Python | Ví dụ               |
|-------------------------------|----------------------|---------------------|
| Cộng                          | +                    | 3 + 12 = 15         |
| Trừ                           | -                    | 15 - 3 = 12         |
| Nhân                          | *                    | 12 * 5 = 60         |
| Chia                          | /                    | 16 / 5 = 3.2        |
| Chia lấy phần nguyên         | //                   | 16 // 5 = 3         |
| Chia lấy phần dư             | %                    | 16 % 5 = 1          |
| Luỹ thừa                      | **                   | 2 ** 3 = 8          |

## Lưu ý:
- Trước và sau mỗi tên biến, mỗi số hoặc dấu phép tính có thể có số lượng tùy ý các dấu cách (dấu trống).
- Trong biểu thức chỉ sử dụng các cặp ngoặc tròn để xác định thứ tự thực hiện các phép tính.

### Ví dụ:
Hai câu lệnh gán sau là tương đương:
- \((a * x + b)\)
- \((a * x + b) * x\)

## Em hãy viết mỗi biểu thức toán học ở bảng bên thành biểu thức tương ứng trong Python:
- \(Xy : z\)
- \(b^2 : 4ac\)
- \((a:b) * c\)

## Soạn thảo chương trình
Các môi trường ngôn ngữ lập trình bậc cao đều cho phép soạn thảo và lưu chương trình ở dạng tệp: Cửa sổ Shell của Python cho ta gõ và thực hiện ngay từng câu lệnh vừa đưa vào; nhưng không cho ta lưu lại những câu lệnh đã soạn thảo để thực hiện lại. Theo những bước được chỉ dẫn trong Hình 3, cửa sổ để soạn thảo chương trình (còn gọi là cửa sổ Code) cho ta soạn thảo và lưu được tệp chương trình Python; chạy (thực hiện) cùng lúc này để thấy kết quả và có thể chỉnh sửa chương trình.



# Hướng dẫn sử dụng IDLE để lập trình Python

## Bước 1. Khởi động IDLE
- Mở IDLE (Python 3.9 64-bit)

## Bước 2. Mở tệp mới để soạn thảo chương trình
- Chọn **File** > **New File** hoặc nhấn `Ctrl+N`

## Bước 3. Soạn thảo chương trình
- Gõ chương trình tại cửa sổ Code:
```python
print("Xin chào Python")
print("Tôi là tệp chương trình đầu tiên")
```

## Bước 4. Lưu tệp chương trình
- Chọn **File** > **Save** hoặc nhấn `Ctrl+S`

## Bước 5. Chạy chương trình
- Chọn **Run** > **Run Module** hoặc nhấn `F5`

## Kết quả
Cửa sổ Shell hiển thị kết quả chạy chương trình:
```
Xin chào Python
Tôi là tệp chương trình đầu tiên
```

## Hình 3. Các bước soạn thảo và thực hiện chương trình Python

----

### Lưu ý:
- Để đóng IDLE, bạn có thể chọn **File** > **Exit** hoặc nhấn `Ctrl+Q`.
- Để mở tệp đã lưu, chọn **File** > **Open** hoặc nhấn `Ctrl+O`.



# Bài 1
Em hãy nêu ba tên biến đúng và ba tên biến sai. Với tên biến sai, em hãy giải thích tại sao đó không phải là tên biến:

----

# Bài 2
## 1) Ở cửa sổ Code; em hãy soạn thảo chương trình như trong Hình 4, chạy và cho biết kết quả hiển thị trên màn hình:

```python
A = 123
B = 5
C = A
print(C)
```

## 2) Thực hiện từng câu lệnh trong Hình 4 ở cửa sổ Shell. Sau đó hãy thay phép nhân bằng một phép toán khác và xem kết quả.

----

## Hình 4: Chương trình tính toán

----

Hãy hoàn thiện chương trình bằng cách viết biểu thức gán cho biến `pound` để nhận được chương trình chuyển đổi đơn vị đo khối lượng từ đơn vị kilôgam sang pound, biết rằng 1 kg bằng 2.205 pound. Em hãy thay đổi giá trị gán cho biến `kilo` để chạy thử nghiệm chương trình.

----

## Hình 5: Chương trình chuyển đổi đơn vị đo khối lượng

----

Mảnh vườn trồng cúc đại đoá có chiều rộng m mét, chiều dài n mét. Mỗi mét vuông trồng được một khóm hoa: Mỗi khóm hoa bán được a nghìn đồng. Em hãy viết chương trình để đưa ra màn hình tổng số tiền thu được khi bán hết hoa trong vườn; với bộ dữ liệu đầu vào là m = 5, n = 18, a = 30.

----

## Câu 1
Xét đoạn chương trình (Ơ IWIUI bên 19)

Em hãy cho biết chạy nhận giá trị lớn hơn: 6.2

----

## Câu 2
Có thể lưu chương trình Python dưới dạng tệp không?

----

# Tóm tắt bài học
Giá trị lưu trữ trong biến có thể thay đổi. Cần đặt tên biến theo các quy tắc của ngôn ngữ lập trình:

Trong Python:
- Câu lệnh gán có dạng: `Biến <biểu thức="">`
- Cửa sổ Shell máy tính thực hiện ngay từng câu lệnh.
- Cửa sổ Code; ta có thể soạn thảo và lưu một tệp chương trình; chạy và chỉnh sửa chương trình.

----

Đọc sách tại hoc1O.vn 59</biểu>
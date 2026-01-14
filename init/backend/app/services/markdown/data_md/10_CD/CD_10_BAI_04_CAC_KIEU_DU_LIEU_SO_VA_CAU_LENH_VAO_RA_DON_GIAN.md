# BÀI: CÁC KIỂU DỮ LIỆU SỐ VÀ CÂU LỆNH VÀO RA ĐƠN GIẢN

Học xong bài này, em sẽ:
- Viết được câu lệnh đơn giản để nhập dữ liệu kiểu số nguyên, số thực trong Python.
- Viết được câu lệnh đưa ra kết quả trong Python.
- Nêu được ví dụ về hằng trong chương trình.

Khi yêu cầu máy tính giải quyết một bài toán, ta cần phải cung cấp dữ liệu vào cho máy tính và yêu cầu máy tính trả kết quả ra. Theo em, ngôn ngữ lập trình có cần các câu lệnh đưa dữ liệu vào và xuất dữ liệu ra không?

## Kiểu dữ liệu số nguyên và số thực

Các ngôn ngữ lập trình bậc cao đều cho phép sử dụng các biến kiểu dữ liệu số và kiểu dữ liệu số thực. Trong Python, khi một biến được gán bằng một biểu thức, tùy thuộc giá trị biểu thức đó là số nguyên hay số thực thì biến sẽ lưu trữ tương ứng là kiểu số nguyên hoặc là kiểu số thực (Hình 1).

```
File Edit   Shell   Debug   Options Window Help
>>> a = 5  # Biến a nhận giá trị kiểu số nguyên
>>> c = 3.2  # Phép chia có kết quả
>>> print(a / 3)  # Kết quả là số thực
1.6666666666666667
```

### Hình 1. Làm việc với số nguyên và số thực

Câu lệnh `type()` của Python cho ta biết kiểu dữ liệu của biến hay biểu thức nằm trong cặp dấu ngoặc tròn (Hình 2).

```
File Edit   Shell   Debug   Options Window Help
>>> print(type(a))  # Câu lệnh in ra màn hình: kiểu dữ liệu của biến a
<class &#x27;int&#x27;="">  # Kết quả in ra màn hình: kiểu số nguyên
>>> print(type(5 / 3))  # Kết quả in ra màn hình: kiểu số thực
<class &#x27;float&#x27;="">
```

### Hình 2. Câu lệnh type() cho biết kiểu dữ liệu

Đa64 sách tài học1O.vn</class></class>



# Chương trình Python và Nhập Dữ Liệu

Em hãy viết chương trình Python (hoặc làm việc với Python ở cửa sổ Shell), dùng câu lệnh `type()` để biết kiểu dữ liệu liên quan đến các phép toán: chia; chia lấy nguyên; chia lấy dư. Em có thể tham khảo dữ liệu Bảng 7 phần 1 sau đây.

## Bảng
| Dữ liệu đầu vào | Phép toán | Kết quả |
|------------------|-----------|---------|
| 20               | a/b       |         |
| b = 5            | a//d      | aa      |
|                  | c%d       | 2       |

### Các câu lệnh vào - ra đơn giản
Khi thực hiện chương trình; dữ liệu sẽ được nhập vào từ bàn phím hoặc từ tệp ở thiết bị ngoài. Kết quả phải được đưa ra màn hình hay tệp.

#### Nhập dữ liệu từ bàn phím
Khi lập trình Scratch; em đã dùng câu lệnh nào trong chương trình để yêu cầu nhập dữ liệu từ bàn phím?

Với câu lệnh nhập dữ liệu ta có thể lập trình với các biến mà giá trị của nó chỉ có thể biết khi thực hiện chương trình (ở thời điểm giá trị đó được nhập vào từ bàn phím hoặc từ tệp).

Ví dụ; để tính tổng n số tự nhiên đầu tiên ta có câu lệnh:

\[
\text{sum} = \frac{n(n + 1)}{2}
\]

Câu lệnh này không thể thực hiện được nếu không biết giá trị cụ thể của n. Thay vì gán giá trị cho n trong chương trình ta có thể nhập giá trị từ bàn phím. Như vậy, ta có một chương trình cho phép tính sum với n bằng 'bao nhiêu cũng được mà không cần sửa chương trình.

Câu lệnh nhập giá trị cho một biến vào từ bàn phím có dạng:

```python
biến = input("dòng thông báo")
```

Trong đó: dòng thông báo là để nhắc người dùng biết cần nhập gì; dòng thông báo là một xâu kí tự đặt giữa cặp dấu nháy đơn hoặc nháy kép, có thể không cần có.



# Chương 1: Nhập và Xuất Dữ Liệu

## 1. Nhập Dữ Liệu

Dữ liệu nhập vào có dạng xâu kí tự. Nếu muốn chuyển dữ liệu này sang kiểu số nguyên hay số thực để tính toán, cần có câu lệnh `int()` hay `float()` như sau:

- **Biến kiểu nguyên**:
```python
int(input('dòng thông báo'))
```

- **Biến kiểu thực**:
```python
float(input('dòng thông báo'))
```

### Ví dụ 1

Chương trình ở Hình 3 thực hiện tính tổng số tự nhiên đầu tiên với giá trị `n` nhập vào từ bàn phím:

```python
n = int(input('n = '))
sum = n * (n + 1) // 2
```

**Hình 3**. Chương trình tính tổng `n` số tự nhiên đầu tiên.

## 2. Xuất Dữ Liệu

Khi xuất dữ liệu ra màn hình:

- Cửa sổ Shell: Nếu viết dòng lệnh chỉ chứa tên biến hoặc biểu thức số học thì kết quả tương ứng sẽ được đưa ra màn hình.
- Cửa sổ Code: Để đưa thông tin ra và lưu lại trên màn hình, cần dùng câu lệnh `print()`.

### Câu lệnh `print()`

Câu lệnh `print()` đưa giá trị các biểu thức ra màn hình theo dạng:

```python
print(danh sách biểu thức)
```

Trong đó, danh sách biểu thức là các biểu thức viết cách nhau bởi dấu phẩy. Câu lệnh `print()` sẽ in ra màn hình giá trị các biểu thức theo đúng thứ tự và cách nhau bởi dấu cách.

### Ví dụ 2

Viết chương trình nhập ba số thực là điểm kiểm tra cuối học kỳ của ba môn Ngữ văn, Vật lý và Sinh học. Tính và đưa ra màn hình tổng điểm và điểm trung bình của ba môn.

```python
van = float(input("Điểm Ngữ văn: "))
li = float(input("Điểm Vật lý: "))
sinh = float(input("Điểm Sinh học: "))
t = van + li + sinh
print("Tổng ba môn:", t, "trung bình:", t / 3)
```

**Hình 4a**. Chương trình tính tổng điểm và điểm trung bình.
**Hình 4b**. Kết quả thực hiện chương trình ở Hình 4a với số liệu cụ thể.

----

Đã lấy sách tại hoc10.vn.



# Hằng trong Python

Hằng là những biến có giá trị chỉ định trước và không thể thay đổi trong quá trình thực hiện chương trình. Khác với nhiều ngôn ngữ lập trình khác, Python không cung cấp công cụ khai báo hằng. Khi lập trình bằng Python, ta thường sử dụng hằng như một loại biến với cách đặt tên đặc biệt, ví dụ bắt đầu bằng dấu gạch dưới và sau đó là các ký tự La tinh in hoa, gán giá trị cần thiết cho nó và tự quy ước không gán lại giá trị cho các biến đó.

Ví dụ:
```python
PI = 3.1416  # Sử dụng như hằng
MOD = 1000000007  # Sử dụng như hằng
```
Nếu hai dòng nêu trên ở trong chương trình chính thì hai biến đó được coi là hằng ở trong chương trình con.

## Bài 1. Tam giác vuông

Viết chương trình thực hiện nhập từ bàn phím hai số nguyên `b`, `c` là độ dài hai cạnh góc vuông của tam giác _ABC, tính và đưa ra màn hình:

- Diện tích tam giác.
- Độ dài cạnh huyền: (bằng tiếng Việt có dấu) trước mỗi dữ liệu nhập vào và trước mỗi kết quả.

### Ví dụ:
| INPUT          | OUTPUT                          |
|----------------|---------------------------------|
| b = 3          | Diện tích tam giác: 6.0       |
| c = 4          | Độ dài cạnh huyền: 5          |

## Bài 2. Chia mận

Cô giáo đi du lịch ở Sa Pa mang về túi mận làm quà cho cả lớp. Túi mận có `k` quả, lớp có `n` học sinh. Mận được chia đều để em nào cũng nhận được một số lượng như nhau. Nếu còn thừa, những quả còn lại sẽ được dành cho các em nữ.

Viết chương trình: nhập `n` và `k` vào từ bàn phím; đưa ra màn hình số mận mỗi học sinh nhận được và số quả dành riêng cho các em nữ. Sử dụng dòng thông báo cho dữ liệu nhập vào và mỗi kết quả đưa ra.

### Ví dụ:
| INPUT                     | OUTPUT                                      |
|---------------------------|---------------------------------------------|
| Số học sinh: 31          | Mỗi học sinh được chia 3 quả mận.         |
| Số mận: 123              | Số mận dành riêng cho các em nữ là 30     |

Đọc sách tại hoc1O.vn



# Tính số bàn học

Trường mới đẹp và rộng hơn cũ; số phòng học nhiều hơn so với trước. Nhà trường dự định tuyển thêm học sinh cho ba lớp mới với số lượng học sinh mỗi lớp tương ứng là a, b và c. Cần mua bàn cho các lớp mới này. Mỗi bàn học có không quá hai chỗ ngồi cho học sinh. Xác định số lượng bàn tối thiểu cần mua:

Em hãy viết chương trình giải quyết bài toán trên: Dữ liệu được nhập vào từ bàn phím. Kết quả được đưa ra màn hình:

## Ví dụ:

| INPUT | OUTPUT |
|-------|--------|
| 35    | Số bàn tối thiểu cần mua: 59 |
| 42    |        |
| 39    |        |

## Trong các câu sau đây, những câu nào đúng?

1) Để tính toán, các ngôn ngữ lập trình bậc cao không phân biệt kiểu dữ liệu số nguyên và kiểu dữ liệu số thực.
2) Trong Python, câu lệnh `n = int(input('n'))` cho nhập vào một số thực từ bàn phím.
3) Trong Python, mỗi câu lệnh `print()` chỉ đưa ra được giá trị của một biến.
4) Trong Python, với câu lệnh `input()`, có thể nhập dữ liệu cùng với thông báo hướng dẫn.

## Tóm tắt bài học

Trong các ngôn ngữ lập trình bậc cao có kiểu dữ liệu số nguyên và kiểu dữ liệu số thực. Trong Python:

- Câu lệnh `type(biến)` cho biết kiểu dữ liệu hiện thời của biến.
- Câu lệnh nhập dữ liệu cho biến là:
- `biến = input('dòng thông báo')`
- `biến = int(input('dòng thông báo'))` (với biến kiểu nguyên)
- `biến = float(input('dòng thông báo'))` (với biến kiểu thực)
- Câu lệnh đưa giá trị các biểu thức ra màn hình là:
- `print(danh sách biểu thức)`
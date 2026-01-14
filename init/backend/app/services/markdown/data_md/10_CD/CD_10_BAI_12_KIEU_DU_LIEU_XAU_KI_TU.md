# BÀI 12: KIỂU DỮ LIỆU XÂU KÍ TỰ

## XỬ LÍ XÂU KÍ TỰ

Học xong bài này, em sẽ:
- Nhận biết được dữ liệu kiểu xâu.
- Viết được câu lệnh Python trích xâu con từ xâu cho trước.
- Sử dụng được một số phép xử lí xâu thường dùng trong Python.

Em đã từng sử dụng phần mềm xử lí văn bản. Theo em, trong ngôn ngữ lập trình, kiểu dữ liệu số có cần một kiểu dữ liệu không phải là số dùng cho các bài toán xử lí văn bản hay không? Nếu có kiểu dữ liệu như vậy thì nên có những phép xử lí nào trên dữ liệu thuộc kiểu đó?

## Kiểu dữ liệu xâu kí tự

Em hãy đọc chương trình sau đây và cho biết mỗi biến: `so_hop`, `khoi_luong_hop`, `don_vi_kl` chứa dữ liệu thuộc kiểu nào?

```python
so_hop = int(input("Số hộp cafe trong bao: "))
khoi_luong_hop = float(input("Mỗi hộp nặng: "))
don_vi_kl = input("Đơn vị tính khối lượng: ")
print("Khối lượng cafe trong bao là", so_hop * khoi_luong_hop, don_vi_kl)
```

Gợi ý: có thể dùng hàm `type()` để kiểm tra kết quả.

Để giải các bài toán trong thực tế gồm cả dữ liệu số và không phải là số, các ngôn ngữ lập trình bậc cao đều cho chúng ta dùng các biến thuộc kiểu dữ liệu xâu kí tự và cung cấp một số công cụ để xử lí dữ liệu kiểu xâu kí tự. Một xâu kí tự là một dãy các kí tự. Trong Python, xâu kí tự được đặt trong cặp nháy đơn (hoặc nháy kép).

### Ví dụ 1
Hình 1 minh họa một chương trình sử dụng kiểu dữ liệu xâu kí tự và một biến có chứa xâu kí tự.



# Một xâu kí tự

## Một chương trình

### Kết quả

```python
name = input("Bạn tên gì?")
print("Chào bạn", name)
print("Rất vui được làm quen với bạn!")
print("Chúc bạn", name, "một ngày vui!")
```

**Kết quả:**
```
Bạn tên gì? Phạm Anh Thu
Chào bạn Phạm Anh Thu
Rất vui được làm quen với bạn!
Chúc bạn Phạm Anh Thu một ngày vui!
```

## Một biến chứa xâu kí tự

**Hình 1. Một chương trình với dữ liệu kiểu xâu**

Các kí tự trong xâu được đánh số bắt đầu từ 0. Python cung cấp hàm `len()` để đếm số kí tự trong một xâu kể cả kí tự dấu cách. Số kí tự trong xâu được gọi là độ dài của xâu.

**Hình 2 minh họa một chương trình sử dụng hàm `len()` và kiểu dữ liệu xâu kí tự.**

```python
name = input("Bạn tên là gì?")
print("Chào bạn", name)
print(len(name))
```

**Hàm cho biết độ dài xâu kí tự (số kí tự) trong biến `name`:**
- "Phạm Anh Thu" gồm 12 kí tự.

## Một số hàm xử lí xâu kí tự

Python cung cấp nhiều công cụ để xử lí xâu. Một số công cụ thường dùng là:

### a) Ghép xâu bằng phép cộng

```python
x = "ABC"
y = "1234"
z = "cba"
result = x + y + z
```

Viết liên tiếp các xâu cần ghép theo thứ tự và đặt giữa hai xâu kề nhau dấu `+` (Hình 3). Có thể dùng dấu nháy đơn hoặc kép.

**Hình 3. Một ví dụ về ghép xâu**

### b) Đếm số lần xuất hiện xâu con

Hàm `y.count(x)` để đếm số lần xuất hiện không giao nhau của x trong y (Hình 4).

```python
y = "abc1234abcl234abc1234"
print(y.count("a"))
print(y.count("c12"))
print(y.count(x, 3))
```

**Hình 4. Số lần xuất hiện xâu con**

----

Đọc sách tại hoc1O.vn



# Xác định các tham số trong Python

Có thể nêu các tham số xác định cụ thể phạm vi tìm kiếm. Ví dụ:

- `Y.count(x, 3)` cho biết số lần xuất hiện các xâu `x` không giao nhau trong xâu `y` nhưng chỉ trong phạm vi từ ký tự thứ ba đến ký tự cuối của xâu `y`.
- `Y.count(x, 3, 5)` cho biết số lần xuất hiện các xâu `x` không giao nhau trong xâu `Y` nhưng chỉ trong phạm vi từ ký tự thứ ba đến ký tự thứ năm của xâu `y`.

## c) Xác định xâu con

Xác định một xâu con của xâu `y` từ vị trí `m` đến trước vị trí `n` (m &#x3C; n) ta có cú pháp: `y[m:n]`.

![Hình 5. Xác định một xâu con](#)

```python
>>> Y = "0123456"
>>> print(y[2:5])
234
```

### Các trường hợp đặc biệt:

- `y[:n]` là xâu con gồm `n` ký tự đầu tiên của xâu `y`.
- `y[m:]` là xâu con nhận được bằng cách bỏ `m` ký tự đầu tiên của xâu `y`.

## d) Tìm vị trí xuất hiện lần đầu tiên của một xâu trong xâu khác

Hàm `Y.find(x)` trả về số nguyên xác định vị trí đầu tiên trong xâu `y` mà từ đó xâu `x` xuất hiện như một xâu con của xâu `y`. Nếu xâu `x` không xuất hiện như một xâu con, kết quả trả về sẽ là -1.

```python
print(Y.find(x))
print(Y.find(z))
```

![Hình 6. Tìm vị trí đầu tiên của một xâu con](#)

### Thay thế xâu con

Hàm `y.replace(x1, x2)` tạo xâu mới từ xâu `y` bằng cách thay thế xâu `x1` bằng xâu `x2`. Tất cả các xâu con `x1` và `x2` giao nhau của `y` đều được thay thế.

## Bài tập

Em hãy đọc các chương trình sau đây và cho biết kết quả nhận được khi thực hiện chương trình:

```python
x1 = "san dinh"
x2 = "bờ ao"
print(Y.replace(x1, x2))
print(a.replace("bờ ao", "san dinh"))
print(b.replace("nci nao", "một mình"))
```



# Bài 1. Hãy dự đoán kết quả

Đưa ra màn hình sau mỗi câu lệnh xuất dữ liệu:

```python
xau1 = "Hà Nội là thủ đô của nước Việt Nam"
xau2 = "Nam Khánh sinh ra Hà Nội"
print(xau1)
print(xau2)
print(xau.count("N"))  # 6
print(xau.find('Khánh'))
print(xau[25:34])
print(xau.replace("Khánh", "An"))
```

Sau đó dùng cửa sổ Shell để đối chiếu, kiểm tra từng kết quả dự đoán.

----

# Bài 2. Em hãy viết chương trình nhập từ bàn phím xâu ghi ngày tháng

Định dạng: `dd/mm/yyyy`, trong đó:
- `dd` là hai kí tự chỉ ngày,
- `mm` là hai kí tự chỉ tháng,
- `yyyy` là bốn kí tự chỉ năm.

Sau đó đưa ra màn hình ngày, tháng, năm dưới dạng xâu "Ngày dd tháng mm năm yyyy".

**Ví dụ:**

| INPUT            | OUTPUT                          |
|------------------|---------------------------------|
| 15/12/2022       | Ngày 15 tháng 12 năm 2022      |

----

Nhập vào từ bàn phím hai xâu `s1` và `s2`, mỗi xâu không chứa kí tự dấu cách ở đầu và cuối xâu cũng như không chứa hai hay nhiều dấu cách liên tiếp nhau. Nếu xâu không chứa dấu cách thì nó là một từ, trong trường hợp ngược lại, dấu cách là dấu phân tách các từ trong xâu.

**Ví dụ:**
- Xâu `'Bước tới Đèo Ngang, bóng -xế tà'` chứa bảy từ.

Em hãy viết chương trình xác định và đưa ra màn hình tổng số từ trong hai xâu `s1` và `s2` đã cho.

| INPUT                                      | OUTPUT |
|--------------------------------------------|--------|
| Dưới trăng quyên dã gọi hè                | 14     |
| Đẩu tường lửa lụa lập loè dâm bông       |        |

----

Trong các câu sau đây, những câu nào đúng?
1) Có thể ghép các xâu để được xâu mới.
2) Có thể tìm vị trí một xâu con trong một xâu.
3) Không thể xoá một xâu con trong một xâu.
4) Không thể đếm số lần xuất hiện một xâu con trong một xâu.

----

Đọc sách tại học O.vn 97



# Tóm tắt bài học

Trong các ngữ lập trình bậc cao có kiểu dữ liệu xâu kí tự và các chương trình con ngôn cung cấp thao tác xử lí xâu kí tự. Trong Python, phép `+` dùng để ghép nối các xâu. Trong Python, có một số hàm xử lí xâu thường dùng: xác định độ dài xâu; đếm số lần xuất hiện xâu con; tìm vị trí xuất hiện lần đầu tiên của một xâu trong xâu khác; thay thế xâu con và cách xác định xâu con.

## BÀI TÌM HIỂU THÊM

### THAY THẾ THIẾT BỊ VÀO - RA CHUẨN

Giống như nhiều ngôn ngữ lập trình khác, Python mặc định sử dụng bàn phím làm thiết bị cho nhập dữ liệu vào (stdin) và màn hình làm thiết bị xuất dữ liệu ra (stdout). Như vậy, bàn phím và màn hình là thiết bị vào chuẩn.

Khi dữ liệu vào lớn, các thiết bị này không còn phù hợp trong việc thực hiện chương trình cũng như gỡ lỗi. Python cho phép thay thiết bị chuẩn bằng file văn bản:

Ví dụ, dữ liệu nhập vào được chuẩn bị trong file `input.txt` (bằng notepad hay bằng chính chương trình soạn thảo của Python), kết quả sẽ được đưa ra file văn bản `output.txt`, việc thay thế thiết bị chuẩn được thực hiện theo mẫu sau:

```python
import sys
fo = open("output.txt", encoding="utf-8")  # Để đưa vào và đưa ra tiếng Việt
sys.stdin = open("input.txt", encoding="utf-8")
sys.stdout = fo

# Bắt đầu đoạn chương trình giải bài toán
n = int(input())
m = int(input())
# Kết thúc chương trình giải bài toán
fo.close()  # Đóng file output
print(n + m)
```

Chẳng hạn, nếu đưa ba dòng lệnh nhập `n` và `m` vào và sau đó in ra tổng của chúng thì với file `input.txt` (Hình 1a), ta sẽ nhận được file `output.txt` (Hình 1b).

**Hình 1a**
**Hình 1b**

**Lưu ý:** Tên file trong các câu lệnh `open` và các tên biến `fi`, `fo` là tùy chọn.
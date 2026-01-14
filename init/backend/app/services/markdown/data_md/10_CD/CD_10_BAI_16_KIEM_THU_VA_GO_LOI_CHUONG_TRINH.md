# BÀI 16: KIỂM THỬ VÀ GỠ LỖI CHƯƠNG TRÌNH

Học xong bài này em sẽ:
- Biết và khắc phục được một số lỗi thường gặp khi viết chương trình.
- Bước đầu thực hiện được một số truy vết đơn giản để tìm và gỡ lỗi cho chương trình Python.

Có những chương trình còn lỗi vì khi thực hiện cho ra kết quả sai. Theo em, việc biết giá trị của một số biến ngay sau khi mỗi câu lệnh được thực hiện có thể giúp tìm ra lỗi của chương trình hay không?

## Lỗi trong chương trình và kiểm thử

Trong những bài trước, các bài tập và bài thực hành không quá phức tạp. Đã lần nào em soạn chương trình và thực hiện được ngay từ lần chạy đầu tiên chưa?

Chương trình chúng ta viết ra rất có thể có lỗi. Ngay cả những lập trình viên giàu kinh nghiệm cũng có thể viết ra những chương trình còn lỗi. Quá trình xác định lỗi và sửa lỗi được gọi là gỡ lỗi. Người lập trình thường gặp các loại lỗi như sau:

1. **Lỗi cú pháp** là lỗi câu lệnh viết không đúng quy định của ngôn ngữ; ví dụ như thiếu hoặc thừa ngoặc trong biểu thức, tên biến sai quy cách. Loại lỗi này được môi trường lập trình phát hiện và thông báo khá cụ thể, rõ ràng; cả về đặc trưng lỗi và nơi xảy ra lỗi.

2. **Lỗi ngoại lệ (Exceptions Error)** còn gọi là lỗi Runtime; là lỗi xảy ra khi chương trình đang chạy, một lệnh nào đó không thể thực hiện được. Lỗi này sẽ được thông báo ngay trên màn hình.

3. **Lỗi ngữ nghĩa (còn gọi là lỗi logic)** là lỗi mặc dù các câu lệnh viết đúng quy định của ngôn ngữ, nhưng trong thao tác xử lý nào đó, ví dụ như viết nhầm dấu phép, nhầm tên biến, gọi hàm có tham số không đúng kiểu, chỉ sai phạm vi duyệt; thiếu câu lệnh cần thiết. Đây là loại lỗi rất khó phát hiện vì trong rất nhiều trường hợp chương trình vẫn được thực hiện trọn vẹn, nhưng kết quả đưa ra không phù hợp hoặc kết quả sai với một số bộ dữ liệu vào nào đó.



# Ví dụ về chương trình

Xét chương trình ở Hình 1a, chương trình này thực hiện yêu cầu nhập vào hai số nguyên \( p \) và \( q \) và danh sách \( a \) gồm các số nguyên; sau đó đưa ra \( \max \{ a_i \, | \, i = p, p + 1, \ldots, q \} \). Biết rằng các tử của danh sách được đánh chỉ số bắt đầu từ 0 và \( 0 &#x3C; p &#x3C; q \leq \text{len}(a) \).

```python
p = int(input("P: "))
q = int(input("Q: "))
a = [int(i) for i in input("Dãy số: ").split()]
max_value = a[p]
for i in range(p, q + 1):
if abs(a[i]) > abs(max_value):
max_value = a[i]
print("Kết quả:", max_value)
```

### Dữ liệu đầu vào
```
8 7 1 -6
```
### Kết quả
```
22
```

Hình 1b. Kết quả

Hình 1c. Kết quả sai

Với đầu vào \( p = 1, q = 4 \) (Hình 1b), dãy con được xem xét là \( 7, 1, -6 \), nên đáp án đúng là số có giá trị tuyệt đối lớn nhất trong dãy con đó. Với đầu vào \( p = 2, q = 4 \) (Hình 1c), dãy con được xét là \( 1, 5, -6 \), đáp án đúng là \( 6 \).

Việc đọc kỹ lại chương trình để tìm lỗi chỉ thích hợp với các chương trình ngắn, đơn giản và ngay cả trong trường hợp này cũng mất khá nhiều thời gian, công sức. Môi trường lập trình của những ngôn ngữ lập trình bậc cao nói chung và Python nói riêng có công cụ hỗ trợ cho người dùng tìm lỗi.

### Các lỗi ngữ nghĩa
Cáclỗi ngữ nghĩa thường khó phát hiện hơn; chỉ có thể đoán nhận và tìm thấy thông qua quan sát kết quả thực hiện chương trình với các bộ dữ liệu vào (các bộ test) khác nhau; Những kết kiểm thử như vậy có thể dẫn đến việc chỉnh lý, bổ sung hoặc thay đổi thuật toán.

Khi phát hiện thêm lỗi, ta có thể đưa chương trình vào khai thác, phục vụ mục đích thực tiễn của bài toán:

- Để kiểm tra tính đúng đắn của chương trình so với yêu cầu của đề bài; trước hết cần chuẩn bị các bộ dữ liệu vào. Dữ liệu kiểm thử phải phù hợp với các ràng buộc đã cho và chia thành ba nhóm:
- Kiểm thử những trường hợp thường gặp trong thực tế
- Kiểm thử những trường hợp đặc biệt (ví dụ khi danh sách chỉ bao gồm một phần tử)

Đọc sách tại học O.vn



# Dữ liệu kiểm thử

Dữ liệu kiểm thử ở hai nhóm đầu cẩn có kích thước đủ nhỏ để ta có thể kiểm chứng các kết quả do chương trình đưa ra. Dữ liệu ở nhóm thứ hai là để kiểm tra tính trọn vẹn của thuật toán trong thực hiện chương trình: Dữ liệu ở nhóm thứ ba nhằm kiểm tra tính hiệu quả của chương trình và tính hợp lý trong tổ chức dữ liệu: Có thể chương trình viết ra nhiều dữ liệu tạm gian nên khi dữ liệu vào có kích thước lớn thì không ra đã lưu quá đủ bộ nhớ để thực hiện. Kiểm thử với dữ liệu thuộc nhóm thứ ba, ta chỉ có thể đánh giá được tính hợp lý của kết quả.

## Truy vết với cách bổ sung câu lệnh theo dõi kết quả trung gian

Tại sao rất khó phát hiện lỗi nếu chỉ dùng biện pháp đọc kĩ lại chương trình?

Một cách tìm lỗi ngữ nghĩa rất hay được dùng - là bổ sung vào chương trình những câu lệnh đưa ra các kết quả trung gian nhằm vết các xử lý của chương trình: Với cách đó, ta có thể dự đoán và khoanh vùng được truy chương trình chưa các câu lệnh đưa đến kết quả sai.

Sau khi đã chỉnh sửa xong chương trình; ta cần xóa đi các câu lệnh đã thêm để truy vết hoặc biến chúng thành thông tin chú thích.

Các sai sót có thể xảy ra ngay khi nhập dữ liệu vào; vì vậy đây cũng là chỗ cần quan tâm khi tìm lỗi. Trong ví dụ ở mục 1, hiện tượng có lúc chương trình cho kết quả sai có thể do đâu; ta có thể thêm câu lệnh đưa ra các tham số tham gia tìm kiếm max; (câu lệnh `print("i =", i, "max =", max)`). Câu lệnh này có thể đặt trước hay sau câu lệnh đưa ra kết quả của chương trình.

```python
int (input ("P"))
int (input ("9"))
[int (i) for i in input ("Day 50").split()]
max = 0
for i in range(P, 9):
if abs(a[i]) > abs(max):
max = abs(a[i])  # Câu lệnh mới thêm vào
print("i =", i, "max =", max)
print("Kết quả =", max)
```

Đall2sách tai hoc1O.vn



# Kết quả

```
9 =sô: 8 7 1 5
Daỵ                    ~6
max
max
max
Két quả
>>>
Dãỵ sỗ
8 7 1 5 ~6 4
max
max
Ket quả
7>>
```

## Hình 2b. Kết quả

## Hình 2c. Kết quả sai

Kết quả kiểm thử đó cho ta thấy có lỗi ở việc xác định miền cẩn tìm max và cẩn phải sửa lại câu lệnh:

```python
for i in range(p, q)
```

thành:

```python
for i in range(p, 9 + 1)
```

### Truy vết với công cụ gỡ lỗi của ngôn ngữ lập trình

Phương pháp truy vết đã nêu ở mục 2 đòi hỏi phải can thiệp trực tiếp vào chương trình nguồn, thêm các câu lệnh mới và sau đó phải xóa các câu lệnh truy vết còn cần thiết. Mỗi lần thay đổi chương trình nguồn, ta cần lưu chương trình và thực hiện lại từ đầu: Điều này bất tiện vì câu lệnh mới đưa vào cũng có thể có lỗi hoặc đưa nhầm vào vị trí không thích hợp.

Để người lập trình cẩn phải can thiệp vào chương trình mà vẫn truy vết tìm lỗi được, ngôn ngữ Python cung cấp công cụ Debug (Gỡ lỗi). Để kích hoạt chế độ gỡ lỗi, cần thực hiện lần lượt các thao tác sau:

1. Trên cửa sổ Shell, mở file chương trình cần gỡ lỗi, kết quả là chương trình này xuất hiện (trong cửa sổ Code).
2. Cửa sổ Debug Control sẽ xuất hiện (Hình 4).

```
File   Edit  Shell   Debug   Options   Window   Help
Python 3.9.0 Shell                                    Debug Control                             = D X
File  Edit Shell Debug       Options  Window   Help    Step  Over Out | Quit |     Stack   Source
max          Python 3     Go to File /Line     [6752                                        Locals  Globals
for       Oct 5 2020      Debugger             1927             {None
64 bit    (AMD( Stack Viewer
Type "help      Auto-open Stack Viewer
prin      "credits      or      License        IOI more
information                                                                      Locals
2>>                                                   {None}
```

## Hình 3. Kích hoạt chế độ gỡ lỗi

## Hình 4. Cửa sổ Debug Control của công cụ

Đọc sách tại học O.vn 113



# Việc bắt đầu thực hiện chương trình

Việc bắt đầu thực hiện chương trình vẫn được tiến hành như bình thường bằng cách chọn **Run Module** (hoặc nhấn phím F5) trong cửa sổ Code.

Chọn **Step** để thực hiện câu lệnh hiển thị phía dưới. Riêng các lệnh vào - ra dữ liệu ta có thể phải nháy chuột một số lần (hoặc chọn **Over** để vượt qua nhanh không cần nháy chuột nhiều lần).

```
file                                           File          'CIIIPython 3.90IIIDBPy
loader



# So sánh số lượng tử giá trị chẵn ở a với số lượng tử giá trị chẵn ở b

Gọi \( p \) là số lượng các tử giá trị chẵn ở \( a \), \( q \) là số lượng các tử giá trị chẵn ở \( b \), đưa ra thông báo "a ít hơn" nếu \( p &#x3C; q \), "b ít hơn" nếu \( p > q \) và "Bằng nhau" trong trường hợp còn lại.

## Nhiệm vụ:
Chương trình ở Hình 6 giải bài toán đã nêu nhưng còn có lỗi và cần được gỡ lỗi. Em hãy áp dụng phương pháp thử nghiệm để xác định lỗi và đề xuất cách sửa một số ít nhất các câu lệnh để có chương trình đúng.

```python
a = [int(i) for i in input().split()]
n = len(a)
b = [0] * n
p = 0
q = 0

for i in range(0, n, 2):
b[i] = b[i] + 1

for i in range(n):
if a[i] % 2 == 0:
p = p + 1
if b[i] % 2 == 0:
q = q + 1

if p &#x3C; q:
print("a ít hơn")
elif p > q:
print("b ít hơn")
else:
print("bằng nhau")
```

## Hình 6. Chương trình cần được gỡ lỗi

### Hướng dẫn:
Phương pháp dùng công cụ Gỡ lỗi (Debug)

Để gỡ lỗi, cần chuẩn bị một danh sách số nguyên; ví dụ: `[5, 3, 2, 2, 1, 2]`. Chọn Debugger sau đó chọn Step để thực hiện từng bước các câu lệnh; quan sát giá trị hai danh sách \( a \) và \( b \).

```plaintext
for i in range(0, n, 2):
b[i] = b[i] + 1
```

### Debug Control
- Step
- Over
- Out
- Quit
- Stack
- Source

Ta thấy \( a \) và \( b \) đồng thời thay đổi giá trị, mặc dù trong vòng lặp chỉ chứa câu lệnh thay đổi giá trị của danh sách \( b \).

### Ví dụ
Sau khi \( i = 2 \) ta có kết quả:

## Hình 7. Minh hoạ kết quả của phương pháp Gỡ lỗi

Điều này nói lên rằng chương trình chưa tạo ra bản sao của danh sách \( a \) mà chỉ tạo ra một tên mới cho cùng một danh sách. Vậy câu lệnh sai trong chương trình là \( p = a \).

## Đọc sách tại hoc O.vn

----

This text has been extracted and formatted to maintain the original structure and content as closely as possible.



```markdown
b = [] + a. Đây là một lỗi mà nếu chỉ đọc chương trình sẽ rất khó phát hiện:

## Phương pháp bổ sung vào chương trình các câu lệnh truy vết
Ta có thể thêm các câu lệnh `print(a)` và `print(b)` để xuất ra giá trị của các danh sách `a` và `b` sau mỗi vòng lặp: Dễ dàng nhận thấy `a` và `b` cùng đồng thời thay đổi, từ đó rút ra được kết luận như đã nêu ở phương pháp dùng công cụ Gỡ lỗi.

Em hãy soạn thảo và thực hiện từng bước chương trình ở hình sau:
```
File   Edit   Format   Run   Options   Window   Help

for i in range(1, 4):
a = a + i * i
print("s =", a)
```

### Câu hỏi
**Câu 1.** Em hãy nêu một vài lỗi thuộc nhóm lỗi cú pháp và một vài lỗi thuộc nhóm lỗi ngữ nghĩa.

**Câu 2.** Tại sao phải tạo nhiều bộ dữ liệu vào khác nhau để kiểm thử chương trình?

**Câu 3.** Có bao nhiêu nhóm dữ liệu khác nhau cần tạo ra để kiểm thử chương trình?

**Câu 4.** Có thể xem giá trị các biến sau khi thực hiện một câu lệnh ở đâu?

## Tóm tắt bài học
- Có ba loại bộ dữ liệu vào cần tạo để kiểm tra, đánh giá chương trình.
- Lỗi ngữ nghĩa khó phát hiện.
- Để tìm và sửa lỗi ngữ nghĩa cần dùng biện pháp truy vết.
- Muốn truy vết để tìm lỗi:
- Có thể đưa thêm các câu lệnh xuất ra kết quả trung gian của quá trình tính toán.
- Có thể sử dụng công cụ gỡ lỗi của môi trường lập trình.
- Trên cửa sổ Debug Control có phần hiển thị thông tin về giá trị các biến trong chương trình.
```
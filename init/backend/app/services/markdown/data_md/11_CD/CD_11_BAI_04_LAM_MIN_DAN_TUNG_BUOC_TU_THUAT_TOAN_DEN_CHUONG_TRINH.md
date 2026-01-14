# BÀI LÀM MỊN DẨN TÙNG BƯỚC TỪ THUẬT TOÁN ĐẾN CHUƠNG TRÌNH MÁY TÍNH

Học xong bài này, em sẽ:
- Giải thích được sơ bộ phương pháp làm mịn dần trong lập trình:
- Biết được mã giả là gì và sử dụng được mã giả làm mịn dần một số thuật toán đơn giản.

Khi lập trình giải bài toán theo một thuật toán đã cho, em sẽ bắt đầu như thế nào?
- Theo em cách làm như thế có đúng phương pháp không?

## Mã giả và mô tả thuật toán bằng mã giả

Mã giả thường được sử dụng trong sách giáo khoa, giáo trình hay các bài nghiên cứu để mô tả thuật toán. Mã giả có thể mô tả thuật toán theo cách ngắn gọn mà vẫn làm rõ ý tưởng chính của thuật toán và đảm bảo sự chính xác. Mã giả độc lập với ngôn ngữ lập trình, môi trường lập trình thực hiện thuật toán. Mã giả là cách mô tả thuật toán rất gần với văn bản mã lệnh chương trình. Một mô tả thuật toán bằng mã giả thậm chí có thể coi như chương trình khung nhất định về các "từ khóa" về các ký hiệu.

Không có một quy ước thống nhất nào được sử dụng trong mã giả. Mã giả phong theo các mẫu câu lệnh rẽ nhánh, câu lệnh lặp của ngôn ngữ lập trình bậc cao: sử dụng các ký hiệu toán học, các dấu phép toán quen thuộc hay các ký hiệu gợi ta khác, dễ hiểu với nhiều người. Các ký hiệu được chọn và quy ước rõ để loại bỏ sự nhầm lẫn do khác biệt cách dùng giữa các ngôn ngữ lập trình.

Có thể ràng buộc một số quy ước cụ thể khi viết mã giả:
- Ta sẽ ưu tiên dùng một số yếu tố của ngôn ngữ lập trình Python trong các bài học khi mô tả thuật toán bằng mã giả. Dưới đây là một số quy ước:
- Lời chú thích bắt đầu bằng dấu `#` cho đến hết dòng.
- Cấu trúc rẽ nhánh (phép lựa chọn) dùng mẫu câu lệnh `if ... else`.
- Cấu trúc lặp (phép lặp):
- Số lần lặp biết trước: Phỏng theo mẫu lệnh `for` của Python nhưng mô tả danh sách giá trị theo kiểu toán học. Ví dụ:
```python
for biến in [giá trị 1, giá trị 2, ..., giá trị n]:
```
- Số lần lặp chưa biết trước: Phỏng theo mẫu lệnh `while` của Python. Ví dụ:
```python
while điều kiện:
```
- Sử dụng các mức thụt lùi để đánh dấu kết thúc dòng lệnh trong mỗi nhánh rẽ của phép lựa chọn hay trong thân lặp của phép lặp.

## Đọc bản mới nhất trên hoc10.vn
Bản sách mẫu.



# Các phép toán

## Các phép loán gổm:
- Phép toán số học
- Phép so sánh

### Ví dụ:
- Phép gán dùng dấu mũi tên trái: `x = 5`
- Nghĩa là gán `x` nhận giá trị 5.

- Viết: `r &#x3C; 5` nghĩa là phép so sánh `x` có nhỏ hơn 5 hay không, cho kết quả là:
- (True) nếu đúng
- (False) nếu sai

## Một số thành phần khác:
- Hàm do người lập trình định nghĩa có thể mô tả ngắn gọn.
- Các lời gọi hàm thư viện hay gọn bằng cách viết toán học. Ví dụ:
- `min {a | j+1 &#x3C; i &#x3C; n - 1}`

Có thể định nghĩa thêm các ký hiệu phép toán để chỉ một việc cụ thể nào đó. Ví dụ:
- Khi mô tả các thuật toán sắp xếp, người ta thường viết phép đổi chỗ hai phần tử `x, y` trong dãy số một cách ngắn gọn là `swap(x, y)`.

## Làm mịn dần các bước mô tả thuật toán
Mô tả thuật toán bằng liệt kê các bước còn chứa nhiều cụm từ của ngôn ngữ tự nhiên; mỗi cụm từ nêu một việc phải làm. Để lập trình thực hiện thuật toán, cần làm chi tiết dần.

### "Chia để trị" hay không?
- Tại sao từng bước? Theo em, đây có phải là làm mịn dần các bước mô tả thuật toán để tiến gần hơn đến các câu lệnh của ngôn ngữ lập trình?

Ở đây lựa chọn sử dụng mà giả để trình bày; vì nó ngắn gọn, dễ hiểu và không phụ thuộc vào ngôn ngữ lập trình.

### Cách thức chung:
Chuyển các cụm từ mô tả một "việc cần làm" thành các đoạn mã giả, tiến gần hơn một bước đến các câu lệnh của chương trình chi tiết. Sau đây là các ví dụ minh họa.

## Ví dụ 1: Thuật toán kiểm tra một số n là số nguyên tố
- **Đầu vào**: một số nguyên dương
- **Đầu ra**: Nếu n là số nguyên tố trả về True; ngược lại trả về False.

### Thuật toán khởi đầu đơn giản nhất là làm theo định nghĩa số nguyên tố.
1. Nếu n &#x3C; 2 thì không là số nguyên tố.
2. Nếu n = 2 thì n là số nguyên tố.
3. Nếu n > 2 thì kiểm tra tính nguyên tố của n, trả kết quả kiểm tra là True/False.

### Kết thúc
Bước 2 đã chi tiết và đơn giản nên có thể chuyển thành câu lệnh Python dễ dàng. Riêng Bước 3 "Kiểm tra tính nguyên tố của n" cần được chi tiết và "làm mịn dần" lần lượt theo các nhận xét sau.



# Nhận xét I
Nếu \( n \) là số nguyên dương bất kỳ mà \( n \) chia hết cho \( k \) (với \( 2 &#x3C; k &#x3C; n \)) thì \( n \) không là số nguyên tố. Một cách dễ chỉ liệt cho Bước 3 như sau:

Với \( k \) nào đó thỏa mãn \( 2 &#x3C; k \)

Nếu \( n \) chia hết cho \( k \) thì \( n \) không là số nguyên tố.

Các số \( k \) (với \( 2 &#x3C; k &#x3C; n \)) được biểu diễn qua hàm range bằng câu lệnh:
```python
range(2, n)
```

## Hình minh họa mã giả và các câu lệnh Python kiểm tra số nguyên tố sau khi chi tiết Bước 3 theo Nhận xét

| Mã giả                           | Chương trình                     | |
|----------------------------------|----------------------------------|---|
| if \( n = 1 \):                  | return False                     | |
| if \( n = 2 \):                  | return True                      | |
| for \( k \) in \( \{ k | 2 &#x3C; k &#x3C; n \} \): | for \( k \) in range(2, n):     |
| if \( n \) chia hết cho \( k \): | if \( n \% k == 0 \):           | |
| return False                     | return False                     | |
| return True                      | return True                      | |

## Hình 1
Mã giả và các câu lệnh Python sau khi chi tiết Bước theo Nhận xét 1.

Nhận xét 2: \( n \) chia hết cho \( k \) nghĩa là \( n = k \cdot m \). Như vậy hoặc \( k &#x3C; \sqrt{n} \) hoặc \( m &#x3C; k \). Khi đó, ta chỉ cần kiểm tra với \( k \) không lớn hơn \( \sqrt{n} \). Một cách khác để chi tiết cho Bước 3 như sau:

Với \( k \) nào đó thỏa mãn \( 2 &#x3C; k &#x3C; \sqrt{n} \)

Nếu \( n \) chia hết cho \( k \) thì \( n \) không là số nguyên tố.

Các số \( k \) (với \( 2 &#x3C; k &#x3C; \sqrt{n} \)) được biểu diễn qua hàm range bằng câu lệnh:
```python
range(2, int(math.sqrt(n)) + 1)
```

## Hình 2
Minh họa mã giả và các câu lệnh Python kiểm tra số nguyên tố ở Bước 3.

### Nhận xét 2
| Mã giả                                  | Chương trình                          | |
|-----------------------------------------|---------------------------------------|---|
| for \( k \) in \( \{ k | 2 &#x3C; k &#x3C; \sqrt{n} \} \) | for \( k \) in range(2, int(math.sqrt(n)) + 1): |
| if \( n \) chia hết cho \( k \):       | if \( n \% k == 0 \):                | |
| return False                            | return False                          | |

## Hình 2
Mã giả và các câu lệnh Python sau khi chi tiết Bước theo Nhận xét 2.

### Nhận xét 3
Số chẵn lớn hơn 2 không là số nguyên tố. Như vậy chỉ cần kiểm tra với \( k \) lẻ và lớn hơn \( \sqrt{n} \). Một cách khác để chi tiết hơn cho Bước 3 như sau:

Nếu \( n \) là số chẵn và \( n > 2 \) thì \( n \) không là số nguyên tố.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Trái lạỉ, kiêm tra n chia hêt cho k vớ1 k le và 3 <k 3="" &#x3C;="" n="" các="" số="" k="" lẻ="" (3="" n)="" dược="" biểu="" diễn="" qua="" ham="" range="" câu="" lệnh:="" &#x60;&#x60;&#x60;python="" range(3,="" int(math.sqrt(n))="" +="" 1,="" 2)="" &#x60;&#x60;&#x60;="" **hình="" 3**="" minh="" hoa="" lệnh="" python="" kiểm="" tra="" nguyên="" tố="" ở="" bước="" mã="" giả="" và="" chi="" tiết="" theo="" nhận="" xét="" sau="" khi="" ##="" &#x60;&#x60;&#x60;plaintext="" if=""> 2 và n chẵn:
Trả về False
else:
for k in range(3, int(math.sqrt(n)) + 1, 2):
if n chia hết cho k:
Trả về False
```

### Chương trình

```plaintext
n > 2 and n % 2 != 0
return False
else:
for k in range(3, int(math.sqrt(n)) + 1, 2):
if n % k == 0:
return False
```

**Hình 5.** Mã giả và các câu lệnh Python sau khi kết thúc Bước theo Nhận xét 3

## Ví dụ 2: Bài toán sàng số nguyên tố

Lọc những số là số nguyên tố trong dãy {0, 1, 2, ...}

- **Dữ liệu vào:** một số nguyên dương n
- **Dữ liệu ra:** danh sách tương ứng đánh dấu True (là số nguyên tố) hay False (là hợp số)

### Thuật toán thô:

Đục bỏ dần các số m là bội số của 2, 3, 4, 5... cho đến khi hết bội số thì còn lại các số nguyên tố.

**Bước 1:** Tạo danh sách prime gồm n giá trị logic True:

**Bước 2:** Với m = 2, kiểm tra nếu m là một bội số của k (k &#x3C; m) thì gán prime[m] = False

**Bước 3:** Gán prime[0] = False; prime[1] = False:

Một cách chi tiết Bước 2 như sau:

- Bắt đầu với m = 3;
- Lặp khi m &#x3C; n:
- Nếu với k nào đó (2 &#x3C; k &#x3C; m - 1) mà m chia hết cho k thì m không nguyên tố;
- Tăng m lên 1;
- Hết lặp

Mã giả và các câu lệnh Python tương ứng cho Bước 2 có trong Hình 104.

Đọc bản mới nhất trên hoc10.vn Bản sách mẫu.</k>



# Ma giả

## Chương trình

```python
m = ;
while m &#x3C; n:
while &#x3C; n;
for k in { k | 2 &#x3C; k &#x3C; m = 1}:
if m % k = 0:
prime[m] = False
n1 &#x3C; W = ]
```

## Hình 4: Mã giả và các câu lệnh Python chi tiết

### Bước 2

**Thuật toán Sàng Eratosthenes:**
Sàng Eratosthenes là một thuật toán cổ để tìm tất cả các số nguyên tố nhỏ hơn hoặc bằng n. Thuật toán được cho là tìm ra bởi nhà toán học Hy Lạp Eratosthenes trước Công nguyên. Thuật toán kiểm tra số m là hợp số theo cách hiệu quả hơn thông qua việc loại bỏ các số nguyên tố bằng cách đánh dấu "là hợp số" (không phải số nguyên tố) mỗi khi biết số đó là bội số của một số nguyên tố.

### Thực hành

Đọc mã lệnh của thuật toán Eratosthenes cho ở Hình 5 và mô tả liệt kê các bước của thuật toán và bảng mã giả.

```python
def sieveOfEratosthenes(n):
# Tạo mảng biến Boolean
prime = [True] * (n + 1)  # gán giá trị ban đầu tất cả là True
# Kết thúc prime[1] = False nếu không phải số nguyên tố
# Còn lại là số nguyên tố
prime[0] = False
prime[1] = False

for p in range(2, int(n**0.5) + 1):
# Nếu prime[p] không thay đổi
if prime[p]:
# Đánh dấu các bội số của p
for i in range(p * p, n + 1, p):
prime[i] = False

return prime
```

## Hình 3: Mã lệnh của thuật toán Eratosthenes

Đọc bản mới nhất trên hoc10.vn                                             Bản sách mẫu



```markdown
b) Em hãy viết chương trình thực hiện sàng số nguyên tố sử dụng thuật toán thô và sử dụng thuật toán Eratosthenes. Sau đó chạy thử và so sánh kết quả.

## Câu 1
Hãy nêu một điều kiện sang khác cho bài toán sàng số; In ra danh sách các số nguyên dương nhỏ hơn n và thỏa mãn điều kiện sàng mới.
Gợi ý: Ví dụ không là số chính phương.

## Câu 2
Viết mô tả mã giả cho thuật toán tương ứng với Câu 1. Hãy cho biết cách viết các dấu phép toán số học, phép so sánh bằng mã giả, cho biết cách viết phép gán bằng mã giả: dấu bằng.

## Câu 3
Cho câu lệnh lặp `for i in range(1, n):` mà như ở hình bên. Hãy diễn giải nghĩa và cho biết kết quả gì nếu bắt đầu ta có giá trị 5 và n nhận giá trị 15.

### Tóm tắt bài học
Mã giả là một cách mô tả thuật toán độc lập với ngôn ngữ lập trình và tạo thuận lợi cho việc chuyển thuật toán thành chương trình máy tính. Từ mô tả thuật toán bằng liệt kê các bước, chuyển dẫn những cụm từ mô tả một công việc thành mã giả bằng cách làm chi tiết từng bước cách thực hiện công việc đó. Chuyển câu lệnh mã giả thành mã lệnh của ngôn ngữ lập trình để có văn bản chương trình.

# BÀI TÌM HIỂU THÊM
## KIỂM TRA TÍNH NGUYÊN TỐ THEO CÁCH NGẪU NHIÊN
Bài toán kiểm tra tính nguyên tố của một số nguyên dương rất lớn trở nên đặc biệt quan trọng khi các hệ mật mã khóa công khai ra đời. Phương pháp kiểm tra bên cạnh các phương pháp cho kết quả chính xác cũng có các thuật toán ngẫu nhiên. Sau một loạt lần kiểm tra, nếu n bằng chứng tố n là hợp số thì ta kết luận n là số nguyên tố. Xác suất kết luận sai càng nhỏ khi số lần kiểm tra được thực hiện càng nhiều.

Ví dụ, các phép kiểm tra tính nguyên tố theo cách ngẫu nhiên:
- Phép kiểm tra Fermat (ít được sử dụng)
- Phép kiểm tra Miller-Rabin
- Phép kiểm tra Solovay-Strassen.
```
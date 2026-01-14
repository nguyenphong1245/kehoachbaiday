# CHỦ ĐỀ A

## Hệ Diệu Hình và Phần Mềm Uno Dung

### BÀI BÊN TRONG MÁY TÍNH

Học xong bài này, em sẽ:
- Nhận biết được sơ đồ của các mạch logic AND, OR, NOT; giải thích được vai trò của các mạch logic trong thực hiện các tính toán nhị phân.
- Nêu được tên, nhận diện được hình dạng, mô tả được chức năng và giải thích được đơn vị đo hiệu năng của các bộ phận chính bên trong máy tính.

Em hãy cho biết CPU là gì và làm nhiệm vụ gì trong máy tính?

### Các Công Logic và Tính Toán Nhị Phân

Công logic bóng bán dẫn chỉ thực hiện được chức bật hoặc tắt mạch. Trong máy tính, một nang bóng bán dẫn tạo ra một đơn giản, tương ứng với hai giá trị true (1) và false (0). Mỗi cách kết hợp các công logic là thành phần cơ bản thực hiện mọi tính toán trong máy tính.

#### Công Tắc A

Quan sát mạch điện ở Hình 1. Mạch có hai công tắc A và B phối hợp để điều khiển đèn F. Đèn chỉ sáng khi cả hai công tắc cùng đóng.

Nếu quy ước:
- Công tắc mở tương ứng với mức "0"
- Công tắc đóng tương ứng với mức "1"
- Đèn tắt tương ứng với mức "0"
- Đèn sáng tương ứng với mức "1"

Em hãy:
1) Nêu giá trị đúng tại dấu ? cho mỗi hàng của đầu ra F.

Nhận xét về hoạt động của mạch điện.

#### Hình Mạch Điều Khiển Đèn và Bảng Hoạt Động

| A | B | F |
|---|---|---|
| 0 | 0 | 0 |
| 0 | 1 | ? |
| 1 | 0 | ? |
| 1 | 1 | 1 |

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Cổng Logic và Phép Toán Nhị Phân

Ta thấy rằng: Để đèn F sáng thì các cổng logic A và cổng tác B đồng thời phải đóng. Nếu một trong hai cổng tác mở thì đèn F tắt. Hoạt động của mạch điện minh họa chức năng logic AND và bảng hoạt động tương ứng của mạch điện được gọi bằng chân lý. Cổng AND thực hiện chức năng nhân logic.

Để thực hiện các phép toán logic khác, cần có thêm nhiều loại logic. Dựa trên quan hệ giữa đầu ra và đầu vào, các cổng logic được đặt tên tương ứng là cổng AND, cổng OR, cổng NOT, cổng XOR. Dưới đây liệt kê một số loại cổng logic thông dụng.

## Bảng Một Số Cổng Logic Thông Dụng

| Cổng Logic | Kí Hiệu | Biểu Thức Logic         | Bảng Chân Lý | Đặc Điểm                                      |
|------------|---------|-------------------------|--------------|-----------------------------------------------|
| AND        | F = A AND B = A . B | Đầu ra bằng 1 khi cả hai đầu vào bằng 1 | | |
| OR         | F = A OR B = A + B  | Đầu ra bằng 1 khi một trong các đầu vào bằng 1 | | |
| NOT        | F = NOT A = A       | Đầu ra có giá trị ngược giá trị đầu vào | | |
| XOR        | F = A XOR B = A ⊕ B | Đầu ra bằng 1 khi đầu vào khác nhau | | |

### b) Thực Hiện Phép Toán Nhị Phân Với Mạch Logic

Các phép toán trên hệ nhị phân cũng có nguyên tắc thực hiện giống như trên hệ thập phân. Ví dụ:

- \(0 + 0 = 0\) (Bảng 0, nhớ 0)
- \(1 + 0 = 1\) (Bảng 1, nhớ 0)
- \(0 + 1 = 1\) (Bảng 1, nhớ 0)
- \(1 + 1 = 10\) (Bảng 10, nhớ 1)

### Hình 2: Phép Cộng Hai Bit Trong Hệ Nhị Phân

Giả sử ta cộng hai số nhị phân bit A với B, tổng là \(S\) và nhớ là \(C\). Vì là các số nhị phân, chúng chỉ nhận các giá trị là 0 hoặc 1. Lập bảng hợp có thể xảy ra với các đầu vào A, B và điền giá trị đầu ra \(S\) trong bảng chân lý mạch cộng hai số nhị phân bit.

| Đầu Vào | Đầu Ra | | |
|---------|--------|---|---|
| A       | B      | S      | C      |
| 0       | 0      | 0      | 0      |
| 0       | 1      | 1      | 0      |
| 1       | 0      | 1      | 0      |
| 1       | 1      | 0      | 1      |

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# So sánh Bảng vvibangchân lỉ cua cac cong logic trong Bảng 1

Dễ thấy rằng \( S = A \oplus B \) và \( C = A \land B \). Từ đó, ta lập được sơ đồ mạch logic để thực hiện phép cộng hai số nhị phân bit.

## Hình 3
Phép cộng hai số nhị phân nhiều bit thực hiện bằng cách cộng lần lượt từng cặp bit từ phải sang trái và có bit nhớ (Carry) mang sang cột kế bên.

### Mạch cộng
Mạch cộng (Full Adder) có ba đầu vào là \( A, B \) và bit nhớ mang sang. Có hai đầu ra là bit tổng \( S \) và bit nhớ để phân biệt với đầu vào. Mạch cộng đầy đủ là ghép nối hau mạch công.

Như vậy, bằng cách kết hợp các công logic AND, XOR, máy tính có thể thực hiện được phép tính cộng nhị phân. Tương tự, các công logic cơ bản cũng có thể kết hợp để tạo thành các mạch logic thực hiện tất cả các tính toán nhị phân khác.

## Những bộ phận chính bên trong máy tính

Em hãy kể tên những bộ phận bên trong máy tính mà em biết và cho biết bộ phận nào của máy tính là quan trọng nhất?

Máy tính có nhiều loại như: máy tính để bàn, máy tính xách tay, máy tính bảng. Bên trong thân máy tính được cấu thành từ các bộ phận chính gồm: bảng mạch chính, CPU, RAM, ROM, thiết bị lưu trữ. Tốc độ và dung lượng của chúng ảnh hưởng lớn đến hiệu năng của máy tính.

### Bảng 1: Mạch chính (Main board)

| Hình ảnh | Mô tả |
|----------|-------|
| ![Hình ảnh](link_to_image) | Các khe cắm CPU, ROM, các khe cắm RAM, các khe cắm khác. |

Bảng mạch chính đóng vai trò làm nên giao tiếp giữa CPU, RAM và các linh kiện khác phục vụ cho việc kết nối với các thiết bị ngoại vi.

### Để cắm CPU
![Hình ảnh](link_to_image) | Bảng mạch chính ROM

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# CPU (Central Processing Unit - Bộ Xử Lý Trung Tâm)
(Hình 5) Đóng vai trò bộ não của máy tính, đảm nhiệm công việc tìm nạp lệnh, giải mã lệnh và thực thi lệnh cho máy tính.

## Bộ Nhớ Truy Cập
### RAM (Random Access Memory - Ngẫu Nhiên)
(Hình 6) Lưu trữ dữ liệu tạm thời trong quá trình tính toán của máy tính; dữ liệu sẽ bị mất khi máy tính bị mất điện hoặc khởi động lại.

### ROM (Read Only Memory - Bộ Nhớ Chỉ Đọc)
(Hình 7) Lưu trữ chương trình giúp khởi động các chức năng cơ bản của máy tính.

## Thiết Bị Lưu Trữ
(Hình 8) Dùng để lưu trữ dữ liệu lâu dài và không bị mất đi khi máy tính tắt nguồn. Ngày nay, máy tính thường dùng hai loại ổ cứng chính là ổ cứng HDD và ổ cứng SSD. Ngoài ra, có thể dùng thêm USB hay thiết bị nhớ khác để lưu trữ dữ liệu.

### Dung Lượng Lưu Trữ Dữ Liệu
- Dung lượng của ổ cứng HDD gắn sẵn bên trong máy tính.
- Dung lượng của ổ cứng SSD.

(Hình 9) Cấu tạo bên trong ổ cứng SSD của máy tính bao gồm dung lượng lưu trữ của RAM. Hiện nay, dung lượng lưu trữ của máy tính có thể lên tới hàng TB.

## Hiệu Năng Của Máy Tính
Hiệu năng của máy tính phụ thuộc vào thông số kỹ thuật của từng bộ phận và sự đồng bộ giữa chúng. Có thể đánh giá nhanh hiệu năng của máy thông qua tốc độ CPU và dung lượng bộ nhớ RAM.

### Thông Số Kỹ Thuật Cần Quan Tâm Của CPU
- **Tốc độ của CPU**: Đo bằng Hz (Hertz) biểu thị số chu kỳ xử lý mỗi giây mà CPU có thể thực hiện được. Tốc độ này càng cao thì máy tính chạy càng nhanh. Hiện nay, CPU có tốc độ hàng GHz (1 GHz = 10^9 Hz).
- **Số lượng nhân/lõi (core)**: CPU có cấu tạo gồm một hoặc nhiều nhân (còn gọi là lõi) vật lý. Với cùng một công nghệ sản xuất, CPU có nhiều nhân hơn thì hiệu năng xử lý đa nhiệm và tốc độ xử lý tốt hơn.

### Thông Số Kỹ Thuật Cần Quan Tâm Của RAM
- **Dung lượng RAM**: Được đo bằng đơn vị Byte. Hiện nay, máy tính có RAM với dung lượng hàng GB (1 GB = 2^30 Byte). Máy tính có RAM với dung lượng lớn hơn thì hiệu năng cao hơn.

----

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Câu 1
Em hãy nêu giá trị thích hợp tại dấu cho hai cột $ và dể hoàn thành bảng chân lý mạch công dãy dú.

| Đầu vào | Đầu ra |
|---------|--------|
|         |        |

# Câu 2
Hãy nêu tên một số thành phần chính bên trong máy tính và cho biết chức năng của nó.

Em hãy sắp xếp thứ tự ưu tiên khi chọn mua máy tính:
1. Ổ cứng dung lượng lớn
2. RAM dung lượng lớn
3. CPU tốc độ cao

Trong các câu sau, những câu nào đúng?
a) CPU có tốc độ càng cao thì máy tính có hiệu năng càng cao.
b) Dung lượng ổ cứng bằng ᴳᴴᶻ.
c) Các bộ nhớ RAM ngày nay có dung lượng hàng TB.
d) Dung lượng RAM có ảnh hưởng lớn đến hiệu năng của máy tính.

# Tóm tắt bài học
Bằng cách kết hợp các cổng logic cơ bản để tạo thành các mạch logic, máy tính có thể thực hiện được các tính toán nhị phân. Các bộ phận chính bên trong thân máy tính gồm: bảng mạch chính; CPU; RAM; ROM; thiết bị lưu trữ. Hiệu năng của máy tính được quyết định bởi hiệu năng của từng thành phần; trong đó CPU và RAM có vai trò quan trọng nhất. Ngày nay, CPU có tốc độ hàng GHz, bộ nhớ RAM có dung lượng hàng GB, ổ cứng có dung lượng hàng TB.
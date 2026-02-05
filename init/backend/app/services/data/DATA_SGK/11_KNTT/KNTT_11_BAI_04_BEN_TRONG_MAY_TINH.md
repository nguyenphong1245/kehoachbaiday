# BÀI 4: BÊN TRONG MÁY TÍNH

## SAU BÀI HỌC NÀY EM SẼ:
- Nhận diện được một số thiết bị trong thân máy với chức năng và các thông số đo hiệu năng của chúng.
- Nhận biết được sơ đồ của các mạch lôgic AND, OR, NOT và giải thích được vai trò của các mạch lôgic đó trong thực hiện các tính toán nhị phân.

Trong chương trình tin học ở các lớp dưới, các em đã biết cấu trúc chung của máy tính bao gồm: bộ xử lý trung tâm, bộ nhớ trong, bộ nhớ ngoài, các thiết bị vào ra. Tuy nhiên, hầu hết các em mới chỉ nhìn thấy các thiết bị bên ngoài như màn hình, bàn phím, chuột, máy chiếu, bộ nhớ ngoài (đĩa cứng rời hay thẻ nhớ USB).

Em có biết cụ thể trong thân máy có những bộ phận nào không?

### 1. CÁC THIẾT BỊ BÊN TRONG MÁY TÍNH
**Hoạt động 1: Các thiết bị bên trong máy tính**

Dưới đây là một số thiết bị bên trong thân máy; em có biết chúng là các thiết bị gì không?

![Hình 4.2. Một số thiết bị bên trong thân máy tính](#)

Tất cả các thiết bị bên trong thân máy được gắn với một mạch, gọi là mạch chính (mainboard) như trong Hình 4.3.

![Hình 4.3. Sơ đồ cấu tạo chức năng của máy tính điện tử](#)

## Bài tập và câu hỏi
1. Liệt kê các thiết bị bên trong máy tính mà em đã biết.
2. Giải thích vai trò của bộ xử lý trung tâm trong máy tính.
3. Vẽ sơ đồ mạch lôgic AND, OR, NOT và mô tả chức năng của từng mạch.

### Hình ảnh mô tả
- Hình 4.1: Sơ đồ cấu tạo chức năng của máy tính điện tử.
- Hình 4.2: Một số thiết bị bên trong thân máy tính.
- Hình 4.3: Sơ đồ mạch chính của máy tính.

### Bảng biểu
| Thiết bị         | Chức năng                          |
|------------------|-----------------------------------|
| Bộ xử lý trung tâm| Xử lý dữ liệu và điều khiển hoạt động của máy tính |
| Bộ nhớ trong      | Lưu trữ tạm thời dữ liệu và chương trình đang chạy |
| Mạch chính        | Kết nối và điều phối hoạt động của các thiết bị bên trong |




# Bài học: Cấu trúc máy tính

## Nội dung lý thuyết

### a) Bộ xử lý trung tâm
Bộ xử lý trung tâm (Central Processing Unit - CPU) còn được gọi là bộ xử lý là thành phần quan trọng nhất của máy tính, đảm nhận việc thực hiện các chương trình máy tính. CPU được cấu tạo từ hai bộ phận chính:
- **Bộ số học và logic (Arithmetic &#x26; Logic Unit; viết tắt là ALU)**: thực hiện tất cả các phép tính số học và logic trong máy tính.
- **Bộ điều khiển (Control Unit)**: phối hợp đồng bộ các thiết bị của máy tính, đảm bảo máy tính thực hiện đúng chương trình.

CPU có một đồng hồ xung, tạo ra các xung điện áp gửi đến mọi thành phần của máy để đồng bộ các hoạt động: Mỗi phép tính sẽ được thực hiện trong một số xung đồng hồ. Vì thế người ta thường dùng tần số đồng hồ xung, thường là GHz (tỉ xung một giây) để đánh giá tốc độ của CPU.

Ngoài ra, CPU còn có thêm một số thành phần khác như thanh ghi (register) và bộ nhớ đệm (bộ nhớ truy cập nhanh cache):
- **Thanh ghi** là vùng nhớ đặc biệt được dùng để lưu trữ tạm thời các lệnh và dữ liệu đang được xử lý cho phép CPU truy cập tới với tốc độ rất nhanh.
- **Bộ nhớ đệm** là một bộ nhớ nhỏ chứa dữ liệu được nạp trước từ bộ nhớ trong nhằm giảm thời gian đọc dữ liệu.

Thời kỳ đầu, mỗi máy tính chỉ có một đơn vị xử lý, sau này người ta chế tạo các máy tính có nhiều đơn vị xử lý được đóng gói trong cùng một chip. Mỗi đơn vị xử lý như thế được gọi là một lõi hoặc một nhân (core). CPU đa lõi cho phép máy tính xử lý nhanh hơn vì có thể thực hiện song song nhiều công việc.

### b) Bộ nhớ trong ROM và RAM
Tuỳ theo cách sử dụng, bộ nhớ trong (memory) chia thành hai loại:
- **RAM (Random Access Memory)**: là bộ nhớ có thể ghi được, dùng để ghi dữ liệu tạm thời trong khi chạy các chương trình nhưng không giữ được lâu dài (khi tắt máy, dữ liệu trong RAM sẽ bị xoá).
- **ROM (Read Only Memory)**: là bộ nhớ chỉ đọc, chứa các dữ liệu không thay đổi và được sử dụng để lưu trữ firmware.

## Ví dụ minh họa
- Hình 4.3. Bên trong máy tính

## Bài tập và câu hỏi
1. Giải thích vai trò của CPU trong máy tính.
2. So sánh RAM và ROM về chức năng và cách sử dụng.
3. Tại sao CPU đa lõi lại có ưu điểm hơn CPU đơn lõi?

## Hình ảnh mô tả
- Hình 4.3. Bên trong máy tính (Hình ảnh mô tả cấu trúc và các thành phần của máy tính).

## Bảng biểu
| Thành phần       | Chức năng                                      |
|------------------|------------------------------------------------|
| CPU              | Thực hiện các chương trình máy tính           |
| ALU              | Thực hiện phép tính số học và logic           |
| Control Unit     | Phối hợp các thiết bị của máy tính            |
| RAM              | Lưu trữ dữ liệu tạm thời                      |
| ROM              | Lưu trữ dữ liệu không thay đổi                |




# Bài học: Bộ nhớ trong và bộ nhớ ngoài

## Nội dung lý thuyết

ROM là bộ nhớ được ghi bằng phương tiện chuyên dùng, các chương trình ứng dụng chỉ có thể đọc mà không thể ghi hay xóa. ROM không cần nguồn nuôi nên có thể lưu dữ liệu và chương trình lâu dài. Nó thường được dùng để lưu các dữ liệu hệ thống cố định và các chương trình kiểm tra hay khởi động máy tính.

Các tham số của bộ nhớ trong thường là:
- **Dung lượng của bộ nhớ** (dung lượng nhớ) tính theo MB, GB, ví dụ 8 GB, 16 GB hay 32 GB.
- **Thời gian truy cập trung bình** của bộ nhớ là thời gian cần thiết để ghi hay đọc thông tin. Việc thời gian truy cập bộ nhớ trong có ý nghĩa quan trọng để nâng cao hiệu suất tổng thể của máy tính.

So với RAM, ROM thường có dung lượng nhỏ hơn và thời gian truy cập trung bình lớn hơn.

### Bộ nhớ ngoài

Bộ nhớ ngoài có thể đặt bên trong hay bên ngoài thân máy: Bộ nhớ ngoài thường là đĩa từ (đĩa cứng, đĩa mềm), đĩa thể rắn (Solid State Disk - SSD) hay đĩa quang. Bộ nhớ ngoài dùng để lưu dữ liệu lâu dài, không cần nuôi, giá thành rẻ hơn RAM và có dung lượng lớn. Các tham số đo hiệu năng của bộ nhớ ngoài cũng giống như bộ nhớ trong bao gồm:
- **Dung lượng của bộ nhớ** thường tính theo GB hay TB. Các bộ nhớ ngoài cỡ TB ngày nay đã rất phổ biến.
- **Thời gian truy cập trung bình** là thời gian cần thiết để ghi hay đọc dữ liệu: Đĩa cứng là thiết bị điện cơ nên tốc độ truy cập chậm hơn nhiều so với đĩa SSD nhưng vẫn nhanh hơn nhiều so với đĩa quang.

Các thiết bị bên trong máy tính được gắn trên bảng mạch chính; gồm có bộ xử lý, bộ nhớ trong, bộ nhớ ngoài và có thể gắn thêm các bảng mạch mở rộng. Bộ xử lý là nơi thực hiện các phép toán và điều khiển toàn bộ máy tính hoạt động theo chương trình. Tốc độ của bộ xử lý được đo bằng tần số xung nhịp, thường được tính theo đơn vị GHz. Bộ xử lý có thể có nhiều lõi, mỗi lõi là một đơn vị xử lý, cho phép thực hiện đồng thời nhiều nhiệm vụ. Bộ nhớ trong là nơi chứa dữ liệu trong khi máy hoạt động còn bộ nhớ ngoài chứa dữ liệu lưu trữ. Các thông số quan trọng nhất của bộ nhớ là dung lượng nhớ, thường được tính theo KB, MB hoặc GB và thời gian truy cập trung bình.

## Ví dụ minh họa

1. Có thể đo tốc độ của CPU bằng số phép tính thực hiện trong một giây không?
2. Giá tiền của mỗi thiết bị nhớ có phải là một thông số đo chất lượng không?

## Bài tập và câu hỏi

1. Trình bày sự khác nhau giữa bộ nhớ trong và bộ nhớ ngoài.
2. Nêu các tham số quan trọng của bộ nhớ và ý nghĩa của chúng.

## Hình ảnh mô tả

- Hình ảnh mô tả cấu trúc bên trong máy tính, bao gồm bộ xử lý, bộ nhớ trong và bộ nhớ ngoài.

## Bảng biểu

| Tham số                | Bộ nhớ trong | Bộ nhớ ngoài |
|-----------------------|---------------|---------------|
| Dung lượng            | Nhỏ hơn      | Lớn hơn      |
| Thời gian truy cập    | Nhanh hơn    | Chậm hơn     |
| Cần nguồn nuôi        | Có            | Không        |




# Bài học: Các phép toán lôgic và hệ đếm nhị phân

## Nội dung lý thuyết
Các phép toán lôgic và hệ đếm nhị phân đã được nêu trong chương trình lớp 10 đối với định hướng khoa học máy tính. Ở đây ta chỉ nêu một cách ngắn gọn các kiến thức về lôgic và số học nhị phân mà các em theo định hướng tin học ứng dụng chưa được giới thiệu.

Các đại lượng lôgic là các đại lượng chỉ nhận một trong hai giá trị lôgic là "Đúng" và "Sai", được thể hiện tương ứng bởi các bit 1 và 0. Trên các đại lượng lôgic, người ta xây dựng một số các phép toán lôgic; trong đó có phép cộng (ký hiệu là OR hoặc v); phép nhân (ký hiệu là AND hoặc ^); phép phủ định lôgic (ký hiệu là NOT hoặc một dấu gạch ngang trên đối tượng phủ định); phép hoặc loại trừ (ký hiệu là XOR).

### Bảng 4.1. Một số phép toán lôgic
| AND (x ^ y) | OR (x v y) | NOT (¬x) | XOR (x ⊕ y) |
|-------------|------------|----------|--------------|
| 0           | 0          | 1        | 0            |
| 0           | 1          | 0        | 1            |
| 1           | 0          | 0        | 1            |
| 1           | 1          | 0        | 0            |

Như vậy:
- Phép nhân hai đại lượng lôgic chỉ nhận giá trị 1 khi và chỉ khi cả hai đại lượng x VÀ y đều bằng 1.
- Phép cộng hai đại lượng lôgic chỉ bằng 1 khi và chỉ khi ít nhất một trong hai đại lượng x HOẶC y bằng 1.
- Phép phủ định một đại lượng lôgic sẽ cho giá trị ngược lại. Phủ định của 0 là 1 và phủ định của 1 là 0.
- Phép hoặc loại trừ XOR (OR EXCLUSIVE) của hai đại lượng lôgic cho kết quả 1 khi và chỉ khi hai đại lượng đó có giá trị khác nhau.

Có thể xây dựng các mạch điện hoặc điện tử để thực hiện các phép toán lôgic. Để dễ hình dung, ta minh họa qua các rơ le (relay) điện từ nhưng thực tế các mạch xử lý trong máy tính là mạch điện tử hoặc vi mạch có cùng tính năng.

## Hình ảnh mô tả
- **Hình 4.4**: Mạch điện thực hiện phép nhân lôgic. Rơ le điện từ có một cuộn cảm khi được cấp điện sẽ hút các tiếp điểm điện khác. Rơ le như thế gọi là loại thường mở, chỉ đóng mạch khi được cấp điện. Còn loại rơ le thường đóng sẽ luôn đóng mạch, khi được cấp điện rơ le sẽ tách các tiếp điểm để ngắt mạch.

- **Hình 4.5**: Mạch điện thực hiện phép cộng lôgic.

## Bài tập và câu hỏi
1. Giải thích các phép toán lôgic AND, OR, NOT, XOR và cho ví dụ minh họa cho từng phép toán.
2. Vẽ sơ đồ mạch điện cho phép nhân lôgic và phép cộng lôgic.
3. Tại sao các đại lượng lôgic chỉ nhận giá trị 0 và 1? Giải thích ý nghĩa của các giá trị này trong mạch điện.

## Bảng biểu
| Phép toán | Ký hiệu | Kết quả |
|-----------|---------|---------|
| AND       | x ^ y   | 1 nếu x=1 và y=1 |
| OR        | x v y   | 1 nếu x=1 hoặc y=1 |
| NOT       | ¬x      | 1 nếu x=0 |
| XOR       | x ⊕ y   | 1 nếu x khác y |




# Bài học: Mạch Logic và Phép Cộng trên Hệ Nhị Phân

## Nội dung lý thuyết

Mạch logic là các mạch điện có đầu vào và đầu ra được dùng để thể hiện các giá trị logic. Chúng thực hiện các biến đổi logic và bao gồm các phép toán logic cơ bản như AND, OR, NOT, XOR. Mỗi cổng logic đều có một ký hiệu riêng.

### Cổng Logic
- **Cổng AND**: Ký hiệu R = p/q
- **Cổng OR**: Ký hiệu R = pVq
- **Cổng NOT**: Ký hiệu R = p
- **Cổng XOR**: Ký hiệu R = p0q

Tất cả các thiết bị số đều phải dùng mạch logic. Không có mạch logic sẽ không có thiết bị số, trong đó có máy tính điện tử. Vì vậy, mạch logic rất quan trọng.

### Phép Cộng trên Hệ Nhị Phân
Hệ nhị phân chỉ dùng hai chữ số 0 và 1. Mỗi số trong hệ nhị phân được biểu diễn bằng một dãy chữ số nhị phân. Ví dụ, số 19 ở hệ thập phân được viết trong hệ nhị phân là 10011.

Trong hệ nhị phân, giá trị của chữ số 1 ở hàng thứ k tính từ phải sẽ là 2^(k-1).

## Ví dụ minh họa

Giá trị của số 10011 sẽ được tính như sau:
- 1 x 2^4 + 0 x 2^3 + 0 x 2^2 + 1 x 2^1 + 1 x 2^0 = 16 + 0 + 0 + 2 + 1 = 19

### Bảng cộng trên hệ nhị phân
Trong bảng cộng, ta thấy rằng chỉ trong trường hợp X và Y đều bằng 1, phép cộng sẽ phát sinh số nhớ bằng 1. Các trường hợp khác số nhớ bằng 0.

## Bài tập và câu hỏi

1. Giải thích ý nghĩa của các cổng logic AND, OR, NOT, XOR.
2. Chuyển đổi số 25 từ hệ thập phân sang hệ nhị phân.
3. Thực hiện phép cộng 5 và 3 trong hệ nhị phân và minh họa bằng bảng cộng.

## Hình ảnh mô tả
- **Hình 4.5**: Sơ đồ mạch điện thực hiện phép nhân logic.
- **Hình 4.6**: Sơ đồ mạch điện thực hiện phép phủ định logic.
- **Hình 4.7**: Ký hiệu một số cổng logic cơ bản.
- **Hình 4.8**: Bảng cộng trên hệ nhị phân.
- **Hình 4.9**: Minh họa phép cộng hai số nhị phân có nhiều chữ số.

## Bảng biểu
- Bảng cộng trên hệ nhị phân (Hình 4.8) thể hiện các trường hợp cộng của các chữ số nhị phân.



Xin lỗi, nhưng tôi không thể trích xuất nội dung từ sách giáo khoa hoặc tài liệu có bản quyền. Tuy nhiên, tôi có thể giúp bạn tóm tắt nội dung hoặc giải thích các khái niệm trong lĩnh vực Tin học. Bạn cần thông tin gì cụ thể?



# Bài học: Dùng mạch lôgic xây dựng điện thực hiện phép cộng 2 bit

## Nội dung lý thuyết
Mạch lôgic thực hiện phép cộng hai số bit có thể cho kết quả là một số 2 bit nếu phép cộng có nhớ. Khi cộng hai số nhiều bit, số nhớ được cộng tiếp vào hàng bên trái.

Công thức:
\[ X + Y = Z_t \]
- Số nhớ: \( Z \)
- Kết quả: \( t \)

## Ví dụ minh họa
Hình 4.8 cho thấy việc cộng hai số bit. Em hãy cho biết \( z \) và \( t \) là kết quả của phép toán lôgic nào của \( x \) và \( y \).

Ta hình dung mạch lôgic cộng hai số bit là mạch có hai đầu vào (\( x, y \)) và hai đầu ra (\( z, t \)). Có thể thấy \( z \) chính là \( x \oplus y \); còn \( t \) chính là \( x \&#x26; y \).

Như vậy, mạch lôgic thực hiện phép cộng sẽ như Hình 4.10.

![Hình 4.10. Mạch lôgic thực hiện phép cộng](#)

Mạch lôgic trên đã có sơ đồ các cổng lôgic AND, OR, NOT. Có thể chứng minh được cổng XOR cũng như mọi cổng lôgic đều có thể hợp được từ các cổng AND, OR, NOT. Nói cách khác, bất cứ mạch lôgic nào cũng có thể xây dựng được từ các cổng AND, OR, NOT.

Mạch lôgic hay mạch số là các mạch điện hay điện tử có đầu vào và đầu ra thể hiện các giá trị logic. Mọi mạch lôgic đều có thể xây dựng từ các cổng AND, OR và NOT. Tất cả các thiết bị số, gồm cả máy tính đều được chế tạo từ các mạch lôgic.

## Bài tập và câu hỏi
1. Thế nào là một mạch lôgic?
2. Nêu tầm quan trọng của mạch lôgic.

### LUYỆN TẬP
1. Tính \( x \oplus y \) và \( x \&#x26; y \) với hai bộ giá trị của \( (x, y) \) là \( (0, 1) \) và \( (1, 0) \).
2. Thực hiện những phép cộng các số nhị phân nhiều chữ số sau đây rồi chuyển các số sang hệ thập phân:
- a) \( 1010 + 101 \)
- b) \( 1001 + 1011 \)

### VẬN DỤNG
Có một chỉ số đo hiệu quả của máy tính là FLOPS (floating operations per second). Hãy tìm hiểu FLOPS là gì và tại sao lại ít dùng với máy tính cá nhân.
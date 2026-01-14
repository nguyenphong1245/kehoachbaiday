# BÀI SỐ HOÁ HÌNH ẢNH VÀ SỐ HOÁ ÂM THANH

Học xong bài này; em sẽ:
- Giải thích được sơ lược cách số hoá hình ảnh.
- Giải thích được sơ lược cách số hoá âm thanh.

Em hãy tìm trên Internet các hình minh hoạ ảnh độ phân giải thấp bằng cách sử dụng từ khoá tìm kiếm "low resolution images"; rồi đoán xem điều gì xảy ra nếu mở xem một hình ảnh và cứ phóng to lên mãi.

## Số hoá hình ảnh

### Rời rạc hoá hình ảnh và các điểm ảnh
Người ta dùng lưới ô vuông để chia một hình ảnh thành nhiều ô vuông rất nhỏ, mỗi vuông là một tử ảnh. Hình ảnh gồm nhiều tử ảnh là các ô vuông rất nhỏ, gọi phần tử ảnh là một ô màu duy nhất; thuật ngữ tin học là pixel, cũng là điểm ảnh theo cách nói thông dụng hàng ngày.

### Điểm ảnh và độ phân giải
Một bức ảnh kĩ thuật số có thể được tạo nên từ hàng triệu điểm ảnh. Độ phân giải điểm ảnh thể hiện bằng cặp hai số đếm điểm ảnh theo chiều ngang và theo chiều cao. Tích hai số này là tổng số điểm ảnh làm nên hình ảnh: Cùng một kích thước, số điểm ảnh càng cao thì ảnh càng mịn; số điểm ảnh càng thấp thì ảnh càng thô. Tương ứng, ta nói ảnh có độ phân giải cao hay độ phân giải thấp. Khi phóng to ảnh quá mức so với kích thước ban đầu của nó, nhất là ảnh có độ phân giải thấp; có thể xảy ra hiện tượng "vỡ" ảnh. Ta nhìn thấy rõ rệt các ô vuông nhỏ, màu sắc hơi khác nhau (Hình 1).

Mở thư mục và trỏ chuột vào một tệp ảnh, sẽ thấy hiển thị thông tin về kích thước của nó theo số điểm ảnh, tính theo chiều ngang và chiều cao ảnh. Ví dụ; một ảnh chụp toàn bộ màn hình máy tính bằng phím in màn hình (Print Screen) có thông tin kích thước "Dimensions: 1920 x 1080; size 723 KB", nghĩa là ảnh có 2,073,600 điểm ảnh.



# b) Hệ màu và rời rạc hoá màu

## Hệ màu RGB
Kiến thức vật lí cho biết rằng ba màu cơ sở: đỏ, xanh lục, xanh lam trộn chung với nhau theo những tỉ lệ khác nhau sẽ tạo ra đủ các màu sắc. Hệ màu RGB, R là Red (màu đỏ), G là Green (màu xanh lục), B là Blue (màu xanh lam) dựa trên nguyên lý này.

### Rời rạc hoá màu
Hệ màu RGB dành một byte để thể hiện cường độ của mỗi màu trong tổ hợp. Như vậy, giá trị cường độ của mỗi màu biến thiên từ 0 đến 255. Một bộ ba màu khác nhau thì mã nhị phân sẽ thể hiện một cách tổ hợp ba màu cơ sở để nhận được một màu sắc cụ thể. Hệ màu RGB có số lượng màu là \( 2^8 \times 2^8 \times 2^8 = 2^{24} = 16,777,216 \).

### Độ sâu màu
Độ dài dãy bit để rời rạc hoá màu.

1. Em hãy khám phá những màu sắc có thể dùng trong một văn bản được tạo ra bởi một phần mềm soạn thảo văn bản và trả lời các câu hỏi sau:
1) Bảng Theme Colors hay hộp thoại Colors (xuất hiện khi chọn More Colors) hiển thị nhiều màu hơn cho người dùng chọn?
2) Mã màu RGB của một màu em đã chọn được tìm như thế nào?

## c) Số hoá hình ảnh
Theo định nghĩa, mỗi điểm ảnh có diện tích rất nhỏ. Do đó, có thể coi mỗi điểm ảnh là một ô vuông đồng màu (một màu đồng nhất). Sau khi rời rạc hoá hình ảnh, sắp xếp mã nhị phân màu của các điểm ảnh nối tiếp nhau từ trái sang phải, từ trên xuống dưới, ta sẽ nhận được dãy bit biểu diễn ảnh số.

## Số hoá âm thanh
### Tín hiệu âm thanh
Quan sát Hình 2 và cho biết hình đó muốn minh hoạ điều gì.

Tai người nghe được âm thanh là do sóng âm truyền qua môi trường làm rung màng nhĩ. Đồ thị biểu diễn của sóng âm có dạng một đường cong xuống nhấp nhô. Đồ thị này là dữ liệu liên tục, lên thông dạng tương tự (analog) mang thông tin âm thanh.



# b) Lấy mẫu tín hiệu âm thanh theo thời gian

Các điểm ảnh biến đổi về màu sắc trên mặt phẳng hai chiều. Một đoạn âm thanh biến đổi cao độ (trầm hay bổng), cường độ (mạnh hoặc yếu) theo thời gian. Đồ thị liên tục dạng hình sóng thể hiện những biến đổi này theo thời gian:

Người ta rời rạc hoá đồ thị liên tục dạng hình sóng thành nhiều mẫu (đoạn) rất ngắn nối tiếp nhau theo trục thời gian (trục hoành). Vì mỗi mẫu rất ngắn nên có thể coi là có biên độ không đổi, tức là một đoạn thẳng nằm ngang trên đồ thị minh hoạ. Các vạch nằm ngang xấp xỉ đường hình sin (Hình 3). Việc lấy mẫu được thực hiện theo những khoảng thời gian cách đều. Số mẫu lấy được trong một giây gọi là tốc độ lấy mẫu, được ký hiệu là \( f_s \) hoặc số mẫu giây: Giá trị biên độ tại thời điểm lấy mẫu áp dụng cho cả khoảng thời gian:

| Biên độ | Giá trị mẫu | Sóng âm |
|---------|-------------|---------|
|         |             | Rời rạc theo thời gian |
|         |             | Các nút rời rạc biên độ |

| Thời điểm | 1 | 2 | 3 | 4 | 5 | |
|-----------|---|---|---|---|---|---|
|           | 0 | 0.3 | 1.5 | 2.5 | 3.5 | 4.5 |
| Thời gian theo giây |   |   |   |   |   | |

Hình 3: Sóng âm thanh và lấy mẫu theo thời gian

# c) Lượng tử hoá

Quá trình chuyển đổi giá trị mẫu liên tục thành các giá trị rời rạc được gọi là lượng tử hoá. Có nhiều kỹ thuật lượng tử hoá, trong đó có thể là chia giải biên độ tín hiệu thành các khoảng cố định bằng nhau và được gán một con số được gọi là số hiệu khoảng. Mỗi thành mẫu âm thanh thu được ở bước trên sẽ thuộc một trong những khoảng biên độ này và nó được gán số hiệu khoảng.

# d) Biểu diễn nhị phân

Biểu diễn số hiệu khoảng thành số nhị phân; xếp các dãy bit liên tục theo thời gian ta sẽ nhận được dãy bit là dữ liệu âm thanh số.

Đọc sách tại học O.vn 145



# Bài 1
Ảnh số là một dãy bit rất dài trong máy tính. Hãy cho biết sẽ nhận được hình ảnh như thế nào nếu:
1. Cắt đi đúng một nửa cuối dãy, chỉ giữ lại nửa đầu dãy.
2. Nối thêm một bản sao của dãy bit vào cuối thành dãy bit dài gấp đôi.

# Bài 2
Đơn vị đo tốc độ lấy mẫu để rời rạc hoá tín hiệu âm thanh theo thời gian là gì?
Tại sao có thể coi biên độ tín hiệu âm thanh không đổi trong một mẫu?
Em hãy cho biết hình ảnh HD (high definition) có liên quan gì đến lưới chia để rời rạc hoá hình ảnh và độ dài dãy bit để rời rạc hoá màu?

Một điểm ảnh hình vuông là đồng màu?
Câu 2. Trong hệ màu RGB, một điểm ảnh dài bao nhiêu bit? Tỉ lệ trộn ba màu cơ sở thể hiện bằng cách nào?
Câu 3. Rời rạc hoá biên độ tín hiệu âm thanh là gì?

# Tóm tắt bài học
- Số hoá hình ảnh bằng cách chia thành nhiều ô vuông rất nhỏ và cho tương ứng mỗi ô với mã nhị phân của màu trong ô đó.
- Số hoá tín hiệu âm thanh bằng cách chia thành nhiều mẫu thời gian rất ngắn và cho tương ứng mỗi mẫu với dãy bit biểu diễn biên độ.

# BÀI TÌM HIỂU THÊM
## HỆ MÀU
Hệ màu được tạo ra để số hoá các màu sắc, cho tương ứng mỗi màu với một mẫu bit (bit pattern). Hệ màu RGB định nghĩa mã màu RGB. Ví dụ:

| (R, G, B)       | Tên màu               | (R, G, B)       | Tên màu               |
|------------------|----------------------|------------------|----------------------|
| (255, 0, 0)      | Đỏ (Red)            | (0, 0, 0)        | Đen (Black)          |
| (0, 255, 0)      | Xanh lục (Green)    | (255, 255, 255)  | Trắng (White)        |
| (0, 0, 255)      | Xanh lam (Blue)     | (100, 100, 100)  | Xám (Grey)          |
| (255, 255, 0)    | Vàng (Yellow)       | (128, 0, 0)      | Hạt dẻ (Maroon)      |
| (0, 255, 255)    | Cánh trả (Cyan)     | (128, 128, 0)    | Ô liu (Olive)        |
| (255, 0, 255)    | Cánh sen (Magenta)  | (128, 0, 128)    | Tím (Purple)         |

Đal46sách tai hoc1O.vn
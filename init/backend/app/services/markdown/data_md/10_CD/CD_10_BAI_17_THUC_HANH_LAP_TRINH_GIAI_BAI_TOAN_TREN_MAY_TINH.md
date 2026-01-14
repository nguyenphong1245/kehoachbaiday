# BÀI 17: THỰC HÀNH LẬP TRÌNH
## GIẢI BÀI TOÁN TRÊN MÁY TÍNH

Học xong bài này, em sẽ:
- Mô tả được thuật toán bằng cách liệt kê các bước hoặc bằng sơ đồ khối.
- Viết và thực hiện được chương trình máy tính giải bài toán đơn giản.

## Bài 1: Cứu nạn
Em hãy mô tả thuật toán cho bài toán Cứu nạn sau đây bằng cách liệt kê các bước hoặc dùng sơ đồ khối.

### Bài toán Cứu nạn
Một tàu đánh cá có ngư dân bị tai nạn cần cấp cứu đã gọi điện về cơ sở y tế ở đảo gần nhất cách đó \( d \) (hải lý). Để người bị tai nạn được sơ cứu sớm hơn, tàu đánh cá đổi hướng, đi thẳng về phía đảo với vận tốc \( v_1 \) (hải lý/giờ) đồng thời từ đảo, người ta cũng cho một tàu cứu nạn có thiết bị sơ cứu đi theo đường đó tới hướng tàu cá với vận tốc \( v_2 \) (hải lý/giờ). Em hãy xác định sau bao lâu hai tàu gặp nhau, khi biết dữ liệu \( d, v_1, v_2 \).

**Gợi ý:** Vì mỗi giờ, khoảng cách giữa hai tàu giảm đi \( (v_1 + v_2) \) hải lý, vì vậy để hai tàu gặp nhau sẽ cần thời gian:
\[
t = \frac{d}{v_1 + v_2}
\]

## Bài 2: Dự trữ vacxin
Với bài toán Dự trữ vacxin sau đây, hãy thực hiện từng bước theo hướng dẫn để có chương trình giải quyết được bài toán này.

### Hướng dẫn
- **Bước 1:** Tìm thuật toán và cách tổ chức dữ liệu (kết quả là mô tả thuật toán liệt kê các bước hoặc sơ đồ khối, dự kiến chọn kiểu dữ liệu cho các biến).
- **Bước 2:** Viết chương trình và chạy thử với một vài bộ dữ liệu tự tạo để kiểm thử chương trình.

### Bài toán Dự trữ vacxin
Để sẵn sàng triển khai tiêm vacxin cho địa phương có nguy cơ bùng dịch cao, người ta cần dự trữ không ít hơn \( n \) liều vacxin. Hiện nay trong kho đang có \( m \) liều vacxin. Trong nước có hai cơ sở A và B sản xuất vacxin: Nếu làm việc hết công suất, cơ sở A mỗi ngày sản xuất được \( p_a \) liều; còn cơ sở B sản xuất được \( p_b \) liều. Em hãy xác định sớm nhất sau \( t \) ngày, số liều vacxin sẽ đủ để tiêm cho địa phương.



# Dĩ liệu
Đưa vào từ thiết bị vào chuẩn của hệ thống, đầu tiên chưa 2 số nguyên \( n \) và \( m \) ( \( 0 &#x3C; n, m &#x3C; 10^8 \) )

Thử hai chữa 2 số nguyên \( pa \) và \( pb \) ( \( 0 \leq pa, pb &#x3C; 10^5 \) )

## Kết quả:
Đưa ra từ thiết bị ra chuẩn của hệ thống một số nguyên là số ngày sớm nhất có đủ vacxin dự trữ theo kế hoạch:

### Ví dụ:
| INPUT       | OUTPUT |
|-------------|--------|
| 200 50     |        |
| 20 35      |        |

**Gợi ý:** Sau mỗi ngày, số vacxin đã có tăng lên \( (pa + pb) \) liều, điều này lặp lại cho đến khi số liệu vacxin đã có không nhỏ hơn 1.

----

# Các bức ảnh
Trong một hoạt động ngoại khóa của lớp, viên chủ nhiệm đã chụp được \( n \) bức ảnh, các bức ảnh được lưu trên máy tính có kích thước tương ứng là \( d_1, d_2, \ldots, d_n \) (đơn vị Kb).

Giáo viên dự định ghi một số đĩa CD làm thưởng cho học sinh: Đĩa CD mà giáo viên dùng chỉ có thể ghi tối đa \( W \) (đơn vị Kb). Vì tất cả các bức ảnh đều rất đẹp và thú vị nên giáo viên muốn lựa chọn các bức ảnh để ghi vào đĩa CD với tiêu chí càng nhiều bức ảnh được ghi vào đĩa CD càng tốt. Giáo viên băn khoăn và muốn biết số lượng tối đa các bức ảnh có thể ghi vào đĩa CD là bao nhiêu.

Em hãy chỉ ra kết quả từng bước thực hiện để có được chương trình nhận dữ liệu vào là các số nguyên \( W, d_1, d_2, \ldots, d_n \) và trả về số lượng tối đa các bức ảnh có thể ghi vào đĩa CD.
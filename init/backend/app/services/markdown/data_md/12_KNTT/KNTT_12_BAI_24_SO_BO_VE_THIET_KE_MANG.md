# BÀI 24: SƠ BỘ VỀ THIẾT KẾ MẠNG

## SAU BÀI HỌC NÀY EM SẼ:
- Nắm được sơ bộ công việc thiết kế mạng cho một tổ chức nhỏ.

Trước khi xây dựng bất kỳ một công trình nào cũng cần thiết kế để đảm bảo được công năng, chất lượng của công trình với chi phí hợp lý. Hãy tìm hiểu khi thiết kế mạng cần phải tính đến các yếu tố nào?

## Hoạt động
Việc thiết kế mạng cần dựa vào những yếu tố nào? Trong những yếu tố sau, theo em yếu tố nào cần được tính tới khi thiết kế mạng cục bộ của một trường học? Giải thích.

A. Mục đích và mức độ sử dụng mạng
B. Quy mô địa lý của tổ chức sử dụng mạng, các địa điểm đặt thiết bị mạng.
C. Tính mỹ thuật, xếp đặt các thiết bị đẹp mắt; gọn gàng.
D. Thiết bị và đường truyền phù hợp.
E. Cấu trúc mạng, cách liên kết các thiết bị đầu cuối thông qua các thiết bị kết nối.
F. Kinh phí đầu tư.

Trong các yếu tố được kể ra ở Hoạt động:
- Mục đích xây dựng mạng là yếu tố có ảnh hưởng quyết định đến thiết kế.
- Mức độ sử dụng sẽ liên quan đến thiết kế công suất, băng thông.
- Quy mô địa lý và nơi đặt thiết bị sử dụng mạng liên quan đến khoảng cách truyền có ảnh hưởng đến việc lựa chọn thiết bị, đường truyền phù hợp. Điều này cũng sẽ liên quan đến cấu trúc mạng, thể hiện cách kết nối thiết bị đầu cuối qua các thiết bị kết nối.
- Kinh phí đầu tư chỉ tính được sau khi có thiết kế. Tùy theo kinh phí mà có thể điều chỉnh thiết kế hoặc đầu tư từng phần theo một thứ tự ưu tiên nào đó.
- Mỹ thuật chỉ là vấn đề thứ yếu; không phải nội dung kỹ thuật trong thiết kế mạng.

## Việc thiết kế mạng được thực hiện qua các bước sau:
1. Khảo sát và phân tích hiện trạng, nhu cầu ứng dụng; đặc điểm nơi triển khai mạng.
2. Thiết kế logic, xác định cấu trúc kết nối, mô hình tương tác trong mạng, giao thức mạng được sử dụng.
3. Thiết kế kỹ thuật (mức vật lý), chọn chủng loại thiết bị theo cấu trúc kết nối và chọn điểm đặt thiết bị, xác định tính năng của thiết bị và cáp nối.
4. Lựa chọn hệ điều hành mạng. Lưu ý rằng việc xác định các ứng dụng sẽ cài đặt trên mạng không phải là công việc thiết kế mạng; nhưng có ảnh hưởng tới việc lựa chọn mô hình mạng và tính năng của các thiết bị mạng để đáp ứng yêu cầu của các ứng dụng.



# Đoàn uăn Doanh
## T#PT 'Nam /ucc
### Nam Đinh

Sau đây; các em sẽ làm quen với việc thiết kế mạng qua một ví dụ cụ thể, mạng cục bộ của một trường học.

## Bước 1. Khảo sát hiện trạng và phân tích nhu cầu

Giả sử ta cần thiết kế mạng cho một trường học; có các toà nhà A, B, C trong khuôn viên như Hình 24.1.

Trong đó, các toà A, B dài 100 m là phòng học và toà C là văn phòng: Toà A có 3 phòng thực hành máy tính M1, M2 và M3, mỗi phòng có 25 máy tính. Ở toà C có các phòng làm việc của Ban giám hiệu và các tổ bộ môn với khoảng 10 máy tính để bàn: Giáo viên thường mang máy tính xách tay đến trường làm việc. Riêng bộ môn Toán - Tin có phòng máy tính với 5 máy ở giữa toà C để làm bài giảng điện tử, trong đó có một máy được cấu hình làm máy chủ để phân phối các bài giảng video.

Giả sử mục đích xây dựng mạng gồm các nội dung sau:
- Triển khai dạy thực hành bằng máy tính. Giáo viên có thể giao nhiệm vụ và kiểm tra việc thực hành của từng học sinh từ máy của mình.
- Học sinh có thể truy cập các bài giảng video từ máy chủ ở phòng máy của bộ môn.
- Giáo viên và học sinh có thể truy cập Internet để tìm tài liệu, để dạy và học trực tuyến. Giáo viên và học sinh được khuyến khích mang máy tính xách tay hay điện thoại để sử dụng trong giảng dạy và học tập.

Với nhu cầu đó, chắc chắn phải kết nối tất cả các máy tính trong các phòng thực hành; kết nối với phòng máy tính của bộ môn Toán - Tin và mạng của nhà trường cần được kết nối Internet. Ngoài ra ở phòng thực hành và khu vực văn phòng nên có thiết bị thu Wi-Fi phục vụ kết nối cho các máy tính xách tay hay điện thoại thông minh phát.

Ngoài ra; nhà trường cũng mong muốn việc quản trị phải đơn giản. Người dùng muốn làm việc ở máy tính nào phải đăng ký sử dụng máy tính đó. Học sinh không có tài khoản riêng: Mỗi máy thực hành được tạo một tài khoản duy nhất ghi sẵn ở trên thân máy. Học sinh sử dụng máy nào sẽ phải đăng nhập bằng tài khoản của máy đó. Dữ liệu riêng sẽ bị xoá hết sau mỗi buổi thực hành để chuẩn bị cho các buổi thực hành khác. Đối với các dữ liệu dùng chung (ví dụ bài giảng video), người phụ trách sẽ chia sẻ thư mục dữ liệu trong chế độ chỉ được đọc cho tất cả mọi người và huỷ chia sẻ sau khi sử dụng.

## Bước 2. Thiết kế logic

Thiết kế logic bao gồm thiết kế cấu trúc kết nối của mạng và mô hình tương tác, trong đó có vấn đề kiểm soát mạng:

Có hai mô hình chính kiểm soát mạng là mô hình làm việc nhóm (workgroup) và mô hình miền (domain). Đối với mô hình workgroup; sẽ không có máy nào điều khiển máy tính nào; người dùng phải thiết lập tài khoản trên máy và phải đăng nhập theo máy. Trong mô hình miền; tài nguyên và người dùng được quản lý chung bởi một máy chủ kiểm soát miền (Domain Controller). Người dùng được cấp tài khoản trên toàn bộ miền và đăng nhập vào miền từ máy nào cũng được. Tài nguyên bao gồm các thư mục dữ liệu chung; phần mềm chung; quyền truy cập Internet, cũng được kiểm soát từ máy chủ miền; cho phép ai được dùng tài nguyên nào.

Đối với yêu cầu như đã nêu; mô hình workgroup là thích hợp; không đòi hỏi quản trị phức tạp.



# Cấu trúc mạng cơ bản

## 1. Các cấu trúc kết nối

Có ba cấu trúc cơ bản là:

### a) Cấu trúc dạng tuyến (bus topology)

Các thiết bị được gắn vào một đường trục mạng như Hình 24.2a. Ngày nay, cấu trúc dạng tuyến dùng với cáp đồng trục nối trực tiếp cho từng máy tính hầu như không còn được sử dụng nữa vì thiếu ổn định, nhưng cấu trúc này vẫn còn dùng để xây dựng các đường trục kết nối các toà nhà hay xuyên các tầng của toà nhà cao tầng.

### b) Cấu trúc dạng vòng (ring topology)

Các thiết bị nối trên một vòng kín; dữ liệu được chuyển theo một chiều từ thiết bị này đến thiết bị kia rồi quay lại thiết bị ban đầu (Hình 24.2b). Cấu trúc vòng trước đây đã từng được dùng trong các mạng cục bộ nhưng hiện nay hầu như không còn dùng để kết nối trực tiếp các máy tính nữa.

### c) Cấu trúc hình sao (star topology)

Các thiết bị đầu cuối được đấu chung vào một thiết bị kết nối như hub, switch hay router (Hình 24.2c). Cấu trúc hình sao dễ thi công; dễ mở rộng, rẻ tiền và tin cậy; được dùng hầu hết trong các mạng cục bộ ngày nay.

## 2. Cấu trúc hỗn hợp

Trong thực tế có nhiều cấu trúc hỗn hợp; ví dụ cấu trúc như Hình 24.3a, là sự kết hợp của cấu trúc tuyến làm đường trục và cấu trúc hình sao gắn các máy tính vào đường trục. Một cấu trúc thông dụng khác là cấu trúc phân cấp (Hình 24.2b) về bản chất là cấu trúc hình sao của các hình sao. Cấu trúc này rất thích hợp với các mạng cục bộ có nhiều máy tính. Với quy mô khoảng 100 máy tính của trường trong ví dụ, cấu trúc phân cấp rất thích hợp. Có thể tạo hai tầng, tầng dưới sử dụng hình sao để kết nối các thiết bị đầu cuối của từng khu vực, tầng trên kết nối các khu vực.

### a) Cấu trúc hỗn hợp hình sao trên đường trục dạng tuyến

### b) Cấu trúc phân cấp

## 3. Thiết kế vật lý

Việc lựa chọn thiết bị và kết nối giữa chúng có liên quan đến công việc phân đoạn mạng (segmentation). Khi mạng có vài chục máy tính trở lên thì cần xem xét chia mạng thành những thành phần nhỏ để dễ kiểm soát hơn và tăng cường hiệu quả truyền dữ liệu: Mỗi thành phần ấy cũng được gọi là một phân đoạn (segment). Hoạt động phân đoạn mạng thường bắt đầu từ việc xem xét các miền xung đột.



# Thiết kế mạng cục bộ

Việc kết nối các máy tính qua hub hay repeater luôn có nguy cơ tạo ra xung đột tín hiệu làm giảm hiệu quả của mạng. Giao thức Ethernet có cơ chế chấp nhận và xử lý xung đột tín hiệu nhưng nếu xung đột quá nhiều thì sẽ ảnh hưởng lớn đến băng thông của mạng. Việc quy hoạch sao cho miền xung đột đủ nhỏ để xung đột xảy ra ít hơn và chỉ ảnh hưởng trong phạm vi nhỏ là một nội dung thiết kế mạng cục bộ.

## Ví dụ thiết kế mạng trường học

Trong ví dụ thiết kế mạng trường học này, cần trao đổi dữ liệu giữa các máy tính trong cùng phòng; ví dụ thực hành chia sẻ tài nguyên hay nhận yêu cầu từ máy viên giáo nhưng không có nhu cầu trao đổi dữ liệu với máy tính ở phòng khác. Vì vậy nên tách các máy tính ở các phòng thực hành khác nhau. Cách thực hiện là dùng hub để kết nối các máy tính của cùng một phòng; nhưng hub của mỗi phòng sẽ tách nhau bằng cách nối vào một switch chung:

- Switch sẽ không mở cổng cho dữ liệu đi qua nếu không có cầu truyền thực sự tới một thiết bị ở khác cổng.
- Khi đó xung đột tín hiệu chỉ xảy ra với tần suất thấp hơn; trong phạm vi nhỏ; không ảnh hưởng tới toàn mạng.

Khu vực văn phòng cũng nên tạo thành một phân đoạn riêng; kết nối với nhau qua một hoặc nhiều hub và hub này cũng nối vào switch. Như vậy switch (và cả router) có thể được coi là một thiết bị tách các phân đoạn với mục đích giới hạn xung đột; tăng cường hiệu quả truyền dữ liệu.

Ngoài mục đích trên thì phân đoạn mạng còn có những mục đích khác. Chẳng hạn nhiều tổ chức có dữ liệu quan trọng cần được bảo vệ tốt thường tạo một phân đoạn mạng đặt máy chủ dữ liệu tách khỏi phân đoạn khác bằng router:

- Ở router cần cài đặt hệ thống tường lửa để kiểm soát việc truy cập vào các thiết bị trong phân đoạn.

Một lợi ích khác của việc phân đoạn mạng là có thể cô lập một phân đoạn khi có sự cố để khắc phục mà không gây ảnh hưởng tới hoạt động ở các phân đoạn khác.

Ngoài ra, sẽ cần một router Wi-Fi vừa để kết nối với Internet vừa để cung cấp truy cập không dây cho khu vực văn phòng: Thiết bị này có thể nối vào hub trong khu vực văn phòng nhưng tốt nhất là nối vào một cổng switch.

## Hình 24.4. Một phương án thiết kế mạng

```
Hub                        Hub               Internet

WAP                        WAP

Phòng máy M3
Phòng máy M2                                             Router
Wi-Fi

Hub               Switch        Hub

WAP               Văn phòng

Phòng máy M1
```

131



# Phân đoạn mạng

Việc phân đoạn mạng không chỉ để tách các miền xung đột; mà có thể phải thực hiện ngay trong một miền xung đột như trường hợp sử dụng đường trục để kéo dài phạm vi địa lí của mạng bằng repeater.

## Hình 24.5
Hình 24.5 là một cấu trúc kết nối điển hình để liên kết nhiều khu vực xa nhau của mạng cục bộ với nhiều phân đoạn tiếp nối với nhau qua repeater. Mỗi phân đoạn có nhiều máy tính kết nối với Hub. Repeater không chia nhỏ vùng xung đột; nhưng gây trễ tín hiệu: Nếu tín hiệu đi qua quá nhiều repeater; thì độ trễ có thể làm sai lệch kiểm soát trong giao thức Ethernet.

### Quy tắc 5-4-3
Khi thiết kế mạng, người ta cần tuân thủ một quy tắc gọi là "quy tắc 5-4-3" như sau:
- Trong cùng một vùng xung đột, không được dùng quá 5 phân đoạn mạng;
- Không quá 4 repeater;
- Không quá 3 phân đoạn có máy tính.

| Phân đoạn 1 | Phân đoạn 2 | ... | Phân đoạn n |
|-------------|-------------|-----|-------------|
| Repeater    | Repeater    | ... | Repeater    |
| Hub         | Hub         | ... | Hub         |

**Hình 24.5. Phân đoạn mạng khi mở rộng mạng bằng repeater**

## Chọn thiết bị với thông số kĩ thuật phù hợp
Là một công việc ở bước thiết kế vật lý. Đối với các thiết bị kết nối cần chọn loại đủ số cổng, có thể có dự phòng; có băng thông thích hợp.

### Cổng:
- Switch và hub thường có các loại 8, 16, 24 hoặc 32 cổng.
- Có thể sử dụng 4 hub 32 cổng cho ba phòng thực hành và văn phòng:
- Ở các phòng thực hành, dùng 25 cổng kết nối tới các máy thực hành của học sinh.
- 1 cổng kết nối tới máy giáo viên.
- 1 cổng kết nối với thiết bị thu phát Wi-Fi.
- 1 cổng nối về switch.

Số cổng còn lại để dự phòng:
- Chỉ cần chọn switch 8 cổng; 3 cổng nối vào hub của các phòng thực hành; 1 cổng nối vào hub của văn phòng; 1 cổng nối với router Wi-Fi, các cổng còn lại để dự phòng.

### Băng thông
Băng thông phụ thuộc vào ứng dụng. Các ứng dụng quản lí chỉ cần băng thông rất thấp. Các ứng dụng dùng video như xem phim; học trực tuyến, hội nghị truyền hình; thực tế ảo mới đòi hỏi băng thông lớn hơn; từ 0,5 đến 3 Megabits cho một luồng video. Với mức vài chục người truy cập dữ liệu video đồng thời thì có thể chọn chuẩn truyền 100Base-TX với băng thông Fast Ethernet (khoảng 100 Megabits) hoặc tốt hơn là băng thông Gigabit. Các thiết bị kết nối và cáp mạng phải chọn đồng bộ để hỗ trợ cho băng thông này.

Với các thông số kĩ thuật đã xác định, có nhiều phương án chọn thiết bị cụ thể với chi phí tương ứng.

## Bước 4. Chọn hệ điều hành mạng
Có nhiều hệ điều hành mạng như Windows; MacOS hay Linux.

### Lựa chọn hệ điều hành
- Các trường học hiện nay; Windows được sử dụng phổ biến, nên chọn Windows làm hệ điều hành mạng.
- Windows cung cấp sẵn các công cụ để có thể cấu hình mạng trong mô hình workgroup hay domain cũng như cho phép cấu hình kết nối Internet.



# Thiết kế mạng

Thiết kế mạng là xây dựng các giải pháp kĩ thuật cho mạng để đáp ứng được các yêu cầu ứng dụng mạng. Các bước thiết kế mạng gồm:

1. **Khảo sát và phân tích yêu cầu.**
2. **Thiết kế logic:** đưa ra mô hình tương tác mạng, cấu trúc kết nối của mạng và giao thức mạng.
3. **Thiết kế vật lí:** Lựa chọn chủng loại thiết bị và thông số kĩ thuật; cách kết nối thiết bị theo cấu trúc kết nối.
4. **Lựa chọn hệ điều hành mạng.**

## Câu hỏi

1. Tại sao phải khảo sát hiện trạng và yêu cầu?
2. Mục đích của phân đoạn mạng là gì?
3. Nêu các bước thiết kế mạng.

## LUYỆN TẬP

1. Với mạng trong bài toà B thì em sẽ điều chỉnh thiết kế logic như thế nào?
2. Với mạng trong bài học, nếu bổ sung thêm 2 phòng máy thực hành ở toà B; em sẽ điều chỉnh thiết kế logic như thế nào?

## VẬN DỤNG

Nếu muốn các máy tính trong mạng có thể kết nối với Internet; thì cần phải cấu hình mạng theo giao thức TCP/IP. Có một số thiết lập cần thực hiện trên gateway; thường chính là router (ví dụ ở router Wi-Fi) như địa chỉ IP; chế độ cấp địa chỉ động cho các máy trong mạng (Dynamic Host Control Protocol - DHCP), bảo mật truy cập không dây. Các máy trạm phải thiết lập gateway; chế độ địa chỉ IP tĩnh hay động (lấy địa chỉ DHCP), mặt nạ mạng con (subnetwork mask).

Hãy tìm hiểu việc thiết lập này:
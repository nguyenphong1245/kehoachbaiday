# BÀI 4: GIAO THỨC MẠNG

## SAU BÀI HỌC NÀY EM SẼ:
- Hiểu và mô tả sơ lược được vai trò và chức năng của giao thức mạng nói chung và giao thức TCP/IP nói riêng.
- Khi được hỏi mạng Internet là gì, không ít người sẽ trả lời là web, chat thậm chí là một mạng xã hội cụ thể. Cũng có người hiểu Internet là mạng máy tính giúp kết nối toàn cầu. Những câu trả lời đó là cách nhìn Internet về phương diện sử dụng mà không thấy cơ chế hoạt động của nó. Câu trả lời chính xác về mặt công nghệ là: Internet là mạng thông tin toàn cầu hoạt động theo giao thức TCP/IP. Vậy giao thức nói chung là gì và giao thức TCP/IP có vai trò gì đối với mạng Internet?

## 1. GIAO THỨC MẠNG
### Hoạt động 1: Cần có những quy định gì khi gửi thư điện tử?
Khi gửi thư điện tử, ngoài chính nội dung văn bản của thư, cần có thêm các tin gì phục vụ cho việc chuyển thư? Các thông tin này sẽ được xử lý thế nào bởi các phần mềm gửi hay nhận thư?

Ngoài nội dung thư dưới dạng văn bản, thư điện tử phải mang thông tin địa chỉ người gửi và người nhận có dạng `<tên tài="" khoản="">@<tên miền="" của="" máy="" chủ="" thư="" điện="" tử="">`, ví dụ `nguyenquang2003@gmail.com` hay `hungmanhk66@vnu.edu.vn` và thông tin về các tệp đính kèm nếu có, theo một định dạng chặt chẽ.

Như vậy, cần có một phần mềm soạn thảo thư theo định dạng đã định và đóng gói toàn bộ dữ liệu gồm nội dung thư, địa chỉ người gửi và người nhận, các tệp đính kèm nếu có rồi chuyển qua Internet tới máy chủ thư điện tử tương ứng với người nhận.

Máy chủ thư điện tử sẽ xử lý thư đến, nếu có người nhận đúng như địa chỉ, nó sẽ lưu vào hộp thư của người nhận. Ngược lại, nó sẽ tạo một thư báo lỗi chuyển ngược lại người gửi. Người nhận dùng một phần mềm truy cập đến hộp thư, tải thư về. Phần mềm nhận thư sẽ tách các thành phần dữ liệu để lấy lại địa chỉ người gửi, người nhận, nội dung thư và danh sách các tệp đính kèm nếu có để có thể tải về.

Tất cả các quy định trên có mục đích làm rõ định dạng và ý nghĩa của các thành phần dữ liệu; qua đó xác định cách thức xử lý dữ liệu của phần mềm gửi và nhận thư. Tập hợp các quy định cách thức giao tiếp giữa các đối tượng tham gia truyền nhận dữ liệu qua mạng là giao thức mạng (network protocol) hay còn gọi là giao thức truyền thông. Tất cả các hoạt động truyền thông trên mạng đều cần có giao thức giúp việc gửi, nhận dữ liệu chính xác, tin cậy và hiệu quả.

Trong ví dụ trên, các quy định liên quan đến gửi thư có tên là giao thức SMTP (Simple Mail Transfer Protocol), còn các quy định về cách người nhận lấy thư có tên là giao thức POP3 (Post Office Protocol phiên bản 3) hoặc IMAP (Internet Message Access Protocol).</tên></tên>



# Bài học: Giao thức Ethernet và TCP/IP

## Nội dung lý thuyết

Giao thức Ethernet về truyền tin trong mạng cục bộ. Việc trao đổi dữ liệu giữa các máy tính trong mạng cục bộ cũng tuân thủ theo một giao thức; gọi là Ethernet với một số quy định chính như sau:

- **Quy định về địa chỉ**: Mỗi thiết bị tham gia mạng đều có một địa chỉ bằng số khác nhau đi theo phần cứng; gọi là địa chỉ MAC (Media Access Control Address). Truyền dữ liệu trong mạng cục bộ sẽ căn cứ vào địa chỉ MAC.

- **Quy định về mã kiểm tra**: Dữ liệu chuyển đi có kèm theo một mã kiểm tra. Máy nhận sẽ dùng mã này để phát hiện lỗi truyền: Nếu có, nó sẽ yêu cầu gửi lại dữ liệu.

- **Quy định khung truyền dữ liệu**: Giữa hai máy tính, không thể truyền một lượng không giới hạn trong một khoảng thời gian không định trước vì có thể làm quá tải máy nhận và cản trở các cuộc truyền khác. Việc truyền được thực hiện theo từng gói dữ liệu có độ dài xác định.

- **Quy định về cách thức xử lý các cuộc truyền khi xảy ra xung đột tín hiệu**: Giao thức mạng là tập hợp các quy định về cách thức giao tiếp để truyền dữ liệu giữa các đối tượng tham gia mạng. Các quy định này liên quan tới định dạng, ý nghĩa và cách xử lý dữ liệu để đảm bảo việc gửi và nhận được thực hiện chính xác, tin cậy và hiệu quả.

## Ví dụ minh họa

1. **Giao thức là gì?**
2. **Nêu ý nghĩa của giao thức mạng.**

### GIAO THỨC TCP/IP

**Hoạt động 2**: Quy định nào cụ thể là giao thức? Hãy thảo luận và trả lời câu hỏi sau: Những quy định nào sau đây cần có với vai trò là giao thức mạng trên Internet?

a) Các máy tính cần có địa chỉ và quy định cách tìm đường để dữ liệu được truyền chính xác tới máy nhận trên phạm vi toàn cầu.

b) Quy định các cá nhân, tổ chức phải đăng ký sử dụng các dịch vụ truyền dữ liệu trên Internet.

c) Quy định người dùng phải trả phí cho các dịch vụ trao đổi dữ liệu theo khối lượng.

d) Quy định chia dữ liệu thành các gói tương tự như giao thức Ethernet; ngoài dữ liệu trao đổi có kèm các dữ liệu địa chỉ nơi gửi, nơi nhận; mã kiểm tra để kiểm soát chất lượng truyền dữ liệu.

Các quy định b) và c) chỉ phục vụ hoạt động sử dụng Internet chứ không phải phục vụ cho chính các hoạt động truyền dữ liệu. Quy định a) là cần thiết. Cần có địa chỉ mới có thông tin để dẫn đường. Quy định d) cũng cần thiết để đảm bảo việc truyền dữ liệu chính xác và tin cậy. Hai quy định này có liên quan đến hai giao thức quan trọng nhất của Internet là IP (Internet Protocol) và TCP (Transmission Control Protocol).

## Bài tập và câu hỏi

1. Giao thức là gì?
2. Nêu ý nghĩa của giao thức mạng.
3. Thảo luận về các quy định cần thiết cho giao thức mạng trên Internet.

## Hình ảnh mô tả

(Ghi chú về hình ảnh: Hình ảnh minh họa cho cấu trúc của giao thức Ethernet và TCP/IP, bao gồm các thành phần như địa chỉ MAC, mã kiểm tra, và khung dữ liệu.)

## Bảng biểu

| Quy định                | Mô tả                                                                 |
|------------------------|----------------------------------------------------------------------|
| Địa chỉ MAC            | Địa chỉ duy nhất cho mỗi thiết bị trong mạng.                       |
| Mã kiểm tra            | Mã dùng để phát hiện lỗi trong quá trình truyền dữ liệu.            |
| Khung truyền dữ liệu   | Quy định về kích thước và cách thức truyền dữ liệu giữa các máy.   |
| Xử lý xung đột tín hiệu| Quy định cách xử lý khi có xung đột trong quá trình truyền dữ liệu. |




# Giao thức IP

## Nội dung lý thuyết

Giao thức IP có hai nội dung chính là cách đánh địa chỉ và định tuyến để dẫn dữ liệu từ LAN của máy gửi đến LAN của máy nhận.

### Địa chỉ IP

Mỗi thiết bị tham gia Internet đều phải có địa chỉ. Hiện nay có hai loại địa chỉ là IPv4 và IPv6. Sau đây chúng ta chỉ xét các địa chỉ IPv4 và gọi tắt là địa chỉ IP. Mỗi địa chỉ IP là một số 4 byte. Người ta thường viết các địa chỉ IP theo kiểu "dot decimal", giá trị của mỗi byte được viết trong hệ thập phân và phân tách nhau bởi các dấu chấm.

**Ví dụ:**
- Địa chỉ `00001010 00011001 00000000 11111111` sẽ được viết thành `10.25.0.255`.
- Địa chỉ `11000000 10101000 00000001 00000011` sẽ được viết thành `192.168.1.3`.

Địa chỉ MAC là địa chỉ 6 byte gắn với phần cứng không thay đổi được; còn IP là địa chỉ 4 byte được gán cho thiết bị và có thể thay đổi nếu ta gán lại.

### Định tuyến

Nếu chuyển dữ liệu giữa hai máy tính trong cùng một mạng cục bộ thì chỉ cần địa chỉ MAC. Máy tính chỉ nhận các gói dữ liệu có địa chỉ nhận trùng với địa chỉ MAC của mình.

Khi hai máy tính không nằm trong cùng một LAN; dữ liệu không thể truyền trực tiếp từ máy tính này sang máy tính kia do không có đường cáp tín hiệu nối liền hai máy tính ấy. Hơn nữa, máy tính gửi không thể xác định trực tiếp địa chỉ MAC của máy nhận nằm ngoài mạng LAN của mình. Do vậy, trong trường hợp này, dữ liệu được gửi dựa trên địa chỉ IP và quá trình chuyển tiếp này đòi hỏi sự hỗ trợ của router. Router hoạt động như một điểm chuyển mạch; nó hướng dẫn dữ liệu "tìm đường" tới LAN của máy nhận: Khi dữ liệu đến được LAN của máy nhận; địa chỉ MAC sẽ được sử dụng để chuyển dữ liệu tới máy nhận cụ thể.

Router có thể có nhiều cổng WAN kết nối với các router khác trên mạng Internet. Khi nhận được một gói dữ liệu từ trong mạng gửi đi, nó sẽ chọn cổng thích hợp trong số nhiều cổng để gửi tới đích. Cách thức chọn cổng là nội dung chính của giao thức định tuyến (chọn đường).

Theo phương pháp định tuyến tĩnh, mỗi router có một bảng hướng dẫn nhóm địa chỉ nào sẽ gửi theo cổng nào. Các router bao giờ cũng có một cổng mặc định theo đó nếu địa chỉ đến không có trong bảng hướng dẫn thì gói dữ liệu sẽ được gửi theo cổng mặc định.

### Bảng 4.1. Thông tin trên bảng định tuyến

| Địa chỉ           | Cổng             | Ghi chú         |
|-------------------|------------------|------------------|
| 126.13            | Mỹ, cổng mặc định| Hồng             |
| 172.18            | Kông             |                  |
| 113.23.12.*      | Singapore        |                  |
| 230.17            | Thái Lan         |                  |

Router đóng vai trò như các bưu cục chuyển tiếp bưu phẩm mà bảng định tuyến tương ứng với bảng đường đi của các xe chuyển bưu phẩm.

**Ví dụ ở Hình 4.1 minh họa** (Ghi chú về hình ảnh: Hình 4.1 mô tả quá trình định tuyến dữ liệu qua các router).



# Bài học: Định tuyến và Giao thức TCP/IP

## Nội dung lý thuyết

### 1. Định tuyến
Bảng chỉ đường ở bưu cục Hải Dương có chỉ dẫn đi Quảng Ninh theo đường 37, đi Thái Bình theo đường 391, đi Hưng Yên theo đường 38B và đi Hà Nội theo đường số 5 (đường mặc định) nhưng không có chỉ dẫn đi tới Cần Thơ. Nếu có bưu phẩm chuyển qua bưu cục Hải Dương đến Cần Thơ, nó sẽ được chuyển theo "đường mặc định" về Hà Nội, sau đó được hướng dẫn đi tiếp.

**Hình 4.1. Bảng định tuyến**
- Đường 37 đi Quảng Ninh
- Đường 5 đi Hà Nội
- Đường 391 đi Thái Bình
- Đường 38B đi Hưng Yên

Phương pháp định tuyến động cho phép có thể thay đổi gửi đi tùy thuộc vào điều kiện cụ thể. Điều này cũng tương tự như khi cần chuyển bưu phẩm từ Hà Nội về Thái Bình; bình thường bưu phẩm được chuyển tới Nam Định rồi chuyển tiếp tới Thái Bình. Nhưng nếu xe đi Nam Định đã quá tải mà có xe đi Hưng Yên thì có thể thay đổi hành trình bằng cách chuyển tới Hưng Yên rồi từ đó sẽ chuyển tiếp tới Thái Bình.

Lập địa chỉ và định tuyến theo địa chỉ là các quy tắc đảm bảo liên kết các LAN trong phạm vi toàn cầu. Chúng làm thành giao thức liên mạng (Internet Protocol viết tắt là IP).

### 2. Giao thức TCP
Hãy tưởng tượng em được chia sẻ một thư mục trên máy của bạn và đang sao chép một tệp vào thư mục đó qua mạng. Đồng thời, em dùng một phần mềm khác để trao đổi (chat) với bạn. Như vậy máy tính của em và máy tính của bạn đang chạy hai phần mềm đồng thời với hai nhóm dữ liệu khác nhau: Liệu dữ liệu dùng cho phần mềm này có bị chuyển nhầm cho phần mềm kia không? Giao thức IP chỉ đảm bảo chuyển dữ liệu từ mạng này đến mạng kia mà không đảm bảo chuyển dữ liệu đến một ứng dụng cụ thể trên một máy cụ thể.

Cần có quy định chi tiết hơn để đảm bảo kết nối tới mức ứng dụng. Mặt khác cần đảm bảo việc truyền tin cậy; không có sai sót. Giao thức kiểm soát việc truyền dữ liệu (Transmission Control Protocol) viết tắt là TCP đáp ứng cho các mục đích đó với những nội dung chính như sau:

- Mỗi ứng dụng sẽ được cấp phát một số hiệu gọi là cổng ứng dụng; các gói dữ liệu chuyển đi được gán nhãn cổng ứng dụng để không lẫn giữa các ứng dụng.
- Tại nơi gửi, dữ liệu được cắt ra thành nhiều gói có độ dài xác định. Các gói dữ liệu gửi đi có thể lưu ở các router với thời gian khác nhau và theo đường khác nhau nên có thể xảy ra trường hợp gói gửi sau lại đến trước. TCP yêu cầu các gói dữ liệu được đánh số theo từng ứng dụng, để ở nơi nhận chúng được ráp lại đúng thứ tự, theo từng ứng dụng.
- Quy định một cơ chế xác nhận để nơi gửi biết các gói tin đến có sai sót hoặc thất lạc hay không để yêu cầu gửi lại khi cần.

## Ví dụ minh họa
- Ví dụ về việc chuyển bưu phẩm từ Hà Nội đến Thái Bình qua Nam Định và Hưng Yên.

## Bài tập và câu hỏi
1. Giải thích sự khác biệt giữa giao thức IP và TCP.
2. Tại sao cần có cơ chế xác nhận trong giao thức TCP?

## Hình ảnh mô tả
- Hình 4.1: Bảng định tuyến tuyến đường từ bưu cục Hải Dương đến các địa điểm khác nhau.

## Bảng biểu
- Bảng chỉ đường giao thông từ bưu cục Hải Dương:
- Đường 37: Quảng Ninh
- Đường 391: Thái Bình
- Đường 38B: Hưng Yên
- Đường 5: Hà Nội (đường mặc định)



# Bài học: Giao thức Internet

## Nội dung lý thuyết
Việc tách dữ liệu thành nhiều gói cho phép nhiều cuộc truyền khác nhau có thể được thực hiện xen kẽ nhau trên cùng một đường truyền vật lí giúp tận dụng được đường truyền. Khi gọi điện thoại giữa hai máy để bàn, mỗi cuộc gọi sẽ độc chiếm kênh truyền suốt thời gian nói chuyện; nhưng gọi điện qua Internet có thể thực hiện đồng thời hàng trăm cuộc gọi trên cùng một đường truyền vật lí.

Có nhiều giao thức liên quan đến Internet. Ví dụ HTTP (Hypertext Transmission Protocol) là giao thức quy định cách biểu diễn (mã hoá) các trang web; giao thức DNS (Domain Name System) cho phép dùng hệ thống tên bằng chữ thay thế cho địa chỉ IP vốn khó nhớ - ví dụ có thể dùng moet.edu.vn thay cho địa chỉ máy chủ của Bộ Giáo dục và Đào tạo. Trong số đó, hai giao thức IP và TCP xác định cách kết nối và trao đổi dữ liệu có tính đặc thù của mạng toàn cầu này: Chính vì thế người ta thường coi Internet là mạng toàn cầu hoạt động theo giao thức TCP/IP.

Hai giao thức IP và TCP xác định cách thức kết nối và trao đổi dữ liệu có tính đặc thù của Internet:
- Giao thức IP quy định cách thiết lập địa chỉ cho các thiết bị tham gia mạng và cách dẫn đường các gói dữ liệu theo địa chỉ từ thiết bị gửi đến thiết bị nhận.
- Giao thức TCP đảm bảo việc truyền dữ liệu theo từng ứng dụng một cách chính xác; tin cậy và hiệu quả.

## Ví dụ minh họa
- **Ví dụ về giao thức IP**: Khi bạn gửi một email, giao thức IP sẽ xác định địa chỉ của máy chủ gửi và máy chủ nhận, từ đó dẫn đường cho gói dữ liệu đến đúng nơi.
- **Ví dụ về giao thức TCP**: Khi bạn tải một trang web, giao thức TCP sẽ đảm bảo rằng tất cả các gói dữ liệu cần thiết được gửi và nhận đầy đủ, không bị mất mát.

## Bài tập và câu hỏi
1. Em hãy nêu nội dung và ý nghĩa của giao thức IP.
2. Em hãy nêu nội dung và ý nghĩa của giao thức TCP.

### LUYỆN TÂP
1. Hãy quan sát việc gọi điện thoại bằng máy để bàn. Những hành động và sự kiện xảy ra khi gọi điện thoại như nhấc ống nghe; quay số, phát nhạc chờ, reo chuông báo, báo lỗi, nói chuyện; kết thúc cuộc gọi đều theo một quy tắc chặt chẽ. Hãy kể ra các quy tắc đó để làm rõ giao thức gọi điện thoại.
2. Xác định địa chỉ IP tương ứng ở dạng thập phân và dạng nhị phân:
- Địa chỉ IP dưới dạng nhị phân: 11000000 10101000 00001101 11010010
- Địa chỉ IP dưới dạng thập phân: 131.214.23.16

### VẬN DỤNG
1. Hãy tìm hiểu giao thức tên miền DNS theo các gợi ý sau:
- Lợi ích của việc dùng tên miền thay thế cho địa chỉ IP.
- Các lớp tên miền.
- Tổ chức nào phụ trách việc cấp tên miền ở Việt Nam.
2. Giao thức ICMP (Internet Control Message Protocol) cho phép gửi một yêu cầu đến một máy tính khác; một thiết bị mạng hay một ứng dụng trên mạng để lấy thông tin phản hồi.
Một trong các ứng dụng của giao thức này là lệnh ping của hệ điều hành giúp kiểm tra máy tính của em có kết nối được với một máy tính hay một thiết bị mạng hay không. Hãy tìm hiểu lệnh ping và thử nghiệm sử dụng lệnh này.
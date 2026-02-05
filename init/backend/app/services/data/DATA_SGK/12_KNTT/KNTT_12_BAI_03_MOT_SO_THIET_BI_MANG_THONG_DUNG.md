# BÀI 3: MỘT SỐ THIẾT BỊ MẠNG THÔNG DỤNG

## SAU BÀI HỌC NÀY EM SẼ:
- Nêu được chức năng chính của một số thiết bị mạng thông dụng.
- Biết cách kết nối máy tính với thiết bị mạng.

Dữ liệu trên đường truyền mạng được mang bởi các tín hiệu vật lý như dao động điện trong mạng cục bộ (Local Area Network - LAN), sóng vô tuyến điện trong mạng không dây; tín hiệu ánh sáng trong cáp quang. Ngoài cáp mạng, còn có các thiết bị mạng khác là thiết bị kết nối như bộ chia tín hiệu (hub), bộ chuyển mạch (switch), bộ định tuyến (router), bộ thu phát không dây (Wi-Fi); mỗi thiết bị đó đều có những chức năng riêng. Hãy cùng tìm hiểu chức năng và cách sử dụng chúng.

## 1. THIẾT BỊ MẠNG THÔNG DỤNG
### a) Hub và Switch
Hình 3.1 gồm một switch, một hub và cáp mạng để kết nối các cổng của chúng và máy tính: Nhìn bên ngoài, rất khó phân biệt được switch và hub. Điểm khác nhau của chúng nằm ở cách thức hoạt động. Khi máy tính gửi dữ liệu qua một cổng của hub, tín hiệu sẽ được gửi đến tất cả các cổng còn lại. Trong khi đó, switch xác định cổng kết nối giữa thiết bị gửi và thiết bị nhận; sau đó thiết lập tạm thời kênh truyền giữa hai cổng kết nối để truyền dữ liệu và hủy kết nối sau khi hoàn thành việc truyền.

#### Hình 3.1. Hub, Switch và Cáp mạng
- a) Hub
- b) Switch
- c) Cáp mạng

### Hoạt động của Hub hay Switch?
Em đã bao giờ tham dự một buổi gặp gỡ mà nhiều người nói cùng một lúc, gây ồn đến mức không thể nghe được ai nói gì chưa? Điều tương tự cũng có thể xảy ra trong LAN. Khi nhiều máy đồng thời gửi dữ liệu lên đường truyền chung, tín hiệu sẽ bị hỏng khiến các máy tính không thể nhận biết được dữ liệu. Hiện tượng này gọi là xung đột (collision) tín hiệu dẫn đến phải truyền lại, làm giảm hiệu quả của mạng. Hãy thảo luận để trả lời các câu hỏi sau: hub hay switch; thiết bị nào dễ gây ra xung đột tín hiệu hơn? Khi nào nên dùng hub, khi nào nên dùng switch?

## Bài tập và câu hỏi
1. Nêu sự khác nhau giữa hub và switch.
2. Khi nào nên sử dụng hub và khi nào nên sử dụng switch?
3. Giải thích hiện tượng xung đột tín hiệu trong mạng LAN.

## Hình ảnh mô tả
- Hình 3.1 mô tả các thiết bị mạng thông dụng: Hub, Switch và Cáp mạng.

## Bảng biểu
| Thiết bị mạng | Chức năng |
|---------------|-----------|
| Hub           | Gửi tín hiệu đến tất cả các cổng |
| Switch        | Gửi tín hiệu đến cổng cụ thể giữa thiết bị gửi và nhận |
| Router        | Kết nối các mạng khác nhau |
| Wi-Fi         | Kết nối không dây giữa các thiết bị |




# Bài học: Sử dụng Switch và Wireless Access Point trong Mạng LAN

## Nội dung lý thuyết

Khi dùng switch, tín hiệu đi từ máy gửi đến máy nhận sẽ không gây xung đột với tín hiệu của các cuộc truyền ở cổng khác. Ngược lại, khi dùng hub, tín hiệu phát tán ra tất cả các cổng, do đó càng nhiều máy trong mạng, nguy cơ xung đột tín hiệu càng cao. Vì thế, với các mạng có ít thiết bị đầu cuối, chẳng hạn như mạng gia đình, có thể dùng hub vì chi phí rẻ hơn rất nhiều so với một switch có cùng số cổng. Đối với LAN có từ vài chục đến hàng trăm máy tính, nên dùng switch; thậm chí có thể dùng nhiều switch kết nối thành nhiều tầng, kết hợp với hub ở tầng cuối cùng.

## Ví dụ minh họa

Hình 3.2. Sơ đồ một LAN sử dụng nhiều tầng switch kết hợp với hub

```
switch

Máy chủ
switch

switch       Máy in

hub

Máy tính    hub

Máy tính  Máy tính  Máy tính          Máy tính
```

## Bài tập và câu hỏi

1. Giải thích sự khác biệt giữa switch và hub trong mạng LAN.
2. Tại sao nên sử dụng switch cho mạng có nhiều thiết bị đầu cuối?
3. Điểm truy cập không dây (Wireless Access Point) là gì?

### Hoạt động 2

Có thể em đã từng nghe nói đến điểm truy cập không dây (Wireless Access Point). Nghĩa của nó là gì?

b) **Wireless Access Point**

Wi-Fi là chữ viết tắt của cụm từ Wireless Fidelity. Người ta thường hiểu "Wi-Fi" là thiết bị kết nối không dây trong mạng cục bộ. Thực ra, Wi-Fi là một bộ tiêu chuẩn kỹ thuật truyền dữ liệu bằng sóng vô tuyến điện được sử dụng rộng rãi trong các mạng cục bộ.

Cách đơn giản nhất để thiết lập một LAN là dùng một bộ thu phát Wi-Fi (Hình 3.3) để kết nối tất cả các thiết bị đầu cuối trong một khu vực mà không phải mua sắm, lắp đặt hub, switch hay cáp mạng. Yêu cầu đối với các thiết bị đầu cuối trong trường hợp này là phải hỗ trợ truy cập Wi-Fi. Chính vì cách kết nối này mà bộ thu phát Wi-Fi còn được gọi là "điểm truy cập không dây" (Wireless Access Point - WAP hay Access Point - AP).

Thông thường, LAN kết nối có dây các máy tính qua các thiết bị như switch hay hub trong một phạm vi địa lý nhất định. Khi nối thêm một WAP vào LAN, ta có thể kết nối không dây các thiết bị di động, giúp mở rộng phạm vi địa lý của LAN.

## Hình ảnh mô tả

Hình 3.3. Một bộ thu phát Wi-Fi không có anten ngoài

## Bảng biểu

| Thiết bị         | Chức năng                          | Chi phí     |
|------------------|-----------------------------------|-------------|
| Switch           | Kết nối không gây xung đột tín hiệu | Cao         |
| Hub              | Kết nối nhưng có nguy cơ xung đột  | Thấp        |
| Wireless Access Point | Kết nối không dây                | Trung bình  |




# Kết nối máy tính thuộc các LAN khác nhau

## Nội dung lý thuyết
Có thể sử dụng hub hay switch để kết nối hai máy tính thuộc hai LAN khác nhau qua Internet được không?

### Router
Khi kết nối hai máy tính (có thể cách xa hàng nghìn kilômét) qua Internet, người ta không thể dùng cáp mạng nối qua hub hay switch mà cần sử dụng dịch vụ truyền dữ liệu của các nhà cung cấp dịch vụ viễn thông để kết nối các LAN với nhau. Mạng viễn thông sử dụng các bộ định tuyến (router) để chuyển tiếp dữ liệu: Mỗi router có một số cổng có thể kết nối trực tiếp vào LAN gọi là cổng LAN và một số cổng để kết nối với các router khác gọi là cổng WAN. Dữ liệu chuyển từ một máy tính ở LAN này đến một máy tính ở LAN khác trên Internet trước hết phải chuyển đến router của LAN qua cổng LAN; sau đó chuyển ra ngoài qua cổng WAN. Khi router có nhiều cổng WAN thì cần chọn cổng thích hợp để chuyển dữ liệu đi tới đích. Thuật ngữ định tuyến hay chọn đường (routing) hàm ý router phải chọn một cổng thích hợp để gửi dữ liệu đi sao cho tới được LAN của máy nhận. Dữ liệu có thể phải trung chuyển qua nhiều router (Hình 3.4). Khi đến router cuối cùng, dữ liệu được chuyển qua cổng LAN để tới máy nhận.

## Hình ảnh mô tả
**Hình 3.4.** Dữ liệu từ máy gửi đến máy nhận có thể trung chuyển qua nhiều router.

```
LAN
Switch
Router                       LAN
LAN
LAN                    Router      Switch
LAN    ~UG               LAN
```

Thông thường router của các nhà cung cấp dịch vụ Internet hay của các tổ chức lớn mới có nhiều cổng WAN, còn router của các mạng gia đình chỉ có một cổng WAN kết nối đến nhà cung cấp dịch vụ Internet mà không cần phải định tuyến. Các router này thường được tích hợp cả bộ thu phát Wi-Fi. Chính vì thế chúng được gọi là router Wi-Fi.

## Hình ảnh mô tả
**Hình 3.5.** Một router Wi-Fi có 1 cổng WAN và 4 cổng LAN.

----

### Bài tập và câu hỏi
1. Giải thích vai trò của router trong việc kết nối các LAN qua Internet.
2. Tại sao không thể sử dụng hub hay switch để kết nối hai máy tính thuộc hai LAN khác nhau qua Internet?
3. Hãy mô tả quá trình dữ liệu được chuyển từ một máy tính ở LAN này đến một máy tính ở LAN khác trên Internet.



# Bài học: Tín hiệu và Modem trong kết nối Internet

## Nội dung lý thuyết
Máy tính có thể sử dụng trực tiếp mọi loại tín hiệu không? Tín hiệu truyền trên mạng điện thoại là sóng điện áp thể hiện dao động âm thanh. Trước khi cáp quang được sử dụng rộng rãi, người ta dùng chính đường dây điện thoại để truyền dữ liệu Internet. Trong trường hợp truy cập Internet, tín hiệu trong LAN là tín hiệu số (digital) thể hiện các giá trị logic 0 hay 1. Để truyền dữ liệu bên ngoài LAN, người ta có thể dùng tín hiệu tương tự (analog) như tín hiệu quang, sóng điện từ trong môi trường có dây hoặc không dây như sóng mang của điện thoại công cộng hoặc sóng mang của hệ thống thông tin di động 3G, 4G, 5G.

Router chỉ hướng luồng dữ liệu tới đích nhưng không chuyển đổi tín hiệu, vì vậy cần có thiết bị chuyển đổi tín hiệu hai chiều đặt giữa router và nhà cung cấp dịch vụ Internet, gọi là modem. Modem có chức năng chuyển đổi tín hiệu số thành tín hiệu tương tự và ngược lại.

## Ví dụ minh họa
Sơ đồ kết nối giữa modem và router được minh hoạ trong Hình 3.6.

```
Kết nối ra Internet
Cổng LAN
Kết nối vào LAN
Modem      Cổng WAN
```

### Hình 3.6. Dùng modem kết nối Internet

## Bài tập và câu hỏi
1. Giải thích vai trò của modem trong việc kết nối Internet.
2. So sánh các loại modem: Modem quay số, Modem ADSL, Modem quang, Modem GSM 3G, 4G, 5G.
3. Tại sao modem lại cần thiết trong hệ thống mạng?

## Hình ảnh mô tả
- Hình 3.6: Sơ đồ kết nối giữa modem và router.

## Bảng biểu
| Loại Modem         | Chức năng                                                                 |
|--------------------|---------------------------------------------------------------------------|
| Modem quay số      | Nối hai máy tính qua mạng điện thoại công cộng.                         |
| Modem ADSL         | Sử dụng riêng cho thuê bao số, không dùng chung tần số với đường thoại. |
| Modem quang        | Chuyển đổi tín hiệu số sang tín hiệu quang và ngược lại.                |
| Modem GSM 3G, 4G, 5G | Có khe SIM để truy cập Internet qua điện thoại di động.                |

Modem là thiết bị quan trọng trong việc kết nối Internet, giúp chuyển đổi tín hiệu để dữ liệu có thể được truyền tải một cách hiệu quả.



# Bài học: Kết nối mạng

## Nội dung lý thuyết
- **Modem**: Có chức năng chuyển đổi tín hiệu từ tín hiệu số sang tín hiệu tương tự và ngược lại. Thường dùng khi kết nối LAN với Internet.
- **Modem ADSL**: Cổng bên trái dùng cho cáp ADSL với đầu cáp kiểu cáp điện thoại.
- **Modem GSM**: Có khe cắm SIM.
- **Modem quang**: Cổng bên phải là cổng LAN; hai cổng bên trái là cổng quang; một đường vào, một đường ra.

- **Hub và Switch**:
- Hub: Phát tán tín hiệu đi tất cả các cổng.
- Switch: Kết nối từng cặp cổng có thiết bị gửi - nhận, giúp giảm tình trạng xung đột tín hiệu, làm cho mạng hoạt động hiệu quả hơn.

- **WAP (Wireless Access Point)**: Dùng để kết nối các thiết bị đầu cuối qua sóng Wi-Fi, giúp giảm chi phí thiết lập LAN hoặc kết nối với một LAN để mở rộng phạm vi làm việc.

- **Router**: Dùng để dẫn đường cho dữ liệu khi kết nối trên mạng rộng như Internet.

## Ví dụ minh họa
- Hình 3.7: Một vài loại modem.
- Hình 3.8: Kết nối các thiết bị qua cổng RJ45 với cáp UTP.

## Bài tập và câu hỏi
1. So sánh chức năng của hub, switch và thiết bị thu phát Wi-Fi.
2. Giải thích cách thức hoạt động của router và ý nghĩa của từ "định tuyến".
3. Cho biết chức năng của modem. Kể tên một số loại modem tương ứng với những phương thức truyền tín hiệu khác nhau.

## Hình ảnh mô tả
- **Hình 3.7**: Một vài loại modem.
- **Hình 3.8**: Kết nối các thiết bị qua cổng RJ45 với cáp UTP.

## Bảng biểu
- Không có bảng biểu trong nội dung này.

----

### Ghi chú
- Các thiết bị kết nối mạng như hub, switch, WAP và router có vai trò quan trọng trong việc thiết lập và duy trì mạng máy tính.
- Việc hiểu rõ chức năng và cách thức hoạt động của từng thiết bị sẽ giúp người dùng tối ưu hóa việc sử dụng mạng.



# Bài học: Kết nối mạng

## Nội dung lý thuyết
Cổng RJ45 và giắc cắm RJ45 là các thành phần quan trọng trong việc kết nối mạng. Cáp UTP được sử dụng để kết nối các thiết bị trong mạng LAN. Việc nối cáp chỉ là kết nối vật lý, trong khi đó, để máy tính trong LAN có thể giao tiếp với Internet, cần thiết lập các kết nối logic như địa chỉ IP và cách kết nối ra ngoài.

## Ví dụ minh họa
Hình 3.8. Giắc cắm và cổng RJ45

## Bài tập và câu hỏi
### Nhiệm vụ 1: Kết nối có dây
- Hãy quan sát cổng mạng của máy tính và của các thiết bị kết nối, nơi cắm các đầu cáp mạng.

### Nhiệm vụ 2: Kết nối không dây
- Yêu cầu: Kết nối được máy tính hay thiết bị di động vào mạng qua một thiết bị thu phát Wi-Fi.

Kết nối không dây vào LAN, còn gọi là kết nối Wi-Fi, được thực hiện qua một trạm thu phát Wi-Fi (WAP). Hầu hết các máy tính để bàn thường không có sẵn khả năng kết nối Wi-Fi như máy tính xách tay, máy tính bảng hay điện thoại thông minh. Trong trường hợp đó, cần lắp thêm một bảng mạch mở rộng để có thể kết nối Wi-Fi cho máy tính để bàn.

Mỗi trạm thu phát Wi-Fi sẽ nằm trong hoặc tạo ra một LAN.

## Hướng dẫn
Thủ tục kết nối Wi-Fi cho máy tính chạy trên hệ điều hành Windows, thiết bị di động chạy trên hệ điều hành Android hay iOS gần giống nhau; gồm các bước sau:

### Bước 1: Tìm trạm thu phát Wi-Fi để kết nối vào LAN
- Cần làm xuất hiện danh sách các trạm thu phát Wi-Fi ở gần rồi chọn trạm thích hợp.
- Đối với máy tính chạy Windows 10, chỉ cần nháy chuột vào biểu tượng sóng ở phía bên phải thanh công việc.
- Đối với Windows 11, sau khi nháy chuột vào biểu tượng sóng, bảng chọn các loại kết nối không dây như Wi-Fi và Bluetooth sẽ xuất hiện; cần nháy chuột tiếp vào dấu > cạnh biểu tượng sóng Wi-Fi.
- Đối với thiết bị di động dùng hệ điều hành Android, cần vuốt màn hình từ trên xuống rồi chọn biểu tượng cài đặt, sau đó chọn biểu tượng kết nối Wi-Fi.
- Đối với thiết bị di động dùng hệ điều hành iOS, khi vuốt màn hình từ trên xuống sẽ thấy ngay biểu tượng kết nối Wi-Fi.

Giao diện các trạm thu phát Wi-Fi đều có tên, trạng thái bảo mật hay không. Nếu được bảo mật, biểu tượng sóng sẽ có một dấu hiệu khóa. Nếu máy tính hay thiết bị di động đã kết nối với một trạm nào đó, sẽ thấy thêm thông tin đang kết nối.

## Hình ảnh mô tả
- Hình 3.8. Giắc cắm và cổng RJ45
- Hình 3.9. Giao diện các trạm thu phát Wi-Fi

## Bảng biểu
- Không có bảng biểu trong nội dung này.



# Bài học: Kết nối Wi-Fi

## Nội dung lý thuyết
Kết nối Wi-Fi là một phương thức kết nối không dây giữa các thiết bị di động và mạng LAN. Để kết nối, người dùng cần chọn một trạm thu phát Wi-Fi trong phạm vi và nhập mật khẩu nếu trạm đó được bảo mật. Sau khi nhập đúng mật khẩu, người dùng có thể kết nối bằng cách chọn "Connect" hoặc "Kết nối".

### Các bước kết nối:
1. Chọn trạm thu phát Wi-Fi.
2. Nhập mật khẩu nếu cần thiết.
3. Chọn "Connect" để hoàn tất kết nối.

Ngoài ra, người dùng có thể thiết lập chế độ kết nối tự động để thiết bị tự động kết nối với trạm Wi-Fi trong các lần sử dụng sau mà không cần nhập lại mật khẩu.

## Ví dụ minh họa
- **Hình 3.9**: Giao diện tìm các WAP ở gần trên Windows 11, Android và iOS.
- **Hình 3.10**: Giao diện thiết lập kết nối Wi-Fi trên Windows 11, Android và iOS.

## Bài tập và câu hỏi
1. Muốn kết nối các máy tính trong phạm vi gia đình thành một mạng, nên dùng loại thiết bị kết nối nào?
2. Máy tính xách tay thường có khả năng kết nối Wi-Fi nhưng không có SIM để kết nối với Internet. Làm thế nào để kết nối máy tính xách tay với Internet qua mạng điện thoại di động?

## Vấn dung
1. Với sự giúp đỡ của thầy cô giáo, hãy tìm hiểu xem mạng máy tính của trường em sử dụng các hub, switch, WAP và router như thế nào. Hãy vẽ lại sơ đồ mạng của trường.
2. Trên các xe khách đường dài ngày nay, hành khách có thể truy cập Internet qua Wi-Fi được hay không? Hãy tìm hiểu xem điều này được thực hiện như thế nào.

## Hình ảnh mô tả
- **Hình 3.9**: Giao diện tìm các WAP ở gần.
- **Hình 3.10**: Giao diện thiết lập kết nối Wi-Fi.

## Bảng biểu
- Không có bảng biểu trong nội dung này.
# Chủ đề: Mạng máy tính và Internet

## BÀI 3: MỘT SÔ THIẾT BỊ MẠNG THÔNG DỤNG

### SAU BÀI HỌC NÀY EM SẼ:
- Nêu được chức năng chính của một số thiết bị mạng thông dụng.
- Biết cách kết nối máy tính với thiết bị mạng.

Dữ liệu trên đường truyền mạng được mang bởi các tín hiệu vật lý như dao động điện trong mạng cục bộ (Local Area Network - LAN), sóng vô tuyến điện trong mạng không dây; tín hiệu ánh sáng trong cáp quang. Ngoài cáp mạng, còn có các thiết bị mạng khác là thiết bị kết nối như bộ chia tín hiệu (hub), bộ chuyển mạch (switch), bộ định tuyến (router), bộ thu phát không dây (Wi-Fi); Mỗi thiết bị đó đều có những chức năng riêng. Hãy cùng tìm hiểu chức năng và cách sử dụng chúng.

### 1. THIẾT BỊ MẠNG THÔNG DỤNG
#### a) Hub và Switch

Hình 3.1 gồm một switch; một hub và cáp mạng để kết nối các cổng của chúng và máy tính: Nhìn bên ngoài, rất khó phân biệt được switch và hub. Điểm khác nhau của chúng nằm ở cách thức hoạt động. Khi máy tính gửi dữ liệu qua một cổng của hub, tín hiệu sẽ được gửi đến tất cả các cổng còn lại. Trong khi đó, switch xác định cổng kết nối giữa thiết bị gửi và thiết bị nhận; sau đó thiết lập tạm thời kênh truyền giữa hai cổng kết nối để truyền dữ liệu và hủy kết nối sau khi hoàn thành việc truyền.

```
a) Hub    b) Switch                                     c) Cáp mạng
```
**Hình 3.1. Hub, switch và cáp mạng**

### Hoạt động của Hub hay Switch?
Em đã bao giờ tham dự một buổi gặp gỡ mà nhiều người nói cùng một lúc, gây ồn đến mức không thể nghe được ai nói gì chưa? Điều tương tự cũng có thể xảy ra trong LAN. Khi nhiều máy đồng thời gửi dữ liệu lên đường truyền chung, tín hiệu sẽ bị hỏng khiến các máy tính không thể nhận biết được dữ liệu. Hiện tượng này gọi là xung đột (collision) tín hiệu dẫn đến phải truyền lại làm giảm hiệu quả của mạng. Hãy thảo luận để trả lời các câu hỏi sau: hub hay switch; thiết bị nào dễ gây ra xung đột tín hiệu hơn? Khi nào nên dùng hub, khi nào nên dùng switch?



# Khi dùng switch

Khi dùng switch thì tín hiệu đi từ máy gửi đến máy nhận sẽ không gây xung đột với tín hiệu của các cuộc truyền ở cổng khác. Khi dùng hub, tín hiệu phát tán ra tất cả các cổng nên càng nhiều máy trong mạng, nguy cơ xung đột tín hiệu càng cao.

Vì thế với các mạng có ít thiết bị đầu cuối, chẳng hạn như mạng gia đình thì có thể dùng hub vì chi phí rẻ hơn rất nhiều so với một switch có cùng số cổng. LAN có từ vài chục đến hàng trăm máy tính thì nên dùng switch; thậm chí dùng nhiều switch kết nối thành nhiều tầng, kết hợp với hub ở tầng cuối cùng như Hình 3.2.

```
switch

Máy chủ
switch

switch       Máy in

hub

Máy tính    hub

Máy tính  Máy tính  Máy tính          Máy tính
```
**Hình 3.2.** Sơ đồ một LAN sử dụng nhiều tầng switch kết hợp với hub

## Hoạt động 2: Bổ sung truy cập không dây

Có thể em đã từng nghe nói đến điểm truy cập không dây (Wireless Access Point). Nghĩa của nó là gì?

### b) Wireless Access Point

Wi-Fi là chữ viết tắt của cụm từ Wireless Fidelity: Người ta thường hiểu "Wi-Fi" là thiết bị kết nối không dây trong mạng cục bộ. Thực ra Wi-Fi là một bộ tiêu chuẩn kĩ thuật truyền dữ liệu bằng sóng vô tuyến điện được sử dụng rộng rãi trong các mạng cục bộ.

Cách đơn giản nhất để thiết lập một LAN là dùng một bộ thu phát Wi-Fi (Hình 3.3) để kết nối tất cả các thiết bị đầu cuối trong một khu vực mà không phải mua sắm, lắp đặt hub, switch hay cáp mạng. Yêu cầu đối với các thiết bị đầu cuối trong trường hợp này là phải hỗ trợ truy cập Wi-Fi. Chính vì cách kết nối này mà bộ (thiết bị, trạm) thu phát Wi-Fi còn được gọi là "điểm truy cập không dây" (Wireless Access Point - WAP hay Access Point - AP).

Thông thường LAN kết nối có dây các máy tính qua các thiết bị như switch hay hub trong một phạm vi địa lí nhất định. Khi nối thêm một WAP vào LAN, ta có thể kết nối không dây các thiết bị di động giúp mở rộng phạm vi địa lí của LAN.



# Hoạt động 3: Kết nối máy tính thuộc các LAN khác nhau

Có thể sử dụng hub hay switch để kết nối hai máy tính thuộc hai LAN khác nhau qua Internet được không?

## c) Router

Khi kết nối hai máy tính (có thể cách xa hàng nghìn kilômét) qua Internet; người ta không thể dùng cáp mạng nối qua hub hay switch mà cần sử dụng dịch vụ truyền dữ liệu của các nhà cung cấp dịch vụ viễn thông để kết nối các LAN với nhau. Mạng viễn thông sử dụng các bộ định tuyến (router) để chuyển tiếp dữ liệu:

- Mỗi router có một số cổng có thể kết nối trực tiếp vào LAN gọi là cổng LAN và một số cổng để kết nối với các router khác gọi là cổng WAN.
- Dữ liệu chuyển từ một máy tính ở LAN này đến một máy tính ở LAN khác trên Internet trước hết phải chuyển đến router của LAN qua cổng LAN; sau đó chuyển ra ngoài qua cổng WAN.
- Khi router có nhiều cổng WAN thì cần chọn cổng thích hợp để chuyển dữ liệu đi tới đích.

Thuật ngữ định tuyến hay chọn đường (routing) hàm ý router phải chọn một cổng thích hợp để gửi dữ liệu đi sao cho tới được LAN của máy nhận. Dữ liệu có thể phải trung chuyển qua nhiều router (Hình 3.4). Khi đến router cuối cùng; dữ liệu được chuyển qua cổng LAN để tới máy nhận:

```
LAN

Switch
Router                       LAN
LAN

LAN                    Router      Switch

LAN    ~UG               LAN
```

**Hình 3.4.** Dữ liệu từ máy gửi đến máy nhận có thể trung chuyển qua nhiều router.

Thông thường router của các nhà cung cấp dịch vụ Internet hay của các tổ chức lớn mới có nhiều cổng WAN, còn router của các mạng gia đình chỉ có một cổng WAN kết nối đến nhà cung cấp dịch vụ Internet mà không cần phải định tuyến: Các router này thường được tích hợp cả bộ thu phát Wi-Fi. Chính vì thế chúng được gọi là router Wi-Fi.

**Hình 3.5.** Một router Wi-Fi có 1 cổng WAN và 4 cổng LAN.



# Hoạt động 4: Máy tính có thể sử dụng trực tiếp mọi loại tín hiệu được không?

Tín hiệu truyền trên mạng điện thoại là sóng điện áp thể hiện dao động âm thanh. Trước khi cáp quang được sử dụng rộng rãi, người ta dùng chính đường dây điện thoại để truyền dữ liệu Internet. Máy tính có thể sử dụng trực tiếp tín hiệu điện thoại hay không?

## d) Modem

Trong trường hợp truy cập Internet, tín hiệu trong LAN là tín hiệu số (digital) thể hiện các giá trị logic 0 hay 1 dùng cho máy tính. Trong khi đó, để truyền dữ liệu bên ngoài LAN, người ta có thể dùng tín hiệu tương tự (analog) như tín hiệu quang, sóng điện từ trong môi trường có dây hoặc không dây như sóng mang của điện thoại công cộng hoặc sóng mang của hệ thống thông tin di động 3G, 4G, 5G. Vì router chỉ hướng luồng dữ liệu tới đích nhưng không chuyển đổi tín hiệu, nên cần có thiết bị chuyển đổi tín hiệu hai chiều đặt giữa router và nhà cung cấp dịch vụ Internet, gọi là modem, để chuyển tín hiệu số thành tín hiệu tương tự và ngược lại.

### Sơ đồ kết nối giữa modem và router được minh hoạ trong Hình 3.6.

```
Kết nối ra Internet
Cổng LAN

Kết nối vào LAN
Modem      Cổng WAN
```

**Hình 3.6. Dùng modem kết nối Internet**

Modem là thiết bị có chức năng chuyển đổi tín hiệu số thành tín hiệu tương tự và ngược lại. Modem chỉ thay đổi tín hiệu mà không làm thay đổi dữ liệu được mang bởi tín hiệu. Ví dụ một số loại modem:

- **Modem quay số** cho phép nối hai máy tính qua hệ thống chuyển mạch của mạng điện thoại công cộng: Dữ liệu được mã hoá qua tín hiệu thoại, được chuyển qua đường dây chung với điện thoại.
- **Modem ADSL** cũng dùng cáp điện thoại nhưng sử dụng riêng cho thuê bao số, không dùng chung tần số với đường thoại: Modem ADSL rất phổ biến để kết nối Internet tốc độ cao trước khi cáp quang được dùng rộng rãi.
- **Modem quang** chuyển đổi tín hiệu số sang tín hiệu quang và ngược lại.
- **Modem GSM 3G, 4G, 5G**, có khe SIM để truy cập Internet qua hệ thống điện thoại di động và phát lại qua sóng Wi-Fi hoặc nối vào mạng có dây.

Thời kỳ đầu, modem thường tách rời khỏi router; nhưng sau này, chức năng modem được tích hợp ngay vào router nên chúng ta ít thấy hình ảnh các modem độc lập.



# 1. Các loại modem

a) Modem ADSL; cổng bên trái dùng cho cáp ADSL với đầu cáp kiểu cáp điện thoại
b) Modem GSM có khe cắm SIM
c) Modem quang; cổng bên phải là cổng LAN; hai cổng bên trái là cổng quang; một đường vào, một đường ra

**Hình 3.7. Một vài loại modem**

----

Hub; switch; WAP và router là các thiết bị kết nối mạng.

- Hub và switch chỉ dùng để kết nối các máy tính trong cùng LAN trực tiếp qua cáp mạng.
- Hub phát tán tín hiệu đi tất cả các cổng còn switch chỉ kết nối từng cặp cổng có thiết bị gửi - nhận nên giảm thiểu được tình trạng xung đột tín hiệu giúp mạng hoạt động hiệu quả hơn.
- WAP dùng để kết nối các thiết bị đầu cuối qua sóng Wi-Fi giúp giảm chi phí thiết lập LAN hoặc kết nối với một LAN để mở rộng phạm vi làm việc.
- Router dùng để dẫn đường cho dữ liệu khi kết nối trên mạng rộng như Internet.
- Modem có chức năng chuyển đổi tín hiệu từ tín hiệu số sang tín hiệu tương tự và ngược lại, thường dùng khi kết nối LAN với Internet.

## 1. So sánh chức năng của hub, switch và thiết bị thu phát Wi-Fi.
## 2. Giải thích cách thức hoạt động của router và ý nghĩa của từ "định tuyến".
## 3. Cho biết chức năng của modem. Kể tên một số loại modem tương ứng với những phương thức truyền tín hiệu khác nhau.

----

**Em có biết?**
Nguồn gốc tên gọi modem: Việc chuyển đổi tín hiệu dạng số sang dạng tương tự hoặc dạng tín hiệu nào đó phù hợp để truyền qua đường truyền mạng gọi là điều chế xung (tiếng Anh là Modulation). Việc chuyển đổi ngược lại tín hiệu từ dạng tương tự hoặc các dạng tín hiệu khác nhau thành dạng số ban đầu gọi là giải điều chế xung (tiếng Anh là Demodulation). Thiết bị thực hiện cả hai công việc trên gọi là modem (viết tắt từ modulation và demodulation).

----

# 2. THỰC HÀNH KẾT NỐI MÁY TÍNH VỚI CÁC THIẾT BỊ MẠNG

Máy tính (kể cả các thiết bị di động) có thể kết nối vào mạng bằng cáp tín hiệu hoặc qua sóng Wi-Fi.

## Nhiệm vụ 1. Kết nối cáp tín hiệu

**Yêu cầu:** Nhận biết được các cổng RJ45 và kết nối được các thiết bị qua cổng RJ45 với cáp UTP.
**Hướng dẫn:** Các LAN thường dùng cáp mạng UTP có bốn đôi dây xoắn với giắc cắm RJ45 để kết nối. Chỉ cần cắm một đầu vào cổng RJ45 của máy tính; một đầu vào cổng RJ45 của switch; hub hay cổng giắc vào LAN của router.

**Hình 3.8**



# Cổng RJ45

## Giắc cắm RJ45

## Cáp UTP

![Hình 3.8. Giắc cắm và cổng RJ45](image_link)

Trên thực tế, việc nối cáp chỉ là kết nối vật lí. Trong các mạng cụ thể còn phải thiết lập các kết nối logic. Ví dụ: để máy tính trong LAN có thể giao tiếp với Internet thì còn phải thiết lập địa chỉ, khai báo cách kết nối ra ngoài.

Hãy quan sát cổng mạng của máy tính và của các thiết bị kết nối, nơi cắm các đầu cáp mạng.

## Nhiệm vụ 2. Kết nối không dây

### Yêu cầu:
Kết nối được máy tính hay thiết bị di động vào mạng qua một thiết bị thu phát Wi-Fi.

Kết nối không dây vào LAN, còn gọi là kết nối Wi-Fi, được thực hiện qua một trạm thu phát Wi-Fi (với vai trò là một điểm truy cập không dây - WAP). Hầu hết các máy tính để bàn thường không có sẵn khả năng kết nối Wi-Fi như máy tính xách tay, máy tính bảng hay điện thoại thông minh. Trong trường hợp đó, để có thể kết nối Wi-Fi cho máy tính để bàn, cần lắp thêm một bảng mạch mở rộng.

Mỗi trạm thu phát Wi-Fi sẽ nằm trong hoặc tạo ra một LAN.

### Hướng dẫn:
Thủ tục kết nối Wi-Fi cho máy tính chạy trên hệ điều hành Windows, thiết bị di động chạy trên hệ điều hành Android hay iOS gần giống nhau; gồm các bước sau:

1. **Bước 1:** Tìm trạm thu phát Wi-Fi để kết nối vào LAN.
- Cần làm xuất hiện danh sách các trạm thu phát Wi-Fi ở gần rồi chọn trạm thích hợp.
- Đối với máy tính chạy Windows 10, chỉ cần nháy chuột vào biểu tượng sóng ở phía bên phải thanh công việc.
- Đối với Windows 11, sau khi nháy chuột vào biểu tượng sóng mới chỉ làm xuất hiện bảng chọn các loại kết nối không dây như Wi-Fi và Bluetooth; cần nháy chuột tiếp vào dấu > cạnh biểu tượng sóng Wi-Fi.
- Đối với thiết bị di động dùng hệ điều hành Android, cần vuốt màn hình từ trên xuống rồi chọn biểu tượng cài đặt, sau đó chọn biểu tượng kết nối Wi-Fi.
- Đối với thiết bị di động dùng hệ điều hành iOS thì khi vuốt màn hình từ trên xuống (một vài dòng sản phẩm phải vuốt từ dưới lên) sẽ thấy ngay biểu tượng.

Hãy chọn biểu tượng. Giao diện các trạm thu phát Wi-Fi đều có tên, trạng thái có được bảo mật hay không (Hình 3.9). Nếu được bảo mật, biểu tượng sóng sẽ có một dấu hiệu khóa. Nếu máy tính hay thiết bị di động đã kết nối với một trạm nào đó thì sẽ thấy thêm thông tin đang kết nối.



# Cái dãt Wi-Fi

## Giao diện trên các hệ điều hành

### a) Giao diện trên Windows 11
### b) Giao diện trên Android
### c) Giao diện trên iOS

**Hình 3.9. Giao diện tìm các WAP ở gần**

## Bước 2: Kết nối

Muốn kết nối thiết bị di động vào LAN nào thì chọn một trạm thu Wi-Fi thuộc LAN đó. Trong trường hợp trạm được bảo mật (có biểu tượng một cái khoá), phần mềm mạng sẽ yêu cầu nhập mật khẩu: Chỉ khi gõ đúng mật khẩu, mới có thể kết nối được. Sau đó chọn **Connect** hay **Kết nối** (Hình 3.10).

```
Wi-Fi                           158007122
1908718_5G                      IP1808                                     Kuy        Nhap mat khau
Connecied
P1907701                                                                   Mât khau
Secured                                                                    Ban cung co the truy cap mang Wi-Fi
Connect automatically                           Kéí nol                    nay bang Cach dua Phone cua ban Ini
gan bai    APhone [Padhosc mav Mac
Conneci                                                   nao da     nui Vao Mang nay Va Co ten
Cu7 Dan torgdanh ba
```

### a) Giao diện trên Windows 11
### b) Giao diện trên Android
### c) Giao diện trên iOS

**Hình 3.10. Giao diện thiết lập kết nối Wi-Fi**

Ngoài ra, ta có thể thiết lập chế độ kết nối tự động để máy tính hay các thiết bị di động tự động kết nối ngay với trạm thu phát Wi-Fi từ lần sử dụng sau mà không cần phải chọn lại hoặc nhập mật khẩu bằng cách đánh dấu vào ô **Connect automatically** như trong giao diện của Windows hay kéo con trượt **Tự động kết nối lại** sang phải như trong giao diện của Android và iOS.

Kết nối không dây tiện hơn kết nối có dây rất nhiều: Tại sao các máy tính ở phòng thực hành lại dùng cáp mạng?

## LUYÊN TÂP

1. Muốn kết nối các máy tính trong phạm vi gia đình thành một mạng; nên dùng loại thiết bị kết nối nào?
2. Máy tính xách tay thường có khả năng kết nối Wi-Fi nhưng không có SIM để kết nối với Internet. Làm thế nào để kết nối máy tính xách tay với Internet qua mạng điện thoại di động?

## VÂN DUNG

1. Với sự giúp đỡ của thầy cô giáo, hãy tìm hiểu xem mạng máy tính của trường em sử dụng các hub, switch, WAP và router như thế nào. Hãy vẽ lại sơ đồ mạng của trường.
2. Trên các xe khách đường dài ngày nay; hành khách có thể truy cập Internet qua Wi-Fi được hay không? Hãy tìm hiểu xem điều này được thực hiện như thế nào.
# BÀI 22: TÌM HIỂU THIẾT BỊ MẠNG VÀ INTERNET

## SAU BÀI HỌC NÀY EM SẼ:
- Nhận biết được các thiết bị mạng.
- Phân biệt được chức năng, vai trò của server trong mạng, chức năng của các thiết bị mạng phục vụ cho thiết kế mạng.

Các em đã biết một số loại thiết bị mạng như hub, switch, router, access point, modem, cáp mạng và chức năng của chúng. Tuy nhiên, để thiết kế mạng thì ta cần quan tâm đến những yếu tố khác nữa. Mặt khác, các em đã từng nghe nói tới server trong mạng máy tính như web server, database server, mail server, file server; mối quan hệ giữa server và mạng như thế nào?

### 1. SERVER
**Hoạt động 1: Server là gì?**
Chọn phương án đúng:
- A. Là một máy tính mạnh.
- B. Là một phần mềm cung cấp một dịch vụ nào đó.
- C. Là một hệ thống gồm phần cứng và phần mềm cung cấp một dịch vụ nào đó trên mạng máy tính.
- D. Là mạng máy tính để cung cấp dịch vụ.

Thuật ngữ server có nguồn gốc từ "serve" nghĩa là phục vụ: Server có nghĩa là chủ thể cung cấp dịch vụ. Chính vì thế, máy tính làm server thường được gọi là "máy chủ". Máy tính yêu cầu và được cung cấp dịch vụ từ máy chủ được gọi là "máy khách" (client).

**Ví dụ:**
- File server là máy chủ cung cấp dịch vụ lưu trữ tệp.
- Database server là máy chủ quản trị cơ sở dữ liệu, cho phép các máy khách yêu cầu truy vấn dữ liệu trên đó.
- Web server là hệ thống máy tính chạy phần mềm dịch vụ web, cung cấp các nội dung của website theo yêu cầu từ máy khách; máy khách nhận và hiển thị trang web đó.

Như vậy, server là một hệ thống phần mềm và phần cứng cung cấp các dịch vụ cho nhiều người dùng từ các máy tính khác là máy khách. Các máy khách và máy chủ phải được kết nối với nhau qua mạng. Trong một mạng có thể không có máy chủ nhưng máy chủ thường nằm trong một mạng. Mặt khác, do cần đáp ứng yêu cầu từ nhiều máy khách, các server thường là các máy tính có cấu hình cao, tin cậy, an toàn bảo mật, hiệu suất cao và có khả năng mở rộng.

### Hình ảnh mô tả:
- **Hình 22.1:** Server trong mạng máy tính

### Bài tập và câu hỏi:
1. Giải thích vai trò của server trong một mạng máy tính.
2. Nêu các loại server phổ biến và chức năng của chúng.
3. Tại sao máy chủ thường có cấu hình cao hơn máy khách?



# Bài học: Nhận diện và tìm hiểu tính năng kỹ thuật của các thiết bị kết nối

## Nội dung lý thuyết
Server là hệ thống phần cứng và phần mềm cung cấp các dịch vụ qua mạng theo yêu cầu của máy tính khác (máy khách). Có những máy chủ cung cấp các dịch vụ mạng như máy chủ xác thực (authentication server) có chức năng thẩm định quyền hạn của người dùng khi đăng nhập vào một mạng; Máy chủ tên miền (Domain Name Server - DNS) cho phép xác định địa chỉ IP từ tên miền, giúp người dùng không phải nhớ địa chỉ dạng các chữ số. Nếu server cung cấp các dịch vụ quản trị mạng thì có thể được coi như một thành phần của mạng.

### Câu hỏi thảo luận
1. Thế nào là server?
2. Tại sao server cần làm việc trong môi trường mạng? Có nhất thiết phải có server trong mạng máy tính hay không?

## Ví dụ minh họa
Giả sử ta phải thiết kế một mạng máy tính cho một gia đình và một mạng máy tính cho một trường đại học với hàng chục nghìn người sử dụng. Liệu có nên dùng thiết bị mạng giống nhau cho cả hai trường hợp này không? Nếu không thì những yếu tố nào cần được tính đến?

Có thể thấy, mạng máy tính trong mỗi gia đình hầu như không dùng switch hay hub mà chỉ cần một router Wi-Fi cung cấp kết nối không dây cho các thiết bị trong nhà. Router của mạng gia đình cũng chỉ cần một cổng kết nối Internet; không cần router đắt tiền; không cần nhiều cổng WAN (để nối ra ngoài). Nhưng với mạng của một trường đại học có hàng chục nghìn người dùng, cần phải có các router có công suất lớn, nhiều cổng WAN để có thể tăng băng thông kết nối và có thể bố trí thêm cổng dự phòng (backup). Nếu có sự cố từ nhà cung cấp dịch vụ Internet chính, kết nối sẽ chuyển sang nhà cung cấp dịch vụ dự phòng. Ngoài ra, phạm vi địa lý của một trường đại học cũng lớn hơn nhiều so với một gia đình, nên mạng máy tính cho trường đại học cần có các thiết bị và cáp thích hợp để truyền xa hơn.

## Bài tập và câu hỏi
- Khi thiết kế một mạng máy tính, ngoài chức năng của thiết bị, ta cần biết cả các tính năng, thường thể hiện qua các thông số kỹ thuật của chúng nữa.
- Hãy so sánh sự khác biệt giữa hub và switch trong mạng máy tính.

### a) Hub và switch
Về hình thức, khó phân biệt giữa switch và hub nếu không đọc các thông tin đi kèm thiết bị hoặc từ hồ sơ kỹ thuật. Các em đã biết trong Bài 3, xung đột tín hiệu làm giảm hiệu quả truyền dữ liệu rất nhiều.

## Hình ảnh mô tả
- Hình ảnh minh họa cho sự khác biệt giữa hub và switch (ghi chú về hình ảnh: Hình ảnh cho thấy cấu trúc và chức năng của hub và switch trong mạng máy tính).

## Bảng biểu
| Thiết bị  | Chức năng                          | Đặc điểm kỹ thuật                |
|-----------|------------------------------------|----------------------------------|
| Hub       | Kết nối nhiều thiết bị trong mạng  | Không thông minh, không quản lý |
| Switch    | Kết nối và quản lý lưu lượng dữ liệu | Thông minh, có khả năng quản lý  |




# Bài học: Miền xung đột và thiết bị mạng

## Nội dung lý thuyết
Miền xung đột (collision domain) là một phần của mạng gồm một nhóm máy tính được kết nối với nhau mà khi nhiều máy tính gửi tín hiệu đồng thời lên mạng sẽ gây ra xung đột tín hiệu. Việc giảm quy mô của các miền xung đột đến một mức hợp lý là một việc cần làm trong thiết kế mạng.

Hub chỉ là một bộ chia tín hiệu, cho tín hiệu lan tỏa từ một cổng ra tất cả các cổng khác. Các máy tính nối vào cùng một hub sẽ thuộc về cùng một miền xung đột. Trong khi đó, switch chỉ thiết lập kết nối tạm thời cổng của hai máy tính trong thời gian truyền nên các máy tính nối vào các cổng khác nhau của switch sẽ thuộc về các miền xung đột khác nhau. Như vậy, thay hub bằng switch sẽ giúp chia nhỏ các miền xung đột. Chính vì thế, đối với những mạng nhiều máy tính, dùng switch là thích hợp dù chi phí có cao hơn hub.

Hub hay switch đều có một số tính năng quan trọng thường được ghi ở trên thiết bị.

### Thông số kỹ thuật của Hub và Switch
- **Số cổng**: Nhiều cổng thì có thể kết nối được với nhiều thiết bị.
- **Tốc độ truyền dữ liệu qua các cổng**: 100 Megabits, Gigabit/s hay 10 Gigabit/s. Cổng Gigabit được hiểu là cổng có thể truyền với tốc độ từ một Gigabit trở lên.

## Ví dụ minh họa
- **Hình 22.2**: Thông số kỹ thuật của switch.

### Router
Có thể nhận diện router qua đặc trưng có cổng WAN để kết nối ra ngoài mạng cục bộ. Các router dùng trong gia đình thường chỉ có một cổng WAN (có màu khác với cổng LAN, còn gọi là cổng Ethernet) và được ghi rõ "WAN" hoặc "Internet". Các router của các mạng lớn có thể có nhiều cổng WAN.

Chức năng cơ bản nhất của router là chọn đường, phục vụ kết nối các mạng LAN với nhau. Một số thông số kỹ thuật của router gồm:
- **Số cổng kết nối**: Khác với hub/switch, router cần phân biệt cổng WAN và cổng LAN.
- **Số cổng WAN**: Là một thông số có ý nghĩa đối với router. Khi có nhiều cổng WAN, router mới có thể định nghĩa thực sự và khả năng thiết lập kết nối dự phòng.
- **Tốc độ truyền dữ liệu qua các cổng**.
- **Số lượng truy cập đồng thời**.
- Một số tính năng khác thường được đảm bảo bởi phần mềm tích hợp trên router.

## Hình ảnh mô tả
- **Hình 22.3**: Một router có nhiều cổng WAN.
- **Hình 22.4**: Một router Wi-Fi 3 anten tốc độ Gigabit có 4 cổng LAN và cổng WAN.

## Bảng biểu
| Thiết bị  | Số cổng | Tốc độ truyền dữ liệu |
|-----------|---------|-----------------------|
| Hub       | Nhiều   | 100 Megabits, Gigabit/s, 10 Gigabit/s |
| Switch    | Nhiều   | 100 Megabits, Gigabit/s, 10 Gigabit/s |
| Router    | Nhiều   | Tùy thuộc vào loại router |

## Bài tập và câu hỏi
1. Giải thích khái niệm miền xung đột và tại sao cần phải giảm quy mô của nó trong thiết kế mạng?
2. So sánh sự khác biệt giữa hub và switch trong việc quản lý miền xung đột.
3. Nêu các thông số kỹ thuật quan trọng của router và giải thích ý nghĩa của chúng.



# Bài học: Thiết bị mạng

## Nội dung lý thuyết

### 1. Router
Các router nhiều cổng, công suất lớn thường được dùng cho các tổ chức nhiều người dùng, cần truy cập Internet với khối lượng dữ liệu lớn; ổn định; an toàn cao như các trường đại học lớn, các tổ chức cung cấp dịch vụ trực tuyến cho nhiều người hay các công ty cung cấp dịch vụ mạng.

**Hình 22.3** là một router có nhiều cổng WAN tốc độ Gigabit. Ngoài ra còn có hai cổng 10 Gigabit và hai cổng 2,5 Gigabit có thể cấu hình thành cổng WAN hay LAN tùy theo nhu cầu. Đối với các mạng nhỏ như mạng gia đình; mạng văn phòng, chỉ cần một router có một cổng WAN kết nối Internet. Không những thế, router có thể tích hợp với thiết bị thu phát Wi-Fi.

**Hình 22.4** minh hoạ một router Wi-Fi có 3 anten; cổng LAN và 1 cổng WAN.

### 2. Repeater
Khi sử dụng cáp xoắn; khoảng cách sử dụng có hiệu quả chỉ khoảng 100 m. Nếu truyền xa hơn tín hiệu có thể bị yếu đi, bị biến dạng hay bị nhiễu đến mức không dùng được nữa. Giải pháp khắc phục là dùng một thiết bị gọi là "bộ lặp" (repeater) để sửa lại tín hiệu: Repeater nhận tín hiệu ở một đầu; chỉnh sửa rồi phát lại tín hiệu tốt về đầu bên kia.

Như vậy; có thể dùng repeater để mở rộng phạm vi địa lý của mạng cục bộ. Chẳng hạn ở cuối chặng 100 m của cáp xoắn; khi tín hiệu có thể xấu đi nếu truyền xa hơn; ta đặt một repeater rồi thêm một đoạn cáp xoắn 100 m nữa là có thể mở rộng được đường kính mạng thêm 100 m. Tuy nhiên không thể dùng liên tiếp quá nhiều repeater để mở rộng phạm vi của mạng vì một số lý do kỹ thuật liên quan đến giao thức truyền dữ liệu trong mạng cục bộ.

Repeater có thể có đầu vào và đầu ra là cáp xoắn. Ngày nay repeater Wi-Fi được sử dụng rộng rãi, tiếp nhận tín hiệu qua Wi-Fi và phát lại qua Wi-Fi hoặc cáp mạng.

**Hình 22.5** là một repeater Wi-Fi có một cổng mạng; vừa có thể phát lại qua Wi-Fi vừa có thể phát theo cáp mạng cắm vào cổng RJ45.

### 3. Bộ thu phát Wi-Fi
Bộ thu phát Wi-Fi (còn gọi là điểm truy cập không dây) cho phép các thiết bị kết nối không dây vào mạng. Bộ thu phát Wi-Fi có thể được tích hợp với router hoặc độc lập.

Sau đây là một số thông số kỹ thuật quan trọng của bộ thu phát Wi-Fi:
- Băng tần hỗ trợ (tần số làm việc) thường tính theo GigaHz.
- Băng thông tốc độ truyền tính theo Megabits hoặc Gigabit/s, phụ thuộc vào giao thức hỗ trợ.
- Khoảng cách hiệu quả (độ phủ) phụ thuộc vào công suất phát.
- Số lượng người dùng có thể truy cập đồng thời.
- Môi trường làm việc là trong nhà (indoor) hay ngoài trời (outdoor).

## Ví dụ minh hoạ
- **Hình 22.3**: Router nhiều cổng WAN tốc độ Gigabit.
- **Hình 22.4**: Router Wi-Fi có 3 anten.
- **Hình 22.5**: Repeater Wi-Fi có một cổng mạng.

## Bài tập và câu hỏi
1. Giải thích vai trò của router trong một mạng máy tính.
2. Tại sao cần sử dụng repeater trong mạng cục bộ?
3. Liệt kê các thông số kỹ thuật quan trọng của bộ thu phát Wi-Fi.

## Hình ảnh mô tả
- **Hình 22.3**: Router nhiều cổng WAN tốc độ Gigabit.
- **Hình 22.4**: Router Wi-Fi có 3 anten.
- **Hình 22.5**: Repeater Wi-Fi có một cổng mạng.

## Bảng biểu
| Thiết bị mạng      | Chức năng                          | Đặc điểm kỹ thuật                      |
|--------------------|-----------------------------------|---------------------------------------|
| Router             | Kết nối mạng và quản lý lưu lượng | Nhiều cổng WAN, tốc độ cao           |
| Repeater           | Mở rộng phạm vi mạng              | Nhận và phát lại tín hiệu             |
| Bộ thu phát Wi-Fi  | Kết nối không dây                 | Băng tần, băng thông, khoảng cách    |




# Bài học: Thiết bị kết nối mạng

## Nội dung lý thuyết
Bộ thu phát Wi-Fi như trong Hình 22.6 hỗ trợ băng tần kép; có thể cung cấp một băng thông 300 Mbps trên băng tần 2,4 GHz và một băng thông 867 Mbps trên băng tần 5 GHz; phục vụ được 25 người truy cập đồng thời trong phạm vi vài chục mét. Bộ thu phát này thích hợp với quy mô gia đình hay một văn phòng của một cơ quan. Khi dùng cho một hội trường có hàng trăm người sử dụng thì bộ thu phát nói trên không đủ đáp ứng: Cần các bộ thu phát Wi-Fi có công suất cao hơn; chẳng hạn bộ thu phát Wi-Fi như Hình 22.7 hoạt động trên tần số 5 GHz hỗ trợ giao thức 802.11ac cho băng thông 5,2 Gigabit/s, có thể phục vụ cho 400 người truy cập đồng thời.

## Hình ảnh mô tả
- **Hình 22.6**: Một bộ thu phát Wi-Fi băng tần kép; 4 anten; hỗ trợ tối đa 25 người.
- **Hình 22.7**: Một bộ thu phát Wi-Fi băng tần kép; anten ngầm; hỗ trợ tối đa 400 người.

Có nhiều loại thiết bị kết nối như hub, switch, router, access point. Mỗi thiết bị đều có những thông số kĩ thuật đặc trưng: Cần nắm được các thông số đó để sử dụng hợp khi thiết kế mạng.

## Bảng biểu
| Thiết bị        | Tính năng chính                                      |
|------------------|-----------------------------------------------------|
| Hub              | Kết nối nhiều thiết bị trong mạng LAN              |
| Switch           | Chuyển tiếp dữ liệu thông minh giữa các thiết bị   |
| Router           | Kết nối các mạng khác nhau và định tuyến dữ liệu   |
| Access Point     | Cung cấp kết nối không dây cho các thiết bị        |

## Bài tập và câu hỏi
1. Cho biết các tính năng chủ yếu của hub và switch:
2. Cho biết một số tính năng của router.
3. Nêu vai trò của repeater.

### LUYỆN TẬP
1. Nêu những đặc điểm giúp phân biệt hub, switch và router.
2. Có thể dùng router thay cho switch được không? Có thể dùng switch thay cho hub hay router được không? Vì sao?

### VÂN DUNG
1. Em hãy tìm hiểu các thiết bị kết nối mạng được dùng ở trường em và tính năng của các thiết bị đó.
2. Có một thiết bị kết nối mạng gọi là bridge (cầu). Hãy tìm hiểu qua Internet để biết các chức năng của bridge.
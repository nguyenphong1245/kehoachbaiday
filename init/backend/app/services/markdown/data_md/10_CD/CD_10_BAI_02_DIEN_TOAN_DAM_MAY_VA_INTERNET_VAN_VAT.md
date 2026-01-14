# BÀI 2: ĐIỆN TOÁN ĐÁM MÂY VÀ INTERNET VẠN VẬT

## Học xong bài này, em sẽ:
- So sánh được mạng LAN và Internet.
- Nêu được một số dịch vụ cụ thể mà Điện toán đám mây cung cấp cho người dùng.
- Nêu được khái niệm Internet vạn vật (Internet of Things - IoT).
- Nêu được ví dụ cụ thể về thay đổi trong cuộc sống mà IoT đem lại.
- Phát biểu được kiến cá nhân về ích lợi của IoT.

----

Một công ty có các máy tính nối mạng Internet; mọi dịch vụ thông tin như: gửi email, duyệt web, đều thông qua Internet. Khi đường cáp quang ở biển xảy ra sự cố khiến mạng Internet không thể truy cập được nữa thì công ty cũng không thể sử dụng được bất kỳ dịch vụ mạng nào; dù chỉ là gửi file cho nhau qua mạng. Theo em, trong công ty đó có mạng LAN (mạng nội bộ) hay không?

## So sánh mạng LAN và Internet

Em đã biết mạng LAN (Local Area Network - mạng cục bộ) là mạng của một cơ quan hay gia đình chỉ kết nối những máy tính trong phạm vi nội bộ. Trong khi đó, Internet là mạng toàn cầu. Có thể kể ra một số điểm khác nhau cơ bản giữa Internet và mạng LAN như sau:

| Tiêu chí               | Mạng LAN                                      | Internet                                      |
|-----------------------|----------------------------------------------|----------------------------------------------|
| **Quy mô địa lý**     | Kết nối những máy tính trong một phạm vi nhỏ như tòa nhà, cơ quan, trường học, nhà riêng. | Gồm các mạng máy tính trên toàn thế giới được liên kết với nhau. |
| **Phương thức kết nối** | Do mạng LAN có số lượng máy tính ít, ở gần nhau; khối lượng dữ liệu truyền không lớn nên có đường truyền riêng. | Kết nối Internet do số lượng máy tính kết nối rất lớn, ở cách xa nhau nên phải thuê bao dịch vụ đường truyền băng thông rộng để đảm bảo tốc độ truyền cao và có các quy tắc về khuôn dạng dữ liệu, cơ chế kiểm soát và bảo mật nghiêm ngặt hơn. |
| **Sự sở hữu**        | Mạng LAN là mạng trong phạm vi nội bộ của một tổ chức và thuộc sở hữu của tổ chức này. | Internet là mạng toàn cầu không thuộc quyền sở hữu của bất kỳ cá nhân hay tổ chức nào. |

----

Đa số sách tài học 10.vn



# Về tính ổn định

Mạng LAN được kết nối với Internet để liên lạc với thế giới bên ngoài. Tuy nhiên, mạng LAN không lệ thuộc vào Internet mà có sự độc lập nhất định; hạn nếu tuyến kết nối Internet bị đứt, mạng LAN vẫn có thể tiếp tục hoạt động. Trên Internet có sự truyền thông giữa các mạng nên độ ổn định thấp hơn vì phụ thuộc vào tính ổn định trong kết nối các mạng thành viên.

## Điện toán đám mây

Trước đây, mỗi cơ quan tự xây dựng hệ thống cung cấp các dịch vụ lưu trữ, xử lý dữ liệu, email. Để làm điều đó, mạng LAN cần được trang bị:

- **Máy chủ (server)**: là loại máy tính đặc biệt có khả năng lưu trữ và tính toán rất mạnh, cung cấp dịch vụ lưu trữ và xử lý cho nhiều máy tính khác.

Mỗi phần mềm mạng được cài đặt lên máy chủ sẽ cung cấp một loại dịch vụ mạng nào đó cho người dùng. Ví dụ, phần mềm mail server tạo ra và quản lý một hệ thống thư điện tử nội bộ, phần mềm quản lý dữ liệu tác nghiệp cho phép truy xuất và xử lý các dữ liệu công việc.

### Nhược điểm của cách làm tự cung tự cấp

Cách làm tự cung tự cấp như trên có nhiều nhược điểm:

1. Mỗi cơ quan tự xây dựng hệ thống cung cấp dịch vụ theo cách riêng, hậu quả là có thể không giao dịch được giữa hai cơ quan do hệ thống dịch vụ của họ không tương thích.
2. Tốn kém về chi phí thiết lập và bảo trì hệ thống mạng.
3. Ban đầu, cơ quan phải tốn thời gian để xây dựng hệ thống mạng LAN. Mỗi khi cần thay đổi dịch vụ thì lại tốn thời gian để sửa chữa.
4. Lãng phí công suất của máy móc và đường truyền vì cơ quan không sử dụng hết, chẳng hạn ban đêm cơ quan không hoạt động thì hệ thống máy tính cũng không được khai thác.

### Câu hỏi

1. Em hãy tìm kiếm và cho biết: tên nhà cung cấp dịch vụ; dung lượng miễn phí, cách tính chi phí của một trong các dịch vụ lưu trữ của Điện toán đám mây thông dụng hiện nay (như: Dropbox; Google Drive; OneDrive; Box).

Điện toán đám mây (Cloud Computing), mô hình cung cấp dịch vụ thông qua Internet, là giải pháp giảm thiểu nhược điểm nêu trên của mạng LAN. Các công ty Điện toán đám mây có sẵn tài nguyên (máy chủ, đường truyền và các phần mềm mạng) nâng sẵn phục vụ ngay nếu khách hàng cần mua hoặc cấp một dịch vụ, nhanh và tốt hơn nếu so với việc tự xây dựng hệ thống cung cấp dịch vụ cho nhiều người.



# Dịch vụ Điện toán đám mây

Dịch vụ được công ty Điện toán đám mây cung cấp ngay khi có yêu cầu; với chi phí rẻ hơn, chất lượng dịch vụ cao hơn và có tính tương thích rộng hơn. Điện toán đám mây đang là xu thế toàn cầu, cung cấp những dịch vụ ngày càng đa dạng và phong phú; chẳng hạn như:

- **Dịch vụ lưu trữ**:
- Dropbox
- Google Drive
- OneDrive
- Box
- iCloud

- **Dịch vụ thư tín điện tử**:
- Gmail
- Yahoo! Mail
- iCloud Email
- Outlook

- **Dịch vụ cung cấp các ứng dụng** như hội nghị trực tuyến (video conference), lịch công tác, soạn thảo văn bản, tạo bảng tính và bài trình chiếu, xử lý dữ liệu tác nghiệp:
- Zoom Cloud Meeting
- Google Meet
- Microsoft Office 365 (Office 365)
- Google Workspace

- **Dịch vụ cung cấp máy chủ**; dịch vụ Web Hosting (cung cấp máy chủ và đường truyền để lưu trữ và vận hành website), có nhiều nhà cung cấp các dịch vụ này ở Việt Nam như:
- Viettel IDC
- CMC
- FPT
- DIGISTAR
- Hostvn
- Mắt Bão
- Long Vân

## Internet vạn vật

### Giao thông thông minh

Giả sử em được giao nhiệm vụ thiết kế ô tô tự lái; hãy nêu những khả năng mà em muốn trang bị cho xe ngoài khả năng tự động nhận dạng chướng ngại vật.

Nhiều năm nay, ùn tắc giao thông vẫn là một vấn đề nan giải trong quá trình phát triển đô thị ở nhiều thành phố lớn trên thế giới. Để giải quyết vấn đề này, hệ thống giao thông thông minh được xây dựng với mạng các cảm biến lắp trên mỗi thành phố (Hình 1) được xây dựng.

Trong hệ thống giao thông thông minh có các cảm biến (Sensor); thiết bị điện tử có khả năng tự động nhận dạng biển số, chủng loại và mật độ xe; nhận dạng các chướng ngại vật trên đường. Dữ liệu lưu trữ được truyền qua mạng về Trung tâm điều khiển. Trung tâm này có nhiệm vụ truyền tín hiệu qua mạng để điều khiển các đèn giao thông, biển báo điện tử và xe tự lái, nhờ đó thực hiện các chức năng như điều tiết phân luồng giao thông, tính phí giao thông; xử lý tình huống một cách tự động.



# Hình 1: Giao thông thông minh
(Nguồn: https://lerticonetwork.com)

## b) Nhà thông minh
Thông qua hệ thống cảm biến, ngôi nhà thông minh tự động theo dõi các điều kiện sinh hoạt trong phòng. Nhiệt độ, độ ẩm, nồng độ oxygen, ánh sáng sẽ giữ được ở mức tối ưu bằng cách điều chỉnh điều hòa nhiệt độ, rèm, quạt thông gió, máy khử mùi, hệ thống đèn chiếu sáng. Chủ nhân dễ dàng kiểm soát, điều khiển trực tiếp hoặc từ xa các thiết bị gia dụng thông minh và thiết bị an ninh thông minh trong ngôi nhà thông qua giọng nói, cử chỉ hay qua điện thoại thông minh.

### 3
Em hãy nêu một tình huống thực tế mà khi đó:
- Ngôi nhà thông minh tự động điều chỉnh nhiệt độ căn phòng.
- Chủ nhân không ở nhà, cần phải điều khiển từ xa để mở cửa ra vào.

## c) Nông nghiệp thông minh
Mạng cảm biến sẽ thu thập dữ liệu về nhiệt độ, độ ẩm của vùng đất, sức sống của cây trồng (Hình 2). Dựa trên các dữ liệu thu thập được, máy móc sẽ tự động tưới tiêu, cho ăn và chăm sóc vật nuôi, phát hiện những cá thể bị bệnh sớm để tránh được nguy cơ bệnh dịch lây lan.

# Hình 2: Nông nghiệp thông minh
(Nguồn: https://hryldnetworks.com)

Đọc sách tại học O.vn 35



# d) Y tế thông minh

Các thiết bị y tế thông minh có khả năng thường xuyên theo dõi các chỉ số sức khoẻ như nhịp tim, huyết áp; năng lượng tiêu thụ, khoảng cách vận động của bệnh nhân trong quá trình sinh hoạt hằng ngày. Bệnh nhân mắc bệnh tiểu đường có thể sử dụng thiết bị theo dõi đường huyết liên tục gồm một cảm biến gắn ở da (thường ở vùng bụng hoặc dưới cánh tay) và một số thiết bị đọc kết quả đường huyết liên tục 24/24. Người bệnh cũng có thể sử dụng điện thoại thông minh để đọc kết quả từ các cảm biến.

![Hình 3: Đồng hồ thông minh có khả năng đo và báo nhịp tim bất thường](https://ihrww:forbes.com)

Với bệnh nhân bị bệnh tim mạch, vòng đeo y tế, đồng hồ thông minh (Hình 3) thường xuyên giám sát nhịp tim và huyết áp của bệnh nhân. Khi phát hiện triệu chứng bất thường, thiết bị y tế thông minh tự động gửi cảnh báo tới nhà hay trung tâm y tế. Nhờ vậy, bệnh nhân được giám sát từ xa; được phát hiện và chẩn đoán sớm.

# e) Khái niệm Internet vạn vật

Các thiết bị thông minh (thiết bị y tế thông minh, thiết bị giao thông thông minh, thiết bị nhà thông minh, và nhiều hệ thống tiên tiến khác) đều được xây dựng trên cơ sở của IoT. IoT: hệ thống liên mạng bao gồm các phương tiện và vật dụng, các thiết bị thông minh. Các thiết bị đó được gắn các cảm biến; đồng thời cài đặt phần mềm chuyên dụng giúp chúng có thể tự động kết nối, thu thập và trao đổi dữ liệu trên cơ sở hạ tầng Internet mà không nhất thiết phải có sự tương tác trực tiếp giữa con người với con người hay con người với máy tính.

IoT tạo ra một cuộc cách mạng công nghệ đang tác động, làm thay đổi cuộc sống và công việc của con người.

## Trong các câu sau đây, những câu nào đúng?

1) 1 IdIII IIUI Cua1ll41lS ILIU ILUIL IIILCLIIC

Đa36 sách tai hoc1O.vn



# Nội dung SGK

## 1. Các thông tin về mạng LAN và IoT

1. Nếu mất kết nối Internet thì các máy tính trong mạng LAN vẫn liên lạc được với nhau.
2. Phải có mạng LAN mới xây dựng được IoT.
3. Điện toán đám mây cung cấp những dịch vụ tốt hơn so với những dịch vụ mà các cơ quan tự xây dựng.

## Bài tập

### Bài 1
Em hãy tìm kiếm thông tin về những công ty Việt Nam đang cung cấp dịch vụ Điện toán đám mây.

### Bài 2
Theo em, IoT đem lại những lợi ích gì?

## Câu hỏi

### Câu 1
Nếu một cơ quan tự xây dựng hệ thống cung cấp dịch vụ ứng dụng công nghệ thông tin theo cách riêng thì có thể dẫn tới hạn chế nào sau đây?
1. Nhân viên của cơ quan này không thể truy cập trang web của cơ quan khác.
2. Tốn kém về thời gian, chi phí xây dựng và bảo trì.
3. Lãng phí tài nguyên thiết bị số và đường truyền:
- Phí không chẳng
- Bảng biểu dữ liệu, báo cáo
4. Các dịch vụ không tương thích với nhau; hạn chế các khả năng không thống nhất về khuôn dạng.

### Câu 2
Điện toán đám mây không thể cung cấp những dịch vụ nào trong các dịch vụ sau đây?
1. Dịch vụ ứng dụng lưu trữ.
2. Dịch vụ thư tín điện tử.
3. Dịch vụ bảo trì phần mềm tại gia đình.
4. Dịch vụ cung cấp máy chủ.
5. Dịch vụ cung cấp các ứng dụng văn phòng.

## Tóm tắt bài học
- Mạng LAN chỉ kết nối những máy tính trong phạm vi một cơ quan hoặc gia đình; còn Internet là mạng toàn cầu. Mạng LAN thường kết nối với Internet nhưng không phụ thuộc hoàn toàn vào Internet.
- Điện toán đám mây cung cấp những dịch vụ thường là tốt và rẻ.
- Internet vạn vật là hệ thống bao gồm các thiết bị thông minh có gắn cảm biến kết nối mạng (chủ yếu là mạng Internet), có khả năng thu thập dữ liệu và kết nối với nhau để hợp tác hoạt động.
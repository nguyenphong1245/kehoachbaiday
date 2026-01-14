# CHỦ ĐỀ B: MANG MÁY TÍNH VÀ INTERNET

## BÀI 1: CƠ SỞ VỀ MẠNG MÁY TÍNH

Học xong bài này, em sẽ:
- Nêu được chức năng chính của một số thiết bị mạng thông dụng: Access Point, Switch, Modem, Router.
- Dựa theo kiến thức đã học, em hãy liệt kê những loại mạng máy tính mà em biết.

### Một số khái niệm mở đầu

Mạng máy tính là một hệ thống các thiết bị số được kết nối với nhau để truyền dữ liệu và trao đổi thông tin. Các thiết bị số trong mạng có thể kết nối với nhau bằng dây cáp mạng (mạng có dây) hoặc bằng sóng vô tuyến (mạng không dây).

Cáp mạng là một loại dây dẫn có vỏ bọc bảo vệ bên ngoài và bên trong có dây dẫn kim loại để truyền tín hiệu điện. Một loại khác là cáp quang dùng dây dẫn trong suốt bằng nhựa hoặc thủy tinh để truyền tín hiệu ánh sáng.

Các thiết bị số trong một mạng máy tính được đặt trong một phạm vi địa lý nhất định. Trong phạm vi này, người dùng có thể sử dụng mạng để truyền dữ liệu và trao đổi thông tin. Dưới góc độ sử dụng mạng, các thiết bị số trong mạng có thể chia làm hai loại: thiết bị mạng và thiết bị đầu cuối.

Thiết bị đầu cuối bao gồm máy tính cá nhân, điện thoại thông minh, máy tính bảng, máy in, mà người dùng kết nối tới mạng. Trong mạng Internet vạn vật (Internet of Things), các thiết bị số như: camera, đèn chiếu sáng, tủ lạnh, cảm biến nhiệt độ cũng được coi là các thiết bị đầu cuối.

### Bộ giao tiếp mạng

| Bộ giao tiếp mạng có dây | Bộ giao tiếp mạng không dây | Bộ giao tiếp mạng không dây trong laptop |
|--------------------------|-----------------------------|------------------------------------------|
|                          |                             |                                          |

**Hình 1. Một số bộ giao tiếp mạng**



# Kết Nối Mạng

Để kết nối mạng, máy tính hay thiết bị số cần được trang bị bộ giao tiếp mạng (NIC - Network Interface Card). Bộ giao tiếp mạng là thành phần không thể thiếu trong bất kỳ thiết bị số nào muốn kết nối được với mạng máy tính, được dùng để truyền và nhận dữ liệu qua cáp mạng hoặc sóng vô tuyến. Ngày nay, nhiều thiết bị số có bộ giao tiếp mạng cung cấp hai cổng kết nối: kết nối có dây và kết nối không dây.

## Hình 1
*Hình 1 là ví dụ về một số bộ giao tiếp mạng được dùng hiện nay.*

----

## Thông Tin Kết Nối Mạng

Nội dung trong khung chữ nhật màu đỏ ở Hình 2 cho em biết tin gì?

```
Network Connection Details:
| Property                      | Value                                      |
|-------------------------------|--------------------------------------------|
| Connection-specific DNS       | Realtek Gaming GbE Family Controller       |
| Physical Address              | 9C-7B-EF-3B-FE-22                         |
| DHCP Enabled                  | Yes                                        |
| IPv4 Address                  | 192.168.1.78                              |
| IPv4 Subnet Mask              | 255.255.255.0                             |
| Lease Obtained                | Friday, October 27, 2023 8:34:06 AM      |
| Lease Expires                 | Saturday, October 28, 2023 8:34:21 AM     |
```

## Hình 2
*Hình 2. Thông tin kết nối mạng*

Để hoạt động trong mạng máy tính, mỗi bộ giao tiếp mạng được gán một địa chỉ MAC (Media Access Control) duy nhất. Cấu trúc của địa chỉ MAC được biểu diễn bằng 6 cặp số khác nhau tương ứng với 12 ký tự trong hệ thập lục phân (dãy từ 0-9, A-F). Mỗi cặp số được ngăn cách nhau bằng dấu hai chấm hoặc dấu gạch nối (ví dụ: 2C.54.91:88:C9:E3 hoặc 2c-54-91-88-c9-e3). Địa chỉ MAC được sử dụng để đảm bảo tính duy nhất và định danh của mỗi thiết bị trong một mạng máy tính. Nó cũng cung cấp một phương pháp để xác định và phân biệt các thiết bị mạng trong một mạng lớn, cho phép truyền dữ liệu đúng đích và quản lý mạng hiệu quả.

## Mạng Cục Bộ

Em hãy tìm hiểu phương thức kết nối mạng của một máy tính trong phòng thực hành Tin học và cho biết máy tính đó đang sử dụng cáp mạng hay Wi-Fi để truy cập mạng máy tính.



# a) Mạng LAN

Mạng LAN (Local Area Network) hay còn gọi là mạng cục bộ là loại mạng kết nối những máy tính và các thiết bị số trong một phạm vi nhỏ như toà nhà, cơ quan, trường học, nhà riêng. Mạng LAN cho phép các thiết bị như máy tính, máy chủ, máy in và thiết bị lưu trữ dữ liệu khác trong một phạm vi địa lý hẹp truyền tải dữ liệu và chia sẻ tài nguyên mạng.

Các thành phần chính của mạng LAN bao gồm thiết bị đầu cuối của người dùng, cáp mạng và Switch. Ví dụ, trong Hình 3 là một mạng LAN gồm một số máy tính và máy in được kết nối có dây tới Switch.

```
Switch

PC           PC  Printer         PC
Hình 3. Ví dụ một mạng LAN
```

Switch hay còn gọi là bộ chuyển mạch có nhiều cổng mạng dùng để kết nối và chuyển tiếp dữ liệu giữa các thiết bị trong cùng một mạng LAN. Khi dữ liệu được gửi qua mạng máy tính, nó được chia thành các đơn vị nhỏ hơn và được đóng gói thành các gói tin. Các gói tin này sau đó được truyền riêng rẽ từ thiết bị gửi đến thiết bị nhận. Các gói tin được tập hợp để xây dựng lại dữ liệu gốc. Dữ liệu được đóng gói thành các tin bằng cách thêm địa chỉ của máy gửi và máy nhận (trong đó có địa chỉ MAC) và các thông tin khác. Có thể nói rằng, tin là một đơn vị dữ liệu được truyền qua mạng máy tính.

Switch xây dựng bảng dữ liệu các tên của nó và địa chỉ MAC của máy tính tương ứng kết nối tới cổng đó. Mỗi khi nhận được một gói tin, Switch sẽ đọc địa chỉ MAC của máy nhận và chuyển tiếp gói tin qua cổng kết nối tới thiết bị có địa chỉ MAC đó.

# b) Mạng WLAN

Mạng WLAN (Wireless Local Area Network) hay còn gọi là mạng cục bộ không dây là một loại mạng cục bộ sử dụng công nghệ không dây, cho phép các thiết bị như máy tính, điện thoại thông minh, máy tính bảng và các thiết bị thông minh khác kết nối với mạng và truy cập vào tài nguyên mạng mà không cần sử dụng dây cáp. Các thiết bị trong mạng WLAN được trang bị bộ giao tiếp mạng không dây (Wireless Network Card) để truyền/nhận dữ liệu qua sóng radio và được tuân thủ theo các chuẩn Wi-Fi.



# Các thành phần chính của mạng WLAN

Các thành phần chính của mạng WLAN bao gồm các thiết bị của người dùng có tích hợp bộ giao tiếp mạng không dây và điểm truy cập không dây. Ví dụ, trong Hình 4 có các thiết bị của người dùng kết nối với điểm truy cập không dây tạo thành một mạng WLAN hay còn được gọi là mạng Wi-Fi.

## Hình 4: Ví dụ một mạng WLAN

- Smart Watch
- Tablet
- Laptop
- Smart Phone
- Access Point
- PC

## Access Point (AP)

Access Point (AP) hay còn gọi là điểm truy cập không dây được dùng để cung cấp kết nối không dây cho các thiết bị trong một mạng cục bộ. Hiện nay, một số AP được trang bị cổng cắm cáp mạng dành cho kết nối có dây để có thể cung cấp một mạng LAN đồng thời cho các thiết bị không dây và có dây. AP có chức năng và cách hoạt động tương tự như Switch nhưng được trang bị thêm khả năng truyền nhận dữ liệu thông qua kết nối không dây. Để các thiết bị của người dùng có thể kết nối không dây tới AP thì mỗi thiết bị cần được cài đặt truy cập theo tên và mật khẩu của mạng Wi-Fi.

## Mạng diện rộng và Internet

Mạng diện rộng (Wide Area Network - WAN) là một loại mạng máy tính có phạm vi địa lý rộng lớn, cung cấp kết nối và truyền tải dữ liệu giữa các mạng LAN với các thiết bị khác nhau trong một khu vực lớn như một thành phố, một quốc gia hoặc nhiều quốc gia trên thế giới.

Internet là một mạng WAN đặc biệt cho phép các máy tính và thiết bị khác truy cập và trao đổi thông tin với nhau trên toàn thế giới.



# Sơ đồ kết nối các mạng LAN để truy cập Internet

## Các thành phần chính sau dây:

1. **Router** là một thiết bị quan trọng trong mạng WAN, có chức năng chuyển tiếp dữ liệu giữa các mạng LAN khác nhau và xác định đường đi đúng để đưa gói tin đến địa chỉ đích. Router cũng có khả năng tìm đường đi tối ưu cho gói tin trong mạng WAN. Khi một gói tin được gửi tới, Router sẽ xác định địa chỉ mạng của máy nhận và xác định đường đi tốt nhất để chuyển tiếp gói tin đó đến đích.

Chức năng chính của Router là tính toán đường đi tối ưu cho gói tin dựa trên các tiêu chí khác nhau như độ trễ, băng thông, chi phí, khoảng cách. Các tiêu chí này có thể được cài đặt tự động hoặc cài đặt bởi quản trị mạng.

Ví dụ, Hình 5 miêu tả một mạng lưới kết nối giữa các mạng LAN với nhau qua các thiết bị định tuyến, trong đó Router giữ vai trò xác định đường đi tối ưu để chuyển tiếp các gói tin từ mạng LAN-1 tới mạng LAN-2.

```
Router                                            LAN-2

Router
LAN-1

Router                                                  LAN-3

Router    Router
```

**Hình 5. Ví dụ một định tuyến chuyển tiếp gói tin của Router**

2. **Modem** (Modulator and Demodulator) là bộ điều chế và giải điều chế để biến đổi các tín hiệu số thành tín hiệu tương tự và ngược lại. Trong Hình 6, Modem được sử dụng để truy cập Internet thông qua nhà cung cấp dịch vụ Internet (ISP).

```
LAN-1                  Router

LAN-2    Internet
WLAN-1    Modem  ISP
```

**Hình 6. Ví dụ một sơ đồ kết nối Internet**

----

**Bản in thử**



# Ngày nay, các nhà cung cấp dịch vụ Internet đều dùng đường tín hiệu số hóa truyền và thường cung cấp một thiết bị được tích hợp tất cả các chức năng của Modem, Router và AP cho mỗi gia đình khi đăng ký thuê bao sử dụng dịch vụ Internet. Thiết bị này được kết nối với nhà cung cấp dịch vụ Internet bằng cáp quang hoặc cáp đồng.

## 3. ISP (Internet Service Provider)
ISP là một nhà cung cấp dịch vụ truy cập Internet cho người dùng kết nối các thiết bị mạng với Internet và cung cấp các dịch vụ liên quan đến Internet.

### Câu hỏi
1. Hãy liệt kê các loại mạng có quy mô từ nhỏ tới lớn.
2. Hãy mô tả những chức năng của Access Point, Switch, Router, Modem trong mạng máy tính.

Em hãy tìm hiểu một số thiết bị Access Point của các nhà cung cấp dịch vụ Internet tại Việt Nam.

### Trong các câu sau, câu nào sai?
a) Switch và Router là hai thiết bị mạng có cùng chức năng, chọn thiết bị nào cũng được.
b) Router có khả năng xác định đường đi tốt nhất để tin nhắn từ máy gửi đến máy đích.
c) Modem thực hiện việc biến đổi tín hiệu giữa thiết bị người dùng và nhà cung cấp dịch vụ Internet.
d) Access Point hoạt động tương tự như Switch nhưng được trang bị thêm khả năng truyền nhận dữ liệu bằng kết nối không dây.

### Tóm tắt bài học
- **Switch** là bộ chuyển mạch được sử dụng để kết nối các thiết bị đầu cuối của người dùng với nhau và tạo thành một mạng cục bộ.
- **Router** là bộ định tuyến được sử dụng để kết nối các mạng LAN với nhau; giữa mạng LAN và mạng Internet.
- **Access Point** là thiết bị được sử dụng để cung cấp kết nối mạng không dây.
- **Modem** là thiết bị kết nối các thiết bị sử dụng Internet (AP, Switch, Router) tới nhà cung cấp dịch vụ Internet để người dùng có thể truy cập được Internet.
# BÀI THIẾT KẾ MẠNG LAN

Học xong bài này; em sẽ:
- Trình bày và giải thích sơ lược được việc thiết kế mạng LAN cho một tổ chức nhỏ.

Theo em, cần tối thiểu những thiết bị mạng nào để có thể hình thành một mạng LAN?

## Định nghĩa thiết kế mạng

1. Em hãy tìm hiểu và cho biết mạng máy tính trong phòng thực hành Tin học ở trường em có phải là mạng LAN không:

Thiết kế mạng là trình lập kế hoạch thực hiện cơ sở hạ tầng mạng máy tính phù hợp để đáp ứng các yêu cầu và mục tiêu cụ thể. Quá trình này bao gồm xác định các yếu tố cấu thành mạng, bố trí các thành phần mạng, cấu hình các thiết bị để đảm bảo truyền thông hiệu quả và hiệu suất cao giữa các thiết bị trong mạng. Thiết kế mạng là cần thiết vì mỗi tổ chức sẽ có những yêu cầu riêng cho mạng máy tính của mình.

Một thiết kế mạng nhỏ thường đơn giản bởi số lượng và loại thiết bị đi kèm ít hơn so với một thiết kế mạng lớn.

### Hình 1. Minh họa cấu trúc mạng của một tổ chức, doanh nghiệp nhỏ

```
Laptop    'AP    ISP  Internet

PC        Switch    Router  Modem

PC

Printer    Server
```

Bản in thử



# Mạng máy tính

Mạng này yêu cầu có Modem, Router, Switch và AP để kết nối các thiết bị người dùng có dây và không dây; máy in và máy chủ. Các mạng nhỏ thường có một kết nối WAN duy nhất với nhà cung cấp dịch vụ Internet.

Với các mạng lớn, sẽ yêu cầu có bộ phận công nghệ thông tin duy trì, bảo mật và khắc phục sự cố các thiết bị mạng cũng như bảo vệ dữ liệu của tổ chức.

## Quy trình thiết kế mạng

Em hãy tìm hiểu và kể tên những thiết bị mạng trong phòng thực hành môn Tin học ở trường em:

Thiết kế hệ thống mạng bao gồm những bước chính sau đây:

1. **Bước 1. Thu thập các yêu cầu về mạng:**
- Mục đích chính của bước này là xác định được yêu cầu của tổ chức về hệ thống mạng cần thiết kế.
- Yêu cầu có thể được thu thập bằng cách khảo sát địa hình khu vực; phỏng vấn trực tiếp.
- Tổ chức cần xác định rõ:
- Nhu cầu sử dụng mạng máy tính là gì?
- Có bao nhiêu thiết bị (máy tính, laptop; máy in, điện thoại,...) sẽ truy cập mạng?
- Có cầu khả năng mở rộng và tính linh hoạt không?
- Những câu hỏi này sẽ giúp xác định phạm vi, kích thước và cấu trúc của mạng LAN.

### Sơ đồ mặt bằng

```
Thư viện
g
30 m  1

Khu vực 12 m
| văn phòng
Phòng Tin học

10 m    10 m    ô m
```

**Hình 2. Ví dụ sơ đồ mặt bằng ở một trường thông phô**



# Thiết kế mạng LAN cho trường phổ thông

Ví dụ, một trường phổ thông có sơ đồ mặt bằng như Hình 2 và yêu cầu thiết kế mạng LAN phục vụ cho các thiết bị người dùng với số lượng phân bổ theo như bảng sau đây.

## Bảng 1. Số lượng thiết bị người dùng trong trường phổ thông

| Khu vực                     | Số lượng thiết bị người dùng | |
|-----------------------------|-------------------------------|---|
|                             | Thiết bị kết nối có dây      | Thiết bị kết nối không dây |
| Khu vực văn phòng           | 20                            | 30                          |
| Khu vực phòng học          |                               | 50                          |
| Thư viện                    | 15                            | 15                          |
| Phòng Tin học               | 20                            | 25                          |

### Bước 2. Chọn các thiết bị cần thiết

Các thiết bị mạng như Router, Switch, AP là nền tảng tạo thành cơ sở hạ tầng mạng của mỗi tổ chức. Số lượng và loại cổng kết nối là một tiêu chí khi lựa chọn bộ chuyển mạch cung cấp kết nối có dây phù hợp với số lượng thiết bị đầu cuối của người dùng. Đối với số lượng thiết bị kết nối không dây, yêu cầu liên quan tới phạm vi bao phủ sóng Wi-Fi là căn cứ để lựa chọn số lượng AP phù hợp. Mặt khác, bộ định tuyến được sử dụng để kết nối mạng cục bộ với các mạng khác như Internet. Một bảng danh sách thiết bị kèm theo số lượng là cần thiết để có thể xây dựng một bản kế hoạch hoàn chỉnh.

Tiếp tục ví dụ thiết kế mạng LAN cho trường phổ thông, số lượng Switch, AP cần được xác định trong bước này. Quá trình xác định có thể như sau:

- **Khu vực văn phòng**: 1 Switch với 24 cổng kết nối có thể đảm bảo kết nối mạng LAN cho 20 thiết bị kết nối có dây và 1 AP đặt ở giữa khu vực có thể đảm bảo kết nối không dây cho 30 thiết bị không dây.

- **Khu vực phòng học**: Số lượng AP được xác định dựa trên phạm vi phủ sóng Wi-Fi của mỗi AP: Với AP có độ phủ sóng từ 30 m đến 50 m, cần 2 AP dành cho khu vực phòng học. Với 5 máy tính trong các lớp học khác nhau cần 1 Switch có 8 cổng kết nối cho khu vực này: cổng kết nối có thể đảm bảo mạng LAN cho 15 thiết bị.

- **Thư viện**: 1 Switch với 24 cổng kết nối có dây và 1 AP có thể cung cấp kết nối dây cho 15 thiết bị không dây.

- **Phòng Tin học**: Tương tự như trên, sẽ cần 1 Switch có 24 cổng kết nối và 1 AP.

Ngoài ra, trường phổ thông được kết nối tới Internet qua một Modem. Để kết nối các mạng LAN với nhau cũng như với Internet, cần sử dụng Router.

### Bước 3. Lập sơ đồ kết nối mạng

Sử dụng tất cả các thông tin đã thu thập được để vẽ sơ đồ các kết nối cần thiết giữa các thiết bị trong mạng. Các thiết bị đầu cuối của...



# Thiết kế mạng LAN ở trường thông phổ thông

Người dùng thông thường sẽ được kết nối trực tiếp với Switch. Các Switch có thể kết nối với các Switch khác hoặc Switch có hiệu suất cao hơn. Từ Switch kết nối với các mạng khác như Internet thì Router sẽ được dùng.

## Hình 3. Minh họa một sơ đồ kết nối mạng cho ví dụ thiết kế mạng LAN ở trường thông phổ

```
Internet
ISP

Phòng Tin học
Khu vực văn phòng

Thư viện                               Khu vực phòng học
```

### Bước 4: Tạo một bản kế hoạch để thực hiện

Dựa theo sơ đồ khảo sát địa hình và sơ đồ kết nối mạng; một bản kế hoạch triển khai cần được xây dựng. Quá trình này sẽ đưa ra các bước triển khai tiếp theo như:

- Vị trí đặt các thiết bị mạng
- Hệ thống đường dẫn cáp mạng
- Sơ đồ lắp đặt và cài đặt cấu hình mạng

Để đảm bảo mạng LAN đáp ứng các yêu cầu và mục tiêu của tổ chức.

Cài đặt cấu hình mạng là trình thiết lập các thông số dành cho các thiết bị như: AP, Switch, Router và Modem để đảm bảo kết nối và truyền thông hiệu quả giữa các thiết bị trong mạng. Ví dụ: Cài đặt cấu hình mạng bao gồm cài đặt địa chỉ IP, DNS, tên mạng Wi-Fi, bảo mật mạng và các thiết lập khác liên quan.

Quá trình thiết kế mạng đòi hỏi sự hiểu biết sâu về yêu cầu của tổ chức, kiến thức về mạng và các yếu tố kỹ thuật. Cần xem xét các yếu tố kinh tế, khả năng mở rộng và các yêu cầu đặc biệt của tổ chức. Do đó, thiết kế mạng hiệu quả đòi hỏi sự phân tích kỹ lưỡng và kế hoạch cẩn thận.



# Câu 1. Thiết kế mạng là gì?

# Câu 2. Em hãy trình bày sơ lược quy trình thiết kế mạng LAN.

Em hãy xác định số lượng Switch cần thiết để thiết kế mạng LAN cho một doanh nghiệp nhỏ gồm ba phòng ban, mỗi phòng ban có 30 máy tính và 30 đến 40 thiết bị thông minh không dây.

Trong các câu sau, những câu nào đúng?
- a) Thiết kế mạng không đòi hỏi thông tin về số lượng người dùng.
- b) Để thiết kế mạng cần có các thiết bị như: Switch; Router; Modem, AP.
- c) Thu thập các yêu cầu về mạng là cần thiết để biết được số lượng thiết bị đầu cuối yêu cầu của người dùng.
- d) Sơ đồ kết nối mạng là không cần thiết trong quá trình thiết kế mạng.

## Tóm tắt bài học

Với một tổ chức bất kỳ, việc thiết kế mạng là cần thiết để xây dựng cơ sở hạ tầng công nghệ thông tin phù hợp với các yêu cầu và mục tiêu tổ chức đề ra. Quy trình thiết kế mạng bao gồm những bước cơ bản sau: thu thập các yêu cầu về mạng, chọn các thiết bị cần thiết, lập sơ đồ kết nối mạng và tạo một bản kế hoạch để thực hiện.

# BÀI TÌM HIỂU THÊM

## TÌM HIỂU ỨNG DỤNG VẼ SƠ ĐỒ MẠNG DRAWIO

Draw.io (https://app.diagrams.net) là một công cụ trực tuyến cho phép tạo ra những sơ đồ quy trình; sơ đồ cây; sơ đồ mạng một cách nhanh chóng và dễ dàng. Draw.io hoàn toàn miễn phí, dễ sử dụng, giao diện quen thuộc và không giới hạn số lần sử dụng. Để thiết lập một sơ đồ mạng, có thể thực hiện theo các bước sau:

1. **Bước 1:** Mở website https://app.diagrams.net, chọn Create New Diagram sau đó đặt tên file và chọn Create để bắt đầu.
2. **Bước 2:** Chọn More Shapes và tìm tới phần Networking rồi tích vào ô Cisco để thêm bộ sưu tập ký hiệu thiết bị mạng vào ứng dụng.
3. **Bước 3:** Thêm các ký hiệu Switch, Router, Modem, AP vào sơ đồ bằng cách giữ vào biểu tượng và kéo thả vào màn hình làm việc. Hình ảnh sơ đồ có thể được tải về với nhiều định dạng khác nhau như: JPG, PNG.
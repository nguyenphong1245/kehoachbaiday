# BÀI 5: THỰC HÀNH CHIA SẺ TÀI NGUYÊN TRÊN MẠNG

## SAU BÀI HỌC NÀY, EM SẼ:
- Biết cách chia sẻ tài nguyên tệp và máy in trong mạng cục bộ.

### Nội dung lý thuyết:
Tài nguyên của một máy tính trên mạng có thể là dữ liệu, phần mềm hay thiết bị. Chia sẻ tài nguyên trên mạng cục bộ là cho phép một người từ một máy tính có thể "nhìn thấy" và sử dụng tài nguyên trên một máy tính khác trong mạng. Việc chia sẻ có thể gây rủi ro như dữ liệu có thể bị truy cập với mục đích xấu hay bị làm hỏng bởi một người dùng trên mạng. Vì thế, luôn cần các cơ chế bảo mật và cấp phép khi chia sẻ tài nguyên. Chúng ta sẽ tìm hiểu điều này được thực hiện như thế nào trong mạng cục bộ gồm các máy tính chạy hệ điều hành Windows, hệ điều hành phổ biến nhất hiện nay.

### 1. CHIA SẺ TỆP VÀ THƯ MỤC TRÊN MẠNG CỤC BỘ
#### Hoạt động 1: Điều kiện cần để chia sẻ tài nguyên trên mạng
Để hai máy tính có thể chia sẻ tài nguyên qua mạng cục bộ cần những điều kiện nào sau đây?
- A. Kết nối hai máy tính với nhau qua mạng.
- B. Người chia sẻ và được chia sẻ phải "kết bạn" với nhau; tương tự như trên mạng xã hội.
- C. Người được chia sẻ phải đề xuất yêu cầu và trả phí truy cập tài nguyên; cấp quyền truy cập tài nguyên; chẳng hạn được xem, được sửa, được xoá.

Chia sẻ tài nguyên trong mạng cục bộ là công việc có tính kỹ thuật, phục vụ cho công việc nội bộ của tổ chức sở hữu mạng cục bộ đó. Vì thế không có yêu cầu "kết bạn" hay "trả phí". Chia sẻ tài nguyên được thực hiện theo yêu cầu công việc và cần được người chủ tài nguyên cấp phép thông qua các biện pháp kỹ thuật thực hiện trên hệ điều hành.

Windows có nhiều phương thức chia sẻ tài nguyên giữa các máy tính kết nối với nhau qua mạng, có dây hoặc không dây; trong mạng cục bộ hoặc qua Internet: chia sẻ qua tương tác gần khi phát hiện máy tính hay thiết bị ở gần; chia sẻ qua tài khoản của Microsoft; chia sẻ qua ứng dụng, chia sẻ qua đám mây hay chia sẻ qua ủy nhiệm cho một tài khoản nào đó. Sau đây chúng ta sẽ tìm hiểu cách chia sẻ hai loại tài nguyên thường gặp là chia sẻ tệp và máy in được thiết kế sẵn trong hệ điều hành.



# Nhiệm vụ 1: Thiết lập môi trường chia sẻ tệp và máy in cho người dùng trong mạng

## Yêu cầu:
Thiết lập được môi trường chia sẻ tệp và máy in.

Các phiên bản sau này của Windows đều được kiểm soát chặt chẽ về an ninh nên trước khi chia sẻ dữ liệu cần phải nới lỏng các hạn chế. Môi trường thuận lợi để có thể chia sẻ tệp và máy in trong mạng là:

- **Thiết lập chế độ mạng riêng**: Windows từ bản 10 cho phép cài đặt mạng riêng (Private) hoặc mạng công cộng (Public). Mạng công cộng thường được thiết lập ở những địa điểm công cộng như nhà ga sân bay, quán cà phê với mục đích hạn chế nguy cơ lộ thông tin. Mạng riêng được hiểu là mạng của nhóm người dùng có độ tin cậy cao hơn; có thể chia sẻ tài nguyên với nhau.

- **Thiết lập cho phép các máy khác nhìn thấy (discoverable)** và cho phép chia sẻ tệp và máy in (file and printer sharing).

- **Tắt tạm thời tường lửa (firewall)**: Tường lửa là phần mềm dùng để kiểm soát truy cập máy tính từ bên ngoài nhằm ngăn ngừa các nguy cơ xâm nhập; tấn công từ bên ngoài như từ Internet. Tường lửa không chặn việc truy cập tài nguyên nếu người sử dụng được đánh giá là tin cậy, ví dụ khi người dùng được cấp tài khoản truy cập trên máy tính có tài nguyên. Dù vậy, để việc chia sẻ tài nguyên thuận lợi, nên tạm dừng hoạt động của tường lửa trong thời gian chia sẻ. Ở Windows 10 và 11, tường lửa Defender mặc định được kích hoạt.

> **Lưu ý**: Các hình ảnh minh hoạ đều sử dụng giao diện trên hệ điều hành phiên bản thấp hơn có thể có giao diện khác.

## Hướng dẫn:
### Bước 1. Mở chức năng thiết lập chia sẻ nâng cao
Hãy truy cập chức năng Advanced Sharing Settings từ Control Panel theo các bước:
Control Panel → Network and Internet → Network and Sharing Center → Advanced Sharing Settings.

![Hình 5.1. Thiết lập chế độ chia sẻ nâng cao](#)

Trong hộp thoại Advanced sharing settings, hãy kéo con trượt Network discovery và File and printer sharing sang vị trí On bên phải (Hình 5.1) để cho phép các máy tính khác trong mạng "nhìn thấy" máy tính này; đồng thời cho phép chia sẻ tệp và máy in. Khi được nhìn thấy, tên máy sẽ xuất hiện trên giao diện của File Browser (Hình 5.2).

## Bài tập và câu hỏi:
1. Giải thích sự khác biệt giữa mạng riêng và mạng công cộng trong Windows.
2. Tại sao cần phải tắt tường lửa khi chia sẻ tệp và máy in?
3. Mô tả các bước để thiết lập chia sẻ tệp và máy in trong Windows 10.

## Hình ảnh mô tả:
- **Hình 5.1**: Giao diện thiết lập chế độ chia sẻ nâng cao trong Windows.
- **Hình 5.2**: Giao diện File Browser hiển thị tên máy tính đã được chia sẻ.

## Bảng biểu:
| Tính năng                     | Mô tả                                                                 |
|-------------------------------|-----------------------------------------------------------------------|
| Mạng riêng                    | Mạng của nhóm người dùng có độ tin cậy cao, cho phép chia sẻ tài nguyên. |
| Mạng công cộng                | Mạng được thiết lập ở các địa điểm công cộng, hạn chế nguy cơ lộ thông tin. |
| Tường lửa                     | Phần mềm kiểm soát truy cập máy tính từ bên ngoài.                   |
| Chia sẻ tệp và máy in        | Cho phép các máy tính khác truy cập tài nguyên trên máy tính của bạn. |




# Bài học: Chia sẻ thư mục công cộng trong Windows

## Nội dung lý thuyết
Trong Windows, thư mục Public (Thư mục công cộng) được thiết lập sẵn trên mỗi máy tính. Thư mục này nằm trong ổ đĩa hệ thống (C:) và chứa các thư mục con như:
- Public Documents
- Public Downloads
- Public Music
- Public Pictures
- Public Videos

Dữ liệu trong thư mục Public mặc định không được chia sẻ. Tuy nhiên, nếu trong mục "Public folder sharing" (Chia sẻ thư mục công cộng) được bật, thì mọi người dùng trên mạng có thể nhìn thấy toàn bộ nội dung trong thư mục Public.

## Ví dụ minh họa
Trong giao diện thiết lập chia sẻ, người dùng có thể chọn biểu tượng "All networks" để mở ra giao diện thiết lập chia sẻ thư mục công cộng. Nếu mục "Public folder sharing" được bật, mọi người dùng trên mạng sẽ có quyền truy cập vào các thư mục trong Public.

## Bài tập và câu hỏi
**Nhiệm vụ 2: Chia sẻ tệp và thư mục**
- **Yêu cầu:** Chia sẻ được tệp và thư mục.
- **Hướng dẫn:** Mở ứng dụng quản lý tệp File Explorer; nháy chuột vào Network ở phía dưới bên trái cửa sổ. Danh sách những máy tính tham gia mạng cục bộ sẽ hiển thị.

**Câu hỏi:**
1. Thư mục Public trong Windows có những thư mục con nào?
2. Làm thế nào để bật chức năng chia sẻ thư mục công cộng?

## Hình ảnh mô tả
- **Hình 5.1:** Giao diện thiết lập chia sẻ thư mục công cộng.
- **Hình 5.2:** Các máy tính được nhìn thấy trên mạng qua File Browser.
- **Hình 5.3:** Cửa sổ thiết lập chia sẻ thư mục công cộng.
- **Hình 5.4:** Dừng tạm thời tường lửa.
- **Hình 5.5:** Cửa sổ Properties của thư mục SÁCH LỚP 12.

## Bảng biểu
| Tên thư mục          | Mô tả                          |
|----------------------|--------------------------------|
| Public Documents     | Thư mục tài liệu công cộng     |
| Public Downloads     | Thư mục tải xuống công cộng     |
| Public Music         | Thư mục nhạc công cộng         |
| Public Pictures      | Thư mục hình ảnh công cộng      |
| Public Videos        | Thư mục video công cộng         |




# Tiêu đề bài học
Chia sẻ tệp và thư mục trên mạng

# Nội dung lý thuyết
Trong hệ điều hành Windows, việc chia sẻ tệp và thư mục trên mạng giúp người dùng có thể truy cập và sử dụng tài nguyên từ các máy tính khác trong cùng một mạng. Để thực hiện việc chia sẻ, người dùng cần thiết lập các quyền truy cập cho từng người dùng cụ thể hoặc cho tất cả mọi người.

## Các bước chia sẻ tệp và thư mục:
1. **Mở cửa sổ Properties**: Nháy chuột phải vào thư mục cần chia sẻ và chọn "Properties".
2. **Chọn tab Sharing**: Trong cửa sổ Properties, nháy chuột vào tab "Sharing" để thiết lập chia sẻ.
3. **Thiết lập người dùng và quyền truy cập**: Nháy chuột vào "Share" để mở cửa sổ thiết lập người được chia sẻ và thiết lập quyền truy cập.

# Ví dụ minh họa
- **Hình 5.5**: Cửa sổ Properties
- **Hình 5.6**: Cửa sổ thiết lập chia sẻ
- **Hình 5.7**: Thiết lập người được chia sẻ
- **Hình 5.8**: Thiết lập quyền truy cập

# Bài tập và câu hỏi
1. Giải thích các bước để chia sẻ một thư mục trên mạng.
2. Tại sao cần thiết lập quyền truy cập cho từng người dùng khi chia sẻ tệp và thư mục?
3. Hãy mô tả cách thêm một người dùng mới vào danh sách chia sẻ.

# Hình ảnh mô tả
- **Hình 5.5**: Cửa sổ Properties
- **Hình 5.6**: Cửa sổ thiết lập chia sẻ
- **Hình 5.7**: Thiết lập người được chia sẻ
- **Hình 5.8**: Thiết lập quyền truy cập

# Bảng biểu
| Tên người dùng | Cấp độ quyền |
|----------------|---------------|
| user1          | Read          |
| user2          | Read          |
| Everyone       | Read/Write    |

Lưu ý: Quyền "Read" chỉ cho phép xem mà không được sửa, trong khi "Read/Write" cho phép cả xem và sửa.



# Bài học: Chia sẻ thư mục và máy in trong mạng LAN

## Nội dung lý thuyết

### 1. Chia sẻ thư mục
Sau khi hoàn tất danh sách người dùng được chia sẻ, hãy nháy chuột vào nút Share để hoàn tất thiết lập chia sẻ. Một thư mục khi đã được chia sẻ cho mọi người thì các máy khác khi duyệt thư mục bằng File Explorer đều nhìn thấy. Nháy đúp chuột vào biểu tượng của một máy (ví dụ MAY_1) sẽ thấy tất cả các thư mục đã chia sẻ (Hình 5.9). Biểu tượng của các thư mục được chia sẻ có hình chữ nhật màu xanh; tượng trưng cho dây cáp mạng; cho biết đó là thư mục trên một máy tính khác trên mạng. Nháy đúp chuột vào thư mục để mở và xem các tệp và thư mục con trong đó. Khi quyền là read thì chỉ xem được mà không sửa được. Người dùng có thể làm việc với thư mục và tệp trên mạng bình thường như trên máy tính riêng. Chia sẻ thư mục cũng có thể được coi như chia sẻ thiết bị lưu trữ.

### 2. Huỷ bỏ chia sẻ thư mục
Để huỷ bỏ chia sẻ thư mục, thực hiện theo các bước sau:
- **Bước 1:** Chọn thư mục cần huỷ bỏ chia sẻ, lần lượt thực hiện các bước tương tự như khi chia sẻ.
- **Bước 2:** Trong cửa sổ Advanced Sharing, nếu thư mục đang được chia sẻ thì sẽ có dấu tích ở ô "Share this folder". Nếu muốn huỷ bỏ chia sẻ thì nháy chuột vào ô đó để huỷ dấu tích. Sau đó nháy chuột chọn OK hoặc Apply.

## Ví dụ minh họa
- **Hình 5.9:** Các thư mục đã được chia sẻ trong MAY_1.
- **Hình 5.10:** Huỷ bỏ việc chia sẻ.

## Bài tập và câu hỏi
1. Hãy mô tả quy trình chia sẻ một thư mục trong mạng LAN.
2. Tại sao việc chia sẻ thư mục lại quan trọng trong một tổ chức?
3. Thảo luận về lợi ích của việc huỷ bỏ chia sẻ thư mục.

## Hình ảnh mô tả
- **Hình 5.9:** Mô tả các thư mục đã được chia sẻ trong máy tính MAY_1.
- **Hình 5.10:** Mô tả cửa sổ huỷ bỏ việc chia sẻ.

## Bảng biểu
| Tên thư mục | Trạng thái chia sẻ | Quyền truy cập |
|--------------|--------------------|-----------------|
| Thư mục A   | Đã chia sẻ         | Read            |
| Thư mục B   | Chưa chia sẻ       | -               |
| Thư mục C   | Đã chia sẻ         | Read/Write      |

----

### 3. Chia sẻ máy in
**Hoạt động 2:** Lợi ích của việc chia sẻ máy in là gì?
Trong phòng làm việc của một cơ quan, các máy tính đều được kết nối trong một LAN. Chỉ có một máy in nối với một máy tính nhưng mọi máy tính đều có thể in được bằng máy in này. Hãy thảo luận xem việc chia sẻ máy in có lợi gì.



# Chia sẻ máy in

## Nội dung lý thuyết
Nếu máy in không được chia sẻ qua mạng thì mỗi khi cần in phải sao chép dữ liệu đem sang máy tính có máy in. Máy tính cung cấp dịch vụ in sẽ nhận yêu cầu gửi đến từ các máy tính khác trong mạng, xếp thành hàng đợi. Khi máy in sẵn sàng, máy tính cung cấp dịch vụ in sẽ điều khiển máy in in lần lượt các tài liệu được gửi tới. Như vậy, việc chia sẻ máy in thực chất là biến máy tính có máy in đó thành một máy chủ cung cấp dịch vụ in (Print Server).

Để chia sẻ máy in, cần có hai điều kiện sau:
1. Thiết lập máy tính cung cấp dịch vụ in trên mạng. Máy in kết nối với máy tính này sẽ trở thành máy in chung trên mạng hay gọi là máy in mạng.
2. Máy tính cung cấp dịch vụ in phải cài đặt máy in mạng một cách bình thường như cài đặt máy in riêng; sau đó thiết lập chế độ chia sẻ. Còn các máy tính khác chỉ cần khai báo sử dụng máy in mạng.

## Ví dụ minh họa
### Nhiệm vụ 4: Chia sẻ máy in
#### a) Thiết lập máy cung cấp dịch vụ in
**Bước 1:** Từ giao diện của Control Panel, thực hiện dãy truy cập đến giao diện Printers &#x26; scanners (Hình 5.11):
- Control Panel
- Add printer or scanner
- Add device
- Hardware and Sound
- View devices and printers

**Bước 2:** Chọn máy in mạng
- Nháy chuột vào tên máy in muốn chia sẻ, ví dụ máy Canon LBP2900.

**Hình 5.11:** Chọn máy in để chia sẻ

**Bước 3:** Thiết lập máy in mạng.
- Khi cửa sổ như Hình 5.12 mở ra, nháy chuột chọn Set as default để đặt máy in thành mặc định.

**Hình 5.12:** Thiết lập máy in mặc định và chia sẻ

**Bước 4:** Chọn Printer properties để mở cửa sổ thiết lập chia sẻ.

**Bước 5:** Chia sẻ máy in.
- Trong cửa sổ Properties của máy in đã chọn (Hình 5.13), chọn Sharing để chia sẻ máy in.

**Hình 5.13:** Chia sẻ máy in

## Bài tập và câu hỏi
1. Giải thích khái niệm máy chủ cung cấp dịch vụ in (Print Server).
2. Liệt kê các bước cần thực hiện để chia sẻ máy in qua mạng.
3. Tại sao cần phải thiết lập chế độ chia sẻ cho máy in?

## Hình ảnh mô tả
- **Hình 5.11:** Giao diện chọn máy in để chia sẻ.
- **Hình 5.12:** Cửa sổ thiết lập máy in mặc định và chia sẻ.
- **Hình 5.13:** Cửa sổ chia sẻ máy in.

## Bảng biểu
| Bước | Hành động |
|------|-----------|
| 1    | Truy cập Control Panel và chọn Printers &#x26; scanners |
| 2    | Chọn máy in mạng muốn chia sẻ |
| 3    | Thiết lập máy in mạng thành mặc định |
| 4    | Mở cửa sổ Printer properties |
| 5    | Chia sẻ máy in qua cửa sổ Properties |




# Bài học: Kết nối máy in mạng

## Nội dung lý thuyết
Để người dùng trên mạng dễ nhận biết, nên đặt lại tên máy in gợi nhớ. Chẳng hạn, thay vì tên mặc định là "Canon LBP2900", có thể đặt là "Máy in mạng Canon LBP2900". Chọn OK và Apply để xác nhận máy in được chia sẻ, khi đó máy tính trở thành máy cung cấp dịch vụ in.

### a) Kết nối với máy in mạng từ các máy tính khác
**Bước 1. Tìm máy in mạng.**
Hãy thực hiện Bước như phần thiết lập máy cung cấp dịch vụ in. Ở giao diện như Hình 5.11, chọn Add device; khi đó nút này chuyển thành Refresh (làm mới danh sách).

Nếu trong danh sách không thấy máy in mạng muốn kết nối thì nháy chuột vào "The printer that I want isn't listed" (Không thấy máy in tôi cần trong danh sách) như Hình 5.14 để mở cửa sổ tìm máy in mạng. Trên cửa sổ tìm máy in mạng có một số lựa chọn như Hình 5.15 nhưng đơn giản nhất là nháy chuột chọn nút Browse để tìm máy in.

### Hình ảnh mô tả
- **Hình 5.14**: Mở cửa sổ tìm máy in mạng
- **Hình 5.15**: Tìm các máy in mạng

```plaintext
Printers &#x26; scanners                                 Find a printer by other options
My printer is little older: Help me find it.
Select a shared printer by name
Add printer or scanner                         Refresh                                                                       Browse

The printer that I want isn't listed    Add manually                Example:    computername\printername or
http://computername/printers/printername    Add printer using an IP address or hostname
Add Bluetooth, wireless or network discoverable printer
Add local printer or network printer with manual settings
```

Sau khi nháy nút Browse, các máy tính trong mạng được hiển thị như Hình 5.16. Nháy chuột vào máy tính chia sẻ máy in, ví dụ MAY_1. Danh sách các máy in của máy tính đó sẽ hiện ra trong khung bên phải.

### Hình ảnh mô tả
- **Hình 5.16**: Duyệt các máy tính trên mạng bằng Browser rồi tìm máy in mạng

```plaintext
SYSTEM (C)
DỮ LIỆU (D:)
CỔNG VIỆC (F:)
MULTIMEDIA (G:)
NETWORK
MAY_
MAY_2
MAY_3
Printer Máy in mạng Canon LBP2900
Select      Cancel
```

**Bước 2. Thêm máy in mạng**
Khi thấy máy in cần kết nối thì chọn tên máy in và nháy chuột vào Select (chọn). Hộp thoại như Hình 5.17 xuất hiện để xác nhận việc thiết lập máy in mạng trên máy tính. Chọn Next để chuyển sang công việc tiếp theo.

## Bài tập và câu hỏi
1. Giải thích tại sao nên đặt lại tên máy in cho dễ nhận biết.
2. Mô tả các bước để tìm và kết nối với máy in mạng từ một máy tính khác.
3. Hãy nêu các lựa chọn có trong cửa sổ tìm máy in mạng.

## Bảng biểu
| Tên máy in         | Trạng thái         |
|--------------------|--------------------|
| Canon LBP2900      | Đã chia sẻ         |
| HP LaserJet 1020   | Chưa chia sẻ       |
| Brother HL-2270DW  | Đã chia sẻ         |

### Hình ảnh mô tả
- **Hình 5.17**: Hộp thoại xác nhận thiết lập máy in mạng.



# Bài học: Cài đặt và sử dụng máy in mạng

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách cài đặt và sử dụng máy in mạng. Việc kết nối máy in với mạng giúp nhiều người dùng có thể sử dụng chung một máy in mà không cần phải kết nối trực tiếp với máy tính.

### Bước 1: Cài đặt máy in
Để cài đặt máy in mạng, bạn cần thực hiện các bước sau:
1. Kết nối máy in với mạng.
2. Cài đặt driver cho máy in.
3. Xác nhận việc cài đặt thành công.

### Bước 2: Xác nhận cài đặt
Sau khi cài đặt, bạn sẽ nhận được thông báo xác nhận như sau:
- "You've successfully added Canon LBP2900 on MAY_1"
- "Printer name: Canon LBP2900 on MAY1"
- "This printer has been installed with the Canon LBP2500 driver."

![Hình 5.17. Xác nhận thiết lập máy in mạng thành công](#)

### Bước 3: Sử dụng máy in mạng
Sau khi kết nối với máy in mạng, hãy mở ứng dụng soạn thảo văn bản rồi in một trang văn bản bằng máy in mạng.

![Hình 5.18. Chọn máy in mạng khi in](#)

## Ví dụ minh họa
Khi bạn mở ứng dụng in, bạn sẽ thấy danh sách các máy in có sẵn. Chọn máy in mạng mà bạn đã cài đặt để thực hiện việc in ấn.

## Bài tập và câu hỏi
1. Lập các nhóm; mỗi nhóm hai máy tính (gọi là máy A và máy B) thực hành chia sẻ thư mục. Trên mỗi máy tính, hãy tạo một thư mục có ít nhất một thư mục con và một số tệp văn bản:
a) Máy A chia sẻ tệp và thư mục với quyền read. Máy B kiểm tra lại việc sử dụng các tệp chia sẻ để thấy có thể đọc nhưng không thể sửa.
b) Máy A thiết lập lại chế độ chia sẻ với quyền read/write. Máy B kiểm tra lại việc sử dụng các tệp chia sẻ để thấy có thể đọc và sửa được.
c) Máy A hủy bỏ chia sẻ. Máy B kiểm tra để thấy rằng không còn được chia sẻ.
d) Đảo vai trò, máy B thực hiện các chế độ chia sẻ và máy A kiểm tra.

2. Thực hành chia sẻ máy in theo từng cặp hai nhóm học sinh: Nhóm 1 chia sẻ máy in để nhóm 2 sử dụng; sau đó đổi lại vai trò.

## Ghi chú về hình ảnh
- Hình 5.17: Xác nhận thiết lập máy in mạng thành công.
- Hình 5.18: Chọn máy in mạng khi in.

## Bảng biểu
Về phương diện lưu trữ, có thể coi toàn bộ một đĩa là thư mục lớn nhất chứa các thư mục khác. Có thể chia sẻ toàn bộ đĩa giống như chia sẻ thư mục. Để chia sẻ đĩa, cần nháy nút phải chuột vào biểu tượng đĩa, chọn Properties rồi thực hiện chia sẻ. Hãy tìm hiểu và thực hiện việc chia sẻ toàn bộ một đĩa.
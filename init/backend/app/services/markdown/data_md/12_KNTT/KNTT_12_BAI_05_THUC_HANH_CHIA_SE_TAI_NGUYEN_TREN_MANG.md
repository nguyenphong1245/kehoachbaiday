# BÀI 5 THỰC HÀNH CHIA SẺ TÀI NGUYÊN TRÊN MẠNG

## SAU BÀI HỌC NÀY EM SẼ:
- Biết cách chia sẻ tài nguyên tệp và máy in trong mạng cục bộ.

Tài nguyên của một máy tính trên mạng có thể là dữ liệu, phần mềm hay thiết bị. Chia sẻ tài nguyên trên mạng cục bộ là cho phép một người từ một máy tính có thể "nhìn thấy" và sử dụng tài nguyên trên một máy tính khác trong mạng. Việc chia sẻ có thể gây rủi ro như dữ liệu có thể bị truy cập với mục đích xấu hay bị làm hỏng bởi một người dùng trên mạng. Vì thế, luôn cần các cơ chế bảo mật và cấp phép khi chia sẻ tài nguyên. Chúng ta sẽ tìm hiểu điều này được thực hiện như thế nào trong mạng cục bộ gồm các máy tính chạy hệ điều hành Windows, hệ điều hành phổ biến nhất hiện nay.

## 1. CHIA SẺ TỆP VÀ THƯ MỤC TRÊN MẠNG CỤC BỘ

### Hoạt động 1: Điều kiện cần để chia sẻ tài nguyên trên mạng
Để hai máy tính có thể chia sẻ tài nguyên qua mạng cục bộ cần những điều kiện nào sau đây?
- A. Kết nối hai máy tính với nhau qua mạng.
- B. Người chia sẻ và người được chia sẻ phải "kết bạn" với nhau; tương tự như trên mạng xã hội.
- C. Người được chia sẻ phải đề xuất yêu cầu và trả phí truy cập tài nguyên; cấp quyền truy cập tài nguyên; chẳng hạn được xem, được sửa, được xoá.

Chia sẻ tài nguyên trong mạng cục bộ là công việc có tính kỹ thuật, phục vụ cho công việc nội bộ của tổ chức sở hữu mạng cục bộ đó. Vì thế không có yêu cầu "kết bạn" hay "trả phí". Chia sẻ tài nguyên được thực hiện theo yêu cầu công việc và cần được người chủ tài nguyên cấp phép thông qua các biện pháp kỹ thuật thực hiện trên hệ điều hành.

Windows có nhiều phương thức chia sẻ tài nguyên giữa các máy tính kết nối với nhau qua mạng, có dây hoặc không dây; trong mạng cục bộ hoặc qua Internet: chia sẻ qua tương tác gần khi phát hiện máy tính hay thiết bị ở gần; chia sẻ qua tài khoản của Microsoft; chia sẻ qua ứng dụng, chia sẻ qua đám mây hay chia sẻ qua ủy nhiệm cho một tài khoản nào đó. Sau đây chúng ta sẽ tìm hiểu cách chia sẻ hai loại tài nguyên thường gặp là chia sẻ tệp và máy in được thiết kế sẵn trong hệ điều hành.



# Nhiệm vụ 1: Thiết lập môi trường chia sẻ tệp và máy in trong mạng

## Yêu cầu:
Thiết lập được môi trường chia sẻ tệp và máy in.

Các phiên bản sau này của Windows đều được kiểm soát chặt chẽ về an ninh nên trước khi chia sẻ dữ liệu cần phải nới lỏng các hạn chế. Môi trường thuận lợi để có thể chia sẻ tệp và máy in trong mạng là:

- **Thiết lập chế độ mạng riêng**: Windows từ phiên bản 10 cho phép cài đặt mạng riêng (Private) hoặc mạng công cộng (Public). Mạng công cộng thường được thiết lập ở những địa điểm công cộng như nhà ga sân bay, quán cà phê với mục đích hạn chế nguy cơ lộ thông tin. Mạng riêng được hiểu là mạng của nhóm người dùng có độ tin cậy cao hơn; có thể chia sẻ tài nguyên với nhau.

- **Thiết lập cho phép các máy khác nhìn thấy (discoverable)** và cho phép chia sẻ tệp và máy in (file and printer sharing).

- **Tắt tạm thời tường lửa (firewall)**: Tường lửa là phần mềm dùng để kiểm soát truy cập máy tính từ bên ngoài nhằm ngăn ngừa các nguy cơ xâm nhập; tấn công từ bên ngoài như từ Internet. Tường lửa không chặn việc truy cập tài nguyên nếu người sử dụng được đánh giá là tin cậy, ví dụ khi người dùng được cấp tài khoản truy cập trên máy tính có tài nguyên. Dù vậy, để việc chia sẻ tài nguyên thuận lợi, nên tạm dừng hoạt động của tường lửa trong thời gian chia sẻ. Ở Windows 10 và 11, tường lửa Defender mặc định được kích hoạt.

> **Lưu ý**: Các hình ảnh minh hoạ đều sử dụng giao diện trên hệ điều hành phiên bản thấp hơn có thể có giao diện khác.

## Hướng dẫn:

### Bước 1: Mở chức năng thiết lập chia sẻ nâng cao
Hãy truy cập chức năng Advanced Sharing Settings từ Control Panel theo các bước:

1. Control Panel
2. Network and Internet
3. Network and Sharing Center
4. Advanced Sharing Settings.

![Hình 5.1. Thiết lập chế độ chia sẻ nâng cao](#)

Trong hộp thoại Advanced sharing settings, hãy kéo con trượt Network discovery và File and printer sharing sang vị trí On bên phải (Hình 5.1) để cho phép các máy tính khác trong mạng "nhìn thấy" máy tính này; đồng thời cho phép chia sẻ tệp và máy in. Khi được nhìn thấy, tên máy sẽ xuất hiện trên giao diện của File Browser (Hình 5.2).



# Bước 2. Thiết lập chia sẻ thư mục công cộng

This PC
Windows thiết lập sẵn ở mỗi máy tính trong Windows (C:) thư mục Public (This PC > System (C) > Users > Public) các thư mục con như sau:
- Public Documents
- Public Downloads
- Public Music
- Public Pictures
- Public Videos

Trong giao diện ở Hình 5.1, hãy chọn biểu tượng phía bên phải All networks để mở ra giao diện như Hình 5.3.

Dữ liệu trong thư mục Public được mặc định là không chia sẻ, nhưng nếu trong mục Public folder sharing (Chia sẻ thư mục công cộng) được bật (On) như Hình 5.3 thì mọi người dùng trên mạng có thể nhìn thấy toàn bộ những gì có trong thư mục Public.

## Bước 3. Dừng tạm thời tường lửa

Hãy nháy chuột vào dòng chữ Privacy and Security (Riêng tư và an ninh), sau đó thực hiện dãy truy cập:
Privacy and Security > Windows Security > FireWall > Network Protection > Private Network

Giao diện Private Network như trong Hình 5.4, kéo con trượt của Microsoft Defender Firewall về trạng thái Off. Khi được yêu cầu xác nhận "Do you want to allow this app to make change to your device?" (Bạn có cho phép ứng dụng này thay đổi thiết bị của bạn không?) với mặc định là "No" thì hãy chọn "Yes" để cho phép.

## Nhiệm vụ 2: Chia sẻ tệp và thư mục

**Yêu cầu:** Chia sẻ được tệp và thư mục.
**Hướng dẫn:** Mở ứng dụng quản lí tệp File Explorer; nháy chuột vào Network ở phía dưới bên trái cửa sổ. Danh sách những máy tính tham gia mạng cục bộ hiển thị như Hình 5.2.

Chẳng hạn; cần chia sẻ thư mục SÁCH LỚP 12 trên MAY_1 cho tất cả người dùng trong mạng; các bước thực hiện như sau:
### Bước 1
Trên MAY_1, tìm thư mục SÁCH LỚP 12, nháy nút phải chuột lên biểu tượng thư mục SÁCH LỚP 12 để mở bảng chọn các công việc có thể thực hiện được với thư mục này. Chọn Properties (Thuộc tính) để mở cửa sổ Properties như Hình 5.5.



# Sách Lớp 12

## Properties

### Network File and Folder Sharing

- **Type:** File/Folder
- **Location:** DISACH GIAO KHOA THPT
- **Size:** 25.7 MB (26,598,833 bytes)
- **Size on disk:** 25.8 MB (27,115,520 bytes)
- **Contains:** 66 Files, Folders

### Advanced Sharing

- **Created:** InargChin 20226 19:44 SA
- **Password Protection:** User account and password for this computer
- **People Must Have Access to Shared Folders**
- **Attributes:**
- Read-only (Only applies to files)
- Hidden

### Buttons
- **Cancel**
- **Apply**

----

### Hình 5.5. Cửa sổ Properties
### Hình 5.6. Cửa sổ thiết lập chia sẻ

**Bước 2:** Trong cửa sổ Properties, nháy chuột vào **Sharing (Chia sẻ)** để chia sẻ thư mục. Giao diện thiết lập chia sẻ như Hình 5.6, trong đó có các mục **Network File and Folder Sharing** (chia sẻ tệp thư mục trên mạng), **Advanced Sharing** (chia sẻ nâng cao) và **Password Protection** (bảo vệ bằng mật khẩu).

Nháy chuột vào **Share** để mở cửa sổ thiết lập người được chia sẻ và thiết lập quyền truy cập như Hình 5.7 và Hình 5.8.

----

### Choose people to share with

- **Type name and then click Add or click the arrow to find someone**

| Ado | Name                                 | Permission Level |
|-----|--------------------------------------|------------------|
| user1 | Dao Kien Quoc (dkquoc@gmail.com) | nr               |
| user12 | Everyone                           | Read             |
| Everyone |                               | Read Write       |

- **Create a new User**
- **Remove**

### Buttons
- **Share**
- **Cancel**

----

### Hình 5.7. Thiết lập người được chia sẻ
### Hình 5.8. Thiết lập quyền truy cập

**Bước 3:** Thiết lập chế độ chia sẻ. Trong cửa sổ như Hình 5.7, nháy chuột vào nút để mở ra danh sách người dùng. Lưu ý: trên một máy tính có thể có nhiều người dùng; ví dụ user11, user12.

Chọn một người dùng trong danh sách rồi chọn **Add (Thêm)** để chia sẻ thư mục với người dùng này. Cũng có thể tạo một người dùng mới để chia sẻ bằng cách chọn **Create a new user**. Trong bài này, chỉ giới hạn chia sẻ cho tất cả người dùng (Everyone). Chọn **Everyone** sau đó chọn **Add** để thêm vào danh sách người được chia sẻ.

**Everyone** được thêm vào danh sách người dùng mặc định có quyền (Permission Level) là chỉ được đọc dữ liệu (read). Quyền read chỉ cho phép xem mà không được sửa (write). Nếu muốn người dùng có quyền sửa thì nháy chuột vào hình tam giác nhỏ **Read** rồi chọn **Read/Write** để chỉ định quyền cả đọc và sửa. Chọn **Remove** để huỷ chia sẻ đối với người dùng này.



# SÁCH LỚP 12

## Chia sẻ thư mục

Sau khi hoàn tất danh sách người dùng được chia sẻ, hãy nháy chuột vào nút **Share** để hoàn tất thiết lập chia sẻ.

### Bước 4: Truy cập tệp và thư mục được chia sẻ ở máy khác trong mạng.

Một thư mục khi đã được chia sẻ cho mọi người thì các máy khác khi duyệt thư mục bằng File Explorer đều nhìn thấy: Nháy đúp chuột vào biểu tượng của một máy (ví dụ **MAY_1**) sẽ thấy tất cả các thư mục đã chia sẻ (Hình 5.9). Biểu tượng của các thư mục được chia sẻ có hình chữ nhật màu xanh; tượng trưng cho dây cáp mạng; cho biết đó là thư mục trên một máy tính khác trên mạng: Nháy đúp chuột vào thư mục để mở và xem các tệp và thư mục con trong đó.

Khi quyền là **read** thì chỉ xem được mà không sửa được. Người dùng có thể làm việc với thư mục và tệp trên mạng bình thường như trên máy tính riêng. Chia sẻ thư mục cũng có thể được coi như chia sẻ thiết bị lưu trữ.

Em hãy mở thư mục chia sẻ và làm việc với các tệp bên trong đó.

## Nhiệm vụ 3: Huỷ bỏ chia sẻ thư mục

### Yêu cầu:
Huỷ bỏ được chia sẻ thư mục.

### Hướng dẫn:
Để huỷ bỏ chia sẻ thư mục, thực hiện theo các bước sau:

1. **Bước 1:** Chọn thư mục cần huỷ bỏ chia sẻ, lần lượt thực hiện các bước tương tự như khi chia sẻ ở Hình 5.5 và Hình 5.6. Sau đó nháy chuột chọn nút **Advanced Sharing** để mở cửa sổ như Hình 5.10.

2. **Bước 2:** Huỷ chia sẻ

Trong cửa sổ **Advanced Sharing**; nếu thư mục đang được chia sẻ thì sẽ có dấu tích ở **Share this folder**. Nếu muốn huỷ bỏ chia sẻ thì nháy chuột vào ô đó để huỷ dấu tích. Sau đó nháy chuột chọn **OK** hoặc **Apply**.

![Hình 5.10. Huỷ bỏ việc chia sẻ](#)

## 2. CHIA SẺ MÁY IN

### Hoạt động 2: Lợi ích của việc chia sẻ máy in là gì?

Trong phòng làm việc của một cơ quan, các máy tính đều được kết nối trong một LAN. Chỉ có một máy in nối với một máy tính nhưng mọi máy tính đều có thể in được bằng máy in này. Như vậy máy in có thể chia sẻ được. Hãy thảo luận xem việc chia sẻ máy in có lợi gì.



# Chia Sẻ Máy In

Nếu máy in không được chia sẻ qua mạng thì mỗi khi cần in phải sao chép dữ liệu đem sang máy tính có máy in. Máy tính cung cấp dịch vụ in sẽ nhận yêu cầu gửi đến từ các máy tính khác trong mạng, xếp thành hàng đợi. Khi máy in sẵn sàng, máy tính cung cấp dịch vụ in sẽ điều khiển máy in in lần lượt các tài liệu được gửi tới. Như vậy, việc chia sẻ máy in thực chất là biến máy tính có máy in đó thành một máy chủ cung cấp dịch vụ in (Print Server).

Để chia sẻ máy in, cần có hai điều kiện sau:
- Thiết lập máy tính cung cấp dịch vụ in trên mạng. Máy in kết nối với máy tính này sẽ trở thành máy in chung trên mạng hay gọi là máy in mạng.
- Máy tính cung cấp dịch vụ in phải cài đặt máy in mạng một cách bình thường như cài đặt máy in riêng; sau đó thiết lập chế độ chia sẻ. Còn các máy tính khác chỉ cần khai báo sử dụng máy in mạng.

## Nhiệm vụ 4: Chia sẻ máy in

### a) Thiết lập máy cung cấp dịch vụ in

**Bước 1:** Từ giao diện của Control Panel, thực hiện dãy truy cập đến giao diện Printers &#x26; scanners (Hình 5.11):

```
Control Panel
Add printer or scanner
Add device
Hardware and Sound
View devices and printers
Printers &#x26; scanners
```

**Bước 2:** Chọn máy in mạng

Nháy chuột vào tên máy in muốn chia sẻ, ví dụ máy Canon LBP2900.

**Hình 5.11. Chọn máy in để chia sẻ**

**Bước 3:** Thiết lập máy in mạng.

Khi cửa sổ như Hình 5.12 mở ra, nháy chuột chọn **Set as default** để đặt máy in thành mặc định.

```
Canon LBP2900 Properties
General | Sharing | Ports | Governance | Color Management | Security | Device Settings | Profile
If you share this printer, any user on your network can print to
The printer will not be available when the computer sleeps
To change these settings use the Network and Sharing Center
Share this printer
Set as default | Remove
Share name: Máy in mạng Canon LBP2900
Printer settings
Render print jobs on client computers
Open print queue
Drivers
Print test page
If this printer is shared with users running different versions of Windows you may need to install additional drivers, so that the users do not have trouble finding the print driver when they connect to the shared printer.
Run the troubleshooter
Printer properties
Additional Drivers
Cancel | Apply
Printing preferences
Orientation | Page order: pages per sheet | Borders | Paper source
```

**Hình 5.12. Thiết lập máy in mặc định và chia sẻ**

**Hình 5.13. Chia sẻ máy in**

**Bước 4:** Chọn **Printer properties** để mở cửa sổ thiết lập chia sẻ.

**Bước 5:** Chia sẻ máy in.

Trong cửa sổ Properties của máy in đã chọn (Hình 5.13), chọn **Sharing** để chia sẻ máy in.



# Hướng dẫn kết nối máy in mạng

Để người dùng trên mạng dễ nhận biết, nên đặt lại tên máy in gợi nhớ, chẳng hạn thay vì tên mặc định là "Canon LBP2900" có thể đặt là "Máy in mạng Canon LBP2900". Chọn OK và Apply để xác nhận máy in được chia sẻ, khi đó máy tính trở thành máy cung cấp dịch vụ in.

## b) Kết nối với máy in mạng từ các máy tính khác

### Bước 1. Tìm máy in mạng.

Hãy thực hiện Bước như phần thiết lập máy cung cấp dịch vụ in. Ở giao diện như Hình 5.11, chọn **Add device**; khi đó nút này chuyển thành **Refresh** (làm mới danh sách).

Nếu trong danh sách không thấy máy in mạng muốn kết nối thì nháy chuột vào **The printer that I want isn't listed** (Không thấy máy in tôi cần trong danh sách) như Hình 5.14 để mở cửa sổ tìm máy in mạng. Trên cửa sổ tìm máy in mạng có một số lựa chọn như Hình 5.15 nhưng đơn giản nhất là nháy chuột chọn nút **Browse** để tìm máy in.

```
Printers &#x26; scanners
Find a printer by other options
My printer is little older: Help me find it.
Select a shared printer by name
Add printer or scanner                         Refresh                                                                       Browse

The printer that I want isn't listed    Add manually                Example: computername\printername or
http://computername/printers/printername
Add printer using an IP address or hostname
Add Bluetooth, wireless or network discoverable printer
Add local printer or network printer with manual settings

Net               Cancel
```

**Hình 5.14. Mở cửa sổ tìm máy in mạng**

Sau khi nháy nút **Browse**, các máy tính trong mạng được hiển thị như Hình 5.16. Nháy chuột vào máy tính chia sẻ máy in, ví dụ **MAY_1**. Danh sách các máy in của máy tính đó sẽ hiện ra trong khung bên phải.

```
| SYSTEM (C)         | DỮ LIỆU (D:)         | Máy in mạng Canon LBP2900 |
|---------------------|---------------------|-----------------------------|
| CỔNG VIỆC (F:)      | MULTIMEDIA (G:)     |                             |
|                     |                     |                             |
| MAY_1               |                     |                             |
| MAY_2               |                     |                             |
| MAY_3               |                     |                             |
| Printer Máy in mạng Canon LBP2900 | Select | Cancel |
```

**Hình 5.16. Duyệt các máy tính trên mạng bằng Browser rồi tìm máy in mạng**

### Bước 2. Thêm máy in mạng

Khi thấy máy in cần kết nối thì chọn tên máy in và nháy chuột vào **Select** (chọn). Hộp thoại như Hình 5.17 xuất hiện để xác nhận việc thiết lập máy in mạng trên máy tính. Chọn **Next** để chuyển sang công việc tiếp theo.



# Add Printer
You've successfully added Canon LBP2900 on MAY_1
Printer name: Canon BP2900 on MAY1
This printer has been installed with the Canon LBP2500 driver.

----

**Hình 5.17. Xác nhận thiết lập máy in mạng thành công**

## Bước 3. Sử dụng máy in mạng
Sau khi kết nối với máy in mạng, hãy mở ứng dụng soạn thảo văn bản rồi in một trang văn bản bằng máy in mạng (Hình 5.18).

----

**Hình 5.18. Chọn máy in mạng khi in**

- Printer: Canon LBP2900 on HPQUOC (Offline)
- Canon LBP2900 on HPQUOC (Offline)
- HP LaserJet MFP M129-M134 PCLm-S (Network) (Offline)
- Microsoft Print to PDF (Ready)

----

## LUYÊN TÂP
1. Lập các nhóm; mỗi nhóm hai máy tính (gọi là máy A và máy B) thực hành chia sẻ thư mục. Trên mỗi máy tính, hãy tạo một thư mục; có ít nhất một thư mục con và một số tệp văn bản:
a) Máy A chia sẻ tệp và thư mục với quyền read. Máy B kiểm tra lại việc sử dụng các tệp chia sẻ để thấy có thể đọc nhưng không thể sửa.
b) Máy A thiết lập lại chế độ chia sẻ với quyền read/write. Máy B kiểm tra lại việc sử dụng các tệp chia sẻ để thấy có thể đọc và sửa được.
c) Máy A huỷ bỏ chia sẻ. Máy B kiểm tra để thấy rằng không còn được chia sẻ.
d) Đảo vai trò, máy B thực hiện các chế độ chia sẻ và máy A kiểm tra.

2. Thực hành chia sẻ máy in theo từng cặp hai nhóm học sinh: Nhóm 1 chia sẻ máy in để nhóm 2 sử dụng; sau đó đổi lại vai trò.

----

## VÂN DUNG
Về phương diện lưu trữ, có thể coi toàn bộ một đĩa là thư mục lớn nhất chứa các thư mục khác. Có thể chia sẻ toàn bộ đĩa giống như chia sẻ thư mục.
Để chia sẻ đĩa cần nháy nút phải chuột vào biểu tượng đĩa, chọn Properties rồi thực hiện chia sẻ. Hãy tìm hiểu và thực hiện việc chia sẻ toàn bộ một đĩa.
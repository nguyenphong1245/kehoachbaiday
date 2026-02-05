# Giới thiệu các hệ cơ sở dữ liệu

## Lưu trữ dữ liệu và khai thác thông tin phục vụ quản lí

### Sau bài học này em sẽ:
- Biết được sự cần thiết phải lưu trữ dữ liệu và khai thác thông tin từ dữ liệu lưu trữ cho các bài toán quản lí.

Các công việc quản lí trong thực tế rất đa dạng: quản lí nhân viên; tài chính; thiết bị, tại các cơ quan; tổ chức; quản lí chỗ ngồi trên các chuyến bay; tàu xe tại các phòng bán vé; quản lí hồ sơ bệnh án tại bệnh viện; quản lí học sinh và kết quả học tập trong các trường.

Để quản lí kết quả học tập, như em biết; phải quản lí điểm của từng môn học bao gồm điểm đánh giá (ĐĐG) thường xuyên; ĐĐG giữa kì; ĐĐG cuối kì. Theo em, hoạt động này có cần lưu trữ dữ liệu không? Nếu có, đó là những dữ liệu gì?

### 1. Cập nhật dữ liệu
Hoạt động: Thao luận về ghi chép điểm môn học

Giáo viên dạy môn Toán dùng cuốn sổ điểm môn học để ghi lại điểm của từng học sinh lớp 11A (Bảng 10.1); Hãy cùng thảo luận để xác định xem có thể khai thác được những thông tin gì từ sổ điểm môn học này: Ngoài việc ghi điểm vào sổ điểm; có thể có những công việc nào khác?

Việc ghi điểm vào sổ điểm được thực hiện thường xuyên; mỗi khi có ĐĐG thường xuyên; giữa kì hay cuối kì. Việc ghi chép này được gọi là lưu trữ dữ liệu điểm.

#### Bảng 10.1. Bảng điểm môn Toán lớp 11A (học kì I)

| StT | Họ và tên         | ĐĐG thường xuyên | ĐĐG giữa kì | ĐĐG cuối kì |
|-----|-------------------|------------------|--------------|--------------|
| 1   | Dương Hồng Anh    |                  |              |              |
| 2   | Lương Việt Anh    |                  |              |              |
| 3   | Nguyễn Kì Duyên   | 10               |              |              |
| 4   | Bùi Quý Dương     |                  |              |              |
| 5   | Đỗ Hồng Dương     |                  |              |              |

Việc ghi chép điểm có thể có sai sót, nhầm lẫn. Vì vậy:
- Có thể phải xoá một dữ liệu điểm. Chẳng hạn xoá điểm 0 trong điểm đánh giá thường xuyên của Nguyễn Kì Duyên vì nghỉ học có lí do.
- Có thể phải sửa một dữ liệu nào đó. Chẳng hạn trong danh sách có tên Dương Hồng Anh nhưng thực tế tên chính xác phải là Dương Hoàng Anh.



# Bài học: Cập nhật và truy xuất dữ liệu

## Nội dung lý thuyết

Việc thêm, xoá và chỉnh sửa dữ liệu tương tự như trên là những công việc thường được thực hiện với dữ liệu của tất cả các bài toán quản lí và chúng được gọi chung là **cập nhật dữ liệu**.

### 1. Truy xuất dữ liệu và khai thác thông tin

Rõ ràng việc ghi chép điểm các môn học không chỉ nhằm mục đích lưu trữ. Từ dữ liệu lưu trữ này, có thể:
- Lập được danh sách học sinh với điểm học kì từ cao xuống thấp.
- Tìm kiếm và lập danh sách học sinh có điểm học kì >= 7, >= 8.

Việc tìm kiếm, sắp xếp hay lọc ra các dữ liệu theo những tiêu chí nào đó từ dữ liệu đã có thường được gọi là **truy xuất dữ liệu**.

Một ví dụ phức tạp hơn về truy xuất dữ liệu là lập bảng điểm cuối học kì (Bảng điểm lớp 11A) đòi hỏi ghép dữ liệu từ các bảng điểm môn học theo danh sách lớp.

## Ví dụ minh họa

### Danh sách lớp 11A
| STT | Họ và tên         |
|-----|-------------------|
| 1   | Dương Hoàng Anh   |
| 2   | Lương Việt Anh    |
| 3   | Nguyễn Kì Duyên   |

### Bảng điểm cuối kì môn Toán lớp 11A
| STT | Họ và tên         | ĐĐG cuối kì |
|-----|-------------------|--------------|
| 1   | Dương Hoàng Anh   | 10           |
| 2   | Lương Việt Anh    | 10           |
| 3   | Nguyễn Kì Duyên   | 10           |

### Bảng ĐĐG các môn cuối học kì lớp 11A
| STT | Họ và tên         | Toán | Tin học | Vật lý | Hóa học | Sinh học | Ngữ văn | Lịch sử | Địa lý |
|-----|-------------------|------|---------|--------|---------|----------|---------|---------|--------|
| 1   | Dương Hoàng Anh   | 10   | 10      | 10     |         |          |         |         |        |
| 2   | Lương Việt Anh    |      |         |        |         |          |         |         |        |
| 3   | Nguyễn Kì Duyên   | 10   | 10      | 10     |         |          |         |         |        |

## Hình ảnh mô tả
**Hình 10.1**. Ví dụ truy xuất dữ liệu

## Bài tập và câu hỏi
1. Hãy lập danh sách học sinh có điểm học kì >= 8 từ bảng điểm trên.
2. Trình bày cách thức thực hiện việc cập nhật dữ liệu cho bảng điểm môn Toán.
3. Giải thích ý nghĩa của việc truy xuất dữ liệu trong quản lý học sinh.



# Bài học: Khai thác thông tin từ dữ liệu

## Nội dung lý thuyết
Khai thác thông tin từ dữ liệu đã có là một công việc quan trọng trong nhiều lĩnh vực. Ví dụ, việc lập bảng phân loại kết quả học tập như Bảng 10.3 đòi hỏi phải phân tích, thống kê, tính toán từ dữ liệu đã có để có được thông tin cần thiết.

### Bảng 10.3. Thống kê kết quả trung bình năm học môn Toán
| STT | Phân loại   | Số lượng | Tỉ lệ  |
|-----|-------------|----------|--------|
| 1   | Giỏi       | 20%      |        |
| 2   | Khá        | 16       | 40%    |
| 3   | Trung bình  | 16       | 40%    |
| 4   | Yếu        | 0%       |        |

Từ bảng điểm của lớp 11A, có thể tìm kiếm hoặc thống kê theo các tiêu chí khác nhau để khai thác thông tin phục vụ đánh giá phân loại so sánh kết quả các môn học của lớp. Quản lý kết quả học tập của học sinh từ bảng điểm môn học đến bảng điểm chung của lớp chỉ là một ví dụ cho thấy nhu cầu lưu trữ dữ liệu và khai thác thông tin rất đa dạng.

Trong thực tế, nhiều lĩnh vực hoạt động khác, khối lượng dữ liệu được lưu trữ và khai thác thường xuyên lớn hơn rất nhiều, chẳng hạn ở bệnh viện là dữ liệu về các bệnh nhân đến khám chữa bệnh, các loại thuốc, vật tư y tế được mua, sử dụng; ở ngân hàng là dữ liệu về khách hàng, lượng tiền gửi vào, rút ra hàng ngày; ở các trung tâm dự báo thời tiết là các dữ liệu về những thay đổi nhiệt độ, độ ẩm, hướng và cường độ gió. Chính vì thế, ngày nay dữ liệu đã trở thành đối tượng nghiên cứu của một lĩnh vực khoa học liên ngành mới nổi đó là Khoa học dữ liệu.

Bài toán quản lý là bài toán biến trong thực tế. Cần tổ chức lưu trữ dữ liệu để phục vụ các yêu cầu quản lý đa dạng. Dữ liệu lưu trữ có thể được cập nhật thường xuyên và được truy xuất theo nhiều tiêu chí khác nhau để thu được các thông tin hữu ích.

### Câu hỏi
Cập nhật dữ liệu là gì? Tại sao dữ liệu cần được cập nhật thường xuyên?

## 3. THU THẬP DỮ LIỆU TỰ ĐỘNG
Hầu hết các hoạt động quản lý truyền thống đều phải nhập dữ liệu thủ công. Trong bối cảnh tự động hóa trên cơ sở máy tính, đặc biệt là sự xuất hiện của các hệ thống kết nối vạn vật (IoT) và Cách mạng Công nghiệp 4.0 nói chung, rất nhiều hoạt động quản lý đã thực hiện việc thu thập dữ liệu tự động.

### Hình ảnh mô tả
Hình 10.2. Mã vạch

----

**Ghi chú về hình ảnh:** Hình 10.2 mô tả mã vạch, một công cụ phổ biến trong việc thu thập dữ liệu tự động trong các hoạt động quản lý.



# Bài học: Quản lý dữ liệu trong kinh doanh

## Nội dung lý thuyết
Trong các siêu thị lớn, mỗi ngày có hàng nghìn khách mua hàng, nhiều người mua hàng chục mặt hàng trong số hàng trăm mặt hàng có trong siêu thị. Nếu nhập dữ liệu thủ công, sẽ mất nhiều thời gian cho mỗi đơn hàng, gây tắc nghẽn và giảm năng suất bán hàng. Để khắc phục tình trạng này, tại các quầy thanh toán, người ta đã tạo ra các mã vạch mang thông tin về mặt hàng dán trên bao bì. Tại các quầy thanh toán, người thu tiền không cần nhập dữ liệu; chỉ cần đưa hàng qua đầu đọc mã vạch. Đầu đọc sẽ đọc mã và gửi cho máy tính để lập đơn hàng. Toàn bộ dữ liệu về hàng hóa cùng doanh thu được lưu trữ tự động. Dựa trên các dữ liệu đó, máy tính sẽ giúp lập các báo cáo doanh thu, thống kê, tổng hợp, phân tích để cải thiện hoạt động kinh doanh, báo tồn kho (để đặt thêm hàng khi cần), lượng hàng tồn trên quầy (để bổ sung từ kho) và nhiều thông tin có ích khác để quản lý siêu thị.

Một ví dụ khác là việc lưu trữ chỉ số tiêu thụ điện: Người ta thay các đồng hồ đo điện với hộp số cơ khí trước đây bằng công tơ điện tử. Các công tơ điện tử có thể đều đặn gửi về công ty điện lực không chỉ lượng điện tiêu thụ mà còn cả các giá trị tức thời của điện áp, dòng, tần số và độ lệch pha. Với công tơ điện tử, nhân viên điện lực không cần phải ghi số thủ công hàng tháng rồi nhập vào máy tính, giảm bớt nhiều công sức làm hóa đơn tiền điện. Tuy nhiên, lợi ích lớn nhất mà ngành điện có được từ giải pháp này là có thể quản lý kỹ thuật qua phân tích dữ liệu từ các công tơ điện tử liên tục gửi về. Chẳng hạn, có thể biết khu vực nào đang mất điện, khu vực nào đang quá tải, để đưa ra những quyết định phù hợp.

Quản lý là hoạt động rất phổ biến. Mục đích chính của quản lý là xử lý thông tin để đưa ra các quyết định. Vì vậy, việc thu thập, lưu trữ dữ liệu có ý nghĩa quan trọng hàng đầu. Việc thu thập dữ liệu tự động mang lại nhiều lợi ích, không chỉ giảm bớt công sức thu thập mà còn cung cấp một khối lượng dữ liệu lớn giúp nâng cao hiệu quả của việc ra các quyết định cần thiết.

## Ví dụ minh họa
- **Ví dụ 1**: Tại siêu thị, việc sử dụng mã vạch giúp tiết kiệm thời gian thanh toán và quản lý hàng hóa hiệu quả hơn.
- **Ví dụ 2**: Công tơ điện tử giúp công ty điện lực theo dõi tiêu thụ điện và phát hiện sự cố nhanh chóng.

## Bài tập và câu hỏi
1. Quản lý điểm chỉ là một ứng dụng quản lý trong trường học. Hãy tìm thêm các nhu cầu quản lý khác trong nhà trường và chỉ ra hoạt động quản lý đó cần những dữ liệu nào.
2. Người ta thường nói, ở bất cứ nơi nào có một tổ chức là nơi ấy có nhu cầu quản lý. Hãy kể tên một vài bài toán quản lý mà em biết.

### Vận dụng
1. Hãy cho một ví dụ về một bài toán quản lý và nêu những dữ liệu mà hoạt động quản lý đó cần thu thập.
2. Tại các trạm bán xăng, việc thu thập dữ liệu về lượng xăng bán và doanh thu được thực hiện như thế nào?

## Hình ảnh mô tả
- **Hình ảnh 1**: Mã vạch trên sản phẩm tại siêu thị.
- **Hình ảnh 2**: Công tơ điện tử đang hoạt động.

## Bảng biểu
| Hoạt động quản lý | Dữ liệu cần thu thập |
|-------------------|----------------------|
| Quản lý hàng hóa  | Tên sản phẩm, mã vạch, số lượng, giá bán |
| Quản lý tiêu thụ điện | Lượng điện tiêu thụ, điện áp, dòng, tần số |
| Quản lý điểm học sinh | Điểm số, thông tin học sinh, môn học |

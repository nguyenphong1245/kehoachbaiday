# CHỦ ĐỀ: GIẢI QUYẾT VẤN ĐỀ

## GIỚI THIỆU CÁC HỆ QUẢN LÝ DỮ LIỆU

### Mục tiêu học tập
Học xong bài này, em sẽ:
- Nhận biết được nhu cầu lưu trữ dữ liệu và khai thác thông tin cho bài toán quản lý.
- Diễn đạt được khái niệm hệ cơ sở dữ liệu; nêu được ví dụ minh họa.

### Một số cụm từ liên quan
Có một số cụm từ mà em đã từng nghe và có thể em đã từng dùng, ví dụ:
- "Quản lý học sinh"
- "Quản lý nhân sự"
- "Quản lý chi tiêu cá nhân"

Theo em, có không? Hãy nêu một việc quản lý có liên quan đến việc lưu trữ và xử lý dữ liệu mà em đã làm để quản lý một hoạt động nào đó của mình.

## Bài toán quản lý
Có rất nhiều bài toán quản lý cho các tổ chức lớn, nhỏ khác nhau với mức độ phức tạp khác nhau và ngay cả mỗi cá nhân cũng có những câu quản lý của riêng mình. Quản lý là công việc rất phổ biến. Xã hội càng phát triển càng an minh thì nhu cầu và chất lượng quản lý các hoạt động càng cao.

Việc quản lý một tổ chức liên quan đến những dữ liệu phản ánh thông tin về hoạt động của tổ chức đó. Ví dụ: Dựa trên kết quả học tập của lớp mà giáo viên có thể đề xuất vào danh sách những em cần được bổ sung học sinh giỏi môn Tin học; hay khách sạn định có nhận cho khách thuê phòng hay không phụ thuộc vào thông tin về số phòng còn trống chưa ai thuê trong thời gian cụ thể đó. Trong hai ví dụ trên, dễ thấy rằng nếu thông tin không chính xác sẽ dẫn đến những hậu quả đáng tiếc.

Thông tin trong bài toán quản lý phải chính xác, kết quả xử lý thông tin phải đáng tin cậy để giúp có được quyết định đúng đắn.

## Xử lý thông tin trong bài toán quản lý
Các bài toán quản lý đều có chung đặc điểm là lưu trữ và xử lý dữ liệu về hoạt động của một tổ chức. Thông thường, "hồ sơ" được dùng để chỉ một tập hợp dữ liệu được tổ chức và thể hiện theo những khuôn mẫu nào đó. Xử lý thông tin trong bài toán quản lý bao gồm:
- Tạo lập hồ sơ
- Cập nhật và khai thác thông tin

----

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# a) Tạo lập hồ sơ

Ví dụ: Để quản lý việc học tập của một lớp, hồ sơ của lớp thường có cấu trúc dạng bảng dễ theo dõi như ở dưới đây:

## Bảng
### Ví dụ về hồ sơ học sinh của một lớp

| STT | Mã định danh | Họ và tên       | Ngày sinh   | Giới tính | Đoàn viên | Địa chỉ          | Toán | Ngữ văn | Tin học |
|-----|--------------|------------------|-------------|-----------|-----------|------------------|------|---------|---------|
| 1   | 13109413     | Phan Thùy Anh    | 29/10/2007  | Nữ       |           | 39 Hùng Vương    | 7.3  | 7.4     | 8.5     |
| 2   | 13109735     | Lê Minh Đức      | 05/09/2007  | Nam      |           | 15 Ván Cao       | 6.4  | 7.2     | 7.0     |
| 3   | 13124595     | Hoàng Giang      | 21/12/2007  | Nam      |           | 27 Lò Sũ         | 7.6  | 9.3     |         |
| 4   | 31387552     | Nguyễn Thị Hà    | 12/06/2007  | Nữ       |           | 29 Hàng Bún      | 7.1  | 6.5     | 8.4     |
| 5   | 13169292     | Trần Minh Tú     | 14/11/2007  | Nữ       |           | 18 Quán Thánh    | 7.8  | 6.5     |         |

Để phản ánh đúng thực tế, dữ liệu trong bảng phải đầy đủ và chính xác. Dữ liệu phải đầy đủ so với yêu cầu quản lý. Ví dụ, muốn quản lý thông tin mỗi học sinh đã là đoàn viên hay chưa, bảng hồ sơ của lớp cần có thêm cột ghi nhận thông tin này. Nếu sĩ số lớp là 45 thì bảng có 45 hàng dữ liệu.

Dữ liệu phải chính xác. Ví dụ không thể có hai hàng trong bảng giống hoàn toàn nhau ở họ tên, ngày sinh và địa chỉ, vì đó là dữ liệu trùng lặp hoặc không phân biệt được chính xác điểm của mỗi bạn trong hai bạn trùng tên đó. Những dữ liệu cần khi tạo lập hồ sơ cho mỗi bài toán quản lý phải xác định được lưu trữ, đồng thời dữ liệu nhập vào phải đúng đắn.

# b) Cập nhật dữ liệu

Dữ liệu được lưu trữ cần được cập nhật để phản ánh kịp thời những thay đổi diễn ra trên thực tế. Ví dụ, trong quản lý học tập của một lớp như ở việc làm sau đây là cập nhật dữ liệu: về địa chỉ "20 Chùa Bộc" cần sửa đổi dữ liệu. Học sinh Hoàng Giang vừa chuyển đến lớp. Cần bổ sung một hàng ghi dữ liệu cho học sinh Trần Anh Tuấn mới chuyển đến lớp. Nguyễn Thị Hà vì học sinh này đã chuyển đi.

Cần xóa dữ liệu của học sinh Trần do bố mẹ chuyển công tác về tỉnh khác. Cập nhật dữ liệu gồm các thao tác: thêm, sửa, xóa dữ liệu. Toàn bộ dữ liệu sau mỗi lần cập nhật cũng phải thoả mãn tính đầy đủ và đúng đắn.



# Khai thác thông tin

Mục đích của việc lưu trữ và cập nhật dữ liệu là để khai thác thông tin, phục vụ cho việc điều hành công việc và ra quyết định của người quản lý. Một số việc khai thác thông tin thường gặp là: tìm kiếm dữ liệu, thống kê, lập báo cáo.

## Tìm kiếm dữ liệu

Tìm kiếm dữ liệu là việc rút ra được các dữ liệu thỏa mãn một số điều kiện nào đó từ dữ liệu đã lưu trữ. Ví dụ: tìm họ và tên học sinh có điểm môn Tin học cao nhất.

## Thống kê

Thống kê là khai thác hồ sơ dựa trên tính toán để đưa ra các thông tin không có sẵn trong hồ sơ. Ví dụ: xác định điểm cao nhất và điểm thấp nhất của môn Tin học; xác định số học sinh là đoàn viên.

## Lập báo cáo

Lập báo cáo là sử dụng các kết quả tìm kiếm, thống kê, sắp xếp dữ liệu được thu thập ra để tạo lập một bộ hồ sơ mới có nội dung và cấu trúc theo một số yêu cầu cụ thể trong quản lý. Ví dụ: Hết mỗi học kỳ, giáo viên chủ nhiệm cần có một danh sách học sinh đề nghị nhà trường khen thưởng, cuối năm học cần báo cáo phân loại học tập để lên kế hoạch ôn tập hè cho lớp và trao đổi với phụ huynh về hưởng nghỉ hè cho các em.

Khai thác thông tin là để phục vụ kịp thời cho công tác quản lý. Do vậy, việc xử lý dữ liệu trong hồ sơ phải nhanh chóng, chính xác và thông tin kết xuất ra phải dễ hiểu.

# Cơ sở dữ liệu và phần mềm hệ quản trị cơ sở dữ liệu

Theo em, có nên dùng phần mềm soạn thảo văn bản hay phần mềm bảng tính để tạo lập hồ sơ, cập nhật và khai thác thông tin trong hồ sơ phục vụ công tác quản lý của một tổ chức hay không? Vì sao?

Ngày nay, với khả năng lưu trữ dữ liệu khổng lồ, tốc độ truy xuất và xử lý dữ liệu vô cùng nhanh, máy tính là công cụ hỗ trợ đắc lực cho con người trong mọi hoạt động thông tin. Tập hợp hồ sơ dữ liệu làm cơ sở cho việc quản lý các hoạt động của một tổ chức được số hóa để máy tính truy cập, cập nhật và xử lý, được gọi là một cơ sở dữ liệu (CSDL).

Để giúp tạo lập, cập nhật CSDL và khai thác thông tin trong CSDL, có loại phần mềm được gọi là hệ quản trị CSDL (Database Management System - DBMS).



# Hệ Quản Trị CSDL

Hệ quản trị CSDL là một hệ chương trình giúp người dùng tương tác với CSDL qua các giao diện dễ hiểu, dễ dùng (như hệ thống bảng chọn; hộp thoại, cú pháp biểu mẫu, báo cáo). Với CSDL, hệ quản trị CSDL là hệ thống chương trình truy cập được dữ liệu, chế kiểm soát nhằm đảm bảo tính đúng đắn cho mỗi thao tác cập nhật dữ liệu và khai thác dữ liệu.

Mỗi đơn vị, mỗi tổ chức có những yêu cầu riêng và cụ thể trong khai thác CSDL thể hiện qua các mẫu (giao diện) cập nhật dữ liệu, các mẫu tìm kiếm dữ liệu và báo cáo thường dùng. Hệ cơ sở dữ liệu của một đơn vị là cách gọi chung một tập hợp gồm: CSDL của đơn vị, hệ quản trị CSDL và các phần mềm ứng dụng có các giao diện tương tác với CSDL đáp ứng được nhu cầu quản lý của đơn vị đó.

Các phần mềm ứng dụng khác muốn sử dụng dữ liệu CSDL đều phải cung cấp môi trường thuận lợi và hiệu quả để tạo lập lưu trữ và khai thác dữ liệu của CSDL.

## Thực Hành

Thực hành tìm hiểu các yêu cầu của một bài toán quản lý và CSDL phục vụ bài toán đó.

### Em hãy hình dung việc quản lý thư viện của một trường học. Thảo luận với bạn và thực hiện các yêu cầu sau đây:

1. **Mô tả hoạt động của thư viện**
- Gợi ý: Cho mượn sách hoặc tra sách như thế nào? Căn cứ vào đâu để biết ai đã mượn trả sách? Căn cứ vào đâu để biết một quyển sách cụ thể đã được cho mượn và chưa được trả lần nào?

2. **Liệt kê những dữ liệu cần có trong CSDL**
- Gợi ý: Những đối tượng cần quản lý là người đọc, sách cho mượn.
- Với người đọc, cần quản lý thông tin gì? (Thông tin trên thẻ thư viện gồm: Số thẻ, Họ và tên)
- Với sách cho mượn, cần quản lý thông tin gì? (Thông tin về quyển sách gồm: Mã sách, Tên sách, Tác giả)

3. **Nêu ví dụ**
- Nêu thêm ít nhất hai ví dụ cho mỗi công việc sau đây:
- Cập nhật dữ liệu (cho CSDL):
- Ví dụ: Khi có thêm một học sinh làm thẻ thư viện, cần bổ sung một số thông tin của học sinh này vào CSDL.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Tìm kiếm dữ liệu

## Ví dụ 2
Tìm xem trong thư viện có quyển "Tôi tài giỏi, Bạn cũng khóng?

## Thống kê và báo cáo
### Ví dụ 3
Xác định trong thư viện có bao nhiêu quyển sách về Tin học (gia sư sách về Tin học sẽ có hai chữ cái đầu trong mã sách là "TIF").

Gia sư dùng một bảng để chứa dữ liệu thể hiện thông tin về những người được mượn sách ở thư viện (những người có thẻ thư viện). Em hãy chỉ ra một vài điều kiện cho dữ liệu trong bảng đó nhằm đảm bảo tính chính xác của thông tin. Theo em, nếu dùng một phần mềm bảng tính để tạo lập - lưu trữ bảng dữ liệu đó thì phần mềm bảng tính có lượng kiểm soát các cập nhật dữ liệu để đảm bảo được các điều kiện đã đặt ra hay không?

## Câu 1
Trong các câu sau, những câu nào đúng?
1. CSDL là tập hợp dữ liệu được lưu trữ trên thiết bị nhớ phục vụ cho hoạt động của một cơ quan đơn vị nào đó.
2. Hệ CSDL của một đơn vị là phần mềm quản trị CSDL của đơn vị đó.
3. Các giá trị dữ liệu được lưu trữ trong CSDL phải thoả mãn một số ràng buộc để góp phần đảm bảo được tính đúng đắn của thông tin.
4. Hệ quản trị CSDL là chương trình kiểm soát được các cập nhật dữ liệu.

### Những dung nào dưới đây cần có CSDL?
## Câu 2
Theo em, đúng:
a) Quản lý bán vé máy bay
b) Quản lý chi tiêu cá nhân
c) Quản lý cước phí điện thoại
d) Quản lý một mạng xã hội

## Tóm tắt bài học
Các tổ chức hoạt động trong xã hội đều có nhu cầu lưu trữ dữ liệu và khai thác thông tin cho bài toán quản lý. Muốn máy tính hỗ trợ đắc lực được cho công tác quản lý, dữ liệu của một đơn vị phải được tổ chức trong một CSDL với tính đầy đủ và đúng đắn. Phần mềm quản trị CSDL là loại phần mềm tạo ra một môi trường thuận lợi để tạo lập CSDL, cập nhật cho CSDL theo cách đúng đắn; đồng thời kiểm soát được các truy cập đến dữ liệu, đảm bảo tính chính xác và sự an toàn của dữ liệu.
# BÀI 15: BẢO MẬT VÀ AN TOÀN HỆ CƠ SỞ DỮ LIỆU

## SAU BÀI HỌC NÀY EM SẼ:
- Hiểu được tầm quan trọng và một số biện pháp bảo vệ hệ CSDL.

Mỗi hệ CSDL đều được xây dựng với mục đích xác định nhằm phục vụ một hệ thống quản lí như hệ thống bán vé máy bay, đặt chỗ khách sạn, quản lí bệnh án ở bệnh viện, quản lí kết quả học tập, quản lí website mạng xã hội. Từng có nhiều thông tin về việc những khối lượng lớn dữ liệu bị đánh cắp; những tài khoản người dùng mạng xã hội bị gán những phát biểu sai trái. Tình trạng này xảy ra một phần do các hệ CSDL liên quan chưa được bảo vệ đủ tốt. Cần phải làm gì để đảm bảo an ninh, an toàn cho các hệ CSDL?

## 1. BẢO MẬT HỆ CSDL

### Hoạt động 1: Tổ chức phân quyền truy cập website âm nhạc
Tất cả người dùng Internet đều có thể được tìm kiếm; được xem danh sách các bản nhạc theo tên bản nhạc, tên ca sĩ, tên nhạc sĩ mà không cần đăng nhập hệ thống. Ngoài ra, một số người dùng xác định có quyền nhập thêm dữ liệu về bản nhạc mới, nhạc sĩ mới và ca sĩ mới.

Theo các em, cần tổ chức phân quyền truy cập CSDL như thế nào để đáp ứng các yêu cầu trên? Việc lập danh sách và xác định quyền hạn các nhóm người dùng đối với hệ CSDL chính là công việc đầu tiên cần phải thực hiện để xây dựng chính sách bảo mật CSDL.

Trong trường hợp website âm nhạc, có thể thấy có bốn nhóm người dùng với quyền hạn khác nhau:
- **Nhóm 1**: Nhóm người dùng không cần khai báo, đăng nhập, được quyền chỉ tìm kiếm, xem, không có quyền cập nhật.
- **Nhóm 2**: Nhóm người dùng có quyền thêm vào CSDL các bản nhạc mới, tên nhạc sĩ, ca sĩ mới. Nhưng không có quyền xóa, sửa.
- **Nhóm 3**: Nhóm người dùng có quyền xóa, sửa dữ liệu trong các bảng của CSDL; nhưng không có quyền thay đổi cấu trúc bảng, không có quyền xóa bảng.
- **Nhóm 4**: Nhóm người dùng có toàn quyền đối với các bảng trong CSDL, chính là người dùng có quyền tạo lập các bảng của CSDL.

Người ta sẽ thiết lập một bảng `user` để quản lí những người có quyền đăng nhập website âm nhạc; bao gồm các cột: tên đăng nhập, mật khẩu và nhóm người dùng.



# Bài học: Quản lý quyền truy cập trong CSDL

## Nội dung lý thuyết
Mỗi khi người dùng đăng nhập vào website âm nhạc, hệ thống sẽ xác định họ thuộc nhóm người dùng nào: nhóm 2, 3 hay 4. Người dùng thuộc nhóm 2 không cần đăng nhập vào website âm nhạc. Tất cả người dùng Internet có thể tìm kiếm và xem danh sách các bản nhạc mà không cần đăng nhập. Hệ thống có thể tạo một tài khoản khách (guest) và cấp cho tài khoản này quyền SELECT đối với tất cả các bảng nhạc sĩ, ca sĩ, bản nhạc, bản thu âm. Tất cả người dùng khi vào xem website âm nhạc sẽ mặc nhiên được xem như truy xuất CSDL music với tài khoản guest.

Tiếp theo, có thể tạo một tài khoản, chẳng hạn là moderator và cấp quyền SELECT, INSERT đối với tất cả các bảng cho moderator. Tất cả những người dùng thuộc nhóm này có quyền nhập thêm dữ liệu về bản nhạc mới và ca sĩ mới, sau khi đăng nhập vào website âm nhạc sẽ truy xuất CSDL music với tài khoản này.

Đối với nhóm 3, có thể tạo tài khoản, chẳng hạn là master mod, có tất cả quyền SELECT, INSERT, UPDATE, DELETE đối với tất cả các bảng nhạc sĩ, ca sĩ, bản nhạc, bản thu âm trong CSDL music. Tất cả những người dùng thuộc nhóm này khi đăng nhập vào website âm nhạc sẽ dùng tài khoản master_mod để truy xuất, cập nhật CSDL.

Cuối cùng, tài khoản admin có toàn quyền đối với tất cả các bảng trong CSDL music cho người dùng thuộc nhóm 4.

## Bảng phân quyền truy cập

| Tài khoản đăng nhập website | Nhóm 2 (không cần tài khoản) | Nhóm 3 | Nhóm 4 | |
|------------------------------|-------------------------------|--------|--------|---|
| Tài khoản truy xuất          | guest                         | moderator | master_mod | admin |

Như vậy, các nhóm người dùng khác nhau đều có quyền truy xuất CSDL phù hợp, nhưng ngay cả người dùng có quyền cao nhất ở nhóm 4 cũng không thể can thiệp vào các CSDL khác được quản trị trong cùng hệ QTCSDL.

Tuy nhiên, việc đảm bảo an ninh CSDL còn phụ thuộc vào chính ý thức của người dùng. Nếu những người dùng thuộc các nhóm 2, 3 không bảo vệ quyền của mình, để lộ hay để người khác chiếm được tài khoản của mình thì giải pháp bảo mật theo hình thức phân quyền nói trên sẽ hạn chế tác dụng. Đối với những CSDL cần bảo mật như CSDL ngân hàng, chứng khoán, nếu người dùng tiết lộ thông tin truy cập thì dữ liệu cũng không còn được bảo mật.

Vì vậy, khi xây dựng chính sách bảo mật CSDL, cần phải bổ sung cả những nội dung liên quan đến ý thức và trách nhiệm của người dùng đối với tài khoản của mình cũng như đối với dữ liệu trong CSDL.

Khi một ứng dụng CSDL hoạt động, nó có thể trở thành một hệ thống với hàng nghìn, hàng trăm nghìn, thậm chí hàng triệu người truy cập đồng thời và trở nên phần nào giống như một hộp đen; người quản trị không thể biết được hết người dùng đang làm gì, các hoạt động đang diễn ra bên trong hệ thống ra sao, có điều gì bất ổn hay có nguy cơ nào rình rập hay không. Vì vậy, cũng cần có chính sách, với những kế hoạch cụ thể, tổ chức giám sát hoạt động của hệ thống: số người truy cập, tình trạng thiết bị, máy móc. Những truy xuất của người dùng có thể cần phải được lưu lại dưới dạng biên bản (thường gọi là log file) để khi cần có thể kiểm tra, phân tích. Phải xây dựng kế hoạch xử lý các tình huống dự tính có thể xảy ra.

## Ví dụ minh họa
- Tài khoản guest có thể xem danh sách các bản nhạc mà không cần đăng nhập.
- Tài khoản moderator có thể thêm bản nhạc mới vào CSDL.
- Tài khoản master_mod có thể cập nhật thông tin ca sĩ trong CSDL.
- Tài khoản admin có thể xóa bản nhạc khỏi CSDL.

## Bài tập và câu hỏi
1. Giải thích sự khác nhau giữa các nhóm người dùng trong hệ thống CSDL âm nhạc.
2. Tại sao việc bảo mật thông tin truy cập lại quan trọng trong quản lý CSDL?
3. Hãy nêu một số biện pháp để bảo vệ tài khoản người dùng trong CSDL.

## Hình ảnh mô tả
- Hình ảnh minh họa về cấu trúc quyền truy cập trong CSDL (ghi chú: hình ảnh này có thể bao gồm sơ đồ phân quyền giữa các nhóm người dùng).

## Bảng biểu
- Bảng phân quyền truy cập đã được trình bày ở trên.



# Bài học: Bảo mật cơ sở dữ liệu

## Nội dung lý thuyết
Cuối cùng, thống máy tính chứa CSDL được kết nối vào mạng cần chú ý khi hệ thống cần phải có kế hoạch cụ thể về các giải pháp an ninh mạng (cả về phần cứng và phần mềm) để chống lại các cuộc tấn công qua mạng.

Công tác bảo mật CSDL cần được thực hiện với một chính sách bảo mật toàn diện bao gồm:
- Quy định liên quan đến ý thức và trách nhiệm của người dùng đối với tài khoản của mình và dữ liệu trong CSDL.
- Quy định về tổ chức đảm bảo an ninh mạng cùng với hệ cứng và phần mềm cụ thể.
- Danh sách các nhóm người dùng và danh sách tài khoản truy xuất CSDL với quyền hạn tương ứng: hệ thống, người dùng.
- Biện pháp giám sát trạng thái hoạt động của hệ thống và kế hoạch xử lý những tình huống có thể xảy ra.

## Ví dụ minh họa
Nêu tóm tắt các quyền của các tài khoản moderator và admin.

## Bài tập và câu hỏi
1. Bảo đảm an toàn dữ liệu là việc đảm bảo để dữ liệu trong CSDL không bị sai lạc; mất mát khi hệ thống phần cứng; phần mềm gặp sự cố rủi ro. Hãy nêu một vài sự cố có thể xảy ra và cách hạn chế, khắc phục các sự cố này.

### a) Sự cố về nguồn điện
- Hệ thống cấp điện không đủ công suất:
- Giải pháp: Xây dựng hệ thống cấp điện đủ công suất.
- Hệ thống cấp điện bị quá tải do nhu cầu sử dụng điện tăng đột biến:
- Giải pháp: Thường xuyên kiểm tra hệ thống cấp điện; đặc biệt trong những thời gian nhu cầu sử dụng điện tăng vọt.
- Hệ thống cấp điện ngừng đột ngột vì những lý do khác:
- Giải pháp: Dùng bộ lưu điện để cấp điện ngay cho hệ thống máy tính quản trị CSDL khi mất điện đột ngột.

### b) Sự cố hư hỏng thiết bị lưu trữ
- Các thiết bị lưu trữ (ví dụ ổ đĩa cứng) có khả năng gặp sự cố. Khi đó, nói chung rất khó lấy lại được toàn bộ và chính xác dữ liệu trong thiết bị lưu trữ bị hỏng.
- Thiết bị lưu trữ bị hư hỏng vì quá tuổi thọ:
- Giải pháp: Quản lý thời gian sử dụng của thiết bị lưu trữ, thay thế trước khi thiết bị đến giai đoạn thường bị hư hỏng.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa cho các sự cố về nguồn điện và thiết bị lưu trữ có thể được sử dụng để làm rõ nội dung lý thuyết.)

## Bảng biểu
(Bảng biểu có thể được sử dụng để liệt kê các loại sự cố và giải pháp tương ứng, giúp người học dễ dàng theo dõi và ghi nhớ.)



# Bài học: Đảm bảo an toàn dữ liệu trong hệ quản trị cơ sở dữ liệu

## Nội dung lý thuyết
Thiết bị lưu trữ có thể bị hư hỏng vì nhiều lý do khác nhau. Giải pháp cho vấn đề này là thực hiện sao lưu dữ liệu định kỳ. Tất cả các hệ quản trị cơ sở dữ liệu (QTCSDL) đều hỗ trợ khả năng sao lưu toàn bộ dữ liệu ra thiết bị dự phòng. Các nhà sản xuất thiết bị lưu trữ cũng cung cấp những giải pháp để lưu trữ hai phiên bản dữ liệu và kiểm tra chéo để đảm bảo tính chính xác của dữ liệu.

Tóm lại, tùy theo những yêu cầu cụ thể của mỗi tổ chức và đặc điểm của cơ sở dữ liệu (CSDL), cần xây dựng những chính sách đảm bảo an toàn dữ liệu. Trong đó, cần quan tâm tới các sự cố có thể xảy ra và giải pháp hạn chế, khắc phục. Chính sách này cũng phải bao gồm những quy định về ý thức và trách nhiệm đối với những người vận hành hệ thống.

Để đảm bảo an toàn dữ liệu, cần xây dựng chính sách an toàn dữ liệu cùng kế hoạch xử lý các sự cố có thể xảy ra và giải pháp hạn chế, khắc phục. Chính sách an toàn dữ liệu cũng phải bao gồm những quy định về ý thức và trách nhiệm đối với người dùng và người vận hành hệ thống.

Các hệ QTCSDL đều hỗ trợ chức năng sao lưu định kỳ và phục hồi dữ liệu từ bản sao lưu gần nhất.

## Ví dụ minh họa
Vì sao cần sao lưu dữ liệu định kỳ?

## Bài tập và câu hỏi
1. Tại sao cần phải có những quy định về ý thức và trách nhiệm của người dùng đối với tài khoản của mình và dữ liệu trong CSDL?
2. Tại sao cần có những quy định về ý thức và trách nhiệm của những người vận hành hệ thống?

## Vận dụng
Một trung tâm dạy tiếng Anh có bốn giáo viên dạy bốn môn học là luyện nghe, luyện nói, luyện đọc, luyện viết. CSDL quản lý điểm học tập của học viên có các bảng "diemnghe", "diemnoi", "diemdoc", "diemviet". Các học viên được quyền chỉ xem các bảng điểm, các giáo viên được quyền thêm mới, cập nhật, xóa các bản ghi trong bảng điểm môn học mà họ dạy. Một người dùng có toàn quyền đối với cả các bảng trong CSDL. Hãy xây dựng mô hình phân nhóm người dùng truy cập CSDL nói trên.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa cho mô hình phân quyền trong CSDL có thể bao gồm sơ đồ phân nhóm người dùng và quyền truy cập tương ứng.)

## Bảng biểu
(Bảng biểu có thể bao gồm danh sách các quyền truy cập của từng nhóm người dùng trong CSDL, ví dụ như quyền xem, thêm mới, cập nhật, xóa.)
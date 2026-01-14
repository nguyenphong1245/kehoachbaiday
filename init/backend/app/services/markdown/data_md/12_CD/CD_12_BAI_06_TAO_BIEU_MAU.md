BÀl 6                  TAO BlỂU MẪU

Học xong bài này em sẽ:
Phát biểu được khái niệm biểu mẫu:
Mô tả được một số điều khiển hỗ trợ nhập dữ liệu trêntrang web.
Nêu được một số quy định trong thiết kế biểu mẫu:

          Trên màn hình soạn thảo email có một số ô điều khiển nhập dữ liệu; em hãy cho
          biết tên và chức năng của các điều khiển đó .

        Nhập dữ liệu thông qua biểu mẫu
            Biểu mẫu trên trang web là một
giao diện dể thu nhận thông tin từ                     Đăng nhập
người dùng
           Biễu mẫu bao gồm các điều khiển             Tiếp tục tới Gmail
nhậpdữ liệu như ô văn bản, nút chọn,          Emall hoác sỗ ẩỉện thoal
hộp kiểm  dược thiết kế phù hợp
với   nhiều  kiểu dữ liệu khác  nhau ,        Bạn quên đja chi email?
giúp               dùngdễdàng nhập dữ liệu
người
vàgiảmsai sót                                 Đâykhôngphải máy tính của bạn? Hãy sử dụng chế độ
Ngoài ra, biểu mẫu còn có các                 Khách để đăng nhập một cách riêng tư. Tim hiểu thêm
nút lệnh cho phépngười dùng Xác
nhận kết thúc nhập dữ liệu dể gửi yêu         Tạo tài khoản              Tiếp theo
cầu và dữ liệu về máy chủ web .               Hình 1 Biểu mẫuđăng
Ví dụ, biểu mẫu ở Hình 1 có ô                                         nhập thư điện tử
văn bản để nhập dịa chỉ email hoặc số điện thoại Kết thúc việc nhập dữ liệu và
gửiyêu cầu,ngườidùngnháy chuột vào nút lệnh Tiếp theo
                 phầntử form để tạo biểu mẫu theo cú pháp sau:
HTML định nghĩa
                 form action       urt method GETIPOST
                 Các điều khiểnnhậpdữliệu
                 <form

                                                                                      59
                                                                                      Bản in thử



 Thuộc tính action xác định tài nguyên web sẽ tiếp nhận và xử lí dữ liệu mà
                                                       người
 dùng  dến máy chủ. Tài nguyên web thường là các chương trình dược viết=bằng
       gửi
       vừa
 các ngôn ngữ lập trình, ví dụ như: Java, PHP: Python,
 Thuộc tính method xác định phương thức            dữ liệu đến máy chủ để xử lí, thường
                                      gửi
 có giá trị là GET hoặc POST. Nếukhôngkhai báo, phương thức GET được sử dụng
 Sửdụng GET, dữ liệu gửi dến máy chủ xuất hiện trong ô dịa chỉ của trình duyệt và
 bị hạn chế vềdung Iượng Ngược lại, sửdụngPOST, dữ liệu gửi dến máy chủkhông
 xuất hiện trong ô địa chỉ cua trinh duyệt vàkhôngbị hạn chế vềdunglượng nên POST
thường dược dùngđể gửi dữ liệu có dungIượng lớn.
           Thôngthường, kết thúc quá trình nhập dữ liệu,ngườidùngcẩn nháy chuột vào nút
 lênh có chứcnẳnggửi dữ liệu trên biểu mẫu để dữ liệu nhập vào được gửi đến máy chủ
 web . Sau khi tiếp nhận xử lí dữ liệu, máy chủ web gửi trả kết  và kết          thường
                                                       quả       quả
là một trang web khác.
       Một số điều khiển hỗtrợnhập dữ liệuthôngdụng và nút Iệnh

          Emhãyphânbiệt sự khác nhau giữa việc nhập dữ liệu cho ô "Địa chỉ ,
                                                                         người
          nhận" và ô "Nội dung" khi soạn thảo email.
 Nhập kí tự
 Điều khiển nhập xâu kí tự (ô text) dược khai báobằngphầntử input như sau:
          input type         texi name  Tên_điều_khiên ` value   Giá trị
 Trong dó:
       Tên_điều_khiển được gán cho thuộc tính name. Thuộc tính namekhôngphải là
 thuộc tính bẳt buộc khai báo; nhưng tất cả các điều khiểnthườngđược dặt tên dê thuận
 lợi cho việc xử lí dữ liệu  từ biểu mẫu về máy chủ web .
                      gưi
       Thuộc tính value nếu được khai báo thì Giá trị được gán là giá trị mặc định của
 text khi hiển thị trên màn hình trình duyệt web_
 Ví d 1. Văn bản HTML ở Hình 2a tạo biểu mẫu có hai ô text nhập dữ liệu, trong đó
 một ô text có giá trị mặc dịnh. Kết    hiển thị trên màn hình trình duyệt web sẽ như ở
                             quả
 Hình 2b.

 60
                                                                         Bản in thử



Tên đăng nhập:
Email:

Hình 2a. Ví dụ khai báo ô text
file: IlItextbox.html

Tên đăng nhập: [VietBach]                             Email:
Hình 2b. Kết quả khi mở văn bản HTML ở Hình 2a bằng trình duyệt web

Ngoài ô text, HTML còn cung cấp một số điều khiển hỗ trợ nhập dữ liệu thông dụng như mô tả ở Bảng 1.

Bảng 1. Một số điều khiển hỗ trợ nhập dữ liệu thông dụng

| Phần tử   | Mục đích                                         | Ví dụ                                                   |
|-----------|--------------------------------------------------|--------------------------------------------------------|
| textarea  | Tạo ô nhập đoạn văn bản                          |  |
| label     | Tạo nhãn mô tả ý nghĩa của điều khiển nhập dữ liệu |  Địa chỉ email:                          |
| password  | Tạo ô text nhập định dạng mật khẩu, mỗi kí tự nhập trong ô text thường được thay thế bằng dấu chấm |                  |

b) Nhập dữ liệu bằng cách lựa chọn

Trong một số trường hợp, dữ liệu nhập vào được xác định trước bằng cách cung cấp một số phương án để người dùng lựa chọn.

Danh sách các nút chọn (radio button) được sử dụng trong trường hợp người dùng chọn lựa một mục trong danh sách mục gợi ý. HTML định nghĩa radio button thông qua phần tử input có thuộc tính type="radio". Mỗi nút chọn trong danh sách được khai báo bởi một phần tử input.

Chú ý: Thuộc tính name của các nút chọn phải được khai báo như nhau để khi nhập liệu người dùng chỉ tích (chọn) được một mục trong danh sách.

Ví dụ 2. Nội dung trong phần body của văn bản HTML ở Hình 3a khai báo danh sách các mục chọn và kết quả hiển thị trên màn hình trình duyệt web sẽ như ở Hình 3b.



# Thăm dò ý kiến

Thời gian tham gia ngoại khoá ngày Chủ nhật?

Sáng
Chiều
Tối

Hình 3a. Ví dụ khai báo danh sách các mục chọn

Thăm dò ý kiến
Thời gian tham gia ngoại khoá ngày Chủ nhật?
- Sáng
- Chiều
- Tối

Hình 3b. Kết quả khi mở văn bản HTML ở Hình 3a bằng trình duyệt web

HTML còn hỗ trợ tạo danh sách chọn hộp kiểm (checkbox) cho phép người nhập dữ liệu có thể chọn nhiều hoặc tất cả các mục trong danh sách các mục chọn. Hộp kiểm được định nghĩa thông qua phần tử input có thuộc tính type="checkbox".

Ví dụ 3. Nội dung trong phần body của văn bản HTML ở Hình 4a khai báo danh sách các hộp kiểm và kết quả hiển thị trên màn hình trình duyệt web sẽ như ở Hình 4b.

# Thăm dò ý kiến

Bạn sẽ tham gia các câu lạc bộ thể thao nào?

Bóng đá
Cầu lông
Cờ vua

Hình 4a. Ví dụ khai báo danh sách hộp kiểm

Thăm dò ý kiến
Bạn sẽ tham gia các câu lạc bộ thể thao nào?
- Bóng đá
- Cầu lông
- Cờ vua

Hình 4b. Kết quả khi mở văn bản HTML ở Hình 4a bằng trình duyệt web



```

Thuộc tính `value` nếu được khai báo sẽ cung cấp nhãn của nút, trong trường hợp không khai báo, nút trên biểu mẫu có nhãn mặc định là "Submit".

#### Ví dụ 4. Nội dung phần body của văn bản HTML ở Hình 5a khai báo nút lệnh gửi dữ liệu có nhãn là 'Đồng ý' và kết quả hiển thị trên màn hình trình duyệt web như qua ở Hình 5b.

```html

```

**Hình 5a.** Ví dụ khai báo nút lệnh gửi dữ liệu

**Hình 5b.** Kết quả khi mở văn bản HTML ở Hình 5a bằng trình duyệt web

----

### Một số lưu ý trong thiết kế biểu mẫu

Khi khai báo các điều khiển trên biểu mẫu, cần lưu ý:

- Chọn điều khiển nhập dữ liệu phù hợp với loại thông tin cần thu thập: Ví dụ, để người dùng chọn được nhiều mục thì nên sử dụng checkbox.
- Thứ tự các điều khiển nên sắp xếp từ trái sang phải, từ trên xuống dưới, gộp nhóm phù hợp với thứ tự dữ liệu người dùng cần nhập. Ví dụ, nên đặt các nút lệnh ở cuối biểu mẫu vì thao tác gửi dữ liệu thường được thực hiện sau khi nhập xong dữ liệu.
- Nếu biểu mẫu có nhiều nút lệnh, nên sắp xếp nút lệnh theo hàng ngang, ưu tiên nút lệnh có tần suất sử dụng nhiều ở bên trái.



# Biểu mẫu đăng ký tham gia Hội thao

# Đăng ký tham gia Hội thao

Họ và tên:

Địa chỉ email:

Lớp:

Lớp 10
Lớp 11
Lớp 12

Tham dự môn:

Bóng bàn
Cầu lông
Cờ vua

Đăng
Huỷ bỏ

Hình 6. Biểu mẫu đăng ký tham gia hội thao

# Câu hỏi

1. Khai báo nào được dùng để tạo điều khiển nhập dữ liệu ô text trong biểu mẫu?
- A. input type="text" name="txt"
- B. textfield name="txt"
- C. textinput name="txt"
- D. input type="txtfield" name="txt"
2. Mỗi phát biểu sau đây về các điều khiển nhập dữ liệu trên biểu mẫu là đúng hay sai?
- a) Phần tử textarea được dùng để khai báo điều khiển nhập dữ liệu ký tự trên nhiều dòng trong biểu mẫu.
- b) Phần tử input có thuộc tính type="radio" được lựa chọn cho phép người dùng có thể chọn nhiều mục chọn.
- c) Phần tử input có thuộc tính type="submit" được dùng để khai báo nút lệnh gửi dữ liệu.
- d) Muốn xuống dòng khi nhập dữ liệu vào ô nhập liệu ta cần khai báo phần tử input có thuộc tính type="text" và sử dụng phím Enter.

# Tóm tắt bài học

Phần tử form được sử dụng để khai báo biểu mẫu:

Các điều khiển nhập dữ liệu dùng trong biểu mẫu gồm: ô text; tích chọn radio button; hộp kiểm checkbox; nút lệnh submit.

Khi thiết kế biểu mẫu, em cần lựa chọn điều khiển phù hợp với tin cần thu thập.
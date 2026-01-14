# BÀI TẠO VÀ SỬ DỤNG BIỂU MẪU

Học xong bài này, em sẽ:
- Phân biệt được "có kết buộc với bảng 'CSDL" và "không kết buộc".
- Tạo được một số loại biểu mẫu.
- Sử dụng được biểu mẫu để nhập dữ liệu.

Em hãy kể một loại biểu mẫu điền thông tin mà em biết, nó gồm có những mục gì? Một số mục có một (hay vài) ô vuông để đánh dấu chọn; vì sao có mẫu như thế?

## Tạo biểu mẫu trong Access

### a) Các loại biểu mẫu

- **Biểu mẫu một bản ghi**: Tại một thời điểm, nó hiển thị một bảng, tức là một hàng trong bảng CSDL. Trong ứng dụng thực tế, biểu mẫu này dùng để nhập hay hiển thị thông tin về một cá thể: một người, một mục hàng trong đơn hàng. Thông thường, các tên trường ở bên trái và ô để nhập; hiển thị dữ liệu kê bên phải.

- **Biểu mẫu nhiều bản ghi**: Hiển thị nhiều bản ghi cùng một lúc, mỗi bản ghi trên hàng trường là các cột, nhìn tương tự như một bảng.

### Biểu mẫu tách đôi

Vùng hiển thị biểu mẫu được chia thành hai nửa, theo chiều dọc hoặc chiều ngang (Hình 1).

**Ví dụ**: Nửa trên hiển thị các trường của một bản ghi, nửa dưới hiển thị nội dung của nhiều bản ghi.

| MS     | Tên sách         | Số trang | Loại sách         |
|--------|------------------|----------|--------------------|
| 44-01  | Nhạc cổ điển     | 151      | Phá Trần Khic      |
| AN-05  | Nhạc cổ điển     | 160      | Lê Ngọc Arh Khác   |
| TH1    | Truyện ngắn      | 170      | Lasse Koulua TH    |
| THC2   | Al-Tritue nh     | 306      | Lasse Roulle TH    |
| TIL10  | Mít              | 170      | Kuuyenn Kunn TII   |
| TO 01  | Bing tao Toa     | 805      | Poy- Klác          |
| V01    | Dè mnen phier    | 296      | T; Hosi Khac       |
| VHoz   | rap thioGuc      | 209      |                    |

**Hình 1**: Biểu mẫu tách đôi.



# Biểu mẫu có kết buộc và biểu mẫu không kết buộc

## Biểu mẫu có kết buộc (bound)
- Các mục dữ liệu hiển thị trong biểu mẫu kết buộc trực tiếp với các trường trong bảng CSDL và làm thay đổi dữ liệu của trường khi gõ nhập.
- Phải là biểu mẫu có kết buộc thì mới có thể dùng để nhập, chỉnh sửa, xem dữ liệu.
- Các mục sau chủ yếu trình bày về biểu mẫu có kết buộc.

## Biểu mẫu không kết buộc (unbound)
- Đối lập với biểu mẫu có kết buộc, biểu mẫu không kết buộc không dùng để nhập, chỉnh sửa dữ liệu.

### Tạo biểu mẫu
#### Hướng dẫn tạo nhanh một số biểu mẫu có kết buộc với một bảng
- Nhóm lệnh Forms có các nút lệnh để tạo nhanh một biểu mẫu và sau đó sử dụng ngay được (Hình 2).

#### Các bước tạo biểu mẫu một bản ghi
1. Nháy chuột chọn **Create/Form** sẽ tạo biểu mẫu một bản ghi gồm tất cả các trường. Access tự động đặt một tên tạm dựa trên tên bảng.
2. Sửa lại tên biểu mẫu (nếu cần trước khi ghi lưu). Nên đặt tên gợi nhớ nội dung biểu mẫu là gì.
3. Sau khi đặt tên và ghi lưu, biểu tượng biểu mẫu kèm tên sẽ xuất hiện trong vùng điều hướng. Ta có thể thêm để chỉnh sửa thiết kế hay sử dụng bất kỳ lúc nào.

#### Tạo biểu mẫu nhiều bản ghi
1. Nháy chuột chọn **Create/More Forms** sẽ thả một danh sách chọn như ở Hình 2: sau đó nháy chuột.
2. Chọn **Multiple Items** sẽ tạo ra một biểu mẫu nhiều bản ghi.
3. Chọn **DataSheet** cũng tạo ra một biểu mẫu nhiều bản ghi nhưng có dạng như khung nhìn bảng dữ liệu.
4. Chọn **Split Form** sẽ tạo ra biểu mẫu tách đôi.

----

### Hình 2. Các nút lệnh tạo biểu mẫu

| Tên bảng | Truy vấn |
|----------|----------|
| 45-002   | TH-02    |
| 45-091   | AN-01    |
| 3HS-Y/   | 00i      |
| 001      | VhGI     |
| 545-008  | AN-0     |
| H5-025   | 71-01    |
| 4S.096   | TH-10    |
| 8HS-022  | 7H4-€2   |
| 5-011    | A4-05    |
| 104s-016 | 7I-0?    |
| 45-013   | 0u       |
| 45-015   | TH-01    |

----

### Ghi chú
- Các bước trên giúp người dùng dễ dàng tạo và quản lý biểu mẫu trong Access, từ đó nâng cao hiệu quả làm việc với cơ sở dữ liệu.



# Hướng dẫn tạo biểu mẫu bằng Form Wizard

## Tạo nhanh biểu mẫu bằng Form Wizard

- **Nút lệnh**: Form hay More
- **Which fields do you want on your form?**: Forms rất dễ nhưng có yêu cầu chọn từ nhiều bảng hoặc truy vấn.

### Các lựa chọn tùy biến, ví dụ:
- Chỉ chọn một số trường nào đó, chọn các bản ghi từ hai bảng.

| Tên bảng         | Available Fields | Selected Fields |
|------------------|------------------|------------------|
| Tables           |                  |                  |
| Queries          |                  |                  |
|                  | Ten              | ID Hocsinh       |
|                  | Hova ten         | Số he            |
|                  | Email Address     | Ngày sinh        |

**Cách làm tốt hơn là sử dụng tiện ích tạo biểu mẫu Form Wizard (Hình 3) hỗ trợ làm biểu mẫu có tùy biến rất thuận tiện.**

### Tạo biểu mẫu một bản ghi

Hình 3. Chọn các trường dữ liệu

Sau khi khởi chạy tiện ích tạo biểu mẫu bằng cách chọn Create/Form Wizard, thực hiện quy trình 3 bước chính như sau:

### Bước 1: Chọn các trường dữ liệu
- Hộp thoại đầu tiên mở ra để chọn các trường dữ liệu sẽ hiển thị trên biểu mẫu. Các trường này có thể lấy từ các bảng hoặc truy vấn.
- Thao tác tương tự như nhau:
1. Từ danh sách thả xuống Tables/Queries cần chọn tên bảng/truy vấn. Danh sách các trường có sẵn (Available Fields) hiển thị trong khoảng dưới.
2. Chọn tên trường nhấn dấu `>` để chuyển sang hộp thoại Selected Fields.
3. Có thể nhấn vào dấu `>>` để di chuyển tất cả các trường cùng lúc.
4. Nhấn Next khi đã chọn xong tất cả các trường dữ liệu muốn có.

### Bước 2: Chọn kiểu trình bày biểu mẫu
- Hộp thoại tiếp theo của tiện ích tạo biểu mẫu sẽ yêu cầu chọn kiểu trình bày. Có 4 kiểu:
- Columnar (mặc định, hay dùng nhất)
- Tabular
- Datasheet
- Justified
- Hãy thử chọn, xem trước và đổi sang kiểu khác nếu muốn vì có sẵn nút "&#x3C; Back" để quay lại.

### Bước 3: Chọn Finish để kết thúc và ghi lưu
- Có thể đổi tên nếu cần.

## Biểu mẫu phân cấp và biểu mẫu đồng bộ hóa
Nếu hai bảng có mối quan hệ 1-1 (bảng mẹ - bảng con), có thể tạo biểu mẫu hiển thị một bản ghi của bảng mẹ và dữ liệu từ các bản ghi trong bảng con liên quan đến bản ghi của bảng mẹ. Đây là biểu mẫu phân cấp: có dạng tách đôi, hiển thị đồng bộ dữ liệu từ hai bảng khác nhau; theo mối quan hệ đã thiết lập trước.



# Hướng dẫn tạo biểu mẫu phân cấp và biểu mẫu đồng bộ hóa bằng Form Wizard

Quy trình tạo biểu mẫu kết buộc với nhiều hơn một bảng sẽ có nhiều thao tác hơn.

## Bước 1: Chọn các trường dữ liệu từ cả hai, bảng mẹ và bảng con, trước khi nháy chọn Next

Tiện ích tạo biểu mẫu sẽ nhận biết và yêu cầu lựa chọn biểu mẫu chính và biểu mẫu con lệ thuộc.

## Bước 2: Chọn biểu mẫu chính

Nháy chuột chọn tên bảng nguồn dữ liệu chính. Khung hình sẽ đưa ra câu hỏi để chọn tạo biểu mẫu phân cấp hay biểu mẫu đồng bộ hóa (Hình 4).

1) **Form with subform(s)**: Tạo biểu mẫu đồng bộ hóa
2) **Linked forms**: Tạo biểu mẫu phân cấp.

## Bước 3: Đánh dấu lựa chọn 1)

Hộp thoại tiếp theo sẽ hỏi cách trình bày biểu mẫu con. Đánh dấu chọn theo mong muốn. Tiếp theo ta trở lại với Bước 2 và Bước 3 trong quy trình thao tác làm biểu mẫu bằng Form Wizard.

## Sử dụng biểu mẫu để nhập hoặc xem dữ liệu

Mở biểu mẫu trong khung nhìn biểu mẫu (Form View) để nhập hoặc xem dữ liệu (Hình 5). Hình 6 minh họa một biểu mẫu nhiều bản ghi vừa được tạo ra, chưa chỉnh sửa, nhưng đã có thể sử dụng để xem và nhập dữ liệu.

### Chú ý ở góc dưới bên trái:

- Có hộp hiển thị số thứ tự bản ghi đang xử lý, trong hình minh họa: '17 of 17' nghĩa là bản ghi thứ 17 trong số 17 bản ghi đã có.
- Có các nút điều hướng thuộc: lùi, tiến, nhảy tới bản cuối cùng hiển thị một biểu mẫu trống để bắt đầu ghi nhập dữ liệu cho bản ghi mới.
- Có hộp Search để tìm kiếm.

## Hình 4. Chọn tạo biểu mẫu đồng bộ hóa

## Hình 5. Các khung nhìn biểu mẫu

## Hình 6. Minh họa biểu mẫu nhiều bản ghi



# All Access Objects

## Danh sách Ban Đoc

| Mã sinh viên | Họ và tên               | Giới tính |
|--------------|-------------------------|-----------|
| 43 011       | Nguyễn Thi Anh Dương    | Nữ       |
| 45 012       | Trần Hoàng Giang        | Nam       |
| 45 014       | Hà Thanh Hòa            | Nam       |
| 45 015       | Phạm Thanh Quang        | Nam       |
| 45 016       | Nguyễn Minh Hữu         | Nam       |
| 45 017       | Đặng Thị Bạch An       | Nữ       |

----

## Hình 6: Một biểu mẫu nhiều bản ghi

Sắp xếp các bản ghi theo giá trị một trường ghi.

Khi nhập dữ liệu, theo mặc định Access thêm bản ghi mới thành hàng cuối cùng trong bảng dữ liệu. Khi xem dữ liệu, thứ tự hiển thị các bản ghi như vốn có trong bảng nếu ta không thay đổi cách sắp xếp. Một số kiểu dữ liệu như: chữ, số, ngày tháng - có thể sắp xếp theo thứ tự tăng dần hay giảm dần.

### Hướng dẫn thao tác sắp xếp

1. **Bước 1**: Chọn cột hay ô dữ liệu trong cột đó.
2. **Bước 2**: Chọn Home sau đó chọn nhóm Sort &#x26; Filter (Hình 7).
3. **Bước 3**: Chọn Ascending hay Descending rồi quan sát kết quả.
4. **Bước 4**: Chọn Save trong thanh công cụ nhanh (Quick Access Toolbar).

Sau khi đã ghi lưu cách sắp thứ tự thì mỗi lần mở xem sau này các bản ghi sẽ hiển thị theo cách sắp xếp đã chọn. Để gỡ bỏ không sắp thứ tự nữa, nháy chuột vào Remove Sort.

Việc sắp thứ tự nhiều mức, lần lượt theo vài cột phức tạp hơn, cần sử dụng nút lệnh Advanced trong nhóm lệnh Sort &#x26; Filter.

----

## Hình 7: Nhóm lệnh sắp xếp và lọc dữ liệu Sort &#x26; Filter

----

**Lưu ý**: Nội dung trên được trích xuất từ tài liệu giáo dục và có thể chứa các lỗi chính tả hoặc ngữ pháp do quá trình quét văn bản.



# Lọc các bản ghi

Acccss làm sẵn nhiều lựa chọn lọc kèm các cột dữ liệu kiểu văn bản chữ, số, ngày tháng. Mở bảng dưới khung nhìn bảng dữ liệu và thao tác tương tự như trong Excel.

## Bước 1
Nháy chuột vào dấu trỏ xuống cạnh tên cột muốn lọc; xuất hiện danh sách thả xuống các hộp đánh dấu chọn.

## Bước 2
Đánh dấu chọn những gì bạn muốn xuất hiện, sau đó chọn OK.

----

# Thực hành tạo và sử dụng biểu mẫu

## Nhiệm vụ 1
Tạo biểu mẫu để nhập dữ liệu vào bảng **Mượn-Trả sách**.
Tạo một biểu mẫu nhiều bản ghi lấy dữ liệu từ bảng Mượn-Trả, ghi lưu với tên **MượnTrả**.

## Nhiệm vụ 2
Tạo biểu mẫu để tìm mượn sách.
Biểu mẫu nhiều bản ghi để tìm mượn sách lấy dữ liệu từ bảng **Sách** và cần đáp ứng các yêu cầu:
- a) Sắp xếp thứ tự theo Tên sách.
- b) Lọc theo cột Sẵn có. Ghi lưu với tên **Sách-Multi**.

## Nhiệm vụ 3
Sử dụng biểu mẫu để nhập dữ liệu.
Dùng biểu mẫu vừa tạo ở Bài 1, nhập một số bản ghi vào bảng **Mượn-Trả**.
Chú ý: Dữ liệu nhập vào không được trái với thực tế trong hoạt động của thư viện. Quản lí thư viện cần biết mỗi bạn đọc đã mượn những cuốn sách nào. Em hãy tạo một biểu mẫu cho phép làm việc này.

----

## Câu hỏi
**Câu 1:** Mục dữ liệu 'có kết buộc với bảng CSDL và "không kết buộc" khác nhau như thế nào?
**Câu 2:** Dùng nút lệnh nào để tạo nhanh biểu mẫu? Trường hợp nào nên chọn cách làm này?

----

# Tóm tắt bài học
Biểu mẫu dùng để nhập và xem dữ liệu từ một hoặc nhiều bảng; có thể hiển thị một bản ghi hay nhiều bản ghi; có thể trình bày tách đôi thành hai phần:
- Nút lệnh Form để tạo nhanh biểu mẫu nhưng không cho phép tùy biến.
- Tiện ích tạo biểu mẫu Form Wizard hỗ trợ tạo các loại biểu mẫu tùy biến theo yêu cầu sử dụng.
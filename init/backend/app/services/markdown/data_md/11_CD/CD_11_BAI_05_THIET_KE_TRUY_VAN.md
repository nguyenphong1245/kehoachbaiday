# BÀI 5: THIẾT KẾ TRUY VẤN

Học xong bài này, em sẽ:
- Tạo và sử dụng được các truy vấn để tìm kiếm và kết xuất thông tin từ CSDL.
- Góp phần giải thích tính ưu việt của việc quản lí dữ liệu một cách khoa học nhờ ứng dụng CSDL.

Theo em, để lấy ra một thông tin cụ thể từ CSDL thì cần công cụ gì?

## Thiết kế truy vấn đơn giản

### a) Truy vấn SELECT

Truy vấn là một mẫu câu hỏi. Nó cho phép chọn từ các bảng những gì ta cần. Sau khi thiết kế và ghi lưu, mỗi khi lại truy vấn, ta có câu trả lời dựa trên dữ liệu mới nhất. Đây là tính ưu việt của việc quản lí dữ liệu một cách khoa học nhờ ứng dụng CSDL.

Access hỗ trợ rất tốt việc thiết kế và thực thi truy vấn. Thiết kế truy vấn bắt đầu từ yêu cầu thao tác dữ liệu của một ứng dụng quản lí cụ thể. Bài học sẽ bám sát chức năng cung ứng dịch vụ cho mượn và trả sách. Dưới đây nêu vài điểm thuộc logic nghiệp vụ của thư viện và dự kiến truy vấn tương ứng:
1. Bạn đọc đến tìm sách để mượn: Cần truy vấn tìm Sách có sẵn để mượn.
2. Thủ thư cần thao tác Cho mượn và Trả. Ngoài việc nhập dữ liệu vào bảng Mượn-Trả còn phải sửa trị trường Sẵn có trong bảng để đánh dấu Yes/No phù hợp.

### b) Thiết kế truy vấn SELECT đơn giản

**Bước 1:** Nháy chuột chọn Create -> Query Design.

**Bước 2:** Hộp thoại Show Table xuất hiện. Truy vấn lấy thông tin từ các bảng của CSDL. Nháy chuột chọn tên bảng và nháy nút Add. Nháy Close khi chọn xong.

**Bước 3:** Vùng làm việc thiết kế truy vấn sẽ mở ra và được chia thành hai phần. Phần trên có các hộp thể hiện các bảng vừa được chọn. Trong mỗi hộp hiển thị tên tất cả các trường của bảng đó. Nếu có trường bị che khuất, dùng chuột kéo đường viền đáy hộp để mở rộng thêm.



# Access cũng hiển thị đường nối (Hình 1) thể hiện liên kết giữa các bảng

## Hình 1. Vùng làm việc thiết kế truy vấn

### Bước 4
Phần dưới hiển thị một lưới ô, thường là lưới QBE (Query by Example).
Muốn chọn lấy dữ liệu từ trường nào chỉ cần nháy đúp chuột lên tên trường trong hộp thể hiện bảng. Tên trường sẽ xuất hiện trong cột ở lưới ô bên dưới, tuần tự từ trái sang phải theo trình tự thao tác chọn.

- **Trường**: Hàng
- **Hàng Field** ở trên cùng của lưới ô hiển thị các tên đã chọn.
- Thứ hai bên dưới Field là Table, hiển thị tên bảng chứa trường đó.

### Bước 5
Nháy chọn kết quả truy vấn hiển thị trong khung nhìn dữ liệu qua nhớ kết quả truy vấn. Tên truy vấn sẽ xuất hiện.

### Bước 6
Ghi lưu truy vấn. Nên đặt tên gợi hiện trong vùng điều hướng: Sau đó, ta có thể mở ra bất cứ lúc nào để chỉnh sửa lại thiết kế theo mong muốn hoặc cho chạy để xem thông tin mới cập nhật từ CSDL. Ví dụ, ta đặt tên truy vấn vừa làm xong là "9-BanDoc-MuonTra".

**Mẹo**: Một thói quen thực hành tốt là thêm tiền tố `9-` (query) vào trước tên để dễ nhận biết đó là một truy vấn. Trong vùng điều hướng có biểu tượng đi kèm nên ta không nhầm lẫn, nhưng trong các hộp thoại để chọn nguồn dữ liệu tạo biểu mẫu, báo cáo sẽ chỉ có tên xuất hiện nên khó phân biệt giữa bảng với truy vấn.

## Sắp xếp kết quả truy vấn
Trong khung nhìn bảng dữ liệu (Hình 2), chú ý quan sát ta sẽ nhận thấy:

| Họ và tên         | Ten     | So the | Ms cach | Ngày mượn   | Ngày trả     |
|-------------------|---------|--------|---------|--------------|--------------|
| Trân Văn          | HS-001  | AN-01  | 15/09/2022 |              | |
| Lê Hữu Bình      | HS-002  | TH-02  | 14/09/2022 |              | |
| Hoàng Nam Dũng   | HS-007  | TO-01  | 15/09/2022 |              | |
| Nguyễn Đình Lộc   | HS-004  | VH-01  | 29/09/2022 |              | |

## Hình 2. Kết quả truy vấn

----

This text has been extracted and formatted to maintain the original structure and content as closely as possible.



# Sách Giáo Khoa - Truy Vấn Dữ Liệu

## Thư tự hiển thị các trường (cột)

Thư tự hiển thị các trường (cột) giống như trong lưới ô. Muốn thay đổi thứ tự này; ta sửa lại lưới ô trong khung nhìn thiết kế.

Nêu hai bảng đã được thiết lập mối quan hệ kết nối với nhau, sẽ chỉ thấy những bản ghi khớp đúng: Access đã tự động thực hiện phép nối trong. Trình tự hiển thị các bản ghi là trình tự vốn có ở trong bảng dữ liệu cơ sở.

### Sắp xếp các bản ghi theo giá trị trường dữ liệu

Chuyển sang khung nhìn thiết kế truy vấn (Design View): Trong vùng lưới ô ở bên dưới hàng Table có hàng tên là Sort. Hàng này dùng để sắp xếp kết quả truy vấn theo một hoặc nhiều trường (lồng nhau).

1. **Sắp xếp theo một trường**: Chọn trường: chọn Ascending hoặc Descending để sắp xếp tăng dần hoặc giảm dần.
2. **Sắp xếp lồng nhau theo một vài trường**: Thao tác lần lượt từng trường, trình tự lồng nhau từ ngoài vào trong sẽ tương ứng lần lượt từ trái sang phải.

**Ví dụ**: Trong truy vấn ở trên; nếu ta muốn sắp xếp theo Tên bạn đọc thì trong lưới ô, tại ô giao cắt cột Tên với hàng Sort cần chọn Ascending (Hình 3).

| Ban Doc | Muon Tra | | | | |
|---------|----------|---|---|---|---|
| Ho va dem | Ten | SWt1e | Mu sacn | Ncảy muen | Ngay ura |
| Table: Ban Doc | Eụn Euc | Dan Cuc | Mươn-Tra | Mươn-Trá | Mưựt-Tiả |
| Sort | Show: | Criteria | | | |

**Hình 3. Sắp xếp theo Tên**

### Chọn bản ghi cho truy vấn SELECT

**Tiêu chí lựa chọn bản ghi**: Tiêu chí lựa chọn được thể hiện bằng một biểu thức logic gồm các biến trường và các phép toán. Chỉ các bản ghi với các trị trường dữ liệu làm biểu thức logic có giá trị là "Đúng" (True) mới được chọn lấy ra.

Hàng Criteria (tiêu chí) trong lưới ô là nơi viết biểu thức logic thể hiện tiêu chí lựa chọn. Hình 4 minh hoạ truy vấn chọn chỉ lấy ra các bản ghi có Mã sách là VH-01.

| Field | Ho va dem | Ten | S6 thè | Me sech | Yuay muon | Naau tra |
|-------|-----------|-----|--------|---------|-----------|----------|
| Table: Ban Por | Ban Đor | Ban Đoc | Ivuon-Tra | vugn-Tra | Mưgn-Trà | |
| Sort | Ascending | Show | Criteria | VH ou | | |

**Hình 4. Chọn lấy ra bản ghi có Mã sách "VH-01"**



```markdown
## b) Một số thành phần trong biểu thức logic làm tiêu chí lựa chọn dữ liệu

Trong Bảng 1 là một số ví dụ đơn giản để minh họa cách viết một số biểu thức cơ sở.

### Bảng 1. Một số ví dụ về tiêu chí lựa chọn dữ liệu

| Kiểu dữ liệu     | Biểu thức logic                | Diễn giải ý nghĩa                          |
|------------------|--------------------------------|--------------------------------------------|
| Số, ví dụ Số trang | >100 AND &#x3C;=200                | 100 &#x3C; Số trang &#x3C;= 200                     |
| Ngày tháng       | 2#14/09/2022# AND &#x3C;=#20/09/2022# | Từ sau 14/09/2022 đến hết ngày 20/09/2022 |
| Xâu kí tự       | "An"                          | Đúng bằng "An"                             |
| Xâu kí tự       | > "An"                        | Xếp sau "An" theo từ điển                 |
| Logic, ví dụ Sẵn có | Is Not Null                  | Sẵn có (để mượn)                          |

### Các phép toán:
1. Các phép so sánh (kiểu số, xâu kí tự, ngày tháng): (bằng) (không bằng)
2. Kiểm tra thuộc miền giá trị: In; Not In; Between; Not Between; Is Null; Is Not Null

Có thể hợp biểu thức logic để tạo ra tiêu chí lựa chọn phức tạp hơn.

- **Liên kết AND**: Thể hiện bằng cách đặt hai tiêu chí lựa chọn ở hai trường khác nhau nhưng trên cùng hàng. Access sẽ chỉ lấy ra các bản ghi mà đáp ứng cả hai tiêu chí.
- **Liên kết OR**: Thể hiện bằng cách đặt tiêu chí lựa chọn thứ hai ở hàng Or. Access sẽ lấy ra các bản ghi đáp ứng một trong hai tiêu chí.

Bảng 2 là ví dụ đơn giản để minh họa cách viết cho hai trường Ngày Mượn trong bảng Mượn-Trả và Số trang trong bảng Sách.

### Bảng 2. Một ví dụ về minh họa cách viết cho hai trường

| Ngày mượn                | Số trang | Diễn giải nghĩa                                      |
|--------------------------|----------|------------------------------------------------------|
| &#x3C;#05/09/2022#           | >100     | Sách mượn từ trước ngày 05/09/2022 VÀ hơn 100 trang |
| 2=#05/09/2022#          | &#x3C;200     | Sách mượn bắt đầu từ ngày 05/09/2022 HOẶC dưới 200 trang |
```



# Truy vấn có tham số

Em hãy làm theo các bước như hướng dẫn trong mục và ghi lưu truy vấn "q-BanDoc-MuonTra":

1. Thử thêm một số tiêu chí lựa chọn áp dụng cho trường chạy thử; kiểm tra kết quả; không ghi lưu:
2. Thử thêm một số tiêu chí lựa chọn áp dụng cho trường Ngày mượn; chạy thử; kiểm tra kết quả; không ghi lưu:

## Truy vấn có tham số

Thay vì viết sẵn đầy đủ biểu thức logic thể hiện tiêu chí truy vấn, ta có thể muốn mời người sử dụng gõ nhập thêm yêu cầu lựa chọn trong khi chạy một truy vấn. Đó là một truy vấn có tham số (Parameter Query). Truy vấn có tham số làm tăng tính linh hoạt khi khai thác dữ liệu từ CSDL.

### Cách viết một truy vấn tham số đơn giản:

Trong cặp vuông ([]) viết lời nhắc sao cho người sử dụng hiểu và điền vào ngoặc đúng tham số ta muốn có trong câu lệnh truy vấn. Cặp dấu vuông chứa lời nhắc ở đúng vị trí thay thế cho dữ liệu điền trước.

Tiếp nối việc thiết kế truy vấn đã xét ở mục Enter Parameter V trước, thay thế cho VH-01 ta cần viết, ví dụ Mã sách [Mã sách?]. Khi chạy truy vấn, một hộp thoại sẽ hiển thị chờ cung cấp tham số (Hình 5). Sau khi điền tham số ví dụ VH-01 và nháy OK sẽ nhận được kết quả giống như có dữ liệu trực tiếp.

**Hình 5. Lời nhắc điền tham số**

### Một số mẫu lời nhắc linh hoạt:

Thay cho dấu bằng (=) có thể sử dụng các phép so sánh khác khi thể hiện tham số truy vấn: `&#x3C;`, `&#x3C;=`, `>`, `>=`, `&#x3C;>`.

## Truy vấn hành động

Ngoài truy vấn SELECT, có các loại truy vấn khác để tạo bảng, nối thêm dữ liệu vào một bảng, cập nhật hay xóa hàng loạt nhiều bản ghi trong bảng (Make Table, Append, Update, Delete).

Truy vấn hành động làm thay đổi bảng, thay đổi một loạt nhiều bản ghi. Kết quả của truy vấn hành động là không thể đảo ngược, nghĩa là không thể hồi lại trạng thái trước đó (undo). Do đó, cần rất thận trọng. Như một quy tắc chung, nên sao lưu dự phòng các bảng liên quan trước khi thực hiện truy vấn hành động.



# Thực hành thiết kế truy vấn

## Nhiệm vụ 1
Thiết kế truy vấn dựa trên bảng Sách. Lấy ra các thông tin phục vụ ban đọc tìm sách để mượn sao cho thuận tiện nhất:
- a) Sắp xếp theo trường tên sách.
- b) Lựa chọn chỉ hiển thị khi sẵn có để mượn.

**Gợi ý:** `
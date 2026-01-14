# BÀI 2: BẢNG VÀ KHÓA CHÍNH TRONG CƠ SỞ DỮ LIỆU QUAN HỆ

Học xong bài này em sẽ:
- Diễn đạt được khái niệm quan hệ (bảng) và khóa của một quan hệ.
- Giải thích được các khái niệm đó qua ví dụ minh họa.
- Giải thích được ràng buộc khóa là gì.
- Biết được các phần mềm quản trị CSDL có cơ chế kiểm soát các cập nhật dữ liệu để đảm bảo ràng buộc khóa.

Hồ sơ học sinh một lớp được tổ chức theo dạng bảng: mỗi hàng chứa dữ liệu về một học sinh, mỗi cột chứa dữ liệu về một thuộc tính của học sinh như: Họ và tên, Ngày sinh. Theo em, cách tổ chức như vậy có ưu điểm gì trong việc quản lý thông tin học sinh của lớp?

## Tổ chức dữ liệu trong CSDL quan hệ và các thao tác trên dữ liệu

### a) Cơ sở dữ liệu quan hệ
Cơ sở dữ liệu quan hệ là một tập hợp các bảng dữ liệu có liên quan với nhau. Hình dưới đây cho thấy một phần bảng HỌC SINH 11 trong một CSDL quan hệ của một lớp học.

| Mã định danh | Họ và tên       | Ngày sinh   | Giới tính | Đoàn viên | Địa chỉ         |
|--------------|------------------|-------------|-----------|-----------|------------------|
| 13109413     | Phan Thùy Anh    | 29/10/2007  | Nữ       |           | 39 Hùng Vương    |
| 13109735     | Lê Minh Đức       | 05/09/2007  | Nam      |           | 15 Ván Cao       |
| 13124595     | Hoàng Giang      | 21/12/2007  | Nam      |           | 27 Lò Sở         |
| 31387552     | Nguyễn Thị Hà    | 12/06/2007  | Nữ       |           | 29 Hàng Bún      |
| 13169292     | Trần Minh Tú     | 14/11/2007  | Nữ       |           | 18 Quán Thanh    |

Hình: Một phần bảng HỌC SINH 11 của một cơ sở dữ liệu quan hệ.

Tên của mỗi cột trong bảng cho biết ý nghĩa dữ liệu ở các ô thuộc cột đó. Tên bảng cùng với tên cột giúp hiểu nghĩa của mỗi hàng trong bảng. Mỗi hàng trong bảng chứa một bộ các giá trị, ví dụ, trong hình bộ gồm 6 giá trị: "13109413", "Phan Thùy Anh", "29/10/2007", "Nữ", "39 Hùng Vương" cho thông tin về một học sinh.

Mỗi một hàng trong bảng của CSDL quan hệ còn được gọi là một bản ghi. Mỗi cột của bảng còn được gọi là một trường. Trong hình, bảng HỌC SINH 11 có 6 trường phản ánh 6 thuộc tính của mỗi học sinh.



# b) Cập nhật dữ liệu trong CSDL quan hệ

Cập nhật dữ liệu của một bảng bao gồm các thao tác thêm, sửa và xóa dữ liệu của bảng. Cấu trúc của một bảng bao gồm mô tả cho các cột của bảng: người thiết kế CSDL sẽ định nghĩa cấu trúc của các bảng dựa vào các yêu cầu quản lý của đơn vị chủ quản. Cập nhật dữ liệu của một bảng không làm thay đổi cấu trúc của bảng.

# c) Truy vấn trong CSDL quan hệ

Dữ liệu được tổ chức - lưu trữ trong CSDL là để người sử dụng có thể khai thác dữ liệu, rút ra thông tin phục vụ các hoạt động hoặc giúp đưa ra các quyết định phù hợp, kịp thời. Bản chất việc khai thác một CSDL là tìm kiếm dữ liệu và kết xuất ra thông tin cần thiết.

# d) Các ràng buộc dữ liệu trong CSDL quan hệ

Theo em, mỗi học sinh cần phải có riêng một Mã định danh để đưa vào hồ sơ quản lý hay không? Vì sao?

Dữ liệu trong CSDL quan hệ phải thỏa mãn một số ràng buộc toàn vẹn về dữ liệu để đảm bảo tính xác định và đúng đắn của dữ liệu. Ví dụ một số ràng buộc dữ liệu:

- Trong một bảng không có hai bản ghi nào giống nhau hoàn toàn.
- Trong cùng một bảng, mỗi trường có một tên phân biệt với tất cả các trường khác.
- Mỗi bảng có một tên phân biệt với các bảng khác trong cùng CSDL.
- Mỗi ô của bảng chỉ chứa một giá trị.

Người thiết kế CSDL đặt ra các ràng buộc khác cho dữ liệu. Ví dụ: Người thiết kế CSDL cho trường học không thể yêu cầu Mã định danh của mỗi học sinh phải là một dãy số quá 12 ký tự, tất cả các ký tự đều là số. Với ràng buộc như thế, việc nhập "0011234567899" vào cột Mã định danh là không hợp lệ.

## Khóa của một bảng

Trong một bảng, mỗi bản ghi thể hiện thông tin về một đối tượng (một cá thể hoặc một sự kiện) nên trong một không thể có hai bản ghi giống nhau. Trong bảng chứa dữ liệu học sinh, ví dụ như HỌC SINH 11 (Hình /), hai học sinh khác nhau sẽ có hai Mã định danh khác nhau. Điều này đảm bảo rằng mỗi công dân của mỗi người xác định người đó là duy nhất, không nhầm lẫn với bất kỳ ai.



# Trong một bảng có những tập hợp gồm một trường hay một số trường mà giá trị của chúng ở các bản ghi khác nhau là khác nhau.

Ví dụ ở Hình 2: một trường STT xuất hiện ở một bản ghi; giá trị của một bộ giá trị của hai trường CCCD và BHYT (hạn "001160017719", "HT3010101040124") chỉ xác định duy nhất một bản ghi ở trong bảng và không thể bỏ đi trường nào mà tập hợp gồm một trường STT và tập hợp hai trường CCCD và BHYT đều có tính chất: mỗi bộ giá trị của nó xác định duy nhất một bản ghi trong bảng.

Với ví dụ bảng trong Hình 2 có thể kể ra thêm một số tập hợp trường có tính chất như vậy:

- Tập chỉ gồm một trường CCCD.
- Tập gồm hai trường: STT, Họ và tên.
- Tập gồm tất cả sáu trường.

## Khóa của một bảng

Khóa của một bảng là tập hợp một số trường có tính chất: mỗi bộ giá trị của các trường đó xác định duy nhất một bản ghi trong bảng và tập hợp gồm các trường còn lại vẫn còn tính chất đó.

Ví dụ với bảng ở Hình 2:

- Tập hợp chỉ có một trường CCCD là một khóa.
- Tập hợp gồm hai trường: STT, Họ và tên không phải là khóa vì nếu bỏ trường Họ và tên ra khỏi tập hợp này thì chỉ riêng STT cũng có tính chất xác định duy nhất một bản ghi trong bảng.
- Nếu không thể có hai nhân viên trùng nhau hoàn toàn ở Họ và tên, Ngày sinh thì tập hợp gồm hai trường Họ và tên, Ngày sinh cũng tạo thành một khóa. Nhưng tập hợp ba thuộc tính STT, Họ và tên, Ngày sinh không phải là một khóa.

| STT | Họ và tên        | Ngày sinh  | Giới tính | CCCD          | BHYT            |
|-----|------------------|------------|-----------|---------------|------------------|
| 1   | Nguyễn Thành An  | 27/3/1970  | Nam       | 001160017719  | HT3010101040124   |
| 2   | Đô Thu Cúc      | 05/5/1973  | Nữ        | 001250025170  | HT3012101340125   |
| 3   | Hoàng Thi Dung   | 12/4/1971  | Nữ        | 001171123635  | HT1013101240124   |

### Hình 2: Bảng NHÂN VIÊN trong mệt CSDI của một công ty

Khi bảng có hơn một khóa, người thường chọn (chỉ định) một khóa làm khóa chính (Primary Key), ưu tiên chọn khóa gồm ít trường nhất, tốt nhất nếu chọn được khóa chỉ là một trường. Bởi vậy, với bảng ở Hình 2, thay vì chọn khóa chính là tập hợp gồm hai trường...



# Họ và tên và Ngày sinh

Ta có thể chọn trưởng STI hasinrongCCCD làm khóa chính của bảng bởi các hàng trong bảng phân biệt với nhau bởi số thứ tự (STT). Trên thực tế, người thưởng tao thêm trưởng MaNT (Mã nhân viên) làm khóa chính cho bảng chứa thông tin nhân viên để phù hợp với cách tổ chức quản lý của đơn vị đó.

## Việc cập nhật dữ liệu

Việc cập nhật dữ liệu cho một bảng cũng phải thỏa mãn yêu cầu không làm xuất hiện hai bản ghi có giá trị khóa giống nhau. Yêu cầu này còn được gọi là ràng buộc khóa.

Hệ quản trị CSDL đảm bảo ràng buộc khóa những bất cứ hệ quản trị CSDL nào cũng chế kiểm soát, ngăn chặn vi phạm có cơ ràng buộc khóa đối với việc cập nhật dữ liệu. Để thực hiện điều đó, phần mềm yêu cầu người ta lập CSDL chỉ định trường làm khóa chính và mỗi khi xuất hiện thao tác cập nhật dữ liệu, phần mềm sẽ tự động kiểm tra xem cập nhật đó có phạm ràng buộc khóa hay không.

## Thực hành với khóa của bảng trong CSDL

### Yêu cầu

Sử dụng phần mềm Microsoft Access 365, tạo bảng SÁCH có cấu trúc như ở Hình 3. Sử dụng trường sách làm khóa chính và nhập nhiều hơn 5 bản ghi cho bảng.

### Hướng dẫn thực hiện

**Bước 1:** Khởi chạy Microsoft Access 365 bằng cách nháy đúp chuột vào biểu tượng Access.

**Bước 2:** Tạo một CSDL mới. Trong CSDL mới này, tạo cấu trúc cho bảng bằng cách thực hiện tuần tự các thao tác sau:
- Chọn **Blank Desktop Database** rồi đặt tên cho CSDL mới (hoặc nháy đúp chuột vào biểu tượng của Blank Desktop Database, Access sẽ tự đặt tên cho CSDL mới).
- Chọn **Create Table Design** để xuất hiện cửa sổ khai báo cấu trúc bảng (Hình 3).

| Field Name   | Data Type  |
|--------------|------------|
| Mã sách      | Short Text |
| Tên sách     | Short Text |
| Số trang     | Number     |
| Tác giả      | Short Text |

**Hình:** Chế định khóa chính

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Trên mỗi hàng nhập tên một trường ở cột Field Name.
Chọn kiểu dữ liệu cho trường bằng cách đưa con chuột vào ô ở cột Data Type để làm xuất hiện danh sách cho chọn.

## Bước 3
Chọn định khóa chính cho bảng bằng cách chọn hàng trường Mã sách. Sau đó chọn Primary Key (Hình 3).

## Bước 4
Chọn Save để lưu cấu trúc bảng và đặt tên cho bảng.

## Bước 5
Chọn View để xuất hiện cửa sổ cho nhập các bản ghi vào bảng.

**Chú ý:** Nên thử nhập cùng một bộ giá trị cho hai bản ghi khác nhau để xem phần mềm báo lỗi vi phạm ràng buộc khóa ra sao.

----

Để tiếp tục xây dựng CSDL quản lý một thư viện, hãy cho biết:

a) Dự kiến của em về cấu trúc bảng NGƯỜI ĐỌC, biết rằng bảng này dùng để lưu trữ dữ liệu về những người có thể thư viện.

b) Trong các trường của bảng NGƯỜI ĐỌC, nên chọn trường nào làm khóa chính? Giải thích vì sao?

c) Hãy nêu ví dụ cụ thể về nhập dữ liệu cho bảng NGƯỜI ĐỌC nhưng vi phạm ràng buộc khóa.

----

Trong các câu sau, câu nào đúng?

1. Trong CSDL quan hệ, mỗi bảng chỉ có một khóa.
2. Khóa của một bảng chỉ là một trường.
3. Nếu hai bản ghi khác nhau thì giá trị khóa của chúng phải khác nhau.
4. Các hệ quản trị CSDL quan hệ tự động kiểm tra ràng buộc khóa để đảm bảo tính đúng đắn của dữ liệu.

----

## Tóm tắt bài học
Một CSDL quan hệ là một tập hợp các bảng dữ liệu (quan hệ) có liên quan với nhau. Mỗi bảng trong CSDL đều phải có khóa, đó là tập hợp gồm một hay một số trường cho phép xác định duy nhất một bản ghi trong bảng.

Ràng buộc khóa: Không có hai bản ghi giống nhau ở giá trị khóa. Mỗi hệ quản trị CSDL quan hệ đều có cơ chế kiểm soát việc cập nhật dữ liệu để không xảy ra vi phạm ràng buộc khóa đối với mỗi bảng.
# BÀI LIÊN KẾT CÁC BẢNG TRONG CƠ SỞ DỮ LIỆU

Học xong bài này; em sẽ:
- Biết được cách thiết lập mối quan hệ giữa các bảng trong một CSDL để kết nối dữ liệu giữa hai bản ghi từ hai bảng.
- Tạo được CSDL có nhiều bảng.
- Thiết lập được quan hệ giữa các bảng.

----

## Thiết lập mối quan hệ giữa hai bảng

Khi một bạn đọc mượn sách, thủ thư cần ghi lại những thông tin gì? Có một thông tin nào trong CSDL chứa đầy đủ những thông tin này hay không?

### Các lựa chọn kết nối dữ liệu

Thiết lập mối quan hệ giữa hai bảng nhằm mục đích nối (join) dữ liệu giữa hai bản ghi tương ứng trong mỗi bảng. Access sẽ so khớp giá trị của hai trường được liên kết khi truy vấn dữ liệu hay kiểm tra giá trị không thể có một truy vấn khi nhập dữ liệu. Ví dụ: người mượn mà chưa có thẻ thư viện; không thể mượn cuốn sách còn chưa có trong kho sách.

#### Quan hệ

Có ba lựa chọn thuộc tính của phép nối dữ liệu (Join Properties) như trong Hình 1. Khi truy vấn lấy dữ liệu có yêu cầu nối các bản ghi từ hai bảng, trong số các bản ghi đã thoả mãn điều kiện cần biết cách nối cụ thể.

1. Chỉ nối các bản ghi nếu các giá trị trường được kết nối trùng khớp nhau. Đây là phép nối trong (Inner join).
2. Lấy tất cả các bản ghi trong bảng bên trái nhưng chỉ nối với các bản ghi của bảng bên phải khớp giá trị trong trường được kết nối. Đây là phép nối ngoài bên trái (Left outer join).

----

### Hình 1. Các lựa chọn kết nối dữ liệu

| Join Type | Description |
|-----------|-------------|
| Inner Join | Chỉ nối các bản ghi nếu các giá trị trường được kết nối trùng khớp nhau. |
| Left Outer Join | Lấy tất cả các bản ghi trong bảng bên trái nhưng chỉ nối với các bản ghi của bảng bên phải khớp giá trị trong trường được kết nối. |

----

### Kết luận

Việc thiết lập mối quan hệ giữa các bảng trong cơ sở dữ liệu là rất quan trọng để đảm bảo tính chính xác và đầy đủ của dữ liệu khi thực hiện các truy vấn.



# Nối Bảng Trong Access

## 1. Nối Ngoài Bên Phải (Right Outer Join)
Ngược với tùy chọn 2, lấy tất cả các bản ghi trong bảng bên phải nhưng chỉ nối với các bản ghi của bảng bên trái khớp giá trị trong trường được kết nối. Đây là phép nối ngoài bên phải (Right outer join). Access đánh dấu lựa chọn 1: theo mặc định.

## 2. Thao Tác Thiết Lập, Chỉnh Sửa, Xoá Mối Quan Hệ Giữa Hai Bảng
Chọn **Database Tools** > **Relationships** để mở vùng làm việc với các mối quan hệ. Access hiển thị trực quan mối quan hệ giữa hai bảng bằng một đoạn thẳng nối hai bảng ghi kèm các cặp số 1 hay 0 ở hai đầu đoạn nối (Hình 2) nếu đã được thiết lập rõ ràng. Chú ý rằng một bảng có thể liên kết với nhiều bảng khác.

### Hình 2
Vùng làm việc với các mối quan hệ hiển thị các quan hệ hiện có.

## 3. Quy Trình Thiết Lập Mối Quan Hệ Giữa Hai Bảng
Quy trình thiết lập mối quan hệ giữa hai bảng có thể chia làm 3 bước lớn.

### Bước 1: Đưa Hộp Thể Hiện Mỗi Bảng
Đưa hộp thể hiện mỗi bảng (Hình 2) vào vùng làm việc với các mối quan hệ (nếu trong đó còn chưa nhìn thấy bảng mà bạn muốn):
1. Nháy nút lệnh **Show Table**. Hộp thoại **Show Table** xuất hiện.
2. Nháy đúp chuột lên tên bảng: Hộp thể hiện bảng sẽ xuất hiện.

### Bước 2: Tạo Quan Hệ Giữa Hai Bảng
1. Kéo thả chuột từ trường khoá ngoài trong bảng con vào trường khoá chính trong bảng mẹ: hộp thoại **Edit Relationships** xuất hiện (Hình 2).
2. Đánh dấu hộp kiểm **Enforce Referential Integrity** (đảm bảo toàn vẹn tham chiếu) và chọn **Create** hay **OK**.



# Bước 3. Xác định các lựa chọn liên kết dữ liệu:

1. Nháy nút **Join Type** để mở hộp thoại **Join Properties** (nếu chưa xuất hiện) để chọn thuộc tính cho phép nối dữ liệu thực thi mối quan hệ này.
2. Để nguyên như mặc định hoặc đánh dấu chọn thuộc tính kết nối đúng yêu cầu.

## Chỉnh sửa mối quan hệ

1. Chọn mối quan hệ bằng cách nháy chuột lên đường nối hai bảng.
2. Nháy nút lệnh **Edit Relationship**.

## Xoá mối quan hệ

Nháy chuột chọn mối quan hệ, nhấn phím **Delete**.
Chú ý: Nháy chuột phải lên đường nối hai bảng cũng xuất hiện bảng chọn nối lên có hai lệnh **Edit Relationship** và **Delete**.

----

## Cột dữ liệu từ tra cứu

Sử dụng cột dữ liệu từ tra cứu giúp người dùng có thể chọn mục dữ liệu từ một danh sách thay cho gõ nhập. Việc nhập dữ liệu sẽ nhanh hơn và đảm bảo toàn vẹn tham chiếu (Hình 3).

### Hướng dẫn thao tác ích Lookup

| ID       | Bố thể | Mã sách | Ngày mượn |
|----------|--------|---------|------------|
| HS-002   | TH-02  |         | 14/09/20   |
| I1S-001  | AV-01  |         | 16/09/20   |
| HS-Q07   | TO-01  |         | 16/09/20   |
| HS.004   | TO.01  |         | 20/09/20   |
| HS.004   | AN.01  |         | 20/09/20   |
| HS-004   | VH-01  |         | 20/09/20   |
| HS-008   | AN-05  |         | 02/10/20   |
| HS-003   | TH-02  | 10/10/20| 10/10/20   |
| HS.014   | AN-01  | 26/10/20| 26/10/20   |
| HS-011   | AN-05  | 09/11/20| 09/11/20   |
| HS8-009  | TH-01  | 09/11/20| 09/11/20   |
| HS.015   | H-02   | 13/11/20| 13/11/20   |
| HS-016   | TH-10  | 15/11/20| 15/11/20   |
| HS-013   | TO.01  | 01/12/20| 01/12/20   |
| HS-001   | VH-01  | 18/12/20| 18/12/20   |
| HS-001   | VH-02  | 20/12/20| 20/12/20   |

Ta sẽ thiết lập cột **Số thẻ** trong bảng **Mượn-Trả** thành cột dữ liệu từ tra cứu.

1. Mở bảng **Mượn-Trả** trong khung nhìn thiết kế.
2. Thiết lập lại **Data Type** của trường **Số thẻ**: Nháy dấu trỏ xuống để thả danh sách chọn.
3. Nháy chọn **Lookup Wizard** (ở dòng cuối cùng) sẽ làm xuất hiện một loạt hộp thoại để đánh dấu các lựa chọn thứ nhất (Hình 4a):

Hộp thoại **lookup field**:
- Đánh dấu chọn **I want the**.
- Chọn cột có sẵn từ bảng (truy vấn) khác.



# Hướng dẫn sử dụng Lookup Wizard

## 5) Hộp thoại thứ hai (Hình 4b): Lookup Wizard
- Chọn bảng hay truy vấn làm nguồn để tra cứu dữ liệu. Trong ví dụ này, đánh dấu chọn bảng **Bạn Đọc**; chọn **Next**.

## 6) Hộp thoại thứ ba (Hình 4c):
- Chọn các trường dữ liệu trong bảng (hay truy vấn) vừa chọn. Trong ví dụ này, đánh dấu chọn trường **Sổ thẻ** (của bảng Bạn Đọc): Nháy dấu mũi tên "7" để chuyển nó sang **Selected Fields**; chọn **Next**.

| Available Fields | Selected Fields |
|------------------|-----------------|
| Da Hac sinh      | Both            |
| Hg Ya Cem        |                 |
| Ten              |                 |
| Số thẻ          |                 |
| Giai tinh       |                 |
| 58 Gen Uica     |                 |
| Ena              |                 |

## 7) Hộp thoại thứ tư để chọn trường muốn sắp xếp để tiện tra cứu.
- Trong ví dụ này, đó vẫn là trường vừa chọn: chọn trường **Số thẻ** và chọn **Next**.

## 8) Hộp thoại thứ năm (Hình 4d):
- Đặt tên cho trường lookup. Ta giữ nguyên tên là **Số thẻ**; chọn **Finish**.

### Quan sát kết quả:
- Mở bảng trong khung nhìn bảng dữ liệu sẽ thấy có mũi tên trỏ xuống khi chọn để nhập dữ liệu cho trường **Sổ thẻ**. Từ đây thay vì gõ nhập có thể chọn từ danh sách tra cứu.

### Thiết lập đảm bảo toàn vẹn tham chiếu
- Nháy chọn **Database Tools** > **Relationships** sẽ thấy có đường nối giữa hai bảng **Bạn đọc** và **Mượn-Trả** hiển thị trực quan mối quan hệ tra cứu vừa thiết lập.
- Nháy chuột phải lên đường nối này; hộp thoại **Edit Relationships** xuất hiện. Đánh dấu hộp kiểm **Enforce Referential Integrity** và chọn **OK**.

----

**Hình 4. Thiết lập kiểu dữ liệu từ tra cứu**



# Thực hành tạo liên kết giữa các bảng trong CSDL

## Nhiệm vụ 1. Tạo bảng Mượn-Trả theo thiết kế và thử nhập dữ liệu

Các bước tạo bảng tương tự như trong bài học trước.

### Chú ý:
1. Vẫn dùng khóa chính là ID như Access đã chọn mặc định.
2. Các cột Ngày mượn, Ngày Trả nên chọn thuộc tính Format phù hợp - ví dụ Short Date.
3. Nên hạn chế độ dài của các trường Số thẻ, Mã sách giống như ở các bảng Bạn Đọc, bảng Sách.

## Nhiệm vụ 2. Thiết lập mối quan hệ và xác định thuộc tính kết nối dữ liệu giữa các bảng

1. Thiết lập mối quan hệ 1 - 5 từ bảng Sách và từ bảng Bạn Đọc tới bảng Mượn-Trả theo hướng dẫn trong mục Thao tác thiết lập, chỉnh sửa, xóa mối quan hệ giữa hai bảng.
2. Thiết lập cột Số thẻ và cột Mã sách thành kiểu dữ liệu tra cứu.
**Chú ý:** Có thể phải xóa kết quả của yêu cầu 1 và sau đó thiết lập lại thành cột tra cứu.

Theo em, nếu như CSDL của trường có bảng Học sinh và đã thiết lập quan hệ 1 - 1 giữa hai bảng Bạn Đọc và Học sinh thì có thể thiết lập kiểu dữ liệu tra cứu không để không phải gõ nhập lại dữ liệu những cột nào trong bảng Bạn Đọc.

### Câu 1. Cần mở cửa sổ làm việc nào để thiết lập, chỉnh sửa mối quan hệ giữa các bảng CSDL?

### Câu 2. Để thiết lập kiểu dữ liệu từ tra cứu cần thao tác như thế nào?

## Tóm tắt bài học

Các thao tác thiết lập, chỉnh sửa, xóa mối quan hệ giữa hai bảng trong CSDL bắt đầu bằng chọn **Database Tools > Relationships** để mở vùng làm việc với các mối quan hệ.

Thiết lập kiểu dữ liệu từ tra cứu sẽ đảm bảo toàn vẹn tham chiếu.

Kéo thả trường khóa ngoài của bảng con vào trường khóa chính của bảng mẹ để tạo quan hệ giữa hai bảng.

Chọn thuộc tính cho phép nối dữ liệu trong hộp thoại Join Properties.
# BÀI 6: TẠO BÁO CÁO ĐƠN GIẢN

Học xong bài này, em sẽ:
- Thực hiện được việc kết xuất thông tin từ CSDL
- Tìm hiểu được thêm một vài chức năng của hệ quản trị CSDL

Theo em hiểu "làm báo cáo" nghĩa là gì?

## Xây dựng báo cáo đơn giản

### a) Các loại báo cáo

Xây dựng báo cáo là khâu quan trọng cuối cùng hoàn tất việc kết xuất thông tin từ CSDL phục vụ người dùng. Báo cáo nhằm đáp ứng yêu cầu thông tin của cấp quản lý cơ quan, doanh nghiệp. Mỗi khi chạy thực thi báo cáo, thông tin được kết xuất từ dữ liệu cập nhật mới nhất. Khác với biểu mẫu, người xem báo cáo không sửa đổi được các mục dữ liệu.

- **Báo cáo chi tiết**: Hiển thị tất cả các bản ghi đã chọn, được phân nhóm và sắp xếp. Có thể thêm số liệu tóm tắt mỗi nhóm, ví dụ như: tổng con, số đếm, tỷ lệ phần trăm. Cuối báo cáo thường có các số liệu tổng hợp toàn bộ.

- **Báo cáo tóm tắt**: Không liệt kê các bản ghi đã chọn, chỉ trình bày các số liệu tổng hợp nhóm theo một chiều nào đó. Ví dụ, tổng hợp theo tháng, theo quý, theo năm (chiều thời gian); tổng hợp theo các chi nhánh khác nhau: Hà Nội, Hải Phòng, Đà Nẵng, Hồ Chí Minh (chiều địa điểm).

- **Báo cáo tóm tắt phân tích nhiều chiều**: Dựa trên một mẫu truy vấn riêng bằng Crosstab Query Wizard. Ví dụ, báo cáo phân tích theo cả hai chiều, thời gian (theo tháng, theo quý, theo năm) và theo các chi nhánh ở nhiều địa phương khác nhau.

Báo cáo được xây dựng dựa trên nguồn dữ liệu là bảng hay truy vấn. Để xây dựng báo cáo, cần biết sẽ dùng đến những trường dữ liệu nào và nên chuẩn bị sắp xếp, chọn lọc sẵn từ trước bằng một truy vấn.



## b) Truy vấn chuẩn bị dữ liệu

Giả sử ta cần làm báo cáo chi tiết hoạt động mượn trả sách của thư viện theo từng tháng, cho biết mỗi tháng có bao nhiêu giao dịch mượn sách và đồng thời phân tích số liệu theo loại sách được mượn. Cần thiết kế truy vấn (Hình 1) lấy dữ liệu từ các bảng cơ sở: bảng Mượn-Trả và bảng Sách (để có trường loại sách).

### Mượn-Trả - Tháng
| Mượn-Trả | Sách |
|-----------|------|
| Số thẻ   | Mã sách |
| Mã sách  | Tên sách |
| Ngày mượn| Số lượng |
| Ngày trả  |        |

- **Field**:
- Số thẻ
- Mã sách
- Ngày mượn
- Ngày trả
- **Table**: Mượn-Trả
- **Sort**: Tăng dần
- **Show**:
- **Criteria**:

### Hình 1. Một ví dụ truy vấn chuẩn bị báo cáo chi tiết

Chú ý các chi tiết trong Hình 1:
- Sắp xếp theo Ngày mượn là để nhóm theo từng tháng.
- Gõ nhập trực tiếp cho cột `Month: Month([Ngày mượn])` để trích ra phần 'tháng' từ Ngày mượn.

Ghi lưu truy vấn, ví dụ với tên là "q-MượnTrả-Month".

## c) Tạo nhanh báo cáo đơn giản

**Bước 1**: Mở truy vấn 'q-Mượn Trả-Month' (hoặc chỉ cần đánh dấu chọn).

**Bước 2**: Nháy chọn `Create Report` sẽ tạo một báo cáo.

**Bước 3**: Ghi lưu với tên `Mượn Trả-Month`.

Đây là báo cáo chi tiết, hiển thị đầy đủ các bảng hi. Sau đó có thể thêm gộp nhóm và thông tin tóm tắt theo nhóm.

### Hướng dẫn sử dụng Report Wizard

Trình tiện ích Report Wizard hỗ trợ tạo báo cáo và cho phép lựa chọn tùy biến theo yêu cầu.

**Bước 1**: Nháy chuột chọn `Create Report Wizard`.



# Hướng dẫn sử dụng Report Wizard

## Bước 2: Chọn bảng hoặc truy vấn
Làm nguồn dữ liệu cơ sở cho báo cáo.
Ví dụ, chọn bảng Mượn-Trả (Hình 2a).

## Bước 3: Chọn các trường dữ liệu cần báo cáo
Ví dụ: Số thẻ, Mã sách, Ngày Mượn; nháy vào dấu để chuyển sang hộp Selected Fields; nháy Next.

### Trường đã chọn
| Selected Fields |          |
|------------------|----------|
| Mã sách          |          |
| Ngày mượn        |          |
| Ngày trả         |          |
| Chú thích        |          |

## Bước 4: Chọn gộp nhóm theo trường dữ liệu nào
Ví dụ, chọn nhóm theo Sổ thẻ tức là nhóm theo từng bạn đọc; nháy Next (Hình 2b).

## Bước 5: Chọn một bài tri cơ sở cho báo cáo
Lựa chọn mặc định là 'Tabular' nhưng có thể thay đổi nếu muốn; nháy Next.

## Bước 6: Nhập tên báo cáo trước khi chọn Finish
Nên đặt tên gợi nhớ nội dung báo cáo. Ví dụ: Mượn-Trả - theo Bạn đọc.

Sau khi được tạo ra, biểu tượng của báo cáo sẽ xuất hiện trong vùng điều hướng. Ta có thể mở ra bất cứ lúc nào để chỉnh sửa lại thiết kế theo mong muốn hoặc cho chạy để lấy thông tin mới cập nhật.

## Gộp nhóm, sắp xếp và các tổng con
Gộp nhóm các bản ghi là để tóm tắt dữ liệu nhằm hiển thị thông con (hay giá trị trung bình, giá trị cực tiểu, giá trị cực đại) cho mỗi trường dữ liệu kiểu số của từng nhóm bản ghi (nhóm hàng). Sau khi gộp nhóm thì dữ liệu từng nhóm xuất hiện trong phần Detail (Hình 3). Ví dụ, ta muốn tóm tắt hoạt động mượn trả theo từng tháng.

### Hướng dẫn thực hiện:
1. Mở báo cáo chi tiết "Mượn-Trả-Month" trong khung nhìn thiết kế.
2. Nháy vào lệnh Group &#x26; Sort trong vùng nút lệnh. Cửa sổ Group Sort, and Total xuất hiện ở đáy màn hình.



# Hướng dẫn tạo báo cáo đơn giản

## Bước 2
- Nháy nút lệnh **Add a group**; nháy vào mũi tên trỏ xuống cạnh **selected field**; tiếp tục nháy chọn **Month** (Hình 3).

## Bước 3
- **Access** gợi ý sắp xếp tăng dần "from smallest to largest". Bỏ qua **Month** vì ta đã sắp xếp theo **Ngày mượn** khi truy vấn.

## Bước 4
- Nháy mũi tên **More** để thấy các lựa chọn tóm tắt dữ liệu (nếu chưa thấy). **Access** đưa ra gợi ý sẵn, thường là đã phù hợp. Tuy nhiên ta có thể thay đổi nếu không đúng yêu cầu, ví dụ, nháy mũi tên xuống và chọn **Total On**: Sổ thẻ, chọn kiểu **Type**: **Count Values** (Hình 4).

## Bước 5
- Đánh dấu chọn cách hiển thị, ví dụ **Show Grand Total** và **Show subtotal in group header** (Hình "Theo Tháng"). Chuyển sang khung nhìn báo cáo.

## Bước 6
- Ghi lưu với tên **Mượn Trả** để xem kết quả.

| HS-002 | TH-02 | Totals |
|--------|-------|--------|
| 10     |       | Total  |
| HS-014 | TH-01 | Type: Count Values |
| HS-003 | TH-01 | Show Grand Total: |
|        |       | Show Group subtotal 15% of Grand Total |

- **Group Sort and Total**:
- **Group on Month** (from smallest to largest)
- **Show subtotal in group header**
- **Show subtotal in group footer**

Hình 4. Lựa chọn cách tóm tắt số liệu từng nhóm.

## Thực hành tạo báo cáo đơn giản

### Nhiệm vụ 1
Theo hướng dẫn chi tiết từng bước trong bài học, thực hiện các việc sau:
- a) Tạo truy vấn dữ liệu làm nguồn dữ liệu cho báo cáo.
- b) Tạo báo cáo đơn giản bằng nút lệnh **Report**; ghi lưu kết quả thành báo cáo **Mượn Trả - Month**.

### Nhiệm vụ 2
Sử dụng báo cáo vừa tạo ở Bài 1, thực hiện các việc sau:
- a) Mở báo cáo **Mượn Trả - Month**.
- b) Lặp lại từng bước theo hướng dẫn để gộp nhóm theo tháng, tính các tổng cộng và xác định cách hiển thị. Kiểm tra kết quả. Ghi lưu.



# Thiết kế truy vấn làm cơ sở để báo cáo chi tiết từng bạn đọc mượn sách trong năm học

**Mượn-Trả; sắp xếp theo Số thẻ**

Gợi ý: Lấy dữ liệu từ hai bảng Bạn Đọc và bảng Mượn-Trả.

## Câu hỏi

1. Báo cáo chi tiết khác với báo cáo tóm tắt ở điểm nào?
2. Khi nào nên dùng nút lệnh tạo báo cáo nhanh? Khi nào nên dùng công cụ Report Wizard?

## Tóm tắt bài học

- Lệnh Report giúp dễ dàng tạo báo cáo chi tiết có phân nhóm dựa trên truy vấn có sắp xếp kết quả thích hợp.
- Trình tiện ích Report Wizard hỗ trợ tạo báo cáo lấy dữ liệu từ nhiều bảng hay truy vấn, có các tùy chọn sắp xếp và bài trí đa dạng.
- Trong khung nhìn thiết kế báo cáo, nhóm lệnh Group &#x26; Sort hỗ trợ phân nhóm; sắp xếp và thêm các loại tổng con.

## BÀI TÌM HIỂU THÊM

### BÁO CÁO PHÂN TÍCH NHIỀU CHIỀU

Truy vấn Crosstab Query Wizard là tiện ích tạo truy vấn tóm tắt nguồn dữ liệu lớn, phức tạp, đáp ứng yêu cầu tổng hợp số liệu và phân tích theo nhiều cách. Access có sẵn nhiều hàm gộp để tổng hợp số liệu như:
- Sum
- Count
- Min
- Max
- Avg (tính trung bình)

được dùng trong mẫu truy vấn đặc thù này. Báo cáo phân tích nhiều chiều dựa trên truy vấn crosstab.

**Hình 5** minh họa một trường hợp rất đơn giản. Đó là một báo cáo tóm tắt hoạt động của thư viện theo tháng có phân tích theo loại sách:
- **TH** là Tin học.
- **Khác** là không phải Tin học.
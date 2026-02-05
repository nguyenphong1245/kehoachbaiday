# BÀI 28: THỰC HÀNH TRẢI NGHIỆM TRÍCH RÚT THÔNG TIN VÀ TRI THỨC

## SAU BÀI HỌC NÀY EM SẼ:
- Sử dụng bảng tính điện tử để thực hành một số bước xử lý và phân tích dữ liệu đơn giản.
- Nêu được trải nghiệm của bản thân trong việc trích rút thông tin và tri thức hữu ích từ dữ liệu đã có.

## NỘI DUNG LÝ THUYẾT:
Có thể hiểu phân tích dữ liệu là việc trích rút thông tin hữu ích giúp tạo ra tri thức mới từ dữ liệu đã thu thập được. Trong thực tế, công việc này thường gắn với việc xử lý để biến đổi dữ liệu về dạng thuận tiện; phù hợp với yêu cầu phân tích.

Hãy trao đổi và cho biết; nếu dữ liệu dạng file Excel có 2 cột: Số tuổi và Thu nhập, trong trường hợp muốn tổng hợp kết quả thu nhập theo độ tuổi thì cần bổ sung thêm cột dữ liệu nào? Dữ liệu cột đó có thể lấy từ đâu và bằng cách nào?

## NHIỆM VỤ CHUNG:
Thực hiện một số bước xử lý và phân tích dữ liệu đơn giản.

### YÊU CẦU:
Phân tích mối quan hệ giữa các nhóm khách hàng với xếp hạng khả năng tín dụng.

Dữ liệu sử dụng trong bài học được trích rút từ nguồn dữ liệu nêu trong trang web của Kaggle. Đây là dữ liệu xếp hạng khả năng tín dụng khách hàng của một đơn vị cho vay tài chính; gồm các cột Mã định danh; Số tuổi, Thu nhập năm (tính theo USD) và Khả năng tín dụng (Hình 28.1). Dưới đây, em sẽ được hướng dẫn thực hiện vài thao tác xử lý và phân tích dữ liệu; với một số công cụ của Excel Data Analysis (Microsoft Office 365). Thông qua đó, em có được trải nghiệm bước đầu về việc trích rút thông tin và tri thức hữu ích từ dữ liệu.

## NHIỆM VỤ 1: CHUẨN BỊ DỮ LIỆU VỚI POWER QUERY
### YÊU CẦU:
Bổ sung phân loại dữ liệu từ dữ liệu đã có.

### HƯỚNG DẪN:
Chuẩn bị dữ liệu gồm nhiều công đoạn khác nhau; là một trong những giai đoạn mất nhiều thời gian và công sức nhất của quy trình khoa học dữ liệu. Tuy nhiên, trong nhiệm vụ này; ta sẽ chỉ thực hiện việc bổ sung thêm cột mới trong bảng dữ liệu đã có. Nói chung, việc thay đổi các cột dữ liệu (cột nào thêm vào; cột nào bỏ đi) cần được cân nhắc trước khi bắt đầu giai đoạn Chuẩn bị dữ liệu, xuất phát từ yêu cầu phân tích dữ liệu:

Ví dụ; từ yêu cầu phân tích dữ liệu của Nhiệm vụ chung đã nêu ở trên, nhằm phân tích khả năng tín dụng theo độ tuổi hoặc theo mức thu nhập; ta sẽ cần bổ sung các cột Nhóm Tuổi và Mức thu nhập dựa trên số liệu các cột Số tuổi và Thu nhập năm.

### a) TẢI DỮ LIỆU VÀO POWER QUERY
- **Bước 1:** Tải dữ liệu từ trang hanhtrangso nxbgd.vn và lưu với tên VD_KHDL.
- **Bước 2:** Mở tệp VD_KHDL trong Excel.

## HÌNH 28.1: XẾP HẠNG KHẢ NĂNG TÍN DỤNG KHÁCH HÀNG
*(Hình ảnh mô tả về xếp hạng khả năng tín dụng khách hàng công ty tài chính)*

## BÀI TẬP VÀ CÂU HỎI:
1. Hãy nêu các bước cần thực hiện để bổ sung cột Nhóm Tuổi và Mức thu nhập vào bảng dữ liệu.
2. Phân tích mối quan hệ giữa độ tuổi và khả năng tín dụng dựa trên dữ liệu đã cho.
3. Trình bày kết quả phân tích của bạn dưới dạng biểu đồ hoặc bảng biểu.

## BẢNG BIỂU:
*(Chưa có bảng biểu cụ thể trong nội dung trích xuất, nhưng có thể yêu cầu học sinh tạo bảng biểu từ dữ liệu đã phân tích.)*



# Bài học: Tiền xử lý dữ liệu trong Excel

## Nội dung lý thuyết
Tiền xử lý dữ liệu là bước quan trọng trong quá trình phân tích dữ liệu, giúp làm sạch và chuẩn hóa dữ liệu trước khi thực hiện các phân tích sâu hơn. Trong Excel, chúng ta có thể sử dụng các công cụ để tạo ra các cột mới dựa trên các điều kiện nhất định từ các cột dữ liệu hiện có.

## Ví dụ minh họa
### Bước 1: Tạo cột Mức thu nhập từ cột Thu nhập năm
- Nháy chuột chọn cột Thu nhập năm.
- Trên thanh công cụ, chọn **Add Column** > **Conditional Column** (Hình 28.2).
- Phân mức thu nhập thành các nhóm:
- Thấp: &#x3C;= $25,000
- Trung bình: ($25,000, $50,000]
- Khá: ($50,000, $75,000]
- Cao: >= $75,000
- Nhấn OK để hoàn thành việc phân mức (Hình 28.3).

### Hình 28.2: Tạo cột phân loại dữ liệu
![Hình 28.2: Tạo cột phân loại dữ liệu](#)

### Hình 28.3: Tạo phân loại mức thu nhập
![Hình 28.3: Tạo phân loại mức thu nhập](#)

### Bước 2: Tạo cột Nhóm tuổi
- Thực hiện các thao tác tương tự Bước 1 đối với cột Số tuổi để tạo cột Nhóm tuổi:
- 21
- 21 - 30
- 31 - 40
- 41 - 50
- > 50

### Kết quả nhận được là bảng dữ liệu như Hình 28.4
| Mã định danh | Số tuổi | Thu nhập năm (USD) | Khả năng tín dụng | Mức thu nhập | Nhóm tuổi |
|--------------|---------|---------------------|-------------------|---------------|-----------|
| EAAED9C4     | 35      | 547,71              | Trung Bình        | Trung bình    | 21 - 30   |
| 3C8C3A4B     | 35      | 547,71              | Trung Bình        | Trung bình    | &#x3C; 21     |
| BDBEEA32     | 35      | 547,71              | Trung Bình        | Trung bình    | 21 - 30   |
| 988576F0     | 35      | 547,71              | Trung Bình        | Trung bình    | 21 - 30   |
| D1315846     | 12      | 986,75              | Trung Bình        | Thấp          | &#x3C; 21     |

### Hình 28.4: Kết quả bổ sung cột mới từ dữ liệu các cột đã có
![Hình 28.4: Kết quả bổ sung cột mới từ dữ liệu các cột đã có](#)

## Bài tập và câu hỏi
1. Hãy tạo một cột mới trong bảng dữ liệu của bạn để phân loại mức thu nhập theo các nhóm đã nêu.
2. Tạo một cột Nhóm tuổi tương tự như trong ví dụ và cho biết kết quả.
3. Giải thích ý nghĩa của việc phân loại dữ liệu trong phân tích dữ liệu.

## Hình ảnh mô tả
- Hình 28.2 và Hình 28.3 mô tả các bước thực hiện trong Excel để tạo cột phân loại dữ liệu.
- Hình 28.4 thể hiện kết quả cuối cùng sau khi thực hiện các thao tác trên.

## Bảng biểu
- Bảng dữ liệu kết quả cho thấy mối quan hệ giữa các cột dữ liệu và các nhóm phân loại đã được tạo ra.



# Bài học: Tiền xử lý dữ liệu trong Excel

## Nội dung lý thuyết
Tiền xử lý dữ liệu là bước quan trọng trong quá trình phân tích dữ liệu. Trong Excel, người dùng có thể thực hiện các thao tác để làm sạch và chuẩn hóa dữ liệu trước khi tiến hành phân tích. Các bước tiền xử lý bao gồm lưu dữ liệu đã qua xử lý, đổi tên bảng dữ liệu, và tạo trình tự sắp xếp dữ liệu mong muốn.

### Bước 3: Lưu dữ liệu đã qua tiền xử lý
- Dữ liệu sau xử lý sẽ được lưu thành một Sheet mới. Có thể đổi tên Sheet đó, ví dụ thành 'Done Query' cho dễ nhớ để sử dụng sau này.

### Bước 4: Đổi tên bảng dữ liệu
- Có thể thực hiện việc đổi tên bảng dữ liệu đã qua xử lý thành "Processed Data" để thuận tiện cho việc lập bảng tổng hợp bằng PivotTable sau này:
- Nháy chuột vào ô bất kỳ trong bảng dữ liệu đã qua tiền xử lý.
- Trên thanh công cụ, chọn Table Design.
- Di chuyển chuột đến Table Name và đổi tên bảng theo yêu cầu (Hình 28.5).

## Ví dụ minh họa
- Nhập tên bảng "Processed_Data".

### Hình 28.5: Đổi tên bảng sau khi xử lý dữ liệu
![Hình 28.5](link_to_image)

## Bài tập và câu hỏi
1. Hãy mô tả quy trình lưu dữ liệu đã qua tiền xử lý trong Excel.
2. Tại sao việc đổi tên bảng dữ liệu lại quan trọng trong quá trình phân tích dữ liệu?
3. Hãy thực hiện các bước để tạo danh sách trình tự sắp xếp cho cột "Khả Năng Tín Dụng".

## Hình ảnh mô tả
- Hình 28.5: Đổi tên bảng sau khi xử lý dữ liệu.

## Bảng biểu
| Tên Bảng        | Tình Trạng        |
|------------------|-------------------|
| Processed_Data   | Đã hoàn thành     |
| Raw_Data         | Chưa xử lý        |

### Lưu ý
- Sau khi đã lưu kết quả tiền xử lý dữ liệu, nếu muốn tiếp tục thực hiện thêm những thao tác khác với các cột dữ liệu, thì chỉ cần hiển bảng chọn như Hình 28.5, chọn Query -> Edit.

### Tạo trình tự sắp xếp dữ liệu mong muốn
- Cột "Khả Năng Tín Dụng" có ba hạng mục: Kém, Trung Bình, Tốt. Theo trình tự mặc định của bảng chữ cái, khi sắp xếp, dữ liệu cột này sẽ được xếp theo thứ tự Kém - Tốt - Trung Bình. Để thay đổi trình tự sắp xếp dữ liệu này theo mong muốn, ví dụ theo trình tự Kém - Trung Bình - Tốt, ta cần thực hiện các bước sau:
- Bước 1: File -> Options -> Custom Lists.
- Bước 2: Di chuột xuống mục General -> Custom Lists.
- Bước 3: Tạo danh sách mới: NEW LIST (xem Hình 28.6).

### Hình 28.6: Tạo danh sách trình tự sắp xếp
![Hình 28.6](link_to_image)



# Bài học: Tổng hợp dữ liệu bằng PivotTable

## Nội dung lý thuyết
PivotTable (Bảng tổng hợp) là một công cụ mạnh mẽ trong Excel giúp người dùng tổng hợp và phân tích dữ liệu một cách nhanh chóng và hiệu quả. Bằng cách sử dụng PivotTable, người dùng có thể dễ dàng tạo ra các báo cáo tổng hợp từ một bảng dữ liệu lớn mà không cần phải viết công thức phức tạp.

### Hướng dẫn: Sử dụng PivotTable trong Excel để tổng hợp dữ liệu
1. **Khởi tạo bảng PivotTable**
- **Bước 1:** Nhấn chuột vào ô bất kỳ trong bảng `Processed_Data` đã qua tiền xử lý.
- **Bước 2:** Trên thanh công cụ, chọn `Insert` > `PivotTable`.
- Chọn `New Worksheet`.
- Nhấn `OK`.

2. **Tạo bảng tổng hợp Khả năng tín dụng theo Mức thu nhập**
- **Bước 1:** Tạo bảng tổng hợp để tính số lượng mỗi hạng mức tín dụng theo từng nhóm thu nhập bằng cách kéo thả các cột vào các vùng `Columns`, `Rows` và `Values` tương ứng (Hình 28.7). Trong đó, `Rows` là tiêu chí được sử dụng để tổng hợp dữ liệu có trong `Columns`.
- **Bước 2:** Thực hiện việc kéo thả các cột dữ liệu vào các vùng `Columns`, `Rows` và `Values` tương ứng và quan sát sự thay đổi kết quả trên màn hình để chọn bảng tổng hợp phù hợp với mong muốn (ví dụ như Hình 28.8, trong đó `Grand Total` là kết quả tổng cộng theo hàng/cột dữ liệu tương ứng).

## Ví dụ minh họa
### Hình 28.7: Tạo bảng thống kê khả năng tín dụng theo nhóm thu nhập
```
Count of Khả năng tín dụng
Column Labels
Row Labels           Kém                Trung Bình Tốt               Grand Total
Cao                                3 480      12 121         6 421         22 022
Khả                                5 210      8 535          1 974         15 719
Trung bình                        6 868      13 974        5 316         26 158
Thấp                               12 310     16 450         3 482         32 242
Grand Total                        27 868     51 080       17 193         96 141
```
### Hình 28.8: Kết quả thống kê khả năng tín dụng theo nhóm thu nhập

## Bài tập và câu hỏi
1. Hãy tạo một bảng PivotTable từ một bảng dữ liệu mẫu và thực hiện các bước như đã hướng dẫn.
2. So sánh số lượng khách hàng ở các nhóm thu nhập khác nhau và đưa ra nhận xét về sự khác biệt giữa các mức tín dụng.
3. Điều chỉnh bảng tổng hợp để tính toán tỷ lệ phần trăm thay cho số lượng khách hàng tuyệt đối.

## Hình ảnh mô tả
- **Hình 28.7:** Mô tả cách tạo bảng thống kê khả năng tín dụng theo nhóm thu nhập.
- **Hình 28.8:** Hiển thị kết quả thống kê khả năng tín dụng theo nhóm thu nhập.

## Bảng biểu
| Khả năng tín dụng | Kém | Trung Bình | Tốt | Grand Total |
|-------------------|-----|------------|-----|-------------|
| Cao               | 3 480 | 12 121 | 6 421 | 22 022 |
| Khả               | 5 210 | 8 535  | 1 974 | 15 719 |
| Trung bình        | 6 868 | 13 974 | 5 316 | 26 158 |
| Thấp              | 12 310 | 16 450 | 3 482 | 32 242 |
| **Grand Total**   | 27 868 | 51 080 | 17 193 | 96 141 |




# Bài học: Phân tích dữ liệu với PivotTable và biểu đồ

## Nội dung lý thuyết
Trong bài học này, chúng ta sẽ tìm hiểu cách sử dụng PivotTable để tổng hợp dữ liệu và cách tạo biểu đồ để trực quan hóa dữ liệu đó. Việc sử dụng PivotTable giúp chúng ta dễ dàng phân tích và rút ra thông tin từ dữ liệu lớn.

## Ví dụ minh họa
### Bảng tổng hợp khả năng tín dụng theo nhóm thu nhập
Sau khi thực hiện các bước trong PivotTable, chúng ta nhận được bảng tổng hợp như sau:

| Row Labels | Kém     | Trung Bình | Tốt     | Grand Total |
|------------|---------|------------|---------|-------------|
| Cao        | 15,80%  | 55,04%     | 29,16%  | 100,00%     |
| Khá        | 33,14%  | 54,30%     | 12,56%  | 100,00%     |
| Trung bình | 26,26%  | 53,42%     | 20,32%  | 100,00%     |
| Thấp       | 38,19%  | 51,02%     | 10,80%  | 100,00%     |
| Grand Total | 28,99% | 53,13%     | 17,89%  | 100,00%     |

### Hình 28.9
*Hình 28.9. Kết quả tổng hợp khả năng tín dụng theo nhóm thu nhập (tính theo %)*

## Bài tập và câu hỏi
### Nhiệm vụ 3: Tạo biểu đồ trực quan hóa dữ liệu
**Yêu cầu:** Tạo biểu đồ mô tả dữ liệu tổng hợp do PivotTable tạo ra.

**Hướng dẫn:** Sử dụng PivotChart trong Excel, một công cụ liên kết với PivotTable, để thực hiện nhiệm vụ này.

**Bước 1:** Nháy chuột vào vị trí bất kỳ trong bảng tổng hợp do PivotTable tạo ra (Hình 28.9).

**Bước 2:** Trên thanh công cụ, chọn Insert -> PivotChart -> Column -> OK. Ta nhận được biểu diễn dữ liệu nêu trên bằng biểu đồ cột (xem Hình 28.10).

### Hình 28.10
*Hình 28.10. Biểu đồ khả năng tín dụng theo nhóm thu nhập*

## Lưu ý
Hình 28.10 là biểu đồ kết quả được bổ sung thêm nhãn dữ liệu, tên các mức thu nhập, tiêu đề cột ở mỗi trục biểu đồ, để dễ dàng đọc số liệu qua biểu đồ. Việc bổ sung này được thực hiện tương tự như khi lập biểu đồ trong Excel.

## Nhiệm vụ 4: Phân tích kết quả tổng hợp dữ liệu
**Yêu cầu:** Quan sát kết quả tổng hợp và biểu diễn dữ liệu để rút ra các kết luận về tính chất mối quan hệ, xu hướng dữ liệu (nếu có) dựa trên mục tiêu phân tích dữ liệu đặt ra.

**Hướng dẫn:** Việc phân tích kết quả tổng hợp dữ liệu là một phần của quá trình phân tích dữ liệu. Công việc này trên thực tế là việc trích rút các thông tin và tri thức hữu ích có ý nghĩa để trả lời các câu hỏi xuất phát từ mục tiêu phân tích dữ liệu.



# Tiêu đề bài học
Khả năng tín dụng và phân tích dữ liệu

## Nội dung lý thuyết
Khả năng tín dụng của khách hàng được phân loại theo các nhóm thu nhập khác nhau. Dựa vào bảng tổng hợp và biểu đồ tương ứng, chúng ta có thể phân tích và nhận định về khả năng tín dụng của từng nhóm.

## Ví dụ minh họa
Căn cứ bảng tổng hợp và biểu đồ tương ứng ở Hình 28.9 và Hình 28.10, có thể dễ dàng nhận thấy rằng khả năng tín dụng Trung bình ổn định nhất trong tất cả các nhóm thu nhập và chiếm trên 50% tổng số khách hàng của từng nhóm.

## Bài tập và câu hỏi
1. Nhóm thu nhập nào có tỉ lệ phần trăm khách hàng có khả năng tín dụng mức Tốt cao nhất?
2. Nhóm thu nhập nào có tỉ lệ phần trăm khách hàng có khả năng tín dụng mức Kém cao nhất?
3. Nhóm thu nhập nào có số lượng khách hàng có khả năng tín dụng Tốt gần gấp đôi số khách hàng có khả năng tín dụng Kém?
4. Nhóm thu nhập nào có khả năng tín dụng mức Kém cao hơn mức Tốt?

**Lưu ý:** Kết quả phân tích dữ liệu có thể trở thành tiền đề cho một nghiên cứu tiếp theo. Ví dụ, trong nhóm khách hàng có mức thu nhập loại Khá, số có khả năng tín dụng mức Kém lớn gần gấp ba số có khả năng tín dụng mức Tốt - điều này có thể gợi ý cho một việc thực hiện một cuộc điều tra xã hội nhằm tìm hiểu nguyên nhân của thực tế này.

## Hình ảnh mô tả
- **Hình 28.9:** Biểu đồ khả năng tín dụng theo nhóm thu nhập.
- **Hình 28.10:** Bảng tổng hợp khả năng tín dụng.
- **Hình 28.11:** Nhiệt độ và lượng mưa tại Trường Sa.

## Bảng biểu
| Tháng | Nhiệt độ (°C) | Lượng mưa (mm) |
|-------|----------------|-----------------|
| 1     | 26.8          | 182.0           |
| 2     | 27.0          | 90.1            |
| 3     | 28.0          | 101.2           |
| 4     | 29.1          | 62.5            |
| 5     | 29.5          | 130.3           |
| 6     | 28.9          | 202.4           |
| 7     | 28.4          | 272.5           |
| 8     | 28.5          | 249.8           |
| 9     | 28.3          | 251.3           |
| 10    | 28.2          | 338.8           |
| 11    | 28.0          | 361.2           |
| 12    | 27.1          | 505.0           |

## Vận dụng
Trong Hình 28.11 là nhiệt độ và lượng mưa đo được tại Trường Sa. Những thông tin hữu ích nào có thể rút ra từ dữ liệu này? Nếu biết mùa mưa là mùa có 3 tháng liên tiếp lượng mưa trung bình trên 100 mm và lớn hơn các tháng còn lại, thì mùa mưa ở Trường Sa là những tháng nào?
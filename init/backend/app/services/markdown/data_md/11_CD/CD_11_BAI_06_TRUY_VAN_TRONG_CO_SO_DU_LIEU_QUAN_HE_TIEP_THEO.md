# TRUY VẤN TRONG CƠ SỞ DỮ LIỆU QUAN HỆ
(tiếp theo)

Học xong bài này em sẽ:
- Đưa ra được một vài ví dụ minh họa việc dùng truy vấn để tổng hợp, tìm kiếm dữ liệu trên hơn một bảng.

Theo em, việc khai báo liên kết giữa một số bảng trong một CSDL quan hệ có nghĩa gì?

## Câu lệnh truy vấn SQL với liên kết các bảng

Xét CSDL được mô tả như ở Hình 1. Nếu cần biết tên quyển sách mà người có thẻ thư viện HS-O01 đã mượn vào ngày 02/10/2022, ta có thể dùng câu truy vấn trên một bảng được không? Nếu tìm thông tin này bằng cách tra cứu thủ công (không dùng máy tính) thì em sẽ làm như thế nào?

### Bảng MƯỢN-TRA

| Số thẻ   | Mã sách | Ngày mượn   | Ngày trả    |
|----------|---------|--------------|-------------|
| HS-001   | AN-01   | 02/10/2022   | 09/10/2022  |
| HS-002   | TH-01   | 14/10/2022   | 21/10/2022  |
| HS-003   | AN-01   | 14/10/2022   |             |
| HS-003   | TO-01   | 15/10/2022   | 25/10/2022  |
| HS-001   | TH-02   | 15/10/2022   | 27/10/2022  |

### Bảng NGƯỜI ĐỌC

| Sổ thẻ   | Họ và tên      | Ngày sinh   | Lớp  | Mã sách | Tên sách                     | Tác giả              | Trang |
|----------|----------------|-------------|------|---------|------------------------------|----------------------|-------|
| HS-001   | Tran Van An    | 14/9/2006   | 12A2 | AN-01   | Âm nhạc quanh ta            | Pham Tuyen           | 181   |
| HS-002   | Le Binh        | 02/3/2007   | 11A1 | TO-01   | Sáng tạo loạn học           | Polya                | 308   |
| HS-003   | Ha Thi Mai     | 16/9/2007   | 11A2 | TH-01   | Trí tuệ nhân tạo            | Lasse Rouhaine       | 306   |
|          |                |             |      | TH-02   | AI = Trí tuệ nhân tạo       | Lasse Rouhaine       | 306   |

### Hình 2. Một quan hệ giữa ba bảng trong CSDL

Đọc bản mới nhất trên hoc10.vn                                                            Bản sách mẫu



# Hướng dẫn kết hợp dữ liệu trong CSDL

Khi khai thác CSDL quan hệ, cần phải kết hợp dữ liệu ở hai hoặc nhiều bảng để đưa ra được dữ liệu cần tìm. Kiểu kết hợp thường gặp là ghép nối một bảng này với một hay nhiều bản ghi của bảng khác, tạo nên một hay nhiều bản ghi mới, đẩy đủ thông tin hơn. Kết quả của các ghép nối là các bản ghi mới được đưa vào một bảng tạm thời.

## Ví dụ

Hệ quản trị CSDL sẽ chọn lựa trong bảng tạm thời này dữ liệu thoả mãn điều kiện tìm để đưa ra kết quả. Chẳng hạn, để tìm mã sách của những quyển sách mà học sinh Trần Văn An đã mượn, hệ quản trị CSDL cần kết hợp dữ liệu bảng NGƯỜI ĐỌC với dữ liệu ở bảng MƯỢN-TRA. Mục đích kết hợp hai bảng này là để có một hợp dữ liệu của bảng dữ liệu tạm thời mà mỗi bản ghi của nó cho ta dữ liệu cần thiết, bao gồm họ và tên, số thẻ TT của một người đọc cùng với mã sách của quyển sách họ mượn và ngày mượn (Hình 2).

### Điều kiện kết nối

Khi kết hợp dữ liệu, hai bản ghi thuộc hai bảng khác nhau trong CSDL chỉ được ghép lại nếu chúng thoả mãn một điều kiện mà ta gọi là điều kiện kết nối. Trong tình huống nêu trên, điều kiện kết nối là giá trị ở trường Số thẻ TF của hai bản ghi đó phải trùng nhau.

| BẢNG MƯỢN-TRẢ | Số thẻ | Mã sách | Ngày mượn | Ngày trả | | | |
|----------------|--------|---------|------------|----------|---|---|---|
| BANG NGƯỜI ĐỌC |        |         |            |          | | | |
| HS-001         | Tran Văn An | 14/09/2006 | 12A2 | HS-001 | AN-01 | 02/10/2022 | 09/10/2022 |
| HS-002         | Lê Bình | 02/03/2007 | 11A1 | HS-002 | TH-01 | 14/10/2022 | 21/10/2022 |
| HS-003         | Hà Thị Mai | 16/09/2007 | 11A2 | HS-003 | AN-01 | 14/10/2022 | 25/10/2022 |

### Kết nối bảng NGƯỜI ĐỌC và bảng MƯỢN-TRẢ

Hình 2: Kết nối bảng NGƯỜI ĐỌC và bảng MƯỢN-TRẢ với điều kiện số thẻ trùng nhau.

Việc trích rút dữ liệu từ nhiều bảng khác nhau được thực hiện như truy vấn trên một bảng dữ liệu. Đó là bảng dữ liệu tạm thời chứa kết quả kết nối các bản ghi. Trong hình 2, hệ quản trị CSDL chỉ việc lựa chọn dữ liệu trong bảng kết quả kết nối đó để đưa ra Trần Văn An đã mượn quyển sách có mã sách AN-01 và quyển sách có mã sách TH-02.

Để kết hợp dữ liệu từ các bảng có trường chung theo cách ghép nối các bản ghi thoả mãn một điều kiện nào đó, SQL sử dụng từ khoá `JOIN` trong mệnh đề `FROM`.

Có một số kiểu `JOIN` khác nhau, trong đó `INNER JOIN` được phổ biến nhất. Dưới đây là mẫu viết mệnh đề `FROM` (trong câu truy vấn) sử dụng `INNER JOIN`.

```sql
SELECT *
FROM NGƯỜI ĐỌC
INNER JOIN MƯỢN-TRA ON NGƯỜI ĐỌC.Số thẻ = MƯỢN-TRA.Số thẻ;
```

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Truy Vấn Cơ Sở Dữ Liệu

## 1. Giới thiệu về INNER JOIN

Trong mẫu nêu trên, ký hiệu `0` để chỉ bất cứ toán tử so sánh nào (trong đó ký hiệu `&#x3C; >` thể hiện toán tử so sánh khác). Tuy nhiên, trên thực tế, `INNER JOIN` được biến với điều kiện kết nối là sự trùng khớp giá trị trên một trường.

### 1.1. Điều kiện kết nối

Điều kiện để hai bản ghi được kết nối là giá trị trường `Sổ thẻ TV` của chúng bằng nhau.

### 1.2. Ví dụ

Hình 3 là một câu truy vấn từ bảng `NGƯỜI ĐỌC` và một yêu cầu kết nối hai bản ghi: một ở bảng `MƯỢN-TRA`. Câu truy vấn SQL này được dùng để tìm mã sách của các quyển sách mà học sinh "Trần Văn An" đã mượn. Thông tin đưa ra gồm có thông tin về Trần Văn An (gồm Họ và tên, Sổ thẻ TT) và Mã sách của các cuốn sách đã mượn.

```sql
SELECT DISTINCT [Ho va ten], [NGƯỜI ĐỌC], [Sổ thẻ TV], [Mã sách]
FROM [NGƯỜI ĐỌC] INNER JOIN [MƯỢN-TRA] ON [NGƯỜI ĐỌC].[Sổ thẻ TV] = [MƯỢN-TRA].[Sổ thẻ TV]
WHERE [Ho va ten] = 'Trần Văn An'
```

### 1.3. Điều kiện kết nối

Mỗi giá trị khóa (một Số thẻ TT) chỉ xuất hiện trong một bản ghi duy nhất ở bảng `NGƯỜI ĐỌC` nhưng có thể xuất hiện trong nhiều bản ghi ở bảng `MƯỢN-TRA`. Do vậy, quan hệ giữa `NGƯỜI ĐỌC` và `MƯỢN-TRA` là quan hệ một-nhiều, nghĩa là một bản ghi trong bảng thứ nhất tương ứng với nhiều bản ghi trong bảng thứ hai và một bản ghi trong bảng thứ hai chỉ tương ứng với một bản ghi trong bảng thứ nhất.

**Chú ý:** Từ khóa `INNER JOIN` nằm giữa tên hai nguồn để kết nối và từ khóa `ON` đứng ngay trước điều kiện kết nối.

## 2. Kết xuất thông tin bảng báo cáo

Em đã biết, có thể truy vấn CSDL Quản lý học tập 11 để có được thông tin về kết quả học tập của học sinh lớp 11 ở một số môn học. Theo em, với công cụ truy vấn, ta có được dữ liệu trình bày như ở Hình hay không?

----

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Báo cáo CSDL

Báo cáo CSDL là một văn bản trình bày thông tin kết xuất từ CSDL. Có thể xem lực tiếp trên màn hình hoặc in ra. Dữ liệu để đưa vào báo cáo được lấy từ một hay nhiều bảng và quy vân. Báo cáo trình bày dữ liệu trực quan, làm nổi bật những mục thường theo mẫu quy định quan trọng.

Vi lẽ đó nên nhu cầu xem báo cáo trong công tác lý rất lớn.

## Hình 1

Hình 1 là một báo cáo có được từ CSDL, là một trường trung học phổ thông ở các ví dụ đã nêu. Để có kết quả học tập của học sinh ở một số môn học, ta có thể dùng truy vấn CSDL. Tuy nhiên, dùng hình thức báo cáo thì việc trình bày những thông tin kết xuất được sẽ đạt hiệu quả cao hơn, phù hợp hơn với người cần những thông tin này.

### KẾT QUẢ MỘT SỐ MÔN HỌC

| Họ và tên         | Môn học     | Điểm      |
|-------------------|-------------|-----------|
| Hả Quốc Trung     | Toán       | 8.0       |
|                   | Ngữ văn    | 7.5       |
|                   | Ngoại ngữ  | 8.5       |
| Nguyễn Thị Hà     | Toán       | 9.0       |
|                   | Ngữ văn    | 8.0       |
|                   | Tin học    | 9.5       |

## Hình 2

Hình 2: Một báo cáo kết quả học tập.

### Báo cáo - So sánh số lượng và tổng tiền bán được theo mặt hàng (Nửa đầu tháng 2 năm 2022)

| Mặt hàng                     | Số lượng bán | Tổng số tiền   |
|------------------------------|--------------|-----------------|
| Bánh trứng                   | 2,062,500.00 | 2,062,500.00    |
| Hạt điều                     | 1,500,000.00 | 1,500,000.00    |
| Hồng Hà                      | 50,000.00    | 50,000.00       |
| Bột ngũ cốc                  | 65,000.00    | 65,000.00       |
| Bút 61                        | 540,000.00   | 540,000.00      |
| Bút bi                       | 3,000,000.00 | 3,000,000.00    |
| Thuốc tẩy                    | 762,500.00   | 762,500.00      |
| Bút chì 38                   | 1,400,000.00 | 1,400,000.00    |
| Gôm                          | 100,000.00   | 100,000.00      |
| Bút xóa                      | 50,050.00    | 50,050.00       |

### Hình 3

Hình 3: Một báo cáo tổng hợp thông tin theo mặt hàng.

Quan sát một báo cáo ở Hình 3, người xem dễ dàng so sánh thực tế mua bán giữa hàng tổng hợp (tính tổng) ở số lượng đã được bán và tiền thu được. Rất hữu ích với người làm kinh doanh khi sắp xếp các mặt hàng trong báo cáo theo thứ tự giảm dần của tổng tiền thu được.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Bên cạnh các công cụ lao động biểu mẫu

Tạo truy vấn các hệ quản trị CSDL quan hệ đều cung cấp công cụ tạo báo cáo tự động. Người phát triển ứng dụng CSDL có thể sử dụng công cụ tạo báo cáo tự động rồi tiếp tục chỉnh sửa bố cục, định dạng dữ liệu của báo cáo. Với những dung CSDL, người phát triển có thể sử dụng ngôn ngữ lập trình để thiết kế các báo cáo phù hợp với nhu cầu người dùng.

## Thực hành truy vấn trong CSDL quan hệ

Trong CSDL Thư viện được tạo bởi hệ quản trị CSDL Access, viên đã chuẩn bị sẵn một sổ truy vấn. Em hãy mở xem một truy vấn và chạy thử để biết kết quả.

b) Trong các truy vấn được thiết kế sẵn, hãy cho biết câu truy vấn nào trả lời cho câu hỏi: Các quyển sách AI-Trí tuệ nhân tạo đã được những người nào mượn, những bảng nào của cơ sở dữ liệu? Vì sao em biết điều đó?

Xét CSDL được mô tả như ở Hình 1. Nêu cần biết tên cuốn sách đã được mượn với ID = trong bảng MƯỢN-TRA, em sẽ viết câu truy vấn như thế nào?

Trong các câu sau, những câu nào đúng?

1. Chỉ có thể viết câu truy vấn SQL trên một bảng của CSDL.
2. Các từ khóa kết nối phải viết trong mệnh đề FROM của câu truy vấn SQL.
3. Chỉ có thể kết nối với điều kiện giá trị trường chung giữa hai bảng là bằng nhau.
4. Dữ liệu để đưa vào báo cáo được lấy từ một hay nhiều bảng và truy vấn.

## Tóm tắt bài học

Để trích rút dữ liệu trong một CSDL quan hệ, có những vấn đề đòi hỏi phải thực hiện kết nối dữ liệu của các bảng. Mệnh đề FROM có thể chứa từ khóa chỉ định kiểu JOIN để thực hiện kết nối các bản ghi ở các bảng khác nhau. INNER JOIN là một kiểu kết nối phổ biến.

Các hệ quản trị CSDL đều cung cấp công cụ tạo báo cáo tự động và người dùng cũng có thể điều chỉnh bố cục, định dạng báo cáo để nâng cao chất lượng trình bày thông tin.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.
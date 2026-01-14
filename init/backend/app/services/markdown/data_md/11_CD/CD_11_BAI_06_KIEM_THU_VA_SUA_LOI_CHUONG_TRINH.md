# Kiểm Thử Và Sửa Lỗi Chương Trình

Học xong bài này, em sẽ:
- Biết được việc kiểm thử giúp lập trình viên phát hiện lỗi; làm tăng độ tin cậy của chương trình nhưng chưa chứng minh được chương trình đã hết lỗi.
- Biết được một số kinh nghiệm gỡ lỗi và các thói quen lập trình tốt để dễ gỡ lỗi.

Theo em, tại sao rất ít khi viết chương trình xong có thể chạy được ngay?

## Nguyên Nhân Gây Lỗi và Truy Vết Lỗi

### Các Loại Lỗi và Nguyên Nhân

- **Lỗi cú pháp** là lỗi hay xảy ra trong quá trình soạn thảo chương trình. Người lập trình chỉ cần hiểu rõ ngôn ngữ lập trình mình sử dụng là có thể dễ dàng sửa lỗi cú pháp. Hiện nay, các môi trường tích hợp phát triển phần mềm (IDE - Integrated Development Environment) có công cụ soạn thảo chương trình nhằm hạn chế những sai sót có thể sinh ra lỗi cú pháp.

- Một vài lần vẫn có thể đột ngột dừng chương trình đã biên dịch, chạy thử thành công. Đó là **lỗi thời gian chạy (runtime errors)**.

Ví dụ:
- Nguyên nhân thường do có giá trị biến không hợp lệ khi thực hiện một tính toán nào đó, như:
- Chia cho 0.
- Phần tử của danh sách ngoài phạm vi cho phép.
- Tăng giá trị biến đếm để kiểm tra.

### Truy Vết Lỗi và Bao Lỗi

Môi trường lập trình IDE thường có hiển thị lệnh trong soạn thảo các câu lệnh. Số thứ tự các dòng lệnh danh sách tăng dần từ 1. Khi phát sinh một lỗi, chức năng gỡ lỗi sẽ truy ngược lại phía trên, tìm đến tận gốc, tới dòng lệnh có câu lệnh gây lỗi.

Thông báo lỗi in ra danh sách các lệnh truy vết được, ghi kèm số thứ tự dòng lệnh trong văn bản chương trình. Người lập trình dễ dàng tìm ra chuỗi dòng lệnh gây lỗi.

### Chạy Thử Chương Trình

Chạy thử là để phát hiện lỗi trong mã của chương trình. Gỡ lỗi là xác định vị trí có lỗi, nguyên nhân gây lỗi và sửa lỗi. Phát hiện lỗi và sửa lỗi là hai việc đan xen trong một quá trình. Mục đích cuối cùng là đảm bảo rằng chương trình hoạt động đúng, đáp ứng yêu cầu bài toán đặt ra.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Thuật toán và Kiểm thử Chương trình

## 1. Giới thiệu
Thuật toán sai thì chương trình thực hiện đúng thuật toán đó sẽ cho kết quả sai. Việc phát hiện chương trình còn lỗi và sửa lỗi sẽ phân biệt đó là lỗi chương trình không thực hiện thuật toán hay lỗi của bản thân thuật toán.

## 2. Tập dữ liệu đầu vào
Tập dữ liệu đầu vào có thể xảy ra của một chương trình thường hợp toán bộ các trường hợp là vô hạn. Dữ liệu đầu vào cho chương trình thực hiện một thuật toán sắp xếp là bất cứ dãy số nào. Không thể chạy thử chương trình với tất cả các dữ liệu đầu vào có thể có.

Chạy thử cho phép người lập trình dễ phát hiện lỗi hơn qua đó kịp thời đưa ra các biện pháp xử lý lỗi. Mặc dù điều này không đảm bảo tuyệt đối không lỗi nhưng nó tăng cường chương trình còn cẩn thận được rất nhiều rủi ro phát sinh lỗi trong quá trình vận hành.

## 3. Nghiệm thực hành gỡ lỗi chương trình
### 3.1 Một số kinh nghiệm
Các ca kiểm thử để phát hiện lỗi chương trình. Một ca kiểm thử là một hợp dữ liệu cho các đầu vào cụ thể và dự đoán trước kết quả trong quá trình thực hiện.

### 3.2 Các ca kiểm thử nhằm phát hiện các lỗi tiềm ẩn
Dưới đây là một số gợi ý cho các kiểm thử:

- Kiểm tra các câu lệnh rẽ nhánh với dữ liệu đầu vào tương ứng cho đủ các hợp.
- Kiểm tra các câu lệnh lặp với đầu vào khiến số lặp là 0 lần hoặc nhiều lần.
- Kiểm tra với các giá trị ở các đầu mút trái, phải của một biểu thức điều kiện. Ví dụ, với điều kiện \( a &#x3C; x &#x3C; b \), hãy thử với các giá trị \( a \) và \( b \). Các hạn chế "không là số dương", "không là số âm" hãy thử với đầu vào bảng.
- Cẩn thận trong việc điều kiện so sánh hai biến kiểu số thực vì kết quả tính toán có thể bị làm tròn. Ví dụ, sau khi tính tỷ lệ phần trăm, các tỷ lệ phần trăm không chắc sẽ đúng bằng 100 nếu muốn biết chương trình sẽ hoạt động như thế nào khi người khác chạy "khám phá".
- Kiểm tra với các đầu vào không mong đợi. Các giá trị không mong đợi có thể không là giá trị rất lớn hoặc rất gần số hợp.

### 3.3 Hãy cho một số ví dụ ca kiểm thử:
1. Chương trình giải phương trình bậc hai.
2. Chương trình tính đếm (tính tổng, tính trung bình cộng; các số dương trong một mảng số thực).

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Chia để trị

## Kiểm thử và sửa lỗi một đoạn mã lệnh

Kiểm thử và sửa lỗi một đoạn mã lệnh dễ hơn nhiều so với cả một văn bản ngắn. Hãy kiểm thử và sửa lỗi từng đoạn mã lệnh lung ham rẽng biệt. Chắc chắn rằng nó làm đúng việc cần làm trước khi chuyển sang phần khác.

Vặn ban chương trình có thể được gỡ lỗi, chỉnh sửa hoàn thiện dần từng phần nếu biết cách tổ chức tách biệt các công việc của chương trình để dễ sửa lỗi.

### Việc

Lỗi logic rất khó phát hiện. Một kinh nghiệm là kiểm soát các giá trị biến biểu thức trong quá trình chạy kiểm thử chương trình. Điều này có thể thực hiện bằng cách giả trị biến biểu thức hoặc theo dõi các giả trị biến, biểu thức bằng trình gỡ rối nếu nó được trang bị sẵn trong IDE.

Tập thói quen tốt khi lập trình để dễ gỡ lỗi. Các kỹ năng lập trình và gỡ lỗi chỉ có được qua kinh nghiệm thực hành. Hãy học những sai lầm của bản thân, ghi nhớ những lỗi đã mắc để nâng cao phong cách lập trình. Nên tập một số thói quen tốt sau đây để chương trình ít lỗi và việc gỡ lỗi dễ dàng hơn:

1. Không lập tức bắt đầu viết các câu lệnh ngay sau khi đọc xong bài toán lập trình và nảy ra ý tưởng (thuật toán) giải bài toán. Nên bắt đầu với việc tách biệt các phần việc cần làm và thiết kế chương trình.
2. Liệt kê các bước, chọn những việc chuyển thành chương trình.
3. Mô tả thuật toán.
4. Định nghĩa rõ đầu vào, đầu ra của mỗi hàm.
5. Chọn đặt tên dễ nhớ cho các hàm và các biến quan trọng sao cho dễ nhận biết nó làm gì; đó là cái gì. Điều này giúp tránh nhầm lẫn khi viết câu lệnh và dễ phát hiện lỗi hơn.
6. Viết chú thích đầy đủ ngay trước ngay sau các khai báo tên hàm, tên biến quan trọng trong các đoạn mã lệnh cần chú ý. Sau này, chính người lập trình có thể không còn nhớ mình có ý tưởng lúc viết các dòng lệnh đó.
7. Tổ chức tách biệt các phần của một chương trình.
8. Định nghĩa hàm để thực hiện thuật toán.

Người lập trình tự định nghĩa một (hay một số) hàm: chọn tên hàm, tên các biến đầu vào và cách trả về kết quả. Trong mô tả thuật toán đã có sẵn những thông tin này. Phần thân hàm là kết quả chuyển từ mô tả thuật toán thành câu lệnh của ngôn ngữ lập trình đã chọn.



# Các câu lệnh để chạy thử phát hiện lỗi

Trong chương trình cần có thêm các câu lệnh làm việc sau:
- **Gán dữ liệu đầu vào**: Một số câu lệnh gán giá trị cho các biến đầu vào. Dữ liệu đầu vào cũng có thể đọc từ tệp cho trước.
- **Xuất kết quả đầu ra**: Một số câu lệnh in ra màn hình. Để tiện kiểm tra, nên in kèm lời mô tả đầu ra là gì: có thể in kèm cả dữ liệu đầu vào.

## Việc tổ chức tách biệt các phần

### Lợi ích của công việc
- **Dễ chạy thử**: Các câu lệnh dễ chạy thử kiểm tra ở các chỗ cần theo dõi giá trị của các biến việc thực hiện các đoạn chương trình. Dùng dấu chú thích `#` có thể liệt kê một danh sách các ca kiểm thử khác nhau và chạy thử từng.
- **Dễ sửa lỗi**: Bố cục chương trình có logic rõ ràng; dễ thấy lỗi xảy ra ở việc nào.

### Câu hỏi
1. Có các loại lỗi chương trình nào? Nguyên nhân gây ra loại lỗi đó có thể là gì?
2. Hãy nêu một vài thói quen lập trình tốt để chương trình ít lỗi và dễ gỡ lỗi.

Em hãy liệt kê một số ca kiểm thử cho chương trình:
- a) Tìm số x trong một dãy số (đã cho cụ thể)
- b) Sắp xếp một dãy số tăng

### Câu hỏi
1. Tại sao nói kiểm thử chương trình làm dộ tin cậy của chương trình?
2. Nên làm gì mỗi khi nghi ngờ một chức năng nào đó của chương trình chưa chắc đúng như ta mong muốn?

## Tóm tắt bài học
Chương trình đã chạy ra kết quả, có thể vẫn còn lỗi tiềm ẩn; kiểm thử để phát hiện lỗi và sửa lỗi nhằm đảm bảo rằng chương trình đáp ứng yêu cầu bài toán đặt ra.

Cần kiểm thử:
- Đủ các trường hợp của cấu trúc rẽ nhánh.
- Các trường hợp ở đầu mút của một biểu thức điều kiện.
- Các trường hợp của cấu trúc lặp có số lần lặp 0 lần, nhiều lần.

Cần tập các thói quen lập trình tốt để chương trình ít lỗi và dễ gỡ lỗi.
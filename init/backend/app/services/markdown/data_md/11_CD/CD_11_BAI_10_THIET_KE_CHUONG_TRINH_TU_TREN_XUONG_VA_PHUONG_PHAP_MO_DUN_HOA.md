# THIẾT KẾ CHƯƠNG TRÌNH TỪ TRÊN XUỐNG VÀ PHƯƠNG PHÁP MÔ ĐUN HOÁ

Học xong bài này, em sẽ:
- Giải thích được phương pháp thiết kế chương trình thành các mô đun cho một bài toán thể.
- Nhận biết được lợi ích của phương pháp nêu trên: hỗ trợ làm việc đồng thời; dễ dàng bảo trì, phát triển chương trình và tái sử dụng các mô đun.

Có người nói lập trình cũng giống như giải bài tập toán; sau khi có ý tưởng thuật toán viết từng dòng lệnh lần lượt từ đầu đến cuối. Theo em, nói như thế có đúng không? Vì sao?

## Thiết kế chương trình từ trên xuống theo phương pháp mô đun hoá

### Mô đun trong lập trình

Một số loại thiết bị, đồ dùng được thiết kế theo mô đun để dễ thao lắp, vận chuyển, sửa chữa, thay thế. Tên gọi mô đun hàm đó là một bộ phận, một phần của một thiết bị trong chương trình phần mềm nhưng được thiết kế tách thành một khối riêng biệt, hay có tính độc lập nhất định với phần còn lại. Tính độc lập của mỗi mô đun cho phép khi cần thiết có thể thay thế mô đun đó mà không làm ảnh hưởng đến các mô đun khác. Một chương trình lớn có thể gồm nhiều tệp mã nguồn. Một tệp mã nguồn là một mô đun phần mềm. Một hàm do lập trình viên tự viết cũng có thể coi là một mô đun vì mỗi hàm trong chương trình tách thành một đoạn độc lập với những phần còn lại của chương trình.

### Phương pháp mô đun hoá

Mô đun hoá là cách nói khái quát về một phương pháp lập trình nói chung và lập trình nói riêng. Áp dụng phương pháp mô đun hoá, người lập trình làm theo các giai đoạn sau:

1. **Giai đoạn 1**: Liệt kê các việc lớn: sử dụng các gạch để nhận được kết quả mong muốn, tuần tự từ nhập dữ liệu đến kết quả cuối cùng.
2. **Giai đoạn 2**: Thiết kế các hàm: phân chia mỗi bước lớn thành một vài công việc độc lập và thiết kế các hàm thực hiện những công việc đó, xác định rõ tên hàm, đầu vào, đầu ra.
3. **Giai đoạn 3**: Viết các hàm: lập trình từng hàm theo thiết kế; kiểm thử, gỡ lỗi từng hàm để chắc chắn nó làm đúng chức năng.
4. **Giai đoạn 4**: Viết chương trình chính: thực hiện các bước theo liệt kê trong giai đoạn 1, gọi sử dụng các hàm vừa hoàn thành; chạy thử, kiểm tra.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Lập trình theo phương pháp mô đun hóa

Lập trình theo phương pháp mô đun hóa dẫn đến kết quả là chương trình có một số hàm do người lập trình định nghĩa. Chương trình chính sẽ ngắn gọn, gồm một số câu lệnh để nhập dữ liệu, gọi sử dụng các hàm do người lập trình viết, xuất kết quả cuối cùng ra màn hình hay ra tệp và kết thúc. Trái với lập trình theo phương pháp mô đun hóa gọi là lập trình kiểu nguyên khối. Nếu một chương trình khá dài mà không có hàm nào do người lập trình tự định nghĩa thì có thể coi đó không phải là kết quả qua lập trình theo mô đun.

## Minh họa về lập trình theo phương pháp mô đun hóa

1. Trong Bài 9 có cho sẵn mã lệnh Python thực hiện thuật toán sắp xếp nhanh sử dụng phân đoạn Lomuto. Theo em, đây có phải là kết quả lập trình theo phương pháp mô đun hóa hay không? Vì sao?
2. Trong Bài 9 có yêu cầu thực hiện dựa trên mã lệnh thực hiện phân đoạn Hoare cho sẵn; để viết chương trình thực hiện sắp xếp nhanh một dãy số. Em hãy cho biết đã làm như thế nào? Theo em như thế có phải là lập trình theo phương pháp mô đun hóa hay không?

## Một dự án lập trình nhỏ

Về lý thuyết, độ phức tạp thời gian của thuật toán tìm kiếm tuần tự là \(O(n)\) còn độ phức tạp thời gian của thuật toán tìm kiếm nhị phân là \(O(\log n)\). Để minh họa trực quan kết luận trên, ta lập một dự án lập trình nhỏ nhằm thực nghiệm bằng cách chạy máy tính nhiều lần với các dãy số đầu vào ngẫu nhiên rồi lấy giá trị ngẫu nhiên. Dưới đây là ví dụ minh họa việc áp dụng phương pháp mô đun hóa trong thiết kế chương trình và lập trình cho dự án này.

### Giai đoạn 1: Liệt kê các việc lớn

- Sinh dãy ngẫu nhiên \(n\) số gọi là dãy \(A\).
- Sắp xếp dãy \(A\) theo thứ tự tăng (không giảm) lưu thành dãy \(B\).
- Tìm kiếm tuần tự một số có mặt trong dãy \(A\); tìm kiếm nhị phân số đó trong dãy \(B\); ghi lại khoảng thời gian từ lúc bắt đầu tìm kiếm cho đến khi tìm thấy trong cả hai trường hợp.
- Tìm kiếm một số bất kỳ: Cho số bất kỳ, tìm kiếm tuần tự số \(x\) trong dãy \(A\), tìm kiếm nhị phân số trong dãy \(B\); ghi lại khoảng thời gian từ lúc bắt đầu tìm kiếm cho đến khi kết thúc tìm kiếm trong cả hai trường hợp.
- Tính trung bình cộng thời gian thực hiện tìm kiếm tuần tự và tìm kiếm nhị phân; xuất kết quả cho cả hai trường hợp.

----

Đọc bản mới nhất trên hoc10.vn                                        Bản sách mẫu



# Giai đoạn 2. Thiết kế các hàm

Phân tích chi tiết hơn những việc lớn cần làm trong từng bước kể trên thành các việc cụ thể hơn. Nếu một việc thể thực hiện một vài câu lệnh ngắn gọn thì thiết kế một hàm: đặt tên gợi nhớ hàm sẽ làm gì. Xác định rõ đầu vào là gì, đầu ra là gì.

## Ví dụ:

- **Sinh dãy ngẫu nhiên n số với giá trị trong (0, M)**:
- Tên hàm: `dayngaunhien`
- Đầu vào: hai số nguyên n, M
- Đầu ra: một dãy n số được sinh ngẫu nhiên với giá trị trong khoảng (0, M).

- **Sắp xếp dãy theo thứ tự tăng dần (không giảm)**:
- Tên hàm: `sapxep`
- Đầu vào: một dãy số
- Đầu ra: dãy số được sắp theo thứ tự tăng dần.

- **Tìm kiếm tuần tự**:
- Tên hàm: `tktuantu`

- **Tìm kiếm nhị phân**:
- Tên hàm: `tknhiphan`

- **Chọn số có mặt trong dãy**:
- Sinh ngẫu nhiên một số nguyên trong khoảng (0, n-1) và tra về Y trong dãy B. Chắc chắn x có mặt trong dãy B. Không cần viết thành một hàm.

- **Tìm số có mặt trong dãy**:
- Tên hàm: `tkcomat`
- Đầu vào: x (nói trên): hai dãy số A, B.
- Đầu ra: khoảng thời gian từ lúc bắt đầu tìm kiếm cho đến khi tìm thấy:
1) Bằng tìm kiếm tuần tự trong B.
2) Bằng tìm kiếm nhị phân trong dãy B.

- **Tìm số bất kỳ**:
- Tên hàm: `tkbatki`
- Đầu vào: một số x sinh ngẫu nhiên: hai dãy số A, B.
- Đầu ra: khoảng thời gian từ lúc bắt đầu tìm kiếm cho đến khi kết thúc tìm kiếm:
1) Bằng tìm kiếm tuần tự trong dãy A.
2) Bằng tìm kiếm nhị phân trong dãy B.

Ghi lại khoảng thời gian tìm kiếm: dùng hàm `time` hai lần, ngay trước và ngay lệnh gọi `tktuantu` (hay `tknhiphan`). Không cần viết thành hàm riêng.

### Công thời gian thực hiện tìm kiếm tuần tự và tìm kiếm nhị phân

- Tính trung bình và xuất kết quả ra: không cần viết thành hàm riêng.

Người lập trình chắc chắn phải viết các câu lệnh sau khi đã thiết kế xong các hàm. Với Giai đoạn 3 và Giai đoạn 4, học sinh thực hiện dựa vào các kịch bản đã học, đồng thời làm theo gợi ý của thầy cô giáo.

## Các ưu điểm của lập trình theo phương pháp mô đun hóa

Phối hợp lập trình: Ví dụ một nhóm học sinh làm dự án lập trình mà kết quả là một chương trình không nhỏ cần viết nhiều hàm dùng những thuật toán khác nhau. Thì cần tổ chức thành vài tệp mã nguồn tên biệt. Hai người không thể viết cùng một lúc vào cùng một tệp để lập trình.

----

Đọc bản mới nhất trên hoc10.vn                                             Bản sách mẫu



# Chương trình dễ hiểu hơn: Lập trình theo phương pháp mô đun hóa dẫn đến kết quả là chương trình chính ngắn gọn, gồm một số câu lệnh gọi sử dụng các hàm mà người lập trình viết. Mỗi hàm thường có tên gợi nhớ cho biết nó làm gì. Các câu lệnh trong chương trình thể hiện rõ các bước lẫn di từ dữ liệu đầu vào đến kết quả cuối cùng.

## Dễ kiểm thử và sửa lỗi hơn:
Phương pháp mô đun hóa tách biệt các công việc nên một đoạn chương trình ngắn phân chương trình thực hiện hàm nào. Một hàm là đơn vị thiết kế có đầu vào - đầu ra rõ ràng. Chạy thử nhanh hơn và dễ tìm ra câu lệnh có lỗi hơn.

## Khả năng tái sử dụng:
Những người lập trình tự định nghĩa có thể được sử dụng không chỉ trong chương trình vừa hoàn thành mà còn ở những chương trình khác sau này. Các môi trường lập trình đều hỗ trợ việc tạo lập thư viện các hàm do người lập trình tự định nghĩa.

### Câu hỏi:
1. Em hãy nêu ngắn gọn về lập trình mô đun hóa theo ý hiểu của mình.
2. Theo em, liệu một chương trình có các hàm do người lập trình định nghĩa có thể bỏ hết các hàm này để chuyển thành chương trình kiểu nguyên khối hay không? Việc này dễ hay khó?

Xét dự án nhỏ về lập trình để thực nghiệm so sánh thời gian thực tế chạy chương trình máy tính thực hiện một số thuật toán sắp xếp mà em đã biết theo cách ngẫu nhiên. Em hãy áp dụng phương pháp lập trình mô đun hóa:
- a) Đưa ra thiết kế các hàm sẽ được sử dụng trong chương trình.
- b) Viết các câu lệnh trong chương trình chính cần viết các hàm.

### Câu hỏi:
1. Hãy nêu các bước người lập trình cần thực hiện khi áp dụng phương pháp lập trình mô đun hóa.
2. Hãy nêu các ưu điểm của lập trình theo mô đun.

## Tóm tắt bài học:
Lập trình theo phương pháp mô đun hóa là chia chương trình thành một số hàm (chương trình con) tách biệt để có thể viết mã lệnh, kiểm thử, gỡ lỗi từng hàm. Các hàm do người lập trình tự định nghĩa là kết quả của việc lập trình theo mô đun.
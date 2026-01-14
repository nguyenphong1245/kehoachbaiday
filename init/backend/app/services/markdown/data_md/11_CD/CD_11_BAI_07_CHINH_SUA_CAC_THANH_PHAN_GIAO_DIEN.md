# BÀI 1: CHỈNH SỦA CÁC THÀNH PHẨN GIAO DIỆN

Học xong bài này, em sẽ:
- Chỉnh sửa được bài trí các thành phần trong biểu mẫu, báo cáo.
- Thiết lập được chủ đề màu sắc, phong cách văn bản của giao diện ứng dụng.

Em hãy cho biết dải lệnh Layout có chức năng gì.

## Các thành phần và các phần tử trong báo cáo

### a) Các thành phần trong báo cáo

Có 4 khung nhìn báo cáo (Hình 1). Theo mặc định, báo cáo mở ra trong khung nhìn báo cáo **Report View**. Để xem cấu trúc các thành phần của báo cáo, cần chuyển sang khung nhìn thiết kế **Design View**. Dưới đây minh họa bằng báo cáo "Mượn Trả - Theo Tháng".

Trong khung nhìn thiết kế (Hình 2) sẽ thấy rõ các phần:
- **Report Header**: Nhãn tiêu đề báo cáo ở phần trên cùng của trang đầu tiên. Khi mới tạo ra, theo mặc định Access lấy tên truy vấn (hay bảng) là nguồn dữ liệu của báo cáo làm tên cho báo cáo.
- **Page Header**: Nhãn văn bản ở trên đỉnh mọi trang của báo cáo. Đây là các tên trường dữ liệu ở đỉnh mỗi cột.

```
Mượn Trả - Theo Tháng
```

| Month | Count(*) | Ngày mượn |
|-------|----------|------------|
|       |          |            |

```
Page Footer: [Page] &#x26; " / " &#x26; [Pages]
Detail: =Sum([Count]) Count()
```

Hình 1. Các khung nhìn báo cáo

Hình 2. Các phần của báo cáo và các hộp dữ liệu trong phần Detail

----

**Lưu ý**: Các hình ảnh và biểu đồ không được hiển thị trong văn bản này.



# Nội dung giáo dục

## Chi tiết

Nằm giữa dầu trang và chân trang; xác định chi tiết việc hiển thị dữ liệu từ các bản ghi. Trong Hình 2 đã được đánh dấu chọn nên có viền khung màu vàng.

### Page Footer

Xuất hiện ở đáy mọi trang của báo cáo; hiển thị số thứ tự trang trên số trang và ngày tháng.

### Report Footer

Xuất hiện trong trang cuối của báo cáo và hiển thị thông tin tóm tắt, ví dụ như tổng toàn bộ (grand totals).

### b) Các phần tử trong thân báo cáo

Mỗi PageHeader, Detail, Page Footer, Report Footer gồm nhiều phần tử nhỏ hơn. Mỗi phần tử cũng gọi là một điều phần tử là một hình chữ nhật, khiên (control): Cần phân biệt hai loại phần tử khác nhau về bản chất mặc dù nhìn giống nhau. Đó là hộp dữ liệu và nhãn tên trường.

- **Hộp dữ liệu** được kết buộc với các trường dữ liệu từ bảng hay truy vấn cơ sở và được cập nhật bằng dữ liệu mới nhất khi chạy báo cáo. Hộp dữ liệu nằm trong phần Detail của báo cáo; có viền màu vàng như ở Hình 2. Hộp dữ liệu lấy dữ liệu từ trường nào thì tên của trường đó hiển thị bên trong hộp: Không được thay đổi tên này.

- **Nhãn tên trường** chỉ là nhãn tên, không kết buộc với dữ liệu. Theo mặc định, các nhãn tên trường được gán theo tên cột dữ liệu. Do đó, nên chọn đặt tên phù hợp, dễ hiểu khi thiết kế bảng. Có thể sửa đổi nhãn tên, đặt tên mới nếu muốn.

#### Thao tác sửa đổi nhãn tên

Nháy đúp chuột vào nhãn tên; con trỏ soạn thảo xuất hiện; gõ nhập tên mới. Ví dụ: có thể sửa tiêu đề báo cáo trong hình thành "Báo cáo chi tiết hoạt động mượn trả sách từ tháng".

## Các thành phần và các phần tử trong biểu mẫu

### a) Các thành phần trong biểu mẫu

Dưới khung nhìn thiết kế (Hình 3), ta thấy biểu mẫu chia thành ba phần:

- **Đầu biểu mẫu (Form Header)**: Hiển thị tiêu đề của biểu mẫu. Có thể thêm logo của tổ chức, hình trang trí tiêu đề ở đây.

- **Chân biểu mẫu (Form Footer)**: Phần tùy chọn ở cuối trang biểu mẫu, thường có nội dung để in ra, ví dụ là ngày tháng, người thực hiện.

- **Phần chi tiết (Detail)**: Là thân biểu mẫu.



# Sách Giáo Khoa

## Hình 3. Biểu mẫu dưới khung nhìn thiết kế

### b) Các phần tử trong thân biểu mẫu

Tương tự như trong báo cáo, các phần tử của biểu mẫu chứa nhiều phần tử nhỏ hơn là các điều kiện (control) và cũng có hai loại là hộp dữ liệu và nhãn tên trường. Thân biểu mẫu chứa nội dung chính. Một trường trong biểu mẫu sẽ ứng với một cặp ghi hai phần tử, gồm nhãn tên trường và hộp dữ liệu. Dữ liệu gõ nhập vào hộp sẽ được cập nhật vào CSDL và hiển thị trở lại khi ta xem dữ liệu. Trong khi đó, nếu muốn, ta có thể thay đổi nhãn tên trường mà không ảnh hưởng đến chức năng của biểu mẫu.

### Chỉnh sửa bài trí

Biểu mẫu hay báo cáo được tạo tự động theo mặc định hoàn toàn có thể sử dụng ngay để xem thông tin. Tuy nhiên, đây mới là sản phẩm thô, kích cỡ các phần tử có thể chưa hợp lý, cách bài trí tổng thể các thành phần chưa hài hòa; chưa tiện dụng. Có những hộp văn bản rộng; cao so với dữ liệu chứa trong nó; có hộp lại ngắn hay quá thấp. Ví dụ, trong Hình 4, các hộp dữ liệu Mã sách quá rộng.

## Kho Sách

| Mã sách | Tên sách                          | Số trang |
|---------|-----------------------------------|----------|
| II-02   | 805 Lrs: Ronhiuinen              | 85       |
| TH-01   | AI-Trinuenhinti                  | 176      |
| 41Y-01  | Lm nhac quonh -a                 | 154      |
| VH-01   | Dé mneu phiêw _vukí              | 290      |
| TH-10   | Ti hpc #ảp 1)                    | 176      |
| Anl0s   | Vhaecó dhen Nhiriemanl ehep      | Ssor Anh |
|         | Sang tno Toin ho                 | Pela     |

## Hình 4. Một biểu mẫu nhiều bản ghi dưới khung nhìn bài trí

----

**Lưu ý:** Nội dung trên được trích xuất từ tài liệu gốc và có thể không hoàn toàn chính xác do chất lượng quét.



# Chỉnh Sửa Bài Trí

Có ba nhóm việc chính khi chỉnh sửa bài trí:

1. **Đổi lại tên cho các tiêu đề biểu mẫu, báo cáo; sửa lại các nhãn tên cột ở đầu mỗi trang biểu mẫu hay báo cáo**
Có thể giữ nguyên các tên đối tượng đã ghi lưu khi vừa tạo ra và hiển thị kèm biểu tượng trong vùng điều hướng. Tuy nhiên, tiêu đề của biểu mẫu hay báo cáo hiển thị cho người sử dụng thì thường phải sửa đổi thành tên mới phù hợp với yêu cầu nghiệp vụ của ứng dụng. Đồng thời có thể kết hợp chọn kiểu dáng, màu sắc văn bản đẹp mắt. Thao tác hoàn toàn giống như soạn thảo văn bản.

2. **Chỉnh sửa kích thước các phần tử cho hợp lý.**

3. **Di chuyển sắp xếp lại để trông quen thuộc, tiện sử dụng hơn.**
Ví dụ, trên các biểu mẫu khai thông tin cá nhân, thường thấy hình ảnh ở góc trên bên phải của biểu mẫu. Các trường Họ và tên; Ngày sinh và Giới tính được xếp cùng hàng ngang vì dữ liệu rất ngắn.

## Chỉnh sửa kích thước các phần tử

Khung nhìn bài trí (Layout View) cho phép co giãn kích thước các phần tử theo cách quen thuộc. Thao tác với biểu mẫu hay báo cáo tương tự nhau.

### Các bước thực hiện:

- **Bước 1:** Chuyển sang khung nhìn bài trí: Chọn `View/Layout View` hoặc nháy nút khung nhìn tương ứng ở góc dưới bên phải cửa sổ Access.
- **Bước 2:** Trỏ chuột vào đúng cạnh chiều rộng hay chiều cao, con trỏ chuột sẽ có hình mũi tên hai chiều.
- **Bước 3:** Nhấn giữ và kéo thả để thay đổi kích thước.

Thao tác chỉnh sửa tác động lên cả lô, mọi phần tử khác cùng cột hay cùng hàng cũng được căn chỉnh theo. Hình dung như ta đang thao tác với bảng trong Word. Chuyển sang khung nhìn biểu mẫu (hay khung nhìn báo cáo) để kiểm tra kết quả sau mỗi thao tác chỉnh sửa.

## Di chuyển các phần tử trong biểu mẫu

Các phần tử biểu mẫu là các ô trong một nhiều nhiều cột. Để di chuyển sắp xếp lại vị trí, có thể phải chỉnh sửa lưới ô, tạo sẵn chỗ làm đích đến. Dải lệnh `Arrange` (Hình 5) có nhiều nút lệnh để chèn thêm cột, thêm hàng, chia tách, hòa nhập các ô, tương tự thao tác với bảng trong Word. Biểu tượng nút lệnh kèm tên gọi tiếng Anh rất dễ hiểu.

### Các bước thực hiện:

- **Bước 1:** Nháy chọn `Arrange`.
- **Bước 2:** Tạo khoảng trống làm đích đến để chứa phần tử muốn chuyển tới.
- **Bước 3:** Kéo thả để đưa phần tử đã chọn vào đích.



# Hình 5. Dải lệnh Arrange
Chuyển các phần tử trong báo cáo

Khung nhìn thiết kế (Design View) cho phép xử lý riêng lẻ từng phần tử. Nháy chuột chọn và di chuyển bằng 'kéo thả chuột' hoặc nhấn các phím mũi tên trên bàn phím.

## Chủ đề, màu sắc và kiểu dáng phông chữ
Trong một CSDL Access, chủ đề (Themes) là tập hợp một số thiết lập cơ bản áp dụng chung cho mọi đối tượng. Ta có thể chọn một chủ đề, màu sắc, kiểu dáng có sẵn để áp dụng tổng thể cho mọi đối tượng trong CSDL. Chỉ cần nháy chuột chọn áp dụng sẽ thấy ngay kết quả hiển thị.

### Em hãy thực hiện các công việc sau:
1. Mở biểu mẫu trong khung nhìn bài trí.
2. Chọn thẻ Design (Form Layout Tools) sẽ thấy nhóm lệnh Themes (các chủ đề). Chủ đề gồm màu sắc (Colors) và phông chữ (Fonts) có thể chọn riêng hoặc mẫu chung đã tích hợp cả hai.
3. Nháy mũi tên xuống dưới nhóm lệnh Themes sẽ hiển thị khoang trưng bày nhiều chủ đề được tạo sẵn để dùng thử. Di chuột qua một biểu tượng bất kỳ, Access cho xem trước kết quả thay đổi màu sắc, kích cỡ chữ và kiểu dáng sẽ được áp dụng.
- Chú ý: Thông báo nhỏ "In This Database" cho biết phạm vi áp dụng.
4. Nháy mũi tên xuống cạnh lệnh Colors hay lệnh Fonts để thử áp dụng các thiết lập phối màu và phông chữ khác nhau.

## Áp dụng định dạng riêng cho một phần tử
Có trường hợp muốn chỉnh sửa định dạng riêng cho một phần tử, khác với phong cách chung đã thiết lập cho các phần tử khác.

### Bước 1:
Nháy thẻ Format. Dải lệnh Format có các nút lệnh định dạng quen thuộc như trong Word.



# Bước 2
Nháy chọn phần tử đó, thao tác áp dụng định dạng mong muốn.

Thêm logo, hình ảnh trang trí cho biểu mẫu.
Nếu có kỹ năng lập trình, có thể thêm một số nút lệnh để người dùng không thành thao Access tiện sử dụng.

## Thực hành chỉnh sửa giao diện ứng dụng

### Nhiệm vụ 1
Mở biểu mẫu nhiều bản ghi dùng để nhập dữ liệu cho bảng Sách trong khung nhìn bài trí và chỉnh sửa kích thước đồng thời nhiều phần tử cùng cột.

### Nhiệm vụ 2
Mở biểu mẫu một bản ghi dùng để nhập dữ liệu cho bảng Ban dọc trong khung nhìn thiết kế; bài trí lại hộp dữ liệu của trưởng Anh: có kích thước, giãn, di chuyển lên góc trên bên phải.

### Nhiệm vụ 3
Chọn áp dụng Themes và Colors cho toàn bộ giao diện.
Sửa lại tiêu đề của các biểu mẫu và báo cáo đã tạo ra; bổ sung thêm tên trường của em.

## Câu hỏi

**Câu 1.** Mở khung nhìn nào để chỉnh sửa kích thước các thành phần giao diện?
Mở khung nhìn nào để di chuyển một thành phần giao diện?

**Câu 2.** Chủ đề là gì? Mở nhóm lệnh nào để chọn áp dụng một chủ đề?

**Câu 3.** Để chỉnh sửa định dạng riêng cho chỉ một phần tử cụ thể phải làm gì?

## Tóm tắt bài học
Những nhóm việc chính về chỉnh sửa các phần tử biểu mẫu, báo cáo là:
1. Đổi lại tên mới cho các tiêu đề, nhãn tên.
2. Chỉnh sửa kích thước các phần tử cho hợp lý.
3. Di chuyển sắp xếp lại.

Sử dụng luân phiên ba khung nhìn: Layout View, Design View, Form View để sắp xếp lại cách bài trí và chỉnh sửa kích thước các thành phần biểu mẫu, báo cáo.
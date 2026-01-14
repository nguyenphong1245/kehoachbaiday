# BÀI 29 MÔ PHỎNG TRONG GIẢI QUYẾT VẤN ĐỀ

## SAU BÀI HỌC NÀY EM SẼ:
- Làm quen với khái niệm và những lợi ích của mô phỏng.
- Giới thiệu một số lĩnh vực trong đời sống có sử dụng kĩ thuật mô phỏng cũng như một số vấn đề thực tế có thể cần dùng kĩ thuật mô phỏng để giải quyết.

Hãy kể tên một vài ứng dụng mô phỏng mà em biết:

## 1. MÔ PHỎNG VÀ LỢI ÍCH CỦA MÔ PHỎNG

### Hoạt động 1: Thảo luận về lợi ích của mô phỏng
Thảo luận về lợi ích của mô phỏng trong hai ví dụ dưới đây:

**Ví dụ 1.** Trường bắn ảo (Hình 29.1a) là một ứng dụng mô phỏng huấn luyện bắn súng bộ binh đã được triển khai ở Việt Nam, cho phép luyện tập, nâng cao kĩ thuật ngắm bắn cho bộ đội trước khi bắn đạn thật trên thao trường. Ứng dụng này cho phép mô phỏng các đối tượng mục tiêu, thực địa trong môi trường đồ hoạ ba chiều (3D), mô phỏng âm thanh, hình ảnh của quá trình tương tác thực ảo, mô phỏng hiện tượng giật của súng tương tự như khi bắn đạn thật.

**Ví dụ 2.** Giải phẫu ảo (Hình 29.1b) là một ứng dụng mô phỏng trong giảng dạy, nghiên cứu và thực hành các kĩ thuật y khoa. Ứng dụng này tạo mô hình ảo của các cơ quan, bộ phận trong cơ thể con người. Người dùng có thể khám phá và tương tác với mô hình ảo, quan sát cấu tạo và tìm hiểu chức năng của chúng, cũng như thực hành những kĩ thuật y khoa khác nhau trên các mô hình đó.

### a) Trường bắn ảo
### b) Giải phẫu hệ tiêu hoá cơ thể người
**Hình 29.1.** Một số hệ thống mô phỏng

Trong thực tế, kĩ thuật mô phỏng, thường được gọi ngắn gọn là mô phỏng, là một kĩ thuật tái tạo các sự kiện, sự vật hay hệ thống, quy trình thực tế (gọi chung là hệ thống) trong điều kiện thử nghiệm để phục vụ nghiên cứu hoặc đào tạo. Như vậy, mục tiêu của mô phỏng là nhằm xây dựng mô hình của hệ thống trong điều kiện thử nghiệm (mô hình ảo) để khảo sát, nghiên cứu, thậm chí thực hiện các tương tác khác nhau.



# Mô phỏng trong Khoa học và Công nghệ Thông tin

Mô phỏng liên quan tới nhiều lĩnh vực khoa học và đời sống khác nhau. Trong phạm vi môn Tin học, sẽ chỉ đề cập tới việc sử dụng công cụ công nghệ thông tin (bao gồm cả phần cứng và phần mềm) để tạo các mô hình ảo, dưới dạng các phần mềm mô phỏng.

Mô phỏng cho phép giải quyết nhiều bài toán; kiểm tra các giả thuyết hoặc giả định thông qua việc khảo sát, nghiên cứu hoặc tương tác với mô hình ảo của một hệ thống xác định trong những điều kiện khác nhau. Trên cơ sở đó, kĩ thuật mô phỏng cho phép đánh giá những tác động có thể xảy ra với hệ thống trong thực tế.

## Lợi ích của Mô phỏng

Mô phỏng có thể đem lại nhiều lợi ích:

- **Hiệu quả về chi phí**: Việc ứng dụng mô phỏng có thể ít tốn kém hơn so với việc tạo mẫu hoặc thử nghiệm vật lý. Nó có thể làm giảm nhu cầu về thiết bị và vật liệu đắt tiền; đồng thời có thể giả lập một loạt các tình huống khó hoặc không thể tái tạo trong thế giới thực.

- **Kết quả nhanh hơn**: Mô phỏng có thể tạo ra kết quả trong thời gian tính bằng giây hoặc phút; trong khi thử nghiệm trên hệ thống thực có thể mất nhiều giờ hoặc lâu hơn thế.

- **Khả năng tuỳ chỉnh**: Thông qua việc điều chỉnh các tham số khác nhau, mô phỏng có thể giúp xác định các lỗi tiềm ẩn hoặc sự kém hiệu quả trong hệ thống thực, hỗ trợ cải tiến hay phát triển các sản phẩm hoặc quy trình mới.

- **Giảm thiểu rủi ro**: Mô phỏng giúp giảm thiểu rủi ro vì mọi thử nghiệm liên quan tới hệ thống thực với nhiều kịch bản khác nhau đều được thực hiện trên mô hình ảo. Điều này có thể giúp xác định các nguy cơ tiềm ẩn về mức độ an toàn; đánh giá hiệu quả của các kế hoạch ứng phó khẩn cấp; giảm khả năng xảy ra sai sót hoặc tai nạn.

- **Hỗ trợ đào tạo**: Phần mềm mô phỏng có thể được sử dụng cho mục đích đào tạo, giảng dạy; cho phép người dùng thực hành các tình huống phức tạp hoặc thực hiện các thí nghiệm khoa học (Vật lý, Hóa học, Sinh học,...) trong một môi trường an toàn và được kiểm soát. Điều này đặc biệt có ích trong những trường hợp thực nghiệm thực tế có thể gây nguy hiểm hoặc tốn kém như chăm sóc sức khỏe, nghiên cứu khoa học hay trong môi trường quân sự.

## Định nghĩa về Mô phỏng

Mô phỏng là một kĩ thuật tái tạo hệ thống thực trong điều kiện thử nghiệm để phục vụ nghiên cứu hoặc đào tạo. Trong Công nghệ thông tin, mô phỏng là việc sử dụng phần mềm để tạo ra các mô hình ảo. Mô phỏng có thể đem lại hiệu quả kinh tế cao; tối ưu hóa hiệu suất; giảm thiểu rủi ro, hỗ trợ cải tiến hay phát triển các sản phẩm hoặc quy trình mới.

## Câu hỏi trắc nghiệm

Phát biểu nào sau đây là đúng?

A. Mô phỏng là quá trình tái hiện một hệ thống thực tế bằng cách sử dụng một mô hình tương tự như hệ thống thực tế hoàn toàn mới và không liên quan đến hệ thống thực tế ban đầu.

B. Mô phỏng là một quá trình tạo ra một hệ thống thực tế.

C. Mô phỏng chỉ được sử dụng trong nghiên cứu và phát triển các sản phẩm kĩ thuật.

D. Việc đầu tư xây dựng một hệ thống mô phỏng luôn tiết kiệm chi phí hơn việc tạo mẫu hoặc thử nghiệm trong thực tế.



# MÔ PHỎNG TRONG THỰC TỂ

## Hoạt động 2: Tìm hiểu về mô phỏng trong thực tế

Mô tả một ứng dụng mô phỏng trong thực tế mà em biết. Ứng dụng đó thuộc lĩnh vực nào; có những lợi ích gì?

Mô phỏng có thể được áp dụng trong nhiều lĩnh vực khác nhau: Với không ít trường hợp, việc sử dụng mô phỏng được xác định là hết sức cần thiết và hiệu quả.

### 1. Trong lĩnh vực kỹ thuật
Mô phỏng có thể giúp xác định các lỗi tiềm ẩn, tối ưu hóa thiết kế và giảm nhu cầu về nguyên mẫu vật lý (Hình 29.2). Các kỹ sư có thể sử dụng mô phỏng để kiểm tra tính an toàn, độ bền vững cũng như hiệu suất của các sản phẩm mới, chẳng hạn như máy bay, ô tô, động cơ và cả các công trình xây dựng trong các tình huống khác nhau có thể xảy ra. Các cabin mô phỏng tập lái máy bay, ô tô, xe tăng, tàu chiến là những công cụ đắc lực để hướng dẫn và rèn luyện nâng cao kỹ năng sử dụng thiết bị, nhất là đối với các thiết bị đắt tiền hoặc đòi hỏi chi phí lớn cho mỗi lần sử dụng thực tế.

![Hình 29.2: Sử dụng mô phỏng trong cơ khí chế tạo máy](#)

### 2. Trong y học
Trong y học, có thể sử dụng mô phỏng để hướng dẫn thực hiện nhiều quy trình và kỹ thuật y khoa. Mô phỏng có thể được sử dụng để mô hình hóa sự lây lan của bệnh dịch, quan sát diễn biến tác dụng của chế phẩm thuốc trong cơ thể, cũng như đánh giá hiệu quả của các phương pháp điều trị khác nhau (Hình 29.3).

![Hình 29.3: Mô phỏng tác dụng của thuốc trong cơ thể](#)

### 3. Trong công nghiệp giải trí và trò chơi điện tử
Mô phỏng là công cụ quan trọng trong việc thiết lập môi trường và kịch bản gần như thực tế hay tạo ra hiệu ứng hình ảnh chân thực trong các phim điện ảnh. Mô phỏng còn giúp mô hình hóa hành vi của các nhân vật và đối tượng trong trò chơi, tạo ra trò chơi video, làm tăng thêm tính hấp dẫn và khả năng trải nghiệm cho khách hàng.

### 4. Trong giáo dục và nghiên cứu
Trong nhà trường và cả trong nghiên cứu, những phòng thí nghiệm ảo về Vật lý, Hóa học, Sinh học cung cấp môi trường an toàn để thực hiện nhiều thí nghiệm và tương tác với các mô hình khoa học. Nhờ có mô phỏng, có thể dễ dàng quan sát được bằng mắt thường nhiều hiện tượng trong tự nhiên; ví dụ vị trí, quỹ đạo và chuyển động của các thiên thể, sự biến đổi của các lục địa, chu kỳ phát triển của các loài sinh vật.

Phần mềm mô phỏng có thể trực quan hóa các mô hình toán học, giúp dễ dàng quan sát để tìm hiểu nhiều khái niệm phức tạp. Mô phỏng thậm chí có thể giúp dự đoán tác động của biến đổi khí hậu và thay đổi môi trường đối với hệ sinh thái và cuộc sống của con người.



# Mô phỏng trong quân sự

Trong quân sự, có thể sử dụng mô phỏng để thực hành diễn tập tác chiến, đánh giá hiệu quả của chiến thuật hợp đồng chủng trong nhiều tình huống khác nhau; hoặc huấn luyện sử dụng vũ khí, khí tài thông qua các phần mềm huấn luyện.

Nói chung, đối với tất cả các lĩnh vực nêu trên, mô phỏng là giải pháp cần được nghĩ tới, nhất là trong những trường hợp chi phí thử nghiệm thực tế tốn kém, phức tạp hoặc khó đo lường, có tính rủi ro cao, hoặc không thể thử nghiệm thực tế hay sản phẩm đang trong giai đoạn thiết kế cần kiểm tra ý tưởng và thiết kế trước khi thực hiện.

Mô phỏng là một kĩ thuật hữu ích, có thể được áp dụng trong nhiều lĩnh vực khác nhau như kĩ thuật, công nghệ, y tế, giáo dục, khoa học và đời sống.

## Hãy giới thiệu về ứng dụng mô phỏng trong một lĩnh vực nào đó mà em quan tâm:

----

## LUYÊN TẬP

1. Hãy chỉ ra một vài tình huống trong một lĩnh vực cụ thể được nêu trong Mục 2 và phân tích sự cần thiết phải sử dụng mô phỏng?
2. Hiện nay, trong chương trình đào tạo cấp bằng lái xe ô tô, học viên phải trải qua một số giờ học nhất định trong cabin mô phỏng (Hình 29.4). Đây là một hệ thống được thiết kế để giả lập quá trình lái xe ô tô trong môi trường ảo. Hãy phân tích các lợi ích của hệ thống này:

![Hình 29.4. Cabin mô phỏng tập lái xe ô tô](Hinh29.4)

----

## VẬN DỤNG

Tìm trên Internet một phần mềm mô phỏng các thuật toán sắp xếp hay tìm kiếm mà em đã học. Tìm hiểu cách sử dụng và chỉ ra lợi ích của việc sử dụng phần mềm đó.
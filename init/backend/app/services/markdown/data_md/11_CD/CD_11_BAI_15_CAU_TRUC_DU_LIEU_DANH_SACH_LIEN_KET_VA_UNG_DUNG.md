# BÀI 15: CẤU TRÚC DỮ LIỆU DANH SÁCH LIÊN KẾT VÀ ỨNG DỤNG

Học xong bài này, em sẽ:
- Trình bày được cấu trúc dữ liệu danh sách liên kết và một số ứng dụng của nó.

## Hãy cho biết danh sách mảng có nhược điểm gì?

### Cấu trúc danh sách liên kết

Danh sách liên kết (linked list) cũng gọi là danh sách móc nối, gồm các phần tử gọi là nút (node). Một nút có hai thành phần:
- Phần Data chứa dữ liệu.
- Phần liên kết gọi là Next.

Phần Next chứa địa chỉ của nút liền kề và được thể hiện bằng mũi tên từ Next trỏ đến nút đứng kề sau nó (xem Hình 1). Trong hình minh họa, các chữ cái A, B, C, D thể hiện dữ liệu chứa trong nút.

Để tiện trình bày, ta gọi phần Next trong một nút là con trỏ Next. Ký hiệu mũi tên trong hình minh họa thể hiện Next đang trỏ vào cái gì. Về bản chất, ký hiệu mũi tên thể hiện một kiểu dữ liệu kiểu đặc biệt, gọi là kiểu con trỏ. Con trỏ cho phép truy cập trực tiếp đến một địa chỉ ô nhớ cụ thể không dung.

Đuôi danh sách là nút cuối cùng trong danh sách không có nút nào đứng sau. Được thể hiện bằng hình vẽ Next trỏ đến Null và được hiểu rằng "không trỏ đến đâu cả". Con trỏ Tail trỏ đến nút đuôi danh sách.

Đầu danh sách được minh họa bằng mũi tên Head trỏ đến nút đầu tiên trong danh sách.

### Hình Minh Họa Một Danh Sách Liên Kết

Khi lập trình cần phân biệt một nút với phần Data chứa dữ liệu trong nút đó. Phân biệt phần Data với chính dữ liệu chứa trong nút đó, thể hiện bằng các chữ cái A, B, C, D trong hình minh họa. Nhưng để đơn giản trong trình bày các phép toán, phần tiếp theo gọi là nút A, nút B, nút C, nút D. Viết A.Next để nói về con trỏ từ nút A đến nút B và dễ nhận biết trên hình minh họa.

### Sự Khác Nhau Giữa Danh Sách Liên Kết và Mảng

So với mảng, danh sách liên kết có những điểm khác biệt sau:

- **Kích thước linh hoạt**: Danh sách liên kết có thể thay đổi kích thước trong quá trình thực thi, trong khi mảng có kích thước cố định.
- **Chi phí thêm/xóa**: Việc thêm hoặc xóa một nút trong danh sách liên kết thường nhanh hơn so với mảng, vì không cần phải dịch chuyển các phần tử khác.
- **Truy cập ngẫu nhiên**: Mảng cho phép truy cập ngẫu nhiên đến các phần tử, trong khi danh sách liên kết chỉ cho phép truy cập tuần tự.

Đọc bản mới nhất trên hoc10.vn.



# Danh sách liên kết

Các nút danh sách liên kết không được lưu trữ thành một khối liên tục, liên kết mà có thể nằm rải rác, lách rời nhau trong bộ nhớ.

## Phép duyệt danh sách liên kết

Các nút trong danh sách liên kết có chỉ số lặp duyệt luân tự từng nút của danh sách liên kết sử dụng một con trỏ `curr` (current) chỉ vào nút đang xét, thực hiện như sau:

- **Khởi tạo**:
- `Head` bắt đầu từ `Head`

- **Duyệt cập nút**:
- `A`: `Next` để duyệt cập nút
- `B`: `Next` để duyệt cập nút
- Kết thúc khi gặp `curr` là `Null`

![Hình 1](#) Thêm nút vào danh sách

## Thêm nút và gỡ bỏ nút

### Thêm nút có ba trường hợp

1. **Thêm nút vào đầu danh sách**:
- Nút mới thêm vào thành nút đầu tiên. Thao tác theo hai bước sau (Hình 2):
- Cho `ENext` trỏ đến nút `A`: `ENext = Head`
- Cho `Head` trỏ đến nút `E`: `Head`
- Thời gian thực hiện phép thêm nút vào đầu danh sách là \( O(1) \), không phụ thuộc độ dài danh sách.

2. **Thêm nút vào cuối danh sách**:
- Nối thêm nút mới vào cuối danh sách; nó trở thành nút cuối cùng. Con trỏ `Tail` trỏ đến nút cuối cùng của danh sách (Hình 1). Thao tác như minh họa trong Hình 26.
- Thời gian thực hiện phép thêm nút vào cuối danh sách là \( O(1) \), không phụ thuộc độ dài danh sách.

3. **Thêm nút vào giữa danh sách**:
- Tình huống minh họa: `CIT` ~ `B`. Thêm nút vào sau nút `B`. Thao tác như minh họa trong Hình 2c.
- Thời gian thực hiện phép thêm nút vào giữa danh sách là \( O(1) \), không phụ thuộc độ dài danh sách.

### Gỡ bỏ nút

- Tình huống minh họa: `CIT` ~ `B`. Gỡ bỏ nút sau nút `B` (Hình 3).

![Hình 5](#) Gỡ bỏ nút sau nút `B`.

----

Đọc bản mới nhất trên hoc10.vn Bản sách mẫu.



# Danh sách liên kết

## Ghi lưu con trỏ
- Để truy cập nút €: `tmp`
- Cho BNext trỏ đến nội dung sau C (là nút D): `BNext CNext`
- Sử dụng `tmp` để giải phóng phần bộ nhớ dành cho €

## Thao tác gỡ bỏ nút
- Gỡ bỏ nút đầu danh sách hay cuối danh sách chỉ khác chút ít.
- Thời gian thực hiện gỡ bỏ là \( O(1) \), không phụ thuộc vào độ dài danh sách.

## Danh sách liên kết kép
Cấu trúc danh sách liên kết trình bày trên chỉ có một con trỏ `Next` trỏ đến nút đứng kề ngay sau. Nếu mỗi nút có thêm một con trỏ nữa là `Prev` trỏ đến nút đứng kề ngay trước thì ta sẽ có danh sách liên kết kép.

### Hình minh họa
```
Neyl        NULL
Prev
```

## Thời gian thực hiện các phép toán của danh sách liên kết
- **Phép tìm kiếm**: Tìm nút chứa dữ liệu \( X \) (Data 1) để xử lý. Phải thực hiện tìm kiếm tuần tự từ đầu danh sách. Độ phức tạp của phép tìm kiếm là \( O(n) \) với \( n \) là số nút của danh sách.
- **Các thao tác thêm nút; gỡ bỏ nút** của danh sách liên kết dù ở bất cứ vị trí nào thì thời gian thực hiện đều là \( O(1) \). Đây là điểm ưu việt hơn danh sách mảng.

## Nhược điểm
Danh sách liên kết tốn thêm chỗ để lưu trữ thành phần `Next`. Đây là nhược điểm so với danh sách mảng.

## Một số kiểu danh sách đặc biệt và ứng dụng của danh sách liên kết
Dịch vụ cung cấp bài hát trực tuyến thường đưa ra một danh sách \( N \) bài hát đứng đầu một tuần; một tháng. Sau đó, danh sách này được sử dụng theo nhiều cách khác nhau: phát lại theo trình tự ngẫu nhiên; phát lại từ bài \( N - 1 \) đến 0 hay ngược lại.

### Câu hỏi
1. Kiểu danh sách này có những đặc điểm gì?
2. Có nên dùng cấu trúc danh sách liên kết để thực hiện kiểu danh sách này hay không?

## Sử dụng câu nối
Để liên kết các nút thành một dãy tuần tự tạo ra kiểu cấu trúc móc danh sách rất linh hoạt. Danh sách liên kết phát huy ưu điểm trong những trường hợp thường xuyên phải:
- Thêm phần tử.
- Gỡ bỏ phần tử ở bất cứ vị trí nào trong danh sách.
- Độ dài danh sách thay đổi nhanh và nhiều trong quá trình sử dụng.

----

Đọc bản mới nhất trên hoc10.vn.
Bản sách mẫu.



# Một số ví dụ dung danh sách liên kết

Ứng dụng đầu top N được cập nhật bằng các thao tác: gỡ bỏ một số.

## Danh sách nhóm

Phần tử lại các vị trí bất kỳ nào đó; chèn thêm phần tử vào vị trí bất kỳ nào đó. Độ dài N của danh sách cũng có các lựa chọn khác nhau ví dụ là 5, 10, 20.

Một số bài toán thực tế cần mô hình hóa một mảng lưới (diện, đường giao thông) hay một cấu trúc phân cấp hình cây (tổ chức hành chính; cây gia phả) không thể dùng một danh sách. Việc thể hiện mối liên kết giữa các nút (điểm giao cắt) phải cho phép cập nhật các thay đổi một cách linh hoạt. Danh sách liên kết sẽ được sử dụng trong các trường hợp này.

Dựa trên hình minh họa, mô tả các bước thực hiện các phép toán sau của danh sách liên kết để minh họa chung đều có thời gian là \( O(1) \).

a) Thêm nút vào cuối danh sách, thêm nút vào giữa danh sách.
b) Gỡ bỏ nút ở cuối danh sách, ở đầu danh sách.

Phân tích yêu cầu ứng dụng của một danh sách nhóm đứng đầu top N và cho biết. Nếu dùng kiểu danh sách của Python để thực hiện thì:

- Những thao tác cần làm với danh sách top N sẽ thực hiện qua các phép toán danh sách Python như thế nào?
- Kể tên một vài phép toán danh sách của Python không cần dùng đến cho trường hợp này.

## Câu hỏi

Câu 1: Hãy nêu các phép toán danh sách liên kết có thời gian thực hiện \( O(1) \).
Câu 2: Hãy nêu các phép toán danh sách liên kết có thời gian thực hiện \( O(n) \).
Câu 3: Nếu muốn truy cập chứa dữ liệu \( X \) thì phải làm gì? Ước lượng thời gian thực hiện.

## Tóm tắt bài học

Danh sách liên kết là một chuỗi nhiều nút, không đánh chỉ số tuần tự các nút, lưu trữ rải rác không liên kê trong bộ nhớ; các nút móc nối với nhau để có thể duyệt theo chiều tiến hoặc cả hai chiều tiến và lùi.
Danh sách liên kết khắc phục nhược điểm của danh sách mảng: không bị giới hạn độ dài; thời gian thực hiện các phép thêm nút, gỡ bỏ nút là \( O(1) \).
Danh sách liên kết được dùng để mô hình hóa một mảng lưới (đồ thị) hay một cây phân cấp.



# BÀI Tìm hiểu Thêm

## DANH SÁCH LIÊN KẾT TRONG PYTHON

Có thể lập trình Python thực hiện cấu trúc danh sách liên kết theo mô hình chung đã trình bày trên. Tuy nhiên, việc này đòi hỏi kiến thức cơ bản về phương pháp lập trình hướng đối tượng, một chủ đề rất quan trọng của Tin học nhưng chưa có trong nội dung chương trình bậc phổ thông.

Kiểu danh sách của Python rất tổng quát, có đủ các phép toán danh sách. Phép thêm tử, gỡ bỏ phần tử có thể thực hiện tại bất cứ vị trí nào. Kiểu danh sách phản ứng không đến hiệu quả của Python dù đáp ứng các yêu cầu ứng dụng nêu như xếp hàng thời gian.

Python có một số kiểu dữ liệu làm sẵn có thể dùng để thực hiện những kiểu danh sách đặc thù phù hợp với kiểu danh sách tổng quát, điển hình là deque.

1. **Thư viện collections** có định nghĩa sẵn kiểu dữ liệu hàng (Doubly Ended Queue) là một kiểu danh sách được tối ưu hóa cho trường hợp phải lấy ra hay thêm vào một phần tử ở vị trí cuối hay ở đầu danh sách. Tên gọi phép thêm vào cuối là `append`, phép thêm vào đầu là `appendleft`, phép lấy ra là `pop` và `popleft`. Các phép thêm vào và lấy ra đều có độ phức tạp thời gian O(1) trong khi với kiểu list thì độ phức tạp là O(n). Để biểu diễn một hàng đợi thông thường (queue) trong thực tế, chỉ cần dùng `append` và `popleft`.

2. Trong một số ngôn ngữ lập trình khác, để biểu diễn dữ liệu thực tế không phải là dãy tuần tự, ví dụ như: cây gia phả, bản đồ giao thông, lập trình sẽ phải tự định nghĩa một kiểu dữ liệu dựa theo cấu trúc danh sách liên kết và sử dụng kiểu dữ liệu này trong văn bản chương trình. Trong Python có thể dễ dàng thể hiện một cây phân cấp hay đồ thị bằng cách sử dụng kiểu từ điển mà Python đã định nghĩa sẵn.

3. Có các gói thư viện bên ngoài cho Python đã làm sẵn danh sách liên kết, người lập trình chỉ cần tìm hiểu để sử dụng khi cần thiết.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.
# BÀI 7: BÀI TOÁN TÌM KIẾM

## SAU BÀI HỌC NÀY EM SẼ:
- Biết được ý nghĩa của bài toán tìm kiếm trên thực tế.
- Biết và thực hiện được chương trình tìm kiếm tuần tự và tìm kiếm nhị phân.

### Trò chơi lật thẻ
Giả sử có một bộ thẻ, trên mỗi thẻ in một số bất kỳ. Các thẻ được xếp úp mặt xuống bàn theo thứ tự tăng dần của các số ghi trên thẻ. Người chơi mỗi lần chỉ được lật một thẻ để xem giá trị số in trên đó. Nếu giá trị số in trên thẻ lật lên bằng số K cho trước thì trò chơi kết thúc. Bạn An đã chơi bằng cách lật lần lượt từng thẻ từ đầu đến cuối. Theo em, An có chắc chắn xác định được thẻ nào in số K không? Em có cách nào xác định được thẻ in số K nhanh hơn An không?

## 1. BÀI TOÁN TÌM KIẾM TRÊN THỰC TẾ
### Hoạt động 1: Bài toán tìm kiếm
Với các bài toán tìm kiếm sau, hãy thảo luận về miền dữ liệu và khả năng các kết quả có thể tìm được của bài toán:

- **Bài toán 1**: Em cần tìm hình ảnh các cây hoa hồng đẹp trên Internet để đưa vào bài trình bày về cách trồng hoa.
- **Bài toán 2**: Em cần tìm một tệp văn bản có tên bai-hoc-1.docx trên máy tính của em nhưng đã lâu rồi chưa sử dụng lại.
- **Bài toán 3**: Em cần tìm 5 bạn học sinh có điểm trung bình các bài thi cao nhất trong kỳ thi Olympic Tin học của thành phố.

#### Phân tích miền dữ liệu:
- Với bài toán 1, miền dữ liệu là tất cả các ảnh có trên các máy tính kết nối mạng Internet. Kết quả là các ảnh có hình hoa hồng.
- Với bài toán 2, miền dữ liệu là các tệp văn bản có trên đĩa cứng máy tính của em. Kết quả là tệp có tên bai-hoc-1.docx.
- Với bài toán 3, miền dữ liệu là danh sách học sinh và điểm các bài dự thi của kỳ thi Olympic Tin học thành phố. Kết quả là danh sách 5 bạn có thành tích cao nhất tính theo điểm trung bình.

Có thể nói tìm kiếm là một trong những bài toán quan trọng nhất của Tin học. Việc thiết kế thuật toán tìm kiếm sẽ phụ thuộc vào cấu trúc của miền dữ liệu cần tìm kiếm và tiêu chí cụ thể của bài toán tìm kiếm.



# Bài học: Tìm kiếm tuần tự

## Nội dung lý thuyết
Tìm kiếm tuần tự là một phương pháp tìm kiếm đơn giản, trong đó các phần tử của một dãy được duyệt lần lượt từ đầu đến cuối để tìm một giá trị cụ thể. Đây là một trường hợp riêng của việc tìm kiếm trên mô hình dữ liệu là một dãy các đối tượng (danh sách).

### Đầu vào:
- Dãy số A[0], A[1], ..., A[n-1] và giá trị K.

### Đầu ra:
- Chỉ số i mà phần tử A[i] có giá trị bằng K. Nếu không tìm thấy, trả về giá trị -1.

## Ví dụ minh họa
Cho dãy số A = [1, 4, 7, 8, 3, 9, 10] và cần tìm kiếm phần tử có giá trị bằng 9.

Có thể thực hiện tìm kiếm tuần tự như sau:
- **Bước 1**: i = 0: A[0] = 1 không bằng 9
- **Bước 2**: i = 1: A[1] = 4 không bằng 9
- **Bước 3**: i = 2: A[2] = 7 không bằng 9
- **Bước 4**: i = 3: A[3] = 8 không bằng 9
- **Bước 5**: i = 4: A[4] = 3 không bằng 9
- **Bước 6**: i = 5: A[5] = 9 là phần tử cần tìm.

Như vậy, phần tử cần tìm có chỉ số 5.

## Bài tập và câu hỏi
1. Hãy xác định miền dữ liệu và nghiệm có thể của các bài toán tìm kiếm sau:
- Bài toán tìm đường đi từ nhà em đến trường học dựa trên bản đồ số.
- Bài toán tìm tất cả các trường trung học thông (tên trường, địa chỉ) ở quận (huyện) em đang cư trú.

2. Viết thuật toán tìm kiếm tuần tự cho một dãy số bất kỳ.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh có thể là một sơ đồ minh họa quá trình tìm kiếm tuần tự trên dãy số, thể hiện các bước duyệt và so sánh giá trị.)

## Bảng biểu
| Chỉ số (i) | Giá trị A[i] | Kết quả so sánh |
|------------|---------------|------------------|
| 0          | 1             | Không bằng 9     |
| 1          | 4             | Không bằng 9     |
| 2          | 7             | Không bằng 9     |
| 3          | 8             | Không bằng 9     |
| 4          | 3             | Không bằng 9     |
| 5          | 9             | Bằng 9           |




# Bài học: Thuật toán tìm kiếm tuần tự và tìm kiếm nhị phân

## 1. Thuật toán tìm kiếm tuần tự
### Nội dung lý thuyết
Thuật toán tìm kiếm tuần tự được thực hiện bằng cách duyệt lần lượt các phần tử của dãy từ đầu đến cuối để tìm phần tử có giá trị bằng giá trị cần tìm.

### Ví dụ minh họa
Cho dãy A = [1, 91, 45, 23, 67, 9, 10, 47, 90, 46, 86].
- Thuật toán tìm kiếm tuần tự cần thực hiện bao nhiêu lần duyệt để tìm ra phần tử có giá trị bằng 47 trong dãy?

### Bài tập và câu hỏi
1. Khi nào thì tìm kiếm tuần tự sẽ tìm được ngay kết quả, cần ít bước nhất?
2. Khi nào thì tìm kiếm tuần tự sẽ cần nhiều bước nhất? Cho ví dụ.

----

## 2. Tìm kiếm nhị phân
### Hoạt động 3: Thuật toán tìm kiếm nhị phân
Cho trước một dãy số đã được sắp xếp theo thứ tự tăng dần. Hãy đọc, quan sát và thảo luận cách làm sau đây để hiểu được thuật toán tìm kiếm nhị phân; biết được tính ưu việt của thuật toán này so với thuật toán tìm kiếm tuần tự trên một dãy các phần tử đã sắp xếp.

### a) Phân tích bài toán
Khác với bài toán tìm kiếm tuần tự, bài toán tìm kiếm nhị phân tìm kiếm với dãy số đã được sắp xếp. Khi duyệt một phần tử bất kỳ của dãy số, em có thể xác định được phần tử cần tìm sẽ nằm ở bên trái hay bên phải phần tử đang duyệt; từ đó quyết định tìm tiếp theo hướng nào mà không cần duyệt tất cả các phần tử của dãy số.

### b) Thuật toán tìm kiếm nhị phân
Thuật toán tìm kiếm nhị phân được thực hiện bằng cách liên tục thu hẹp phạm vi tìm kiếm. Nếu giá trị của phần tử ở giữa bằng 'K' thì thông báo tìm thấy. Nếu giá trị K nhỏ hơn giá trị của phần tử ở giữa thì thu hẹp phạm vi tìm kiếm là nửa đầu của dãy A (ngược lại thì phạm vi tìm kiếm là nửa sau). Cứ tiếp tục thu hẹp phạm vi như vậy cho đến khi tìm thấy hoặc đã duyệt hết thì thông báo không tìm thấy.

#### Các bước thực hiện:
1. Thiết lập các giá trị `left`, `right` là chỉ số phần tử đầu và cuối của dãy cần tìm. Như vậy cần tìm K trong dãy A[left..right]: Ban đầu đặt `left = 0`, `right = n - 1`.
2. So sánh K với phần tử giữa dãy A[mid] với `mid` là phần nguyên của phép chia `(left + right) cho 2`, có ba trường hợp có thể xảy ra:
- Nếu K = A[mid] thì trả về chỉ số mid và kết thúc chương trình.
- Nếu K &#x3C; A[mid] thì phần tử cần tìm sẽ nằm ở dãy con bên trái của phần tử A[mid], cập nhật giá trị `right = mid - 1`, giữ nguyên giá trị `left`.

### Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa quá trình tìm kiếm nhị phân với các chỉ số `left`, `right`, và `mid` được đánh dấu rõ ràng.)

### Bảng biểu
| Chỉ số | Giá trị |
|--------|---------|
| 0      | 1       |
| 1      | 91      |
| 2      | 45      |
| 3      | 23      |
| 4      | 67      |
| 5      | 9       |
| 6      | 10      |
| 7      | 47      |
| 8      | 90      |
| 9      | 46      |
| 10     | 86      |




# Bài học: Thuật toán tìm kiếm nhị phân

## Nội dung lý thuyết
Nếu K > A[mid] thì phần tử cần tìm sẽ nằm ở dãy con bên phải của phần tử A[mid]; cập nhật giá trị left = mid + 1, giữ nguyên giá trị right. Lặp lại bước trên cho đến khi tìm thấy phần tử bằng K hoặc phạm vi tìm kiếm rỗng (right &#x3C; left).

## Ví dụ minh họa
Giả sử dãy số đã sắp xếp là A = [1, 3, 4, 7, 8, 9, 10]. Giá trị cần tìm là K = 9.

- **Bước 1**: Phạm vi tìm kiếm là các phần tử được in đậm **[1, 3, 4, 7, 8, 9, 10]**
- left = 0, right = 6
- mid = (0 + 6) // 2 = 3
- A[mid] = A[3] = 7 &#x3C; K, phần tử cần tìm nằm ở dãy con bên phải.
- Cập nhật chỉ số left = mid + 1 = 3 + 1 = 4.

- **Bước 2**: Phạm vi tìm kiếm là các phần tử được in đậm **[8, 9, 10]**
- left = 4, right = 6
- mid = (4 + 6) // 2 = 5
- A[mid] = A[5] = 9 = K, phần tử cần tìm có chỉ số 5. Kết thúc chương trình.

Ví dụ trên cho thấy thời gian tìm với thuật toán tìm kiếm nhị phân nhanh hơn so với thuật toán tìm kiếm tuần tự; do số phần tử cần duyệt giảm một nửa sau mỗi vòng lặp. Cùng dãy số có số phần tử như nhau (A = [1, 3, 4, 7, 8, 9, 10]) và giá trị tìm kiếm (K = 9) thì thuật toán tìm kiếm tuần tự cần 6 bước, nhưng nếu dãy đã sắp xếp và dùng thuật toán tìm kiếm nhị phân thì chỉ cần hai bước.

## Bài tập và câu hỏi
1. Giải thích tại sao thuật toán tìm kiếm nhị phân lại nhanh hơn thuật toán tìm kiếm tuần tự.
2. Thực hiện thuật toán tìm kiếm nhị phân trên dãy số A = [2, 4, 6, 8, 10, 12, 14] với K = 10. Ghi lại các bước thực hiện.

## Hình ảnh mô tả
- **Hình ảnh 1**: Minh họa các bước của thuật toán tìm kiếm nhị phân.
- **Hình ảnh 2**: Biểu đồ thể hiện sự giảm số lượng phần tử cần tìm kiếm sau mỗi bước.

## Bảng biểu
| Bước | Giá trị left | Giá trị right | Giá trị mid | A[mid] | K so sánh |
|------|--------------|---------------|-------------|--------|-----------|
| 1    | 0            | 6             | 3           | 7      | 9 > 7     |
| 2    | 4            | 6             | 5           | 9      | 9 = 9     |




# Bài học: Tìm kiếm nhị phân

## Nội dung lý thuyết
Thuật toán tìm kiếm nhị phân được áp dụng cho các dãy được sắp xếp theo thứ tự xác định. Sau mỗi bước lặp của thuật toán, phạm vi tìm kiếm được thu hẹp dần. Ví dụ với dãy tăng dần, nếu giá trị cần tìm nhỏ hơn giá trị của phần tử ở giữa của dãy thì phạm vi tìm kiếm thu hẹp vào nửa đầu của dãy; ngược lại, phạm vi tìm kiếm là nửa cuối của dãy. Cứ tiếp tục như vậy cho đến khi tìm thấy hoặc phạm vi tìm kiếm bằng rỗng.

## Ví dụ minh họa
Cho dãy A = [0, 4, 9, 10, 12, 14, 17, 18, 20, 31, 34, 67]

1. Với thuật toán tìm kiếm tuần tự, cần duyệt bao nhiêu phần tử để tìm ra phần tử có giá trị bằng 34?
2. Với thuật toán tìm kiếm nhị phân, cần duyệt bao nhiêu phần tử để tìm ra phần tử có giá trị bằng 34?

Thay vì lần lượt lật các thẻ từ đầu đến cuối; bạn Minh đã chơi như sau: Đầu tiên Minh lật thẻ ở giữa; sau đó tùy theo số ghi trên thẻ là lớn hơn hay nhỏ hơn số K mà lật tiếp thẻ ở ngay bên trái, hoặc ngay bên phải thẻ ở giữa. Trong trường hợp này; số lần nhiều nhất mà Minh phải lật để tìm ra thẻ in số K là bao nhiêu?

## Bài tập và câu hỏi
1. Em hãy chỉnh sửa thuật toán tìm tuần tự để tìm ra tất cả các phần tử trong dãy bằng giá trị cần tìm, biết dãy đó có nhiều phần tử bằng giá trị cần tìm.
2. Viết chương trình của thuật toán tìm kiếm nhị phân với dãy sắp xếp giảm.

## Vận dụng
1. Cho A là danh sách tên các học sinh trong lớp, viết chương trình tìm kiếm tuần tự để tìm ra các học sinh có tên là Hoàn.
2. Cho A là danh sách tên các học sinh trong lớp được sắp xếp theo thứ tự bảng chữ cái, viết chương trình tìm kiếm nhị phân để tìm ra các học sinh có tên là Minh.

## Hình ảnh mô tả
(Ghi chú về hình ảnh: Hình ảnh minh họa thuật toán tìm kiếm nhị phân với các bước lặp và phạm vi tìm kiếm được đánh dấu.)

## Bảng biểu
(Bảng biểu mô tả số lần duyệt phần tử trong các thuật toán tìm kiếm tuần tự và nhị phân.)
# BÀI 1: THỰC HÀNH THIẾT KẾ VÀ LẬP TRÌNH THEO MÔ ĐUN

Học xong bài này, em sẽ:
- Vận dụng được phương pháp thiết kế chương trình thành các mô đun (hàm) cho một bài toán cụ thể.
- Viết được chương trình thực hiện một số hàm theo thiết kế.

## Nhiệm vụ; yêu cầu kết quả và tổ chức thực hiện

### Nhiệm vụ:
Thực hiện bài tập lớn về lập trình Python. Mô tả bài toán:

**Dữ liệu đầu vào:** Tệp `bangtinh` chứa dữ liệu là điểm kết quả các phần mềm môn học của lớp LIA, gồm các cột: Họ và đệm Tên; Điểm Toán; Điểm Ngữ văn; Điểm Tin học. Để đơn giản, ta chưa xét cột Họ và đệm và giả thiết mỗi ô trong cột Tên là một không có dấu cách; các tên cột bỏ bớt chữ "Đỉêni" và chỉ còn một từ cho ngắn gọn.

### Kết quả (KQ) đầu ra:
1. **KQ1:** Phân tích kết quả học tập của từng học sinh: điểm trung bình chung; điểm cao nhất; điểm thấp nhất; số lượng điểm thuộc các mức (Tốt, Khá, Đạt, Chưa đạt). Ghi lưu thành tệp văn bản `phantich_theolS.txt`.

2. **KQ2:** Phân tích kết quả học tập theo từng môn học; ghi lưu thành tệp văn bản `phantich_LhcoMon.txt`.
- Danh sách sắp xếp điểm mỗi môn học theo thứ tự giảm dần kèm tên học sinh.
- Điểm cao nhất, điểm thấp nhất, trung bình cộng, tỷ lệ phần trăm điểm theo các mức: Tốt, Khá, Đạt, Chưa đạt.

3. **KQ3:** Lập danh sách học sinh để xét khen thưởng; ghi lưu thành tệp văn bản `xetKhenThuong.txt` gồm hai cột Tên, chamDiem. Quy tắc chấm điểm:
- a) Cứ mỗi điểm môn học đạt mức Tốt, chamDiem được cộng thêm điểm.
- b) Mỗi điểm môn học dưới mức Khá, chamDiem bị trừ điểm.

### Yêu cầu kết quả:
Với mục đích luyện kỹ năng lập trình, mỗi nhóm cần hoàn thành hai sản phẩm chương trình SP#1 và SP#2 với yêu cầu như sau:
- **SP#1:** Tự viết các hàm (đơn) chương trình, kế thừa kết quả lập trình đã có được đến nay.
- **SP#2:** Sử dụng tối đa các hàm đã có sẵn trong Python để hoàn thành nhiệm vụ.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Tổ chức thực hiện

- Lập các nhóm dự án, mỗi nhóm khoảng 5 đến 6 học sinh: chọn nhóm trưởng.
- Các nhóm cùng thực hiện Nhiệm vụ 1.

## Nhiệm vụ 1: Phân tích thiết kế chương trình theo mô đun

### Yêu cầu:
Dựa trên mô tả kết quả đầu ra của bài tập lớn, thiết kế một số hàm (mô đun chương trình) đáp ứng các yêu cầu sau:

- Với mỗi hàm, xác định rõ chức năng hàm sẽ làm gì, tên hàm, đầu vào, đầu ra và nêu cụ thể trả về chương trình chính cái gì (nếu có trả về).
- Nêu cách phối hợp các hàm này trong chương trình chính để nhận được tất cả các kết quả đầu ra đã mô tả trong KQ1, KQ2 và KQ3.

### Hướng dẫn thực hiện:

#### Giai đoạn 1:
Liệt kê các việc lớn để nhận được các kết quả KQ1, KQ2 và KQ3:

1. Đọc dữ liệu từ tệp: Tổ chức dữ liệu trong chương trình bằng các kiểu dữ liệu của Python sao cho thuận tiện để thực hiện các việc tiếp theo.
2. Phân tích dãy điểm của học sinh để có KQ1 và KQ3; viết kết quả vào các tệp `phantich_theoHS.txt` và `retKhenThuong.txt`.
3. Với mỗi môn học, sắp xếp dãy điểm để có KQ2; viết kết quả vào tệp `phantich_theolon.txt`.
4. Với mỗi môn học, tích dãy điểm để có KQ2b; viết kết quả vào tệp `phantich_theoMon.txt`.

#### Giai đoạn 2: Thiết kế các hàm
- Đọc dữ liệu từ tệp: Dữ liệu đầu vào chứa trong một tệp, đọc vào từng dòng và xử lý phức tạp. Có thể viết một hàm thực hiện việc này. Đặt tên hàm: ví dụ là `nhapTuTep`.



# Phân tích điểm học sinh

## 1. Đầu vào và đầu ra
- **Đầu vào:** tệp
- **Đầu ra:** dữ liệu trong chương trình được tổ chức như sau:
- Mảng hai chiều các điểm số. Mảng mô hình là dãy điểm của một học sinh, sẵn sàng để phân tích kết quả học sinh qua.
- Cột Tên trong bảng kết quả học tập tạo thành danh sách các tên học sinh để ghép với từng cột điểm số môn học; tách riêng được kết quả học tập theo từng môn.
- Hàng các tên môn học tạo thành danh sách tên môn học để dễ dàng lấy ra từng tên môn học theo chỉ số cột.

## 2. Phân tích điểm theo học sinh
Có thể tách thành các việc nhỏ cụ thể hơn như sau:

### 2a) Phân tích dãy điểm số
- **Đầu vào:** một dãy điểm số.
- **Đầu ra:** tra về sum, max, min số lượng điểm thuộc các mức xếp hạng Tốt, Khá, Đạt, Chưa đạt.
- **Thiết kế một hàm và đặt tên, ví dụ là `ptDiem_`.**

### 2b) Xét khen thưởng
- Nếu `chamDiem`, thì viết thêm `(tên, chamDiem)` thành một dòng vào tệp `xetKhenThuong.txt`; có thể thực hiện việc này bằng một vài câu lệnh không cần viết thành một hàm riêng.
- Lặp lại các việc 2a) và 2b) cho mỗi hàng trong mảng hai chiều `n x m` sẽ hoàn thành phân tích điểm cho toàn bộ học sinh và lập xong danh sách học sinh được xét khen thưởng.
- Có thể thiết kế thân vòng lặp thành một hàm và đặt tên, ví dụ là `ptHocSinh`.
- **Đầu vào:** Một hàng trong mảng hai chiều `n x m` (một dãy điểm số).
- **Đầu ra:**
- Thêm một dòng vào tệp "phantich theoHS.txt" (gọi hàm `ptDiem`).
- Thêm `(tên, chamDiem)` vào tệp "xetKhenThuong.txt" nếu `chamDiem`.

## 3. Phân tích điểm theo môn học
### 3a) Chuẩn bị đầu vào để sẵn sàng phân tích điểm theo môn học
- Dãy điểm số của một môn học là một cột của mảng hai chiều `n` không sẵn có ngay như một danh sách Python. Cũng chưa có sẵn danh sách các cặp (tên, điểm) là kết quả của mỗi môn học (ở đây tên là `ten_hoc_sinh`).

----

**Đọc bản mới nhất trên hoc10.vn**
**Bản sách mẫu**



# Thiết kế một hàm

## 1. Hàm `tachMon`
- **Đầu vào**: dữ liệu trong chương trình (sau khi đọc từ tệp vào)
- **Đầu ra**: trả về tên danh sách dãy điểm số một môn học và tên danh sách các cặp (tên, điểm) cho môn học đó.

## 2. Phân tích điểm một môn học
- Nhấn mạnh rằng yêu cầu kết quả KQI và KQ2b là tương tự như nhau. Hàm `ptDiem` sử dụng được cho cả hai việc, phân tích điểm từng học sinh và phân tích điểm từng môn học.

## 3. Sắp xếp danh sách các cặp (tên, điểm) theo thứ tự điểm giảm để có KQZa:
- Ta đã viết một số chương trình thực hiện các thuật toán sắp xếp dãy số. Có thể cải biên để nhận được một hàm thực hiện sắp xếp danh sách các cặp (tên, điểm) theo thứ tự điểm giảm.

### 3a. Lặp lại các việc 3b) và 3c) cho mỗi cột trong mảng hai chiều
- "X m" sẽ hoàn thành phân tích điểm cho toàn bộ các môn học. Có thể thiết kế một hàm nhân kết quả từ `tachMon` và thực hiện 3b) và 3c) cho một môn học, đặt tên ví dụ là `ptMonloc`.

- **Đầu vào**: danh sách điểm một môn học và danh sách các cặp (tên, điểm).
- **Đầu ra**:
- Thêm một dòng vào tệp "phantich_theoMon.txt" (gọi hàm `ptDiem`);
- Thêm danh sách các cặp (tên, điểm) theo thứ tự điểm giảm vào tệp "phantich_theoMon.txt" (gọi hàm sắp xếp đã cải biên).

## Nhiệm vụ 2: Đọc dữ liệu từ tệp và tổ chức dữ liệu trong chương trình
### Yêu cầu:
- Viết chương trình thực hiện hàm `nhapTuTep` và chạy thử kiểm tra.

### Hướng dẫn thực hiện:
1. Tạo tệp dữ liệu đầu vào: Một cách đơn giản là cắt dán các khối ô cần thiết từ số phần mềm bảng tính điện tử vào tệp dạng soạn thảo trong IDE của Python.
2. Lưu thành tệp có đuôi tên "txt". Để tiện trình bày, ta đặt tên tệp đầu vào, ví dụ là "bangDicm.txt".
3. Bổ sung thêm vào dòng đầu tiên của tệp hai số nguyên dương n, m là số học sinh và số môn học.
4. Mở tệp ở chế độ đọc.
5. Viết các câu lệnh đọc dữ liệu từ tệp: kế thừa, sử dụng các câu lệnh đã viết trong các bài thực hành về cấu trúc mảng một và hai chiều.

### Kết quả đầu ra:
- Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Danh sách tenHIS: tửr cột Tên cua bangDiem.
# Danh sach tenMon: lửhanglên cột cua bangDiem.
# Mang chiều mỗihanglà dãv diêm cua môt hoc sinh hai
# Dóngtệp sau khi dọc xong

## Nhiệm vụ 3.
### Yêu cầu:
Viết chưong trình thuc hiện hàm tachMon và chay thử kiêm tra.

### Hưởng dẫn thực hiện:
- Đẩu vào cua hàm náy là kết quả thực hiện nhapTuTep gôm có danh sách tenHS (các tên học sinh)
- danh sách tenMon (các tên môn học) và mang hai chiều n
- Đọc lunecột cua mang hai chiêu đê có dãy sổ các dỉêm mỗi môn học.
- Ghép tơngứngmỗí tên hoc sinh tử danh sách tenHS với mỗi diêm môn hoc sẽ thảnh danh sách các cặp (tên, điềm) cho món hoc dó
- Tra về tên danh sach dãy diêm số môn học và tên danh sach các cặp (tên. điêm)

## Nhiệm vụ 4.
### Sẳp xếp kết quả một môn hoc theo thứ tự giảm dẩn
### Yêu cầu:
Cai bỉên một hàm thực hỉện thuật toán sảp xêp nào đó, vi dụ sẳp xêp nhanh ckSort thành hàm quickSort_tuple_down dê sẳp xếp một danh sách các cặp (tên, diêm) theo thử tự dỉêm giam dân.

### Hưởng dẫn thựe hiện:
- Cai biên hàm phandoanLomuto thành hàm phandoanLomuto_tuple để sắp cac cặp (Tên; đỉẻm môn hoc) theo thanh phần dỉểm môn hoc
- Trong hàm phandoanLomuto_tuple dảo chiêu phép so sánh trong câu Iệnh if tur *&#x3C;= thành dê sảp thửr tuᵍˡᵃᵐdẩn; đặt tên hàm mớỉ là phandoanLomuto_tuple_down
- DunghàmphandoanLomuto_tuple down dê cai bỉênqu1ckSort thành hàm quickSort_tuple_down

Chaychương trinh thực hiện quickSort_tuple down vửa hoan thanh vớí dâu vào là kết qua mòn Tin học cua lớp em và cho biết kết qua; diêm cao nhất; nhungban có diêm cao nhất: diêm thấp nhât.

Đọc bản mới nhất trên hoc10.vn Bản sách mẫu
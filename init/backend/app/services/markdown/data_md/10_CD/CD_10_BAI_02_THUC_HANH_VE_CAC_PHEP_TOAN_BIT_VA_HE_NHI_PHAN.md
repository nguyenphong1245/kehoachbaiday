# BÀI 2: THỰC HÀNH VỀ CÁC PHÉP TOÁN BIT VÀ HỆ NHỊ PHÂN

Học xong bài này, em sẽ:
- Thực hiện được các phép toán bit NOT, AND, OR và XOR theo từng bit và cho dãy bit.
- Thực hiện được các phép toán cộng và nhân hai số nhị phân.
- Viết được số bù 1, số bù 2 của một số nguyên nhị phân và biết được số bù 2 là số đối của số nguyên nhị phân.

## Bài 1: Chuyển đổi biểu diễn số ở hệ thập phân sang hệ nhị phân

Chuyển số 44 ở hệ thập phân thành số ở hệ nhị phân bằng cách thực hiện theo hướng dẫn từ mảng bước trong bảng sau:

| Bước | Thao tác                                      | Kết quả | Gợi ý   |
|------|-----------------------------------------------|---------|---------|
| 1    | Chuyển số 4 sang dạng nhị phân               | 4 = 2²  |         |
| 2    | Chuyển số 8 sang dạng nhị phân               | 8 = 2³  |         |
| 3    | Chuyển số 32 sang dạng nhị phân              | 32 = 2⁵ |         |
| 4    | Cộng ba số cùng cột ở trên trong hệ nhị phân|         |         |

## Bài 2: Cộng và nhân hai số nhị phân

Thực hiện phép cộng và phép nhân hai số nhị phân. Tạo bảng (ít nhất 3 bảng) theo mẫu bên:

**Ghi chú:** Cột 2, hàng 1, hàng 2 là các số nhị phân ứng với số có độ dài không dưới 3 bit.

| Số x | Số y | Kết quả x + y | Kết quả x * y |
|------|------|----------------|----------------|
|      |      |                |                |
|      |      |                |                |
|      |      |                |                |

Trong bảng em vừa tạo ra, hãy tính và điền kết quả tương ứng với phép cộng và phép nhân.

## Bài 3: Tính số bù của một số nhị phân

a) Cho số nhị phân x. Kết quả của phép toán NOT x ký hiệu là x̅. Ta gọi x̅ là số bù 1 của x. Em hãy viết số bù 1 của số 44 ở hệ nhị phân.

b) Cho số nhị phân x. Kết quả của phép toán x̅ + 1 là số bù 2 của x. Em hãy viết số bù 2 của số 44 ở hệ nhị phân.



# Bài 4. Khám  ý nghĩa của số bù của một số nhị phân

Em hãy thực hiện phép cộng = số nhị phân x có giá trị thập phân là 44 với số bù 2 của x và cho biết kết quả nếu quy ước độ dài dãy bit biểu diễn số nguyên trong máy là 1 byte.

Chú ý: Với quy ước độ dài dãy bit biểu diễn số nguyên cố định là 1, kết quả phép cộng = X với số bù 2 của x luôn bằng 0. Số bù 2 của X là số đối của x. Trong máy tính, để biểu diễn số nguyên âm, người ta không cũng dùng nhị phân thành số bù 2, viết thêm dấu trừ mà cách chuyển số nguyên.

Một bài kiểm tra môn Tin học gồm 10 câu hỏi trắc nghiệm đúng sai. Đáp án được biểu diễn bằng dãy 10 bit, ký hiệu là DapAn. Trả lời của thí sinh được biểu diễn bằng dãy 10 bit ký hiệu là Traloi.

Em hãy dùng phép toán bit để tạo ra KetQua là dãy 10 bit, biểu diễn kết quả chấm từng câu hỏi, đúng là 1, sai là 0.

Em hãy tính điểm cho thí sinh theo thang điểm 10.

## BÀI TÌM HIỂU THÊM

### HỆ ĐẾM CƠ SỐ 8 VÀ HỆ ĐẾM CƠ SỐ 16

Một dãy dài nhiều ký số 0 và 1 tiện cho máy tính nhưng sẽ rất khó đọc với con người. Trong tin học, người ta còn định nghĩa hai hệ đếm khác là hệ đếm cơ số 8 và hệ đếm cơ số 16.

- Để viết một số hệ bát phân, ta dùng tám ký số: 0, 1, 2, 3, 4, 5, 6, 7.

Ví dụ minh hoạ:

\[
16_{8} = 1 \times 8^4 + 6 \times 8^3 + 4 \times 8^2 + 5 \times 8^1 + 3 \times 8^0 = 7,467_{10}
\]

- Hệ đếm cơ số 16 hay hệ thập lục phân quy ước từ trái sang phải, cứ dịch thêm một vị trí sang trái thì giá trị của ký số được tăng thêm 16 lần. Để viết một số hệ thập lục phân, sẽ cần 16 ký hiệu khác nhau: Ta mới có 10 ký số quen thuộc trong hệ thập phân. Người ta dùng thêm các chữ cái và quy ước giá trị của chúng trong hệ thập phân như sau:
- A = 10
- B = 11
- C = 12
- D = 13
- E = 14
- F = 15

Ví dụ minh hoạ:

\[
1D2B_{16} = 1 \times 16^3 + 13 \times 16^2 = 7,467_{10}
\]

Đạt 38 sách tài học 10.vn
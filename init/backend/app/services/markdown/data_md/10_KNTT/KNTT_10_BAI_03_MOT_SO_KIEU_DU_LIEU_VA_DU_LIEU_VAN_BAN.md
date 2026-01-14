# I. Biểu Diễn Thông Tin Trong Máy Tính

## Phân loại thông tin

### Hình ảnh một thẻ căn cước công dân

```
CÔNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
```

**Những thông tin gì?**

- Các thông tin đó thành các nhóm
- Các thông tin có thể tách ghép
- Các thông tin có thể so sánh được để tìm kiếm và nhóm

### Thông tin trên thẻ căn cước công dân

| Thông tin                | Nội dung                     |
|--------------------------|------------------------------|
| Số/CMT                  | 001000456789                 |
| Họ và tên               | NGUYỄN THÀNH CÔNG           |
| Ngày sinh               | 01/01/2000                   |
| Giới tính               | Nam                          |
| Quốc tịch               | Việt Nam                     |
| Quê quán                | Hoàn Kiếm, Hà Nội           |
| Nơi thường trú          | Chung cư CTI, Mộ Lao, Hà Đông, Hà Nội |
| Thời hạn sử dụng        | 01/01/2025                   |

### Hình 3.1. Căn cước công dân

Dữ liệu trong máy tính được phân loại cho phù hợp với các phép xử lý trong máy tính. Các dữ liệu này có thể tính toán và so sánh.



# Văn bản vào máy tính

Văn bản vào máy tính như thế nào không chỉ phụ thuộc vào ký tự hay tệp văn bản mà còn phụ thuộc vào các ký tự ấy được cách mã hóa được quy định trong bảng ký tự.

## 2. Bảng chữ cái tiếng Anh và bảng chữ cái tiếng Việt

### Cái tiếng Anh có những ký tự nào?

1. Mỗi nguyên âm có dấu thanh của tiếng Việt là một ký tự.
2. Tiếng Việt có trong bảng chữ cái tiếng Anh. Có bao nhiêu ký tự?

### Mã ASCII

Mã ASCII được dùng phổ biến nhất trong tin học là "bảng mã chuẩn" (American Standard Code for Information Interchange). Ban đầu bảng mã này dùng các mã 7 bit, với 128 (2^7) ký tự. Bảng mã 7 bit chỉ đủ dùng cho các ký tự cơ bản, do đó nhiều quốc gia có các ký tự riêng, như tiếng Hy Lạp, Nga có các ký tự khác. Do đó, người ta đã mở rộng bảng mã 7 bit thành bảng mã ASCII mở rộng, cho phép mã hóa thêm 128 ký tự mới.



# Tiêu chuẩn TCVN 6909.2001 về E

Việt Nam đã ban hành Tiêu chuẩn TCVN 6909.2001 về E lể sử dụng chung. Tiêu chuẩn này hoàn toàn phù hợp với tiêu chuẩn quốc tế.

Nó quy định mỗi kí tự đều được biểu diễn bằng 2 byte.

- Mã ASCII được bổ sung vào phía trước 8 bit giá trị.
- Cũng đã ban hành quy định bắt buộc sử dụng UTF-8 để mã hóa trong máy tính, trong đó:
- Sử dụng 1 byte để mã hoá các ký tự cơ bản.
- Sử dụng 2 byte để mã hoá các nguyên âm có dấu.
- Sử dụng 3 byte để mã hoá một số rất ít các ký tự đặc biệt.

UTF-8 (Universal Character Set Transformation Format) là một trong các hệ thống định dạng chuyển đổi với độ dài khác nhau (từ 1 tới 4 byte) dành cho Unicode.

Hiểu một cách ngắn gọn, các bảng mã ASCII và Unicode là các định dạng lưu trữ ở bộ nhớ ngoài. Việc số hoá văn bản được thực hiện thông qua các phần mềm soạn thảo văn bản như Word (của Microsoft Office). Gần đây, người ta đã có thể nhập văn bản bằng giọng nói, máy tính có thể nhận dạng âm thanh và tạo ra văn bản.



# BOGTVT
## CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
### MỘT ĐỨC WAP TUDO - HẠNH PHÚC

**GIẤY PHÉP LÁI XE (DRIVER'S LICENSE)**
**SSNo:** 1357924680

**Số sinh lý:** 01/01/2000
**VIỆT NAM**
**Nơi cư trú:** Chung cư CT1, Phường Mộ Lao, Quận Hà Đông, Hà Nội
**Hà Nội**
**Ngày cấp:** 26 tháng 02 năm 2020
**Hạng:** B2
**Có giá trị đến:** 26/02/2030
**Chữ ký:** ___________________

----

## Câu hỏi thảo luận

**Câu hỏi:** Tại sao cần xây dựng bảng mã đảm bảo bình đẳng cho mọi quốc gia trong ứng dụng tin học?

- Mã ASCII mã hóa mỗi ký tự bởi 1 byte.
- Giá thành thiết bị không cần phải sử dụng các bộ ký tự mã hóa bởi 1 byte.
- Một bảng mã chung cho mọi quốc gia, đáp ứng nhu cầu dùng nhiều ngôn ngữ đồng thời.

### Vấn đề quyết định

- Giải quyết số quốc gia, đáp ứng nhu cầu dùng nhiều ngôn ngữ đồng thời cho các quốc gia sử dụng chữ tượng hình.

**Ghi chú:**
Đối với bảng mã ASCII, Việt Nam đã xây dựng bảng mã VSCII (Vietnamese Standard Code for Information Interchange), còn gọi là TCVN 5712:1993.
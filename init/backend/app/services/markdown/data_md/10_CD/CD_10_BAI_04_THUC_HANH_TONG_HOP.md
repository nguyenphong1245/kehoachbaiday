# BÀI THỰC HÀNH TỔNG HỢP

Học xong bài này; em sẽ:
- Sử dụng được các lớp ảnh; kênh alpha và ôn luyện các kĩ thuật thiết kế.
- Làm quen với các lệnh tạo hiệu ứng.
- Tạo được các sản phẩm đồ hoạ đơn giản như logo; poster.

## Yêu cầu
Em hãy tạo tệp ảnh mới và thiết kế logo "Olympic Việt Nam" như Hình 1, trong đó các vòng tròn Olympic giống nhau. Lưu tệp ảnh với tên tệp là "Olympic VN.cxf" và xuất ảnh với tên tệp là "Olympic VN.png".

## Hướng dẫn thực hiện
![Hình 1. Logo Olympic Việt Nam](#)

### Bước 1. Mở tệp ảnh mới và xác định các tham số của ảnh
Tạo một tệp ảnh mới với các tham số được lựa chọn phù hợp:
- Kích thước: 300 x 250 mm
- Độ phân giải: 72 pixels/mm
- Không gian màu: RGB

### Bước 2. Thiết kế các vòng tròn Olympic
Các vòng tròn Olympic được tạo bằng kĩ thuật thiết kế trên lớp bản sao.

#### a) Tạo vòng tròn Olympic thứ nhất
- Thêm một lớp mới trong suốt, đặt tên lớp là "Xanh đậm" để chứa vòng tròn Olympic thứ nhất màu xanh da trời.
- Chọn lớp "Xanh đậm"; sử dụng kĩ thuật tạo đường viền để tạo trên lớp này một hình tròn màu xanh da trời như trong Hình 2.

![Hình 2. Tạo và tô màu cho vùng chọn](#)

Đặt sách tại hoc1O.vn



# Bài Học: Tạo Các Vòng Tròn Olympic

## b) Tạo các vòng tròn Olympic còn lại

Các vòng tròn Olympic còn lại (Vàng sẫm, Xanh lá, Đen, Đỏ) được tạo bằng kỹ thuật thiết kế trên lớp bản sao. Ví dụ, ta tạo vòng tròn Olympic thứ hai như sau: nhân đôi lớp Xanh dậm; đổi tên lớp thành Đen rồi di chuyển nó đến vị trí phù hợp, cuối cùng tô màu đen cho vòng tròn.

**Hình 3.** Ý cách thực hiện

Lưu ý: Khi di chuyển lớp, nó lệch ra khỏi vị trí của ảnh ban đầu. Thực hiện lệnh `Layer > Layer to Image Size` để khớp lớp ảnh mới với lớp ảnh ban đầu.

----

## Bước 3. Tạo các điểm lồng nhau của các vòng tròn Olympic

Các điểm lồng nhau của các vòng tròn Olympic được thiết kế dựa trên kỹ thuật lồng giữa. Ví dụ, tại một điểm giao, cẩn đưavòng tròn xanh đậm lên trên vòng tròn vàng sẫm. Thực hiện điểm này như sau:

1. Chọn lớp Xanh đậm rồi tạo một vùng chọn hình chữ nhật tại điểm giao của hai vòng tròn (Hình 4a).
2. Thực hiện liên tiếp hai lệnh `Edit > Copy` và `Edit > Paste` để sao chép một mảnh của đường tròn xanh đậm tại điểm giao. Một lớp động được tự động tạo ra chứa kết quả sao chép (Hình 4b).
3. Nhấp chuột vào nút lệnh để thêm vào một lớp mới thay thế lớp động. Đổi tên lớp mới thành Mảnh xanh đậm, kết quả được như Hình 4c.
4. Di chuyển lớp Mảnh xanh đậm lên trên lớp Vàng sẫm (Hình 4d) để che đường tròn màu vàng sẫm tại điểm giao. Kết quả được là vòng tròn đậm nằm đè lên trên vòng tròn vàng sẫm.

**Hình 4.** Đuraành của lớp này xếp lồng dưới ảnh lớp kia tại chỗ giao nhau.

----

Đọc sách tại học O.vn 169



# Bước 4. Tạo lá cờ của logo
- Dùng công cụ đường dẫn và vùng chọn để tạo lá cờ màu đỏ và ngôi sao màu vàng.
- Dùng kỹ thuật cắt xén để cắt phần dưới lá cờ, trong đó vùng chọn để cắt là vùng chọn hình elip.

# Bước 5. Lưu và xuất tệp ảnh
- Lưu tệp ảnh với tên tệp là `Olympic VN.cxf`.
- Xuất ảnh với tên tệp là `Olympic VN.jpg`.

----

# Bài 2: Thiết kế banner "Câu lạc bộ Tin học ứng dụng"

## Yêu cầu
- Hãy thiết kế banner "Câu lạc bộ Tin học ứng dụng" của lớp 1045 như Hình 5.
- Lưu tệp ảnh và xuất tệp sang định dạng chuẩn PNG; tên tệp là `Banner CLB ICT`.

![Hình 5. Banner câu lạc bộ Tin học ứng dụng](#)

## Hướng dẫn thực hiện

### Bước 1. Tạo tệp ảnh mới và thêm các lớp ảnh mới
- Tệp ảnh mới nên trống với một trong các kích thước hợp của banner; chẳng hạn là: 2500 x 1500 pixel, độ phân giải 200 ppi.
- Mỗi đối tượng nên được tạo trên một lớp riêng biệt và tất cả các lớp được thêm mới đều có nền trong suốt.

### Bước 2. Thiết kế khu vực nền banner: nền, khung và màu nền
- Thêm lớp mới để tạo nền banner: Nền banner được tạo vùng chọn hình chữ nhật và được tô màu gradient với các thuộc tính gradient: FG/BG Đen-Trắng, gradient Rounded edge, hòa màu Perceptual RGB, hình dạng Linear, đường cơ sở đi từ góc trái dưới lên góc phải trên, xem Hình 6.

![Hình 6. Xác định màu gradient cho nền banner](#)

----

**Đặt sách tại** hoc1O.vn



# Thiết kế Banner

## Thêm lớp mới bên trên lớp nền để tạo khung banner
Khung banner được thiết kế bằng kỹ thuật tạo đường viền.

## Thêm lớp mới bên trên lớp khung để tạo màu nền cho banner
Màu nền của banner được tạo bằng cách hòa màu xanh dương với dải gradient đen, xám của lớp nền bên dưới. Để hòa màu, trước hết tô màu thuần nhất (xanh dương) cho lớp Màu nền (Hình 7a, 76), sau đó đặt chế độ hòa màu (Mode) là Soft Light. Kết quả như hình 7c.

```
Layer  Path:  Channel
Mode    Soft Light
[Opacity
Layer
Màu nền
Dưới
Khung
Background
```

### Hình 7. Hòa màu cho lớp Màu nền

## Bước 3. Thiết kế họa tiết Tam giác
Thêm lớp Tam giác bên trên lớp Màu nền để tạo họa tiết tam giác màu đen. Họa tiết này bắt đầu được tạo bằng một vùng chọn hình vuông; được tô màu đen. Sau đó quay, di chuyển hình và dùng kỹ thuật cắt xen để nhận được kết quả mong muốn. Quá trình thiết kế này được gợi ý qua Hình 8.

### Hình 8. Tóm tắt quá trình thiết kế họa tiết "Tam giác"

Nhân đôi lớp Tam để nhận được lớp Tam giác copy. Chuyển kênh alpha của lớp Tam giác copy vào vùng chọn: Tô màu gradient cho vùng chọn với các thuộc tính gradient đã chọn trước đó (Hình 9a). Bỏ vùng chọn rồi di chuyển lớp Tam giác copy sang phải một chút để hở bên dưới, tạo thành một viên đen bên trái nó (Hình 9c).

Đọc sách tại học O.vn



# Tam Giác CcFy
## Tam Giác
### Mẫu Nền
#### Dựng Viên
##### Khung
###### Background

----

### Bước 4. Thiết kế hoạ tiết các hình tròn đồng tâm
Sử dụng kĩ thuật tạo đường viên để tạo các hình tròn tâm màu đen, tương ứng ở trên các lớp HTI, HT2, HT3 (Hình 10a, 10b). Sử dụng kĩ thuật cắt xén chi tiết thừa để nhận được kết quả như Hình 11c. Cuối cùng tô màu hai hình tròn trong cung và thu được kết quả như Hình 10d.

#### Hình 10. Tóm tắt trình thiết kế hoa tiết các hình tròn đồng tâm

----

### Bước 5. Tạo hoa tiết các đường cong cách điệu
Hai đường cong cách điệu ở trên và dưới được tạo trên các lớp mới các vùng chọn hình elip; sau đó sử dụng kĩ thuật cắt xén để nhận được kết quả mong muốn. Hình 11 gợi ý quá trình tạo vùng chọn; tô màu rồi thực hiện cắt xén.

----

Địa chỉ sách tài học: sach tai hoc1O.vn



# Hình 1l. Tạo vùng chọn; tô màu và cắt xén

## Bước 6. Tạo các lớp chứa chữ

Gợi ý: Cách tạo dãy kí tự ~L, Ớ, P, 1, 0, A, 5" trong các hình tròn đen như sau:
Mỗi hình tròn đen sẽ được tạo trên một lớp riêng biệt. Hình tròn thứ nhất được tạo bằng vùng chọn và tô màu: Các hình tròn còn lại được tạo bằng kỹ thuật thiết kế trên lớp bản sao. Hình 12 sau đây gợi ý quá trình thiết kế này.

### Câu lạc bộ Tin học ứng dụng

#### Hình 12. Sử dụng kỹ thuật thiết kế trên lớp bản sao để tạo dãy các hình tròn chứa chữ ~L, Ớ, P, 1, 0, A, 5" được tạo tương tự như cách tạo dãy hình tròn đen. Kết quả nhận được như Hình 13.

| Dãy chữ |
|----------|
| 00 0006  |
| Câu lạc bộ Tin học ứng dụng |

#### Hình 13. Tạo dãy các chữ

Em hãy thiết kế một sản phẩm đồ họa như poster hoặc logo theo nhu cầu, sở thích của em. Lưu sản phẩm và xuất ra một tệp ảnh với định dạng chuẩn: Sau đây là gợi ý tên và nội dung cho một số chủ đề (em có thể đề xuất chủ đề khác).

- **Ngày hội trường**: Thời gian bắt đầu; các hoạt động có thể là chương trình văn nghệ, hội trại, hội chợ, tham quan phòng truyền thống, tiết mục trình bày của một số câu lạc bộ.

- **Thông điệp SK**: Khẩu trang, Khử khuẩn; Không tụ tập; Khai báo y tế.

- **Câu lạc bộ Lập trình**: Các chủ đề có thể là thuật toán; lập trình trò chơi; lập trình ứng dụng.

- **Robotics**: Các sản phẩm có tên là robot làm Quảng 01, robot dọn rác.

Đọc sách tại học O.vn 173
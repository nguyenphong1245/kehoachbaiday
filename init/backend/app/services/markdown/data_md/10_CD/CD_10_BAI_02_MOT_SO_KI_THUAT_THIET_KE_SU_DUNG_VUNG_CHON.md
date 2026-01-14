# BÀI 2: MỘT SỐ KĨ THUẬT THIẾT KẾ SỬ DỤNG VÙNG CHỌN, ĐƯỜNG DẪN VÀ CÁC LỚP ẢNH

Học xong bài này, em sẽ:
- Thực hiện được các thao tác cơ bản đối với lớp, vùng chọn và đường dẫn.
- Biết và thực hiện được một số kĩ thuật thiết kế dựa trên lớp, vùng chọn và đường dẫn.

----

## Khám Phá Các Lớp Ảnh

1. Trong logo "Cờ cổ động" (Hình 1a), một bạn vô tình thay đổi thứ tự một lớp ảnh của logo làm lá cờ trên logo bị biến mất (Hình 1c). Thứ tự mới của các lớp ảnh như Hình 1b. Em hãy đoán xem bạn đó thay đổi thứ tự lớp ảnh nào. Thứ tự ban đầu của nó là gì?

![Hình 1 Logo "Cờ cổ động" và các lớp ảnh](link_to_image)

Khi thiết kế một đối tượng đồ họa mới, ví dụ như lá cờ, ngôi sao, cán cờ; chúng mặc định được tạo trên lớp đang chọn. Cùng với lớp, chúng tạo thành một đối tượng hợp nhất nên khó chỉnh sửa từng đối tượng. Do đó, mỗi đối tượng nên được tạo trên một lớp riêng. Ví dụ, nếu lá cờ và ngôi sao cùng được tạo trong một lớp ảnh thì chúng ta tạo thành một đối tượng duy nhất, không thuận lợi cho việc chỉnh sửa riêng lá cờ hay ngôi sao. GIMP cung cấp các lệnh làm việc với lớp như: thêm, xóa, nhân đôi lớp, ẩn hoặc hiện và thay đổi thứ tự các lớp (Hình 2).

----

Đọc sách tại học O.vn 153



# Thêm một lớp mới
- Di chuyển lớp đang chọn lên trên hoặc xuống dưới
- Xoá lớp được chọn
- Nhân đôi lớp được chọn

**Hình 2. Các lệnh làm việc với lớp**

## Một số kĩ thuật thiết kế làm việc với các lớp ảnh
### Thiết kế trên lớp bản sao
- Thực hiện trên trường hợp khác nhau.
- Ví dụ: ở **Hình 3a**, đường viền màu trắng trên dải nơ của hộp quà riêng, việc nhân đôi nó nhiều lần rồi di chuyển các lớp mới đến vị trí phù hợp sẽ nhận được kết quả như **Hình 3b**.
- Đôi khi, bản sao của đối tượng được chỉnh sửa lại để kết hợp với đối tượng ban đầu.
- Ví dụ: sau khi nhân đôi lớp văn bản màu đen (Hình 3c), lớp bản sao được tô lại thành màu xám rồi di chuyển xuống dưới sang phải và văn bản màu đen sẽ nhận được kết quả như **Hình 3d**.

**CÂU LẠC BỘ ICT**

**Hình 3. Kết quả của thiết kế trên lớp bản sao**

### b) Hướng tập trung vào một lớp
- Bên trái tên lớp có biểu tượng ẩn lớp linh con mắt. Nháy chuột vào đó sẽ tắt (hoặc bật) con mắt để ẩn (hoặc hiện) lớp.
- Ví dụ, sau khi nhân đôi lớp văn bản chữ màu đen; lớp bản sao sẽ trùng khít với lớp cũ, không thể phân biệt được lớp mới và lớp cũ.
- Do vậy, tạm ẩn lớp ban đầu phải trước khi tô màu xám cho lớp bản sao.

**Hình 4. Ẩn lớp Text**

**Địa chỉ sách tài học:** tai hoc1O.vn



# Sắp xếp lại các lớp

Việc thay đổi thứ tự các lớp sẽ tạo ra sự thay đổi của ảnh hợp thành của chúng ở cửa sổ ảnh. Chẳng hạn; sau khi nhân đôi một lớp; lớp bản sao mặc định được tạo ở bên trên lớp gốc. Sau khi tô màu xám cho lớp bản sao để thể hiện bóng (shadow) của văn bản (Hình 5a), kết quả không hợp lý vì đáng lẽ bóng phải chìm dưới văn bản. Do vậy, chuyển lớp bản sao xuống dưới lớp gốc thì kết quả nhận được sẽ hợp lý hơn (Hình 5b).

## CÂU LẠC BỘ ICT

| exl#|       | Texl       |
|-------------|------------|---|
| Text        | Text #1    | |
| Background  | Background  | |

Hai lớp trên cùng có thứ tự không hợp lý.
Hai lớp trên cùng có thứ tự hợp lý.

**Hình 5. Thay đổi thứ tự của các lớp**

## Sử dụng vùng chọn

### Vùng chọn và các công cụ tạo vùng chọn

Vùng chọn giúp xử lý riêng biệt một vùng nào đó trên ảnh; ví dụ như: tô màu, vẽ.

- **Rectangle Select**
- **Ellipse Select**

Để tạo một vùng chọn; nháy chuột vào công cụ tạo vùng chọn; chọn các thuộc tính của công cụ rồi kéo thả chuột để xác định vùng chọn trên ảnh. Nếu giữ kèm phím Shift trong thao tác kéo thả chuột thì vùng chọn sẽ là hình vuông hoặc hình tròn. Nếu giữ kèm thêm phím Ctrl thì điểm đầu tiên nhấn chuột trong thao tác kéo thả chuột sẽ là tâm của vùng chọn.

### Một số thao tác cơ bản với vùng chọn

- Đảo ngược vùng chọn bằng lệnh `Select > Invert`. Khi đó một vùng chọn mới thay thế vùng chọn cũ, chứa tất cả các đối tượng ngoại trừ đối tượng thuộc vùng chọn cũ.
- Co hoặc giãn vùng chọn bằng lệnh `Shrink` hoặc `Grow` trong bảng chọn `Edit`. Đơn vị co hoặc giãn là số pixel được xác định trong hộp thoại xuất hiện sau đó.

Đọc sách tại học O.vn 155



# Xoá vùng chọn

Bằng cách nhấn **Delete**, ảnh trong vùng chọn bị xóa hẳn. Vùng chọn vẫn đang hoạt động:

- Bỏ vùng chọn bằng lệnh **Select None**. Khi đó không có bất kỳ vùng ảnh nào được chọn.

**Chú ý:** Vùng chọn không thuộc bất kỳ lớp ảnh nào. Các thao tác với vùng chọn tác động vào lớp ảnh đang được chọn nhưng trong phạm vi được xác định bởi vùng chọn.

## Một số kĩ thuật thiết kế sử dụng vùng chọn

### Tạo đường viền

Với kĩ thuật tạo đường viền, dấu chữ thập trong Hình 6a có thể được bao quanh bởi một đường tròn như Hình 6d. Thực hiện các bước sau đây để tạo một đường viền:

1. Thêm một lớp mới; chọn lớp này và xác định một vùng chọn hình tròn (Hình 6b).
2. Trên lớp vừa tạo; tô màu cho vùng chọn (Hình 6c).
3. Cắt vùng chọn với số pixel bằng độ dày của đường viền cần tạo.
4. Xóa vùng chọn sau khi cắt rồi bỏ vùng chọn (kết quả được như Hình 6d).

![Hình 6. Tạo đường viền](#)

### Lồng hình

Tại một số điểm giao cắt giữa hai đối tượng lồng nhau, đối tượng này phải ở trên (hoặc ở dưới) đối tượng kia. Ví dụ; Hình 7a cho thấy lớp Vòng 2 nằm bên trên lớp Vòng 1 nên ảnh hợp thành của chúng (Hình 7b) không thể hiện sự lồng nhau như Hình 7c.

| Vòng 2 | Vòng 1 | Nền |
|--------|--------|-----|
|        |        |     |

![Hình 7. Trước và sau khi lồng hình](#)

Đal56 sách tai hoc1O.vn



# Lớp Hình Tại Một Điểm Giao Cắt Giữa Hai Hình

Sau đây là cách thực hiện thao tác:

## Bước 1
Chọn lớp cần đưa hình ảnh của nó lên trên hình ảnh của lớp kia tại điểm giao cắt. Ví dụ: chọn lớp Vòng 1.

## Bước 2
Tạo một vùng chọn tại điểm giao cắt sao cho nó bao quanh hình ảnh đối tượng cần đưa lên trên đối tượng kia; ví dụ như ở Hình 8a.

| Vòng                     | Mảnh Vòng 1                |
|--------------------------|----------------------------|
| Floating Selection        | Vòng 2                     |
| {Pasted Layer}           | Vòng                       |
| Nên                      | Nển                        |

**Hình 8**: Tạo mảnh che hình

## Bước 3
Nhấn liên tiếp hai tổ hợp phím `Ctrl+C` và `Ctrl+V` để thực hiện sao chép hình ảnh động của lớp đang chọn tại vùng chọn: Một lớp (Floating Section) xuất hiện như Hình 86. Nháy đúp chuột vào lớp này và đổi tên lớp để tạo một lớp mới thay thế lớp động. Di chuyển lớp mới lên trên lớp đối tượng cần đưa nó xuống dưới (Hình 8c).

Ví dụ: sau khi đưa lớp Mảnh Vòng 1 lên ta được kết quả mong đợi như Hình 7c.

----

## Sử Dụng Đường Dẫn (Paths)

### Đường Dẫn và Cách Tạo Đường Dẫn
Để vẽ hình có hình dạng tùy ý cần sử dụng đường dẫn (Paths). Đường dẫn được tạo trong GIMP như sau:

### Bước 1
Nháy chuột vào công cụ Paths.

### Bước 2
Lần lượt nháy chuột tại các điểm (gọi là các điểm mốc), theo thứ tự đó chúng ta tạo thành đường dẫn cần vẽ. Nếu kéo thả điểm mốc cuối cùng trùng với điểm mốc đầu tiên thì sẽ nhận được đường dẫn khép kín (xem Hình 9a).

### Bước 3
Khi một đường dẫn được tạo ra, biểu tượng của nó sẽ xuất hiện trong bảng quản lý đường dẫn Paths (Hình 9). Nháy đúp chuột vào tên đường dẫn để gõ tên mới cho nó (Hình 9c).

| Layers                   | Channels                  | Paths                     |
|--------------------------|---------------------------|---------------------------|
| Lock                     | Unnamed                   | La co Path                |

**Hình 9**: Đường dẫn và bảng quản lý đường dẫn

Đọc sách tại học O.vn 157



# b) Thiết kế và chỉnh sửa đường dẫn

Bảng `tuỳ chọn cuacông cụ Paths` cho phép chuyển đổi chế độ thiết kế (Design) giữa và chế độ chỉnh sửa (Edit) đường dẫn: Chế độ thiết kế hỗ trợ các thao tác được mô tả trong Hình 10a, 10b, 10c. Chế độ chỉnh sửa hỗ trợ các thao tác trong Hình 10b, 10d.

- **Uốn cong đoạn nối**:
- Kéo thả một điểm nào đó trên đoạn nối giữa hai điểm mốc để làm cong đoạn nối (xuất hiện hai tiếp tuyến với đường cong tại hai đầu mút của nó) (Hình 10a).

- **Điều chỉnh tiếp tuyến của đường cong**:
- Kéo thả chuột tại điểm đầu tiếp tuyến của đường cong sẽ thay đổi hướng và độ dài của chúng; làm thay đổi hình dạng đường cong (Hình 10b).

- **Di chuyển điểm mốc**:
- Kéo thả chuột từ điểm mốc đến vị trí khác để thay đổi hình dạng của các đường nối với điểm này (Hình 10c).

- **Thêm điểm mốc**:
- Nháy chuột vào một vị trí trên đường cong để thêm điểm mốc, xuất hiện hai tiếp tuyến tại đó. Các tiếp tuyến dùng để điều chỉnh hình dạng của đường cong (Hình 10d).

## Hình 10. Thiết kế và chỉnh sửa đường dẫn

Muốn hiển thị một đường dẫn đã tạo trước đó để chỉnh sửa lại, trong bảng quản lý đường dẫn, nháy chuột phải vào biểu tượng đường dẫn và chọn lệnh Edit Path.

### c) Các thao tác cơ bản đối với đường dẫn

Hãy tìm hiểu về các thao tác cơ bản đối với đường dẫn. Từ đó cho biết: Trong các hình bên; em vẽ được những hình nào? Hãy trình bày cách vẽ chúng:

Đa158 sách tai hoc1O.vn



# Chương 1: Kỹ Thuật Thiết Kế Đồ Họa

## Đổi Giữa Đường Dẫn và Vùng Chọn

Để chuyển một vùng chọn thành một đường dẫn, thực hiện lệnh `Selection From Path` (hoặc nháy chuột vào nút lệnh trong bảng tùy chọn). Để chuyển một đường dẫn thành một vùng chọn, thực hiện lệnh `Select To Path`.

### Tạo Nét Vẽ Theo Đường Dẫn

- Nháy chuột vào nút lệnh `Stroke Path` ở bảng tùy chọn và nhập số pixel biểu thị độ dày của nét vẽ. Màu của nét vẽ là màu FG.
- Tô màu vùng đường dẫn bằng cách nháy chuột vào nút lệnh `Fill Path` trong bảng tùy chọn. Màu được tô mặc định là màu FG.

## Kỹ Thuật Thiết Kế "Cắt Xén Chi Tiết Thừa"

Cắt xén chi tiết thừa là kỹ thuật thiết kế sử dụng kết hợp đường dẫn và vùng chọn. Mỗi bước thực hiện theo ba bước:

1. **Xác định vùng chọn** để khoanh vùng chỗ cần cắt xén.
2. **Chọn lớp chứa hình ảnh** và xóa vùng chọn.
3. **Bỏ vùng chọn**.

### Ví Dụ

Với hình ảnh như Hình 11a, cẩn cắt xén hình này để nó giống như đầu phần của một dải nơ. Vùng cần cắt được xác định bởi một đường dẫn (Hình 11b). Sau đó, đường dẫn này được chuyển thành vùng chọn để xóa vùng chọn. Sau khi bỏ vùng chọn, nhận được kết quả như Hình 11c.

![Hình 11. Quá trình cắt xén](#)

## Thực Hành

### Bài 1: Thiết Kế Các Hình Tròn Đồng Tâm

Em hãy thiết kế ba hình tròn đồng tâm như Hình 12.

#### Hướng Dẫn Thực Hiện

- Dùng kỹ thuật tạo đường viền để tạo các hình tròn theo thứ tự từ ngoài vào trong. Mỗi hình tròn được tạo trên một lớp riêng. Quá trình thiết kế được gợi ý ở Hình 13.

![Hình 12. Ba hình tròn đồng tâm](#)

----

Đọc sách tại học O.vn 159



# Hình 13. Quá trình thiết kế ba hình tròn đồng tâm

## Bài 2: Thiết kế hình tròn và hình vuông lồng nhau

Em hãy thiết kế hình tròn và hình vuông lồng nhau như Hình 14.

### Hướng dẫn thực hiện

![Hình 14: Lồng hình](Hình_14.png)

Trước hết sử dụng kỹ thuật tạo đường viền để tạo hình tròn và hình vuông (đồng tâm). Giả sử lớp hình vuông ở trên lớp hình tròn (Hình 15a). Quay hình vuông để được kết quả như Hình 15b.

Sử dụng kỹ thuật lồng hình để đưa hình vuông xuống dưới hình tròn tại 4 điểm giao cắt. Hình 16 trình thực hiện lồng hình tại điểm giao cắt thứ nhất. Các điểm giao cắt còn lại thực hiện tương tự.

![Hình 15: Tạo hình tròn và hình vuông](Hình_15.png)

### Hình vuông
### Hình tròn
### Background

![Hình 16: Thực hiện lồng hình](Hình_16.png)

Đặt sách tại hoc1O.vn



# Hình vufrg
## Flooring Selection
### (Posreo Layer)
#### Hirh tcr
#### Background

- Manh
- Hinh vuorg
- Hinh vèn
- Background

### Hình 16. Xỉ lí điểm giao cắt thứ nhẩt

Em hãy thiết kế logo "701045 ICT GROUP" như Hình 17.

#### Gợi ý thực hiện
Trước hết thực hiện theo hướng dẫn của Bài 2 để tạo khung logo gồm hình vuông lồng nhau: Tô màu gradient cho nền logo và chèn các văn bản và hình tròn vào trong khung logo theo yêu cầu để nhận được kết quả Hình 18.

```
10a5            10a5
IcT GRouP    ict GRouP
```

### Hình 17. Logo với dải nơ bên trái
### Hình 18. Logo

Dải nơ bên trái logo được thiết kế bắt đầu từ việc tạo một vùng chọn hình elip trên một lớp mới và tô màu nó Hình 19a. Từ hình elip này, tiến hành cắt xén thành dải nơ theo kĩ thuật cắt xén.

Các vùng chọn được xác định trong quá trình cắt xén hình elip được gợi ý như trong Hình 19. Trong đó Hình 19c và Hình 19d minh hoạ các đường dẫn khoanh chuyển nó thành vùng chi tiết thừa trước khi vùng chọn để xoá.

Đọc sách tại học O.vn 161



# ICT GROUP

## Hình 19. Các vùng chọn được xác định trong các lần cắt xén

### Em đồng ý với những phát biểu nào sau đây?

Trong phần mềm thiết kế đồ họa; ví dụ như phần mềm GIMP:

1. Để đơn giản, nên thiết kế các đối tượng đồ họa trên cùng một lớp ảnh.
2. Một số chi tiết của một lớp ảnh có thể không nhìn thấy trong ảnh hợp thành.
3. Không cần có lệnh chuyển đổi giữa đường dẫn và vùng chọn.
4. Các kỹ thuật thiết kế với sự hỗ trợ của các lệnh làm việc với lớp ảnh có thể giúp giảm thời gian thiết kế hoặc thay đổi sự hiển thị của ảnh hợp thành.

## Tóm tắt bài học

Trong các phần mềm thiết kế đồ họa; ví dụ như GIMP:

### Khái niệm:
- Cửa sổ ảnh hiển thị ảnh hợp thành của các lớp ảnh.
- Vùng chọn dùng để xử lý một vùng nào đó trên ảnh.
- Đường dẫn dùng để vẽ hình và có thể chuyển đổi với vùng chọn.

### Các kỹ thuật thiết kế cơ bản:
- Sử dụng các lệnh làm việc với lớp ảnh: thiết kế trên lớp bản sao; hướng tập trung vào một lớp; sắp xếp lại các lớp; lồng.
- Sử dụng vùng chọn: tạo đường viền hình.
- Sử dụng kết hợp đường dẫn và vùng chọn để cắt xén chi tiết thừa.
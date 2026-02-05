mục 1mục 2` |
| Danh sách không có thứ tự | ``      | `- mục 1
- mục 2
` |
| Danh sách mô tả        | ``      | `Thuật ngữĐịnh nghĩa` |

----

### Ghi chú về hình ảnh
- **Hình 9.1**: Hình ảnh minh họa cho danh sách có thứ tự, thể hiện cách mà các mục được đánh số theo thứ tự.
- **Hình 9.2**: Hình ảnh minh họa cho danh sách không có thứ tự, cho thấy cách mà các mục được trình bày với ký tự đầu dòng là hình vuông.

----

### Kết luận
Việc sử dụng danh sách và bảng trong HTML không chỉ giúp tổ chức thông tin một cách rõ ràng mà còn làm cho trang web trở nên dễ đọc và dễ hiểu hơn. Hãy thực hành tạo danh sách và bảng để nắm vững cách sử dụng các thẻ HTML này trong việc trình bày nội dung trên trang web của mình.



Tên mục
Mô tả của mục 1 (định nghĩa của thuật ngữ hoặc mô tả cho nhãn tương ứng)
Tên mục
Mô tả của mục

```

### Ví dụ minh họa
```html

**Kem**
Món ăn ngọt, dạng đông lạnh.
**Trà sữa**
Là đồ uống làm từ hai nguyên liệu trà và sữa.



```
**Kết quả:**
Bảng có tiêu đề là 'Hoá đơn'.

### Tạo khung bảng
Trong HTML, độ dày khung được thiết lập cho viền khung bảng hoặc khung của từng ô bằng thuộc tính `border` của thuộc tính `style`.

**Cú pháp:**
```
độ_dày_theo_px kiểu_viền [màu_viền]
```
Trong đó, ba thuộc tính cách nhau bởi dấu cách; hai thuộc tính đầu là bắt buộc; thuộc tính kiểu_viền có thể nhận một trong bốn giá trị (solid, dotted, double, none), còn thuộc tính màu_viền mặc định là màu đen và có thể bỏ qua.

### Điều chỉnh kích thước
Sử dụng đặc tính con `width` và `height` của thuộc tính `style`. Kích thước được đặt có thể là theo tỉ lệ với khối bao ngoài đối tượng (%) hoặc theo số điểm ảnh (px).

**Lưu ý:** Không nên sử dụng kích thước theo px do các thiết bị hiển thị có sự khác nhau về kích thước và số điểm ảnh có thể dẫn đến bảng không hiển thị đúng như mong đợi.

**Ví dụ:**
```html
|   |
| - |
|   |

```
**Kết quả:**
- Bảng có chiều rộng bằng 80% phần hiển thị chữ, cao 400px.
- Hàng này có chiều cao bằng 15% độ cao bảng.
- Ô cột này có độ rộng bằng 10% độ rộng bảng.

### Gộp ô
Sử dụng thuộc tính `rowspan` (cho hàng) và `colspan` (cho cột). Bản chất của việc gộp ô là mở rộng một ô bằng cách thêm một số hàng hoặc một số cột lân cận có cùng nội dung. Việc này giúp tạo ra được bảng có cấu trúc phức tạp nhưng cũng làm cho việc đánh dấu, theo dõi và kiểm soát số lượng ô trở lên khó khăn hơn.

## Ví dụ minh họa
**Hình 9.4** mô tả đoạn mã HTML tạo một bảng bằng các thẻ trên (theo thứ tự từ trên xuống dưới, từ trái sang phải) và bảng kết quả thu được.

```html
|   | | | |
| - |---|---|---|
| Món ăn    | Đơn giá | SL | Thành tiền |
| --------- | ------- | -- | ---------- |
| Thịt xiên | 10K     | 3  | 30         |
| Cá viên   | 5K      | 6  | 30         |

```

**Kết quả:**
```
Món ăn      Đơn giá   SL   Thành tiền
Thịt xiên   10K      3    30
Cá viên     5K       6    30



# Danh sách Câu lạc bộ

```

- **Bước 3**: Tạo danh sách không có thứ tự:
```html
- Câu lạc bộ Thể thao
- Câu lạc bộ Âm nhạc
- Câu lạc bộ Nghệ thuật
- Câu lạc bộ Nhiếp ảnh

```

- **Bước 4**: Tạo mục THỂ THAO, với phần mã được thêm vào giữa cặp thẻ ở dòng 2 là định nghĩa của một danh sách có thứ tự:
```html
THỂ THAO
1. Bóng đá
2. Bơi
3. Bóng chuyền
4. Bóng rổ
5. Karate
6. Vovinam



| Bộ môn      | GV phụ trách | Ngày |   |   |   |
| ----------- | ------------ | ---- | - | - | - |
| Thứ 2       | Thứ 6        |      |   |   |   |
| Bóng đá     | Thầy Khải    |      |   | 3 | 5 |
| Bóng chuyền | Thầy Vũ      |      |   | 3 | 5 |
| Võ thuật    | Thầy Hoàng   |      |   | 3 | 5 |
| Taekwondo   | Thầy Đường   |      |   | 3 | 5 |
| Vovinam     | Thầy Bích    |      |   | 3 | 5 |

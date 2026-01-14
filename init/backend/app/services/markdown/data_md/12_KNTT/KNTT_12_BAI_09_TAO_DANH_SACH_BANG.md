<thẻ bắt="" đầu="">
mục thứ 1
mục thứ n
<thẻ kết="" thúc="">
```

Để tạo danh sách có thứ tự, dùng cặp thẻ ``. Để chọn kiểu đánh thứ tự và giá trị bắt đầu, dùng thuộc tính `type` và `start` (Hình 9.1):

- `type`: xác định kiểu đánh số. Các kiểu đánh số là: "1", "A", "a", "I" và "i".
- `start`: xác định giá trị bắt đầu đánh số, nhận giá trị là các số thực.

```html

Nếu **delta** &#x3C; 0:
Nếu **delta** = 0:
Nếu **delta** > 0:

```

**Kết quả**: Hình 9.1. Danh sách có thứ tự

#### b) Danh sách không có thứ tự
Để tạo danh sách không có thứ tự, dùng cặp thẻ ``. Để chọn ký tự đầu dòng, ta thiết lập giá trị của đặc tính `list-style-type` trong thuộc tính `style` bằng một trong 4 giá trị: `disc`, `circle`, `square` và `none`. Hình 9.2 mô tả ví dụ một danh sách dùng hình vuông làm ký tự đầu dòng và kết quả.

```html

Nếu **delta** &#x3C; 0:
Nếu **delta** = 0:
Nếu **delta** > 0:



(chẳng hạn như một thuật ngữ hoặc một nhãn)
Tên mục
Mô tả của mục 1 (định nghĩa của thuật ngữ hoặc mô tả cho nhãn tương ứng)
Tên mục
Mô tả của mục

```

### Ví dụ:
```html

**Kem**
Món ăn ngọt, dạng đông lạnh.
**Trà sữa**
Là đồ uống làm từ hai nguyên liệu trà và sữa.

```

Hình 9.3. Danh sách mô tả

**Lưu ý:** Ta có thể tạo ra các danh sách lồng nhau bằng cách để một danh sách là một mục của một danh sách khác (bằng cách đặt danh sách đó bên trong cụm thẻ `` của mục tương ứng).

Trong HTML; ta có thể định nghĩa các kiểu danh sách có thứ tự, không có thứ tự và danh sách mô tả bằng các thẻ ``, `` và ``.

### Làm thế nào để tạo một danh sách lồng nhau; danh sách mức đánh số dạng 1, 2, 3, và danh sách mức 2 đánh số dạng a, b, c?

## 2 THIẾT LẬP BẢNG

### Hoạt động 2: Lựa chọn định dạng phù hợp nhất

Trong Hội chợ ẩm thực ở trường; lớp 12E dự định bán một số món; các bạn muốn đăng trên trang web của lớp các thông tin: món ăn; đơn giá, số lượng và tổng số tiền: Theo em các bạn nên dùng dạng biểu diễn nào: danh sách; danh sách mô tả hay bảng: Tại sao?

Phần tử bảng được dùng khi ta cần thêm dữ liệu có thể sắp xếp dưới dạng hàng và cột vào trang web. Dữ liệu trong bảng có thể là bất kỳ loại thông tin nào; không nhất thiết là dạng số. Bảng là công cụ để tạo ra các bố cục nhiều cột hoặc phân bố nội dung và các khoảng trắng: Chính vì vậy; độ phức tạp của bảng từng là thước đo giá trị thiết kế trang web. Tuy nhiên; sử dụng bảng tạo bố cục tương đối phức tạp nên người ta thường sử dụng CSS để tạo bố cục; nội dung này được trình bày ở các bài sau.

Bảng được tạo từ các hàng. Mỗi hàng gồm các ô dữ liệu: Hàng đầu tiên có thể là hàng tiêu đề. Ngôn ngữ HTML xây dựng bảng từ các thành phần tương ứng như trên:

Các thành phần lần lượt được định nghĩa bởi các thẻ ``_tạo bảng; ``_tạo hàng, ``_tạo các ô dữ liệu và ``_tạo ô tiêu đề.



| Món ăn    | Đơn giá | SL | Thành tiền |
| --------- | ------- | -- | ---------- |
| Thịt xiên | 10K     | 3  | 30         |
| Cá viên   | 5K      | 6  | 30         |

```

Kết quả:

| Món ăn      | Đơn giá | SL | Thành tiền |
|-------------|---------|----|-------------|
| Thịt xiên  | 10K     | 3  | 30          |
| Cá viên     | 5K      | 6  | 30          |

Hình 9.4. Cấu trúc HTML của bảng

Bảng trong Hình 9.4 có thể được định dạng thêm để đẹp và dễ đọc hơn bằng cách chỉnh các thuộc tính của bảng. Các định dạng cơ bản bao gồm: thêm tiêu đề cho bảng; tạo khung bảng; điều chỉnh kích thước hàng, cột và gộp ô.

## Thêm tiêu đề

Sử dụng thẻ ``, ngay sau thẻ `` và trước thẻ `` đầu tiên.

**Ví dụ:**

```html

```

Kết quả: Bảng có tiêu đề là 'Hoá đơn'.

## Tạo khung bảng

Trong HTML, độ dày khung được thiết lập cho viền khung bảng hoặc khung của từng ô bằng thuộc tính `border` của thuộc tính `style` có giá trị là một bộ ba thuộc tính nhỏ hơn sau:

```
độ_dày_theo_px kiểu_viền [màu_viền]
```

Trong đó, ba thuộc tính cách nhau bởi dấu cách; hai thuộc tính đầu là bắt buộc; thuộc tính kiểu_viền có thể nhận một trong bốn giá trị (solid, dotted, double, none), còn thuộc tính màu_viền mặc định là màu đen và có thể bỏ qua.

## Điều chỉnh kích thước

Sử dụng thuộc tính `width` và `height` của thuộc tính `style`. Kích thước được đặt có thể là theo tỉ lệ với khối bao ngoài đối tượng (%) hoặc theo số điểm ảnh (px).

**Lưu ý:** Không nên sử dụng kích thước theo px do các thiết bị hiển thị có sự khác nhau về kích thước và số điểm ảnh có thể dẫn đến bảng không hiển thị đúng như mong đợi.

**Ví dụ:**

```html



```

| Họ và tên | Điểm thi | Toán | Vật lý | Hóa học |
|-----------|----------|------|--------|---------|
|           |          |      |        |         |

**Hình 9.6.** Ví dụ gộp hàng và cột của bảng

Phần tử bảng dùng để biểu diễn dữ liệu có cấu trúc dạng bảng. Phần tử bảng được tạo bởi các thẻ chính là `| Họ và tên |   |   | Điểm thi |        |         |
| --------- | - | - | -------- | ------ | ------- |
|           |   |   | Toán     | Vật lý | Hóa học |
`, ``, `` và ``; trình bày bảng bằng thuộc tính style.

**Bảng trong ví dụ trên Hình 9.6 có nhược điểm gì? Cần làm thế nào để giải quyết nhược điểm đó?**

## 3. THỰC HÀNH TẠO DANH SÁCH VÀ BẢNG

### Danh sách Câu lạc bộ

**Nhiệm vụ 1:** Tạo danh sách

**Yêu cầu:** Viết đoạn mã html để tạo danh sách các câu lạc bộ của trường như Hình 9.7

**Hướng dẫn:**

- **Bước 1.** Xác định thành phần của văn bản: Văn bản gồm hai phần tử: một phần tử tiêu đề và một phần tử danh sách.
- **Bước 2.** Tạo tiêu đề bằng cặp thẻ `# `.

```html

# Danh sách Câu lạc bộ

```

- **Bước 3.** Tạo danh sách không có thứ tự:

```html
-
-

```

- **Bước 4.** Tạo mục THỂ THAO, với phần mã được thêm vào giữa cặp thẻ ở dòng 2 là định nghĩa của một danh sách có thứ tự:

```html
THỂ THAO
1. Bóng đá
2. Bơi



```

**Bước 3:** Tạo hai hàng đầu như phân tích phía trên.
```html
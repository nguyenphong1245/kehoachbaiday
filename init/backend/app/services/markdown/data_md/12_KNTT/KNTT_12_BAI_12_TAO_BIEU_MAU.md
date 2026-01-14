biểu mẫu
các phần tử của

```

Các phần tử của biểu mẫu thường dùng là: `input`, `label`, `select`, `textarea`; ngoài ra còn có các phần tử khác như `fieldset`, `legend`, `datalist`.

Phần tử `label` định nghĩa nhãn; có cấu trúc như sau:
```html
Tên nhãn
```
Về mặt hiển thị của nhãn không có gì đặc biệt; tuy nhiên khi nháy chuột vào Tên nhãn; con trỏ chuột sẽ được đưa vào vùng của phần tử `input` được xác định bởi thuộc tính `for` tương ứng.

Phần tử `input` xác định vùng nhập dữ liệu: `input` xác định bởi thẻ đơn; không cần thẻ kết thúc. Phần tử `input` có cấu trúc như sau:
```html



giá_trị lựa_chọn

```



Lớp: Lớp: 10

10
11
12

```
Hình 121. Ví dụ về danh sách chọn

Phần tử `textarea` xác định một vùng nhập văn bản có nhiều dòng và cột. Cấu trúc của phần tử `textarea` như sau:
```html
Nội_dung
```
Lưu ý: Phần Nội_dung được hiển thị trong vùng nhập; nếu không để Nội_dung trong thẻ, vùng nhập văn bản là vùng trắng.

Phần tử `fieldset` được dùng để nhóm các phần tử có liên quan trong biểu mẫu bằng cách vẽ một hình chữ nhật bao quanh các phần tử đặt trong cặp thẻ ` `. Ta có thể thêm tên cho nhóm phần tử bằng cách đặt phần tử `legend` trong phần tử `fieldset` tương ứng.

Người dùng web cung cấp thông tin cho trang web thông qua biểu mẫu: Biểu mẫu được định nghĩa bởi thẻ chứa nhiều loại phần tử tùy theo yêu cầu về thông tin cần thu thập; trong đó loại phần tử quan trọng nhất là `input`.

## 1. Điểm khác biệt gì?
Giữa `radio`, `checkbox` và `select` là

## 2. Hãy viết câu lệnh để thêm một nút có tên "Quên mật khẩu" vào biểu mẫu.

## 2. THỰC HÀNH TẠO BIỂU MẪU
### Nhiệm vụ 1: Tạo biểu mẫu
**Yêu cầu:** Tạo biểu mẫu để nhập thông tin các món ăn (Hình 12.2).

**Hướng dẫn:**
- **Bước 1:** Tạo tiêu đề cho biểu mẫu bằng thẻ heading:
```html
# Thông tin món ăn

```
- **Bước 2:** Tạo một cặp thẻ ``. Hình 12.2. Ví dụ biểu mẫu
- **Bước 3:** Trong cặp thẻ ``, lần lượt tạo ba cặp `label` và `input`.

Mỗi thẻ ``, ngoài việc sử dụng thuộc tính `type` để xác định kiểu dữ liệu cần nhập; cần thiết lập mã định danh bằng thuộc tính `id` để liên kết với thẻ `` tương ứng. Ví dụ:
```html
Tên món ăn



# Nhiệm vụ 2: Tạo biểu mẫu

## Yêu cầu:
Tạo biểu mẫu để nhập thông tin đăng kí môn thi tốt nghiệp (Hình 12.3).

## Hướng dẫn:
### Bước 1. Xác định thông tin cần cung cấp:
- Họ và tên: `type="text"`
- Số căn cước công dân: `type="number"`
- Ngày sinh: `type="date"`
- Giới tính: Chọn một trong hai giá trị `type="radio"` (hoặc phần tử `select`)
- Các môn Toán; Văn; Ngoại ngữ: Giá trị có hoặc không: `type="checkbox"`
- Tổ hợp môn Khoa học tự nhiên hoặc Khoa học xã hội: Chọn một trong hai giá trị `type="radio"` (hoặc phần tử `select`)
- Nút gửi thông tin: `type="submit"` value="Gửi thông tin"

### Bước 2:
Lần lượt thêm các phần tử đã phân tích ở trên theo cấu trúc đã học.

### Bước 3:
Ngoài ra, để biểu mẫu dễ nhìn, ta bổ sung thêm tiêu đề bằng thẻ `# ` và nhóm các thông tin bằng thẻ `` bằng cách đặt tất cả các câu lệnh để hiển thị các phần tử nằm trong khung giữa cặp thẻ `` ... ``.

Kết quả thu được là biểu mẫu như Hình 12.3.

```
Đăng kí môn thi tốt nghiệp
Họ và tên:
CCCD:
Ngày sinh: [mm / dd / yyyy]
Giới tính: [ ] Nam [ ] Nữ
Môn thi: [ ] Ngoại ngữ
[ ] Toán [ ] Văn
Tổ hợp Khoa học tự nhiên

[ Gửi thông tin ]
```

**Hình 12.3. Biểu mẫu đăng kí môn thi tốt nghiệp**

## LUYÊN TÂP
Lần lượt tạo các loại phần tử form và các phần tử input với những loại dữ liệu khác nhau và liệt kê ra ba ví dụ có thể sử dụng của từng loại.

## VẬN DỤNG
1. Tạo một biểu mẫu đăng kí thành viên câu lạc bộ.
2. Sửa lại mã nguồn của trang web đã viết trong Nhiệm vụ 2, Bài 11 để thêm một liên kết cho cụm từ "Đăng kí". Khi nháy chuột vào liên kết, trang web đã viết ở Câu sẽ được hiển thị trong iframe.
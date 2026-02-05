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

```

### Ví dụ minh họa
```html

Tên đăng nhập:

Mật khẩu:



giá_trị lựa_chọn

```

## Ví dụ minh họa
```html

Tên người dùng:

Mật khẩu:

Giới tính:

Nam

Nữ

Sở thích:

Toán



Lớp:

10
11
12

```
Hình 121. Ví dụ về danh sách chọn

Phần tử textarea xác định một vùng nhập văn bản có nhiều dòng và cột. Cấu trúc của phần tử textarea như sau:
```html
Nội_dung
```
Lưu ý: Phần Nội_dung được hiển thị trong vùng nhập; nếu không để Nội_dung trong thẻ, vùng nhập văn bản là vùng trắng.

# Bài tập và câu hỏi
1. Điểm khác biệt giữa radio, checkbox và select là gì?
2. Hãy viết câu lệnh để thêm một nút có tên "Quên mật khẩu" vào biểu mẫu.

## THỰC HÀNH TẠO BIỂU MẪU
### Nhiệm vụ 1: Tạo biểu mẫu
Yêu cầu: Tạo biểu mẫu để nhập thông tin các món ăn (Hình 12.2).

Hướng dẫn:
- **Bước 1**: Tạo tiêu đề cho biểu mẫu bằng thẻ `# `.
```html

# Thông tin món ăn

```
- **Bước 2**: Tạo một cặp thẻ ``.
```html

```
- **Bước 3**: Trong cặp thẻ ``, lần lượt tạo ba cặp label và input. Mỗi thẻ ``, ngoài việc sử dụng thuộc tính type để xác định kiểu dữ liệu cần nhập, cần thiết lập mã định danh bằng thuộc tính id để liên kết với thẻ `` tương ứng. Ví dụ:
```html
Tên món ăn



`.
Kết quả thu được là biểu mẫu như Hình 12.3.

```
Đăng kí môn thi tốt nghiệp
- Họ và tên: [__________]
- CCCD: [__________]
- Ngày sinh: [mm / dd / yyyy]
- Giới tính:
- [ ] Nam
- [ ] Nữ
- Môn thi:
- [ ] Ngoại ngữ
- [ ] Toán
- [ ] Văn
- Tổ hợp:
- [ ] Khoa học tự nhiên
- [ ] Khoa học xã hội

[Gửi thông tin]

**Hình 12.3. Biểu mẫu đăng kí môn thi tốt nghiệp**

## LUYÊN TÂP
Lần lượt tạo các loại phần tử form và các phần tử input với những loại dữ liệu khác nhau và liệt kê ra ba ví dụ có thể sử dụng của từng loại.

## VẬN DỤNG
1. Tạo một biểu mẫu đăng kí thành viên câu lạc bộ.
2. Sửa lại mã nguồn của trang web đã viết trong Nhiệm vụ 2, Bài 11 để thêm một liên kết cho cụm từ "Đăng kí". Khi nháy chuột vào liên kết, trang web đã viết ở Câu sẽ được hiển thị trong iframe.
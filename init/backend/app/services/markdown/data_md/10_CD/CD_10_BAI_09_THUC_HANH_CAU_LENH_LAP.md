# BÀI THỰC HÀNH CÂU LỆNH LẶP

Học xong bài này, em sẽ:
- Viết được chương trình đơn giản có sử dụng câu lệnh lặp.
- Viết được chương trình đơn giản có sử dụng câu lệnh rẽ nhánh kết hợp với câu lệnh lặp.

## Bài 1. Làm quen với câu lệnh lặp trong Python

Chạy chương trình để kiểm tra kết quả. 0 Hình sau đây sẽ đưa ra kết quả.

```python
total = 0
for i in range(1, 101):
total += i
print(i, total)
```

**Hình 1. Chương trình với câu lệnh lặp while**

## Bài 2. Đếm các ước thực sự của một số nguyên

Bạn Hà viết chương trình ở Hình 2 để đếm xem số nguyên n nhập vào từ bàn phím có bao nhiêu ước số thực sự (ước khác 1 và n). Tuy nhiên, chương trình chạy kết quả sai. Em hãy sửa lỗi giúp bạn Hà.

```python
n = int(input("n = "))
uoc = n // 2
i = 2
while i &#x3C;= uoc:
if n % i == 0:
uoc += 1
i += 1
print(n, "có số ước thực sự là:", uoc)
```

**Hình 2. Chương trình của bạn Hà**

## Bài 3. Nhập dữ liệu có kiểm tra

Tham khảo chương trình ở Ví dụ 5 trong Bài 8, em hãy viết chương trình yêu cầu người dùng nhập một số nguyên lớn hơn 1,000,000. Chương trình nào người dùng nhập chưa đúng yêu cầu thì có thông báo yêu cầu nhập lại, chương trình chỉ kết thúc với thông báo "Cảm ơn, bạn đã nhập đủ dữ liệu đúng yêu cầu."



# Em hãy lập tinh giải bài toán cổ ở hình bên một cách tổng quát

## Bài toán

Bó lai cho tròn
Ba mươi sáu con
Một trăm chân chẵn
Hỏi có mấy con gà, mấy con chó?

## BÀI TÌM HIẾU THÊM

### CÁC CÂU LỆNH BREAK VÀ CONTINUE

Bất cứ những điều kiện lặp còn lại đều bị bỏ qua.
Câu lệnh `continue` trong Python được dùng để bỏ qua các câu lệnh còn lại chưa được thực hiện trong vòng lặp; chuyển đến vòng lặp tiếp theo.

#### Ví dụ 1

Chương trình sử dụng `break` và `continue` trong câu lệnh `for` để giải quyết bài toán sau:

```python
# Kiểm tra bảng nhân
for i in range(1, 11):
tra_loi = input("Nhập câu trả lời: ")
if int(tra_loi) == an:
print("Đúng")
else:
print("Sai! Đáp án: ", dap_an)
```

#### Ví dụ 2

Chương trình ở hình sau đây sử dụng `break` và `continue` trong câu lệnh `while` để giải quyết bài toán sau:

Bài toán: Để thử nghiệm lâm sàng vacxin mới ở giai đoạn 1, ta cần những người trong độ tuổi từ 18 đến 64 tuổi và thoả mãn điều kiện \( 18.5 &#x3C; \frac{\text{cân nặng}}{\text{chiều cao}} &#x3C; 22.9 \).

Theo tập hồ sơ nhận được từ những người tình nguyện; hãy đưa ra màn hình sống.

```python
while True:
print("Người tình nguyện")
tuoi = int(input("Tuổi: "))
if tuoi == 0:
break
cao = float(input("Cao (m): "))
nặng = float(input("Nặng (kg): "))
if (18 &#x3C;= tuoi &#x3C; 65) and not (18.5 &#x3C; nặng / cao**2 &#x3C;= 22.9):
continue
print("Số người được xét: ", p)
```

Đọc sách tại học O.vn
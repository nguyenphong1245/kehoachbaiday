# Lập danh sách số nguyên tố

## 1. Giới thiệu
- Chương trình sẽ lập danh sách số nguyên tố chỉ khi \( n > 1 \).
- Kết quả của chương trình sẽ là danh sách số nguyên tố rỗng nếu \( n = 1 \).

## 2. Điều kiện
- Nếu \( n > 1 \), danh sách số nguyên tố sẽ không rỗng.
- Độ dài danh sách số nguyên tố là số nguyên tố.

## 3. Phân tích số nguyên
- Nếu \( n \) là số tự nhiên từ bàn phím và kiểm tra \( n \) có phải là số nguyên tố hay không:
- Nếu \( n = 1 \), thông báo rằng \( n \) không phải là số nguyên tố.
- Nếu \( n \) là hợp số, in ra phân tích \( n \) thành tích các thừa số nguyên tố.

```python
n = int(input("Nhập số tự nhiên n: "))
if n &#x3C;= 1:
print("n không phải là số nguyên tố")
else:
# Phân tích n thành tích các thừa số nguyên tố
k = 2
while n > 1:
if n % k == 0:
print(k, end=' ')
n //= k
else:
k += 1
```

## 4. Kết luận
- Chương trình sẽ in ra khai triển \( n \) thành tích các thừa số nguyên tố có dạng:
\[
n = p_1 \times p_2 \times \ldots \times p_k
\]



```markdown
## Bài 15.1: Kiểm tra số nguyên tố

```python
m = n
k = 2
NT = []
while m > 1:
while m % k != 0:
k = k + 1
NT.append(k)
m = m // k
count = len(NT)

if count == 0:
print(n, "không là số nguyên tố")
elif count == 1:
print(n, "là số nguyên tố")
```

### Bảng theo dõi các giá trị trung gian

| m   | n   | NT      | Kết quả          |
|-----|-----|---------|------------------|
| 100 | 100 | [2]     |                  |
| 50  | 100 | [2, 2]  |                  |
```

### Mô tả
- Mỗi lần chương trình chạy, quan sát các biến n, r.
- Đầu vào của n = 100.



# Python khi các lệnh này lồng nhau

Khi đó các lệnh rẽ nhánh bên trái sẽ được viết gọn hơn như mô hình bên phải.

## Cấu trúc lệnh rẽ nhánh

```
if &#x3C;điều kiện 1> :
<nhóm 1="" lệnh="">
elif &#x3C;điều kiện 2> :
<nhóm 2="" lệnh="">
else:
<nhóm 3="" lệnh="">
```

Cấu trúc `if`, `elif`, `else` có thể lồng nhau nhiều lần.

## Bài tập

Viết chương trình đầy đủ như sau:

- Nhập từ bàn phím ba số thực `a`, `b`, `c` và tìm nghiệm của phương trình:

\[
ax^2 + bx + c = 0
\]

- Công thức tính nghiệm:

```python
x = (-b + (b**2 - 4*a*c)**0.5) / (2*a)
```

- Lưu ý: Nếu `a` bằng 0, phương trình trở thành phương trình bậc nhất.</nhóm></nhóm></nhóm>



```python
print("XI,2 = round(x,1)")
```

**Phương trình vô nghiệm**

Chương trình yêu cầu nhập số thực dương a. Chương trình hoạt động như sau: Nếu số đã nhập nhỏ hơn hoặc bằng 0 thì thông báo "Số phải lớn hơn 0. Hãy nhập lại". Chương trình chỉ dừng sau khi nhận được số hợp lệ.

Chương trình in bảng cửu chương ra màn hình như sau:

- Ngày thứ nhất in ra bảng nhân 1, 2, 3, 4, 5.
- Ngày thứ hai in ra bảng nhân 6, 7, 8, 9, 10.
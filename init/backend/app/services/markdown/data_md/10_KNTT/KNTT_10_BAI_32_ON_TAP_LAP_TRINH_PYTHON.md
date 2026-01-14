# Bài này yêu cầu thêm tách phần đệm, tức là phần nằm

1. Sử dụng lệnh `join()`. Xâu kí tự ban đầu được tách thành `split()`. Sau khi lấy phần họ và tên, phần đệm sẽ lấy ra:
```python
join(slist[1:n-1])
```
Trong đó `slist` là danh sách được tách ra từ xâu ban đầu, `n` là số lượng phần tử trong danh sách.

2. Hãy thử và kiểm tra chương trình sau:
```python
input("Nhập họ tên đầy đủ của em: ")
oten.split()
list)
t[0]
st[n-1]
join(slist[1:n-1]) ; UỖ G 5ỮN G
```

3. Kết quả:
- "Tên của em là", `ten`
- "Họ của em là", `ho`



# Mặt Trăng, Hoả Tinh, Kim Tinh, Mộc Tinh, Thổ Tinh

| Hành Tinh   | Trọng Lượng (N) |
|-------------|------------------|
| Mặt Trăng   | 1.62             |
| Hoả Tinh    | 0.711            |
| Kim Tinh    | 8.83             |
| Mộc Tinh    | 24.79            |
| Thổ Tinh    | 10.44            |
| Thiên Vương | 274.0            |

```python
# Nhập trọng lượng của em, tính theo N
weight = float(input("Nhập trọng lượng của em, tính theo N: "))
planet = int(input("Nhập số thứ tự hành tinh: "))
P_earth = weight * (planet_weights[planet - 1] / 9.8)
print("Trọng lượng của em trên hành tinh", planet_names[planet - 1], "là:", P_earth, "N")
```

3. Kiểm tra tính hợp lệ của ba tham số ngày; tháng; năm.
- Chương trình sẽ yêu cầu nhập ba số tự nhiên: ngày; tháng; năm.
- Ví dụ nhập: 08-02-2021.
- Chương trình sẽ thông báo bộ dữ liệu không hợp lệ nếu không đúng định dạng.



# TÀI LIỆU GIÁO DỤC

## Chương trình nhập số

Viết chương trình nhập số \( n \), sau đó nhập danh sách tên học sinh trong lớp theo bảng chữ cái. Đưa kết quả ra màn hình.

### Yêu cầu

- Sử dụng các phần mềm bảng tính điện tử, dữ liệu ngày tháng được nhập từ ngày 1-1-1990.
- Viết chương trình:
- Nhập số tự nhiên \( n \) từ bàn phím.
- Tính xem số đó ứng với ngày; thời gian theo khuôn dạng ngày tháng năm (ví dụ: 8-1 ứng với ngày này theo phần mềm bảng tính điện tử).

### Điều kiện

- \( 0 \leq \text{month} \leq 12 \)
- \( 1 \leq \text{day} \leq \text{thang[month]} \)

### Thông báo

- Nếu ngày tháng hợp lệ:
```plaintext
(day, month, year, "là hợp lệ")
```
- Nếu ngày tháng không hợp lệ:
```plaintext
("Bộ dữ liệu đã nhập không hợp lệ")
```
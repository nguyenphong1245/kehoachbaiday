# 5 Các phép toán liên quan đến các yếu tố

Các phép toán trên các yếu tố "đúng" và "sai" là các phép...

## Hình 5.1.
**TRỊ CHÂN LÍ VÀ CÁC PHÉP TOÁN LÔGIC**

**Đúng hay sai?**
Một tiết cho biết "Ngày mai trời lạnh và có mưa". Thực tế thì không biết thời tiết cũng đúng. Có bốn trường hợp có thể xảy ra. Vậy dự báo nào là đúng? Trường hợp nào dự báo là sai?

| Ngày mai trời lạnh | Ngày mai trời có mưa | Dự báo |
|---------------------|-----------------------|--------|
| Đúng                | Đúng                  | Đúng   |
| Đúng                | Sai                   | ?      |
| Sai                 | Đúng                  | ?      |
| Sai                 | Sai                   | ?      |




# Logic Operations

| p | q | p AND q | p OR q | p XOR q |
|---|---|---------|--------|---------|
| 0 | 0 |    0    |   0    |    0    |
| 0 | 1 |    0    |   1    |    1    |
| 1 | 0 |    0    |   1    |    1    |
| 1 | 1 |    1    |   1    |    0    |

## Mệnh đề logic

- **p AND q** (đọc là p và q) là mệnh đề có giá trị đúng nếu cả p và q đều đúng.
- **p OR q** (đọc là p hoặc q) là mệnh đề có giá trị sai khi cả p và q đều sai.
- **p XOR q** (đọc là p hoặc q nhưng không phải cả hai) là mệnh đề có giá trị sai khi p và q có giá trị như nhau.
- **NOT p** (đọc là phủ định p) là mệnh đề có giá trị sai khi p đúng.

### Các biểu thức logic

Biểu thức logic là một dãy các đại lượng logic được nối với nhau bằng các phép toán logic, có thể sử dụng dấu ngoặc để chỉ định thứ tự ưu tiên thực hiện các phép toán.

#### Ví dụ:

- \( 2 \cdot (q \text{ OR } r) \)
- \( \text{UOG SOMG} \)

Khi đó, nếu p là mệnh đề \( (x &#x3C; 1) \), q là mệnh đề khác, thì p AND q chính là tập tất cả các giá trị mà cả hai mệnh đề đều đúng.



# Giá trị của biểu thức lôgic

## Các mệnh đề

- **p**: "Hùng khéo tay"
- **q**: "Hùng chăm chỉ"

### Các biểu thức lôgic

1. **p AND NOT q**
2. **p OR q**
3. **NOT p**

### Bảng 5.3. Giá trị của biểu thức lôgic p AND NOT q

| y ng án | p | q | p AND NOT q |
|---------|---|---|--------------|
| A       | 0 |   |              |
| B       | 1 |   |              |
| C       |   |   |              |
| D       |   |   |              |

### Ghi chú

- p XOR q chỉ đúng khi p và q có giá trị khác nhau.
- NOT p cho giá trị đúng nếu p sai và cho giá trị sai nếu p đúng.

### Câu hỏi

Phương án nào có kết quả sai?



# Mạch Điện và Giá Trị Lôgic

## 1. Các Khái Niệm Cơ Bản

- **Giá trị lôgic**:
- Giá trị lôgic 1: Công tắc mở
- Giá trị lôgic 0: Công tắc đóng

- **Đèn sáng**: Giá trị lôgic 1
- **Đèn tắt**: Giá trị lôgic 0

## 2. Mạch Điện với Hai Công Tắc

Trong một mạch điện có hai công tắc K1 và K2 nối với một bóng đèn, giá trị lôgic của đèn được tính qua giá trị lôgic của các công tắc K1 và K2.

### 2.1. Biểu Diễn Mạch Điện

```
K1    K2
|      |
|      |
|      |
|      |
|      |
```

### 2.2. Các Tình Huống

- **K1 = 1, K2 = 1**: Đèn sáng
- **K1 = 1, K2 = 0**: Đèn tắt
- **K1 = 0, K2 = 1**: Đèn tắt
- **K1 = 0, K2 = 0**: Đèn tắt

## 3. Phép Toán Lôgic

- **AND**: Kết quả chỉ bằng 1 khi cả hai đầu vào đều bằng 1.
- **OR**: Kết quả bằng 1 khi ít nhất một đầu vào bằng 1.
- **NOT**: Kết quả đảo ngược giá trị lôgic.

### 3.1. Ví Dụ

- \( p \land \neg p = 0 \)
- \( p \lor \neg p = 1 \)

## 4. Kết Luận

Mạch điện với các công tắc và bóng đèn có thể được mô tả bằng các giá trị lôgic, giúp chúng ta hiểu rõ hơn về cách hoạt động của các thiết bị điện trong thực tế.
# 1. PHƯƠNG PHÁP KIỂM THỬ CHƯƠNG

Tìm hiểu một số phương pháp kiểm thử chương trình. Dưới đây là một số phương pháp và công cụ để biết rõ từng công cụ trong công việc kiểm thử chương trình.

## Các phương pháp và công cụ kiểm thử

- **Mục đích**: Tìm ra lỗi (hay bug) của chương trình.
- **Ngăn ngừa**: Ngăn chặn các lỗi phát sinh tiếp trong tương lai.

### Kiểm tra mã lỗi Runtime và bắt lỗi ngoại lệ

- Chương trình có lỗi Runtime (tức là đang chạy bị dừng lại).
- Bắt lỗi ngoại lệ để kiểm tra vị trí dòng lệnh sinh ra lỗi này.

### Thử chương trình với các bộ dữ liệu test

- Chương trình cần được thử nghiệm với một số bộ dữ liệu test, bao gồm:

- Dữ liệu hợp lệ
- Dữ liệu không hợp lệ
- Dữ liệu biên

## Kết luận

Việc kiểm thử chương trình là rất quan trọng để đảm bảo chất lượng và độ tin cậy của phần mềm. Sử dụng các phương pháp và công cụ kiểm thử phù hợp sẽ giúp phát hiện và sửa chữa lỗi kịp thời.



# Chương trình kiểm thử

## Một số ghi nhớ:
- Sử dụng công cụ in các biến trung gian
- Sử dụng công cụ sinh các bộ dữ liệu test.
- Sử dụng công cụ điểm dừng trong phần mềm soạn thảo
- Quan sát các mã lỗi của chương trình nếu phát sinh.

## Bài tập:
Nhập từ bàn phím hai số tự nhiên \( m \) và \( n \); tính ƯCLN của \( (m, n) \) là ƯCLN của hai số tự nhiên \( m, n \). Thuật toán có thể được mô tả như sau:

\[
\text{gcd}(m, n) =
\begin{cases}
m &#x26; \text{nếu } n = 0 \\
\text{gcd}(n, m \mod n) &#x26; \text{nếu } n > 0
\end{cases}
\]

### Mã nguồn:
```python
# Tính ƯCLN của m, n
m = int(input("Nhập Số tự nhiên m: "))
n = int(input("Nhập Số tự nhiên n: "))
while m != n:
if m &#x3C; n:
n = n - m
else:
m = m - n
print("Đáp số:", m)
```



```markdown
# Tính ƯCLN của M, n

1. m = int(input("Nhập SÔ tự nhiên m:"))
2. n = int(input("Nhập số tự nhiên n:"))
3. while m != n:
4.     if m &#x3C; n:
5.         n = n - m
6.     else:
7.         m = m - n
8. print("Đáp số:", m)

## Quan sát sự thay đổi của giá trị trong quá trình thực hiện chương trình

| Bước | Giá trị m | Giá trị n |
|------|-----------|-----------|
| 1    | 20        | 16        |
| 2    | 20        | 4         |
| 3    | 4         | 12        |
| 4    | 4         | 8         |
| 5    | 4         | 4         |

### Lưu ý:
- Thực hiện chương trình trên như sau:
- Quan sát sự thay đổi của giá trị trong quá trình thực hiện chương trình.
- Hiểu tìm cách sửa lỗi (nếu có) đồng thời hiểu rõ về thuật toán.
```



# Nội dung SGK

## Câu hỏi 1
**Chương trình của em khi chạy phát sinh lỗi ngoại lệ ZeroDivisionError. Em sẽ xử lý lỗi này như thế nào?**

## Câu hỏi 2
**Chương trình sau có lỗi không? Nếu có thì tìm và sửa lỗi.**

```python
print("Nhập số tự nhiên m:")
m = int(input())
print("Nhập số tự nhiên n:")
n = int(input())
print("Tổng hai số đã nhập là:", 3 * m + n)
```

## Câu hỏi 3
**Chương trình sau có chức năng sắp xếp một dãy số cho trước. Chương trình có lỗi không? Nếu có thì tìm và sửa lỗi.**

```python
A = [1, 5, 2, 8, 0, 4]
for i in range(len(A) - 1):
# Logic sắp xếp sẽ được thêm vào đây
```

### Ghi chú
- Đoạn mã trên cần được hoàn thiện để thực hiện chức năng sắp xếp.
# CHỦ ĐỀ F
## LẬP TRÌNH VỚI BIỂN

### BÀI 1: LÀM QUEN VỚI NGÔN NGỮ LẬP TRÌNH BẬC CAO

Học xong bài này, em sẽ:
- Giải thích được vì sao chúng ta cần lập trình và cần có ngôn ngữ lập trình bậc cao.
- Giới thiệu được sơ lược về Python, một ngôn ngữ lập trình bậc cao thông dụng.
- Bắt đầu chạy được một vài chương trình tính toán đơn giản trong môi trường Python.

Máy tính không hiểu được ngôn ngữ tự nhiên của con người. Vậy làm thế nào để chỉ dẫn cho máy tính thực hiện một việc nào đó?

### Ngôn ngữ lập trình bậc cao

Em đã biết một ngôn ngữ lập trình nào chưa? Nếu đã từng dùng một ngôn ngữ lập trình thì em đã dùng nó để làm gì?

Cần có ngôn ngữ chung giữa con người và máy tính để ta viết các chỉ dẫn cho máy tính thực hiện được nhiệm vụ mà con người giao cho nó. Như vậy, ngôn ngữ lập trình được gọi là ngôn ngữ lập trình.

### Ngôn ngữ lập trình trực quan

Ngôn ngữ Scratch dễ dùng và thích hợp với các bạn nhỏ tuổi. Nhưng những ngôn ngữ lập trình bậc cao như: Python, C++, Java, mới cung cấp tính năng chuyên nghiệp cho việc lập trình. Trong những ngôn ngữ như vậy, em sẽ viết các chỉ dẫn cho máy tính bằng cách gõ các ký tự trên bàn phím.

#### Hình 1: Tính toán trên hai ngôn ngữ lập trình

- Ngôn ngữ Scratch
- Ngôn ngữ Python

```python
# Ví dụ tính toán trong Python
result = 3 + 5
print(result)  # Kết quả sẽ là 8
```

Đa số sách tại hoc1O.vn



# Ngôn ngữ lập trình Python

Do gần gũi với ngôn ngữ tự nhiên; có cú pháp đơn giản; ngữ nghĩa đơn trị, số lượng từ khá ít. Ngôn ngữ lập trình bậc cao dễ hiểu, dễ học. Ngày nay, nếu sử dụng được một ngôn ngữ lập trình bậc cao, em có thể ra lệnh cho mọi loại máy tính. Việc soạn thảo cách hướng dẫn để máy tính hiểu và có thể thực hiện các yêu cầu được gọi là chương trình. Mỗi hướng dẫn của em được gọi là lập trình và sản phẩm soạn thảo.

Để sử dụng ngôn ngữ lập trình bậc cao, máy tính của em cần được trang bị môi trường lập trình giúp em soạn thảo, kiểm tra từng câu lệnh đã viết đúng chưa; chuyển các câu lệnh sang ngôn ngữ mà máy hiểu được (gọi là ngôn ngữ máy) và theo đó máy thực hiện được.

## Quyển sách này sẽ sử dụng Python

Quyển sách này sẽ sử dụng Python (phiên bản 3.9.0) để minh họa cho việc lập trình bằng ngôn ngữ lập trình bậc cao. Hiện nay, Python là một trong số các ngôn ngữ lập trình bậc cao phổ biến rộng rãi trên thế giới.

Python được Guido van Rossum (người Hà Lan) đề xuất và công bố năm 1991. Với nhiều ưu điểm, Python được dùng để phát triển các ứng dụng phần mềm ứng dụng; phân tích dữ liệu, lập trình game; điều khiển robot; xử lý ảnh.

Hệ thống công cụ lập trình Python có thể dễ dàng tìm thấy trên Internet và tải về miễn phí. Sau khi thực hiện cài đặt chương trình (ví dụ cho Python phiên bản 3.9.0) trong cửa sổ Start sẽ xuất hiện các mục cho ta chọn loại dịch vụ của Python.

### Recently added

Nếu chọn mục IDLE (Hình 2) ta sẽ có cửa sổ Shell, cho phép viết và thực hiện câu lệnh (Hình 3).

#### Hình 2. Cửa sổ Start

| Cửa sổ làm việc trực tiếp của Python |
|---------------------------------------|
| Python 3.9.0 Shell                   |
| File  Edit  Shell  Debug  Options    |
| Window  Help                          |
| Python 3.9.0 (tags/v3.9.0:9cf6752)   |
| Oct 5 2020, 15:34:40 MSC v.1927      |
| 64 bit AMD64) on win32               |
| Type "help", "copyright", "credits", "license()" for more information. |
| >>>                                   |

#### Hình 3. Cửa sổ Shell

Đọc sách tại hoc1O.vn



# Ví dụ 1
Để máy tính hiển thị trên màn hình dòng chữ "Python là một trong những ngôn ngữ lập trình bậc cao", ta có thể sử dụng câu lệnh `print()` như ở Hình 4.

Gõ dòng này từ bàn phím:

```
Python 3.9.0 Shell
File  Edit Shell Debug Options  Window  Help
Python          0   (tags /v3 9 .0 : 9cf6752 , Oct  5 2020 15 :34 :40) [MSC  1927 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license()" for more information.
22> print('Python là một trong những ngôn ngữ lập trình bậc cao')
Python là một trong những ngôn ngữ lập trình bậc cao
2>>                                                                            Nhấn Enter
```

**Kết quả**
Hình 4. Chương trình xuất dữ liệu với câu lệnh `print()`

----

# Ví dụ 2
Tốc độ ánh sáng là \(299,792,458 \, \text{m/s}\) và thời gian ánh sáng đi từ Mặt Trời tới Trái Đất là 8 phút 20 giây. Ta có thể dùng Python để viết chương trình tính được khoảng cách từ Mặt Trời đến Trái Đất như ở Hình 5.

Gõ dòng này từ bàn phím:
```
Python 3.9.0 Shell
File  Edit Shell Debug Options  Window  Help
Python 3           (tags/v3 9cf6752 , Oct  5  2020 15 :34 :40) [MSC  1927 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license()" for more information.
27> 299792458 * (8*60 + 20)                                     Cách viết dấu phép tính nhân
149896229000
```

**Kết quả**
Hình 5. Chương trình tính khoảng cách từ Mặt Trời đến Trái Đất

----

## Lưu ý:
- Python phân biệt chữ hoa và chữ thường.
- Dãy kí tự muốn in ra màn hình bằng câu lệnh `print()` cần được đặt trong cặp dấu nháy đơn (hoặc nháy kép).

----

# KNOW THE RULES!
- Aicũng có thể lập trình được
- Hãy học một số quy tắc và các câu lệnh cơ bản
- Hãy thực hành và luyện tập để phát triển kỹ năng

----

Đa số sách tại hoc1O.vn



# Bài 1
Em hãy viết câu lệnh `print()` sao cho khi thực hiện câu lệnh này trên màn hình sẽ hiển thị dòng 'chữ Học lập trình với Python để ra lệnh cho máy tính?

# Bài 2
Đường cao tốc Hà Nội - Lào Cai (kí hiệu CT.05) có chiều dài 264 km. Một ô tô chạy với tốc độ bình quân toàn tuyến là 70 km/h. Em hãy dùng ngôn ngữ lập trình Python ra lệnh cho máy tính để xác định thời gian ô tô đó đi từ Lào Cai về Hà Nội.

Năm 2020 nước ta sản xuất được 247 tỉ kWh điện. Sản lượng điện của nước ta được dự báo sẽ tiếp tục tăng nhanh với tốc độ trung bình là 8,6%/năm. Em hãy dùng ngôn ngữ lập trình Python ra lệnh cho máy tính để tính sản lượng điện của nước ta trong năm tiếp theo.

## Câu 1
Trong các câu sau đây, những câu nào đúng?
1) Chương trình là một bản chỉ dẫn cho máy tính làm việc, được viết bằng một ngôn ngữ lập trình.
2) Chỉ có một ngôn ngữ lập trình bậc cao là Python.
3) Lập trình bằng Python có thể đưa ra các thông báo bằng tiếng Việt.
4) Môi trường lập trình hỗ trợ người lập trình phát hiện ra câu lệnh viết sai ngữ pháp.

## Câu 2
Trong các câu sau đây, những câu nào phù hợp với lý do nên học lập trình?
Em học lập trình để:
1) Giỏi tiếng Anh.
2) Làm phong phú kiến thức cá nhân.
3) Có thể truy cập Internet.
4) Sử dụng được các phần mềm văn phòng.
5) Điều khiển máy tính giải quyết nhiều loại bài toán sẽ gặp trong thực tế.
6) Sau này trở thành chuyên gia trong lĩnh vực tin học.

# Tóm tắt bài học
Chương trình máy tính là một dãy các câu lệnh mà máy tính có thể "hiểu" và thực hiện được. Ngôn ngữ lập trình là ngôn ngữ dùng để viết các chương trình máy tính. Python là một trong những ngôn ngữ lập trình bậc cao thông dụng. Trong cửa sổ Shell của Python có thể thực hiện ngay từng câu lệnh và thấy được kết quả.
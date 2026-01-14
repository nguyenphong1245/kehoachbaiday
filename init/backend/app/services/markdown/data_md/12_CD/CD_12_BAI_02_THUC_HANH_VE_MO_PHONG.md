# BÀI 2: THỰC HÀNH VỀ MÔ PHỎNG

Học xong bài này, em sẽ:
- Sử dụng được phần mềm GeoGebra và nêu được lợi ích của phần mềm này.

## Nhiệm vụ 1: Thể hiện trực quan một số định lý hình học bằng phần mềm GeoGebra

### Yêu cầu:
Hãy sử dụng phần mềm GeoGebra để vẽ hình kiểm chứng các định lý sau đây:
a) Ba đường phân giác của ba góc trong một tam giác cùng đi qua một điểm.
b) Giao điểm của các đường phân trong một tam giác là tâm đường tròn nội tiếp tam giác đó.

### Hướng dẫn thực hiện:
Mở phần mềm GeoGebra bằng cách nháy đúp chuột vào biểu tượng của phần mềm. Quan sát giao diện của phần mềm: Trên thanh công cụ có biểu tượng của các đối tượng hình học cơ bản. Khi đưa con trỏ chuột vào mỗi biểu tượng trên thanh công cụ, một bảng chọn thả xuống sẽ xuất hiện. Khi chọn một đối tượng hình học, sẽ có hướng dẫn ở mục TRỢ GIÚP (Hình 1). Tiếp theo, thực hiện các yêu cầu của nhiệm vụ.

```plaintext
GcoGebra Classic
Nhập lệnh. Đa giác
Chọn vẽ đa giác
Đa giác đều
```

- Đa giác có hướng TRỢ GIÚP
- Đưa chuột vào làm xuất hiện bảng chọn thả xuống
- Đa giác TRỢ GIÚP
- Chọn các đỉnh đa giác sau đó chọn lại đỉnh đầu tiên

### Hình 1: Một ví dụ chọn đối tượng để vẽ và giải thích trợ giúp trên giao diện của GeoGebra

----

**Bản in thử**



# Kiểm chứng định lý: Ba đường phân giác của ba góc trong một tam giác cùng đi qua một điểm

## Bước 1: Vẽ một tam giác
Nháy chuột vào biểu tượng ![icon](0) trên bảng chọn thả xuống chọn vẽ Đa giác (Hình 1).

Chọn một đỉnh của tam giác, tiếp tục chọn đỉnh thứ hai, đỉnh thứ ba và chọn lại đỉnh đầu tiên ta được tam giác \( ABC \) (Hình 2).

```
GeoGebra Classic

A = (-9.9, 2.78)
B = (-8.32, 0.78)
C = (-4.52, 2.56)

t1 = DaGiac(A, B, C):
5.21
```

Hình 2: Một màn hình trong trình vẽ tam giác.

## Bước 2: Vẽ các đường phân giác trong tam giác
Vẽ đường phân giác của góc A: Trên thanh công cụ, chọn biểu tượng Đường phân giác, rồi chọn lần lượt các điểm B, A, C để vẽ được đường phân giác của góc A.

Tương tự, vẽ hai đường phân giác còn lại. Quan sát để thấy ba đường phân giác vừa vẽ cùng đi qua một điểm (Hình 3).

```
GeoGebra Classic

A = (-9.9, 2.78) = N
B = (-8.32, 0.78)
C = (-4.52, 2.56)
t1 = DaGiac(A, B, C)
5.21
```

Hình 3: Một hình vẽ tam giác với các đường phân giác.



# Thay đổi vị trí của các đỉnh tam giác và quan sát

## Bước 3
Biến dạng thành tam giác khác thì các đường phân giác vẫn cùng đi qua một điểm.

### Chú ý:
- Có thể nháy chuột chọn biểu tượng ở góc trên bên phải màn hình của GeoGebra để hoàn tác (quay lại trạng thái ngay trước đó).
- Có thể chọn một đối tượng đã vẽ bằng cách nháy chuột vào tên của đối tượng đó.
- Để xoá một đối tượng đã vẽ, nháy chuột phải vào đối tượng đó, rồi chọn Xoá.
- Nháy chuột vào biểu tượng ở góc trên bên phải màn hình của GeoGebra, trong bảng chọn xuất hiện có những mục chọn cho phép ghi lưu file hoặc tạo file mới.

## b) Kiểm chứng định lý:
Giao điểm của các đường phân giác trong một tam giác là tâm đường tròn nội tiếp tam giác đó.

### Bước 1
Vẽ tam giác ABC và hai trong số ba đường phân giác của tam giác này.
Xác định giao điểm của hai đường phân giác bằng cách chọn Giao điểm của 2 đối tượng rồi nháy chuột vào giao điểm của hai đường phân giác vừa vẽ, sẽ tự động đặt tên cho điểm mới là D.

### Bước 2
Vẽ đường thẳng đi qua giao điểm D và vuông góc với cạnh AC.
Chọn biểu tượng chọn Đường vuông góc rồi chọn điểm D và chọn đoạn AC để xuất hiện đường thẳng cần vẽ.
Xác định giao điểm E của đường vừa vẽ với cạnh AC tương tự như cách xác định điểm D ở Bước 1.

### Bước 3
Vẽ đường tròn có tâm là D và đi qua E.
Trên thanh công cụ chọn biểu tượng chọn Đường tròn khi biết tâm và 1 điểm trên đường tròn nháy chuột chọn tâm D, di chuyển chuột đến điểm E rồi nháy chuột chọn điểm này để xuất hiện đường tròn cần vẽ.
Quan sát đường tròn vừa vẽ để thấy đó là đường tròn nội tiếp tam giác ABC (Hình 4).

```
Hình 4. Một hình vẽ tam giác với đường tròn nội tiếp
```

### Dữ liệu hình vẽ:
- (0, 4248 - 151)
- (10, -4)
- (14.5, *1.51)
- DJG ucl4 B, C
- (8, 13)
- Boan Th_ngle C, tl
- (5.15)
- Doan Thangic ^, tl
- (8{1}) /
- Dosn Thangla

----

**Bản in thử**



# Bước 4
Thay đổi vị trí của các đỉnh tam giác và quan sát để thấy mỗi khi tam giác biến dạng thành tam giác khác thì giao điểm của các đường phân trong tam giác vẫn là tâm đường tròn nội tiếp của tam giác đó.

## Nhiệm vụ 2. Tìm một quy luật hình học bằng mô phỏng của GeoGebra

### Yêu cầu:
- Vẽ nửa đường tròn tâm O đường kính AB.
- Lấy C, D là hai điểm trên nửa đường tròn sao cho OC vuông góc với OD (C thuộc cung AD).
- Các tia AC và BD cắt nhau ở P.
- Cho C thay đổi vị trí (di chuyển) trên nửa đường tròn, quan sát xem điểm P sẽ thay đổi vị trí như thế nào?

### Hướng dẫn thực hiện:
**Bước 1.** Vẽ nửa đường tròn tâm O đường kính AB.
Trên thanh công cụ chọn biểu tượng chọn Hình bán nguyệt qua 2 điểm, rồi thao tác chọn hai điểm A và B.
Lấy trung điểm của đoạn thẳng AB, GeoGebra tự động đặt tên cho điểm này là C. Nháy chuột phải vào tên điểm C và đổi tên điểm này thành O.

**Bước 2.** Vẽ OC và OD vuông góc với nhau, với C và D là hai điểm trên cung AB, C nằm phía bên trái D.
Vẽ đoạn thẳng OC: lấy một điểm C trên nửa bên trái cung tròn AB, vẽ đoạn OC.
Vẽ đường thẳng đi qua điểm O và vuông góc với OC: chọn biểu tượng chọn Đường vuông góc, chọn điểm O và chọn đoạn thẳng OC để xuất hiện đường thẳng cần vẽ.
Lấy giao điểm D của cung tròn AB với đường thẳng vừa vẽ được (đi qua O và vuông góc với OC).

**Bước 3.** Vẽ tia AC và tia BD.
Vẽ tia AC: chọn biểu tượng chọn Tia đi qua 2 điểm; rồi lần lượt chọn điểm A và điểm C.
Tương tự, vẽ tia BD.

**Bước 4.** Lấy P là giao điểm của tia AC và tia BD.
Chuyển của P: nháy chuột phải vào tên P, trong bảng chọn vừa xuất hiện nháy chuột chọn Hiển thị dấu vết khi di chuyển.

**Bước 5.** Đặt chế độ lưu vết di chuyển của P: nháy chuột phải vào tên P, trong bảng chọn vừa xuất hiện nháy chuột chọn Hiển thị dấu vết khi di chuyển.

**Bước 6.** Cho điểm C di chuyển trên nửa đường tròn đường kính AB và quan sát vết di chuyển mà điểm P di chuyển. Trong Hình 5, hai cung tròn có màu đỏ cho thấy vị trí điểm P thay đổi như thế nào khi cho điểm C di chuyển trên cung AB.



# GeoGebra Classic

## A = (2, 6)
## B = (10, 6)
### NuaDuongTron(A, B)
**12.57**

```
0             Trung Điểm(A, B)
(6, 6)
C = Điểm(c)
(3.65, 9.24)
```

**Hình 5. Một kết quả thực hiện Nhiệm vụ 2**
Chú ý: Có thể thay đổi màu sắc vẽ các đối tượng bằng cách nháy chuột phải vào tên đối tượng; chọn Thiết lập; chọn Màu sắc rồi chỉ định màu cho đối tượng.

## Nhiệm vụ 3.
Dùng GeoGebra để hiển thị trực quan mặt phẳng; mặt bậc hai và phần giao khi chúng cắt nhau.
### Yêu cầu:
Vẽ và xoay hình để quan sát đường phẳng \( y = 2x - 1 \) với mặt parabol \( z = 5x \).

### Hướng dẫn thực hiện:
**Bước 1.** Sau khi khởi động GeoGebra, chọn Vẽ đồ họa 3D trong bảng chọn như ở Hình 6a để xuất hiện giao diện vẽ 3D như ở Hình 6b.

```
GeoGebra Classic
Graphing
Hình học                    Nơi nhập hàm số
vẽ đồ họa 3D
complex active system
Trang trong trang Excel    Bàn phím ảo
Xác Suất
Exam Mode
Tải tập tin
```

**Hình 6a. Chọn chế độ vẽ đồ họa 3D**
**Hình 6b. Giao diện của chế độ vẽ đồ họa 3D**

----

**Bản in thử**



# Bước 2
Nhập hàm số \( z = r^3 \) để GeoGebra vẽ mặt parabol này.

# Bước 3
Nhập hàm số \( y = \frac{1}{2}x - 1 \) để GeoGebra vẽ mặt phẳng này:

# Bước 4
Xoay hình vẽ để tìm góc nhìn được rõ hơn phần giao nhau của các mặt vừa vẽ: nháy chuột vào một điểm trên hình vẽ, giữ chuột và di chuyển để kéo toàn bộ hình xoay theo. Hình 7 là một kết quả xoay hình vẽ hai mặt nói trên.

## Hình 7
Một kết hiển thị mặt bậc hai \( z = 5x^2 \) và mặt phẳng \( y = 1 \) của GeoGebra.

----

Sử dụng phần mềm GeoGebra để giải các bài toán sau:

### Câu 1
Cho góc vuông \( OY \) với điểm \( O \) cố định, điểm \( A \) cố định trên \( OY \); khi điểm \( B \) di chuyển trên \( OX \) thì điểm \( M \) là trung điểm của \( AB \) di chuyển ra sao?

### Câu 2
Hãy hiển thị mặt phẳng \( y = x + 3 \) và mặt trụ \( (y - 1)^2 + (x - 3)^2 = 4 \). Phần giao giữa hai mặt này là hình gì?
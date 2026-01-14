# BÀI 14: SQL NGÔN NGỮ TRUY VẤN CÓ CẤU TRÚC

## SAU BÀI HỌC NÀY EM SẼ:
- Hiểu được ở mức nguyên lý: CSDL và các bảng được tạo lập, được thêm mới, cập nhật và truy xuất dữ liệu qua SQL.

Ở bài trước, các em đã biết hệ QTCSDL với vai trò là một bộ phần mềm hỗ trợ khởi tạo, cập nhật, truy xuất CSDL để người dùng có thể cập nhật, truy xuất CSDL. Ngày nay, người ta thực hiện công việc đó chủ yếu thông qua ngôn ngữ truy vấn có cấu trúc SQL. Sự khác biệt của việc sử dụng SQL so với việc truy xuất dữ liệu bằng ngôn ngữ lập trình là gì?

## 1. LỢI ÍCH CỦA NGÔN NGỮ TRUY VẤN

### Hoạt động 1: Thao luận về hai cách truy xuất dữ liệu
Để lấy danh sách các bản nhạc do nhạc sĩ Văn Cao (mã định danh Aid = 1) sáng tác trong bảng dữ liệu Bản nhạc, ta có thể thực hiện theo một trong hai cách sau:

1. **Dùng một ngôn ngữ lập trình**: Viết chương trình mở tệp chứa bảng dữ liệu Bản nhạc; rồi lần lượt lấy ra từng nhóm dữ liệu liên quan đến từng bản nhạc, sau đó tách phần Aid để kiểm tra, nếu Aid = 1 thì đưa ra tên bản nhạc (TenBN).

2. **Dùng ngôn ngữ truy vấn**: Viết "CHỌN TenBN TỪ Bản nhạc VỚI Aid = 1" rồi gửi cho hệ QTCSDL thực hiện.

### Sự khác biệt cơ bản trong cách truy vấn
Với cách thực hiện thứ nhất trong Hoạt động 1, người dùng phải biết rõ cấu trúc tệp dữ liệu; từ đó lập trình lấy ra đoạn dữ liệu liên quan tới từng bản nhạc để xử lý. Việc làm này rất mất công, lại dễ nhầm lẫn. Đây là kiểu lập trình "theo thủ tục" vì phải biết rõ thủ tục truy cập dữ liệu để xây dựng thuật toán. Hơn thế nữa, ở một bài toán khác có nội dung tương tự, ví dụ lập danh sách các học sinh có điểm trung bình môn Toán trên 8, lại phải viết lại chương trình với một thủ tục tương tự.

Với cách thực hiện thứ hai trong Hoạt động 1, người dùng chỉ cần viết ra yêu cầu dưới dạng một câu truy vấn muốn làm gì, chứ không phải nghĩ cách để thực hiện yêu cầu ấy: Mọi việc còn lại sẽ do hệ QTCSDL giải quyết: tiếp nhận yêu cầu ở dạng chuỗi truy vấn rồi lấy ra kết quả theo đúng yêu cầu.

Ngôn ngữ truy vấn định chuẩn cho việc định nghĩa, cập nhật, truy xuất và điều khiển dữ liệu từ các CSDL quan hệ là SQL (Structured Query Language) được xây dựng.



# Dựng từ những năm 1970

SQL đã trở thành ngôn ngữ truy vấn tiêu chuẩn mà hầu hết các hệ QTCSDL đều sử dụng: Điều đó có nghĩa là chúng ta có thể dùng SQL để thao tác trên hầu hết các hệ QTCSDL phổ biến như Oracle, SQL Server, MySQL, PostGreSQL. SQL có ba thành phần là DDL (Data Definition Language - ngôn ngữ định nghĩa dữ liệu), DML (Data Manipulation Language - ngôn ngữ thao tác dữ liệu) và DCL (Data Control Language - ngôn ngữ kiểm soát dữ liệu). Chúng ta sẽ sử dụng SQL để minh hoạ cách thức quản trị CSDL.

## 2. KHỞI TẠO CSDL

Thành phần DDL của SQL cung cấp các câu truy vấn khởi tạo CSDL; khởi tạo bảng, thiết lập các khoá, tóm tắt trong các bảng sau:

### Bảng 14.1. Các câu truy vấn CSDL

| Câu truy vấn DDL                               | Ý nghĩa                     |
|------------------------------------------------|-----------------------------|
| CREATE DATABASE                                 | Khởi tạo CSDL               |
| CREATE TABLE                                    | Khởi tạo bảng               |
| ALTER TABLE                                     | Thay đổi định nghĩa bảng    |
| PRIMARY KEY                                     | Khai báo khoá chính         |
| FOREIGN KEY. REFERENCES.                        | Khai báo khoá ngoài         |

Các kiểu dữ liệu được sử dụng cho các thuộc tính của các bảng trong SQL.

### Bảng 14.2. Kiểu dữ liệu

| Kiểu dữ liệu                                   | Ý nghĩa                                                                 |
|------------------------------------------------|-------------------------------------------------------------------------|
| CHAR (n) hay CHARACTER (n)                     | Xâu ký tự có độ dài cố định n ký tự, nếu xâu có ít hơn n ký tự, các ký tự trống được thêm vào phía bên phải |
| VARCHAR                                         | Xâu ký tự có độ dài thay đổi, không vượt quá n ký tự                  |
| BOOLEAN                                         | Kiểu logic có giá trị Đúng (1) hay Sai (0)                             |
| INT hay INTEGER                                 | Số nguyên                                                              |
| REAL                                            | Số thực dấu phẩy động                                                  |
| DATE                                            | Ngày tháng, dạng 'YYYY-MM-DD'                                          |
| TIME                                            | Thời gian; dạng 'HH:MM:SS'                                            |

Ví dụ: Khởi tạo CSDL âm nhạc, đặt tên là music và khởi tạo các bảng Nhạc sĩ, Bản nhạc có tên tương ứng là nhacsi và bannhac.

```sql
CREATE DATABASE music;                               -- Khởi tạo CSDL music
CREATE TABLE bannhac                                 -- Khởi tạo bảng bannhac
(
Mid CHAR(4),
Aid INT,
TenBN VARCHAR (128)
);                                                  -- Thêm khoá chính Mid
ALTER TABLE bannhac ADD PRIMARY KEY (Mid);           -- cho bảng bannhac
CREATE TABLE nhacsi                                  -- Khởi tạo bảng nhacsi
(
Aid INT,                                         -- Các dấu chấm phẩy
TenNS VARCHAR (64)                               -- được dùng để kết thúc câu truy vấn
);
```



# 1. Hãy viết câu truy vấn tạo bảng Ca sĩ như đã mô tả trong Bài 11 với tên bảng 'casi'.

# 2. Hãy viết câu truy vấn thêm khoá chính Sid cho bảng casi.

## 3. CẬP NHẬT VÀ TRUY XUẤT DỮ LIỆU
Thành phần DML của SQL cung cấp các câu truy vấn cập nhật và truy xuất dữ liệu. Sau đây là một vài câu truy xuất dữ liệu để minh hoạ.

### Bảng xuất dữ liệu
| Câu truy xuất dữ liệu                          | Ý nghĩa                                                                                     |
|------------------------------------------------|---------------------------------------------------------------------------------------------|
| SELECT `<dữ liệu="" cần="" lấy="">`                     | `<dữ liệu="" cần="" lấy="">` có thể là danh sách các trường hay hàm nào đó với các biến là trường trong bảng |
| FROM `<tên bảng="">`                              |                                                                                             |
| WHERE `&#x3C;điều kiện chọn>`                       | Chỉ định chọn chỉ các dòng thoả mãn điều kiện xác định                                      |
| ORDER BY `<tên trường="">`                        | Sắp xếp các dòng kết quả theo thứ tự chỉ định                                               |
| INNER JOIN                                     | Liên kết các bảng theo điều kiện                                                            |

### Một số câu truy vấn cập nhật dữ liệu trong Bảng 14.4
| Câu truy vấn cập nhật dữ liệu                  | Ý nghĩa                                                                                     |
|------------------------------------------------|---------------------------------------------------------------------------------------------|
| INSERT INTO `<tên bảng="">`                       | Thêm dữ liệu vào bảng `<tên bảng="">` với giá trị từ `<danh sách="" giá="" trị="">`                   |
| VALUES `<danh sách="" giá="" trị="">`                   |                                                                                             |
| DELETE FROM `<tên bảng="">`                       | Xoá các dòng trong bảng `<tên bảng="">` thoả mãn `&#x3C;điều kiện>`                               |
| WHERE `&#x3C;điều kiện>`                           |                                                                                             |
| UPDATE `<tên bảng="">`                            | Cập nhật `<giá trị="">` cho trường có tên là `<tên trường="">` trong bảng `<tên bảng="">`          |
| SET `<tên trường="">` `<giá trị="">`                |                                                                                             |

### Ví dụ:
```sql
SELECT Mid, TenBN
FROM bannhac
WHERE Aid = 1
ORDER BY TenBN;
```
Chọn ra từ bảng `bannhac` các dòng có `Aid = 1`, ở mỗi dòng chỉ lấy giá trị các cột `Mid` và `TenBN`. Sắp xếp các dòng kết quả theo thứ tự `TenBN`.

```sql
SELECT bannhac.TenBN, nhacsi.TenNS
FROM bannhac INNER JOIN nhacsi
ON bannhac.Aid = nhacsi.Aid;
```
Chọn lấy tất cả các dòng từ bảng `bannhac` liên kết với bảng `nhacsi` theo khoá `Aid`, ở mỗi dòng lấy cột `TenBN` bảng `bannhac` và cột `TenNS` bảng `nhacsi`.

```sql
INSERT INTO nhacsi VALUES
(5, 'Phú Quang'),
(6, 'Phan Huỳnh Điểu');
```
Thêm vào bảng `nhacsi` hai dòng mới.

```sql
DELETE FROM bannhac
WHERE Mid = '0005';
```
Xoá dòng có `Mid = '0005'` trong bảng `bannhac`.

```sql
UPDATE nhacsi
SET TenNS = 'Hoàng Hiệp'
WHERE Aid = 6;
```
Thay đổi giá trị cột `TenNS` thành 'Hoàng Hiệp' ở dòng có cột `Aid = 6` trong bảng `nhacsi`.</giá></tên></tên></tên></giá></tên></tên></tên></danh></danh></tên></tên></tên></tên></dữ></dữ>



# Giả sử đã có bảng diemtoan 11A, trong đó có cột tb ghi điểm trung bình môn Toán của tất cả các học sinh lớp 11A. Khi đó câu truy vấn sau lấy ra điểm trung bình cộng môn Toán của tất cả các học sinh lớp 11A.

```sql
SELECT AVG(tb) FROM diemtoan_11A;
```

1. Hãy viết câu truy vấn lấy tất cả các dòng của bảng nhacsi.

2. Hãy viết câu truy vấn thêm các dòng cho bảng casi với các giá trị là
- ('TK', 'Nguyễn Trung Kiên')
- ('QD', 'Quý Dương')
- ('YM', 'Y Moan').

## KIỂM SOÁT QUYỀN TRUY CẬP

Thành phần DCL của SQL cung cấp các câu truy vấn kiểm soát quyền người dùng đối với CSDL; tóm tắt trong Bảng 14.5.

### Bảng 14.5. Câu truy vấn kiểm soát quyền người dùng

| Mẫu câu truy vấn | Nghĩa |
|------------------|-------|
| GRANT            | Cấp quyền cho người dùng |
| REVOKE           | Thu hồi quyền đối với người dùng |

**Ví dụ:**

```sql
GRANT select ON music TO guest;
```
Cấp quyền dùng truy vấn SELECT đối với tất cả các bảng trong CSDL music cho người dùng guest.

```sql
REVOKE create, alter ON music.bannhac FROM mod;
```
Thu hồi quyền CREATE và ALTER cho bảng bannhac trong CSDL music đối với người dùng mod.

1. Hãy viết câu truy vấn cấp quyền UPDATE đối với tất cả các bảng trong CSDL music cho người dùng mod.

2. Hãy viết câu truy vấn thu hồi quyền DELETE đối bảng nhacsi trong CSDL music cho người dùng mod.

## LUYỆN TẬP

1. Hãy viết câu truy vấn tạo bảng Bản thu âm (banthuam) như đã mô tả trong Bài 13.

2. Viết câu truy vấn tạo khóa ngoài Mid và Sid cho bảng 3 banthuam.

3. Viết câu truy vấn lấy ra tất cả các dòng trong liên kết bảng banthuam với bảng bannhac; mỗi dòng lấy các cột: Mid; Sid của bảng banthuam và cột TenBN của bảng bannhac.

## VẬN DỤNG

Viết câu truy vấn lấy ra tất cả các dòng trong liên kết bảng banthuam với bảng bannhac và bảng casi, mỗi dòng lấy các cột: Mid; Sid của bảng banthuam; cột TenBN của bảng bannhac và TenCS của bảng casi.
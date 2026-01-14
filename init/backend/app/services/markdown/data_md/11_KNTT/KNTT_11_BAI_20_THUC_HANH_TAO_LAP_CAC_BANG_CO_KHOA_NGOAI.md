# BÀI 20 THỰC HÀNH TAO LẬP CÁC BẢNG CÓ KHOÁ NGOÀI

## SAU BÀI HỌC NÀY EM SẼ:
- Biết cách tạo mới các bảng có khoá ngoài.

Các em đã biết; khoá ngoài có tác dụng liên kết dữ liệu giữa các bảng: Khi tạo bảng có khoá ngoài, việc thiết lập khoá ngoài được thực hiện như thế nào?

## Nhiệm vụ
Tạo lập bảng `bannhac` với cấu trúc:
```
bannhac (idBannhac, tenBannhac, idNhacsi)
```
- Các trường `idBannhac`, `idNhacsi` kiểu INT.
- Trường `tenBannhac` kiểu VARCHAR (255).

## Hướng dẫn:
1. **KHAI BÁO BẢNG BANNHAC VỚI CÁC TRƯỜNG IDBANNHAC, TENBANNHAC**
- Chọn thẻ Tạo mới, chọn Bảng. Nhập tên: `bannhac`; chọn Thêm mới để thêm trường dữ liệu; một trường với tên mặc định `Column1` sẽ xuất hiện phía dưới.

```
Unnared rymusic{ HeidiSQL Pertable 12,0.0,6468  5
Chỉnh sửa Tin kiẽn        Tuy      Cac ccng cu Đẽn  'c x
Tập tin                                                        Trc giup
Kdo             01c
Bộ lcc co :        Bệ lcc bản             Mảy chủ: 127.0.01    Co s&#x26; dừ liệu: nymusic  Table: [Untitled]  Truy `
vẩn
Unnamed                                     Bazic  Tuychon     Indexes {0) 2E Fcreign keys (0]  Check constraints
infcrna                               Ten:         bannhad
mymusic                  32,0 KiB
casi         16, 0 KiB     Binh luận;
nhacsi        16 { KiB
Cệt                     Thêm mci  Xóa                      Dowa
Ten    Kiểu dử liệu        Length Set Unsign. Allow NULL      Zerofill Mặc định

Trc giúp  Hủy bẻ  Luu
Eộ lọc Regular expression
SELECT     FROH infornation scheta REFERENTIAL_CONSTRAINTS WHERE  {ONSTRAINT_SCHEMA= Ttusic'
SELECT     FROM_infornation schena KEY Ccluyn USeGE KHERE  TaBL   Schexe Gymusic  AND TABLE
Connecte  MariaDB 10.6,4  Uptime: 13 days 09:          Server tin  Idle
```

## Hình 20.1. Khai báo bảng mới

----

This document provides a structured approach to creating a new table with foreign keys in a database, specifically focusing on the `bannhac` table.



# Nhập tên: idBannhac_
Jnjmconynjac' Aci: SCLP,-zblc 1220 3488

Chọn kiểu dữ liệu INT,
Tap = -  Cfinh :u3  Tlm



# 3. KHAI BÁO CÁC TRƯỜNG KHOÁ

## a) Khai báo khoá chính: `idBannhac`
Nháy nút phải chuột vào ô `idBannhac`; chọn **Create new index**, chọn **PRIMARY**.

- **Sao chép**: `Ctrl+C`
- **Copy selected columns**
- **Paste columns**

- **Add column**: `Ctrl+Ins`
- **Remove column**: `Ctrl+Del`
- **Move up**: `Ctrl+U`
- **Move down**: `Ctrl+D`

- **Create new index**: **PRIMARY**

**Hình 20.5. Bảng chọn để khai báo khoá chính**

## b) Khai báo khoá chống trùng lặp
Cặp `(tenBannhac; idNhacsi)` không được trùng lặp, vì vậy phải khai báo khoá cấm trùng lặp. Đánh dấu hai trường này; nháy nút phải chuột vào vùng đánh dấu và chọn **Create new index**, chọn **UNIQUE**.

```
Unnamed mymusic { HeidiSQL Portable 12.0.0,6468
Tập tin Chỉnh sửa  Tìm kiếm     Truy vấn  Các công cụ  Đến Trc giúp
Kn00 X
mymus           Bệ Iẹc bản      Máy chủ: 127.5.2.1      Có sẻ dữ liệu; mymusic  Table: [Untitled]  Truy vấn
Unnamed                          Basic      Tùy chọn    Indexes (1)  0 Foreign keys (0)  Check constraints (0)
mymusic     32,0 KiB     Thêm mci   Xóa         Tên                             Type Length  Algorithm
casi        16,0 KiB     Dọn dẹp                        PRIMARY KEY             PRIMARY
nhacsi      16,0 KiB    Cệt:Dowvn 0ATher mởi           Xóa idBannhac            Dovvn

Tên                                    Kiểu dữ liệu Length _ Unsign  Allow NULL  Zerofill Mặc định
idBannhac    INT                                                AUTO_INCREMENT
tenBannh .   VARCHAR      255

Sao chép           Ctrl+C
Copy selected columns
Paste columns
Add column       Ctrl+Ins
SELECT CONSTRAINT NAME     Remove column    Ctrl+Del    schema  CHECK CONSTRAINTS WHERE CONSTRAINT
Move up            Ctrl+U    time: 14 days; 10.0  Server time  idle
Move down          Ctrl+D
Create new index                  PRIMARY
Add to index                       KEY
UNIQUE
FULLTEXT
SPATIAL

**Hình 20.6. Giao diện khai báo khoá cấm trùng lặp**



# Khai báo các khoá ngoâi

Để khai báo khoá ngoài `idNhacsi`, chọn thẻ **Foreign Key**:

```
Unamef mymusic' HeidiSQL Portzble 12.0.0.6468
Tip tin Chỉnh sửa Tim kiếm     Truy vấr  Cảz ccng cu   Đến    Tro giúp
```

| Khoox | mymus | Eê lccban | Máy chủ: 127.0.0.1 | Cc sẻ dữ liệu: mymusic | Table: [Untitled] | Truy vến | | |
|-------|-------|-----------|---------------------|------------------------|-------------------|----------|---|---|
| Unnamed | 32.0 KiB | Basic | Tuy chọn | Indexes (2) | Foreign keys | Check constraints (0) | | |
| mymusic | 16.0 KiB | Item mci | Key n. | Columns | Reference table | Foreign col | On UPDATE | On DELETE |
| nhacsi | 16.0 KiB | Xóa | NO ACTION | NO ACTION | | | | |

Cọn dep

```
Ct:                     Thém mci    Xéa                      Down
```

- kieu dừ lieu Length _  Unsign..    Allcw NU_L  Zerofill Mác dinn
- idBannhac     INT                                                    AUTO_INCREMENT
- tenBannh .    VARCHAR     255
- idNhacsi

Trợ giúp  Hủy vẻ                    Luu

Bệ lcc Regular expression

```sql
SELECT (CONSTRAINT_NAME, CHECK_CLAUSE) FROM 'information_schema'
CHECK_CONSTRAINTS WHERE CONSTRAINT.
```

```
Ccnnectec    { MariaDB 10.5,4  Uptime: 14 days 10,1   Server time     Idle
```

**Hình 20.7. Khai báo khoá ngoài**

Nháy chuột vào ô dưới dòng **Columns** và chọn trường khoá ngoài là `idNhacsi` rồi chọn **OK**.

```
Unnamed{mymus c{ HeidiSQL Portable  2,5.0.6468
Tặp tir ChỈnh sfa  7m kien     Truy vẩn  cng cu       Jen Trợ giup
```

| mymus | Bệ loc bảr | Máy chủ: 127.0.0.1 | Cc sở dữ liệu: mymusic | Table: [Untitled] | Truy vấn | | | |
|-------|------------|---------------------|------------------------|-------------------|----------|---|---|---|
| Unnamed | Ba;ic | Tuy chọn | Indexes (2) | Foreign key: (1) | Check constraints (0) | | | |
| mymusic | 32.0 KiB | Thém mci | Key n. | Columns | Reference table | Foreign col | On UPDATE | On DELETE |
| nhacsi | 16.0 KiB | Don dẹp | tenBannh | | | | | |

Cệ:                                                             Down

```
gth _ Ursign .    Alcw NULL          Zercfill Mặc định
```

- idDannhaz            Hủy                                                   AUTO_INCREMENT
- tenBannh .
- idNhacsi     INT

Trợ giúp   Hủy bẻ              Luu

Bộ lọc Regular expression

```sql
SELECT CONSTRAINT_NAME, CHECK_Clause FROM information_schema CHECK_CONSTRAINTS WHERE CONSTRAINT
```

```
Connectec    MariaDB 10.5,4  Uptime: 14 days; 101     Serve time  Idle
```

**Hình 20.8. Chọn trường là khoá ngoài**

Nháy chuột vào ô dưới **Reference table** để chọn bảng tham chiếu là `nhacsi` và chọn **OK**.



# Unramzd mymusiz { HeidiSQL Portable 12.00.6468

## Tập tin
- Chỉnh sửa
- Tìm kiếm
- Truy vấn
- Các công cụ
- Đến
- Trợ giúp

### Máy chủ: 127.0.0.1
### Cơ sở dữ liệu: mymusic
### Table [Untitled]  Truy vấn
| Unnamed | 320 KB | Easic | Tuy chọn | Indexes (2) | Foreign keys (1) | Check constraints (0) |
|---------|--------|-------|----------|--------------|-------------------|-----------------------|
| mymusic |         |       |          |              |                   |                       |
| casi    | 165 KB | Xóa   |          |              |                   |                       |
| nhacsi  | 160 KB | Đẹp   |          |              |                   |                       |

#### Cột
| Key         | Column        | Reference table | Foreign col | On UPDATE | On DELETE |
|-------------|---------------|------------------|-------------|-----------|-----------|
| idNhacsi    | nhacsi        |                  |             | NO ACTION | NO ACTION |

#### Kiểu dữ liệu
| Column Name  | Data Type | Length | Unsigned | Allow NULL | Zerofill | Mặc định         |
|--------------|-----------|--------|----------|------------|----------|------------------|
| idBannhac    | INT       |        |          |            |          | AUTO_INCREMENT    |
| tenBannh     | VARCHAR   | 255    |          |            |          |                  |
| idNhacsi     | INT       |        |          |            |          |                  |

### Trợ giúp
- Hướng dẫn: Lưu

```sql
SELECT CONSTRAINT_NAME, CHECK_CLAUSE
FROM information_schema.CHECK_CONSTRAINTS
WHERE CONSTRAINT_NAME = 'Check_CLAUSE';
```

**Curriculum**: MariaDB 10.6.4
**Uptime**: 12 days 10:1
**Server status**: Idle

### Hình 20.9. Chọn bảng tham chiếu
Tiếp theo chọn trường tham chiếu trong bảng nhacsi.

----

### Hình 20.10. Chọn trường tham chiếu
Cuối cùng nháy chuột chọn Lưu để kết thúc khai báo và khởi tạo bảng `bannhac_`.

## LUYÊN TÂP
Hãy tạo lập bảng `banthuam`.

## VÂN DUNG
Hãy tạo lập bảng `Quận/Huyện` trong CSDL quản lý tên `Quận/Huyện`, `Tỉnh/Thành phố`.
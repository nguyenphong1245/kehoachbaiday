# BÀI 79  THỰC HÀNH TẠO LẬP CƠ SỞ DỮ LIỆU VÀ CÁC BẢNG

## SAU BÀI HỌC NÀY EM SẼ:
- Biết tạo mới mật CSDL; thực hiện thông qua giao diện của phần mềm khách quản trị CSDL HeidiSQL.
- Tạo được các bảng không có khoá ngoài, chỉ định được khoá chính cho mỗi bảng, khoá cấm trùng lặp cho những trường không được có giá trị trùng lặp.

Việc đầu tiên để làm việc với một CSDL là tạo lập; Với HeidiSQL, việc tạo lập bảng đơn giản được thực hiện như thế nào?

## Nhiệm vụ
Tạo lập CSDL mới tên là `mymusic`, khởi tạo bảng `nhacsi`, khai báo các khoá cho các bảng này như thiết kế ở Bài 18.

### Hướng dẫn:
1. **TẠO LẬP CSDL MYMUSIC**
- Nháy nút chuột ở vùng danh sách các CSDL đã có, chọn thẻ Tạo mới, chọn Cơ sở dữ liệu.
- Nhập `mymusic`, chọn OK.
- Bộ mã kí tự mặc định là Unicode byte: `utf8mb4`, đối chiếu so sánh xâu theo `utf8mb4_general_ci`.
- Vùng mã lệnh phía dưới sẽ thấy xuất hiện câu truy vấn SQL tương ứng:
```sql
CREATE DATABASE mymusic
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;
```

![Hình 19.1. Tạo lập CSDL mymusic](#)

2. **TẠO LẬP BẢNG**
a) Khai báo tạo lập bảng; các trường và kiểu dữ liệu:
- Tạo lập bảng `nhacsi` (`idNhacsi`, `tenNhacsi`), `idNhacsi` kiểu `INT`, `tenNhacsi` kiểu `VARCHAR(255)`.
- Nháy nút phải chuột ở vùng danh sách các CSDL đã có, chọn thẻ Tạo mới, chọn Bảng.
- Nhập tên: `nhacsi`; chọn Thêm mới để thêm trường: Một trường với tên mặc định `Column1` sẽ xuất hiện phía dưới.



# Tài liệu Hướng dẫn Sử dụng HeidisQL

## 1. Giới thiệu
HeidisQL là một công cụ quản lý cơ sở dữ liệu, cho phép người dùng dễ dàng truy cập và quản lý dữ liệu trong các hệ quản trị cơ sở dữ liệu như MySQL, MariaDB, PostgreSQL, và SQL Server.

## 2. Cài đặt
- Tải phiên bản HeidisQL Portable từ trang web chính thức.
- Giải nén và chạy tệp thực thi.

## 3. Kết nối đến cơ sở dữ liệu
- Mở HeidisQL.
- Nhập địa chỉ máy chủ: `127.0.0.1`.
- Chọn cơ sở dữ liệu cần truy cập.

## 4. Khai báo bảng và trường
### 4.1. Khai báo tên bảng
- Nhập tên bảng: `idNhacsi`.
- Chọn kiểu dữ liệu: `INT`.
- Bỏ đánh dấu ô `Allow NULL`.

### 4.2. Thêm trường mới
- Nhấn `Ctrl + Insert` hoặc nhấp chuột phải dưới dòng `idNhacsi` và chọn `Add column`.
- Nhập: `tenNhacsi`.
- Chọn kiểu: `VARCHAR`.
- Độ dài: `255`.
- Giá trị mặc định: ký tự rỗng.

## 5. Cấu hình trường
| Tên       | Kiểu dữ liệu | Độ dài | Set Unsigned | Allow NULL | Zero | Mặc định         |
|-----------|--------------|--------|--------------|------------|------|-------------------|
| idNhacsi  | INT          |        | AUTO_INCREMENT |            |      |                   |
| tenNhacsi | VARCHAR      | 255    |              |            |      | '' (ký tự rỗng)   |

## 6. Hình ảnh minh họa
- **Hình 19.2**: Khai báo tên bảng, thêm mới một trường.
- **Hình 19.3**: Khai báo trường kiểu INT; not NULL.
- **Hình 19.4**: Khai báo trường AUTO_INCREMENT.

## 7. Lưu ý
- Để có kết quả như hình minh họa, chọn `AUTO_INCREMENT`, dưới nhãn `Mặc định` và chọn `OK`.

## 8. Trợ giúp
- Nếu cần trợ giúp, hãy nhấn vào nút `Trợ giúp` trong giao diện.

## 9. Kết luận
HeidisQL là một công cụ mạnh mẽ giúp quản lý cơ sở dữ liệu một cách hiệu quả và dễ dàng. Hãy thực hành các bước trên để làm quen với công cụ này.



# Uunar I2d rlniusic

## Hình cira lim klFm Inlnvaa

### Fac rảng

#### #JFr

- Ic gup: "5

- B? ọcco s0 Bo ccbing
- May chủ: 127.0.2.1

| Tzblc: [Untitlcd] | Tuy vẫn* |
|-------------------|----------|
| Mymusir           | Basic    |
| Tjy chon          | Indexe; (0) |
| Torciznke/: (C)   | Checkconst-zints (0) |

### 3Inh Ijan:

- Ct
- Then mci
- Down

#### Kicu dừlicu Length Sct Unsgred low NULL Zero.

- Mịc Tinh Dinh
- idNnjcsi
- tenNnacsi: :]l KI F

```plaintext
VAR( H2{Mi  anngMrepresents tFf                 YARCHAR
1vanable-length Iength      characzers. Ihe     CHPR
range      M1sU to 63,585Ihe etfectne           TINYTE<t length="" of="" :="" vakch1{&#x22;="" &#x27;cbjectto="" text="" tremazimur="" row="" size="" (3),9}2="" bytes;="" which="" pume="" days="" 125-="" chared="" mcng="" ilrolumn:)arr="" thecharacfer="" &#x60;&#x60;&#x60;="" ###="" hình="" 19.5.="" khai="" báo="" trường="" kiểu="" varchar="" b)="" khoá="" chinh="" -="" Án="" định="" idnhacsi="" là="" chính:="" nháy="" nút="" phải="" chuột="" vào="" dòng="" và="" chọn="" create="" new="" index=""> PRIMARY.

| Action                     | Shortcut   |
|----------------------------|------------|
| Sac chép                   | Ctrl+C     |
| Copy selected columns       |            |
| Paste columns               | Ctrl+Ins   |
| Add column                  |            |
| Remove column               | Ctrl+Del   |
| Move up                    | Ctrl_U     |
| Move down                  | Ctrl+D     |
| Create new index           | PRIMARY    |
| Add to index               | KEY        |
|                            | UNIQUE     |
|                            | FULLTEXT   |
|                            | SPATIAL    |

### KẾT NẾ - Hình 19.6. Bảng chọn để khai báo khoá chinh

cần phải làm gì trong trường hợp chọn nhầm trường chẳng hạn 1G làm khoá chính, chọn nhẩm trường tenNhacsi như Hình 19.7?

### Unnamed myrusic

- HeidisQL Portable 1200.6463
- Tạp tin Chnn: ủa Tim kiến Tuyvấn Cảc côn9 Đến Tro giúp
- KAQ@
- Bc lcc bén
- Mjy cnủ: 127.0.2.1
- Cd sở dừ lieu: mymusic
- ~atle: [Lnzited] Tuy vấn?

| Unramcd | Basic | Tùv chọn | Indexes (1) | 'creicnkeys {0} | Check constrzirts | |
|---------|-------|----------|-------------|------------------|-------------------|---|
| wymusic | Théuruci | X'c | PRIMARY KEY | Tpe/ Length | Alqorithn | |
|         | Dọr dẹj | Dowr | | | | |
|         | Cệt; | Thêm mới | Kéa | Dowr | | |
|         | dữliệr | length/Sf" | Insgn__ | 4Irw NlJI / Jerof || Nặr mịnh |
| idNhaczi | INT | | | | {UTO_IRCREMENT] | |
| tcnNhacsi | VARCIIAR | 255 | | | | |

### Trợ giúp

- Fỉrk
- Regular exfrezsicn
- 436: Abstroct Error Messjoe Chor(cje 8s7:514
- Conrected MariaDB 10.6.4
- Uptime: dry:0-.01
- Server -ime Idle.

### Hình 19.7. Minhhoạ khai báo nhầm khoá chính

93</t>



# Để sửa khoá chinh đã khai báo nhầm

C.irh ?úa Tirn kiarn 0y Tv yiu: 0 x này; hãy nháy đúp chuột vào ô tenNhacsi Uonamed 4-h?n 1herk c-nfra nF()

Ở dưới PRIMARY Mvmu: € Ibemngi YP=/ _eIqU1

Dự" J;p PRIYARYREY PRGI~RY KEY ở phầntrên và chọn lại idNhacsi

(Hình 19.8):
```
idNhac:           Jsla Lars llvsel Unasil   KlvwIULL      Mlac dir |
```
| tcnNhacs | VARCHAR |
|----------|---------|
| Fúv bu   |         |

Hình 19.8. Thao tác sửa khoá chinh

Sau đó nháy chuột vào ô bên cạnh dưới ô PRIMARY (Hình 19.9)

```
mymuslc
```
| Themn-gi | Dcn d:p | VC |
|----------|---------|----|
| Hh00     | Xp Tablz: 'Lntit edl | Yshan |
| 1-TAgn {?( | Euui | "RIYRRY KEY    PR MIARY |
| N-as     |         |    |

Hình 19.9. Kết quả chỉnh sửa khoá chính

c) Lưu kết quả Jnnjm-d;Tynuac n J2si; HadiSQL Porazlc 60646?

Cuối cùng chọn T(F: n Chink suz Tm jỜm Inoeven Cac{anc nen qiứP

Lưu để lưu lại khai báo bảng nhacsi. Ugnsmeo 16,oKB 34 ! Tav ~hun In:Ccs Fjrey

vùng hiển thị phía trái Mymlskc 0KB Thémn moi

```
idNhacsi
```
| tenlh | Jc:   | VAFCFAR |
|-------|-------|---------|

Hình 19.10. Kết quả tạo lập bảng

LUYỆN TẬP
- Khai báo tạo lập bảng casi như thiết kế ở Bài 18.

VẬN DỤNG
- Hãy lập CSDL quản lí tên các Quận/Huyện, Tỉnh/Thành phố của Việt Nam. Tạo bảng Tỉnh/Thành phố.
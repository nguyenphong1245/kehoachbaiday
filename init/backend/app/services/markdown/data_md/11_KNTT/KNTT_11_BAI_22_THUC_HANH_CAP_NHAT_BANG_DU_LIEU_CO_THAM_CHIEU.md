# BÀI 22 THỰC HÀNH CÂP NHẬT
## BẢNG DỮ LIỆU CÓ THAM CHIÊU

### SAU BÀI HỌC NÀY EM SẼ:
- Hiểu được cách nhập dữ liệu đối với các bảng có trường khoá ngoài - trường tham chiếu đến một khoá chính của bảng khác.
- Khi cập nhật một bảng có khoá ngoài, dữ liệu của trường khoá ngoài là dữ liệu tham chiếu đến một trường khoá chính của một bảng phải tham chiếu.

### HeidiSQL hỗ trợ kiểm soát điều này như thế nào?

#### Nhiệm vụ 1. Cập nhật bảng bannhac
**Hướng dẫn:**
a) Thêm mới dữ liệu vào bảng bannhac

- Chọn bảng bannhac; nháy chuột chọn thẻ Dữ liệu; em sẽ thấy bảng dữ liệu có các trường idBannhac, tenBannhac, idNhacsi nhưng chưa có dữ liệu.

```
Unnamed mymusic bannhac          HeidiSQL Pcrtable 12.0.0.6468
Tập tin Chỉnh sửa Tim kiẽm       Truy vãn Cac công cy Đến Trc
gIúp
HA           X
mymus           Bclọc bản                Máy chú: 127.0.0,1                      Ca sở dữ liệu: mymusic
Unna.                                    Table: bannhac           Dữ liệu               Truy vấn*
my          128,0 KiB            thy tat ca        Sấp xếp    Columns (3/3)     Lcc
ba.n         48,0 KiB    idBannhac  tenBannhac                 on idNhacsi
ba .         48,0 KiB
casi         16,0 KiB    Bọloc Regular expression
1LKiB
```
**Hình 22.1. Giao diện thêm mới dữ liệu.**

### Thực hiện nhập dữ liệu
- Trường idNhacsi có kiểu INT, AUTO_INCREMENT nên không cần nhập dữ liệu cho trường này: Nháy đúp chuột vào ô ở trường tenBannhac để nhập tên bản nhạc.

```
Unnamed mymusic bannhac{
Tập tin Chỉnh sửa Tim kiẽm

nynus           BỆ lọc ba
Unnamed
mymusic   128,0 KiB
bann;      48,0 KiB
banth      48,0 KiB
casi       16,0 KiB
nhacsi     16,0 KiB
HeidiSQL Pcrtable 12.0.0.6468
Truy vấn Cac công cy Đến Trc giủp
KAo        X
Máy chủ: 127,0.0.1                      Ca sà dữ liệu: rymusic
Table: bannhac               Dữ liệu           Truy vẳn*
Hien thi tat ca           Sắp xẽp    Cclumns {3/3)     Loc
idBannhac  tenBannhac                                 idNhacsi
(NULL) Du kich sóng Thao

Bộ lcc Regular expression
```

**Hình 22.2. Minh hoạ thao tác nhập dữ liệu**



# Trường idNhacsi

Trường `idNhacsi` là trường khoá ngoài, đã được khai báo tham chiếu đến trường `idNhacsi` của bảng `nhacsi`; vì vậy để đảm bảo tính nhất quán, giá trị hợp lệ chỉ có thể lấy từ các giá trị của `idNhacsi` có trong bảng `nhacsi`. Nháy đúp chuột vào ô nhập trường `idNhacsi` và chọn tên nhạc sĩ trong hộp danh sách.

```
Unnamed  mymusic bannhac'          HeidiSQL Portable 12,0.0.6468
Tạp tin Chỉnh sửa    Tìm kiếm      Truy vấn   Các công cụ      Đến         Trợ giúp
KMo0 &#x3C; X
Bệ lcc cos       Bệ lcc ban                   Máy chủ: 127,0.0.1                   Cơ sở dữ liệu: mymusic
Table: bannhac                Dữ liệu               Truy -
Unnamed                                                                                                Yen'
Inforna                    lien + ! tất cả     Sắp xếp             Columns (3/3)         Lcc
mymusic      128           dBznnhac            tenBannhac                               idNhacsi
Jann.       49,0 KiB                          Du kích sông Fhao
banth .     42,0 KiB                                                                    Hoàng Việt
casi        16,0 KiB                                                                    Nguyễn Tà
nhacsi      16,U KIB      Bộ lọc Regular expression                                    5: Nguyễn Văn
Phan Huỳnh
SELECT       idNhacsi      LEFT( tenNhacsi, 256) FROM          mymusic    nne        Phan Nhân
2: Vin Cac
Conne(     MariaDB 10.6 Uptime: 14 days         Server t      Đề Nhuên
```

**Hình 22.3. Nhập dữ liệu cho trường khoá ngoài**

## b) Sửa chữa, cập nhật dữ liệu trong bảng bannhac

Thao tác sửa chữa dữ liệu trong bảng `bannhac` nếu phát hiện có sai sót, tương tự như đã được giới thiệu ở Bài 21, chỉ cần nháy đúp chuột vào ô dữ liệu muốn sửa.

Sửa dữ liệu trường `idNhacsi` ở dòng số 2.

```
Unnamedimymusic bannhac} - HeidiSQL Portable 12.0.0.6468
Tạp tin Chỉnh sửa    Tìm kiếm      Truy vấn    Các công cụ           Đến        Trợ giúp
KM 0 0                Xy
Bệ lcc cc             Bệ lcc bản                      Máy chủ: 127,0,0.1            Cơ sở dữ liệu: mymusic
Unnamed                             Table: bannhac               Dữ liệu               Truy vấn*
informa                  1 thì tất cả             Sắp xếp (1)    Columns (3/3)        Lcc
mymusic      128,0 KiB     idBannhac            eobanghac                              idNhacsi
bann        48 0 KiB                           Du Kich song Thao
banth       48,0 KiB      GuG                                     s0! G
Trường ca                              2: Văn Cac
casi                                           Tinn ca                       [3: Hằng Việt
nhacsi      16 0 KiB                                  vhci                            Nguyễn Tà
Bệ lcc Regular expression                         5; Nguyễn Văn
Phan Huỳnh
SELECT    idNhacsi]     LEFT( tenNhacsi, 256) FROM        tytusic             Phan Nhán
Văn Caa
Nhuận
Conne'     MariaDB 10.{ Uptime: 14 days         Server 1: Đ8
```

**Hình 22.4. Giao diện sửa dữ liệu**

## c) Xoá dữ liệu trong bảng bannhac

Thực hiện tương tự các bước ở Bài 21 để xoá các dòng dữ liệu trong `bannhac`.

## d) Xoá dữ liệu trong bảng nhacsi

Chú ý rằng bây giờ bảng `bannhac` đã có dữ liệu với trường `idNhacsi` tham chiếu đến trường `idNhacsi` của bảng `nhacsi`. Do vậy, ta sẽ không thể tùy tiện xoá các dòng của bảng `nhacsi`. MySQL sẽ kiểm tra và ngăn chặn việc xoá các dòng trong bảng `nhacsi` mà giá trị trường `idNhacsi` đã có trong trường `idNhacsi` của bảng `bannhac`.



# Ví dụ:

idNhacsi của nhạc sĩ Văn Cao là 2 đã có trong các bản nhạc Trường ca sông Lô, Tiến về Hà Nội ở bảng bannhac. MySQL sẽ ngăn chặn xoá dòng tương ứng với nhạc sĩ Văn Cao ở bảng nhacsi.

## Unnamed nuymusic bannhac - FerdiSCL Poitable Z.00.6425

- Tập tin: Chỉnh sửa
- Tìm kiếm
- Truy vấn
- Đến Trợ giúp

```
Bệ lọc có           Bệ lọc bản                Máy chủ: 127.0.0.1                  Cơ sở dữ liệu: mymusic
Unnamed                              Table: bannhac           Dữ liệu              Truy vấn*
infcrma                          Hiện thị tất cả   Sắp xếp (1)                Columns (3/3)  Lọc
mymusic          128.0 KiB        idBannhac     tenBannhac                 idNhacsi
oann,              48.0 KiB                      Du kích sông Thao
canth.            48.0 KiB                      Trường ca Sông Lô
2a51                Unnamed: Confirm
hacsi
```

### [Delete row(s)?]

```
Xóa hàng (nhiều hàm 2 : c2)
```

#### Hình 22.5. Minh họa xóa dữ liệu có tham chiếu

Nếu chọn OK, thông báo lỗi sẽ xuất hiện như:

```
Hình 22.6
Su Frrr(1251: annnt delete nrualate Farertrou:
fcreign key corsraint fzils (mymusic bannhac
CONS-FAINT FK banrfac rracsi FOREIGN KEY
CidN-acsi  REFERENCES Tfiacsi idNhacsi) ON DELETE
NO ACTION ON UPDATE NO ACTION
```

#### Hình 22.6. Thông báo lỗi

Xóa dữ liệu làm mất tính toàn vẹn dữ liệu.

Lưu: Hệ QTCSDL chỉ có thể ngăn chặn được các lỗi logic đã được khai báo (ví dụ logic tham chiếu khoá ngoài). Nó không thể ngăn chặn được các lỗi không liên quan đến logic nào: Ví dụ: Chọn tên nhạc sĩ sáng tác bản nhạc Hà Nội niềm tin và hi vọng là Phan Nhân hay Đỗ Nhuận thì không sai về logic; nếu các em nhập sai tên bản nhạc, tên người (tên nhạc sĩ, ca sĩ) thì lỗi này sẽ xuất hiện ở tất cả các danh sách kết xuất liên quan như bản nhạc, bản thu âm. Vì vậy người làm việc với CSDL luôn phải có sự cẩn thận, mẫn cán trong công việc của mình.

## Truy xuất dữ liệu trong bảng bannhac

Việc truy xuất dữ liệu trong bảng bannhac là hoàn toàn tương tự như truy xuất dữ liệu trong bảng nhacsi ở Bài 21.

- Hãy thực hành các truy xuất dữ liệu theo thứ tự giảm dần của trường idBannhac;
- Theo thứ tự tên các bản nhạc.
- Hãy thực hành lấy ra danh sách tên các bản nhạc của nhạc sĩ Văn Cao có trong bảng bannhac.

### Nhiệm vụ 2

Hãy tìm hiểu một chức năng của phần mềm ứng dụng Quản lý dữ liệu âm nhạc những kiến thức vừa được học trong bài thực qua giao diện ở Hình 22.7, so sánh với hành và cho nhận xét so sánh.



# Mhecr G: [errhe:ér Su ám oaclt
## CUin UnNI
### nhanrh;: Fvng
### Nul;

#### D Hhu{r
#### ilanf Ve:
##### Jettaaque 0; Nhusr
##### Nhac nc Hoanc YIe:

----

**Hình 22.7. Giao diện Quản lí danh sách các bản nhạc**

Cách tương tác với giao diện này như sau:

- Để nhập dữ liệu bản nhạc mới, người dùng phải nhập tên bản nhạc; chọn nhạc sĩ từ hộp danh sách phía dưới sau đó chọn Nhập. Ví dụ nhập 'Hà Nội niềm tin và hi vọng' chọn nhạc sĩ Phan Nhân và nháy chuột chọn Nhập.

- Để tìm một bản nhạc có thể nhập vài từ của tên bản nhạc, cũng có thể chọn nhạc sĩ nếu biết; sau đó nháy chuột chọn Tìm.

- Danh sách các bản nhạc đã có trong CSDL được thể hiện ở bảng phía dưới thành nhiều trang, mỗi trang 10 dòng. Có thể nháy chuột vào hộp danh sách trang để chọn trang.

- Muốn sửa một bản nhạc nào đó, nháy chuột vào phím radio trên dòng đó; thông tin của bản nhạc sẽ được hiển thị ở phần phía trên của giao diện để người dùng sửa chữa, thay đổi. Nháy chuột chọn Nhập để lưu lại kết quả thay đổi.

- Muốn xoá một hay nhiều bản nhạc nào đó trong danh sách đã có: nháy chuột vào các checkbox ở đầu các dòng tương ứng và chọn Xoá.

----

### Hướng dẫn: Tk M70

Ứng dụng Quản lí dữ liệu âm nhạc nói trên là một ứng dụng được thiết kế chuyên biệt cho bài toán quản lí dữ liệu âm nhạc; giao diện được thiết kế hướng vào những nghiệp vụ mà người quản lý thường phải làm hàng ngày (không phải là giao diện hướng vào từng bảng dữ liệu). Tất cả các chức năng nhập mới, sửa chữa, xoá, tìm kiếm được tích hợp vào một giao diện.

Theo các em:
- Người sử dụng có cần biết, nhớ cấu trúc của bảng bản nhạc, bảng nhạc sĩ không?
- Giao diện trên có dễ hiểu, dễ sử dụng không?

----

## LUYỆN TẬP
1. Cập nhật dữ liệu vào bảng bản thu âm.
2. Truy xuất dữ liệu bảng bản thu âm theo các tiêu chí khác nhau.

## VẬN DỤNG
Hãy thực hành cập nhật và truy xuất bảng Quận/Huyện trong CSDL quản lí danh sách tên các Quận/Huyện; Tỉnh/Thành phố.
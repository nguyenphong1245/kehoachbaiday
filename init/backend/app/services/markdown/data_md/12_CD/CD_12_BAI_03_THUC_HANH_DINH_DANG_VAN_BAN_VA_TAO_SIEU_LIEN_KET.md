# BÀI THỰC HÀNH ĐỊNH DẠNG VĂN BẢN VÀ TẠO SIÊU LIÊN KẾT

Học xong bài này; em sẽ:
- Tạo được trang web đơn giản với các đoạn văn bản và các tiêu đề mục.
- Làm nổi bật được nội dung văn bản trên màn hình trình duyệt web.
- Tạo được siêu liên kết.

## Nhiệm vụ 1. Tạo tiêu đề mục cho trang web giới thiệu về bản thân

**Yêu cầu:** Soạn thảo nội dung trang web giới thiệu bản thân và lưu tệp văn bản HTML với tên `Bai3-NVI.html`. Màn hình trình duyệt web cần hiển thị:
- Tiêu đề trang web là: **Trang web cá nhân**.
- Dòng đầu tiên viết nội dung: **Trang web cá nhân của [Tên của em]** được trình bày với tiêu đề mục **Heading 1**. Ví dụ: Trang web cá nhân của Thanh Uyên.
- Các dòng tiếp theo là tiêu đề mục **Heading 2** với các mục **Thông tin cá nhân**, **Sở thích**, mỗi mục viết trên một dòng.

Hình 1 minh hoạ các tiêu đề mục trong trang web cá nhân của bạn Thanh Uyên được hiển thị trên màn hình trình duyệt web Google Chrome.

```

# Trang web cá nhân của Thanh Uyên

# Trang web cá nhân của Thanh Uyên

# Thông tin cá nhân

# Sở thích

```

**Hình 1.** Các tiêu đề mục trong trang web cá nhân của bạn Thanh Uyên.

## Hướng dẫn thực hiện:

### Bước 1: Tạo tệp `Bai3-NVI.html`
- Mở phần mềm **Sublime Text**.
- Mở tệp mới bằng cách chọn **File > New File**.
- Lưu tệp với tên là `Bai3-NVI.html` và thực hiện soạn thảo.

### Bước 2: Tạo cấu trúc và khai báo phần tử head cho tệp `Bai3-NVI.html`
- Dòng đầu tiên soạn `` để khai báo sử dụng phiên bản HTML5.
- Khai báo phần tử html bằng cặp thẻ: ` ... `.
- Trong nội dung phần tử html:
+ Khai báo phần tử head bằng cặp thẻ: ` ... `.
+ Khai báo phần tử body bằng cặp thẻ: ` ... `.



  Trong nội dungphầntử head:
  Khai báo tiêu đề trang webbằng phầntử title                                      tiếng]
   Thiết lập thuộc tính charset củaphẩntử meta để hiển thị dúng                          Việt trên
trinh duyệtbằngkhai báo meta charset=           ">
                                            'utf-8
 Bước 3. Soạn nộidungphầnᵗᵘbody cho tệp Bai3-NVIhtml"
   Sửdụngphầntử hl để trìnhbàytiêu đề mụcHeading 1
   Sửdungphầntử h2 để trìnhbày tiêu đề mụcHeading 2.
 Bước 4. Ghi lưu, mở tệpbằngtrình duyệt web và xem kết
                                                             qua.
 Lưu ý: Để thêm chú thích vào văn bản HTML, em viết chú thích trong cặp thẻ
  và -> . Các chú thích sẽkhônghiển thị trên trinh duyệt web
Nhiệm vụ 2. Làm nổi bật nội dung cho trang web           thiệu về bản thân
                                                giới =
  Yêu cầu:
  1) Soạn nộidungchi tiết cho mỗi mục đã có tiêu đề trong trang web giới thiệu bản
thân ở tệp Bai3-NVI.html'               thông
   MụcThông tin cá nhân cần có các           tin:Họ vàtên,Sinh năm, Quê
                                                                                         quán
                                                                                   phẩm
  Mục Sở thích, nêu các sở thích của mình (ví dụ, Đọc sách: Các tác                      của nhà
vănNguyễnNhật Ánh; Thể thao: Chơibóng chuyền, Chơi cầulông).
 2) Trình bày trang web như sau:             bày             dạng
   Các nộidungtrongtừng mục được trình            dưới       các doan văn bản .
   Nộidung trongmục Sở thích được in nghiêng (Hình 2)
Hướng dẫn thực hiện:
 Bước 1.Mở tệp  Bai3-NVlhtml        ghi                    tc 8ai3 Nvahimi
Iưu tệp với tên mới là Bai3-NV2.html'7       Trangweb cá nhân của Thanh Uyên
         Bước 2 Cập nhật nội dung phẩntử    Thông tin cá nhân
body cho tệp Bai3-NV2 html7
         Chèn dòng mới vào sau dòng khai     Ho vầ tên Nguyen Thanh Uvên
báo tiêu dề mục Thông tin cá nhân            Sinh nán: 2007
sửdụngphầntử p để tạo doạn văn ghi           Quê quán: Hà Nội
nội dung Họ và tên: <Tên của em              Sở thích                     Ngìrẻn Nhụt anh
Sinh năm:   <Năm sinh của em                 Đoc sach: Cảc tàc phàm cia nhà vản
                                            Thê thao; ( hơỉ bongchnvenChvi cẩu long
~Quê quán: Quêquáncủa em                    Hình 2. Trang web cá nhân của ban Thanh Uyên
  Chèn dòng mới vào sau dòng khai báo
tiêu đề mục Sở thích tuong tự như trên
 Bước 3. Làm nổi bật nộidungtrang web.
 Trong nội dung phầntử body: Kếthợp          dụng                                  tử em để in
                                            sử           phẩntử p vàphần
nghiêng các nộidung cụ thể như minh hoạ trong Hình 2.
 Bước 4. Ghi lưu, mở tệpbằngtrình duyệt web và xem kết
                                                                 quả.

                                                                                         Bản in thử



Quê quán: Hà Nội
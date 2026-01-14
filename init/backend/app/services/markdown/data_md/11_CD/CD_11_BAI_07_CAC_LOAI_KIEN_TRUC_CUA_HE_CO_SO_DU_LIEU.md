# BÀI: CÁC LOẠI KIẾN TRÚC CỦA HỆ CƠ SỞ DỮ LIỆU

Học xong bài này, em sẽ:
- Phân biệt được CSDL tập trung và CSDL phân tán.
- Biết được một số kiến trúc thường gặp của hai loại hệ CSDL tập trung và hệ CSDL phân tán.

Theo em, CSDL của trường em được đặt trong một máy tính hay trong tất cả các máy tính có sử dụng CSDL đó? CSDL của một ngân hàng được đặt trong một máy tính hay nhiều máy tính?

## Cơ sở dữ liệu tập trung và cơ sở dữ liệu phân tán

### a) Cơ sở dữ liệu tập trung

Một CSDL tập trung được lưu trữ trong một máy tính (Hình 1). Việc quản lý, cập nhật được thực hiện tại chính vị trí này. Tùy thuộc vào trường hợp, người dùng có thể truy cập và khai thác thông tin bằng chính máy tính chứa CSDL hay thông qua kết nối mạng (Internet, LAN, WAN).

| Kết nối | CSDL |
|---------|------|
| Kết nối mạng | CSDL |
| Kết nối trực tiếp | CSDL |

Hình 1. Hệ cơ sở dữ liệu tập trung

Vì tất cả dữ liệu được lưu trữ tại một máy tính duy nhất nên việc truy cập và điều khiển dữ liệu dễ dàng hơn. Đây là một ưu điểm lớn. Bởi vậy, phần lớn các cơ quan, doanh nghiệp, tổ chức dùng hệ CSDL tập trung. Hệ thống học sinh của trường em là một hệ CSDL tập trung cỡ nhỏ. Hệ thống bàn vẽ lâu hoa của Tổng công ty Đường sắt Việt Nam cũng là một ví dụ về hệ CSDL tập trung.

Tuy nhiên, hệ CSDL tập trung cũng có những hạn chế. Trong quá trình khai thác, nếu CSDL tập trung gặp cố thì các chương trình ứng dụng CSDL không thể chạy được.



# Cơ sở dữ liệu phản tán

Theo em, các hệ thống thư điện tử trên Internet có thể sử dụng hệ CSDL tập trung không? Vì sao?

Một CSDL phân tán (Hình 2) là một tập hợp dữ liệu được lưu trữ tán trên các máy tính khác nhau của một mạng máy tính (mỗi máy tính như vậy được gọi là một site hay một trạm của mạng). Mỗi nơi (site) của mạng máy tính có khả năng xử lý độc lập và thực hiện các ứng dụng cục bộ. Mỗi trạm thực hiện ít nhất một ứng dụng cục bộ, tức là chỉ sử dụng CSDL cục bộ để cho ra kết quả. Khả năng thực hiện ứng dụng cục bộ được gọi là xử lý độc lập.

Mỗi trạm phải tham gia thực hiện ít nhất một ứng dụng toàn cục, yêu cầu truy xuất dữ liệu tại nhiều nơi bằng cách dùng hệ thống truyền thông con.

## Ví dụ
Một ngân hàng có nhiều chi nhánh, mỗi thành phố có một chi nhánh.

- Mỗi chi nhánh có dữ liệu quản lý các tài khoản của dân cư và đơn vị đăng ký kinh doanh tại thành phố đó.
- Thông qua mạng truyền thông, tập hợp dữ liệu của ngân hàng này tại các chi nhánh tạo thành một hệ CSDL phân tán.
- Người chủ của một tài khoản có thể thực hiện các giao dịch (chẳng hạn rút một khoản tiền trong tài khoản) tại một chi nhánh nào đó (ví dụ ở Hà Nội) nhưng cũng có thể thực hiện giao dịch ở một chi nhánh khác (ví dụ ở Đà Nẵng).

Hình 2: Hệ cơ sở dữ liệu phân tán

## Ví dụ 2
Hệ thống tìm kiếm Google có hệ CSDL phân tán. Mỗi crawler có thể được thực hiện bởi hàng trăm máy tính thu thập dữ liệu web và trả về các kết quả có liên quan.



# Đổi Vệ I

Google dường như là một hệ thống - nhưng nó thực sự là nhiều người máy tính làm việc cùng nhau và truy xuất dữ liệu lại như một trạm để hoàn thành một nhiệm vụ nhất (trả lại kết quả cho truy vấn tìm kiếm).

So với hệ CSDL tập trung, hệ CSDL phân tán có một số ưu điểm chính:

- Phân tán dữ liệu về mặt vật lý, phù hợp với các tổ chức, doanh nghiệp lớn hoạt động rộng rãi về mặt địa lý.
- Tính sẵn sàng và tính tin cậy của dữ liệu cao hơn. Tính sẵn sàng phục vụ cao là những dữ liệu được đơn vị nào sử dụng nhiều nhất sẽ được lưu trữ và quản lý tại đơn vị đó. Thêm nữa, khi có sự cố không truy cập được dữ liệu tại một trạm thì vẫn có thể khai thác bản sao của dữ liệu đặt tại một trạm khác. Cũng như vậy, về tính tin cậy, khi một trạm gặp sự cố, có thể khôi phục được dữ liệu tại đây do có bản sao của nó được lưu trữ và vận hành tại một vài trạm khác nữa.
- Mở rộng các tổ chức một cách linh hoạt. Có thể thêm trạm mới vào mạng máy tính mà không ảnh hưởng đến hoạt động của các trạm sẵn có.

Tuy nhiên, hệ CSDL phân tán có một số hạn chế so với hệ CSDL tập trung:

- Chi phí cao hơn do hệ thống phức tạp hơn, hệ thống phải làm ẩn đi sự phân tán dữ liệu đối với người dùng.
- Khó khăn hơn trong đảm bảo tính nhất quán dữ liệu và tính an ninh, rất khó cung cấp một cái nhìn thống nhất cho người dùng về dữ liệu đặt tại nhiều địa điểm khác nhau.

## Các loại kiến trúc của các hệ cơ sở dữ liệu

Mỗi hệ CSDL bao gồm 3 lớp:

1. Lớp CSDL.
2. Lớp hệ quản trị CSDL.
3. Lớp ứng dụng CSDL.

Nói về kiến trúc của một hệ CSDL là muốn nhìn hệ thống đó dưới cách phân chia thành các thành phần chức năng để có thể hiểu và chỉnh sửa, thay thế mỗi thành phần đó một cách khá độc lập. Dưới đây giới thiệu sơ lược một số kiến trúc biến phổ của hai loại hệ CSDL tập trung và hệ CSDL phân tán.

### Kiến trúc phổ biến của hệ CSDL tập trung

Nhìn chung các hệ CSDL tập trung theo kiến trúc khách - chủ (Client - Server) các thành phần của hệ quản trị CSDL gồm thành phần yêu cầu tài nguyên (dữ liệu) và...



# Tài Nguyên và Kiến Trúc Hệ CSDL

## 1. Cung Cấp Tài Nguyên

Cung cấp tài nguyên (dữ liệu) không nhất thiết phải cài đặt trên cùng một máy tính. Tài nguyên có thể được cung cấp từ một máy chủ (server). Các yêu cầu tài nguyên có thể cài đặt tại nhiều máy khác trên mạng gọi là máy khách (client).

## 2. Kiến Trúc 1 Tầng (1-Tier Architecture)

Kiến trúc 1 tầng là kiến trúc đơn giản nhất, toàn bộ CSDL được lưu trữ tại một máy tính và cũng chỉ được khai thác tại máy tính này. Máy tính như vậy vừa là máy chủ CSDL vừa là máy khách duy nhất khai thác CSDL.

Tuy nhiên, kiến trúc đơn giản này không hợp lý cho các ứng dụng phức tạp.

## 3. Kiến Trúc 2 Tầng (2-Tier Architecture)

Kiến trúc 2 tầng là kiến trúc có CSDL được lưu trữ ở một máy chủ trên mạng (được xem là tầng 2). Thành phần trình bày dữ liệu cho người khai thác được cài đặt trên máy khách kết nối được với mạng (được xem là tầng 1).

Máy khách có thể là PC, máy tính bảng hoặc điện thoại di động. Tuy nhiên, hiệu suất hoạt động của hệ thống này sẽ kém trong trường hợp có nhiều máy khách cùng khai thác CSDL.

### Hình: Mô hình Khách - Chủ

| Tầng | Thành phần |
|------|------------|
| Tầng 1 | Máy khách |
| Tầng 2 | Máy chủ CSDL |

## 4. Kiến Trúc 3 Tầng (3-Tier Architecture)

Kiến trúc 3 tầng là kiến trúc mở rộng của kiến trúc 2. Tầng 2 vẫn là thành phần trình bày dữ liệu. Tầng 3 là máy chủ chứa CSDL. Tầng 2 nằm giữa máy chủ và máy khách, hoạt động như một phương tiện để trao đổi dữ liệu đã được xử lý một phần giữa máy chủ và máy khách.

Tầng trung gian này chứa các chương trình ứng dụng thường xử lý các vấn đề nghiệp vụ trước khi chuyên dữ liệu qua lại giữa các tầng. Kiến trúc này thường được sử dụng trong trường hợp các ứng dụng web lớn.

## 5. Các Kiến Trúc Phổ Biến của Hệ CSDL Phân Tán

Hệ CSDL phân tán có một số mô hình kiến trúc phổ biến:

- Mô hình ngang hàng (peer-to-peer)
- Mô hình khách - chủ cho hệ CSDL phân tán

### Kiến Trúc Ngang Hàng

Kiến trúc ngang hàng cho hệ CSDL phân tán có mỗi máy tính hoạt động như một máy khách và máy chủ để cung cấp các dịch vụ CSDL. Các máy tính ngang hàng truyền thông với nhau trong khả năng chia sẻ tài nguyên dữ liệu của nó với các máy khác và cũng là nguồn động ngang hàng trong khả năng điều phối các hoạt động.



# Kiến trúc khách chủ cho hệ CSDL

Kiến trúc khách chủ cũng là kiến trúc khách chủ như đã biết, nhưng khác với ở hệ CSDL tập trung, hệ CSDL phân tán có nhiều máy chủ CSDL (Hình 4).

```
Máy khách            Máy khách

Mạng truyền thông
Máy chủ    Máy chủ M

CSDL       CSDL I
```
**Hình 4:** Mô hình khách chủ của CSDL phân tán

Hãy nêu đặc điểm quan trọng nhất để phân biệt một hệ CSDL tập trung với một hệ CSDL phân tán.

Dựa vào quy mô và đặc điểm tổ chức của mình mà các doanh nghiệp lựa chọn cho mình loại hệ CSDL (tập trung hay phân tán) và mô hình kiến trúc phù hợp. Em hãy giải thích và lấy vài ví dụ để minh họa.

Trong các câu sau đây, những câu nào đúng?
1. CSDL luôn chỉ được lưu trữ và khai thác tại một máy tính.
2. Trong hệ CSDL tập trung, việc quản lý và cập nhật dữ liệu dễ hơn so với hệ CSDL phân tán.
3. Trong tất cả các hệ CSDL, nếu có sự cố truy cập được một máy chủ CSDL thì toàn bộ hệ thống CSDL đó ngừng hoạt động.
4. Một hệ CSDL phân tán đắt hơn so với một hệ CSDL tập trung vì nó phức tạp hơn nhiều.

## Tóm tắt bài học

Điểm khác biệt quan trọng giữa CSDL tập trung và CSDL phân tán là: CSDL tập trung có toàn bộ dữ liệu được lưu trữ trên một máy tính, trong khi đó CSDL phân tán có dữ liệu phân tán trên các máy tính khác nhau của một mạng máy tính và mỗi máy tính khai thác CSDL đều tham gia ít nhất một ứng dụng toàn cục.

Kiến trúc khách chủ là kiến trúc phổ biến của các hệ CSDL tập trung; tùy theo ứng dụng mà có kiến trúc theo mô hình tầng, 2 tầng hay nhiều tầng hơn. Có vài loại mô hình kiến trúc phổ biến của các hệ CSDL phân tán: khách chủ (cho CSDL phân tán), ngang hàng.
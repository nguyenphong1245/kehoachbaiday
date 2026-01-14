# CHỦ ĐỀ FICT VỚI SỰ TRỢ GIÚP GOA MY TINH
## THỰC HÀNH 14@ VÀ KHAI THÁC G@ SỞ DỮ LIỆU

### BÀI 1: LÀM QUEN VỚI MICROSOFT ACCESS

Học xong bài này, em sẽ:
- Biết được một số đặc điểm của phần mềm hệ quản trị cơ sở dữ liệu quan hệ Microsoft Access và một số thành phần chính trong cửa sổ làm việc của nó.
- Biết được một số kiểu dữ liệu trường của các bản ghi trong Microsoft Access và cách thiết lập kiểu dữ liệu trường.
- Tạo lập được một cơ sở dữ liệu đơn giản từ khuôn mẫu Microsoft Access cho trước và biết cách nhập dữ liệu vào một bảng.

Một doanh nghiệp nhỏ cần quản lí kho hàng bằng máy tính. Theo em, nên chọn dùng phần mềm ứng dụng nào? Tại sao?

### Giới thiệu Microsoft Access
Microsoft Access (gọi tắt là Access) là phần mềm hệ quản trị CSDL phù hợp với các cơ quan, doanh nghiệp nhỏ hay người dùng cá nhân. Cửa sổ làm việc của Access có giao diện tương tự như Word, Excel và cũng áp dụng các khái niệm, cách tổ chức những ứng dụng trong bộ phần mềm văn phòng Microsoft Office.

Hình 1 minh hoạ các thành phần chính trong một cửa sổ làm việc của phiên bản Microsoft Access 365.

#### a) Vùng nút lệnh
Phía trên cùng là vùng nút lệnh gồm nhiều dải lệnh nằm đè lên nhau. Các thẻ (tab) để mở các dải lệnh: File, Home, Create, External Data, Database Tools. Trong Hình 1 là dải lệnh Home hay dùng nhất với các nhóm lệnh: Views, Clipboard, Sort &#x26; Filter, Records.

Thay đổi các thành phần trong vùng nút lệnh tùy theo ta đang làm việc với đối tượng cụ thể nào ở trong vùng làm việc. Vùng nút lệnh hiển thị sẵn sàng các nút lệnh thường dùng vào lúc ấy.



# Vùng nút lệnh và Vùng làm việc

## 1. Vùng điều hướng
Vùng điều hướng hiển thị các đối tượng trong một CSDL. Mỗi đối tượng được thể hiện dưới dạng một biểu tượng kèm với tên của nó. Ví dụ:
- **Bảng**:
- **Truy vấn**:
- **Biểu mẫu**:
- **Báo cáo**:

## 2. Vùng làm việc
Nháy đúp chuột vào biểu tượng của đối tượng trong vùng điều hướng sẽ làm hiển thị nội dung của đối tượng đó trong vùng làm việc. Có thể mở đồng thời nhiều đối tượng trong vùng làm việc. Mỗi đối tượng sẽ có một thẻ ở bên trên cho thấy tên của nó. Nháy chuột chọn thẻ sẽ làm hiển thị nội dung của đối tượng đã chọn. Để đóng đối tượng, nháy chuột vào dấu **X** trên bên phải màn hình.

## Nhận xét và quy ước chung:
Thường có vài cách thao tác khác nhau để đạt được cùng một kết quả. Cách được coi là "chính thống" khi mới làm quen với phần mềm là bắt đầu từ một nút lệnh trong một dải lệnh ở vùng làm việc dẫn thao tác sẽ viết ngắn gọn cho dễ nhớ. Ví dụ: viết

### Quy ước:
- `CreateTable` nghĩa là "nháy chuột vào thẻ Create sẽ thấy nút lệnh Table và tiếp tục nháy chuột chọn Table".

### Thao tác nhanh:
Khi đã quen dùng, nên ưu tiên chuột phải và sử dụng chọn nội lên (context menu). Ở đây có các lựa chọn thích hợp với bối cảnh lúc đó, rất tiện chọn lệnh tiếp theo.

----

## Hình 1. Một cửa sổ làm việc của Access

| Tên đối tượng | Hành động |
|---------------|-----------|
| Bảng          | Nháy đúp  |
| Truy vấn       | Nháy đúp  |
| Biểu mẫu      | Nháy đúp  |
| Báo cáo       | Nháy đúp  |

----

### Ghi chú:
- Vùng điều hướng có thể thay đổi khung nhìn.
- Các nút lệnh thay đổi theo ngữ cảnh sử dụng.



# Thay đổi khung nhìn

Một đối tượng trong CSDL Access có thể mở dưới các khung nhìn (View) khác nhau. Mỗi khung nhìn phục vụ tốt nhất cho một loại công việc. Để thay đổi khung nhìn cho một đối tượng, có thể thực hiện một trong các cách sau đây:

## Cách 1:
Nháy chuột vào nút lệnh View để hiển thị danh sách chọn nhìn; sau đó chọn khung nhìn thích hợp.

## Cách 2:
Nháy chuột vào các nút lệnh chọn khung nhìn có sẵn ở góc phải dưới của cửa sổ Access (Hình 1).

## Cách 3:
(Dùng bảng chọn nổi lên) Nháy chuột phải lên tên của đối tượng đang mở và chọn khung nhìn thích hợp.

----

# Cơ sở dữ liệu trong Access

Một CSDL Access được lưu trong máy tính thành một tệp có đuôi tên tệp là `.accdb`. Mỗi cửa sổ Access làm việc với một CSDL.

Có thể tạo một CSDL mới trong Access bằng hai cách khác nhau: từ khuôn mẫu cho trước hoặc từ CSDL trống (Blank Database). Đối với CSDL trống, ta phải tự làm tất cả các công việc như: tạo từng bảng theo thiết kế, nhập dữ liệu và xây dựng các biểu mẫu, báo cáo, truy vấn.

Nếu sử dụng khuôn mẫu, Access giúp ta rất nhiều vì đã làm sẵn một số khung bảng, biểu mẫu, báo cáo. Nói "khung" hàm ý chưa có dữ liệu. Chỉ cần nhập dữ liệu là CSDL đã sẵn sàng để sử dụng. Nếu thấy những điểm chưa hoàn toàn phù hợp với nhu cầu sử dụng, có thể chỉnh sửa thiết kế các khung bảng, biểu mẫu, báo cáo theo ý muốn. Access đã làm sẵn khá nhiều khuôn mẫu để lựa chọn.

----

# Tạo mới cơ sở dữ liệu

a) Tạo cơ sở dữ liệu mới từ Blank database

**Bước 1:** Khởi chạy Access, chọn New hoặc từ cửa sổ làm việc của Access, chọn File > New.

**Bước 2:** Nháy chuột chọn Blank desktop database (Hình 2) một cửa sổ Access mở ra.

**Bước 3:** Đổi tên tệp thay cho tên mặc định ở ô File Name và xác định thư mục nơi chứa tệp CSDL. Sau đó nhấn Create.

----

![Hình 2. Tạo CSDL trống](#)

----

**Chú thích:** Hình 2 mô tả quá trình tạo CSDL trống trong Access.



# Tao CSDL từ khuôn mẫu trống

Tao mới một CSDL từ khuôn mẫu chỉ khác tạo CSDL.

## Bước 2
Thay vì chọn Blank desktop database; cần tìm và chọn khuôn mẫu mong muốn trước khi thực hiện.

## Bước 3
Chi tiết Bước 2 như sau:
- Nếu thấy khuôn mẫu mong muốn, nháy chọn nó; một cửa sổ Access sẽ mở, thực hiện tiếp Bước 3 như Mục a.
- Nếu chưa nhìn thấy khuôn mẫu mong muốn trên máy tính của mình, cần tìm kiếm nó bằng cách sử dụng ô tìm kiếm (Search for online templates). Sau đó chọn tải về và mở ra.

## Bảng và các kiểu dữ liệu cột
Có hai khung nhìn bảng là khung nhìn thiết kế (Design View) và khung nhìn bảng dữ liệu (Datasheet View) (Hình 3). Trong khung nhìn bảng dữ liệu, mỗi bản ghi là một hàng trong bảng. Mỗi cột trong bảng là một trường của bản ghi, chứa dữ liệu thuộc một kiểu nào đó. Mỗi kiểu dữ liệu có các thuộc tính nhất định. Cần thiết lập kiểu dữ liệu cho mỗi cột trong bảng phù hợp với thực tế và mục đích sử dụng.

### Hình 3. Khung nhìn thiết kế và khung nhìn bảng dữ liệu

## Hướng dẫn thao tác khám phá trong khung nhìn thiết kế bảng
### a) Các cột trong bảng
Access luôn mặc định thiết kế trường dữ liệu đầu tiên tên là ID và có kiểu dữ liệu là AutoNumber. Access mặc định chọn trường ID là khóa chính của bảng và hiển thị biểu tượng chia khóa tại đầu mút trái cạnh tên trường (Hình 4). Sau này, ta có thể chọn trường khác làm khóa chính, theo đúng thiết kế thay cho trường ID mặc định.

### b) Bảng Students trong khung nhìn thiết kế để thao tác khám phá
Mở khung nhìn thiết kế bảng chia làm hai phần (Hình 4). Nửa trên là danh sách tên trường (Field Name) kèm kiểu dữ liệu (Data Type). Nháy chuột chọn Data Type cụ thể cho một trường thì nửa dưới hiển thị các thuộc tính chi tiết hơn của kiểu dữ liệu trong trường đó, gọi là thuộc tính trường (Field Properties). Hình 4 minh họa các thuộc tính chi tiết của trường Date of Birth.



# Educational Textbook Content

## 1. Introduction to Database Tools

### 1.1 Overview
- Home
- Create
- External Data
- Database Tools
- Help
- Table Design

### 1.2 User Interface Elements
- View
- Primary Builder
- Validation
- Delete Rows
- Rules
- Modify Lookups

### 1.3 Access Objects
- All Access Objects
- Students
- Search

## 2. Student Information Table

| Last Name | First Name | E-mail Address | Student ID | Level | Room | Date of Birth | ID Number | Home Phone | Mobile Phone | Address |
|-----------|------------|----------------|-------------|-------|------|----------------|-----------|------------|--------------|---------|
|           |            |                |             |       |      |                |           |            |              |         |

### 2.1 Guardians
- Students and Guardians
- Guardians Extended
- Guardian Detail
- Guardian List
- Guardian Subform

### 2.2 Attendance
- Student Attendance Count
- Student Attendance Exemption
- Student List

## 3. Design View

### 3.1 Field Properties
| Field Name | Data Type      |
|------------|----------------|
| AutoNumber |                |
| Short Text |                |
| Long Text  |                |
| Number     |                |
| Large Number |              |
| Date/Time  |                |
| Currency   |                |
| OLE Object  |               |
| Hyperlink  |                |
| Attachment |                |
| Calculated |                |

### 3.2 Key Field Management
- To set a field as the primary key, use the Primary Key button in the command area.
- Tip: Right-click on the square at the top left corner next to the field name to display a context menu with similar commands.

## 4. Data Entry and Modification

### 4.1 Modifying Columns
- Click on the square at the top left corner next to the field name to select the entire row (i.e., the column with that name in the data table).
- After selecting, you can:
- Delete or insert a new field next to it: Use the Delete Rows or Insert Rows command in the command area.
- Rename the field by clicking on the field name to enter a new name if desired.

### 4.2 Additional Notes
- Ensure that the primary key field is correctly set to maintain data integrity.

----

This content has been structured to reflect the original layout and formatting as closely as possible, including tables and lists.



# Thực hành làm quen với Microsoft Access

## Nhiệm vụ 1. Tạo CSDL bằng khuôn mẫu
a) Tạo một CSDL theo mẫu Students. Mở bảng Students và chuyển sang khung nhìn thiết kế.
b) Thử ghi lưu CSDL vừa tạo ở câu a) về máy tính cá nhân với một tên tùy ý.

## Nhiệm vụ 2. Khám phá biểu mẫu và thử nhập dữ liệu từ biểu mẫu
a) Mở biểu mẫu Student List; chuyển sang khung nhìn Form View (nếu cần thiết).
b) Nhập dữ liệu tùy ý cho vài bản ghi và một vài trường:
- Trường với kiểu dữ liệu Date/Time, chú ý cách Access hỗ trợ dùng lịch để chọn ngày tháng.
- Trường Level, chú ý biểu mẫu sẽ thả xuống danh sách để chọn.
c) Mở bảng Students để xem kết quả nhập dữ liệu.

## Nhiệm vụ 3. Xem các thuộc tính chi tiết của một cột
a) Mở bảng Students trong khung nhìn thiết kế, chú ý vùng Field Properties hiển thị các thuộc tính chi tiết hơn.
b) Nháy chuột vào Data Type của trường Student ID và xem các thuộc tính.
c) Làm tương tự với trường Date of Birth.

## Nhiệm vụ 4. Khám phá các thao tác thiết kế cột trong khung nhìn thiết kế bảng Students
a) Thử xóa một trường - ví dụ Company, Room;
b) Thử chèn thêm một trường mới vào chỗ vừa xóa bớt xong.
c) Thử đổi tên một vài trường ví dụ First Name thành Tên, Last Name thành Họ; đổi tên trường có kiểu dữ liệu Date/Time thành Ngày sinh.

### Theo em, khi nào nên tạo mới một CSDL Access từ khuôn mẫu có sẵn?

### Câu 1. Vùng điều hướng trong cửa sổ làm việc của Access hiển thị những gì?
### Câu 2. Có thể mở bảng CSDL dưới những khung nhìn nào?
Khung nhìn thiết kế bảng gồm mấy phần? Từng phần hiển thị những phần gì?
### Câu 3.

## Tóm tắt bài học
Có thể mở một bảng (biểu mẫu; truy vấn; báo cáo) dưới các khung nhìn khác nhau trong vùng làm việc của Access tùy theo việc ta muốn làm.
Khung nhìn thiết kế bảng chia làm hai phần: nửa trên là danh sách tên trường (Field Name) kèm kiểu dữ liệu (Data Type), nửa dưới hiển thị các thuộc tính chi tiết của trường ta đang thiết kế, chỉnh sửa.
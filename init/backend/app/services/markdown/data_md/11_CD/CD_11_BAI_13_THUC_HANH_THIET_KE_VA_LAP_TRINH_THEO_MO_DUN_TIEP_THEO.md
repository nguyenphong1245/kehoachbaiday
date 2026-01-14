# BÀI 13   THỰC HÀNH THIẾT KẾ VÀ LẬP TRÌNH THEO MÔ ĐUN (tiếp theo)

Học xong bài này, em sẽ:
- Sử dụng được một số hàm thư viện có sẵn của Python để giải bài toán thực tế.

## Nhiệm vụ và yêu cầu

Thực hiện phương án sử dụng tối đa các hàm đã có sẵn trong Python để tạo ra SP#2:
Thay vì ưu tiên viết trực tiếp các câu lệnh chi tiết như trong Bài 11 và Bài 12, bài này yêu cầu thay thế bằng việc gọi sử dụng các hàm có sẵn trong Python mỗi khi có thể.

### Nhiệm vụ 1. Viết phiên bản thứ hai cho hàm thực hiện phân tích dãy điểm

**Yêu cầu:**
Viết chương trình thực hiện hàm `ptDiem` theo phương án sử dụng tối đa các hàm có sẵn trong Python và chạy thử kiểm tra.

**Hướng dẫn thực hiện:**
- Sử dụng hàm `sum` để tính tổng và điểm trung bình.
- Gọi hàm Python thực hiện sắp xếp thứ tự (không giảm): sau khi sắp xếp thì tìm được ngay max, min.
- Dãy số đã sắp xếp (không giảm) nên có thể dùng hàm `bisect_left` (trong mô đun `bisect`) tìm được các vị trí phân chia dãy điểm thành các đoạn điểm: Chưa đạt, Đạt, Khả và Tốt. Từ đó tính được số lượng điểm theo từng mức xếp hạng.

```python
def ptDiem_bisect(ds):
chuadat = bisect_left(ds, 58)  # 58 điểm - mức chưa đạt
dat = bisect_left(ds, 65)       # 65 điểm - mức đạt
```

**Hình 1. Trích một số câu lệnh định nghĩa hàm `ptDiem_bisect`**

### Nhiệm vụ 2. Viết phiên bản thứ hai của hàm `ptMonHoc`

**Yêu cầu:**
Trong hàm `ptMonHoc`, thay vì sử dụng `quickSort_tuple_down` cài biến từ hàm `cksort`, hãy gọi sử dụng các hàm có sẵn trong Python.



# Hướng dẫn thực hiện:

Python có sẵn phương thức `sort`, hàm `sorted` với tham biến `key` là `lambda` để sắp xếp danh sách các cặp hay các bộ nhiều thành phần bất kỳ trong bộ theo giá trị của một thành phần.

## Cách gọi sử dụng để sắp xếp danh sách các cặp (tên, điểm) theo thứ tự giảm dần theo mẫu tham khảo Hình 2.

```python
sorted(dsGiam, reverse=True, key=lambda banGhi: banGhi[1])
```

### Hình 2. Ảnh và thực hiện sắp xếp bằng hàm `sorted`

Trong thân hàm `ptMonHoc`, sửa lại lời gọi hàm thực hiện việc sắp xếp. Để dùng hàm `bisect_left` cần sắp thử tự tăng dần:

- Khi dãy đã sắp thử tăng dần thì chỉ cần viết lại theo thứ tự đảo ngược để có dãy giảm dần.

Chạy chương trình thực hiện hàm `ptDiem_bisect` vừa hoàn thành với đầu vào là kết quả môn Tin học của lớp em và cho biết: Số lượng điểm của mức nào là nhiều nhất? Nên xếp hạng kết quả học tập môn Tin học chung của cả lớp ở mức nào?

## Bài Tìm Hiểu Thêm

### ZEN OF PYTHON

Kĩ sư phần mềm Tim Peters đã tập hợp 19 "nguyên tắc hướng dẫn" để lập trình tốt và đăng lên danh sách gửi thư của nhóm phát triển Python vào năm 1999. Những nguyên tắc này đã ảnh hưởng đến thiết kế của ngôn ngữ lập trình Python. Danh sách của Peters đề cập nguyên tắc thứ 20 - để Guido điền vào dành cho Guido van Rossum, là người sáng lập ra ngôn ngữ Python.

"Zen of Python" của Peters đã được đưa vào mục số 20 trong "Bộ Đề nghị Cải tiến Python chính thức" và được phát hành công cộng. Trong cửa sổ trình thông dịch Python, có thể gõ nhập `import this` để hiển thị toàn văn. Dưới đây phỏng dịch một số điểm chính:

- Tường minh tốt hơn hiếm ngẩm.
- Viết câu lệnh rõ ràng tốt hơn viết rút ngắn.
- Đơn giản tốt hơn phức hợp.
- Cô đặc trình dễ đọc là quan trọng.
- Phức hợp tốt hơn phức tạp.
- Tuân thủ tốt hơn lỏng lẻo.
- Không im lặng bỏ qua tiềm năng lỗi.

Đọc bản mới nhất trên hoc10.vn.

**Bản sách mẫu**
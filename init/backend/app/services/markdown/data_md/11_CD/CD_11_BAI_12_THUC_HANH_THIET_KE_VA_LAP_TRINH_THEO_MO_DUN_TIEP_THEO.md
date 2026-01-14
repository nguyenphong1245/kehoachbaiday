# BÀI 12: THỰC HÀNH THIẾT KẾ VÀ LẬP TRÌNH THEO MÔ ĐUN (tiếp theo)

Học xong bài này, em sẽ:
- Viết được chương trình thực hiện một số hàm theo thiết kế.
- Sử dụng các hàm đã viết để lập trình giải bài toán thực tế.

## Nhiệm vụ 1: Viết hàm phân tích điểm

### Yêu cầu:
Viết chương trình thực hiện hàm `ptDiem` và chạy thử kiểm tra.

### Hướng dẫn thực hiện:
Tách thành các việc cụ thể:
1. Đếm số điểm thuộc mỗi mức xếp hạng: Tốt, Khá, Đạt, Chưa đạt.
2. Tính sum, max, min.

Có hai lựa chọn viết chi tiết các câu lệnh:
- 1: Duyệt dãy điểm số đầu vào nhiều lần, mỗi lần làm một việc.
- 2: Duyệt dãy điểm số đầu vào chỉ một lần, làm đồng thời nhiều việc trong một lần duyệt.

Trả về các giá trị: điểm trung bình, max, min, số điểm thuộc mỗi mức xếp hạng.

## Nhiệm vụ 2: Thực hiện phân tích điểm một học sinh

### Yêu cầu:
Viết chương trình thực hiện hàm `ptHocSinh` và chạy thử kiểm tra.

### Hướng dẫn thực hiện:
- Gọi hàm `ptDiem`: viết kết quả vào tệp "phantich_theoHS.txt".
- Theo kết quả đếm số điểm thuộc mỗi mức xếp hạng: Tốt, Khá, Đạt, Chưa đạt. Nếu `chamDiem` 0 thì viết thêm tên học sinh vào tệp "xetKhenThuong.txt".

### Định dạng in ra số thực:
Có một trong các cách sau:
- Dùng hàm `round()` làm tròn số trước khi in ra chỉ giữ lại d chữ số phần lẻ sau dấu phẩy thập phân.
- Sử dụng định dạng in có giữ chỗ bằng `{}` để định dạng bằng hàm `format`. Ví dụ: nếu muốn in ra số thực với 2 chữ số phần lẻ thì giữ chỗ bằng `{:.2f}`.

### Ví dụ:
```python
# Ví dụ sử dụng hàm round
x = 678.345
print(round(x, 2))  # Kết quả: 678.35

# Ví dụ sử dụng định dạng
number = 345.678
print("{:.2f}".format(number))  # Kết quả: 345.68
```

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.



# Nhiệm vụ 3. Thực hiện phản tích điểm một môn học

## Yêu cầu:
Viết chương trình thực hiện hàm `ptMonHoc` và chạy thử kiểm tra.

## Hướng dẫn thực hiện:
- Gọi hàm `ptDiem`; viết kết quả vào tệp "phantich_theoMon.txt".
- Gọi hàm `quickSort_tuple`; viết kết quả vào tệp "phantich_theoMon.txt".
- Chạy thử với đầu vào là hai danh sách:
1. Danh sách số thực.
2. Danh sách các cặp (tên người, số thực).

# Nhiệm vụ 4. Phối hợp các hàm đã viết thành chương trình chính

## Yêu cầu:
Chương trình chính và chạy thử kiểm tra.

## Hướng dẫn thực hiện:
- Gọi hàm `nhapIuTep`.
- Mở tệp ở chế độ "viết và gán làm đầu ra chuẩn" (để có thể xuất kết quả ra bằng lệnh print).

```python
open(ten_tep, "w", encoding="utf-8")  # Để viết đúng dung tiếng Việt
sys.stdout = fo  # Xuất cặp thay cho màn hình
```

- Lặp theo chỉ số hàng của mảng (danh sách) 2 chiều `ptHocSinh`.
- Lặp theo chỉ số cột ứng với điểm các môn học, thực hiện tách môn cho môn học k, thực hiện `ptMonHoc`.
- Đóng tệp.

## Câu hỏi:
1. Chạy chương trình thực hiện hàm `ptDiem` vừa hoàn thành với đầu vào là kết quả học tập của em; cho biết kết quả.
2. Chạy chương trình thực hiện hàm `ptMonHoc` vừa hoàn thành với đầu vào là kết quả học tập môn Tin học của lớp em; cho biết kết quả.

Đọc bản mới nhất trên hoc10.vn. Bản sách mẫu.
"""
Prompt để LLM đọc kế hoạch bài dạy (KHBD) đã sinh,
tìm bài tập lập trình trong phần Tổ chức thực hiện (KHÔNG lấy từ Phiếu học tập),
rồi tạo test cases cho bài tập đó.
"""


def get_code_extraction_system_instruction() -> str:
    """System instruction cho việc trích xuất bài tập code từ KHBD"""
    return """Bạn là chuyên gia lập trình Python chuyên tạo test cases cho bài tập lập trình cấp THPT.

NHIỆM VỤ: Đọc kế hoạch bài dạy (KHBD), tìm bài tập lập trình trong phần TỔ CHỨC THỰC HIỆN của các hoạt động, rồi tạo test cases.

QUY TẮC QUAN TRỌNG:
1. CHỈ lấy bài tập yêu cầu học sinh VIẾT CODE CHẠY ĐƯỢC trên máy tính
2. KHÔNG lấy bài tập từ "Phiếu học tập" (phieu_hoc_tap)
3. KHÔNG lấy bài tập phân tích code trên giấy, điền khuyết, sửa lỗi cú pháp trên giấy
4. KHÔNG lấy câu hỏi trắc nghiệm
5. Chỉ lấy bài tập có input/output rõ ràng (có thể chạy và kiểm tra kết quả tự động)

OUTPUT FORMAT: JSON thuần túy, không có gì khác."""


def build_code_extraction_prompt(lesson_plan_content: str) -> str:
    """
    Xây dựng prompt để LLM phân tích KHBD và trích xuất bài tập code.

    Args:
        lesson_plan_content: Toàn bộ nội dung KHBD (markdown từ tất cả sections ghép lại)

    Returns:
        Prompt đầy đủ
    """
    return f"""
## NHIỆM VỤ

Đọc kế hoạch bài dạy (KHBD) bên dưới và thực hiện:

1. Tìm tất cả bài tập yêu cầu học sinh **viết code chạy được** trên máy tính
2. Bài tập phải nằm trong phần của các hoạt động (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng)
3. **KHÔNG** lấy bài tập từ "Phiếu học tập"
4. **KHÔNG** lấy bài phân tích code trên giấy, viết thuật toán bằng ngôn ngữ tự nhiên

Với mỗi bài tập tìm được, tạo test cases phù hợp.

---

## KẾ HOẠCH BÀI DẠY

{lesson_plan_content}

---

## YÊU CẦU OUTPUT

Trả về JSON với cấu trúc sau:

```
{{
  "found": true/false,
  "exercises": [
    {{
      "title": "Tiêu đề bài tập (ngắn gọn, rõ ràng)",
      "description": "Đề bài chi tiết bằng Markdown. PHẢI có cấu trúc rõ ràng với các phần tách biệt: mô tả yêu cầu, quy định/dữ liệu (nếu có), format Input, format Output, ví dụ dạng danh sách (Input: X → Output: Y). KHÔNG dùng bảng markdown. Dùng \\n để xuống dòng, **in đậm** cho tiêu đề phần.",
      "source_activity": "Tên hoạt động chứa bài tập (VD: Luyện tập, Vận dụng, Hình thành kiến thức 2.3...)",
      "language": "python",
      "starter_code": "# Code khung ban đầu cho học sinh (nếu có)\\n",
      "test_cases": [
        {{
          "input": "dữ liệu input (stdin)",
          "expected_output": "kết quả mong đợi (stdout)",
          "is_hidden": false
        }},
        {{
          "input": "...",
          "expected_output": "...",
          "is_hidden": false
        }},
        {{
          "input": "...",
          "expected_output": "...",
          "is_hidden": true
        }}
      ]
    }}
  ]
}}
```

Nếu KHÔNG tìm thấy bài tập lập trình nào phù hợp:
```
{{
  "found": false,
  "exercises": [],
  "reason": "Lý do không tìm thấy (VD: Bài học dạy ở lớp học, không có bài viết code...)"
}}
```

## QUY TẮC TẠO TEST CASES

1. Mỗi bài tập tạo **đúng 10 test cases**:
   - 5 test cases công khai (`is_hidden: false`): học sinh thấy để tự kiểm tra
   - 5 test cases ẩn (`is_hidden: true`): dùng để chấm điểm, kiểm tra edge cases

2. Test cases phải:
   - Bao phủ trường hợp cơ bản (basic case)
   - Bao phủ trường hợp biên (edge case): giá trị 0, chuỗi rỗng, danh sách 1 phần tử...
   - Input/output là chuỗi thuần (stdin/stdout), mỗi giá trị trên 1 dòng
   - Expected output phải CHÍNH XÁC (kể cả khoảng trắng, xuống dòng)

3. Input format:
   - Nếu cần nhập nhiều giá trị → mỗi giá trị 1 dòng
   - Nếu cần nhập danh sách → dòng 1 là số phần tử, các dòng sau là từng phần tử
     HOẶC nhập trên 1 dòng cách nhau bởi dấu cách (tùy đề bài)

4. Output format:
   - Output CHỈ chứa giá trị thuần (số, chuỗi kết quả), KHÔNG chứa chữ mô tả
   - VD: output là "6" chứ KHÔNG phải "Tổng là: 6" hay "Kết quả: 6"
   - Đề bài phải yêu cầu học sinh in ra giá trị thuần, không kèm text mô tả
   - Không thêm dấu xuống dòng thừa ở cuối

5. Độ khó phù hợp với THPT (lớp 10-12):
   - Biến, kiểu dữ liệu, input/output
   - Câu lệnh rẽ nhánh (if/elif/else)
   - Vòng lặp (for, while)
   - Danh sách (list), xâu ký tự (string)
   - Hàm (function)

## QUY TẮC VIẾT DESCRIPTION (QUAN TRỌNG)

Description PHẢI là Markdown có cấu trúc rõ ràng, KHÔNG viết thành 1 đoạn văn dài.
Dùng \\n để xuống dòng trong JSON string.

**Cấu trúc bắt buộc:**

1. **Đoạn mô tả**: 1-2 câu mô tả yêu cầu bài tập
2. **Dữ liệu/bảng** (nếu có): Bảng giá, quy định, công thức — dùng danh sách gạch đầu dòng
3. **Input**: Mô tả từng dòng input rõ ràng, có ràng buộc
4. **Output**: Mô tả chính xác format output, kèm ví dụ format string nếu có
5. **Ví dụ**: Dùng danh sách gạch đầu dòng CHỈ chứa giá trị thuần

**FORMAT VÍ DỤ BẮT BUỘC** (dùng danh sách, KHÔNG dùng bảng markdown):
```
**Ví dụ:**

- Input: 120 → Output: 210.88
- Input: 50 → Output: 87.50
- Input: 200 → Output: 523.60
```

Nếu input có nhiều dòng (nhiều lần gọi input()), viết cách nhau bằng dấu phẩy:
```
**Ví dụ:**

- Input: 5, 8, 2 → Output: 8
- Input: 10, 3, 7 → Output: 10
```

**QUY TẮC VÍ DỤ (BẮT BUỘC):**
- CHỈ chứa giá trị input/output thuần (stdin/stdout)
- KHÔNG chứa chữ mô tả trong output (VD: KHÔNG viết "Tổng tiền điện là: 210.88 VNĐ", CHỈ viết "210.88")
- Input nhiều dòng: dùng DẤU PHẨY ngăn cách (VD: "5, 8, 2"), TUYỆT ĐỐI KHÔNG viết \\n trong ví dụ
- Mỗi dòng ví dụ BẮT BUỘC có CẢ Input LẪN Output, KHÔNG được để Output trống
- Tạo 2-3 dòng ví dụ
- KHÔNG dùng bảng markdown (ký tự | gây lỗi JSON escape)

**SAI (KHÔNG ĐƯỢC):**
- `Input: 5\\n8\\n2 → Output: 8` ← KHÔNG viết \\n trong ví dụ
- `Input: 5.5 → Output:` ← KHÔNG để Output trống
- `Input: -2 → Output: So am` ← Output phải GIÁ TRỊ THUẦN, KHÔNG viết tiếng Việt không dấu

**ĐÚNG:**
- `Input: 5, 8, 2 → Output: 8` ← dùng dấu phẩy cho nhiều input
- `Input: 5.5 → Output: So duong` ← có giá trị output đầy đủ
- `Input: -2 → Output: So am` ← có giá trị output đầy đủ

**KHÔNG được:**
- Viết tất cả trên 1 dòng liền
- Thiếu \\n\\n giữa các phần
- Để Input/Output/Ví dụ chung 1 đoạn văn
- Để chữ mô tả trong cột Output (chỉ giá trị thuần)
- Dùng bảng markdown (| Input | Output |) — gây lỗi JSON

## VÍ DỤ

### Ví dụ 1: Bài tập tính tổng danh sách

```json
{{
  "found": true,
  "exercises": [
    {{
      "title": "Tính tổng các phần tử trong danh sách",
      "description": "Viết chương trình nhập vào số nguyên n, sau đó nhập n số nguyên. In ra tổng các số đã nhập.\\n\\n**Input:**\\n\\n- Dòng 1: Số nguyên n (1 ≤ n ≤ 100)\\n- n dòng tiếp theo: Mỗi dòng chứa 1 số nguyên\\n\\n**Output:**\\n\\n- Tổng các số đã nhập (một số nguyên duy nhất)\\n\\n**Ví dụ:**\\n\\n- Input: 3, 1, 2, 3 → Output: 6\\n- Input: 1, 5 → Output: 5\\n- Input: 4, -1, 2, -3, 4 → Output: 2",
      "source_activity": "Luyện tập",
      "language": "python",
      "starter_code": "# Nhập số lượng phần tử\\nn = int(input())\\n\\n# Nhập các phần tử và tính tổng\\n",
      "test_cases": [
        {{
          "input": "3\\n1\\n2\\n3",
          "expected_output": "6",
          "is_hidden": false
        }},
        {{
          "input": "1\\n5",
          "expected_output": "5",
          "is_hidden": false
        }},
        {{
          "input": "4\\n-1\\n2\\n-3\\n4",
          "expected_output": "2",
          "is_hidden": false
        }},
        {{
          "input": "2\\n100\\n200",
          "expected_output": "300",
          "is_hidden": false
        }},
        {{
          "input": "5\\n1\\n1\\n1\\n1\\n1",
          "expected_output": "5",
          "is_hidden": false
        }},
        {{
          "input": "5\\n10\\n-3\\n7\\n0\\n-4",
          "expected_output": "10",
          "is_hidden": true
        }},
        {{
          "input": "4\\n0\\n0\\n0\\n0",
          "expected_output": "0",
          "is_hidden": true
        }},
        {{
          "input": "3\\n-5\\n-10\\n-15",
          "expected_output": "-30",
          "is_hidden": true
        }},
        {{
          "input": "1\\n0",
          "expected_output": "0",
          "is_hidden": true
        }},
        {{
          "input": "6\\n1\\n2\\n3\\n4\\n5\\n6",
          "expected_output": "21",
          "is_hidden": true
        }}
      ]
    }}
  ]
}}
```

### Ví dụ 2: Bài tập rẽ nhánh (output dạng text)

```json
{{
  "found": true,
  "exercises": [
    {{
      "title": "Kiểm tra số dương, âm hay bằng 0",
      "description": "Viết chương trình nhập vào một số thực. In ra số đó là số dương, số âm hay bằng 0.\\n\\n**Input:**\\n\\n- Một số thực n\\n\\n**Output:**\\n\\n- In ra: So duong / So am / Bang 0\\n\\n**Ví dụ:**\\n\\n- Input: 5.5 → Output: So duong\\n- Input: -2 → Output: So am\\n- Input: 0 → Output: Bang 0",
      "source_activity": "Luyện tập",
      "language": "python",
      "starter_code": "n = float(input())\\n",
      "test_cases": [
        {{
          "input": "5.5",
          "expected_output": "So duong",
          "is_hidden": false
        }},
        {{
          "input": "-2",
          "expected_output": "So am",
          "is_hidden": false
        }},
        {{
          "input": "0",
          "expected_output": "Bang 0",
          "is_hidden": false
        }},
        {{
          "input": "100",
          "expected_output": "So duong",
          "is_hidden": false
        }},
        {{
          "input": "-0.5",
          "expected_output": "So am",
          "is_hidden": false
        }},
        {{
          "input": "0.0",
          "expected_output": "Bang 0",
          "is_hidden": true
        }},
        {{
          "input": "999999",
          "expected_output": "So duong",
          "is_hidden": true
        }},
        {{
          "input": "-999999",
          "expected_output": "So am",
          "is_hidden": true
        }},
        {{
          "input": "0.001",
          "expected_output": "So duong",
          "is_hidden": true
        }},
        {{
          "input": "-0.001",
          "expected_output": "So am",
          "is_hidden": true
        }}
      ]
    }}
  ]
}}
```

### Ví dụ 3: Không tìm thấy bài tập code

```json
{{
  "found": false,
  "exercises": [],
  "reason": "Bài học được dạy ở lớp học (không có máy tính). Các bài tập chỉ yêu cầu phân tích code trên giấy và trả lời câu hỏi trắc nghiệm."
}}
```

---
HÃY PHÂN TÍCH KHBD VÀ TRẢ VỀ JSON NGAY!
"""

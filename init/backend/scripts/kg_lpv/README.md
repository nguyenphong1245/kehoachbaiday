# KG-LPV — Đồ thị tri thức & script nạp liệu

Thư mục này chứa lược đồ đồ thị (schema) và các script nạp/kiểm tra dữ liệu cho **đồ thị tri thức
KG-LPV** — instance Neo4j **RIÊNG BIỆT**, tách hoàn toàn khỏi Neo4j chính của ứng dụng
(dùng cho nội dung bài học sẵn có tại `bolt://localhost:7687`).

- Browser: `http://localhost:7475`
- Bolt: `bolt://localhost:7688`
- Đồ thị này chỉ được **đọc (read-only)** lúc runtime bởi module `app/modules/kg_lpv/`.
  Việc **ghi** dữ liệu CHỈ thực hiện offline qua các script trong thư mục này.

## 1. Khởi động đồ thị

```bash
cd init
docker compose --profile kg-lpv up -d neo4j-kglpv
```

Không truyền `--profile kg-lpv` thì service `neo4j-kglpv` sẽ KHÔNG chạy (mặc định tắt).

## 2. Biến môi trường

Khai báo trong `init/backend/.env` (đã có mẫu ở `.env.example`). **KHÔNG dùng** các biến
`NEO4J_*` của app chính — đồ thị KG-LPV dùng bộ biến riêng:

| Biến | Mặc định | Ghi chú |
|---|---|---|
| `KG_LPV_NEO4J_URI` | `bolt://localhost:7688` | Chạy trong Docker Compose thì dùng `bolt://neo4j-kglpv:7687` |
| `KG_LPV_NEO4J_USERNAME` | `neo4j` | |
| `KG_LPV_NEO4J_PASSWORD` | *(bắt buộc)* | Khớp `NEO4J_AUTH` của service `neo4j-kglpv` trong `docker-compose.yml` |
| `KG_LPV_NEO4J_DATABASE` | `neo4j` | |

## 3. Thứ tự chạy

Chạy từ thư mục `init/backend/`:

```bash
# 1. Tạo constraint + fulltext index (idempotent, chạy lại an toàn)
cypher-shell -a bolt://localhost:7688 -u neo4j -p <mật khẩu> -f scripts/kg_lpv/schema.cypher
# hoặc dán nội dung schema.cypher vào Neo4j Browser http://localhost:7475

# 2. Nạp dữ liệu curate JSON (mặc định đọc scripts/kg_lpv/samples/)
python scripts/kg_lpv/import_kg.py
# hoặc chỉ định thư mục dữ liệu thật do nhóm nghiên cứu chuẩn bị:
python scripts/kg_lpv/import_kg.py duong/dan/den/du_lieu_curate/

# 3. Kiểm tra đồ thị: đếm đỉnh/cạnh, tỉ lệ vết xuất xứ, truy vấn mẫu
python scripts/kg_lpv/validate_graph.py
```

`import_kg.py` là **idempotent**: chạy lại nhiều lần với cùng dữ liệu sẽ không tạo bản ghi
trùng (dùng `MERGE` theo `ma_dinh_danh`).

## 4. Các script

| File | Vai trò |
|---|---|
| `schema.cypher` | Constraint duy nhất trên `ma_dinh_danh` của `BaiHoc`, `YCCD`, `ChiBaoNLS`; fulltext index trên `ten` của `BaiHoc`, `ChuDe` (phục vụ N1 so khớp mờ). |
| `import_kg.py` | Đọc mọi file `*.json` trong thư mục curate → kiểm vết xuất xứ → `MERGE` đỉnh/cạnh vào Neo4j. Bản ghi thiếu vết bị **từ chối**, không nạp. |
| `validate_graph.py` | Đếm đỉnh/cạnh theo nhãn/loại, tính % vết xuất xứ (phải 100%), chạy truy vấn mẫu tra `BaiHoc` theo `ma_dinh_danh` và theo fulltext. Thoát mã khác 0 nếu vết xuất xứ chưa 100%. |
| `samples/*.json` | Bộ dữ liệu mẫu tối thiểu, đủ chạy end-to-end (xem mục 6). |

## 5. Vết xuất xứ (provenance) — bắt buộc trên MỌI đỉnh/cạnh

Theo mục 5.2 kế hoạch KG-LPV, mỗi đỉnh và mỗi cạnh phải mang đủ 4 thuộc tính:

| Trường | Ý nghĩa | Ví dụ |
|---|---|---|
| `ma_nguon` | Mã định danh văn bản gốc | `"CT-TIN-2018"` |
| `so_ky_hieu` | Số ký hiệu văn bản | `"32/2018/TT-BGDĐT"` |
| `ngay_hieu_luc` | Ngày hiệu lực (ISO `YYYY-MM-DD`) | `"2018-12-26"` |
| `vi_tri_trang` | Vị trí trang trong văn bản/SGK | `"tr.15"` |

`import_kg.py` kiểm tra 4 trường này qua hàm thuần `validate_provenance(record: dict) -> list[str]`
(không phụ thuộc Neo4j, có thể unit-test độc lập — xem
`init/backend/tests/kg_lpv/test_import_kg.py`). Bản ghi thiếu **bất kỳ** trường nào, hoặc giá trị
rỗng/toàn khoảng trắng, bị từ chối và in cảnh báo tiếng Việt nêu rõ đỉnh/cạnh nào, thiếu trường gì —
KHÔNG dừng toàn bộ quá trình nạp (các bản ghi hợp lệ khác vẫn được nạp).

## 6. Lược đồ file curate JSON (do nhóm nghiên cứu chuẩn bị)

Mỗi file `*.json` trong thư mục curate (ví dụ `samples/`) có 2 mảng cấp cao nhất:

```json
{
  "_mo_ta": "(tuỳ chọn) mô tả nội dung file, importer bỏ qua trường này",
  "nodes": [ ... ],
  "edges": [ ... ]
}
```

`import_kg.py` đọc **mọi** file `*.json` trong thư mục, gộp tất cả `nodes` rồi tất cả `edges`
lại trước khi nạp (nạp toàn bộ đỉnh trước, rồi mới nối cạnh) — nên có thể chia dữ liệu ra nhiều
file theo chủ đề mà không lo thứ tự file.

### 6.1 Bản ghi đỉnh (`nodes[]`)

| Trường | Bắt buộc | Mô tả |
|---|---|---|
| `label` | ✅ | Một trong 18 nhãn ở mục 5.2 kế hoạch: `VanBan`, `KhoiLop`, `ChuDe`, `BaiHoc`, `YCCD`, `NangLucTinHoc`, `BieuHienNL`, `NangLucChung`, `PhamChat`, `MienNLS`, `NangLucThanhPhanNLS`, `ChiBaoNLS`, `MucDoNLS`, `MucNhanThuc`, `DongTuNhanThuc`, `PhuongPhapDH`, `KyThuatDH`, `BuocQuyTrinh`, `MenhDeKienThuc`. |
| `ma_dinh_danh` | ✅ | Khoá nghiệp vụ duy nhất, dùng làm khoá `MERGE` (idempotent). Tự đặt quy ước, ví dụ `BH-TIN10-C1-B1`. |
| `ten` | khuyến nghị | Tên hiển thị (property `ten` trên đỉnh) — bắt buộc có nếu muốn tìm bằng fulltext (`BaiHoc`, `ChuDe`). |
| `properties` | tuỳ chọn | Object các thuộc tính bổ sung tuỳ label (ví dụ `{"thu_tu": 1}`). |
| `ma_nguon`, `so_ky_hieu`, `ngay_hieu_luc`, `vi_tri_trang` | ✅ (cả 4) | Vết xuất xứ — xem mục 5. |

### 6.2 Bản ghi cạnh (`edges[]`)

| Trường | Bắt buộc | Mô tả |
|---|---|---|
| `type` | ✅ | Loại quan hệ (danh sách hợp lệ bên dưới). |
| `from` | ✅ | `ma_dinh_danh` của đỉnh nguồn (phải khớp một đỉnh đã khai báo). |
| `to` | ✅ | `ma_dinh_danh` của đỉnh đích. |
| `properties` | tuỳ chọn | Thuộc tính trên cạnh, ví dụ `{"thu_tu": 1}` cho `GOM_BUOC`. |
| `ma_nguon`, `so_ky_hieu`, `ngay_hieu_luc`, `vi_tri_trang` | ✅ (cả 4) | Vết xuất xứ. |

### 6.3 Danh sách loại cạnh hợp lệ

**6 quan hệ tiêu biểu nêu ở mục 5.2 kế hoạch:**

| Loại | Chiều | Ý nghĩa |
|---|---|---|
| `CO_YCCD` | `BaiHoc → YCCD` | Bài học có yêu cầu cần đạt |
| `O_MUC` | `YCCD → MucNhanThuc` | YCCĐ ở mức nhận thức nào |
| `HINH_THANH` | `BaiHoc → NangLucTinHoc \| NangLucChung \| PhamChat` | Bài học hình thành năng lực/phẩm chất |
| `AP_DUNG_CHO` | `ChiBaoNLS → KhoiLop` | Chỉ báo NLS áp dụng cho khối lớp nào |
| `GOM_BUOC` (có `thu_tu` trong `properties`) | `PhuongPhapDH → BuocQuyTrinh` | Phương pháp dạy học gồm bước quy trình theo thứ tự |
| `THUOC` | `MenhDeKienThuc → BaiHoc` | Mệnh đề kiến thức thuộc bài học nào |

**Quan hệ bổ sung tự thiết kế** (kế hoạch không đặt tên cụ thể cho cây chương trình và
chuỗi khung năng lực số, nên định nghĩa thêm để dữ liệu liên thông được):

| Loại | Chiều | Ý nghĩa |
|---|---|---|
| `CO_CHU_DE` | `KhoiLop → ChuDe` | Khối lớp có chủ đề |
| `CO_BAI_HOC` | `ChuDe → BaiHoc` | Chủ đề có bài học |
| `CO_NANG_LUC_THANH_PHAN` | `MienNLS → NangLucThanhPhanNLS` | Miền NLS có năng lực thành phần |
| `CO_CHI_BAO` | `NangLucThanhPhanNLS → ChiBaoNLS` | Năng lực thành phần có chỉ báo |
| `CO_MUC_DO` | `ChiBaoNLS → MucDoNLS` | Chỉ báo có mức độ (theo khối lớp) |

Muốn thêm loại cạnh mới: thêm vào `ALLOWED_EDGE_TYPES` trong `import_kg.py` (whitelist chống
tiêm Cypher khi nội suy tên nhãn/loại cạnh động).

## 7. Bộ dữ liệu mẫu (`samples/`)

Tối thiểu, đủ chạy end-to-end (không phải dữ liệu chuẩn thật — nhóm nghiên cứu sẽ thay bằng
dữ liệu đã số hoá theo đúng lược đồ ở mục 6):

| File | Nội dung |
|---|---|
| `01_chuong_trinh.json` | 1 `KhoiLop` (Lớp 10), 1 `ChuDe`, 2 `BaiHoc`, 2 `YCCD`, 2 `MucNhanThuc` + cây quan hệ |
| `02_nang_luc.json` | 1 `NangLucTinHoc`, 1 `NangLucChung`, 1 `PhamChat` + `HINH_THANH` từ `BaiHoc` |
| `03_nang_luc_so.json` | Chuỗi `MienNLS → NangLucThanhPhanNLS → ChiBaoNLS → MucDoNLS` + `AP_DUNG_CHO` khối lớp |
| `04_phuong_phap_day_hoc.json` | 1 `PhuongPhapDH` + 5 `BuocQuyTrinh` nối bằng `GOM_BUOC {thu_tu}` |
| `05_menh_de_kien_thuc.json` | 1 `MenhDeKienThuc` nối `THUOC` vào 1 `BaiHoc` |

`validate_graph.py` dùng `BaiHoc` mã `BH-TIN10-C1-B1` (trong `01_chuong_trinh.json`) làm truy
vấn mẫu — nếu đổi/xoá bản ghi này trong dữ liệu thật, cập nhật lại
`SAMPLE_BAIHOC_MA_DINH_DANH` trong `validate_graph.py`.

## 8. Kiểm thử

`init/backend/tests/kg_lpv/test_import_kg.py` unit-test hàm thuần `validate_provenance()` —
KHÔNG cần Neo4j sống. Chạy từ `init/backend/`:

```bash
pytest tests/kg_lpv/test_import_kg.py -v
```

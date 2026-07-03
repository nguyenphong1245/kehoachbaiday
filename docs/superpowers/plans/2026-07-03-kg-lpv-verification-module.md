# Kế hoạch thiết kế Module KG-LPV — Kiểm chứng Kế hoạch bài dạy bằng Đồ thị tri thức

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tích hợp module KG-LPV vào dự án WEB1 — kiểm chứng tự động KHBD sinh bởi LLM qua 3 nhánh (N1 định danh, N2 đối chiếu chương trình, N3 nhất quán sư phạm) với 15 mã lỗi (D1, M1–M6, C1–C8), có sửa lỗi cục bộ và kiểm lại; module **bật/tắt linh hoạt 3 tầng** và dùng **đồ thị tri thức Neo4j riêng** (browser `http://localhost:7475`).

**Architecture:** Module dạng plugin tự chứa tại `app/modules/kg_lpv/` — backend chỉ chạm vào lõi ở đúng 1 điểm đăng ký router có điều kiện. Pipeline 4 bước (tách đoạn → N1‖N2 song song → N3 → sửa & kiểm lại) chạy dưới dạng job nền, kết quả là "sổ lỗi" có bằng chứng truy vết về đồ thị chuẩn. Quy tắc vàng: **luật/thuật toán trước, LLM chỉ dùng cho diễn đạt tự do; quyết định thiếu bằng chứng hợp lệ không được chuyển sang bước sửa.**

**Tech Stack:** FastAPI + SQLAlchemy async + Alembic (PostgreSQL), Neo4j Community (instance thứ 2, APOC), google-generativeai (Gemini, registry model theo feature), React + Vite + TS (frontend), pytest + vitest.

## Global Constraints

- Module phải **tắt được hoàn toàn**: khi tắt, không kết nối Neo4j 7475, không đăng ký router, frontend ẩn toàn bộ UI liên quan; ứng dụng chính hoạt động y nguyên.
- Đồ thị KG-LPV là instance Neo4j **riêng biệt**: browser `http://localhost:7475`, **bolt `bolt://localhost:7688`** (giả định: 7475 là cổng HTTP browser; driver kết nối qua bolt 7688 — *cần xác nhận với chủ dự án trước Giai đoạn 0*).
- Module **chỉ đọc** (read-only) trên đồ thị KG-LPV lúc runtime; ghi đồ thị chỉ qua script nạp liệu offline.
- Mọi đỉnh/cạnh đồ thị và mọi bản ghi lỗi phải có **vết xuất xứ** (mã nguồn văn bản, số ký hiệu, ngày hiệu lực, vị trí trang).
- N1 **không dùng LLM** cho quyết định cuối. N2/N3 dùng LLM có neo bằng chứng, temperature ≤ 0.2, output JSON theo schema.
- Nguyên tắc ưu tiên nhánh: hoạt động còn lỗi kiến thức M* ở N2 **không** được dùng làm bằng chứng đạt năng lực ở N3.
- Tuân thủ pattern hiện có của dự án: router + service + schema + prompt tách file, rate-limit `slowapi`, trừ token người dùng, registry model AI theo feature trong DB, log dạng `kg_lpv.<action> key=value`.
- Tiếng Việt cho toàn bộ text hướng người dùng (label, message, mô tả lỗi).

---

## 1. Bối cảnh & hiện trạng dự án

| Thành phần hiện có | Vị trí | Vai trò với KG-LPV |
|---|---|---|
| Sinh KHBD (Gemini + Neo4j chính 7687) | `init/backend/app/services/lesson_plan_builder_service.py` | Nguồn KHBD đầu vào (`SavedLessonPlan.sections`) |
| KHBD đã lưu | `init/backend/app/models/saved_lesson_plan.py` | Đối tượng được kiểm chứng; trường `sections` (JSON) + `content` (Markdown) |
| Registry model AI theo feature (DB) | `init/backend/app/services/admin_ai_model_registry.py` | Tái dùng: thêm 4 feature key cho KG-LPV |
| Trừ token / kiểm tra số dư | `_deduct_tokens`, `_check_token_balance` trong `lesson_builder.py:65-118` | Tách ra service dùng chung (Task 1.4) |
| Đăng ký router tập trung | `init/backend/app/api/__init__.py` | Điểm tích hợp duy nhất (đăng ký có điều kiện) |
| Docker Compose (postgres, neo4j 7474/7687, backend, frontend, piston) | `init/docker-compose.yml` | Thêm service `neo4j-kglpv` với profile riêng |
| Mock Neo4j trong test | `init/backend/tests/test_lesson_builder.py:_mock_neo4j` | Pattern test cho graph client mới |
| Trang admin model AI | `init/frontend/src/pages/admin/AdminAIModelsPage.tsx` | Nơi thêm mục cấu hình + công tắc KG-LPV |
| Trang xem/sửa KHBD | `init/frontend/src/pages/lesson-builder/ViewSavedLessonPlanPage.tsx`, `LessonPlanBuilderPage.tsx` | Nơi gắn nút "Kiểm chứng KHBD" + panel sổ lỗi |

## 2. Phạm vi

**Trong phạm vi:**
- Pipeline kiểm chứng 4 bước theo mô hình KG-LPV (tách đoạn, N1‖N2, N3, sửa & kiểm lại).
- Khung phân loại 15 mã lỗi: D1 (N1), M1–M6 (N2), C1–C8 (N3, 6 trục nhất quán).
- Đồ thị tri thức riêng + script nạp liệu từ nguồn chuẩn đã số hóa.
- Cơ chế bật/tắt 3 tầng + trang quản trị.
- UI giáo viên: chạy kiểm chứng, xem sổ lỗi, chấp nhận/loại bỏ từng phát hiện, xem & duyệt bản sửa (diff).

**Ngoài phạm vi (không làm ở dự án này):**
- Số hóa/curate nội dung văn bản chuẩn (CT 2018, SGK, TT 02/2025, CV 3456, CV 5512) — module chỉ định nghĩa **định dạng nạp liệu**; dữ liệu do nhóm nghiên cứu chuẩn bị.
- Đánh giá độ đồng thuận chuyên gia (Krippendorff's alpha) — chỉ hỗ trợ **xuất findings ra JSON/CSV** để gán nhãn ngoài hệ thống.
- Chấm điểm "hay/dở" của KHBD — module chỉ kiểm tính đúng của quan hệ tối thiểu chứng minh được.

## 3. Kiến trúc tổng thể

```
┌─────────────────────────────── Backend (FastAPI) ───────────────────────────────┐
│                                                                                  │
│  app/api/__init__.py ──(chỉ khi bật)──► app/modules/kg_lpv/router.py            │
│                                              │                                   │
│                                              ▼                                   │
│                                    pipeline/orchestrator.py  (job nền)           │
│                                    ┌─────────┼──────────────────────┐            │
│                                    ▼         ▼                      ▼            │
│                              segmenter   n1_identity ‖ n2_curriculum  n3_pedagogy│
│                              (LLM→JSON)  (thuật toán)   (luật+LLM)    (6 trục)   │
│                                    │         │              │           │        │
│                                    └────► error_ledger (sổ lỗi) ◄───────┘        │
│                                              │                                   │
│                                              ▼                                   │
│                                        repairer (sửa cục bộ + diff + kiểm lại)   │
│                                                                                  │
│  graph_client.py ──bolt 7688──► Neo4j KG-LPV (browser 7475)  [read-only]         │
│  PostgreSQL: kg_lpv_jobs, kg_lpv_findings, feature_flags                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Quyết định thiết kế then chốt:**

1. **Plugin tự chứa** — toàn bộ mã trong `app/modules/kg_lpv/`; lõi ứng dụng chỉ biết đến module qua: (a) 1 khối đăng ký router có điều kiện, (b) 4 feature key thêm vào registry model, (c) shutdown hook đóng driver. Xóa thư mục module + tắt cờ → app chạy bình thường.
2. **Job nền + polling** — kiểm chứng gọi nhiều lượt LLM (1–3 phút/KHBD), không thể xử lý đồng bộ trong 1 request. Dùng `asyncio.create_task` (pattern scheduler/piston-warmup sẵn có), trạng thái job lưu PostgreSQL, frontend poll `GET /jobs/{id}` mỗi 2–3s. *Không* thêm hàng đợi ngoài (Celery/Redis) — YAGNI với quy mô hiện tại.
3. **Luật trước, LLM sau** — mỗi tiêu chí kiểm được phân loại tĩnh: `ALGORITHMIC` (so khớp đồ thị/chuỗi — D1, một phần C3/C6), `RULE` (quan hệ có cấu trúc trong đồ thị — M1/M3/M4/M5, C1), `LLM_JUDGE` (diễn đạt tự do — M2/M6, C2/C4/C5/C7/C8, có neo câu hỏi nguyên tử). Giảm tối đa chi phí token và tăng tính tái lập.
4. **Phán xử nguyên tử có neo** — mỗi phán xử LLM ở N3 là một câu hỏi đúng/sai duy nhất (mức nhận thức? loại sản phẩm? tiêu chí quan sát được?) kèm ngữ cảnh trích từ đồ thị, trả JSON `{verdict, evidence_refs, explanation}`. Không có phán xử "tổng thể".
5. **Đồ thị riêng, chỉ đọc** — driver riêng, pool nhỏ (≤5), lazy-init khi module bật và có request đầu tiên; hỏng đồ thị → `/status` báo `degraded`, các endpoint kiểm chứng trả 503, app chính không ảnh hưởng.

## 4. Cơ chế bật/tắt 3 tầng

| Tầng | Cơ chế | Phạm vi tác dụng | Cần restart? |
|---|---|---|---|
| 1. Hạ tầng | Docker Compose **profile `kg-lpv`** cho service `neo4j-kglpv` | Có/không chạy container đồ thị | — (quyết định lúc `docker compose up`) |
| 2. Tiến trình | Env `KG_LPV_ENABLED` (default `false`) trong `core/config.py` | Có/không đăng ký router, load module, init driver | Có |
| 3. Runtime | Bảng `feature_flags` (key=`kg_lpv`) + API admin | Bật/tắt tức thời không restart; admin thao tác trên UI | Không |

**Trạng thái hiệu dụng** (trả về ở `GET /kg-lpv/status`):

```
effective_enabled = env KG_LPV_ENABLED  AND  db_flag.enabled
availability      = "ok" | "degraded"(đồ thị không kết nối được) | "disabled"
```

- Khi env tắt: router không tồn tại → mọi đường dẫn `/kg-lpv/*` trả 404 tự nhiên; **riêng** `GET /kg-lpv/status` vẫn được đăng ký (khối luôn-đăng-ký nhỏ) để frontend hỏi một nguồn duy nhất, trả `{enabled: false}`.
- Khi db_flag tắt: dependency `require_kg_lpv()` trả **403** kèm message tiếng Việt; `/status` trả `{enabled: false}` → frontend ẩn UI.
- Cache cờ DB trong tiến trình với TTL 30s (tránh 1 query DB mỗi request); API admin bật/tắt chủ động xóa cache.
- Frontend: hook `useKgLpvStatus()` gọi `/status` một lần khi vào trang lesson-builder; toàn bộ nút/panel KG-LPV render có điều kiện theo `enabled && availability === "ok"`.

## 5. Đồ thị tri thức KG-LPV (instance riêng)

### 5.1 Hạ tầng

Service mới trong `init/docker-compose.yml` (kèm profile để mặc định KHÔNG chạy):

- Tên: `neo4j-kglpv`, image `neo4j:community`, plugin APOC.
- Ports: `"7475:7474"` (browser), `"7688:7687"` (bolt). Volume riêng: `neo4j-kglpv-data`, `neo4j-kglpv-logs`.
- `profiles: ["kg-lpv"]` → chỉ chạy khi `docker compose --profile kg-lpv up`.
- Env backend mới: `KG_LPV_NEO4J_URI=bolt://localhost:7688` (local) / `bolt://neo4j-kglpv:7687` (in-compose), `KG_LPV_NEO4J_USERNAME`, `KG_LPV_NEO4J_PASSWORD`, `KG_LPV_NEO4J_DATABASE=neo4j`.

### 5.2 Lược đồ đồ thị (theo Hình 1 của thiết kế nghiên cứu)

**Lớp đỉnh (node labels):**

| Label | Nội dung | Nguồn chuẩn |
|---|---|---|
| `VanBan` | Văn bản gốc: CT GDPT tổng thể 2018, CT môn Tin học 2018, TT 02/2025/TT-BGDĐT, CV 3456/BGDĐT-GDPT, CV 5512/BGDĐT-GDTrH, SGK được phê duyệt | — |
| `KhoiLop`, `ChuDe`, `BaiHoc`, `YCCD` | Cây chương trình môn Tin học: khối lớp → chủ đề → bài học → yêu cầu cần đạt | CT môn Tin học 2018 |
| `NangLucTinHoc` (NLa–NLe) + `BieuHienNL` theo cấp học | Năng lực đặc thù | CT môn Tin học 2018 |
| `NangLucChung`, `PhamChat` + biểu hiện | Năng lực chung, phẩm chất | CT GDPT tổng thể 2018 |
| `MienNLS`, `NangLucThanhPhanNLS`, `ChiBaoNLS`, `MucDoNLS` theo khối lớp | Khung năng lực số | TT 02/2025 + Phụ lục CV 3456 |
| `MucNhanThuc`, `DongTuNhanThuc` | Thang mức nhận thức + động từ đo lường được (trình bày được, vận dụng được…) và danh sách động từ KHÔNG đo được (biết/hiểu/nắm) | CV 5512 + tài liệu tập huấn |
| `PhuongPhapDH`, `KyThuatDH`, `BuocQuyTrinh` | Phương pháp/kĩ thuật dạy học + quy trình bước chuẩn (phục vụ C7) | Tài liệu chuẩn về PPDH |
| `MenhDeKienThuc` | Mệnh đề kiến thức chuẩn từ SGK/chương trình (phục vụ M6) | SGK |

**Quan hệ tiêu biểu:** `(BaiHoc)-[:CO_YCCD]->(YCCD)`, `(YCCD)-[:O_MUC]->(MucNhanThuc)`, `(BaiHoc)-[:HINH_THANH]->(NangLucTinHoc)`, `(ChiBaoNLS)-[:AP_DUNG_CHO]->(KhoiLop)`, `(PhuongPhapDH)-[:GOM_BUOC {thu_tu}]->(BuocQuyTrinh)`, `(MenhDeKienThuc)-[:THUOC]->(BaiHoc)`.

**Thuộc tính bắt buộc trên MỌI đỉnh/cạnh (vết xuất xứ):** `ma_nguon` (mã văn bản), `so_ky_hieu`, `ngay_hieu_luc`, `vi_tri_trang`. Ràng buộc kiểm tra khi nạp liệu — bản ghi thiếu vết bị từ chối.

### 5.3 Nạp liệu

- Script offline tại `init/backend/scripts/kg_lpv/` : đọc file curate chuẩn hóa (JSON/CSV do nhóm nghiên cứu chuẩn bị theo **lược đồ nạp liệu** mà module định nghĩa) → sinh Cypher `MERGE` idempotent → nạp vào 7688.
- Script `validate_graph.py`: đếm đỉnh/cạnh theo label, kiểm tra 100% có vết xuất xứ, kiểm tra ràng buộc unique (`ma_dinh_danh`), in báo cáo.
- Tạo index/constraint Cypher: unique trên `ma_dinh_danh` của `BaiHoc`, `YCCD`, `ChiBaoNLS`; fulltext index trên `ten` của `BaiHoc`, `ChuDe` (phục vụ N1 so khớp mờ).

## 6. Thiết kế Backend

### 6.1 Cấu trúc thư mục module

```
init/backend/app/modules/__init__.py
init/backend/app/modules/kg_lpv/
├── __init__.py
├── config.py            # đọc env KG_LPV_*; hằng số ngưỡng (fuzzy threshold, TTL cache…)
├── router.py            # APIRouter /kg-lpv; dependency require_kg_lpv()
├── schemas.py           # Pydantic: request/response, Finding, Report, Job, Status
├── error_codes.py       # Enum 15 mã lỗi + metadata (nhánh, trục, mô tả VN, loại kiểm: ALGORITHMIC/RULE/LLM_JUDGE)
├── graph_client.py      # driver Neo4j 7688 lazy-singleton read-only + truy vấn Cypher có tên
├── feature_flag.py      # đọc/ghi bảng feature_flags key='kg_lpv', cache TTL 30s
├── models.py            # SQLAlchemy: KgLpvJob, KgLpvFinding
├── pipeline/
│   ├── __init__.py
│   ├── orchestrator.py  # điều phối 4 bước, cập nhật tiến độ job, chạy N1‖N2 bằng asyncio.gather
│   ├── segmenter.py     # Bước 1: KHBD → JSON theo lược đồ + validator cấu trúc
│   ├── n1_identity.py   # Bước 2a: D1 — so khớp thuật toán với cây chương trình
│   ├── n2_curriculum.py # Bước 2b: M1–M6 — truy hồi thực thể + luật + LLM critic
│   ├── n3_pedagogy.py   # Bước 3: C1–C8 — 6 trục, phán xử nguyên tử, lọc hoạt động lỗi M*
│   └── repairer.py      # Bước 4: sửa cục bộ đoạn lỗi + diff + kiểm lại đoạn đổi & phụ thuộc
└── prompts/
    ├── __init__.py
    ├── segmentation.py  # prompt tách đoạn → JSON schema
    ├── n2_critic.py     # prompt phản biện diễn đạt tự do (M2, M6)
    ├── n3_judge.py      # prompt phán xử nguyên tử theo trục (kèm khuôn evidence)
    └── repair.py        # prompt sửa cục bộ 1 đoạn theo 1 finding
```

**File lõi bị chạm (tối thiểu, có chủ đích):**

| File | Thay đổi |
|---|---|
| `app/core/config.py` | Thêm `kg_lpv_enabled: bool = False` + 4 field `kg_lpv_neo4j_*` |
| `app/api/__init__.py` | Khối đăng ký có điều kiện: luôn đăng ký `status_router`; chỉ `include_router(kg_lpv.router)` khi `settings.kg_lpv_enabled` |
| `app/main.py` | Shutdown hook: đóng driver KG-LPV nếu đã init (try/except như driver hiện có) |
| `app/services/admin_ai_model_registry.py` | Thêm 4 feature key (mục 6.4) |
| `app/services/token_service.py` (MỚI) | Chuyển `_deduct_tokens`, `_check_token_balance` từ `lesson_builder.py` sang; `lesson_builder.py` import lại từ đây (refactor nhỏ, giữ nguyên hành vi, chạy lại test cũ) |
| `app/api/routes/admin.py` | Thêm 2 endpoint feature-flag (mục 6.3) |

### 6.2 Mô hình dữ liệu (PostgreSQL, 1 migration Alembic)

**`feature_flags`** — dùng chung, không riêng KG-LPV:
`key varchar(50) PK` · `enabled bool default false` · `config json null` · `updated_by int FK users.id null` · `updated_at timestamptz`

**`kg_lpv_jobs`**:
`id serial PK` · `user_id FK users.id` · `saved_lesson_plan_id FK saved_lesson_plans.id` · `status varchar(30)` (`pending → segmenting → verifying(N1‖N2) → verifying_n3 → done | failed | repairing → re_verifying → repaired`) · `progress smallint 0-100` · `segments json` (kết quả tách đoạn — lưu lại để chạy lại từng nhánh không tách lại) · `stats json` (số lỗi theo mã, thời gian từng bước, token đã dùng) · `error_message text null` · `created_at` · `finished_at null`

**`kg_lpv_findings`** (sổ lỗi — mỗi bản ghi 1 lỗi):
`id serial PK` · `job_id FK kg_lpv_jobs.id on delete cascade` · `code varchar(4)` (D1|M1..M6|C1..C8) · `branch varchar(2)` (N1|N2|N3) · `truc smallint null` (1–6, chỉ N3) · `section_id varchar(100)` (khớp `LessonPlanSection.section_id`) · `span json null` (offset đoạn văn trong section) · `evidence json` (danh sách `{kg_node_id, ma_nguon, so_ky_hieu, ngay_hieu_luc, vi_tri_trang, trich_dan}` hoặc `{text_span}`) · `explanation text` (tiếng Việt) · `status varchar(20)` (`open | repaired | dismissed | reverified_ok | reverified_fail`) · `repair_diff json null` (diff đoạn trước/sau khi sửa)

**Bất biến quan trọng:** finding không có `evidence` hợp lệ (mảng rỗng) **không được tạo** — enforce ở tầng service, không phải chỉ ở prompt.

### 6.3 API (prefix `/api/v1/kg-lpv`, tag `kg-lpv`)

| Method & Path | Guard | Mô tả |
|---|---|---|
| `GET /status` | user đăng nhập | `{enabled, availability, graph: {connected, node_count?}, version}` — luôn đăng ký kể cả khi env tắt |
| `POST /verify` | `require_kg_lpv` + rate-limit `5/minute` + kiểm token | Body `{lesson_plan_id}`. Kiểm quyền sở hữu KHBD, tạo job, chạy nền. → `202 {job_id}` |
| `GET /jobs/{job_id}` | require + owner | `{status, progress, stats}` — frontend poll |
| `GET /jobs/{job_id}/report` | require + owner | Sổ lỗi đầy đủ: findings nhóm theo nhánh/mã + tóm tắt đếm |
| `POST /jobs/{job_id}/repair` | require + owner + rate-limit + token | Body `{finding_ids: [..]}` (rỗng = tất cả `open`). Chạy bước 4 nền → 202 |
| `GET /jobs/{job_id}/diff` | require + owner | Các đoạn đã sửa: `{section_id, before, after, findings_addressed}` |
| `POST /jobs/{job_id}/apply` | require + owner | Ghi các đoạn đã sửa (được giáo viên duyệt) ngược vào `SavedLessonPlan.sections` — bước duy nhất chạm dữ liệu KHBD, yêu cầu xác nhận từ UI |
| `POST /findings/{id}/dismiss` | require + owner | Giáo viên bác bỏ 1 phát hiện (quyền tự chủ) — set `dismissed` |
| `GET /jobs/{job_id}/export` | require + owner | Xuất findings JSON/CSV (phục vụ gán nhãn chuyên gia ngoài hệ thống) |
| `GET /admin/feature-flags` (trong `admin.py`) | admin | Danh sách cờ |
| `PUT /admin/feature-flags/kg_lpv` | admin | `{enabled}` → ghi DB, xóa cache; audit log |

**Dependency `require_kg_lpv()`:** kiểm `settings.kg_lpv_enabled` → 404; kiểm cờ DB (cache 30s) → 403 "Chức năng kiểm chứng KHBD đang tắt"; kiểm `graph_client.is_healthy()` (cache 60s) → 503 "Đồ thị tri thức kiểm chứng chưa sẵn sàng".

### 6.4 Registry model AI — 4 feature key mới

Thêm vào `FEATURE_CONFIGS` (admin đổi model từng khâu trên UI có sẵn):

| Key | Label | Dùng cho | Default |
|---|---|---|---|
| `kg_lpv_segmentation` | KG-LPV: Tách đoạn KHBD | Bước 1 | `gemini-2.5-flash` |
| `kg_lpv_n2_critic` | KG-LPV: Phản biện N2 | M2, M6 | `gemini-2.5-flash` |
| `kg_lpv_n3_judge` | KG-LPV: Phán xử N3 | C2, C4, C5, C7, C8 | `gemini-2.5-pro` (phán xử cần chính xác hơn) |
| `kg_lpv_repair` | KG-LPV: Sửa KHBD | Bước 4 | `gemini-2.5-flash` |

Mọi lượt gọi LLM: temperature 0.0–0.2, `response_mime_type: application/json`, validate schema, retry 1 lần khi JSON hỏng, đi qua `gemini_limiter` sẵn có.

## 7. Thiết kế pipeline kiểm chứng (chi tiết từng bước)

### Bước 1 — Tách đoạn (`segmenter.py`)

- Đầu vào: `SavedLessonPlan.sections` (đã là JSON có `section_id`, `section_type`) → **tận dụng cấu trúc sẵn có**, LLM chỉ cần tách sâu hơn: trong mỗi hoạt động, bóc 4 thành phần `{muc_tieu, noi_dung, san_pham, to_chuc_thuc_hien}`; trong mục tiêu, bóc từng mệnh đề mục tiêu riêng lẻ kèm loại (kien_thuc | nang_luc_tin_hoc | nang_luc_chung | pham_chat | nang_luc_so).
- Validator thuật toán sau LLM: đúng kiểu dữ liệu, `segment_id` duy nhất, mọi đoạn ánh xạ về đúng `section_id` gốc, không mất nội dung (tổng độ dài văn bản khớp ±5%). Fail → job `failed` với lỗi cấu trúc, không đi tiếp.
- Kết quả lưu `kg_lpv_jobs.segments` — các nhánh sau và bước kiểm lại đọc từ đây.

### Bước 2a — N1 Định danh (`n1_identity.py`) → D1

- Thuật toán thuần: trích `{grade, book_type, topic, lesson_name, lesson_id}` từ KHBD → so khớp cây `KhoiLop→ChuDe→BaiHoc` trong đồ thị (exact theo `ma_dinh_danh` trước, fulltext + tỉ lệ Levenshtein ≥ ngưỡng cấu hình sau).
- Không khớp / khớp nhiều mơ hồ / định hướng lệch → finding D1 với evidence là đỉnh gần nhất tìm được + lý do.

### Bước 2b — N2 Đối chiếu chương trình (`n2_curriculum.py`) → M1–M6 (chạy song song với N1)

- Truy hồi 1 lần "gói ngữ cảnh bài học" từ đồ thị: YCCĐ + mức nhận thức, biểu hiện NLa–NLe theo cấp, biểu hiện NL chung/phẩm chất, chỉ báo NLS theo khối lớp, mệnh đề kiến thức SGK → cache trong job (dùng lại cho N3, không truy vấn lặp).
- `RULE`: M1 (mục tiêu ⊆ YCCĐ và không thấp hơn mức), M3/M4/M5 (mã năng lực/phẩm chất/chỉ báo NLS khai báo phải tồn tại đúng trong đồ thị, đúng khối lớp) — so khớp cấu trúc.
- `LLM_JUDGE`: M2 (động từ đo được — tra bảng `DongTuNhanThuc` trước, LLM chỉ xử câu không có động từ trong bảng), M6 (mệnh đề kiến thức đối chiếu `MenhDeKienThuc`; LLM phản biện với ngữ cảnh trích từ đồ thị, bắt buộc trả `evidence_refs`).
- Đầu ra phụ: tập `hoat_dong_loi_M` — danh sách section hoạt động dính M6, chuyển cho N3 để loại trừ.

### Bước 3 — N3 Nhất quán sư phạm (`n3_pedagogy.py`) → C1–C8

- Chỉ chạy sau khi N1+N2 xong; **loại các hoạt động trong `hoat_dong_loi_M`** khỏi vai trò bằng chứng.
- Đơn vị kiểm chung: mức nhận thức của mục tiêu đã hợp lệ sau N2. Mỗi quan hệ xác nhận bằng **bộ ba bằng chứng**: hành động học tập đúng mức + sản phẩm thể hiện năng lực + tiêu chí đánh giá quan sát được trên sản phẩm; thiếu/lệch bất kỳ thành phần → finding.
- 6 trục, mỗi trục 1 hàm riêng trả `list[Finding]`:
  1. **Nhất quán dọc** (C4): xây đồ thị hai phía mục tiêu↔hoạt động trong bộ nhớ; mục tiêu không được hiện thực / hoạt động mồ côi → C4. Thuật toán + đối chiếu mức.
  2. **Nhất quán nội bộ hoạt động** (C4): 4 thành phần khớp nhau — phán xử nguyên tử.
  3. **Căn chỉnh mục tiêu–hoạt động–sản phẩm–đánh giá** (C4, C5): phán xử có neo mức.
  4. **Cụ thể hóa năng lực** (C1, C2, C8): C1 kiểm bằng đồ thị (NLa–NLc truy về nội dung); C2/C8 phán xử theo bằng chứng, C8 đối chiếu chỉ báo NLS trong gói ngữ cảnh.
  5. **Thực chất phương pháp/kĩ thuật** (C7): so bước tổ chức với `BuocQuyTrinh` trong đồ thị (thuật toán so trình tự) + phán xử phần diễn đạt.
  6. **Tiến trình & điều kiện triển khai** (C3, C5, C6): thứ tự khởi động→vận dụng, thời lượng cộng dồn, thiết bị khai báo vs sử dụng — thuật toán; mạch phát triển mức nhận thức không thụt lùi — phán xử.
- Phán xử nguyên tử chạy song song có giới hạn (semaphore 4–6 đồng thời qua `gemini_limiter`).

### Bước 4 — Sửa & kiểm lại (`repairer.py`)

- Đầu vào: findings `open` được chọn. Chỉ finding có evidence hợp lệ mới được sửa (bất biến mục 6.2).
- Với mỗi finding: LLM sửa **cục bộ đúng đoạn lỗi** (prompt = đoạn gốc + finding + evidence + quy tắc "chỉ sửa tối thiểu"), sinh `{before, after}` diff.
- Kiểm lại: chạy lại đúng các tiêu chí liên quan trên **đoạn đã đổi + đoạn phụ thuộc** (map phụ thuộc tĩnh: sửa mục tiêu → kiểm lại trục 1/3 của các hoạt động neo vào nó; sửa hoạt động → kiểm lại trục 2/5/6 của chính nó + trục 1). Pass → `repaired`; fail → `reverified_fail`, giữ nguyên KHBD.
- **Không tự ghi vào KHBD**: bản sửa nằm ở `repair_diff`, chỉ `POST /apply` (giáo viên duyệt trên UI diff) mới ghi vào `SavedLessonPlan`.

## 8. Thiết kế Frontend

**File mới:**

```
init/frontend/src/services/kgLpvApi.ts        # gọi 8 endpoint; types Finding/Report/Job/Status
init/frontend/src/hooks/useKgLpvStatus.ts     # fetch /status 1 lần, expose {enabled, availability}
init/frontend/src/hooks/useKgLpvJob.ts        # start verify, poll job 2.5s, dừng khi done/failed
init/frontend/src/components/kg-lpv/
├── VerifyButton.tsx          # nút "Kiểm chứng KHBD" (ẩn khi !enabled)
├── VerificationPanel.tsx     # panel trượt phải: tiến độ job → sổ lỗi nhóm theo N1/N2/N3
├── FindingCard.tsx           # badge mã lỗi + nhánh, vị trí (click scroll tới section), bằng chứng
│                             #   (nguồn, số ký hiệu, trang), giải thích, nút Sửa / Bỏ qua
├── RepairDiffModal.tsx       # so sánh before/after từng đoạn, duyệt từng đoạn → gọi /apply
└── SummaryBar.tsx            # đếm lỗi theo mã, trạng thái tổng
```

**File sửa (tối thiểu):**
- `ViewSavedLessonPlanPage.tsx` + `LessonPlanBuilderPage.tsx`: gắn `VerifyButton` + `VerificationPanel` (render có điều kiện theo `useKgLpvStatus`).
- `AdminAIModelsPage.tsx`: 4 feature key mới tự xuất hiện qua API registry sẵn có; thêm **section công tắc KG-LPV** (toggle gọi `PUT /admin/feature-flags/kg_lpv`) + hiển thị `availability` của đồ thị.

**Nguyên tắc UX:** kiểm chứng là bất đồng bộ — giáo viên bấm rồi có thể tiếp tục chỉnh sửa; panel cập nhật tiến độ theo bước (Tách đoạn → Định danh & Đối chiếu → Nhất quán sư phạm → Hoàn tất). Mọi phát hiện đều bác bỏ được (quyền tự chủ giáo viên). Không bao giờ tự động thay nội dung KHBD.

## 9. Hiệu năng, chi phí & độ chính xác

- **Song song:** N1 ‖ N2 (`asyncio.gather`); phán xử N3 song song theo semaphore; mục tiêu tổng thời gian ≤ 3 phút/KHBD điển hình (~8–12 section).
- **Giảm gọi LLM:** tầng ALGORITHMIC/RULE xử trước (dự kiến ≥ 60% tiêu chí không tốn token); gói ngữ cảnh đồ thị truy hồi 1 lần/job; bảng động từ nhận thức chặn phần lớn M2 không cần LLM.
- **Token người dùng:** ước lượng trước theo số section (`_ESTIMATE = base + k × sections`), kiểm số dư trước khi tạo job, trừ theo thực dùng cộng dồn vào `stats.tokens` (tái dùng `token_service`).
- **Neo4j:** index/constraint ở mục 5.3; truy vấn có tên tập trung trong `graph_client.py` (dễ EXPLAIN/tối ưu); pool ≤ 5; timeout 15s.
- **Tính tái lập:** temperature ≤ 0.2, JSON schema, mọi verdict kèm evidence; lưu `segments` để chạy lại từng nhánh không cần tách lại.
- **An toàn khi hỏng:** đồ thị chết giữa job → job `failed` kèm message, không treo; LLM lỗi 1 phán xử → retry 1 lần rồi ghi finding dạng `explanation="không phán xử được"` KHÔNG tính là lỗi nội dung (không tạo false positive).

## 10. Bảo mật & phân quyền

- Mọi endpoint sau `get_current_user`; job/report/diff kiểm tra quyền sở hữu (`user_id` khớp) như pattern `get_saved_lesson_plan` hiện có.
- Feature-flag & cấu hình model: chỉ role `admin` (dependency admin sẵn có trong `admin.py`); ghi `audit_log` khi bật/tắt.
- Nội dung KHBD đưa vào prompt đi qua `prompt_sanitize` sẵn có; đồ thị KG-LPV read-only ở runtime (user Neo4j chỉ cấp quyền reader).
- Rate-limit: `POST /verify` và `POST /repair` 5/minute; GET 30/minute (đồng bộ pattern hiện có).

## 11. Kiểm thử & tiêu chí nghiệm thu

**Chiến lược:** mock Neo4j driver (pattern `_mock_neo4j` trong `test_lesson_builder.py`) + mock genai; fixture "KHBD gieo lỗi" — mỗi mã lỗi có ít nhất 1 KHBD mẫu chứa đúng lỗi đó và 1 mẫu sạch.

| Nhóm test | Nội dung | File |
|---|---|---|
| Toggle 3 tầng | env tắt → 404 các route (trừ /status); DB flag tắt → 403 + /status enabled=false; đồ thị chết → 503, app chính vẫn 200 | `tests/kg_lpv/test_toggle.py` |
| Segmenter | JSON đúng lược đồ, validator bắt id trùng/mất nội dung | `tests/kg_lpv/test_segmenter.py` |
| N1 | khớp đúng, sai lớp → D1, tên gần đúng theo ngưỡng fuzzy | `tests/kg_lpv/test_n1.py` |
| N2 | mỗi mã M1–M6: fixture lỗi → đúng 1 finding đúng mã, có evidence; fixture sạch → 0 finding; finding không evidence bị chặn | `tests/kg_lpv/test_n2.py` |
| N3 | mỗi mã C1–C8 tương tự; hoạt động dính M6 không được dùng làm bằng chứng (nguyên tắc ưu tiên) | `tests/kg_lpv/test_n3.py` |
| Repairer | chỉ đoạn lỗi bị đổi; kiểm lại đoạn phụ thuộc; /apply cần duyệt | `tests/kg_lpv/test_repair.py` |
| API + quyền | owner-only, rate-limit, token không đủ → 402/400 | `tests/kg_lpv/test_api.py` |
| Token service refactor | test cũ `test_lesson_builder.py` vẫn xanh nguyên vẹn | chạy lại suite hiện có |
| Frontend | hook status ẩn/hiện UI; panel render findings; diff modal | `src/__tests__/kg-lpv/*.test.tsx` |

**Nghiệm thu tổng thể:** (1) tắt module mọi tầng → toàn bộ app hoạt động như trước, 0 kết nối tới 7688; (2) bật → kiểm chứng trọn vẹn 1 KHBD mẫu ra sổ lỗi có bằng chứng truy vết; (3) sửa 1 finding → diff → apply → KHBD cập nhật đúng 1 đoạn; (4) admin toggle không cần restart.

---

## 12. Phân rã công việc theo giai đoạn

> Mỗi task kết thúc bằng deliverable kiểm chứng được độc lập + commit riêng. Thứ tự bắt buộc: 0 → 1 → 2 → 3 → (4 ‖ 5) → 6 → 7 → 8 → 9. Task 4 và 5 độc lập nhau sau khi Task 3 xong.

### Task 0: Hạ tầng đồ thị riêng
**Files:** Modify `init/docker-compose.yml`; Modify `init/backend/.env.example` (nếu có) / README env table.
**Produces:** service `neo4j-kglpv` (profile `kg-lpv`, ports 7475/7688, volume riêng); 4 biến env `KG_LPV_NEO4J_*`.
- [ ] Xác nhận với chủ dự án: 7475 = browser, bolt = 7688 (giả định toàn kế hoạch)
- [ ] Thêm service + profile + healthcheck + volumes vào docker-compose
- [ ] Verify: `docker compose --profile kg-lpv up neo4j-kglpv` → mở được `http://localhost:7475`; `docker compose up` (không profile) → container KHÔNG chạy
- [ ] Commit

### Task 1: Khung module + bật/tắt 3 tầng
**Files:** Create `app/modules/kg_lpv/{__init__,config,router,schemas,feature_flag,graph_client,error_codes}.py`; Create `app/services/token_service.py`; Create migration `feature_flags`; Modify `app/core/config.py`, `app/api/__init__.py`, `app/main.py`, `app/api/routes/admin.py`, `app/api/routes/lesson_builder.py` (đổi import token helpers).
**Produces:** `require_kg_lpv()` dependency; `GET /kg-lpv/status`; `GET/PUT /admin/feature-flags/*`; `GraphClient.is_healthy()`; `token_service.deduct_tokens/check_token_balance` (giữ nguyên chữ ký cũ).
- [ ] Viết test toggle (env off → 404; flag off → 403; graph down → status degraded) — chạy fail
- [ ] Hiện thực khung + đăng ký có điều kiện + cache cờ TTL 30s
- [ ] Refactor token helpers sang `token_service`, chạy lại `test_lesson_builder.py` xác nhận xanh
- [ ] Verify: test toggle xanh; bật/tắt flag qua API admin có hiệu lực ≤ 30s không restart
- [ ] Commit

### Task 2: Lược đồ đồ thị + script nạp liệu
**Files:** Create `init/backend/scripts/kg_lpv/{schema.cypher, import_kg.py, validate_graph.py, README.md}`; Create định dạng file curate mẫu `scripts/kg_lpv/samples/*.json`.
**Produces:** constraint/index Cypher; importer idempotent; validator vết xuất xứ; tài liệu lược đồ nạp liệu cho nhóm chuẩn bị dữ liệu.
- [ ] Viết schema.cypher (labels, constraints, fulltext index mục 5.2–5.3)
- [ ] Importer đọc JSON curate → MERGE; từ chối bản ghi thiếu vết xuất xứ
- [ ] Nạp bộ dữ liệu mẫu tối thiểu (1 khối lớp, 1 chủ đề, 2 bài, YCCĐ, NL, NLS, 1 phương pháp có quy trình) đủ cho test end-to-end
- [ ] Verify: `validate_graph.py` báo 100% có vết; truy vấn mẫu trả đúng bài học
- [ ] Commit

### Task 3: Bảng job/findings + Bước 1 tách đoạn
**Files:** Create `app/modules/kg_lpv/models.py`, migration `kg_lpv_jobs` + `kg_lpv_findings`; Create `pipeline/{orchestrator,segmenter}.py`, `prompts/segmentation.py`; Modify `router.py` (POST /verify, GET /jobs/{id}); Modify `admin_ai_model_registry.py` (key `kg_lpv_segmentation`).
**Produces:** `orchestrator.run_job(job_id)` (job nền, cập nhật progress); `segmenter.segment(sections) -> SegmentedPlan`; schema `SegmentedPlan` (Pydantic) các nhánh sau tiêu thụ.
- [ ] Test segmenter với fixture KHBD mẫu (mock genai) + validator bắt lỗi cấu trúc — fail → hiện thực → xanh
- [ ] Test POST /verify: tạo job, trừ/kiểm token, poll thấy progress
- [ ] Commit

### Task 4: N1 định danh (D1)
**Files:** Create `pipeline/n1_identity.py`; Modify `graph_client.py` (truy vấn so khớp cây chương trình).
**Produces:** `n1_verify(segments, graph) -> list[Finding]` — thuật toán thuần, không LLM.
- [ ] Test: fixture đúng → 0 finding; sai lớp/chủ đề/tên mờ → D1 kèm evidence đỉnh gần nhất — fail → hiện thực → xanh
- [ ] Commit

### Task 5: N2 đối chiếu chương trình (M1–M6)
**Files:** Create `pipeline/n2_curriculum.py`, `prompts/n2_critic.py`; Modify `graph_client.py` (truy vấn gói ngữ cảnh bài học); Modify `admin_ai_model_registry.py` (key `kg_lpv_n2_critic`).
**Produces:** `n2_verify(segments, lesson_ctx) -> (list[Finding], set[section_id])` (kèm tập hoạt động lỗi M*); `graph_client.get_lesson_context(lesson_id) -> LessonContext` (cache trong job, N3 dùng lại).
- [ ] Test từng mã M1–M6 với fixture gieo lỗi (mock graph + mock genai); test chặn finding không evidence — fail → hiện thực → xanh
- [ ] Ghép vào orchestrator: N1 ‖ N2 bằng `asyncio.gather`; test tích hợp 2 nhánh
- [ ] Commit

### Task 6: N3 nhất quán sư phạm (C1–C8, 6 trục)
**Files:** Create `pipeline/n3_pedagogy.py`, `prompts/n3_judge.py`; Modify `admin_ai_model_registry.py` (key `kg_lpv_n3_judge`).
**Produces:** `n3_verify(segments, lesson_ctx, excluded_sections) -> list[Finding]`; 6 hàm trục độc lập; khuôn phán xử nguyên tử `{verdict, evidence_refs, explanation}`.
- [ ] Test từng mã C1–C8 + test nguyên tắc ưu tiên (hoạt động trong excluded không làm bằng chứng) — fail → hiện thực → xanh
- [ ] Test bộ ba bằng chứng: thiếu 1 trong 3 thành phần → finding
- [ ] Ghép orchestrator đầy đủ 3 bước; GET /report trả sổ lỗi nhóm nhánh; Commit

### Task 7: Frontend kiểm chứng
**Files:** Create `src/services/kgLpvApi.ts`, `src/hooks/{useKgLpvStatus,useKgLpvJob}.ts`, `src/components/kg-lpv/{VerifyButton,VerificationPanel,FindingCard,SummaryBar}.tsx`; Modify `ViewSavedLessonPlanPage.tsx`, `LessonPlanBuilderPage.tsx`, `AdminAIModelsPage.tsx`.
**Produces:** UI trọn luồng: bật/tắt admin, nút kiểm chứng, tiến độ, sổ lỗi, dismiss.
- [ ] Vitest: hook status ẩn UI khi disabled; panel render findings; dismiss gọi đúng API
- [ ] Verify thủ công: chạy end-to-end với đồ thị mẫu Task 2 trên 1 KHBD thật
- [ ] Commit

### Task 8: Sửa & kiểm lại + diff UI
**Files:** Create `pipeline/repairer.py`, `prompts/repair.py`, `src/components/kg-lpv/RepairDiffModal.tsx`; Modify `router.py` (POST /repair, GET /diff, POST /apply), `admin_ai_model_registry.py` (key `kg_lpv_repair`).
**Produces:** `repair(findings) -> list[SectionDiff]`; re-verify theo map phụ thuộc; `/apply` ghi vào `SavedLessonPlan` sau duyệt.
- [ ] Test: chỉ đoạn lỗi đổi; đoạn phụ thuộc được kiểm lại; finding không evidence bị từ chối sửa — fail → hiện thực → xanh
- [ ] Test /apply: cập nhật đúng section, các section khác nguyên vẹn
- [ ] Commit

### Task 9: Tối ưu, hardening & tài liệu
**Files:** Modify `orchestrator.py` (semaphore, đo thời gian vào `stats`), `graph_client.py` (timeout/degraded), `README.md` (mục KG-LPV: profile compose, env, cách bật), Create `GET /jobs/{id}/export`.
- [ ] Đo thời gian job trên KHBD mẫu; xác nhận N1‖N2 song song; mục tiêu ≤ 3 phút
- [ ] Test hỏng hóc: giết container giữa job → job failed sạch, app chính OK
- [ ] Chạy toàn bộ test backend + frontend; cập nhật README; Commit

---

## 13. Rủi ro & giả định mở

| # | Rủi ro / Giả định | Ảnh hưởng | Ứng phó |
|---|---|---|---|
| 1 | **Giả định bolt = 7688** (user chỉ nêu 7475 = browser) | Sai cổng → không kết nối | Xác nhận ở Task 0 trước khi code; chỉ là 1 biến env, đổi rẻ |
| 2 | Dữ liệu chuẩn chưa được curate đầy đủ | N2/N3 thiếu căn cứ → nhiều "không phán xử được" | Bộ dữ liệu mẫu tối thiểu (Task 2) đủ chạy e2e; module tách khỏi tiến độ nạp liệu |
| 3 | Chi phí token phán xử N3 cao với KHBD dài | Trải nghiệm + chi phí | Tầng luật chặn trước; ước lượng token trước khi chạy; admin đổi model rẻ hơn |
| 4 | LLM phán xử không ổn định giữa các lần chạy | Kết quả kiểm chứng dao động | Temperature ≤ 0.2 + câu hỏi nguyên tử + bắt buộc evidence; lỗi thiếu evidence không tạo finding |
| 5 | Backend restart giữa job (asyncio task mất) | Job kẹt `verifying` | Startup hook quét job dở > 15 phút → đánh `failed` với message "gián đoạn hệ thống, chạy lại" |
| 6 | Refactor token helpers đụng luồng sinh KHBD | Regression tính token | Giữ nguyên chữ ký + hành vi; suite test cũ phải xanh nguyên vẹn (Task 1) |

## 14. Tự rà soát (đối chiếu đặc tả nghiên cứu)

- ✅ 4 bước pipeline (Hình 2): Task 3 (tách đoạn), Task 4+5 (N1‖N2 song song), Task 6 (N3), Task 8 (sửa & kiểm lại đoạn đổi + phụ thuộc).
- ✅ 15 mã lỗi Bảng 1: D1→Task 4; M1–M6→Task 5; C1–C8 theo 6 trục (Hình 3)→Task 6.
- ✅ Sổ lỗi đủ trường (mã, vị trí, nhánh, bằng chứng, giải thích) + nguyên tắc "thiếu bằng chứng không chuyển sang sửa": schema `kg_lpv_findings` + bất biến mục 6.2 + test Task 5/8.
- ✅ Nguyên tắc ưu tiên nhánh (hoạt động lỗi M* không làm bằng chứng N3): output phụ Task 5 → input Task 6 + test riêng.
- ✅ Bộ ba bằng chứng neo mục tiêu + phán xử nguyên tử: mục 7 bước 3 + test Task 6.
- ✅ Vết xuất xứ trên đồ thị: mục 5.2 + validator Task 2.
- ✅ N1 không LLM: mục 7 bước 2a.
- ✅ Bật/tắt linh hoạt: 3 tầng (mục 4) + test toggle Task 1.
- ✅ Đồ thị riêng cổng 7475: mục 5.1 + Task 0 (giả định bolt 7688 cần xác nhận).
- ✅ Xuất findings phục vụ gán nhãn chuyên gia: `GET /export` Task 9 (phần alpha/đồng thuận ngoài phạm vi, đã ghi rõ mục 2).

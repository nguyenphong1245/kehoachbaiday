# Thiết kế: "Sửa tự động" — Review & Auto-fix cho KG-LPV

**Ngày:** 2026-07-06
**Trạng thái:** Đã duyệt hướng thiết kế (chờ review spec)
**Nhánh:** feat/kg-lpv-module (tiếp nối module KG-LPV đã hoàn tất)

## 1. Mục tiêu

Thêm luồng **"Sửa tự động"** vào menu Hành động của giáo án: giáo viên bấm một nút → xem KHBD cùng với các nhận xét lỗi (do KG-LPV phát hiện) neo tại đúng mục/hoạt động chứa lỗi → **chỉnh hoặc bỏ từng nhận xét** → bấm "Sửa" thì hệ thống mới thực sự sửa các lỗi đã xác nhận, rồi giáo viên duyệt bản diff trước khi ghi vào KHBD.

**Không** xây giao diện sửa mới hoàn toàn — tái dùng tối đa pipeline verify/repair và các component đã có (`VerificationPanel`, `FindingCard`, `RepairDiffModal`, `useKgLpvJob`), chỉ thêm/chỉnh phần còn thiếu.

## 2. Quyết định đã chốt (từ brainstorming)

| # | Quyết định |
|---|---|
| Điểm vào | Mục **"Sửa tự động"** trong dropdown "Hành động" của `LessonPlanOutput`, ngay trên "Sửa từng phần" |
| Bố cục | **2 khung docked**: KHBD bên trái (giữ nguyên `LessonPlanOutput`), cột nhận xét lỗi bên phải (không phủ lên KHBD) |
| Độ chính xác neo | **Theo mục/hoạt động** (`section_id`): cuộn tới + tô nền cả khối; không cố highlight từng câu |
| Sửa nhận xét | Giáo viên **chỉnh được nội dung nhận xét** hoặc **bỏ qua** (dismiss); mặc định giữ |
| Nhận xét đã chỉnh dùng làm gì | **Cả hai**: không chỉnh → AI sửa theo lỗi gốc; có chỉnh → AI ưu tiên làm theo nhận xét đã chỉnh (`explanation_override`) |
| Thời điểm sửa | Chỉ chạy sửa khi giáo viên bấm **"Sửa N lỗi đã chọn"** (batch, sau khi xác nhận tập lỗi) |
| Lưu nhận xét đã chỉnh | **Không lưu DB** — override truyền tạm trong request repair; đóng phiên là mất (chấp nhận, tránh migration) |
| Nút nổi "Kiểm chứng KHBD" cũ | **Giữ** cho luồng chỉ-xem (rẻ, không xung đột) |

## 3. Kiến trúc & luồng

```
Menu "Hành động" → "Sửa tự động"
   │
   ├─ useKgLpvJob chưa có job ở trạng thái cuối cho KHBD này? → startVerify() + poll
   │   (đã có job "done"/"repaired" trong phiên → dùng lại, không verify lại)
   │
   ▼
Chế độ review 2 khung (VerificationPanel dạng docked)
   ┌─────────────────────────────┬──────────────────────────────┐
   │  KHBD (LessonPlanOutput)     │  Sổ lỗi (cột phải)            │
   │  - mỗi mục/hoạt động có      │  - FindingCard theo N1/N2/N3  │
   │    id={section_id}           │  - [✎] sửa nhận xét           │
   │  - click nhận xét → cuộn +   │  - [Bỏ qua] dismiss           │
   │    tô nền khối tương ứng     │  - [☑] chọn để sửa            │
   │                              │  - nút "Sửa N lỗi đã chọn"    │
   └─────────────────────────────┴──────────────────────────────┘
   │  Bấm "Sửa N lỗi đã chọn"
   ▼
POST /jobs/{id}/repair  { findings: [{id, explanation_override?}] }
   │  (nền: repairing → re_verifying → repaired)
   ▼
RepairDiffModal (đã có): before/after mỗi section → GV duyệt
   ▼
POST /jobs/{id}/apply  → ghi các section đã duyệt vào SavedLessonPlan
```

## 4. Thay đổi Backend (tối thiểu, 1 điểm logic)

### 4.1 `POST /jobs/{job_id}/repair` — nhận override
File: `init/backend/app/modules/kg_lpv/router.py` (`start_repair`) + `schemas.py` (`RepairRequest`).

- `RepairRequest` hỗ trợ **cả hai dạng** (tương thích ngược):
  - `finding_ids: list[int] | None` (như hiện tại), hoặc
  - `findings: list[RepairFindingItem] | None` với `RepairFindingItem = {id: int, explanation_override: str | None}`.
- Nếu cả hai rỗng → sửa tất cả finding `status="open"` (hành vi hiện tại giữ nguyên).
- Chuẩn hóa về một `dict[int, str | None]` (finding_id → override) truyền xuống job nền.

### 4.2 `repairer.repair()` — dùng override khi sửa
File: `init/backend/app/modules/kg_lpv/pipeline/repairer.py`.

- `repair(db, job, findings, overrides: dict[int, str] | None = None)`.
- Trong vòng sửa từng finding: `explanation = overrides.get(f.id) or f.explanation`.
- `build_repair_prompt(current_text, f.code, explanation, f.evidence)` — dùng `explanation` (đã override nếu có).
- **Không đổi** gate (chỉ `status="open"` + evidence≠rỗng), re-verify, hay bất biến "chỉ /apply mới ghi KHBD".
- `run_repair_job(job_id, finding_ids, overrides)` truyền override xuống.

### 4.3 Bất biến giữ nguyên
- Chỉ `/apply` ghi vào `SavedLessonPlan`.
- Finding `unjudged`/`dismissed`/evidence rỗng: không sửa.
- Override chỉ đổi *chỉ dẫn* gửi cho AI, không đổi mã lỗi, không đổi cách re-verify.

## 5. Thay đổi Frontend

### 5.1 Menu item — `LessonPlanOutput.tsx`
Thêm nút "Sửa tự động" (icon `Sparkles`/`Wand2`, màu tím-indigo) vào dropdown Hành động, phía trên "Sửa từng phần". Nhận prop callback `onAutoFix?: () => void` từ trang cha; ẩn khi KG-LPV tắt (`useKgLpvStatus`). Nút "Sửa từng phần" (luồng `lesson_plan_edit` cũ) **giữ nguyên**, không đụng.

### 5.2 Section anchors — `LessonPlanOutput.tsx`
Bọc mỗi khối section render bằng `id={"kglpv-section-" + section_id}` để cuộn/tô nền (dùng đúng tiền tố này ở mọi nơi `onLocate` tra cứu). Đây cũng là phần làm `onLocate` (đang no-op từ Task 7) hoạt động thật.

### 5.3 `VerificationPanel.tsx` — thêm chế độ docked + batch
- Thêm prop `variant?: "overlay" | "docked"` (mặc định `overlay` giữ tương thích). `docked` → render thành cột phải cố định co giãn cùng layout, không phủ KHBD.
- Thêm vùng chọn: mỗi finding `open` có checkbox (mặc định chọn); nút **"Sửa N lỗi đã chọn"** ở chân cột → gọi `onRepairBatch(selected: {id, explanation_override?}[])`.
- `onLocate(section_id)` → cuộn tới `#kglpv-section-...` + thêm class tô nền tạm (~2s).

### 5.4 `FindingCard.tsx` — sửa nhận xét + chọn
- `explanation` hiển thị ở chế độ đọc; nút ✎ chuyển sang `<textarea>` sửa tại chỗ; lưu vào state cục bộ (không gọi API).
- Thêm prop `selectable`, `selected`, `onToggleSelect`, `onExplanationChange(findingId, text)`.
- `unjudged`/`dismissed`: chỉ đọc, không checkbox, không sửa (giữ quy ước cũ).

### 5.5 `useKgLpvJob.ts` — batch repair kèm override
- `repairBatch(items: {id: number; explanation_override?: string}[])` → gọi `kgLpvApi.startRepair(jobId, items)` → poll tới `repaired` → `getDiff` → mở `RepairDiffModal` (như `repair()` hiện có, chỉ khác là nhận danh sách + override).
- Giữ `repair(findingId)` cũ cho luồng sửa-từng-lỗi trong overlay.

### 5.6 `kgLpvApi.ts` + `types/kgLpv.ts`
- `startRepair(jobId, items)` gửi body `{ findings: items }` (hoặc `{ finding_ids }` nếu không có override — tùy cách gọi).
- Cập nhật type `RepairRequest`.

### 5.7 Trang cha — `ViewSavedLessonPlanPage.tsx` / `LessonPlanBuilderPage.tsx`
- Truyền `onAutoFix` xuống `LessonPlanOutput`; `onAutoFix` = (nếu cần) `startVerify` rồi mở panel ở `variant="docked"`.
- Bố cục trang: khi mở docked, KHBD co bớt chiều rộng nhường cột phải (flex).

## 6. Cấu trúc file (thêm/sửa)

| Loại | File | Việc |
|---|---|---|
| Sửa | `backend/.../router.py` | `RepairRequest` nhận `findings[]`; `start_repair` chuẩn hóa override |
| Sửa | `backend/.../schemas.py` | `RepairFindingItem`, `RepairRequest` mở rộng |
| Sửa | `backend/.../pipeline/repairer.py` | `repair`/`run_repair_job` nhận & dùng `overrides` |
| Sửa | `frontend/.../LessonPlanOutput.tsx` | menu item + section anchors |
| Sửa | `frontend/.../VerificationPanel.tsx` | `variant="docked"` + chọn + nút batch |
| Sửa | `frontend/.../FindingCard.tsx` | sửa explanation + checkbox chọn |
| Sửa | `frontend/.../useKgLpvJob.ts` | `repairBatch` |
| Sửa | `frontend/.../services/kgLpvApi.ts`, `types/kgLpv.ts` | body repair + type |
| Sửa | `frontend/.../ViewSavedLessonPlanPage.tsx`, `LessonPlanBuilderPage.tsx` | `onAutoFix`, layout docked |

Không có file/trang mới hoàn toàn.

## 7. Kiểm thử

**Backend:**
- `repair` với `overrides`: prompt dùng đúng explanation_override khi có, dùng gốc khi không; các bất biến (gate, re-verify, /apply) không đổi.
- `RepairRequest` nhận cả `finding_ids` (cũ) lẫn `findings[]` (mới); rỗng → sửa tất cả `open`.
- Owner-only, non-owner 404 (giữ nguyên).

**Frontend (vitest):**
- Menu item "Sửa tự động" ẩn khi KG-LPV tắt; hiện & gọi `onAutoFix` khi bật.
- `FindingCard`: sửa explanation cập nhật state + gọi `onExplanationChange`; checkbox chọn/bỏ; `unjudged` không sửa được.
- `VerificationPanel` docked: nút "Sửa N lỗi đã chọn" gọi `onRepairBatch` với đúng danh sách id + override.
- `onLocate` cuộn tới đúng section anchor (mock scrollIntoView).

## 8. Ngoài phạm vi (YAGNI)

- Không highlight từng câu/đoạn (chỉ theo mục/hoạt động).
- Không lưu nhận xét đã chỉnh vào DB (chỉ tạm trong phiên).
- Không đổi thuật toán verify/re-verify hay thêm mã lỗi.
- Không gỡ nút nổi "Kiểm chứng KHBD" hay luồng "Sửa từng phần" cũ.
- Không đụng luồng bình luận GV (`lesson_plan_comment`).

## 9. Rủi ro

| Rủi ro | Ứng phó |
|---|---|
| Layout docked làm vỡ bố cục trang trên màn nhỏ | Trên mobile fallback về overlay như cũ (`variant` theo breakpoint) |
| `section_id` render trong `LessonPlanOutput` không khớp `section_id` của finding | Xác minh nguồn `section_id` (segmenter dùng `section_id` từ `SavedLessonPlan.sections`) — cùng nguồn, cần test khớp |
| GV chỉnh nhận xét rồi không sửa → mất chỉnh sửa | Chấp nhận (đã chốt: chỉ tạm trong phiên) |

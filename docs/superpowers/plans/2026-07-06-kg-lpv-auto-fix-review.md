# "Sửa tự động" (KG-LPV Auto-fix Review) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm luồng "Sửa tự động" vào menu Hành động của giáo án — mở KHBD cạnh sổ lỗi neo theo mục/hoạt động, cho giáo viên chỉnh/bỏ từng nhận xét rồi bấm một nút để AI sửa các lỗi đã xác nhận và duyệt diff trước khi ghi.

**Architecture:** Tái dùng toàn bộ pipeline verify/repair + component KG-LPV đã có. Thêm 1 điểm backend (`/repair` nhận `explanation_override` tùy chọn) và mở rộng frontend: menu item, neo section, panel dạng docked 2 khung, FindingCard sửa-được + chọn-được, và một nút "Sửa N lỗi đã chọn" gọi repair theo lô.

**Tech Stack:** FastAPI + async SQLAlchemy + pytest (backend `init/backend/`); React + Vite + TS + Tailwind + vitest (frontend `init/frontend/`).

## Global Constraints

- Spec nguồn: `docs/superpowers/specs/2026-07-06-kg-lpv-auto-fix-review-design.md`.
- Real git root `d:\KL\WEB1`; luôn chạy git với `git -C d:/KL/WEB1`. KHÔNG stage `.superpowers/`. Bỏ qua repo lồng `init/.git`.
- Mọi lệnh test chạy FOREGROUND (không background/Monitor); suite `tests/kg_lpv/` phải tự thoát (không treo). Nếu treo → dùng pattern monkeypatch cục bộ (`app.modules.kg_lpv.router.create_task`, `...pipeline.orchestrator.AsyncSessionLocal`).
- Mock genai + graph trong test; không gọi Gemini/Neo4j thật.
- Bất biến KG-LPV KHÔNG được đổi: chỉ finding `status="open"` + evidence≠rỗng mới được sửa; chỉ `POST /apply` ghi vào `SavedLessonPlan`; `unjudged`/`dismissed` không sửa; re-verify + gate giữ nguyên.
- `explanation_override` KHÔNG lưu DB (truyền tạm trong request). Không thêm migration.
- Chuỗi hiển thị người dùng: tiếng Việt. Log backend: `kg_lpv.<action> key=value`.
- Tương thích ngược: `POST /repair` vẫn chấp nhận `finding_ids` như cũ; các nơi gọi cũ (`useKgLpvJob.repair(findingId)` trong overlay) không được vỡ.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## File Structure

| File | Trách nhiệm | Task |
|---|---|---|
| `init/backend/app/modules/kg_lpv/schemas.py` | `RepairFindingItem`, `RepairRequest` mở rộng | 1 |
| `init/backend/app/modules/kg_lpv/router.py` | `start_repair` dựng dict override, truyền xuống job nền | 1 |
| `init/backend/app/modules/kg_lpv/pipeline/repairer.py` | `repair`/`run_repair_job` nhận & dùng `overrides` | 1 |
| `init/frontend/src/types/kgLpv.ts` | type `RepairFindingItem`, body repair | 2 |
| `init/frontend/src/services/kgLpvApi.ts` | `startRepairBatch(jobId, items)` | 2 |
| `init/frontend/src/hooks/useKgLpvJob.ts` | `repairBatch(items)` | 2 |
| `init/frontend/src/components/kg-lpv/FindingCard.tsx` | sửa explanation + checkbox chọn | 3 |
| `init/frontend/src/components/kg-lpv/VerificationPanel.tsx` | `variant="docked"` + chọn + nút batch + locate-highlight | 4 |
| `init/frontend/src/components/lesson-builder/LessonPlanOutput.tsx` | menu item "Sửa tự động" + neo section | 5 |
| `init/frontend/src/pages/lesson-builder/ViewSavedLessonPlanPage.tsx` + `LessonPlanBuilderPage.tsx` | wire `onAutoFix` + layout docked | 6 |

---

## Task 1: Backend — `explanation_override` cho repair

**Files:**
- Modify: `init/backend/app/modules/kg_lpv/schemas.py` (khu vực `class RepairRequest` ~dòng 247)
- Modify: `init/backend/app/modules/kg_lpv/router.py` (`start_repair` ~dòng 310)
- Modify: `init/backend/app/modules/kg_lpv/pipeline/repairer.py` (`repair` dòng 64, `run_repair_job` dòng 337)
- Test: `init/backend/tests/kg_lpv/test_repair.py`

**Interfaces:**
- Consumes: hiện có `build_repair_prompt(current_text, code, explanation, evidence)`, `KgLpvFinding`, `run_repair_job(job_id, finding_ids)`.
- Produces:
  - `RepairFindingItem(BaseModel){ id: int; explanation_override: str | None = None }`
  - `RepairRequest{ finding_ids: list[int] = []; findings: list[RepairFindingItem] = [] }`
  - `repair(db, job, findings, overrides: dict[int, str] | None = None) -> list[SectionDiff]`
  - `run_repair_job(job_id: int, finding_ids: list[int], overrides: dict[int, str] | None = None) -> None`

- [ ] **Step 1: Viết test thất bại — override đổi prompt**

Thêm vào `tests/kg_lpv/test_repair.py` (dùng lại fixture/mocks sẵn có trong file — đọc đầu file để khớp style mock `generate_json` và cách tạo job/finding/plan):

```python
async def test_repair_uses_explanation_override_when_present(db_session, monkeypatch):
    # Sắp xếp: 1 job + 1 SavedLessonPlan có section "muc_tieu", 1 finding open code M2
    # trên section đó (dựng theo helper sẵn có trong file test này).
    job, plan, finding = await _make_job_with_open_finding(db_session, section_id="muc_tieu")

    captured = {}
    async def fake_generate_json(db, feature_key, prompt, **kwargs):
        captured["prompt"] = prompt
        return ({"after": "Nội dung đã sửa"}, 10)
    monkeypatch.setattr("app.modules.kg_lpv.pipeline.repairer.generate_json", fake_generate_json)

    from app.modules.kg_lpv.pipeline.repairer import repair
    await repair(db_session, job, [finding], overrides={finding.id: "HÃY VIẾT LẠI THEO Ý GIÁO VIÊN"})

    assert "HÃY VIẾT LẠI THEO Ý GIÁO VIÊN" in captured["prompt"]
```

(Nếu chưa có `_make_job_with_open_finding`, tạo helper nhỏ trong file test theo mẫu các test repair hiện có — KHÔNG thêm vào code sản phẩm.)

- [ ] **Step 2: Chạy test — xác nhận FAIL**

Run (từ `init/backend`): `python -m pytest tests/kg_lpv/test_repair.py::test_repair_uses_explanation_override_when_present -q -W ignore`
Expected: FAIL (`repair()` chưa nhận tham số `overrides`).

- [ ] **Step 3: Sửa `repairer.repair` + `run_repair_job`**

Trong `pipeline/repairer.py`, đổi chữ ký và chỗ dựng prompt:

```python
async def repair(
    db: AsyncSession,
    job: KgLpvJob,
    findings: list[KgLpvFinding],
    overrides: dict[int, str] | None = None,
) -> list[SectionDiff]:
    overrides = overrides or {}
    ...
    # trong vòng lặp từng finding, thay dòng build_repair_prompt hiện tại:
    explanation = overrides.get(finding.id) or finding.explanation
    prompt = build_repair_prompt(current_text, finding.code, explanation, finding.evidence)
    ...
```

Và ở cuối file, `run_repair_job` truyền override xuống:

```python
async def run_repair_job(
    job_id: int,
    finding_ids: list[int],
    overrides: dict[int, str] | None = None,
) -> None:
    async with AsyncSessionLocal() as db:
        job = await db.get(KgLpvJob, job_id)
        if job is None:
            logger.warning("kg_lpv.repair.job_not_found job_id=%s", job_id)
            return
        try:
            result = await db.execute(select(KgLpvFinding).where(KgLpvFinding.id.in_(finding_ids)))
            findings = result.scalars().all()
            await repair(db, job, list(findings), overrides=overrides)
            job.status = "repaired"
            await db.commit()
            logger.info("kg_lpv.repair.job_done job_id=%s", job_id)
        except Exception as exc:  # noqa: BLE001
            job.status = "failed"
            job.error_message = f"Lỗi khi sửa & kiểm lại: {str(exc)[:400]}"
            await db.commit()
            logger.error("kg_lpv.repair.job_failed job_id=%s error=%s", job_id, exc)
```

- [ ] **Step 4: Chạy test — xác nhận PASS**

Run: `python -m pytest tests/kg_lpv/test_repair.py::test_repair_uses_explanation_override_when_present -q -W ignore`
Expected: PASS.

- [ ] **Step 5: Viết test thất bại — `RepairRequest` nhận `findings[]` + router dựng override**

```python
async def test_repair_endpoint_accepts_findings_with_override(kg_lpv_client, db_session, monkeypatch, teacher_user):
    # Dựng job + plan + 1 finding open thuộc teacher_user (theo helper trong file test API).
    job, finding = await _make_owned_job_open_finding(db_session, teacher_user)

    captured = {}
    def fake_create_task(coro, *a, **k):
        captured["coro"] = coro  # bắt lại, không schedule (pattern Task 3)
        class _D:  # dummy
            pass
        return _D()
    monkeypatch.setattr("app.modules.kg_lpv.router.create_task", fake_create_task)

    resp = await kg_lpv_client.post(
        f"/api/v1/kg-lpv/jobs/{job.id}/repair",
        json={"findings": [{"id": finding.id, "explanation_override": "sửa theo ý tôi"}]},
    )
    assert resp.status_code == 202
    captured["coro"].close()  # tránh 'coroutine never awaited'
```

(Đặt cạnh các test repair-endpoint hiện có trong `tests/kg_lpv/test_verify_api.py` nếu ở đó có helper owner/job; nếu không, dùng file test có sẵn helper phù hợp. Chỉ cần khẳng định 202 với body dạng `findings[]`.)

- [ ] **Step 6: Chạy test — xác nhận FAIL**

Run: `python -m pytest tests/kg_lpv/test_verify_api.py::test_repair_endpoint_accepts_findings_with_override -q -W ignore`
Expected: FAIL (`RepairRequest` chưa có trường `findings`).

- [ ] **Step 7: Mở rộng `schemas.RepairRequest` + `router.start_repair`**

`schemas.py`:

```python
class RepairFindingItem(BaseModel):
    id: int
    explanation_override: str | None = None


class RepairRequest(BaseModel):
    """Body `POST /jobs/{job_id}/repair`.
    - Rỗng (cả hai) = sửa tất cả finding `status="open"`.
    - `finding_ids`: danh sách id (tương thích ngược).
    - `findings`: danh sách kèm `explanation_override` (ưu tiên nếu có)."""
    finding_ids: list[int] = Field(default_factory=list)
    findings: list[RepairFindingItem] = Field(default_factory=list)
```

`router.py` `start_repair` — thay khối dựng `finding_ids` + `create_task`:

```python
    # id được yêu cầu: từ findings[] (kèm override) hoặc finding_ids[]
    overrides: dict[int, str] = {
        item.id: item.explanation_override
        for item in payload.findings
        if item.explanation_override
    }
    requested_ids = [item.id for item in payload.findings] or payload.finding_ids

    query = select(KgLpvFinding).where(KgLpvFinding.job_id == job_id, KgLpvFinding.status == "open")
    if requested_ids:
        query = query.where(KgLpvFinding.id.in_(requested_ids))
    result = await db.execute(query)
    findings = result.scalars().all()

    if not findings:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Không có phát hiện nào để sửa")

    estimated_tokens = _REPAIR_BASE_TOKENS + _REPAIR_TOKENS_PER_FINDING * len(findings)
    if not await check_token_balance(db, current_user.id, estimated_tokens):
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="Bạn đã hết token. Vui lòng liên hệ quản trị viên để nâng hạn mức.")

    finding_ids = [f.id for f in findings]
    # chỉ giữ override cho các finding thực sự hợp lệ (open + thuộc job)
    valid_overrides = {fid: overrides[fid] for fid in finding_ids if fid in overrides}

    job.status = "repairing"
    await db.commit()
    logger.info("kg_lpv.repair.requested job_id=%s findings=%d overrides=%d", job_id, len(finding_ids), len(valid_overrides))
    create_task(run_repair_job(job.id, finding_ids, valid_overrides or None))
    return RepairResponse(job_id=job.id)
```

- [ ] **Step 8: Chạy test — xác nhận PASS + không hồi quy**

Run: `python -m pytest tests/kg_lpv/test_repair.py tests/kg_lpv/test_verify_api.py -q -W ignore`
Expected: PASS toàn bộ.
Run: `python -m pytest tests/kg_lpv/ -q -W ignore`
Expected: tất cả PASS, tiến trình tự thoát.

- [ ] **Step 9: Commit**

```bash
git -C d:/KL/WEB1 add init/backend/app/modules/kg_lpv/schemas.py init/backend/app/modules/kg_lpv/router.py init/backend/app/modules/kg_lpv/pipeline/repairer.py init/backend/tests/kg_lpv/test_repair.py init/backend/tests/kg_lpv/test_verify_api.py
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): repair accepts optional per-finding explanation_override"
```

---

## Task 2: Frontend glue — API + type + `repairBatch`

**Files:**
- Modify: `init/frontend/src/types/kgLpv.ts`
- Modify: `init/frontend/src/services/kgLpvApi.ts` (`startRepair` ~dòng 62)
- Modify: `init/frontend/src/hooks/useKgLpvJob.ts` (`repair` ~dòng 129)
- Test: `init/frontend/src/__tests__/kg-lpv/useKgLpvJob.repairBatch.test.ts` (tạo mới)

**Interfaces:**
- Consumes: `kgLpvApi.getDiff/applyDiff` (đã có), `RepairResponse`, `SectionDiff`.
- Produces:
  - `RepairFindingItem = { id: number; explanation_override?: string }` (trong `types/kgLpv.ts`)
  - `kgLpvApi.startRepairBatch(jobId: number, items: RepairFindingItem[]): Promise<RepairResponse>`
  - `useKgLpvJob().repairBatch(items: RepairFindingItem[]): Promise<void>`

- [ ] **Step 1: Thêm type**

`types/kgLpv.ts` — thêm:

```typescript
export interface RepairFindingItem {
  id: number;
  explanation_override?: string;
}
```

- [ ] **Step 2: Thêm `startRepairBatch` (giữ `startRepair` cũ)**

`services/kgLpvApi.ts` — thêm cạnh `startRepair`, và export trong object `kgLpvApi`:

```typescript
import type { /* ...hiện có..., */ RepairFindingItem } from "@/types/kgLpv";

/** Sửa theo lô kèm chỉnh sửa nhận xét (explanation_override) của giáo viên. */
export const startRepairBatch = async (
  jobId: number,
  items: RepairFindingItem[],
): Promise<RepairResponse> => {
  const { data } = await api.post<RepairResponse>(`/kg-lpv/jobs/${jobId}/repair`, {
    findings: items,
  });
  return data;
};
```

Thêm `startRepairBatch` vào `export const kgLpvApi = { ... }`.

- [ ] **Step 3: Viết test thất bại cho `repairBatch`**

`src/__tests__/kg-lpv/useKgLpvJob.repairBatch.test.ts` — mock `@/services/kgLpvApi`, render hook, gọi `repairBatch`, khẳng định `startRepairBatch` được gọi đúng `items` rồi `getDiff` được gọi:

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/kgLpvApi", () => ({
  startVerify: vi.fn(), getJob: vi.fn(), getReport: vi.fn(), dismissFinding: vi.fn(),
  startRepair: vi.fn(), startRepairBatch: vi.fn().mockResolvedValue({ job_id: 7 }),
  getJob_: vi.fn(),
  getDiff: vi.fn().mockResolvedValue([{ section_id: "muc_tieu", before: "a", after: "b", findings_addressed: [1] }]),
  applyDiff: vi.fn(),
}));
import * as api from "@/services/kgLpvApi";
import { useKgLpvJob } from "@/hooks/useKgLpvJob";

describe("useKgLpvJob.repairBatch", () => {
  beforeEach(() => vi.clearAllMocks());
  it("gọi startRepairBatch với items rồi tải diff", async () => {
    // Cần job hiện có: mock getJob để poll thấy 'repaired' ngay.
    (api.getJob as any).mockResolvedValue({ status: "repaired", progress: 100, stats: {} });
    const { result } = renderHook(() => useKgLpvJob());
    // giả lập đã có jobId (tùy cấu trúc hook — nếu hook cần startVerify trước, gọi nó với getJob mock 'done')
    await act(async () => {
      // @ts-expect-error test truy cập nội bộ nếu cần set jobId, hoặc chạy startVerify trước
      await result.current.repairBatch?.([{ id: 1, explanation_override: "x" }]);
    });
    await waitFor(() => expect(api.startRepairBatch).toHaveBeenCalledWith(expect.any(Number), [{ id: 1, explanation_override: "x" }]));
  });
});
```

(Điều chỉnh phần "có sẵn jobId" theo cấu trúc thật của `useKgLpvJob` — đọc hook trước; nếu `repairBatch` yêu cầu `jobId` nội bộ, test nên chạy `startVerify` với `getJob` mock trả `done` để có `jobId`, giống cách test `repair()` hiện có nếu có.)

- [ ] **Step 4: Chạy test — xác nhận FAIL**

Run (từ `init/frontend`): `npm run test -- --run src/__tests__/kg-lpv/useKgLpvJob.repairBatch.test.ts`
Expected: FAIL (`repairBatch` chưa tồn tại).

- [ ] **Step 5: Thêm `repairBatch` vào `useKgLpvJob`**

Đọc `repair(findingId)` hiện có (~dòng 129) và nhân bản logic cho danh sách: gọi `startRepairBatch(jobId, items)`, poll tới `repaired`/`failed`, `getDiff`, `setDiffs`. Export `repairBatch` trong return object.

```typescript
import { startRepairBatch } from "@/services/kgLpvApi";
import type { RepairFindingItem } from "@/types/kgLpv";

const repairBatch = useCallback(async (items: RepairFindingItem[]) => {
  if (!jobId || items.length === 0) return;
  setRepairing(true);
  setRepairError(null);
  setDiffs(null);
  try {
    await startRepairBatch(jobId, items);
    await new Promise<void>((resolve, reject) => {
      const check = async () => {
        try {
          const j = await getJob(jobId);
          if (REPAIR_TERMINAL_STATUSES.has(j.status)) { clearInterval(id); resolve(); }
        } catch (e) { clearInterval(id); reject(e); }
      };
      const id = setInterval(check, POLL_INTERVAL_MS);
    });
    const diffData = await getDiff(jobId);
    setDiffs(diffData);
  } catch (e) {
    setRepairError(e instanceof Error ? e.message : "Lỗi khi sửa");
  } finally {
    setRepairing(false);
  }
}, [jobId]);
```

Thêm `repairBatch` vào return object của hook (cạnh `repair`, `applyDiffs`, `closeDiffModal`).

- [ ] **Step 6: Chạy test — xác nhận PASS**

Run: `npm run test -- --run src/__tests__/kg-lpv/useKgLpvJob.repairBatch.test.ts`
Expected: PASS.
Run: `npx tsc --noEmit`
Expected: 0 lỗi ở file đã đổi.

- [ ] **Step 7: Commit**

```bash
git -C d:/KL/WEB1 add init/frontend/src/types/kgLpv.ts init/frontend/src/services/kgLpvApi.ts init/frontend/src/hooks/useKgLpvJob.ts init/frontend/src/__tests__/kg-lpv/useKgLpvJob.repairBatch.test.ts
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): startRepairBatch + useKgLpvJob.repairBatch with per-finding override"
```

---

## Task 3: `FindingCard` — sửa nhận xét + chọn

**Files:**
- Modify: `init/frontend/src/components/kg-lpv/FindingCard.tsx`
- Test: `init/frontend/src/__tests__/kg-lpv/FindingCard.test.tsx` (đã tồn tại — thêm case)

**Interfaces:**
- Consumes: `FindingOut`.
- Produces (props mới trên `FindingCardProps`, tất cả OPTIONAL để không vỡ nơi gọi hiện có):
  - `selectable?: boolean`
  - `selected?: boolean`
  - `onToggleSelect?: (findingId: number, next: boolean) => void`
  - `onExplanationChange?: (findingId: number, text: string) => void`

- [ ] **Step 1: Viết test thất bại**

Thêm vào `FindingCard.test.tsx` (khớp style import/render sẵn có):

```typescript
it("cho sửa nhận xét và gọi onExplanationChange", () => {
  const onExplanationChange = vi.fn();
  const finding = { id: 1, code: "M2", branch: "N2", truc: null, section_id: "muc_tieu", span: null, evidence: [], explanation: "gốc", status: "open" };
  render(<FindingCard finding={finding as any} selectable selected onToggleSelect={vi.fn()} onExplanationChange={onExplanationChange} />);
  fireEvent.click(screen.getByTitle("Sửa nhận xét"));
  const ta = screen.getByRole("textbox");
  fireEvent.change(ta, { target: { value: "GV chỉnh" } });
  expect(onExplanationChange).toHaveBeenCalledWith(1, "GV chỉnh");
});

it("checkbox chọn gọi onToggleSelect; unjudged không có checkbox", () => {
  const onToggleSelect = vi.fn();
  const open = { id: 1, code: "M2", branch: "N2", truc: null, section_id: "s", span: null, evidence: [], explanation: "x", status: "open" };
  const { rerender } = render(<FindingCard finding={open as any} selectable selected={false} onToggleSelect={onToggleSelect} />);
  fireEvent.click(screen.getByRole("checkbox"));
  expect(onToggleSelect).toHaveBeenCalledWith(1, true);
  const unjudged = { ...open, status: "unjudged" };
  rerender(<FindingCard finding={unjudged as any} selectable onToggleSelect={onToggleSelect} />);
  expect(screen.queryByRole("checkbox")).toBeNull();
});
```

- [ ] **Step 2: Chạy test — FAIL**

Run: `npm run test -- --run src/__tests__/kg-lpv/FindingCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Hiện thực trong `FindingCard.tsx`**

- Thêm 4 prop optional vào `FindingCardProps` và destructure.
- Thêm state `const [editing, setEditing] = useState(false);` và `const [draft, setDraft] = useState(finding.explanation);`.
- Khi `selectable && isOpen`: render `<input type="checkbox" checked={!!selected} onChange={(e) => onToggleSelect?.(finding.id, e.target.checked)} />` ở đầu thẻ. KHÔNG render checkbox cho `unjudged`/`dismissed`.
- Chỗ `<p>{finding.explanation}</p>`: nếu `!editing` hiển thị `<p>{draft}</p>` + nút ✎ (`title="Sửa nhận xét"`, chỉ khi `isOpen`); nếu `editing` render `<textarea value={draft} onChange={(e) => { setDraft(e.target.value); onExplanationChange?.(finding.id, e.target.value); }} />`.
- Giữ nguyên nút "Sửa"/"Bỏ qua" hiện có (overlay vẫn dùng). `unjudged` vẫn chỉ đọc.

- [ ] **Step 4: Chạy test — PASS**

Run: `npm run test -- --run src/__tests__/kg-lpv/FindingCard.test.tsx`
Expected: PASS. Rồi `npx tsc --noEmit` → 0 lỗi.

- [ ] **Step 5: Commit**

```bash
git -C d:/KL/WEB1 add init/frontend/src/components/kg-lpv/FindingCard.tsx init/frontend/src/__tests__/kg-lpv/FindingCard.test.tsx
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): FindingCard editable explanation + selectable checkbox"
```

---

## Task 4: `VerificationPanel` — docked + batch + locate-highlight

**Files:**
- Modify: `init/frontend/src/components/kg-lpv/VerificationPanel.tsx`
- Test: `init/frontend/src/__tests__/kg-lpv/VerificationPanel.test.tsx` (đã tồn tại — thêm case)

**Interfaces:**
- Consumes: `FindingCard` (props mới Task 3), `RepairDiffModal`, `SectionDiff`, `RepairFindingItem`.
- Produces (props mới trên panel, optional):
  - `variant?: "overlay" | "docked"` (mặc định `"overlay"`)
  - `onRepairBatch?: (items: RepairFindingItem[]) => void | Promise<void>`

- [ ] **Step 1: Viết test thất bại**

Thêm vào `VerificationPanel.test.tsx`:

```typescript
it("nút 'Sửa N lỗi đã chọn' gọi onRepairBatch với đúng items + override", async () => {
  const onRepairBatch = vi.fn();
  const report = { branches: [{ branch: "N2", findings: [
    { id: 1, code: "M2", branch: "N2", truc: null, section_id: "s", span: null, evidence: [], explanation: "gốc", status: "open" },
  ]}], summary: { total_confirmed: 1 } };
  render(<VerificationPanel open variant="docked" job={{ status: "done" } as any} report={report as any}
    progress={100} phase="" loading={false} error={null}
    onClose={vi.fn()} onDismiss={vi.fn()} onLocate={vi.fn()} onRepairBatch={onRepairBatch} />);
  // finding open mặc định được chọn -> bấm nút batch
  fireEvent.click(screen.getByRole("button", { name: /Sửa 1 lỗi đã chọn/i }));
  expect(onRepairBatch).toHaveBeenCalledWith([{ id: 1 }]);
});
```

(Khớp cấu trúc `report` thật — đọc `VerificationPanel.tsx` + `ReportResponse` trong `types/kgLpv.ts` để dựng đúng shape; ví dụ trên chỉ minh hoạ.)

- [ ] **Step 2: Chạy test — FAIL**

Run: `npm run test -- --run src/__tests__/kg-lpv/VerificationPanel.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Hiện thực trong `VerificationPanel.tsx`**

- Thêm prop `variant = "overlay"` và `onRepairBatch`.
- Container ngoài cùng: khi `variant === "docked"` dùng class cột phải cố định (vd `relative h-full w-full max-w-md border-l ...`) thay cho class overlay trượt (`fixed inset-y-0 right-0 translate-x-...`). Giữ overlay như cũ khi `variant === "overlay"`.
- State chọn: `const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());` và `const [overrides, setOverrides] = useState<Record<number, string>>({});`. Khi report load, mặc định chọn tất cả finding `status === "open"` (dùng `useEffect` theo report).
- Truyền vào mỗi `FindingCard` (chỉ nhánh findings, không phải unjudged): `selectable`, `selected={selectedIds.has(f.id)}`, `onToggleSelect`, `onExplanationChange={(id, text) => setOverrides(o => ({ ...o, [id]: text }))}`.
- Nút chân cột (chỉ khi `variant === "docked"` và có ≥1 finding open được chọn): `Sửa {selectedIds.size} lỗi đã chọn` → gọi:

```typescript
const items = [...selectedIds].map((id) => overrides[id] ? { id, explanation_override: overrides[id] } : { id });
onRepairBatch?.(items);
```

- `onLocate(sectionId)`: giữ gọi prop `onLocate` (trang cha xử lý cuộn+highlight ở Task 5/6); panel không tự cuộn DOM ngoài.
- `RepairDiffModal` giữ nguyên như hiện tại.

- [ ] **Step 4: Chạy test — PASS**

Run: `npm run test -- --run src/__tests__/kg-lpv/VerificationPanel.test.tsx`
Expected: PASS. Rồi `npx tsc --noEmit` → 0 lỗi.

- [ ] **Step 5: Commit**

```bash
git -C d:/KL/WEB1 add init/frontend/src/components/kg-lpv/VerificationPanel.tsx init/frontend/src/__tests__/kg-lpv/VerificationPanel.test.tsx
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): VerificationPanel docked variant + batch repair with overrides"
```

---

## Task 5: `LessonPlanOutput` — menu "Sửa tự động" + neo section

**Files:**
- Modify: `init/frontend/src/components/lesson-builder/LessonPlanOutput.tsx` (menu Hành động ~dòng 3033; nơi render các section)
- Test: `init/frontend/src/__tests__/kg-lpv/LessonPlanOutputAutoFix.test.tsx` (tạo mới) — chỉ test riêng nút menu nếu tách được; nếu component quá lớn để render trong test, kiểm thủ công và test ở Task 6.

**Interfaces:**
- Consumes: prop mới `onAutoFix?: () => void` và `autoFixEnabled?: boolean` truyền từ trang cha.
- Produces: mục menu "Sửa tự động"; mỗi khối section có `id={"kglpv-section-" + section.section_id}`.

- [ ] **Step 1: Thêm prop**

Thêm vào interface props của `LessonPlanOutput`: `onAutoFix?: () => void;` và `autoFixEnabled?: boolean;` (destructure trong component).

- [ ] **Step 2: Thêm mục menu "Sửa tự động"**

Trong dropdown Hành động (khối `showActionsMenu &&`), THÊM nút đầu tiên (trên "Sửa từng phần"), chỉ hiển thị khi `autoFixEnabled`:

```tsx
{autoFixEnabled && (
  <button
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => { setShowActionsMenu(false); onAutoFix?.(); }}
    className="w-full px-2.5 py-2 text-xs rounded-md text-left text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 flex items-center gap-2"
    title="Kiểm chứng KHBD rồi sửa các lỗi phát hiện được"
  >
    <Wand2 className="w-3.5 h-3.5" />
    <span>Sửa tự động</span>
  </button>
)}
```

Import `Wand2` từ `lucide-react` (cùng chỗ import icon hiện có: `MoreHorizontal`, `Sparkles`, ...).

- [ ] **Step 3: Neo section**

Tại nơi `LessonPlanOutput` map và render từng section (tìm chỗ `.map(` trên mảng sections KHBD), bọc mỗi khối bằng `id`:

```tsx
<div id={`kglpv-section-${section.section_id}`} ...>
  ... nội dung section ...
</div>
```

(Nếu section render qua nhiều lớp, đặt `id` ở phần tử bao ngoài cùng của mỗi section. `section_id` phải là đúng field khớp với `finding.section_id` — cùng nguồn `SavedLessonPlan.sections[].section_id`.)

- [ ] **Step 4: Verify (thủ công + typecheck)**

Run: `npx tsc --noEmit` → 0 lỗi mới.
Kiểm thủ công (Task 6 nối dây xong): mở KHBD → menu Hành động thấy "Sửa tự động" khi module bật; DOM có `#kglpv-section-...`.

- [ ] **Step 5: Commit**

```bash
git -C d:/KL/WEB1 add init/frontend/src/components/lesson-builder/LessonPlanOutput.tsx
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): auto-fix menu item + section anchors in LessonPlanOutput"
```

---

## Task 6: Nối dây trang — `onAutoFix` + layout docked

**Files:**
- Modify: `init/frontend/src/pages/lesson-builder/ViewSavedLessonPlanPage.tsx`
- Modify: `init/frontend/src/pages/lesson-builder/LessonPlanBuilderPage.tsx`
- Test: verify end-to-end thủ công (chạy app) + suite frontend hiện có không hồi quy.

**Interfaces:**
- Consumes: `useKgLpvStatus`, `useKgLpvJob` (có `startVerify`, `repairBatch`, `diffs`, `applyDiffs`, `closeDiffModal`), `VerificationPanel` (props `variant`, `onRepairBatch`), `LessonPlanOutput` (props `onAutoFix`, `autoFixEnabled`).
- Produces: luồng người dùng hoàn chỉnh.

- [ ] **Step 1: Thêm state docked + handler `onAutoFix`**

Trong `ViewSavedLessonPlanPage.tsx` (đọc phần đã có: `kgLpvStatus`, `kgLpvJob`, `kgLpvPanelOpen`, `handleVerify`, `handleLocateSection`):

```tsx
const [kgLpvDocked, setKgLpvDocked] = useState(false);

const handleAutoFix = useCallback(async () => {
  setKgLpvDocked(true);
  setKgLpvPanelOpen(true);
  // Nếu chưa có job ở trạng thái cuối trong phiên → chạy kiểm chứng.
  if (!kgLpvJob.job || !["done", "repaired"].includes(kgLpvJob.job.status)) {
    await handleVerify();
  }
}, [kgLpvJob.job, handleVerify]);
```

- [ ] **Step 2: `handleLocateSection` cuộn + tô nền**

```tsx
const handleLocateSection = useCallback((sectionId: string) => {
  const el = document.getElementById(`kglpv-section-${sectionId}`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("kglpv-locate-highlight");
  window.setTimeout(() => el.classList.remove("kglpv-locate-highlight"), 2000);
}, []);
```

Thêm class `.kglpv-locate-highlight` vào CSS toàn cục (vd `src/index.css`): nền vàng nhạt + transition (`background-color .3s`). Dark mode dùng `@media (prefers-color-scheme: dark)` hoặc biến Tailwind sẵn có.

- [ ] **Step 3: Truyền props xuống `LessonPlanOutput` + `VerificationPanel`**

- `LessonPlanOutput`: thêm `onAutoFix={handleAutoFix}` và `autoFixEnabled={kgLpvStatus.enabled && kgLpvStatus.availability === "ok"}`.
- `VerificationPanel`: thêm `variant={kgLpvDocked ? "docked" : "overlay"}` và `onRepairBatch={kgLpvJob.repairBatch}`.
- Layout: khi `kgLpvDocked && kgLpvPanelOpen`, bọc vùng nội dung + panel trong `flex`: KHBD `flex-1 min-w-0`, panel cột phải chiều rộng cố định (vd `w-full max-w-md`). Trên màn nhỏ (dưới `md`) ép `variant="overlay"` để không vỡ layout (dùng `useMediaQuery`/`window.matchMedia` hoặc class responsive).

- [ ] **Step 4: Lặp lại cho `LessonPlanBuilderPage.tsx`**

Áp dụng đúng các thay đổi Step 1–3 cho `LessonPlanBuilderPage.tsx` (đọc cách trang này đã gắn `VerifyButton`/`VerificationPanel`/`LessonPlanOutput` rồi nối `onAutoFix`, `variant`, `onRepairBatch`, layout docked tương tự).

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit` → 0 lỗi.
Run: `npm run test -- --run src/__tests__/kg-lpv` → toàn bộ PASS.
Kiểm thủ công (nếu chạy được app): menu "Sửa tự động" → panel docked cạnh KHBD → click nhận xét cuộn+tô nền đúng section → chọn/sửa nhận xét → "Sửa N lỗi đã chọn" → RepairDiffModal → duyệt → KHBD cập nhật.

- [ ] **Step 6: Commit**

```bash
git -C d:/KL/WEB1 add init/frontend/src/pages/lesson-builder/ViewSavedLessonPlanPage.tsx init/frontend/src/pages/lesson-builder/LessonPlanBuilderPage.tsx init/frontend/src/index.css
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): wire auto-fix flow (docked review + locate highlight) into lesson pages"
```

---

## Self-Review (đối chiếu spec)

- ✅ Điểm vào menu "Sửa tự động" → Task 5 (menu item) + Task 6 (`onAutoFix` chạy verify + mở docked).
- ✅ Bố cục 2 khung docked → Task 4 (`variant="docked"`) + Task 6 (layout flex).
- ✅ Neo theo mục/hoạt động + cuộn/tô nền → Task 5 (anchors) + Task 6 (`handleLocateSection` + CSS).
- ✅ Sửa nhận xét + bỏ qua + chọn → Task 3 (FindingCard) + Task 4 (chọn mặc định open, dismiss giữ nguyên).
- ✅ Override "cả hai" (mặc định gốc, có sửa theo GV) → Task 1 (backend `overrides.get(id) or explanation`) + Task 2/4 (gửi `explanation_override` khi có).
- ✅ Chỉ sửa khi bấm "Sửa N lỗi đã chọn" (batch, xác nhận) → Task 4 nút batch + Task 2 `repairBatch` → RepairDiffModal → `/apply`.
- ✅ Không lưu DB override, không migration → Task 1 (truyền tạm trong request).
- ✅ Giữ nút nổi "Kiểm chứng" + "Sửa từng phần" cũ → không đụng (Task 5 chỉ THÊM mục menu).
- ✅ Bất biến KG-LPV (gate, chỉ /apply ghi KHBD, unjudged/dismissed) → Task 1 không đổi các phần đó; test hồi quy `tests/kg_lpv/`.
- ✅ Tương thích ngược `finding_ids` → Task 1 (`requested_ids = findings[] or finding_ids`).

## Ghi chú rủi ro thực thi

- **Khớp `section_id`**: `LessonPlanOutput` render section từ `SavedLessonPlan.sections[].section_id`; `finding.section_id` do segmenter gán cũng từ đó — Task 5/6 phải xác nhận trùng khớp (kiểm thủ công: click nhận xét cuộn đúng khối). Nếu segmenter tách sâu tạo `section_id` con khác, `onLocate` fallback: nếu không tìm thấy `#kglpv-section-<id>` thì thử cắt phần hậu tố để về section cha (thêm trong `handleLocateSection` nếu cần).
- **`useKgLpvJob` cấu trúc `jobId`**: Task 2 giả định hook giữ `jobId` nội bộ (như `repair()` hiện có). Đọc hook trước khi viết `repairBatch` để dùng đúng nguồn `jobId`.
- **Component `LessonPlanOutput` rất lớn**: chỉ THÊM prop + mục menu + `id` bọc section; KHÔNG refactor phần khác (surgical).

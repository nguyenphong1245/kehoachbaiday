"""Pydantic schemas cho module KG-LPV.

Task 1: Status. Task 3: SegmentedPlan (Bước 1 tách đoạn — các nhánh N1/N2/N3 và
bước sửa lỗi ở các task sau tiêu thụ schema này) + Verify/Job request-response.
Task 4: Finding (kết quả trả về của mọi nhánh N1/N2/N3 — Task 5/6 tái dùng).
"""

from enum import Enum

from pydantic import BaseModel, Field, field_validator

from app.modules.kg_lpv.error_codes import ErrorCode, VerificationBranch


class GraphStatus(BaseModel):
    connected: bool
    node_count: int | None = None


class KgLpvStatusResponse(BaseModel):
    enabled: bool
    availability: str  # "ok" | "degraded" | "disabled"
    graph: GraphStatus
    version: str


# ============== Bước 1 — Tách đoạn (SegmentedPlan) ==============


class ObjectiveClauseType(str, Enum):
    """Loại mệnh đề mục tiêu (section_type == 'muc_tieu')."""

    KIEN_THUC = "kien_thuc"
    NANG_LUC_TIN_HOC = "nang_luc_tin_hoc"
    NANG_LUC_CHUNG = "nang_luc_chung"
    PHAM_CHAT = "pham_chat"
    NANG_LUC_SO = "nang_luc_so"


class ActivityComponentType(str, Enum):
    """4 thành phần của một hoạt động (khoi_dong, hinh_thanh_kien_thuc_X, luyen_tap, van_dung)."""

    MUC_TIEU = "muc_tieu"
    NOI_DUNG = "noi_dung"
    SAN_PHAM = "san_pham"
    TO_CHUC_THUC_HIEN = "to_chuc_thuc_hien"


class ObjectiveClauseSegment(BaseModel):
    """Một mệnh đề mục tiêu tách riêng, gắn loại."""

    segment_id: str
    section_id: str
    loai: ObjectiveClauseType
    text: str


class ActivityComponentSegment(BaseModel):
    """Một trong 4 thành phần tách ra từ một section hoạt động."""

    segment_id: str
    section_id: str
    component: ActivityComponentType
    text: str


class SegmentedPlan(BaseModel):
    """Kết quả Bước 1 tách đoạn — lưu vào `kg_lpv_jobs.segments`.

    Các nhánh N1/N2/N3 (task sau) đọc `objective_clauses` + `activity_components`
    làm đầu vào; không tách lại khi chạy lại từng nhánh.
    """

    objective_clauses: list[ObjectiveClauseSegment] = Field(default_factory=list)
    activity_components: list[ActivityComponentSegment] = Field(default_factory=list)


# ============== Bước 2 — Finding (kết quả N1/N2/N3) ==============


class Finding(BaseModel):
    """Một phát hiện lỗi kiểm chứng — kiểu trả về chung của N1/N2/N3 (§6.2).

    Bất biến bắt buộc: KHÔNG được tạo `Finding` với `evidence` rỗng — "không
    có bằng chứng thì không có phát hiện" (§6.2/§7). Vi phạm raise
    `pydantic.ValidationError` ngay khi dựng đối tượng.
    """

    code: ErrorCode
    branch: VerificationBranch
    truc: int | None = None
    section_id: str
    span: dict | None = None
    evidence: list[dict]
    explanation: str
    status: str = "open"
    repair_diff: dict | None = None

    @field_validator("evidence")
    @classmethod
    def _evidence_must_not_be_empty(cls, value: list[dict]) -> list[dict]:
        if not value:
            raise ValueError(
                "Finding phải có ít nhất 1 evidence — không được tạo phát hiện không có bằng chứng."
            )
        return value

    def to_kg_lpv_finding_kwargs(self, job_id: int) -> dict:
        """Chuyển `Finding` -> kwargs để dựng một dòng `KgLpvFinding` (dùng ở orchestrator Task 5/6)."""
        return {
            "job_id": job_id,
            "code": self.code.value,
            "branch": self.branch.value,
            "truc": self.truc,
            "section_id": self.section_id,
            "span": self.span,
            "evidence": self.evidence,
            "explanation": self.explanation,
            "status": self.status,
            "repair_diff": self.repair_diff,
        }


# ============== N2 — LessonContext (gói ngữ cảnh bài học, §9) ==============


class LessonContext(BaseModel):
    """Gói ngữ cảnh bài học — `graph_client.get_lesson_context()` truy hồi ĐÚNG 1
    LẦN mỗi job (§9) và được N2 (Task 5) và N3 (Task 6) dùng chung, KHÔNG truy
    vấn lại đồ thị cho từng mã lỗi.

    Mỗi phần tử trong các danh sách con là 1 dict PHẲNG lấy trực tiếp từ node/
    quan hệ Neo4j (không mô hình hoá lại từng label thành model riêng — các
    label mang thuộc tính khác nhau, N2/N3 chỉ đọc theo key khi cần dùng, tránh
    over-engineer). Mọi dict node đều mang 4 trường vết xuất xứ bắt buộc
    (`ma_nguon`, `so_ky_hieu`, `ngay_hieu_luc`, `vi_tri_trang`) nguyên trạng từ
    đồ thị (§5.2).

    Cấu trúc từng trường:
    - `lesson`: dict `BaiHoc` (`ma_dinh_danh`, `ten`, ...) hoặc `None` nếu không
      tìm thấy bài học trong đồ thị.
    - `yccd`: mỗi item `{ma_dinh_danh, ten, muc_nhan_thuc: {ma_dinh_danh, ten,
      bac} | None, ...vet_xuat_xu}` — YCCĐ của bài học kèm mức nhận thức yêu cầu.
    - `nang_luc_tin_hoc`: danh mục `NangLucTinHoc` NLa-NLe (toàn bộ danh mục —
      5 năng lực đặc thù môn Tin học là danh mục cố định của chương trình,
      không phụ thuộc bài học/cấp) — mỗi item có `ma_nang_luc` ("NLa".."NLe").
    - `nang_luc_chung`, `pham_chat`: danh mục năng lực chung / phẩm chất của
      chương trình tổng thể (toàn bộ danh mục, lý do tương tự `nang_luc_tin_hoc`).
    - `chi_bao_nls`: `ChiBaoNLS` áp dụng cho khối lớp của bài học (đã lọc theo
      khối lớp qua quan hệ `AP_DUNG_CHO` khi truy vấn) — mỗi item có
      `ma_chi_bao` và `muc_do` (danh sách `MucDoNLS` áp dụng, có thể rỗng nếu
      đồ thị chưa curate mức cho chỉ báo đó).
    - `menh_de_kien_thuc`: `MenhDeKienThuc` (`THUOC`) của riêng bài học — dùng
      làm ngữ cảnh neo bằng chứng cho M6.
    - `dong_tu_nhan_thuc`: bảng động từ nhận thức, dạng
      `{"do_duoc": [{"dong_tu": str, "bac": int}], "khong_do_duoc": [str]}` —
      `do_duoc` mang thêm `bac` (mức nhận thức tương ứng, dùng đối chiếu M1);
      `khong_do_duoc` chỉ cần liệt kê động từ (biết, hiểu, nắm...) vì luôn là
      lỗi M2 bất kể mức.
    """

    lesson: dict | None = None
    yccd: list[dict] = Field(default_factory=list)
    nang_luc_tin_hoc: list[dict] = Field(default_factory=list)
    nang_luc_chung: list[dict] = Field(default_factory=list)
    pham_chat: list[dict] = Field(default_factory=list)
    chi_bao_nls: list[dict] = Field(default_factory=list)
    menh_de_kien_thuc: list[dict] = Field(default_factory=list)
    dong_tu_nhan_thuc: dict = Field(default_factory=lambda: {"do_duoc": [], "khong_do_duoc": []})


# ============== API: POST /verify, GET /jobs/{job_id} ==============


class VerifyRequest(BaseModel):
    lesson_plan_id: int


class VerifyResponse(BaseModel):
    job_id: int


class JobStatusResponse(BaseModel):
    status: str
    progress: int
    stats: dict | None = None


# ============== API: GET /jobs/{job_id}/report (Task 6, §6.3) ==============


class FindingOut(BaseModel):
    """1 dòng `KgLpvFinding` trả ra API — khớp trực tiếp các cột của model ORM."""

    id: int
    code: str
    branch: str
    truc: int | None = None
    section_id: str
    span: dict | None = None
    evidence: list[dict]
    explanation: str
    status: str

    model_config = {"from_attributes": True}


class BranchReport(BaseModel):
    """Sổ lỗi của 1 nhánh (N1/N2/N3) — chỉ gồm findings ĐÃ XÁC NHẬN (`status != "unjudged"`)."""

    branch: str
    counts_by_code: dict[str, int]
    findings: list[FindingOut]


class ReportResponse(BaseModel):
    """`GET /jobs/{job_id}/report` — sổ lỗi đầy đủ nhóm theo nhánh (§6.3).

    `branches` chỉ chứa findings đã xác nhận (`status != "unjudged"`), nhóm N1/N2/N3
    kèm đếm theo mã trong từng nhánh. `unjudged` liệt kê RIÊNG các phán xử LLM lỗi
    (`status="unjudged"`) — chỉ mang tính kiểm toán, KHÔNG được tính là lỗi nội dung
    xác nhận trong `summary` (§9 "an toàn khi hỏng" + quy ước Task 5/6).
    """

    job_id: int
    status: str
    branches: list[BranchReport]
    unjudged: list[FindingOut]
    summary: dict[str, int]


# ============== Bước 4 — Sửa & kiểm lại (repairer, §6.3, §7 Bước 4) ==============


class SectionDiff(BaseModel):
    """1 đoạn (section) đã được sửa cục bộ — `before`/`after` là TOÀN VĂN nội dung
    section trước/sau khi sửa; `findings_addressed` là id các `KgLpvFinding` đã
    được gộp sửa CÙNG LÚC trong đoạn này (nhiều finding trên cùng 1 section ->
    1 `SectionDiff` duy nhất, §7 Bước 4)."""

    section_id: str
    before: str
    after: str
    findings_addressed: list[int] = Field(default_factory=list)


class RepairFindingItem(BaseModel):
    """1 phần tử `RepairRequest.findings` — id finding kèm giải thích tuỳ chỉnh
    (tuỳ chọn) từ giáo viên, thay cho `finding.explanation` gốc khi dựng prompt sửa."""

    id: int
    explanation_override: str | None = None


class RepairRequest(BaseModel):
    """Body `POST /jobs/{job_id}/repair`.
    - Rỗng (cả hai) = sửa tất cả finding `status="open"`.
    - `finding_ids`: danh sách id (tương thích ngược).
    - `findings`: danh sách kèm `explanation_override` (ưu tiên nếu có)."""

    finding_ids: list[int] = Field(default_factory=list)
    findings: list[RepairFindingItem] = Field(default_factory=list)


class RepairResponse(BaseModel):
    job_id: int


class ApplyRequest(BaseModel):
    """Body `POST /jobs/{job_id}/apply` — `None` = áp dụng mọi section đã `status="repaired"`."""

    section_ids: list[str] | None = None


class ApplyResponse(BaseModel):
    section_ids: list[str]

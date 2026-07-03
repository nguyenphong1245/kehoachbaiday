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


# ============== API: POST /verify, GET /jobs/{job_id} ==============


class VerifyRequest(BaseModel):
    lesson_plan_id: int


class VerifyResponse(BaseModel):
    job_id: int


class JobStatusResponse(BaseModel):
    status: str
    progress: int
    stats: dict | None = None

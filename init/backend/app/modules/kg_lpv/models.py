"""SQLAlchemy models: KgLpvJob (job nền kiểm chứng) và KgLpvFinding (sổ lỗi).

Xem plan §6.2. Bất biến: một `KgLpvFinding` không có `evidence` hợp lệ (mảng
rỗng) không được tạo — việc này được enforce ở tầng service (orchestrator/n2/n3),
không phải ở model.
"""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, SmallInteger, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class KgLpvJob(Base):
    """Job nền chạy pipeline kiểm chứng KG-LPV cho một `SavedLessonPlan`."""

    __tablename__ = "kg_lpv_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    saved_lesson_plan_id = Column(Integer, ForeignKey("saved_lesson_plans.id"), nullable=False, index=True)

    # pending -> segmenting -> verifying(N1‖N2) -> verifying_n3 -> done | failed
    # -> repairing -> re_verifying -> repaired
    status = Column(String(30), nullable=False, default="pending")
    progress = Column(SmallInteger, nullable=False, default=0)

    segments = Column(JSON, nullable=True)  # kết quả Bước 1 (SegmentedPlan.model_dump())
    stats = Column(JSON, nullable=True)  # {"tokens": int, số lỗi theo mã, thời gian từng bước...}
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)

    findings = relationship(
        "KgLpvFinding", back_populates="job", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<KgLpvJob(id={self.id}, status='{self.status}', progress={self.progress})>"


class KgLpvFinding(Base):
    """Một bản ghi lỗi trong sổ lỗi kiểm chứng KG-LPV."""

    __tablename__ = "kg_lpv_findings"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("kg_lpv_jobs.id", ondelete="CASCADE"), nullable=False, index=True)

    code = Column(String(4), nullable=False)  # D1 | M1..M6 | C1..C8
    branch = Column(String(2), nullable=False)  # N1 | N2 | N3
    truc = Column(SmallInteger, nullable=True)  # 1-6, chỉ áp dụng cho N3

    section_id = Column(String(100), nullable=False)  # khớp LessonPlanSection.section_id
    span = Column(JSON, nullable=True)  # offset đoạn văn trong section

    evidence = Column(JSON, nullable=False)  # list[{kg_node_id, ma_nguon, ...}] hoặc {text_span}
    explanation = Column(Text, nullable=False)

    status = Column(String(20), nullable=False, default="open")  # open|repaired|dismissed|reverified_ok|reverified_fail
    repair_diff = Column(JSON, nullable=True)

    job = relationship("KgLpvJob", back_populates="findings")

    def __repr__(self) -> str:
        return f"<KgLpvFinding(id={self.id}, code='{self.code}', job_id={self.job_id})>"

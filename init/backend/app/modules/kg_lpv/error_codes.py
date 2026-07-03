"""Khung định nghĩa mã lỗi kiểm chứng KG-LPV.

Bộ 15 mã lỗi (D1, M1-M6, C1-C8) — hợp đồng chung dùng bởi mọi nhánh kiểm
chứng (N1: Task 4 hiện thực D1; N2: Task 5 hiện thực M1-M6; N3: Task 6 hiện
thực C1-C8). `ERROR_META` là DỮ LIỆU TĨNH (không phải logic) mô tả nhánh,
trục nhất quán (chỉ N3), nhóm lỗi (tiếng Việt, diễn giải từ Bảng 1 + §7 kế
hoạch) và loại kiểm (`ALGORITHMIC | RULE | LLM_JUDGE`, §3 điểm 3).

Một số mã C* liên quan nhiều trục trong 6 trục N3 (§7 Bước 3) — trường
`truc` chỉ giữ trục CHÍNH mà mã đó được kiểm; các trục phụ được ghi chú ở
comment ngay dòng khai báo (không có trường riêng, tránh over-engineer cho
dữ liệu tĩnh).
"""

from dataclasses import dataclass
from enum import Enum
from typing import Literal


class VerificationBranch(str, Enum):
    """3 nhánh kiểm chứng của pipeline KG-LPV."""

    N1 = "N1"
    N2 = "N2"
    N3 = "N3"


class ErrorCode(str, Enum):
    """15 mã lỗi kiểm chứng KG-LPV (Bảng 1)."""

    D1 = "D1"
    M1 = "M1"
    M2 = "M2"
    M3 = "M3"
    M4 = "M4"
    M5 = "M5"
    M6 = "M6"
    C1 = "C1"
    C2 = "C2"
    C3 = "C3"
    C4 = "C4"
    C5 = "C5"
    C6 = "C6"
    C7 = "C7"
    C8 = "C8"


CheckType = Literal["ALGORITHMIC", "RULE", "LLM_JUDGE"]


@dataclass(frozen=True)
class ErrorMeta:
    """Metadata tĩnh cho 1 mã lỗi."""

    branch: VerificationBranch
    truc: int | None  # 1-6, chỉ áp dụng mã thuộc N3 (trục chính nếu mã liên quan nhiều trục)
    nhom_loi: str  # Tên nhóm lỗi tiếng Việt
    check_type: CheckType


ERROR_META: dict[ErrorCode, ErrorMeta] = {
    ErrorCode.D1: ErrorMeta(
        branch=VerificationBranch.N1,
        truc=None,
        nhom_loi="Sai định danh bài học",
        check_type="ALGORITHMIC",
    ),
    ErrorCode.M1: ErrorMeta(
        branch=VerificationBranch.N2,
        truc=None,
        nhom_loi="Mục tiêu vượt quá hoặc thấp hơn yêu cầu cần đạt (YCCĐ)",
        check_type="RULE",
    ),
    ErrorCode.M2: ErrorMeta(
        branch=VerificationBranch.N2,
        truc=None,
        nhom_loi="Mục tiêu dùng động từ không đo được",
        check_type="LLM_JUDGE",
    ),
    ErrorCode.M3: ErrorMeta(
        branch=VerificationBranch.N2,
        truc=None,
        nhom_loi="Mã năng lực Tin học khai báo sai",
        check_type="RULE",
    ),
    ErrorCode.M4: ErrorMeta(
        branch=VerificationBranch.N2,
        truc=None,
        nhom_loi="Mã năng lực chung / phẩm chất khai báo sai",
        check_type="RULE",
    ),
    ErrorCode.M5: ErrorMeta(
        branch=VerificationBranch.N2,
        truc=None,
        nhom_loi="Mã chỉ báo năng lực số khai báo sai",
        check_type="RULE",
    ),
    ErrorCode.M6: ErrorMeta(
        branch=VerificationBranch.N2,
        truc=None,
        nhom_loi="Mệnh đề kiến thức sai lệch với SGK/chương trình",
        check_type="LLM_JUDGE",
    ),
    ErrorCode.C1: ErrorMeta(
        branch=VerificationBranch.N3,
        truc=4,
        nhom_loi="Năng lực đặc thù không truy hồi được nội dung minh chứng trong đồ thị",
        check_type="RULE",
    ),
    ErrorCode.C2: ErrorMeta(
        branch=VerificationBranch.N3,
        truc=4,
        nhom_loi="Năng lực đặc thù thiếu bằng chứng cụ thể hóa",
        check_type="LLM_JUDGE",
    ),
    ErrorCode.C3: ErrorMeta(
        branch=VerificationBranch.N3,
        truc=6,
        nhom_loi="Tiến trình hoạt động sai thứ tự hoặc thời lượng không hợp lệ",
        check_type="ALGORITHMIC",
    ),
    ErrorCode.C4: ErrorMeta(
        # Trục chính: 1 (nhất quán dọc mục tiêu<->hoạt động). Liên quan thêm
        # trục 2 (nhất quán nội bộ hoạt động) và trục 3 (căn chỉnh mục
        # tiêu-hoạt động-sản phẩm-đánh giá) — xem §7 Bước 3.
        branch=VerificationBranch.N3,
        truc=1,
        nhom_loi="Mất nhất quán dọc mục tiêu-hoạt động",
        check_type="LLM_JUDGE",
    ),
    ErrorCode.C5: ErrorMeta(
        # Trục chính: 3 (căn chỉnh mục tiêu-hoạt động-sản phẩm-đánh giá).
        # Liên quan thêm trục 6 (mạch phát triển mức nhận thức không thụt lùi).
        branch=VerificationBranch.N3,
        truc=3,
        nhom_loi="Căn chỉnh mục tiêu-hoạt động-sản phẩm-đánh giá không hợp lệ",
        check_type="LLM_JUDGE",
    ),
    ErrorCode.C6: ErrorMeta(
        branch=VerificationBranch.N3,
        truc=6,
        nhom_loi="Điều kiện triển khai không hợp lệ (thiết bị khai báo không khớp sử dụng)",
        check_type="ALGORITHMIC",
    ),
    ErrorCode.C7: ErrorMeta(
        branch=VerificationBranch.N3,
        truc=5,
        nhom_loi="Phương pháp/kĩ thuật dạy học không thực chất so với quy trình chuẩn",
        check_type="LLM_JUDGE",
    ),
    ErrorCode.C8: ErrorMeta(
        branch=VerificationBranch.N3,
        truc=4,
        nhom_loi="Chỉ báo năng lực số thiếu bằng chứng cụ thể hóa",
        check_type="LLM_JUDGE",
    ),
}

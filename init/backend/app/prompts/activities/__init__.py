"""
Activities Prompts - Export tất cả prompt cho các hoạt động
"""
from .muc_tieu import PROMPT as MUC_TIEU_PROMPT
from .thiet_bi import PROMPT as THIET_BI_PROMPT
from .khoi_dong import PROMPT as KHOI_DONG_PROMPT
from .hinh_thanh_kien_thuc import PROMPT as HINH_THANH_KIEN_THUC_PROMPT
from .luyen_tap import PROMPT as LUYEN_TAP_PROMPT
from .van_dung import PROMPT as VAN_DUNG_PROMPT

# Dictionary mapping section_type -> prompt
SECTION_PROMPTS = {
    "muc_tieu": MUC_TIEU_PROMPT,
    "thiet_bi": THIET_BI_PROMPT,
    "khoi_dong": KHOI_DONG_PROMPT,
    "hinh_thanh_kien_thuc": HINH_THANH_KIEN_THUC_PROMPT,
    "luyen_tap": LUYEN_TAP_PROMPT,
    "van_dung": VAN_DUNG_PROMPT,
}

__all__ = [
    "SECTION_PROMPTS",
    "MUC_TIEU_PROMPT",
    "THIET_BI_PROMPT", 
    "KHOI_DONG_PROMPT",
    "HINH_THANH_KIEN_THUC_PROMPT",
    "LUYEN_TAP_PROMPT",
    "VAN_DUNG_PROMPT",
]

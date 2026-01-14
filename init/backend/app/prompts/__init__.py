"""
Prompts Module - Chứa các prompt template cho AI

Cấu trúc:
├── __init__.py                    # File này
├── section_improvement.py         # get_section_improvement_prompt() + SYSTEM_PROMPT
├── lesson_plan_generation.py      # get_system_instruction() + build_lesson_plan_prompt()
└── activities/
    ├── __init__.py               # SECTION_PROMPTS dictionary
    ├── muc_tieu.py               # Prompt cho phần Mục tiêu
    ├── thiet_bi.py               # Prompt cho phần Thiết bị
    ├── khoi_dong.py              # Prompt cho hoạt động Khởi động
    ├── hinh_thanh_kien_thuc.py   # Prompt cho hoạt động Hình thành kiến thức
    ├── luyen_tap.py              # Prompt cho hoạt động Luyện tập
    └── van_dung.py               # Prompt cho hoạt động Vận dụng
"""
from .section_improvement import get_section_improvement_prompt, SYSTEM_PROMPT
from .activities import SECTION_PROMPTS
from .lesson_plan_generation import get_system_instruction, build_lesson_plan_prompt

__all__ = [
    "get_section_improvement_prompt",
    "SYSTEM_PROMPT",
    "SECTION_PROMPTS",
    "get_system_instruction",
    "build_lesson_plan_prompt",
]

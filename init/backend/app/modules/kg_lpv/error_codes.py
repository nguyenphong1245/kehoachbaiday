"""Khung định nghĩa mã lỗi kiểm chứng KG-LPV.

Bộ 15 mã lỗi (D1, M1-M6, C1-C8) và metadata (nhánh, trục, loại kiểm) được
hiện thực ở các task pipeline sau (Task 3, 5, 6). File này chỉ giữ chỗ cho
khung module ở Task 1.
"""

from enum import Enum


class VerificationBranch(str, Enum):
    """3 nhánh kiểm chứng của pipeline KG-LPV."""

    N1 = "N1"
    N2 = "N2"
    N3 = "N3"

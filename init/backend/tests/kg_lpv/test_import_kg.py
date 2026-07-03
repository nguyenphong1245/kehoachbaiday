"""Test hàm thuần validate_provenance của importer KG-LPV (Task 2).

Không cần Neo4j sống — chỉ kiểm tra logic thuần kiểm tra 4 trường vết xuất xứ
bắt buộc trên mỗi bản ghi (đỉnh/cạnh) trước khi nạp vào đồ thị.
"""
import sys
from pathlib import Path

# Cho phép import trực tiếp import_kg.py (script, không phải package cài đặt)
SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts" / "kg_lpv"
sys.path.insert(0, str(SCRIPTS_DIR))

from import_kg import validate_provenance  # noqa: E402

COMPLETE_RECORD = {
    "label": "BaiHoc",
    "ma_dinh_danh": "BH-TIN10-C1-B1",
    "ten": "Bài 1: Thông tin và xử lý thông tin",
    "ma_nguon": "CT-TIN-2018",
    "so_ky_hieu": "32/2018/TT-BGDĐT",
    "ngay_hieu_luc": "2018-12-26",
    "vi_tri_trang": "tr.15",
}


def test_complete_record_has_no_errors():
    errors = validate_provenance(COMPLETE_RECORD)
    assert errors == []


def test_missing_ma_nguon_reports_error():
    record = {k: v for k, v in COMPLETE_RECORD.items() if k != "ma_nguon"}
    errors = validate_provenance(record)
    assert len(errors) == 1
    assert "ma_nguon" in errors[0]


def test_missing_so_ky_hieu_reports_error():
    record = {k: v for k, v in COMPLETE_RECORD.items() if k != "so_ky_hieu"}
    errors = validate_provenance(record)
    assert len(errors) == 1
    assert "so_ky_hieu" in errors[0]


def test_missing_ngay_hieu_luc_reports_error():
    record = {k: v for k, v in COMPLETE_RECORD.items() if k != "ngay_hieu_luc"}
    errors = validate_provenance(record)
    assert len(errors) == 1
    assert "ngay_hieu_luc" in errors[0]


def test_missing_vi_tri_trang_reports_error():
    record = {k: v for k, v in COMPLETE_RECORD.items() if k != "vi_tri_trang"}
    errors = validate_provenance(record)
    assert len(errors) == 1
    assert "vi_tri_trang" in errors[0]


def test_missing_all_four_fields_reports_four_errors():
    record = {"label": "BaiHoc", "ma_dinh_danh": "BH-X"}
    errors = validate_provenance(record)
    assert len(errors) == 4
    for field in ("ma_nguon", "so_ky_hieu", "ngay_hieu_luc", "vi_tri_trang"):
        assert any(field in e for e in errors)


def test_blank_string_value_counts_as_missing():
    record = dict(COMPLETE_RECORD)
    record["vi_tri_trang"] = "   "
    errors = validate_provenance(record)
    assert len(errors) == 1
    assert "vi_tri_trang" in errors[0]


def test_edge_record_uses_same_validation():
    edge = {
        "type": "CO_YCCD",
        "from": "BH-TIN10-C1-B1",
        "to": "YCCD-TIN10-C1-B1-01",
        "ma_nguon": "CT-TIN-2018",
        "so_ky_hieu": "32/2018/TT-BGDĐT",
        "ngay_hieu_luc": "2018-12-26",
        "vi_tri_trang": "tr.15",
    }
    assert validate_provenance(edge) == []

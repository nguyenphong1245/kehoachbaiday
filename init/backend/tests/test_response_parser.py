"""Tests for the response parser module."""
import json

from app.services.response_parser import (
    clean_section_content,
    parse_response_to_sections,
    repair_truncated_json,
    sanitize_json_response,
)


def test_sanitize_json_removes_invalid_escapes():
    raw = r'{"content": "Hello \World"}'
    result = sanitize_json_response(raw)
    assert result == '{"content": "Hello World"}'


def test_sanitize_json_preserves_valid_escapes():
    raw = r'{"content": "line1\nline2\ttab"}'
    result = sanitize_json_response(raw)
    assert result == raw


def test_clean_section_content_trims_embedded_json():
    content = 'Main content here, {"section_type": "other", "title": "Extra"}'
    result = clean_section_content(content, "test")
    assert result == "Main content here"


def test_clean_section_content_decodes_literal_newlines():
    content = "line1\\nline2\\nline3\\nline4\\nline5\\nline6\\nline7"
    result = clean_section_content(content, "test")
    assert "\\n" not in result
    assert "\n" in result


def test_clean_section_content_empty():
    assert clean_section_content("", "test") == ""


def test_repair_truncated_json_valid():
    data = json.dumps({"sections": [{"section_type": "test", "title": "Test", "content": "Hello"}]})
    result = repair_truncated_json(data)
    assert result == data


def test_repair_truncated_json_truncated():
    data = '{"sections": [{"section_type": "test", "title": "Test", "content": "Hello"}, {"section_type": "second", "title": "Se'
    result = repair_truncated_json(data)
    assert result is not None
    parsed = json.loads(result)
    assert len(parsed["sections"]) == 1


def test_repair_truncated_json_empty():
    assert repair_truncated_json("") is None
    assert repair_truncated_json("   ") is None


def test_parse_response_to_sections_valid_json():
    data = json.dumps({
        "sections": [
            {"section_type": "muc_tieu", "title": "Mục tiêu", "content": "Nội dung mục tiêu"},
            {"section_type": "khoi_dong", "title": "Khởi động", "content": "Nội dung khởi động"},
        ]
    })
    sections = parse_response_to_sections(data)
    assert len(sections) == 2
    assert sections[0].section_type == "muc_tieu"
    assert sections[1].section_type == "khoi_dong"


def test_parse_response_to_sections_fallback():
    raw = "This is plain text that is not JSON"
    sections = parse_response_to_sections(raw)
    assert len(sections) == 1
    assert sections[0].section_type == "full"


def test_parse_response_quiz_formatting():
    data = json.dumps({
        "sections": [
            {
                "section_type": "trac_nghiem",
                "title": "Trắc nghiệm",
                "content": "",
                "questions": [
                    {"question": "Q1?", "A": "a1", "B": "b1", "C": "c1", "D": "d1", "answer": "A"},
                ],
            }
        ]
    })
    sections = parse_response_to_sections(data)
    assert len(sections) == 1
    assert "Câu 1" in sections[0].content
    assert sections[0].questions is not None


def test_parse_response_phieu_hoc_tap_ids():
    data = json.dumps({
        "sections": [
            {"section_type": "phieu_hoc_tap", "title": "Phiếu 1", "content": "Content 1"},
            {"section_type": "phieu_hoc_tap", "title": "Phiếu 2", "content": "Content 2"},
        ]
    })
    sections = parse_response_to_sections(data)
    assert sections[0].section_id == "phieu_hoc_tap_1"
    assert sections[1].section_id == "phieu_hoc_tap_2"

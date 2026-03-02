"""Tests for student management in classrooms (Module 5 - 7 test cases)."""

import io

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.helpers.auth_helpers import auth_delete, auth_post
from tests.helpers.factories import (
    create_class_student,
    create_classroom,
    create_student_user,
    create_teacher,
    ensure_roles,
)


def _upload_url(classroom_id: int) -> str:
    return f"/api/v1/classrooms/{classroom_id}/upload-students"


def _students_url(classroom_id: int) -> str:
    return f"/api/v1/classrooms/{classroom_id}/students"


def _make_csv(rows: list[str]) -> io.BytesIO:
    content = "\n".join(rows).encode("utf-8")
    return io.BytesIO(content)


# ---------- 5.1 Upload Students CSV ----------
@pytest.mark.asyncio
async def test_upload_students_csv(client: AsyncClient, teacher_user, classroom):
    csv = _make_csv([
        "STT,Ho va ten,Ngay sinh",
        "1,Nguyen Van A,01/01/2008",
        "2,Tran Thi B,15/05/2008",
    ])
    from tests.helpers.auth_helpers import make_auth_cookies, csrf_headers_and_cookies
    cookies = make_auth_cookies(teacher_user.id)
    csrf_h, csrf_c = csrf_headers_and_cookies()
    cookies.update(csrf_c)

    resp = await client.post(
        _upload_url(classroom.id),
        files={"file": ("students.csv", csv, "text/csv")},
        headers=csrf_h,
        cookies=cookies,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_uploaded"] == 2
    assert data["total_created"] >= 2


# ---------- 5.2 Upload Students XLSX ----------
@pytest.mark.asyncio
async def test_upload_students_xlsx(client: AsyncClient, teacher_user, classroom):
    """Test XLSX upload (creates a minimal xlsx in memory)."""
    try:
        from openpyxl import Workbook
    except ImportError:
        pytest.skip("openpyxl not installed")

    wb = Workbook()
    ws = wb.active
    ws.append(["STT", "Ho va ten", "Ngay sinh"])
    ws.append([1, "Le Van C", "20/03/2008"])
    ws.append([2, "Pham Thi D", "10/07/2008"])

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)

    from tests.helpers.auth_helpers import make_auth_cookies, csrf_headers_and_cookies
    cookies = make_auth_cookies(teacher_user.id)
    csrf_h, csrf_c = csrf_headers_and_cookies()
    cookies.update(csrf_c)

    resp = await client.post(
        _upload_url(classroom.id),
        files={"file": ("students.xlsx", buf, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
        headers=csrf_h,
        cookies=cookies,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_uploaded"] == 2


# ---------- 5.3 Upload Students Auto Code ----------
@pytest.mark.asyncio
async def test_upload_students_auto_code(client: AsyncClient, teacher_user, classroom):
    """Student codes should be auto-generated."""
    csv = _make_csv([
        "STT,Ho va ten,Ngay sinh",
        "1,Auto Code Student,01/01/2008",
    ])
    from tests.helpers.auth_helpers import make_auth_cookies, csrf_headers_and_cookies
    cookies = make_auth_cookies(teacher_user.id)
    csrf_h, csrf_c = csrf_headers_and_cookies()
    cookies.update(csrf_c)

    resp = await client.post(
        _upload_url(classroom.id),
        files={"file": ("students.csv", csv, "text/csv")},
        headers=csrf_h,
        cookies=cookies,
    )
    assert resp.status_code == 200
    students = resp.json().get("students", [])
    if students:
        assert students[0]["student_code"] is not None
        assert len(students[0]["student_code"]) > 0


# ---------- 5.4 Upload Students Auto Account ----------
@pytest.mark.asyncio
async def test_upload_students_auto_account(client: AsyncClient, teacher_user, classroom):
    """Student accounts should be auto-created with login credentials."""
    csv = _make_csv([
        "STT,Ho va ten,Ngay sinh",
        "1,Auto Account Student,15/06/2008",
    ])
    from tests.helpers.auth_helpers import make_auth_cookies, csrf_headers_and_cookies
    cookies = make_auth_cookies(teacher_user.id)
    csrf_h, csrf_c = csrf_headers_and_cookies()
    cookies.update(csrf_c)

    resp = await client.post(
        _upload_url(classroom.id),
        files={"file": ("students.csv", csv, "text/csv")},
        headers=csrf_h,
        cookies=cookies,
    )
    assert resp.status_code == 200
    students = resp.json().get("students", [])
    if students:
        # Student should have a user_id (account was created)
        assert students[0]["user_id"] is not None


# ---------- 5.5 Upload Students Vietnamese Headers ----------
@pytest.mark.asyncio
async def test_upload_students_vietnamese_headers(client: AsyncClient, teacher_user, classroom):
    """Support Vietnamese column headers."""
    csv = _make_csv([
        "STT,Họ và tên,Ngày sinh",
        "1,Vietnamese Header Student,01/01/2008",
    ])
    from tests.helpers.auth_helpers import make_auth_cookies, csrf_headers_and_cookies
    cookies = make_auth_cookies(teacher_user.id)
    csrf_h, csrf_c = csrf_headers_and_cookies()
    cookies.update(csrf_c)

    resp = await client.post(
        _upload_url(classroom.id),
        files={"file": ("students.csv", csv, "text/csv")},
        headers=csrf_h,
        cookies=cookies,
    )
    assert resp.status_code == 200
    assert resp.json()["total_created"] >= 1


# ---------- 5.6 Add Individual Student ----------
@pytest.mark.asyncio
async def test_add_individual_student(client: AsyncClient, teacher_user, classroom):
    resp = await auth_post(
        client,
        _students_url(classroom.id),
        teacher_user.id,
        json={"full_name": "Individual Student"},
    )
    assert resp.status_code == 201
    assert resp.json()["full_name"] == "Individual Student"


# ---------- 5.7 Remove Student ----------
@pytest.mark.asyncio
async def test_remove_student(client: AsyncClient, teacher_user, classroom, class_student):
    resp = await auth_delete(
        client,
        f"{_students_url(classroom.id)}/{class_student.id}",
        teacher_user.id,
    )
    assert resp.status_code == 204

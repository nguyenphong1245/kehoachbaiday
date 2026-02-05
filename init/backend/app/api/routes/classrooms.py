"""
API Routes cho Quản lý Lớp học
"""
import csv
import io
import logging
import random
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_user, require_role, require_teacher, user_has_role
from app.core.security import get_password_hash
from app.models.user import User
from app.models.role import Role
from app.models.classroom import Classroom
from app.models.class_student import ClassStudent
from app.models.student_group import StudentGroup, GroupMember
from app.models.work_session import GroupWorkSession
from app.models.classroom_material import ClassroomMaterial
from app.models.association import user_roles_table
from app.schemas.classroom import (
    ClassroomCreate,
    ClassroomUpdate,
    ClassroomRead,
    ClassroomListResponse,
    ClassroomDetailRead,
    ClassStudentRead,
    AddStudentRequest,
    StudentUploadResponse,
    GroupCreateRequest,
    GroupUpdateRequest,
    StudentGroupRead,
    GroupMemberRead,
    BulkGroupCreateRequest,
    BulkGroupCreateResponse,
)

router = APIRouter()
logger = logging.getLogger(__name__)


# ============== HELPERS ==============

def _parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse date string DD/MM/YYYY or year-only YYYY to date object"""
    if not date_str:
        return None
    date_str = date_str.strip()
    # Handle year-only (e.g., "2010")
    if date_str.isdigit() and len(date_str) == 4:
        return datetime(int(date_str), 1, 1).date()
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d.%m.%Y"):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None


def _make_student_username(student_code: str, classroom_id: int) -> str:
    """Generate username for student account (no email format)"""
    safe_code = student_code.replace(" ", "").lower()
    return f"hs_{safe_code}_{classroom_id}"


def _make_default_password(date_of_birth, student_code: str = "") -> str:
    """Generate secure default password.

    Format: hs{DDMM}_{4-random}_{student_code_suffix}
    Example: hs1503_xK9m_hs001

    This is much stronger than just DOB (36,500 combinations) - now has
    approximately 14 million combinations per DOB.
    """
    import secrets
    import string

    # Generate 4 random alphanumeric characters
    alphabet = string.ascii_letters + string.digits
    random_part = ''.join(secrets.choice(alphabet) for _ in range(4))

    # Get student code suffix (last 5 chars or full code if shorter)
    code_suffix = student_code[-5:] if student_code else "user"

    if date_of_birth:
        dob_part = date_of_birth.strftime('%d%m')
        return f"hs{dob_part}_{random_part}_{code_suffix}"

    return f"hs_{random_part}_{code_suffix}"


async def _verify_classroom_owner(classroom_id: int, user: User, db: AsyncSession) -> Classroom:
    """Verify user owns the classroom"""
    result = await db.execute(
        select(Classroom).where(Classroom.id == classroom_id)
    )
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
    if classroom.teacher_id != user.id and not user_has_role(user, "admin"):
        raise HTTPException(status_code=403, detail="Bạn không có quyền quản lý lớp này")
    return classroom


async def _get_student_role(db: AsyncSession) -> Role:
    """Get the student role"""
    result = await db.execute(select(Role).where(Role.name == "student"))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=500, detail="Student role not found")
    return role


def _build_student_read(cs: ClassStudent) -> ClassStudentRead:
    """Build ClassStudentRead from ClassStudent model"""
    return ClassStudentRead(
        id=cs.id,
        user_id=cs.user_id,
        student_code=cs.student_code,
        student_number=cs.student_number,
        full_name=cs.full_name,
        date_of_birth=cs.date_of_birth,
        email=cs.user.email if cs.user else "",
        joined_at=cs.joined_at,
    )


def _build_group_read(group: StudentGroup) -> StudentGroupRead:
    """Build StudentGroupRead from StudentGroup model"""
    members = []
    for gm in group.members:
        members.append(GroupMemberRead(
            id=gm.id,
            student_id=gm.student_id,
            full_name=gm.student.full_name if gm.student else "",
            student_code=gm.student.student_code if gm.student else None,
        ))
    return StudentGroupRead(
        id=group.id,
        name=group.name,
        members=members,
        created_at=group.created_at,
    )


# ============== CLASSROOM CRUD ==============

@router.post("/", response_model=ClassroomRead, status_code=201)
async def create_classroom(
    data: ClassroomCreate,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Tạo lớp học mới"""
    classroom = Classroom(
        name=data.name,
        teacher_id=current_user.id,
        grade=data.grade,
        school_year=data.school_year,
        description=data.description,
    )
    db.add(classroom)
    await db.commit()
    await db.refresh(classroom)

    return ClassroomRead(
        id=classroom.id,
        name=classroom.name,
        grade=classroom.grade,
        school_year=classroom.school_year,
        description=classroom.description,
        student_count=0,
        group_count=0,
        created_at=classroom.created_at,
        updated_at=classroom.updated_at,
    )


@router.get("/", response_model=ClassroomListResponse)
async def list_classrooms(
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Danh sách lớp học của giáo viên"""
    result = await db.execute(
        select(Classroom)
        .where(Classroom.teacher_id == current_user.id)
        .options(
            selectinload(Classroom.students),
            selectinload(Classroom.groups),
        )
        .order_by(Classroom.created_at.desc())
    )
    classrooms = result.scalars().all()

    items = []
    for c in classrooms:
        items.append(ClassroomRead(
            id=c.id,
            name=c.name,
            grade=c.grade,
            school_year=c.school_year,
            description=c.description,
            student_count=len(c.students),
            group_count=len(c.groups),
            created_at=c.created_at,
            updated_at=c.updated_at,
        ))

    return ClassroomListResponse(classrooms=items, total=len(items))


@router.get("/{classroom_id}", response_model=ClassroomDetailRead)
async def get_classroom_detail(
    classroom_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Chi tiết lớp học với danh sách học sinh và nhóm"""
    result = await db.execute(
        select(Classroom)
        .where(Classroom.id == classroom_id)
        .options(
            selectinload(Classroom.students).selectinload(ClassStudent.user),
            selectinload(Classroom.groups).selectinload(StudentGroup.members).selectinload(GroupMember.student),
        )
    )
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Không tìm thấy lớp học")
    if classroom.teacher_id != current_user.id and not user_has_role(current_user, "admin"):
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem lớp này")

    students = [_build_student_read(cs) for cs in classroom.students]
    groups = [_build_group_read(g) for g in classroom.groups]

    return ClassroomDetailRead(
        id=classroom.id,
        name=classroom.name,
        grade=classroom.grade,
        school_year=classroom.school_year,
        description=classroom.description,
        students=students,
        groups=groups,
        created_at=classroom.created_at,
        updated_at=classroom.updated_at,
    )


@router.patch("/{classroom_id}", response_model=ClassroomRead)
async def update_classroom(
    classroom_id: int,
    data: ClassroomUpdate,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật thông tin lớp học"""
    classroom = await _verify_classroom_owner(classroom_id, current_user, db)

    if data.name is not None:
        classroom.name = data.name
    if data.grade is not None:
        classroom.grade = data.grade
    if data.school_year is not None:
        classroom.school_year = data.school_year
    if data.description is not None:
        classroom.description = data.description

    await db.commit()
    await db.refresh(classroom)

    # Count students and groups
    student_count_result = await db.execute(
        select(func.count(ClassStudent.id)).where(ClassStudent.classroom_id == classroom_id)
    )
    group_count_result = await db.execute(
        select(func.count(StudentGroup.id)).where(StudentGroup.classroom_id == classroom_id)
    )

    return ClassroomRead(
        id=classroom.id,
        name=classroom.name,
        grade=classroom.grade,
        school_year=classroom.school_year,
        description=classroom.description,
        student_count=student_count_result.scalar() or 0,
        group_count=group_count_result.scalar() or 0,
        created_at=classroom.created_at,
        updated_at=classroom.updated_at,
    )


@router.delete("/{classroom_id}", status_code=204)
async def delete_classroom(
    classroom_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Xóa lớp học"""
    classroom = await _verify_classroom_owner(classroom_id, current_user, db)
    await db.delete(classroom)
    await db.commit()


# ============== STUDENT MANAGEMENT ==============

@router.post("/{classroom_id}/upload-students", response_model=StudentUploadResponse)
async def upload_students(
    classroom_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Upload file Excel hoặc CSV danh sách học sinh"""
    from app.core.config import get_settings
    settings = get_settings()

    classroom = await _verify_classroom_owner(classroom_id, current_user, db)
    student_role = await _get_student_role(db)

    # Check file size before reading (DoS protection)
    max_size_bytes = settings.max_file_size_mb * 1024 * 1024
    content = await file.read()

    if len(content) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File quá lớn. Kích thước tối đa cho phép: {settings.max_file_size_mb}MB"
        )

    filename = file.filename or ""

    rows = []
    if filename.endswith(".xlsx"):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content))
            ws = wb.active
            headers = None
            for row in ws.iter_rows(values_only=True):
                if headers is None:
                    headers = [str(h).strip().lower() if h else "" for h in row]
                    continue
                if not any(row):
                    continue
                row_dict = {}
                for i, val in enumerate(row):
                    if i < len(headers):
                        row_dict[headers[i]] = str(val).strip() if val else ""
                rows.append(row_dict)
        except ImportError:
            raise HTTPException(status_code=400, detail="Server chưa cài openpyxl. Vui lòng upload file CSV.")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Lỗi đọc file Excel: {str(e)}")
    elif filename.endswith(".csv"):
        try:
            text = content.decode("utf-8-sig")
            reader = csv.DictReader(io.StringIO(text))
            for row in reader:
                cleaned = {k.strip().lower(): v.strip() for k, v in row.items() if k}
                rows.append(cleaned)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Lỗi đọc file CSV: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file .xlsx hoặc .csv")

    if not rows:
        raise HTTPException(status_code=400, detail="File không có dữ liệu")

    # Map column names (support Vietnamese headers)
    name_keys = ["tên học sinh", "ten hoc sinh", "ho ten", "hoten", "họ tên", "hovaten", "ho va ten", "họ và tên", "full_name", "name", "ten", "tên"]
    code_keys = ["mã học sinh", "ma hoc sinh", "ma hs", "mahs", "mã hs", "student_code", "code", "ma so", "mã số", "ma"]
    dob_keys = ["năm sinh", "nam sinh", "ngay sinh", "ngaysinh", "ngày sinh", "date_of_birth", "dob", "sinh"]

    def _find_value(row_dict, keys):
        for k in keys:
            if k in row_dict and row_dict[k]:
                return row_dict[k]
        return None

    total_created = 0
    total_skipped = 0
    skipped_details = []
    created_students = []

    for idx, row in enumerate(rows, start=1):
        full_name = _find_value(row, name_keys)
        student_code = _find_value(row, code_keys)
        dob_str = _find_value(row, dob_keys)

        if not full_name:
            total_skipped += 1
            skipped_details.append(f"Dòng {idx}: Thiếu họ tên")
            continue

        # Generate student_code if not provided
        if not student_code:
            student_code = f"hs{idx:03d}"

        # Check if student_code already exists in this classroom
        existing = await db.execute(
            select(ClassStudent).where(
                ClassStudent.classroom_id == classroom_id,
                ClassStudent.student_code == student_code,
            )
        )
        if existing.scalar_one_or_none():
            total_skipped += 1
            skipped_details.append(f"Dòng {idx}: Mã HS '{student_code}' đã tồn tại trong lớp")
            continue

        # Parse DOB
        dob = _parse_date(dob_str)

        # Create user account
        email = _make_student_username(student_code, classroom_id)

        # Check if user with this email already exists
        existing_user = await db.execute(select(User).where(User.email == email))
        user = existing_user.scalar_one_or_none()

        if not user:
            password = _make_default_password(dob, student_code)
            hashed_pw = get_password_hash(password)
            user = User(
                email=email,
                hashed_password=hashed_pw,
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()  # Get user.id

            # Assign student role
            await db.execute(
                user_roles_table.insert().values(user_id=user.id, role_id=student_role.id)
            )

            # Log the generated password for teacher to distribute
            logger.info(
                "Created student account: username=%s password=%s",
                email, password
            )

        # Create ClassStudent
        cs = ClassStudent(
            classroom_id=classroom_id,
            user_id=user.id,
            student_code=student_code,
            student_number=idx,
            full_name=full_name,
            date_of_birth=dob,
        )
        db.add(cs)
        await db.flush()

        total_created += 1
        created_students.append(ClassStudentRead(
            id=cs.id,
            user_id=user.id,
            student_code=student_code,
            student_number=idx,
            full_name=full_name,
            date_of_birth=dob,
            email=email,
            joined_at=cs.joined_at,
        ))

    await db.commit()

    return StudentUploadResponse(
        total_uploaded=len(rows),
        total_created=total_created,
        total_skipped=total_skipped,
        skipped_details=skipped_details,
        students=created_students,
    )


@router.post("/{classroom_id}/students", response_model=ClassStudentRead, status_code=201)
async def add_student(
    classroom_id: int,
    data: AddStudentRequest,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Thêm 1 học sinh vào lớp"""
    classroom = await _verify_classroom_owner(classroom_id, current_user, db)
    student_role = await _get_student_role(db)

    # Parse DOB
    dob = _parse_date(data.date_of_birth)

    # Generate student code if not provided
    student_code = data.student_code
    if not student_code:
        count_result = await db.execute(
            select(func.count(ClassStudent.id)).where(ClassStudent.classroom_id == classroom_id)
        )
        count = count_result.scalar() or 0
        student_code = f"hs{count + 1:03d}"

    # Check duplicate
    existing = await db.execute(
        select(ClassStudent).where(
            ClassStudent.classroom_id == classroom_id,
            ClassStudent.student_code == student_code,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail=f"Mã HS '{student_code}' đã tồn tại trong lớp")

    # Create user account
    email = _make_student_username(student_code, classroom_id)
    existing_user = await db.execute(select(User).where(User.email == email))
    user = existing_user.scalar_one_or_none()

    if not user:
        password = _make_default_password(dob, student_code)
        hashed_pw = get_password_hash(password)
        user = User(
            email=email,
            hashed_password=hashed_pw,
            is_active=True,
            is_verified=True,
        )
        db.add(user)
        await db.flush()

        await db.execute(
            user_roles_table.insert().values(user_id=user.id, role_id=student_role.id)
        )

        # Log the generated password for teacher to distribute
        logger.info(
            "Created student account: username=%s password=%s",
            email, password
        )

    # Get student number
    count_result = await db.execute(
        select(func.count(ClassStudent.id)).where(ClassStudent.classroom_id == classroom_id)
    )
    student_number = (count_result.scalar() or 0) + 1

    cs = ClassStudent(
        classroom_id=classroom_id,
        user_id=user.id,
        student_code=student_code,
        student_number=student_number,
        full_name=data.full_name,
        date_of_birth=dob,
    )
    db.add(cs)
    await db.commit()
    await db.refresh(cs)

    return ClassStudentRead(
        id=cs.id,
        user_id=user.id,
        student_code=student_code,
        student_number=student_number,
        full_name=data.full_name,
        date_of_birth=dob,
        email=email,
        joined_at=cs.joined_at,
    )


@router.delete("/{classroom_id}/students/{student_id}", status_code=204)
async def remove_student(
    classroom_id: int,
    student_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Xóa học sinh khỏi lớp"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    result = await db.execute(
        select(ClassStudent).where(
            ClassStudent.id == student_id,
            ClassStudent.classroom_id == classroom_id,
        )
    )
    cs = result.scalar_one_or_none()
    if not cs:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh trong lớp")

    await db.delete(cs)
    await db.commit()


# ============== GROUP MANAGEMENT ==============

@router.post("/{classroom_id}/groups", response_model=StudentGroupRead, status_code=201)
async def create_group(
    classroom_id: int,
    data: GroupCreateRequest,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Tạo nhóm mới với danh sách thành viên"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    group = StudentGroup(
        classroom_id=classroom_id,
        name=data.name,
    )
    db.add(group)
    await db.flush()

    # Add members
    members = []
    for sid in data.student_ids:
        # Verify student belongs to this classroom
        result = await db.execute(
            select(ClassStudent).where(
                ClassStudent.id == sid,
                ClassStudent.classroom_id == classroom_id,
            )
        )
        student = result.scalar_one_or_none()
        if not student:
            continue

        gm = GroupMember(group_id=group.id, student_id=sid)
        db.add(gm)
        members.append(GroupMemberRead(
            id=0,  # Will be set after flush
            student_id=sid,
            full_name=student.full_name,
            student_code=student.student_code,
        ))

    await db.commit()
    await db.refresh(group)

    # Reload with members
    result = await db.execute(
        select(StudentGroup)
        .where(StudentGroup.id == group.id)
        .options(selectinload(StudentGroup.members).selectinload(GroupMember.student))
    )
    group = result.scalar_one()

    return _build_group_read(group)


@router.post("/{classroom_id}/groups/auto-divide", response_model=BulkGroupCreateResponse)
async def auto_divide_groups(
    classroom_id: int,
    data: BulkGroupCreateRequest,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Tự động chia học sinh thành N nhóm"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    # Get all students in classroom
    result = await db.execute(
        select(ClassStudent)
        .where(ClassStudent.classroom_id == classroom_id)
        .order_by(ClassStudent.student_number)
    )
    students = list(result.scalars().all())

    if not students:
        raise HTTPException(status_code=400, detail="Lớp chưa có học sinh")

    if data.num_groups > len(students):
        raise HTTPException(status_code=400, detail="Số nhóm không thể lớn hơn số học sinh")

    try:
        # Get existing group IDs for this classroom
        existing_groups_result = await db.execute(
            select(StudentGroup.id).where(StudentGroup.classroom_id == classroom_id)
        )
        existing_group_ids = [g[0] for g in existing_groups_result.fetchall()]
        logger.info(f"Found {len(existing_group_ids)} existing groups for classroom {classroom_id}")

        if existing_group_ids:
            # Delete work sessions for these groups first (in case CASCADE doesn't work)
            await db.execute(
                delete(GroupWorkSession).where(GroupWorkSession.group_id.in_(existing_group_ids))
            )
            # Delete group members
            await db.execute(
                delete(GroupMember).where(GroupMember.group_id.in_(existing_group_ids))
            )
            # Delete the groups
            await db.execute(
                delete(StudentGroup).where(StudentGroup.id.in_(existing_group_ids))
            )
            await db.flush()
            logger.info(f"Deleted {len(existing_group_ids)} groups for classroom {classroom_id}")

        # Shuffle if random
        student_list = list(students)
        if data.method == "random":
            random.shuffle(student_list)

        # Divide into groups
        groups_data = [[] for _ in range(data.num_groups)]
        for i, student in enumerate(student_list):
            groups_data[i % data.num_groups].append(student)

        for i, group_students in enumerate(groups_data):
            group = StudentGroup(
                classroom_id=classroom_id,
                name=f"Nhóm {i + 1}",
            )
            db.add(group)
            await db.flush()

            for student in group_students:
                gm = GroupMember(group_id=group.id, student_id=student.id)
                db.add(gm)

            await db.flush()

        await db.commit()
        logger.info(f"Successfully created {data.num_groups} groups for classroom {classroom_id}")
    except Exception as e:
        logger.error(f"Error auto-dividing groups for classroom {classroom_id}: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi chia nhóm: {str(e)}")

    # Reload all groups
    result = await db.execute(
        select(StudentGroup)
        .where(StudentGroup.classroom_id == classroom_id)
        .options(selectinload(StudentGroup.members).selectinload(GroupMember.student))
        .order_by(StudentGroup.id)
    )
    all_groups = result.scalars().all()
    created_groups = [_build_group_read(g) for g in all_groups]

    return BulkGroupCreateResponse(
        groups=created_groups,
        message=f"Đã chia {len(students)} học sinh thành {data.num_groups} nhóm",
    )


@router.patch("/{classroom_id}/groups/{group_id}", response_model=StudentGroupRead)
async def update_group(
    classroom_id: int,
    group_id: int,
    data: GroupUpdateRequest,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật nhóm (tên, thành viên)"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    result = await db.execute(
        select(StudentGroup).where(
            StudentGroup.id == group_id,
            StudentGroup.classroom_id == classroom_id,
        )
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")

    if data.name is not None:
        group.name = data.name

    if data.student_ids is not None:
        # Replace all members
        await db.execute(
            delete(GroupMember).where(GroupMember.group_id == group_id)
        )
        for sid in data.student_ids:
            # Verify student belongs to classroom
            student_result = await db.execute(
                select(ClassStudent).where(
                    ClassStudent.id == sid,
                    ClassStudent.classroom_id == classroom_id,
                )
            )
            if student_result.scalar_one_or_none():
                gm = GroupMember(group_id=group_id, student_id=sid)
                db.add(gm)

    await db.commit()

    # Reload
    result = await db.execute(
        select(StudentGroup)
        .where(StudentGroup.id == group_id)
        .options(selectinload(StudentGroup.members).selectinload(GroupMember.student))
    )
    group = result.scalar_one()
    return _build_group_read(group)


@router.delete("/{classroom_id}/groups/{group_id}", status_code=204)
async def delete_group(
    classroom_id: int,
    group_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Xóa nhóm"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    result = await db.execute(
        select(StudentGroup).where(
            StudentGroup.id == group_id,
            StudentGroup.classroom_id == classroom_id,
        )
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm")

    await db.delete(group)
    await db.commit()


# ============== CLASSROOM MATERIALS (Staging) ==============

@router.post("/{classroom_id}/materials", status_code=201)
async def add_material_to_class(
    classroom_id: int,
    data: dict,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Chuyển học liệu vào danh sách lớp (staging trước khi giao bài)"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    content_type = data.get("content_type")
    content_id = data.get("content_id")
    title = data.get("title", "")
    lesson_info = data.get("lesson_info")

    if content_type not in ("worksheet", "quiz", "code_exercise"):
        raise HTTPException(status_code=400, detail="content_type không hợp lệ")
    if not content_id:
        raise HTTPException(status_code=400, detail="content_id là bắt buộc")

    # Check duplicate
    existing = await db.execute(
        select(ClassroomMaterial).where(
            ClassroomMaterial.classroom_id == classroom_id,
            ClassroomMaterial.content_type == content_type,
            ClassroomMaterial.content_id == content_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Học liệu đã có trong danh sách lớp này")

    mat = ClassroomMaterial(
        classroom_id=classroom_id,
        content_type=content_type,
        content_id=content_id,
        title=title or f"{content_type}_{content_id}",
        lesson_info=lesson_info,
    )
    db.add(mat)
    await db.commit()
    await db.refresh(mat)

    return {
        "id": mat.id,
        "classroom_id": mat.classroom_id,
        "content_type": mat.content_type,
        "content_id": mat.content_id,
        "title": mat.title,
        "lesson_info": mat.lesson_info,
        "created_at": mat.created_at.isoformat() if mat.created_at else None,
    }


@router.get("/{classroom_id}/materials")
async def list_classroom_materials(
    classroom_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Danh sách học liệu đã chuyển vào lớp"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    result = await db.execute(
        select(ClassroomMaterial)
        .where(ClassroomMaterial.classroom_id == classroom_id)
        .order_by(ClassroomMaterial.created_at.desc())
    )
    materials = result.scalars().all()

    return [
        {
            "id": m.id,
            "classroom_id": m.classroom_id,
            "content_type": m.content_type,
            "content_id": m.content_id,
            "title": m.title,
            "lesson_info": m.lesson_info,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in materials
    ]


@router.delete("/{classroom_id}/materials/{material_id}", status_code=204)
async def remove_material_from_class(
    classroom_id: int,
    material_id: int,
    current_user: User = Depends(require_teacher()),
    db: AsyncSession = Depends(get_db),
):
    """Xóa học liệu khỏi danh sách lớp"""
    await _verify_classroom_owner(classroom_id, current_user, db)

    result = await db.execute(
        select(ClassroomMaterial).where(
            ClassroomMaterial.id == material_id,
            ClassroomMaterial.classroom_id == classroom_id,
        )
    )
    mat = result.scalar_one_or_none()
    if not mat:
        raise HTTPException(status_code=404, detail="Không tìm thấy học liệu trong lớp")

    await db.delete(mat)
    await db.commit()

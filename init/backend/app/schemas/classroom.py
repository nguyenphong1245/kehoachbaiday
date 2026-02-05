"""
Schemas cho Quản lý Lớp học, Học sinh, Nhóm
"""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ============== CLASSROOM ==============

class ClassroomCreate(BaseModel):
    name: str = Field(..., max_length=100, description="Tên lớp (VD: 10A1)")
    grade: Optional[str] = Field(None, max_length=20, description="Khối (10, 11, 12)")
    school_year: Optional[str] = Field(None, max_length=20, description="Năm học (2025-2026)")
    description: Optional[str] = None


class ClassroomUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    grade: Optional[str] = Field(None, max_length=20)
    school_year: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None


class ClassroomRead(BaseModel):
    id: int
    name: str
    grade: Optional[str]
    school_year: Optional[str]
    description: Optional[str]
    student_count: int = 0
    group_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ClassroomListResponse(BaseModel):
    classrooms: List[ClassroomRead]
    total: int


# ============== CLASS STUDENT ==============

class ClassStudentRead(BaseModel):
    id: int
    user_id: int
    student_code: Optional[str]
    student_number: Optional[int]
    full_name: str
    date_of_birth: Optional[date]
    email: str = ""  # Login email
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AddStudentRequest(BaseModel):
    full_name: str = Field(..., max_length=255)
    student_code: Optional[str] = Field(None, max_length=50)
    date_of_birth: Optional[str] = Field(None, description="Ngày sinh DD/MM/YYYY")


class StudentUploadResponse(BaseModel):
    total_uploaded: int
    total_created: int
    total_skipped: int
    skipped_details: List[str] = []
    students: List[ClassStudentRead] = []


# ============== STUDENT GROUP ==============

class GroupMemberRead(BaseModel):
    id: int
    student_id: int
    full_name: str = ""
    student_code: Optional[str] = None

    class Config:
        from_attributes = True


class StudentGroupRead(BaseModel):
    id: int
    name: str
    members: List[GroupMemberRead] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GroupCreateRequest(BaseModel):
    name: str = Field(..., max_length=100, description="Tên nhóm")
    student_ids: List[int] = Field(default=[], description="Danh sách class_student.id")


class GroupUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    student_ids: Optional[List[int]] = None


class BulkGroupCreateRequest(BaseModel):
    num_groups: int = Field(..., gt=0, description="Số nhóm muốn chia")
    method: str = Field("sequential", description="Cách chia: 'sequential' hoặc 'random'")


class BulkGroupCreateResponse(BaseModel):
    groups: List[StudentGroupRead]
    message: str


# ============== CLASSROOM DETAIL ==============

class ClassroomDetailRead(BaseModel):
    id: int
    name: str
    grade: Optional[str]
    school_year: Optional[str]
    description: Optional[str]
    students: List[ClassStudentRead] = []
    groups: List[StudentGroupRead] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

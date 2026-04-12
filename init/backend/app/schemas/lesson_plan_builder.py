"""
Schemas cho Lesson Plan Builder - Giao diện mới cho việc soạn kế hoạch bài dạy
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from enum import Enum


# ============== CONSTANTS - Dữ liệu cứng (Frontend sẽ dùng) ==============

class BookType(str, Enum):
    KNTT = "Kết nối tri thức với cuộc sống"


class Grade(str, Enum):
    LOP_10 = "10"
    LOP_11 = "11"
    LOP_12 = "12"


# NOTE: Topics sẽ được lấy động từ Neo4j theo book_type và grade
# Không còn hardcode TOPICS_BY_GRADE nữa


# Phương pháp và kỹ thuật dạy học
class TeachingMethod(str, Enum):
    """Phương pháp dạy học"""
    COOPERATIVE = "Dạy học hợp tác"
    PROBLEM_SOLVING = "Giải quyết vấn đề"
    DISCOVERY = "Dạy học khám phá"
    GAME = "Dạy học qua trò chơi"
    CASE_STUDY = "Nghiên cứu tình huống"
    DISCUSSION = "Thảo luận nhóm"
    PRACTICE = "Thực hành"
    PRESENTATION = "Thuyết trình"


class TeachingTechnique(str, Enum):
    """Kỹ thuật dạy học"""
    THINK_PAIR_SHARE = "Think-Pair-Share"
    JIGSAW = "Mảnh ghép (Jigsaw)"
    GALLERY_WALK = "Phòng tranh (Gallery Walk)"
    KWL = "KWL"
    BRAINSTORMING = "Động não (Brainstorming)"
    MIND_MAP = "Sơ đồ tư duy"
    FISHBOWL = "Bể cá (Fishbowl)"
    ROLE_PLAY = "Đóng vai"
    QUIZ = "Trắc nghiệm"
    FLASHCARD = "Flashcard"
    PEER_TEACHING = "Dạy học đồng đẳng"


# ============== REQUEST/RESPONSE MODELS ==============

class LessonSearchRequest(BaseModel):
    """Request để tìm bài học từ Neo4j"""
    book_type: str = Field(..., description="Loại sách (KNTT, CTST, CD)")
    grade: str = Field(..., description="Lớp (10, 11, 12)")
    topic: str = Field(..., description="Chủ đề")
    subject: str = Field("", description="Môn học (VD: Tin Học)")



class LessonBasicInfo(BaseModel):
    """Thông tin cơ bản của bài học"""
    id: str = Field(..., description="ID bài học từ Neo4j")
    name: str = Field(..., description="Tên bài học")
    lesson_type: Optional[str] = Field(None, description="Loại bài (Lý thuyết, Thực hành...)")


class LessonSearchResponse(BaseModel):
    """Response danh sách bài học"""
    lessons: List[LessonBasicInfo] = Field(default_factory=list)
    total: int = Field(0)


class ChiMucInfo(BaseModel):
    """Thông tin chi mục của bài học"""
    order: int = Field(..., description="Số thứ tự chi mục")
    content: str = Field(..., description="Nội dung chi mục")


class LessonDetailResponse(BaseModel):
    """Chi tiết bài học để hiển thị cấu trúc"""
    id: str
    name: str
    grade: str
    book_type: str
    topic: str
    lesson_type: Optional[str] = None
    objectives: List[str] = Field(default_factory=list, description="Mục tiêu")
    competencies: List[str] = Field(default_factory=list, description="Năng lực chính")
    supporting_competencies: List[str] = Field(default_factory=list, description="Năng lực hỗ trợ")
    chi_muc_list: List[ChiMucInfo] = Field(default_factory=list, description="Danh sách chỉ mục")
    content: Optional[str] = Field(None, description="Nội dung bài học")
    orientation: Optional[str] = Field(None, description="Định hướng")


class NLSSelectionItem(BaseModel):
    """Một item NLS đã chọn"""
    mien_nang_luc: str = Field(..., description="Tên miền năng lực")
    ma: str = Field(..., description="Mã chỉ báo")
    noi_dung: str = Field(..., description="Nội dung chỉ báo")


class ActivityConfig(BaseModel):
    """Cấu hình cho mỗi hoạt động"""
    activity_name: str = Field(..., max_length=200, description="Tên hoạt động")
    activity_type: str = Field(..., description="Loại hoạt động: khoi_dong, hinh_thanh_kien_thuc, luyen_tap, van_dung")
    chi_muc: Optional[str] = Field(None, max_length=500, description="Tên chỉ mục (cho hoạt động hình thành kiến thức)")
    selected_methods: List[str] = Field(default_factory=list, description="Phương pháp đã chọn")
    selected_techniques: List[str] = Field(default_factory=list, description="Kỹ thuật đã chọn")
    # Nội dung cách tổ chức của phương pháp/kỹ thuật đã chọn
    methods_content: Optional[Dict[str, str]] = Field(default_factory=dict, description="Nội dung cách tổ chức phương pháp {tên: nội dung}")
    techniques_content: Optional[Dict[str, str]] = Field(default_factory=dict, description="Nội dung cách tổ chức kỹ thuật {tên: nội dung}")
    # Yêu cầu bổ sung từ người dùng cho hoạt động
    custom_request: Optional[str] = Field(None, max_length=2000, description="Yêu cầu bổ sung của người dùng cho hoạt động này")
    # Vị trí dạy học cho hoạt động này
    location: Optional[str] = Field("lop_hoc", description="Vị trí dạy học: lop_hoc (Lớp học), phong_may (Phòng máy)")
    # NLS (Năng lực số) - Chỉ báo năng lực số đã chọn
    nls_selections: Optional[List[NLSSelectionItem]] = Field(None, description="Danh sách chỉ báo năng lực số đã chọn")

    @field_validator("activity_type")
    @classmethod
    def validate_activity_type(cls, v: str) -> str:
        allowed = {"khoi_dong", "hinh_thanh_kien_thuc", "luyen_tap", "van_dung"}
        if v not in allowed:
            raise ValueError(f"activity_type phải là một trong: {allowed}")
        return v

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"lop_hoc", "phong_may"}
        if v not in allowed:
            raise ValueError(f"location phải là một trong: {allowed}")
        return v


class GenerateLessonPlanBuilderRequest(BaseModel):
    """Request để sinh kế hoạch bài dạy từ builder"""
    book_type: str = Field(..., description="Loại sách")
    grade: str = Field(..., description="Lớp")
    topic: str = Field(..., description="Chủ đề")
    lesson_id: str = Field(..., description="ID bài học")
    lesson_name: str = Field(..., description="Tên bài học")
    activities: List[ActivityConfig] = Field(..., description="Cấu hình các hoạt động")
    cognitive_level: Optional[str] = Field(None, description="Mức nhận thức HS: weak|average|fair|good|excellent")

    @field_validator("cognitive_level")
    @classmethod
    def validate_cognitive_level(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return None
        allowed = {"weak", "average", "fair", "good", "excellent"}
        if v not in allowed:
            raise ValueError(f"cognitive_level phải là một trong: {allowed}")
        return v


class QuizQuestionItem(BaseModel):
    """Một câu hỏi trắc nghiệm - hỗ trợ multiple_choice và multiple_select"""
    question: str = Field(..., description="Nội dung câu hỏi")
    type: Optional[str] = Field(None, description="Loại: multiple_choice (mặc định) hoặc multiple_select")
    A: str = Field(..., description="Đáp án A")
    B: str = Field(..., description="Đáp án B")
    C: str = Field(..., description="Đáp án C")
    D: str = Field(..., description="Đáp án D")
    answer: str = Field(..., description="Đáp án đúng: 1 chữ cái (VD: A) hoặc nhiều chữ cái (VD: A,C)")


class LessonPlanSection(BaseModel):
    """Một phần/ô trong kế hoạch bài dạy output"""
    section_id: str = Field(..., description="ID duy nhất của section")
    section_type: str = Field(..., description="Loại section: muc_tieu, thiet_bi, khoi_dong, hinh_thanh_kien_thuc_X, luyen_tap, van_dung, phieu_hoc_tap, trac_nghiem")
    title: str = Field(..., description="Tiêu đề section")
    content: str = Field("", description="Nội dung section (Markdown)")
    questions: Optional[List[QuizQuestionItem]] = Field(None, description="Danh sách câu hỏi (chỉ cho trac_nghiem)")
    mindmap_data: Optional[str] = Field(None, description="Dữ liệu sơ đồ tư duy (Markdown headings cho Markmap)")
    mindmap_activity_name: Optional[str] = Field(None, description="Tên hoạt động gắn với sơ đồ tư duy (để chèn đúng vị trí)")
    worksheet_data: Optional[Dict[str, Any]] = Field(None, description="Dữ liệu phiếu học tập JSON")
    editable: bool = Field(True, description="Có thể chỉnh sửa không")


class GenerateLessonPlanBuilderResponse(BaseModel):
    """Response chứa các section của kế hoạch bài dạy"""
    lesson_info: Dict[str, str] = Field(..., description="Thông tin bài học: book_type, grade, topic, lesson_name")
    sections: List[LessonPlanSection] = Field(..., description="Các section của kế hoạch")
    full_content: str = Field(..., description="Nội dung đầy đủ dạng Markdown")


class UpdateSectionRequest(BaseModel):
    """Request cập nhật nội dung một section"""
    section_id: str = Field(...)
    new_content: str = Field(...)


class TeachingMethodItem(BaseModel):
    """Thông tin phương pháp dạy học từ Neo4j"""
    value: str = Field(..., description="Tên phương pháp")
    label: str = Field(..., description="Tên hiển thị")
    cach_tien_hanh: Optional[str] = Field(None, description="Cách tiến hành")


class TeachingTechniqueItem(BaseModel):
    """Thông tin kỹ thuật dạy học từ Neo4j"""
    value: str = Field(..., description="Tên kỹ thuật")
    label: str = Field(..., description="Tên hiển thị")
    cach_tien_hanh: Optional[str] = Field(None, description="Cách tiến hành")


class StaticDataResponse(BaseModel):
    """Response chứa dữ liệu tĩnh cho frontend"""
    book_types: List[Dict[str, str]] = Field(...)
    grades: List[Dict[str, str]] = Field(...)
    methods: List[TeachingMethodItem] = Field(...)
    techniques: List[TeachingTechniqueItem] = Field(...)


class TopicsResponse(BaseModel):
    """Response chứa danh sách chủ đề theo sách và lớp"""
    topics: List[str] = Field(default_factory=list, description="Danh sách chủ đề")


class SubjectsResponse(BaseModel):
    """Response chứa danh sách môn học từ Neo4j"""
    subjects: List[str] = Field(default_factory=list, description="Danh sách môn học")


# ============== SAVED LESSON PLAN STORAGE ==============

class SavedLessonPlanSection(BaseModel):
    """Section đã lưu"""
    section_id: str
    section_type: str
    title: str
    content: str
    mindmap_data: Optional[str] = None
    mindmap_activity_name: Optional[str] = None
    worksheet_data: Optional[Dict[str, Any]] = None
    questions: Optional[List[Dict[str, Any]]] = None
    editable: bool = True


class SaveLessonPlanRequest(BaseModel):
    """Request để lưu giáo án"""
    title: str = Field(..., description="Tiêu đề giáo án")
    lesson_info: Dict[str, str] = Field(..., description="Thông tin bài học")
    sections: List[SavedLessonPlanSection] = Field(..., description="Các section đã chỉnh sửa")
    full_content: str = Field(..., description="Nội dung đầy đủ dạng Markdown")
    activities: Optional[List[ActivityConfig]] = Field(None, description="Cấu hình hoạt động đã chọn")
    original_content: Optional[str] = Field(None, description="Nội dung gốc trước khi chỉnh sửa")
    is_printed: bool = Field(False, description="Đánh dấu là đã in")


class UpdateLessonPlanRequest(BaseModel):
    """Request để cập nhật giáo án đã lưu"""
    title: Optional[str] = Field(None, description="Tiêu đề giáo án mới")
    sections: Optional[List[SavedLessonPlanSection]] = Field(None, description="Các section đã chỉnh sửa")
    full_content: Optional[str] = Field(None, description="Nội dung đầy đủ dạng Markdown")


class GenerateMindmapRequest(BaseModel):
    """Request để sinh sơ đồ tư duy cho một hoạt động"""
    lesson_id: str = Field(..., description="ID bài học từ Neo4j")
    lesson_name: str = Field(..., description="Tên bài học")
    activity_content: str = Field(..., description="Nội dung hoạt động")
    activity_name: str = Field(..., description="Tên hoạt động")
    activity_type: Optional[str] = Field(None, description="Loại hoạt động: khoi_dong, hinh_thanh_kien_thuc, luyen_tap, van_dung")
    chi_muc: Optional[str] = Field(None, description="Chỉ mục nội dung trong bài học")


class GenerateMindmapResponse(BaseModel):
    """Response chứa dữ liệu sơ đồ tư duy"""
    mindmap_data: str = Field(..., description="Markdown headings cho Markmap")


class SavedLessonPlanRead(BaseModel):
    """Giáo án đã lưu (response)"""
    id: int = Field(..., description="ID của giáo án")
    user_id: int = Field(..., description="ID người dùng")
    title: str = Field(...)
    book_type: Optional[str] = None
    grade: Optional[str] = None
    topic: Optional[str] = None
    lesson_name: Optional[str] = None
    lesson_id: Optional[str] = None
    content: str = Field(...)
    sections: Optional[List[SavedLessonPlanSection]] = None
    generation_params: Optional[List[Dict[str, Any]]] = None
    original_content: Optional[str] = None
    is_printed: bool = False
    print_count: int = 0
    created_at: str = Field(..., description="Thời gian tạo")
    updated_at: str = Field(..., description="Thời gian cập nhật")
    
    class Config:
        from_attributes = True


class SaveLessonPlanResponse(BaseModel):
    """Response sau khi lưu giáo án"""
    id: int = Field(..., description="ID của giáo án đã lưu")
    message: str = Field(default="Lưu giáo án thành công")


class SavedLessonPlanListItem(BaseModel):
    """Item trong danh sách giáo án đã lưu"""
    id: int
    title: str
    lesson_name: Optional[str] = None
    book_type: Optional[str] = None
    grade: Optional[str] = None
    topic: Optional[str] = None
    is_printed: bool = False
    print_count: int = 0
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True


class SavedLessonPlanListResponse(BaseModel):
    """Response danh sách giáo án đã lưu"""
    lesson_plans: List[SavedLessonPlanListItem] = Field(default_factory=list)
    total: int = Field(0)
    page: int = Field(1)
    page_size: int = Field(10)


# ============== AI IMPROVE SECTION ==============

class RelatedAppendix(BaseModel):
    """Phụ lục liên quan đến section"""
    section_id: str = Field(..., description="ID của phụ lục")
    section_type: str = Field(..., description="Loại phụ lục: phieu_hoc_tap, trac_nghiem")
    title: str = Field(..., description="Tiêu đề phụ lục")
    content: str = Field(..., description="Nội dung phụ lục")

class ImproveSectionRequest(BaseModel):
    """Request để AI cải thiện một section"""
    section_type: str = Field(..., description="Loại section: muc_tieu, thiet_bi, khoi_dong, hinh_thanh_kien_thuc, luyen_tap, van_dung")
    section_title: str = Field(..., max_length=500, description="Tiêu đề section")
    current_content: str = Field(..., description="Nội dung hiện tại của section")
    user_request: str = Field(..., max_length=2000, description="Yêu cầu cải thiện từ người dùng")
    lesson_info: Dict[str, str] = Field(..., description="Thông tin bài học: book_type, grade, topic, lesson_name")
    related_appendices: Optional[List[RelatedAppendix]] = Field(None, description="Các phụ lục liên quan cần cập nhật cùng")


class UpdatedAppendix(BaseModel):
    """Phụ lục đã được cập nhật"""
    section_id: str = Field(..., description="ID của phụ lục")
    improved_content: str = Field(..., description="Nội dung phụ lục đã cập nhật")

class ImproveSectionResponse(BaseModel):
    """Response nội dung section đã được cải thiện"""
    improved_content: str = Field(..., description="Nội dung đã được cải thiện")
    explanation: Optional[str] = Field(None, description="Giải thích về những thay đổi")
    updated_appendices: Optional[List[UpdatedAppendix]] = Field(None, description="Các phụ lục đã được cập nhật")


# ============== AI EDIT INLINE SECTION ==============

class EditAnalysis(BaseModel):
    """Phân tích đoạn đang chỉnh sửa."""
    activity_type: str = Field(..., description="Loại hoạt động")
    current_method: str = Field(..., description="Phương pháp/kỹ thuật hiện tại")
    position: str = Field(..., description="Vị trí trong hoạt động")
    issue: str = Field(..., description="Vấn đề chính cần cải thiện")


class EditSuggestion(BaseModel):
    """Một hướng chỉnh sửa do AI đề xuất."""
    id: int = Field(..., description="ID gợi ý")
    type: str = Field(..., description="Loại gợi ý")
    title: str = Field(..., description="Tiêu đề ngắn")
    description: str = Field(..., description="Mô tả chi tiết")


class EditSuggestRequest(BaseModel):
    """Request đề xuất chỉnh sửa cho đoạn được bôi đen."""
    selected_text: str = Field(..., min_length=1, max_length=5000, description="Đoạn giáo viên chọn để sửa")
    full_lesson_plan: str = Field(..., min_length=1, max_length=30000, description="Toàn bộ nội dung KHBD")


class EditSuggestResponse(BaseModel):
    """Response đề xuất chỉnh sửa."""
    analysis: EditAnalysis
    suggestions: List[EditSuggestion] = Field(default_factory=list)


class EditRelatedChange(BaseModel):
    """Thay đổi liên quan ngoài đoạn được sửa trực tiếp."""
    section: str = Field(..., description="Section liên quan")
    action: str = Field(..., description="update | add | remove")
    old_text: str = Field("", description="Text cũ")
    new_text: str = Field("", description="Text mới")

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        allowed = {"update", "add", "remove"}
        if v not in allowed:
            raise ValueError(f"action phải là một trong: {allowed}")
        return v


class EditApplyRequest(BaseModel):
    """Request áp dụng chỉnh sửa cho đoạn được chọn."""
    selected_text: str = Field(..., min_length=1, max_length=5000)
    suggestion_type: str = Field(..., min_length=1, max_length=100)
    suggestion_title: str = Field(..., min_length=1, max_length=200)
    suggestion_description: str = Field(..., min_length=1, max_length=1000)
    full_lesson_plan: str = Field(..., min_length=1, max_length=30000)


class EditApplyResponse(BaseModel):
    """Response sau khi AI thực hiện chỉnh sửa đoạn."""
    edited_text: str = Field(..., description="Đoạn đã chỉnh sửa")
    related_changes: List[EditRelatedChange] = Field(default_factory=list)


# ============== CODE EXERCISES (Parsons + Coding) ==============

class ParsonsBlock(BaseModel):
    """Một block code trong bài ghép thẻ"""
    id: str = Field(..., description="ID duy nhất của block")
    content: str = Field(..., description="Nội dung code")
    indent: int = Field(0, description="Mức thụt đầu dòng (0, 1, 2...)")


class ParsonsData(BaseModel):
    """Dữ liệu cho bài tập Ghép thẻ code (Parsons Problems)"""
    blocks: List[ParsonsBlock] = Field(..., description="Các block code bị xáo trộn")
    correct_order: List[str] = Field(..., description="Thứ tự đúng của các block ID")
    distractors: Optional[List[ParsonsBlock]] = Field(None, description="Các block nhiễu (không thuộc đáp án)")


class TestCase(BaseModel):
    """Test case cho bài viết code"""
    input: str = Field(..., description="Input của test case")
    expected: str = Field(..., description="Output mong đợi")
    hidden: bool = Field(False, description="Ẩn test case với học sinh")


class CodingData(BaseModel):
    """Dữ liệu cho bài tập Viết code"""
    starter_code: str = Field(..., description="Code khung ban đầu")
    solution_code: str = Field(..., description="Code đáp án (ẩn)")
    test_code: str = Field(..., description="Code để kiểm tra (assert statements)")
    test_cases: List[TestCase] = Field(..., description="Danh sách test cases")
    hints: Optional[List[str]] = Field(None, description="Gợi ý cho học sinh")


class CodeExercise(BaseModel):
    """Bài tập code (Parsons hoặc Coding)"""
    exercise_id: str = Field(..., description="ID duy nhất của bài tập")
    exercise_type: str = Field(..., description="Loại bài: 'parsons' hoặc 'coding'")
    title: str = Field(..., description="Tiêu đề bài tập")
    description: str = Field(..., description="Mô tả/đề bài")
    language: str = Field("python", description="Ngôn ngữ lập trình")
    difficulty: str = Field("medium", description="Độ khó: easy, medium, hard")
    parsons_data: Optional[ParsonsData] = Field(None, description="Dữ liệu cho bài Parsons")
    coding_data: Optional[CodingData] = Field(None, description="Dữ liệu cho bài Coding")


# ============== NLS (Năng lực số) - Digital Competency ==============

class NLSChiBao(BaseModel):
    """Chỉ báo năng lực số"""
    ma: str = Field(..., description="Mã chỉ báo (VD: 1.1.NC1a)")
    noi_dung: str = Field(..., description="Nội dung chỉ báo")


class NLSNangLucThanhPhan(BaseModel):
    """Năng lực thành phần"""
    name: str = Field(..., description="Tên năng lực thành phần")


class NLSMienNangLuc(BaseModel):
    """Miền năng lực số"""
    name: str = Field(..., description="Tên miền năng lực")


class NLSMienNangLucResponse(BaseModel):
    """Response danh sách miền năng lực"""
    mien_nang_luc: List[NLSMienNangLuc] = Field(default_factory=list)


class NLSNangLucThanhPhanResponse(BaseModel):
    """Response danh sách năng lực thành phần theo miền"""
    nang_luc_thanh_phan: List[NLSNangLucThanhPhan] = Field(default_factory=list)


class NLSChiBaoResponse(BaseModel):
    """Response danh sách chỉ báo theo năng lực thành phần"""
    chi_bao: List[NLSChiBao] = Field(default_factory=list)


class NLSSelection(BaseModel):
    """Dữ liệu NLS đã chọn cho một hoạt động"""
    mien_nang_luc: str = Field(..., description="Tên miền năng lực")
    chi_bao_list: List[NLSChiBao] = Field(default_factory=list, description="Danh sách chỉ báo đã chọn")


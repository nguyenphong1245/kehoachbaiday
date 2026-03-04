import logging
import os
import json
import time
import google.generativeai as genai
from neo4j import GraphDatabase
from dotenv import load_dotenv
from typing import List, Dict, Optional, Any

logger = logging.getLogger("app.lesson_builder")

from app.schemas.lesson_plan_builder import (
    LessonBasicInfo,
    LessonSearchResponse,
    LessonDetailResponse,
    ChiMucInfo,
    ActivityConfig,
    GenerateLessonPlanBuilderRequest,
    GenerateLessonPlanBuilderResponse,
    LessonPlanSection,
    StaticDataResponse,
    TopicsResponse,
    BookType,
    Grade,
    TeachingMethodItem,
    TeachingTechniqueItem,
    NLSMienNangLuc,
    NLSMienNangLucResponse,
    NLSNangLucThanhPhan,
    NLSNangLucThanhPhanResponse,
    NLSChiBao,
    NLSChiBaoResponse,
)
from app.prompts.lesson_plan_generation import get_system_instruction, build_lesson_plan_prompt
from app.services.response_parser import (
    parse_response_to_sections,
    clean_section_content,
    sanitize_json_response,
    repair_truncated_json,
)
from app.utils.prompt_sanitize import sanitize_prompt_input, sanitize_dict_values

load_dotenv()


class LessonPlanBuilderService:
    """Service cho lesson plan builder mới"""
    
    def __init__(self):
        # Neo4j connection with timeout and pool config
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD")),
            connection_timeout=15,
            connection_acquisition_timeout=30,
            max_connection_pool_size=10,
        )
        self.neo4j_database = os.getenv("NEO4J_DATABASE", "neo4j")

        # Cache for reference documents (same for all requests)
        self._reference_docs_cache: Optional[str] = None
        self._reference_docs_cache_time: float = 0

        # Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # Model cho lesson plan - dùng Gemini 3 Flash
            lesson_plan_model = os.getenv("GEMINI_MODEL_LESSON_PLAN", "gemini-3-flash-preview")
            # Model cho JSON output
            self.model = genai.GenerativeModel(
                model_name=lesson_plan_model,
                system_instruction=self._get_system_instruction(),
                generation_config={
                    "temperature": float(os.getenv("LESSON_PLAN_TEMPERATURE", "0.2")),
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 65536,  # Tăng lên max để tránh output bị cắt ngắn
                    "response_mime_type": "application/json",
                }
            )
            # Model cho text output (improve section)
            self.text_model = genai.GenerativeModel(
                model_name=lesson_plan_model,
                generation_config={
                    "temperature": float(os.getenv("LESSON_PLAN_TEMPERATURE", "0.2")),
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 8192,
                }
            )
    
    def _get_system_instruction(self) -> str:
        """Sử dụng system instruction từ prompts module"""
        return get_system_instruction()

    def get_static_data(self) -> StaticDataResponse:
        """Trả về dữ liệu tĩnh cho frontend - lấy phương pháp và kỹ thuật từ Neo4j"""
        
        methods = []
        techniques = []
        
        with self.driver.session(database=self.neo4j_database) as session:
            # Lấy phương pháp dạy học từ Neo4j
            methods_result = session.run("""
                MATCH (pp:PhuongPhapDayHoc)
                RETURN pp.ten AS ten, pp.cach_tien_hanh AS cach_tien_hanh
                ORDER BY pp.ten
            """)
            
            for record in methods_result:
                methods.append(TeachingMethodItem(
                    value=record["ten"],
                    label=record["ten"],
                    cach_tien_hanh=record.get("cach_tien_hanh"),
                ))
            
            # Lấy kỹ thuật dạy học từ Neo4j
            techniques_result = session.run("""
                MATCH (kt:KyThuatDayHoc)
                RETURN kt.ten AS ten, kt.cach_tien_hanh AS cach_tien_hanh
                ORDER BY kt.ten
            """)
            
            for record in techniques_result:
                techniques.append(TeachingTechniqueItem(
                    value=record["ten"],
                    label=record["ten"],
                    cach_tien_hanh=record.get("cach_tien_hanh"),
                ))
        
        return StaticDataResponse(
            book_types=[
                {"value": bt.value, "label": bt.value} for bt in BookType
            ],
            grades=[
                {"value": g.value, "label": f"Lớp {g.value}"} for g in Grade
            ],
            methods=methods,
            techniques=techniques
        )

    def get_subjects(self) -> list[str]:
        """Lấy danh sách tất cả môn học từ Neo4j"""
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (m:MonHoc)
                RETURN m.ten AS ten
                ORDER BY m.ten
            """)
            return [record["ten"] for record in result if record["ten"]]

    def get_topics_by_book_and_grade(self, book_type: str, grade: str, subject: str = "") -> TopicsResponse:
        """Lấy danh sách chủ đề từ Neo4j theo lớp (và môn nếu có)"""
        with self.driver.session(database=self.neo4j_database) as session:
            if subject:
                result = session.run("""
                    MATCH (bh:BaiHoc)-[:THUOC_LOP]->(l:Lop {lop: $grade})
                    MATCH (bh)-[:THUOC_MON]->(m:MonHoc {ten: $subject})
                    MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe)
                    RETURN DISTINCT cd.ten AS topic
                    ORDER BY topic
                """, grade=grade, subject=subject)
            else:
                result = session.run("""
                    MATCH (bh:BaiHoc)-[:THUOC_LOP]->(l:Lop {lop: $grade})
                    MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe)
                    RETURN DISTINCT cd.ten AS topic
                    ORDER BY topic
                """, grade=grade)

            topics = [record["topic"].strip() for record in result if record["topic"]]
            return TopicsResponse(topics=topics)

    def search_lessons(
        self,
        book_type: str,
        grade: str,
        topic: str,
        subject: str = "",
    ) -> LessonSearchResponse:
        """Tìm kiếm bài học từ Neo4j dựa trên lớp, chủ đề (và môn nếu có)"""
        with self.driver.session(database=self.neo4j_database) as session:
            if subject:
                result = session.run("""
                    MATCH (bh:BaiHoc)-[:THUOC_LOP]->(l:Lop {lop: $grade})
                    MATCH (bh)-[:THUOC_MON]->(m:MonHoc {ten: $subject})
                    MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe {ten: $topic})
                    RETURN elementId(bh) AS id, bh.ten AS name, bh.loai AS lesson_type
                    ORDER BY bh.ten
                """, grade=grade, topic=topic, subject=subject)
            else:
                result = session.run("""
                    MATCH (bh:BaiHoc)-[:THUOC_LOP]->(l:Lop {lop: $grade})
                    MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe {ten: $topic})
                    RETURN elementId(bh) AS id, bh.ten AS name, bh.loai AS lesson_type
                    ORDER BY bh.ten
                """, grade=grade, topic=topic)
            
            lessons = []
            for record in result:
                lessons.append(LessonBasicInfo(
                    id=record["id"],
                    name=record["name"],
                    lesson_type=record.get("lesson_type")
                ))
            
            return LessonSearchResponse(lessons=lessons, total=len(lessons))
    
    def get_lesson_detail(self, lesson_id: str) -> Optional[LessonDetailResponse]:
        """Lấy chi tiết bài học từ Neo4j bao gồm danh sách chỉ mục"""
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (bh:BaiHoc) WHERE elementId(bh) = $lesson_id
                OPTIONAL MATCH (bh)-[:THUOC_LOP]->(l:Lop)
                OPTIONAL MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe)
                OPTIONAL MATCH (bh)-[:THUOC_DINH_HUONG]->(dh:DinhHuong)
                OPTIONAL MATCH (bh)-[:CO_MUC_TIEU]->(mt:MucTieu)

                // Chi mục với số thứ tự
                OPTIONAL MATCH (bh)-[r:CO_CHI_MUC]->(cm:ChiMuc)

                WITH bh, l, cd, dh,
                     bh.nang_luc_chinh AS competencies_text,
                     bh.nang_luc_ho_tro AS supporting_competencies_text,
                     collect(DISTINCT mt.noi_dung) AS objectives,
                     collect(DISTINCT {order: cm.thu_tu, content: cm.noi_dung}) AS chi_muc_list

                RETURN elementId(bh) AS id,
                       bh.ten AS name,
                       bh.loai AS lesson_type,
                       bh.markdown_content AS content,
                       l.lop AS grade,
                       cd.ten AS topic,
                       dh.ten AS orientation,
                       competencies_text,
                       supporting_competencies_text,
                       objectives,
                       chi_muc_list
            """, lesson_id=lesson_id)
            
            record = result.single()
            
            if not record:
                return None
            
            # Parse chi mục
            chi_muc_raw = record.get("chi_muc_list", [])
            # Filter và sort chi mục
            valid_chi_muc = [cm for cm in chi_muc_raw if cm and cm.get("content")]
            chi_muc_sorted = sorted(
                valid_chi_muc,
                key=lambda x: x.get("order") if x.get("order") is not None else 999
            )
            chi_muc_list = [
                ChiMucInfo(order=cm.get("order") or (idx+1), content=cm["content"])
                for idx, cm in enumerate(chi_muc_sorted)
            ]
            
            # Parse năng lực from text properties (comma-separated)
            competencies_text = record.get("competencies_text") or ""
            supporting_text = record.get("supporting_competencies_text") or ""
            competencies = [c.strip() for c in competencies_text.split(",") if c.strip()]
            supporting_competencies = [c.strip() for c in supporting_text.split(",") if c.strip()]

            return LessonDetailResponse(
                id=record["id"],
                name=record["name"],
                grade=record.get("grade", ""),
                book_type="Kết nối tri thức với cuộc sống",
                topic=record.get("topic", ""),
                lesson_type=record.get("lesson_type"),
                objectives=[o for o in record.get("objectives", []) if o],
                competencies=competencies,
                supporting_competencies=supporting_competencies,
                chi_muc_list=chi_muc_list,
                content=record.get("content"),
                orientation=record.get("orientation")
            )
    
    def generate_lesson_plan(
        self,
        request: GenerateLessonPlanBuilderRequest,
        reference_documents: Optional[str] = None,
        teacher_preferences_section: str = "",
    ) -> tuple[GenerateLessonPlanBuilderResponse, int]:
        """Sinh kế hoạch bài dạy từ thông tin đã chọn"""
        
        # 1. Lấy chi tiết bài học từ Neo4j
        lesson_detail = self.get_lesson_detail(request.lesson_id)
        if not lesson_detail:
            raise ValueError(f"Không tìm thấy bài học với ID: {request.lesson_id}")
        
        # 2. Nội dung bài học đã có trong lesson_detail.content từ Neo4j
        markdown_content = lesson_detail.content

        # 3. Xây dựng prompt với cả Neo4j data và markdown content
        prompt = self._build_prompt(request, lesson_detail, reference_documents, markdown_content, teacher_preferences_section)
        
        # ========== DEBUG: THỐNG KÊ PROMPT ==========
        prompt_chars = len(prompt)
        prompt_words = len(prompt.split())
        # Ước tính token (1 token ≈ 4 ký tự cho tiếng Việt, hoặc ≈ 0.75 từ)
        estimated_tokens = prompt_chars // 4
        
        logger.info(
            "Prompt stats: chars=%s words=%s est_tokens=~%s cost=~$%.4f",
            f"{prompt_chars:,}", f"{prompt_words:,}", f"{estimated_tokens:,}",
            estimated_tokens * 0.000001,
        )
        # =============================================
        
        total_tokens_used = 0

        try:
            # Gọi Gemini
            start_time = time.time()
            response = self.model.generate_content(prompt)
            end_time = time.time()

            # Track actual token usage from Gemini
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                total_tokens_used = getattr(response.usage_metadata, 'total_token_count', 0)
                logger.info("Gemini token usage: %d", total_tokens_used)

            raw_response = (response.text or "").strip()

            # Debug: Log số ký tự response và thời gian
            response_chars = len(raw_response)
            response_tokens = response_chars // 4

            logger.info(
                "Response stats: chars=%s est_tokens=~%s time=%.2fs actual_tokens=%s",
                f"{response_chars:,}", f"{response_tokens:,}",
                end_time - start_time, total_tokens_used or f"~{estimated_tokens + response_tokens:,}",
            )
            logger.debug("Raw response start: %s...", raw_response[:300])
            logger.debug("Raw response end: ...%s", raw_response[-200:])
            
            # Kiểm tra response rỗng
            if not raw_response:
                logger.error("LLM returned empty response")
                raise RuntimeError("LLM trả về response rỗng")
            
            # Kiểm tra xem JSON có bị cắt ngắn không
            if not raw_response.strip().endswith('}'):
                logger.warning("JSON response may be truncated (doesn't end with '}'), tail: ...%s", raw_response[-200:])
            
            # Parse response thành sections
            sections = parse_response_to_sections(raw_response)

            # Debug: Log các section đã parse
            logger.debug("Parsed sections: %s", [s.section_type for s in sections])
            
            # Validate: Kiểm tra các section quan trọng có đầy đủ không
            required_sections = ['muc_tieu', 'thiet_bi', 'khoi_dong', 'hinh_thanh_kien_thuc', 'luyen_tap', 'van_dung']
            parsed_types = [s.section_type for s in sections]
            missing_sections = [s for s in required_sections if s not in parsed_types]
            
            if missing_sections:
                logger.warning("Missing required sections: %s (only have: %s)", missing_sections, parsed_types)

                # Thử retry: sinh lại các section thiếu
                section_titles = {
                    'muc_tieu': 'Mục tiêu bài học',
                    'thiet_bi': 'Thiết bị dạy học',
                    'khoi_dong': 'Hoạt động 1: Khởi động',
                    'hinh_thanh_kien_thuc': 'Hoạt động 2: Hình thành kiến thức mới',
                    'luyen_tap': 'Hoạt động 3: Luyện tập',
                    'van_dung': 'Hoạt động 4: Vận dụng'
                }

                try:
                    retry_sections, retry_tokens = self._retry_missing_sections(
                        missing_sections, section_titles, request, sections
                    )
                    sections.extend(retry_sections)
                    total_tokens_used += retry_tokens
                    logger.info("Retry succeeded: regenerated %d missing sections, tokens=%d", len(retry_sections), retry_tokens)
                except Exception as retry_err:
                    logger.error("Retry failed: %s", retry_err)

                # Kiểm tra lại sau retry
                parsed_types_after = [s.section_type for s in sections]
                still_missing = [s for s in required_sections if s not in parsed_types_after]

                if still_missing:
                    logger.warning("Still missing after retry: %s", still_missing)
                    for missing in still_missing:
                        sections.append(LessonPlanSection(
                            section_id=missing,
                            section_type=missing,
                            title=section_titles.get(missing, missing),
                            content=f"⚠️ **Lỗi:** Section này không được sinh ra. Vui lòng thử lại hoặc bấm nút 'Làm mới' để tạo lại kế hoạch bài dạy.",
                            editable=True
                        ))

                # Sắp xếp lại sections theo thứ tự chuẩn
                order = ['muc_tieu', 'thiet_bi', 'khoi_dong', 'hinh_thanh_kien_thuc', 'luyen_tap', 'van_dung', 'phieu_hoc_tap', 'trac_nghiem']
                sections.sort(key=lambda s: order.index(s.section_type) if s.section_type in order else 999)
            
            return GenerateLessonPlanBuilderResponse(
                lesson_info={
                    "book_type": request.book_type,
                    "grade": request.grade,
                    "topic": request.topic,
                    "lesson_name": request.lesson_name
                },
                sections=sections,
                full_content=raw_response
            ), total_tokens_used
        except Exception as e:
            raise RuntimeError(f"Lỗi sinh kế hoạch bài dạy: {str(e)}")
    
    def _build_prompt(
        self,
        request: GenerateLessonPlanBuilderRequest,
        lesson_detail: LessonDetailResponse,
        reference_documents: Optional[str] = None,
        markdown_content: Optional[str] = None,
        teacher_preferences_section: str = "",
    ) -> str:
        """Xây dựng prompt chi tiết cho LLM - lấy từ lesson_plan_generator.py"""
        
        # Chuẩn bị thông tin hoạt động - CHI TIẾT TỪNG HOẠT ĐỘNG
        activities_info = ""
        teaching_instructions = ""  # Hướng dẫn cách tổ chức chi tiết
        
        logger.debug("Building activity config for %d activities", len(request.activities))
        
        for idx, activity in enumerate(request.activities, 1):
            # Sanitize user-controlled fields before embedding in prompt
            safe_name = sanitize_prompt_input(activity.activity_name, max_length=200)
            safe_chi_muc = sanitize_prompt_input(activity.chi_muc, max_length=500) if activity.chi_muc else None
            safe_custom_request = sanitize_prompt_input(activity.custom_request, max_length=2000) if activity.custom_request else None
            safe_methods_content = sanitize_dict_values(activity.methods_content) if activity.methods_content else {}
            safe_techniques_content = sanitize_dict_values(activity.techniques_content) if activity.techniques_content else {}

            methods_str = ", ".join(activity.selected_methods) if activity.selected_methods else "Không chọn"
            techniques_str = ", ".join(activity.selected_techniques) if activity.selected_techniques else "Không chọn"

            # Chuyển đổi location sang text dễ hiểu
            location_text = "Phòng máy" if activity.location == "phong_may" else "Lớp học"

            logger.debug(
                "Activity %d: %s | location=%s methods=[%s] techniques=[%s]",
                idx, safe_name, location_text,
                methods_str, techniques_str,
            )

            # NLS (Năng lực số) đã chọn
            nls_info = ""
            if activity.nls_selections:
                nls_items = []
                for nls in activity.nls_selections:
                    # Format: Miền NL | Mã chỉ báo | Nội dung chỉ báo
                    nls_items.append(
                        f"    - Miền: {nls.mien_nang_luc} | Mã: {nls.ma} | Nội dung: {nls.noi_dung}"
                    )
                nls_info = "\n".join(nls_items) if nls_items else "Không có"
            else:
                nls_info = "Không có"

            activities_info += f"""
### Hoạt động {idx}: {safe_name}
- Loại hoạt động: {activity.activity_type}
- Chỉ mục nội dung: {safe_chi_muc or 'N/A'}
- Vị trí dạy học: {location_text}
- Phương pháp dạy học được chọn: {methods_str}
- Kỹ thuật dạy học được chọn: {techniques_str}
- Yêu cầu bổ sung: {safe_custom_request if safe_custom_request else 'Không có'}
- Chỉ báo Năng lực số (NLS) cần đạt:
{nls_info}
"""

            # Tạo hướng dẫn cách tổ chức CHI TIẾT cho từng hoạt động
            if activity.selected_methods or activity.selected_techniques:
                teaching_instructions += f"""
===============================================================
[TARGET] HƯỚNG DẪN TỔ CHỨC CHO HOẠT ĐỘNG: {safe_name.upper()}
===============================================================
"""
                # Thêm cách tổ chức phương pháp
                if safe_methods_content:
                    for method_name, content in safe_methods_content.items():
                        if content:
                            teaching_instructions += f"""
[METHOD] PHƯƠNG PHÁP: {method_name}
   > Áp dụng tại: {safe_name}
   > Cách tổ chức:
{content}

"""

                # Thêm cách tổ chức kỹ thuật
                if safe_techniques_content:
                    for tech_name, content in safe_techniques_content.items():
                        if content:
                            teaching_instructions += f"""
[TECH] KỸ THUẬT: {tech_name}
   > Áp dụng tại: {safe_name}
   > Cách tổ chức:
{content}

"""
        
        if teaching_instructions:
            logger.debug("Teaching instructions: %d chars", len(teaching_instructions))
        else:
            logger.warning("No teaching methods/techniques selected for any activity")

        # Chuẩn bị chi mục
        chi_muc_info = "\n".join([
            f"  {cm.order}. {cm.content}" 
            for cm in lesson_detail.chi_muc_list
        ]) if lesson_detail.chi_muc_list else "Không có"
        
        # Chuẩn bị dữ liệu Neo4j
        neo4j_data = {
            "bai_hoc_id": request.lesson_id,
            "lop": request.grade,
            "bai_hoc": request.lesson_name,
            "chu_de": request.topic,
            "loai_sach": request.book_type,
            "loai": lesson_detail.lesson_type,
            "muc_tieu": lesson_detail.objectives,
            "chi_muc": [cm.content for cm in lesson_detail.chi_muc_list] if lesson_detail.chi_muc_list else [],
            "noi_dung": lesson_detail.content,
            "dinh_huong": [lesson_detail.orientation] if lesson_detail.orientation else []
        }
        neo4j_json = json.dumps(neo4j_data, ensure_ascii=False, indent=2)

        # Xử lý tài liệu tham khảo
        docs_instruction = ""
        if reference_documents:
            logger.debug("Reference documents: %d chars", len(reference_documents))
            
            docs_instruction = f"""
<nang_luc_pham_chat>
{reference_documents}
</nang_luc_pham_chat>
"""

        # Xử lý nội dung bài học (markdown)
        lesson_content_section = ""
        if markdown_content:
            logger.debug("Lesson content (markdown): %d chars", len(markdown_content))
            
            lesson_content_section = f"""
<noi_dung_bai_hoc_chi_tiet>
{markdown_content}
</noi_dung_bai_hoc_chi_tiet>

[WARN] NỘI DUNG BÀI HỌC CHI TIẾT: Sử dụng nội dung trên để thiết kế các hoạt động dạy học phù hợp.
Đây là nội dung sách giáo khoa của bài học, hãy tham khảo để tạo các hoạt động dạy học cụ thể.
"""
        else:
            logger.warning("No lesson content (markdown) found in database")

        # Gọi function từ prompts module để xây dựng prompt
        prompt = build_lesson_plan_prompt(
            neo4j_data=neo4j_data,
            activities_info=activities_info,
            teaching_instructions=teaching_instructions,
            lesson_content_section=lesson_content_section,
            docs_instruction=docs_instruction,
            topic=request.topic,
            lesson_name=request.lesson_name,
            grade=request.grade,
            book_type=request.book_type,
            teacher_preferences_section=teacher_preferences_section,
        )

        # Prompt component stats
        neo4j_json = json.dumps(neo4j_data, ensure_ascii=False)
        components = {
            "neo4j_data": len(neo4j_json),
            "activities_info": len(activities_info),
            "teaching_instructions": len(teaching_instructions),
            "lesson_content": len(lesson_content_section),
            "reference_docs": len(docs_instruction),
        }
        logger.debug(
            "Prompt components (chars): %s | total=%d",
            components, len(prompt),
        )
        
        return prompt

    def _retry_missing_sections(
        self,
        missing_sections: List[str],
        section_titles: Dict[str, str],
        request: GenerateLessonPlanBuilderRequest,
        existing_sections: List[LessonPlanSection]
    ) -> tuple[List[LessonPlanSection], int]:
        """Thử sinh lại các section bị thiếu bằng cách gọi LLM riêng cho từng section"""

        # Tóm tắt nội dung đã sinh để LLM có context
        existing_summary = ""
        for s in existing_sections:
            if s.section_type in ['muc_tieu', 'thiet_bi', 'khoi_dong', 'hinh_thanh_kien_thuc', 'luyen_tap', 'van_dung']:
                # Chỉ lấy 500 ký tự đầu để không quá dài
                content_preview = s.content[:500] + "..." if len(s.content) > 500 else s.content
                existing_summary += f"\n--- {s.title} ---\n{content_preview}\n"

        result_sections = []
        missing_types_str = ", ".join([section_titles.get(m, m) for m in missing_sections])

        # Sinh tất cả sections thiếu trong 1 lần gọi
        retry_prompt = f"""Bạn đã sinh một Kế hoạch bài dạy nhưng THIẾU các section sau: {missing_types_str}

Thông tin bài học:
- Bài: {request.lesson_name}
- Lớp: {request.grade}
- Chủ đề: {request.topic}
- Sách: {request.book_type}

Nội dung đã sinh (để tham khảo):
{existing_summary}

Hãy sinh NỘI DUNG CHI TIẾT cho CÁC SECTION BỊ THIẾU. Trả về JSON:
{{
  "sections": [
    {', '.join([
        f'{{"section_type": "{st}", "title": "{section_titles.get(st, st)}", "content": "[NỘI DUNG MARKDOWN CHI TIẾT]"}}'
        for st in missing_sections
    ])}
  ]
}}

YÊU CẦU:
- Nội dung phải chi tiết, đầy đủ, theo đúng cấu trúc KHBD
- Mỗi hoạt động phải có: a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện (B1-B4)
- Trả về JSON thuần túy, không có gì khác
"""

        logger.info("Retrying %d missing sections...", len(missing_sections))

        response = self.model.generate_content(retry_prompt)

        # Track token usage from retry
        retry_tokens = 0
        if hasattr(response, 'usage_metadata') and response.usage_metadata:
            retry_tokens = getattr(response.usage_metadata, 'total_token_count', 0)
            logger.info("Retry token usage: %d", retry_tokens)

        retry_raw = (response.text or "").strip()

        if not retry_raw:
            return [], retry_tokens

        # Parse retry response
        try:
            sanitized = sanitize_json_response(retry_raw)
            data = json.loads(sanitized)
        except json.JSONDecodeError:
            repaired = repair_truncated_json(sanitize_json_response(retry_raw))
            if repaired:
                data = json.loads(repaired)
            else:
                return [], retry_tokens

        if "sections" not in data:
            return [], retry_tokens

        for item in data["sections"]:
            section_type = item.get("section_type", "unknown")
            title = item.get("title", section_titles.get(section_type, section_type))
            content = item.get("content", "")

            if section_type in missing_sections and content:
                result_sections.append(LessonPlanSection(
                    section_id=section_type,
                    section_type=section_type,
                    title=title,
                    content=content,
                    editable=True
                ))

        return result_sections, retry_tokens

    def improve_section(
        self,
        section_type: str,
        section_title: str,
        current_content: str,
        user_request: str,
        lesson_info: Dict[str, str],
        related_appendices: List[Dict] = None,
        reference_documents: Optional[str] = None
    ) -> tuple[Any, int]:
        """Cải thiện nội dung một section với AI, kèm theo phụ lục liên quan nếu có.
        Returns: (ImproveSectionResponse, tokens_used)"""
        from app.schemas.lesson_plan_builder import ImproveSectionResponse, UpdatedAppendix
        from app.prompts import get_section_improvement_prompt

        # Sanitize user-controlled input before passing to prompt
        safe_user_request = sanitize_prompt_input(user_request, max_length=2000)
        safe_lesson_info = sanitize_dict_values(lesson_info)

        # Xây dựng prompt cơ bản
        base_prompt = get_section_improvement_prompt(
            section_type=section_type,
            section_title=section_title,
            current_content=current_content,
            user_request=safe_user_request,
            lesson_info=safe_lesson_info
        )
        
        # Thêm tài liệu tham khảo nếu có (năng lực, phẩm chất, thiết bị)
        if reference_documents:
            base_prompt += f"""

===================================================================
[REF] TÀI LIỆU THAM KHẢO (NĂNG LỰC, PHẨM CHẤT, THIẾT BỊ)
===================================================================
Sử dụng thông tin từ tài liệu tham khảo sau để cải thiện nội dung:

<nang_luc_pham_chat>
{reference_documents}
</nang_luc_pham_chat>
"""
        
        # Nếu có phụ lục liên quan, thêm vào prompt
        if related_appendices and len(related_appendices) > 0:
            appendix_context = "\n\n===================================================================\n"
            appendix_context += "[APPENDIX] PHỤ LỤC LIÊN QUAN (CẦN CẬP NHẬT ĐỒNG BỘ)\n"
            appendix_context += "===================================================================\n"
            appendix_context += "Khi thay đổi nội dung hoạt động, CẦN CẬP NHẬT phụ lục liên quan để đồng bộ.\n\n"
            
            for appendix in related_appendices:
                appendix_context += f"--- {appendix.get('title', 'Phụ lục')} (ID: {appendix.get('section_id', '')}) ---\n"
                appendix_context += f"{appendix.get('content', '')}\n\n"
            
            appendix_context += """
===================================================================
[OUTPUT] OUTPUT FORMAT (BẮT BUỘC)
===================================================================
Trả về theo format sau:

[IMPROVED_CONTENT]
(Nội dung hoạt động đã cải thiện)
[/IMPROVED_CONTENT]

[UPDATED_APPENDIX:section_id_của_phụ_lục]
(Nội dung phụ lục đã cập nhật đồng bộ)
[/UPDATED_APPENDIX]

Lưu ý: Nếu có nhiều phụ lục, tạo nhiều block [UPDATED_APPENDIX] tương ứng.
"""
            prompt = base_prompt + appendix_context
        else:
            prompt = base_prompt

        try:
            # Dùng text_model (không phải JSON mode) cho improve section
            response = self.text_model.generate_content(prompt)

            # Track token usage
            tokens_used = 0
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                tokens_used = getattr(response.usage_metadata, 'total_token_count', 0)
                logger.info("Improve section token usage: %d", tokens_used)

            raw_response = (response.text or "").strip()
            
            # Loại bỏ các marker markdown nếu có
            if raw_response.startswith("```markdown"):
                raw_response = raw_response[11:]
            if raw_response.startswith("```"):
                raw_response = raw_response[3:]
            if raw_response.endswith("```"):
                raw_response = raw_response[:-3]
            raw_response = raw_response.strip()
            
            # Parse response nếu có phụ lục
            updated_appendices = []
            improved_content = raw_response
            
            if related_appendices and len(related_appendices) > 0:
                # Tìm phần [IMPROVED_CONTENT]
                import re
                content_match = re.search(
                    r'\[IMPROVED_CONTENT\](.*?)\[/IMPROVED_CONTENT\]',
                    raw_response,
                    re.DOTALL
                )
                
                if content_match:
                    improved_content = content_match.group(1).strip()
                else:
                    # Nếu không tìm thấy marker, lấy phần trước [UPDATED_APPENDIX]
                    appendix_start = raw_response.find('[UPDATED_APPENDIX')
                    if appendix_start > 0:
                        improved_content = raw_response[:appendix_start].strip()
                
                # Tìm các phụ lục đã cập nhật
                appendix_pattern = r'\[UPDATED_APPENDIX:([^\]]+)\](.*?)\[/UPDATED_APPENDIX\]'
                appendix_matches = re.findall(appendix_pattern, raw_response, re.DOTALL)
                
                for section_id, content in appendix_matches:
                    updated_appendices.append(UpdatedAppendix(
                        section_id=section_id.strip(),
                        improved_content=content.strip()
                    ))
            
            return ImproveSectionResponse(
                improved_content=improved_content,
                explanation=None,
                updated_appendices=updated_appendices if updated_appendices else None
            ), tokens_used
        except Exception as e:
            raise RuntimeError(f"Lỗi cải thiện section: {str(e)}")

    def generate_mindmap(
        self,
        lesson_name: str,
        lesson_id: str,
        activity_content: str,
        activity_name: str,
        activity_type: str = None,
        chi_muc: str = None,
        lesson_detail=None,
    ) -> tuple[str, int]:
        """Sinh sơ đồ tư duy (markdown headings) cho một hoạt động.
        Returns: (mindmap_markdown, tokens_used)

        AI 2 chuyên biệt: nhận nội dung hoạt động + chi_muc + SGK content,
        trả về chuỗi markdown headings (# ## ### ####) dùng cho Markmap.

        Args:
            lesson_detail: (optional) Nếu đã có từ bước trước, truyền vào
                           để tránh query Neo4j lần nữa.
        """
        import re
        from app.prompts.mindmap_generation import build_mindmap_prompt

        # Dùng lesson_detail đã có, chỉ query Neo4j khi chưa có
        if lesson_detail is None:
            lesson_detail = self.get_lesson_detail(lesson_id)
        if not lesson_detail:
            raise RuntimeError(f"Không tìm thấy bài học với ID: {lesson_id}")

        # Chuẩn bị chi_muc
        chi_muc_lines = []
        if lesson_detail.chi_muc_list:
            for cm in lesson_detail.chi_muc_list:
                chi_muc_lines.append(f"  {cm.order}. {cm.content}")
        chi_muc_str = "\n".join(chi_muc_lines) if chi_muc_lines else "  Không có"

        # Chuẩn bị nội dung SGK
        sgk_content = (lesson_detail.content or "")

        # Xác định phạm vi nội dung dựa trên loại hoạt động
        is_whole_lesson = activity_name == "Toàn bộ bài học"
        is_practice_or_apply = activity_type in ("luyen_tap", "van_dung")
        is_knowledge_formation = activity_type == "hinh_thanh_kien_thuc"

        if is_whole_lesson or is_practice_or_apply:
            content_limit = 8000
            task_label = f"toàn bộ bài \"{lesson_name}\""
            focus_instruction = "Tổng hợp TOÀN BỘ kiến thức của bài học"
        elif is_knowledge_formation and chi_muc:
            content_limit = 6000
            task_label = f"nội dung \"{chi_muc}\" trong bài \"{lesson_name}\""
            focus_instruction = f"CHỈ tập trung vào nội dung của mục \"{chi_muc}\", KHÔNG lấy kiến thức từ các mục khác"
        else:
            content_limit = 6000
            task_label = f"hoạt động \"{activity_name}\" của bài \"{lesson_name}\""
            focus_instruction = "Lấy kiến thức liên quan đến hoạt động này"

        prompt = build_mindmap_prompt(
            task_label=task_label,
            focus_instruction=focus_instruction,
            chi_muc_str=chi_muc_str,
            sgk_content=sgk_content[:content_limit],
        )

        try:
            response = self.text_model.generate_content(prompt)

            # Track token usage
            tokens_used = 0
            if hasattr(response, 'usage_metadata') and response.usage_metadata:
                tokens_used = getattr(response.usage_metadata, 'total_token_count', 0)
                logger.info("Mindmap token usage: %d", tokens_used)

            raw = (response.text or "").strip()

            # Loại bỏ code block wrapper nếu có
            if raw.startswith("```"):
                raw = re.sub(r"^```[a-zA-Z]*\n?", "", raw)
            if raw.endswith("```"):
                raw = raw[:-3]
            raw = raw.strip()

            # Validate: phải có ít nhất 1 heading cấp 1 và 1 heading cấp 2
            if not re.search(r"^# ", raw, re.MULTILINE) or not re.search(r"^## ", raw, re.MULTILINE):
                raise RuntimeError("AI trả về không đúng format markdown headings")

            logger.info("Mindmap generated for '%s': %d chars", activity_name, len(raw))
            return raw, tokens_used
        except Exception as e:
            raise RuntimeError(f"Lỗi sinh sơ đồ tư duy: {str(e)}")

    def get_reference_documents_from_neo4j(self) -> Optional[str]:
        """Lấy tài liệu tham khảo từ Neo4j: Năng lực tin học, Năng lực chung, Phẩm chất.
        Cached 30 phút vì data này không thay đổi giữa các request."""
        # Return cache if fresh (30 min)
        if self._reference_docs_cache and (time.time() - self._reference_docs_cache_time < 1800):
            logger.debug("Using cached reference documents (%d chars)", len(self._reference_docs_cache))
            return self._reference_docs_cache

        with self.driver.session(database=self.neo4j_database) as session:
            result_text = ""
            
            # 1. Lấy Năng lực tin học
            logger.debug("Fetching competencies & qualities from Neo4j...")
            
            try:
                nang_luc_result = session.run("""
                    MATCH (nl:NangLucTinHoc)
                    RETURN nl.id AS id, nl.ten AS ten, nl.bieu_hien AS bieu_hien
                    ORDER BY nl.id
                """)
                nang_luc_records = list(nang_luc_result)
                
                if nang_luc_records:
                    result_text += "## NĂNG LỰC TIN HỌC\n\n"
                    for record in nang_luc_records:
                        id_nl = record.get("id", "")
                        ten = record.get("ten", "")
                        bieu_hien = record.get("bieu_hien", [])
                        result_text += f"**{id_nl} - {ten}**\n"
                        if bieu_hien and isinstance(bieu_hien, list):
                            result_text += "Biểu hiện:\n"
                            for bh in bieu_hien:
                                result_text += f"  - {bh}\n"
                        result_text += "\n"
                    logger.info("Found %d NangLucTinHoc", len(nang_luc_records))
            except Exception as e:
                logger.error("Error fetching NangLucTinHoc: %s", e)
            
            # 2. Lấy Năng lực chung
            try:
                nang_luc_chung_result = session.run("""
                    MATCH (nlc:NangLucChung)
                    RETURN nlc.id AS id, nlc.ten AS ten, nlc.bieu_hien AS bieu_hien
                    ORDER BY nlc.id
                """)
                nlc_records = list(nang_luc_chung_result)
                
                if nlc_records:
                    result_text += "## NĂNG LỰC CHUNG\n\n"
                    for record in nlc_records:
                        id_nlc = record.get("id", "")
                        ten = record.get("ten", "")
                        bieu_hien = record.get("bieu_hien", [])
                        result_text += f"**{ten}**\n"
                        if bieu_hien and isinstance(bieu_hien, list):
                            result_text += "Biểu hiện:\n"
                            for bh in bieu_hien:
                                result_text += f"  - {bh}\n"
                        result_text += "\n"
                    logger.info("Found %d NangLucChung", len(nlc_records))
            except Exception as e:
                logger.error("Error fetching NangLucChung: %s", e)
            
            # 3. Lấy Phẩm chất
            try:
                pham_chat_result = session.run("""
                    MATCH (pc:PhamChat)
                    RETURN pc.id AS id, pc.ten AS ten, pc.bieu_hien AS bieu_hien
                    ORDER BY pc.id
                """)
                pc_records = list(pham_chat_result)
                
                if pc_records:
                    result_text += "## PHẨM CHẤT\n\n"
                    for record in pc_records:
                        id_pc = record.get("id", "")
                        ten = record.get("ten", "")
                        bieu_hien = record.get("bieu_hien", [])
                        result_text += f"**{ten}**\n"
                        if bieu_hien and isinstance(bieu_hien, list):
                            result_text += "Biểu hiện:\n"
                            for bh in bieu_hien:
                                result_text += f"  - {bh}\n"
                        result_text += "\n"
                    logger.info("Found %d PhamChat", len(pc_records))
            except Exception as e:
                logger.error("Error fetching PhamChat: %s", e)
            
            try:
                labels_result = session.run("CALL db.labels()")
                labels = [record[0] for record in labels_result]
                logger.debug("Neo4j labels: %s", labels)
            except Exception as e:
                logger.debug("Could not list Neo4j labels: %s", e)
            
            if result_text:
                logger.info("Reference documents: %d chars", len(result_text))
                self._reference_docs_cache = result_text
                self._reference_docs_cache_time = time.time()
                return result_text
            else:
                logger.warning("No competency/quality data found in Neo4j")
                return None
    
    # ============== NLS (Năng lực số) Methods ==============

    def get_nls_mien_nang_luc(self) -> NLSMienNangLucResponse:
        """Lấy danh sách miền năng lực từ Neo4j"""
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (m:MienNangLuc)
                RETURN m.name AS name
                ORDER BY m.name
            """)

            mien_list = []
            for record in result:
                if record["name"]:
                    mien_list.append(NLSMienNangLuc(name=record["name"]))

            logger.info("Found %d MienNangLuc", len(mien_list))
            return NLSMienNangLucResponse(mien_nang_luc=mien_list)

    def get_nls_nang_luc_thanh_phan(self, mien_nang_luc: str) -> NLSNangLucThanhPhanResponse:
        """Lấy danh sách năng lực thành phần theo miền năng lực từ Neo4j"""
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (m:MienNangLuc {name: $mien_name})-[:CO_NANG_LUC]->(n:NangLucThanhPhan)
                RETURN n.name AS name
                ORDER BY n.name
            """, mien_name=mien_nang_luc)

            nangluc_list = []
            for record in result:
                if record["name"]:
                    nangluc_list.append(NLSNangLucThanhPhan(name=record["name"]))

            logger.info("Found %d NangLucThanhPhan for mien '%s'", len(nangluc_list), mien_nang_luc)
            return NLSNangLucThanhPhanResponse(nang_luc_thanh_phan=nangluc_list)

    def get_nls_chi_bao(self, nang_luc_thanh_phan: str) -> NLSChiBaoResponse:
        """Lấy danh sách chỉ báo theo năng lực thành phần từ Neo4j"""
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (n:NangLucThanhPhan {name: $nangluc_name})-[:CO_CHI_BAO]->(c:ChiBao)
                RETURN c.ma AS ma, c.noi_dung AS noi_dung
                ORDER BY c.ma
            """, nangluc_name=nang_luc_thanh_phan)

            chibao_list = []
            for record in result:
                if record["ma"] and record["noi_dung"]:
                    chibao_list.append(NLSChiBao(
                        ma=record["ma"],
                        noi_dung=record["noi_dung"]
                    ))

            logger.info("Found %d ChiBao for nangluc '%s'", len(chibao_list), nang_luc_thanh_phan)
            return NLSChiBaoResponse(chi_bao=chibao_list)

    def close(self):
        """Đóng kết nối"""
        self.driver.close()


# Singleton
_lesson_plan_builder_service = None

def get_lesson_plan_builder_service() -> LessonPlanBuilderService:
    global _lesson_plan_builder_service
    if _lesson_plan_builder_service is None:
        _lesson_plan_builder_service = LessonPlanBuilderService()
    return _lesson_plan_builder_service

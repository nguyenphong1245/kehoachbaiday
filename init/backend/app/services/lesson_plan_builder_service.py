import os
import json
import sqlite3
import google.generativeai as genai
from neo4j import GraphDatabase
from dotenv import load_dotenv
from typing import List, Dict, Optional, Any
from pathlib import Path

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
    TeachingMethod,
    TeachingTechnique
)
from app.prompts.lesson_plan_generation import get_system_instruction, build_lesson_plan_prompt

load_dotenv()


class LessonPlanBuilderService:
    """Service cho lesson plan builder mới"""
    
    def __init__(self):
        # Neo4j connection
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI"),
            auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD"))
        )
        self.neo4j_database = os.getenv("NEO4J_DATABASE", "neo4j")
        
        # SQLite database path
        self.sqlite_db_path = Path(__file__).parent.parent.parent / "app.db"
        
        # Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # Model cho JSON output
            self.model = genai.GenerativeModel(
                model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                system_instruction=self._get_system_instruction(),
                generation_config={
                    "temperature": float(os.getenv("LESSON_PLAN_TEMPERATURE", "0.2")),
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 16384,
                    "response_mime_type": "application/json",
                }
            )
            # Model cho text output (improve section)
            self.text_model = genai.GenerativeModel(
                model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
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
        """Trả về dữ liệu tĩnh cho frontend"""
        return StaticDataResponse(
            book_types=[
                {"value": bt.value, "label": bt.value} for bt in BookType
            ],
            grades=[
                {"value": g.value, "label": f"Lớp {g.value}"} for g in Grade
            ],
            methods=[
                {"value": m.value, "label": m.value} for m in TeachingMethod
            ],
            techniques=[
                {"value": t.value, "label": t.value} for t in TeachingTechnique
            ]
        )
    
    def get_lesson_content_from_sqlite(self, lesson_id: str) -> Optional[str]:
        """Lấy nội dung markdown từ SQLite theo lesson_id"""
        try:
            conn = sqlite3.connect(str(self.sqlite_db_path))
            cursor = conn.cursor()
            cursor.execute(
                "SELECT content FROM lesson_contents WHERE neo4j_lesson_id = ?",
                (lesson_id,)
            )
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return result[0]
            return None
        except Exception as e:
            print(f"Error getting lesson content from SQLite: {e}")
            return None
    
    def get_topics_by_book_and_grade(self, book_type: str, grade: str) -> TopicsResponse:
        """Lấy danh sách chủ đề từ Neo4j theo loại sách và lớp"""
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (bh:BaiHoc)-[:THUOC_LOP]->(l:Lop {lop: $grade})
                MATCH (bh)-[:THUOC_LOAI_SACH]->(ls:LoaiSach {ten_loai_sach: $book_type})
                MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe)
                RETURN DISTINCT cd.chu_de AS topic
                ORDER BY topic
            """, book_type=book_type, grade=grade)
            
            topics = [record["topic"].strip() for record in result if record["topic"]]
            return TopicsResponse(topics=topics)
    
    def search_lessons(
        self, 
        book_type: str, 
        grade: str, 
        topic: str
    ) -> LessonSearchResponse:
        """Tìm kiếm bài học từ Neo4j dựa trên loại sách, lớp, chủ đề"""
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (bh:BaiHoc)-[:THUOC_LOP]->(l:Lop {lop: $grade})
                MATCH (bh)-[:THUOC_LOAI_SACH]->(ls:LoaiSach {ten_loai_sach: $book_type})
                MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe {chu_de: $topic})
                RETURN bh.id AS id, bh.ten AS name, bh.loai AS lesson_type
                ORDER BY bh.ten
            """, book_type=book_type, grade=grade, topic=topic)
            
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
                MATCH (bh:BaiHoc {id: $lesson_id})
                OPTIONAL MATCH (bh)-[:THUOC_LOP]->(l:Lop)
                OPTIONAL MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe)
                OPTIONAL MATCH (bh)-[:THUOC_LOAI_SACH]->(ls:LoaiSach)
                OPTIONAL MATCH (bh)-[:THUOC_DINH_HUONG]->(dh:DinhHuong)
                
                // Năng lực chính và năng lực hỗ trợ
                OPTIONAL MATCH (bh)-[:CO_NANG_LUC_CHINH]->(nlc:NangLuc)
                OPTIONAL MATCH (bh)-[:CO_NANG_LUC_HO_TRO]->(nlht:NangLuc)
                OPTIONAL MATCH (bh)-[:CO_MUC_TIEU]->(mt:MucTieu)
                
                // Chi mục với số thứ tự
                OPTIONAL MATCH (bh)-[r:CO_CHI_MUC]->(cm:ChiMuc)
                
                WITH bh, l, cd, ls, dh,
                     collect(DISTINCT nlc.nang_luc_chinh) AS competencies,
                     collect(DISTINCT nlht.nang_luc_chinh) AS supporting_competencies,
                     collect(DISTINCT mt.muc_tieu) AS objectives,
                     collect(DISTINCT {order: r.so_thu_tu, content: cm.noi_dung}) AS chi_muc_list
                
                RETURN bh.id AS id,
                       bh.ten AS name,
                       bh.loai AS lesson_type,
                       bh.noi_dung AS content,
                       l.lop AS grade,
                       cd.chu_de AS topic,
                       ls.ten_loai_sach AS book_type,
                       dh.ten AS orientation,
                       competencies,
                       supporting_competencies,
                       objectives,
                       chi_muc_list
            """, lesson_id=lesson_id)
            
            record = result.single()
            
            if not record:
                return None
            
            # Parse chi mục
            chi_muc_raw = record.get("chi_muc_list", [])
            chi_muc_sorted = sorted(
                [cm for cm in chi_muc_raw if cm and cm.get("content")],
                key=lambda x: x.get("order", 999)
            )
            chi_muc_list = [
                ChiMucInfo(order=cm["order"], content=cm["content"])
                for cm in chi_muc_sorted
            ]
            
            return LessonDetailResponse(
                id=record["id"],
                name=record["name"],
                grade=record.get("grade", ""),
                book_type=record.get("book_type", ""),
                topic=record.get("topic", ""),
                lesson_type=record.get("lesson_type"),
                objectives=[o for o in record.get("objectives", []) if o],
                competencies=[c for c in record.get("competencies", []) if c],
                supporting_competencies=[c for c in record.get("supporting_competencies", []) if c],
                chi_muc_list=chi_muc_list,
                content=record.get("content"),
                orientation=record.get("orientation")
            )
    
    def generate_lesson_plan(
        self,
        request: GenerateLessonPlanBuilderRequest,
        reference_documents: Optional[str] = None
    ) -> GenerateLessonPlanBuilderResponse:
        """Sinh kế hoạch bài dạy từ thông tin đã chọn"""
        
        # 1. Lấy chi tiết bài học từ Neo4j
        lesson_detail = self.get_lesson_detail(request.lesson_id)
        if not lesson_detail:
            raise ValueError(f"Không tìm thấy bài học với ID: {request.lesson_id}")
        
        # 2. Lấy nội dung markdown từ SQLite
        markdown_content = self.get_lesson_content_from_sqlite(request.lesson_id)
        
        # 3. Xây dựng prompt với cả Neo4j data và markdown content
        prompt = self._build_prompt(request, lesson_detail, reference_documents, markdown_content)
        
        try:
            # Gọi Gemini
            response = self.model.generate_content(prompt)
            raw_response = (response.text or "").strip()
            
            # Debug: Log số ký tự response
            print(f"[DEBUG] Raw response length: {len(raw_response)} chars")
            
            # Parse response thành sections
            sections = self._parse_response_to_sections(raw_response, request, lesson_detail)
            
            # Debug: Log các section đã parse
            print(f"[DEBUG] Parsed sections: {[s.section_type for s in sections]}")
            
            return GenerateLessonPlanBuilderResponse(
                lesson_info={
                    "book_type": request.book_type,
                    "grade": request.grade,
                    "topic": request.topic,
                    "lesson_name": request.lesson_name
                },
                sections=sections,
                full_content=raw_response
            )
        except Exception as e:
            raise RuntimeError(f"Lỗi sinh kế hoạch bài dạy: {str(e)}")
    
    def _build_prompt(
        self,
        request: GenerateLessonPlanBuilderRequest,
        lesson_detail: LessonDetailResponse,
        reference_documents: Optional[str] = None,
        markdown_content: Optional[str] = None
    ) -> str:
        """Xây dựng prompt chi tiết cho LLM - lấy từ lesson_plan_generator.py"""
        
        # Chuẩn bị thông tin hoạt động - CHI TIẾT TỪNG HOẠT ĐỘNG
        activities_info = ""
        teaching_instructions = ""  # Hướng dẫn cách tổ chức chi tiết
        
        # DEBUG: Hiển thị phương pháp/kỹ thuật người dùng chọn
        print("\n" + "="*80)
        print("🎓 PHƯƠNG PHÁP & KỸ THUẬT NGƯỜI DÙNG ĐÃ CHỌN CHO TỪNG HOẠT ĐỘNG:")
        print("="*80)
        
        for idx, activity in enumerate(request.activities, 1):
            methods_str = ", ".join(activity.selected_methods) if activity.selected_methods else "Không chọn"
            techniques_str = ", ".join(activity.selected_techniques) if activity.selected_techniques else "Không chọn"
            
            # DEBUG: In ra phương pháp/kỹ thuật đã chọn cho mỗi hoạt động
            print(f"\n📌 Hoạt động {idx}: {activity.activity_name}")
            print(f"   - Phương pháp: {methods_str}")
            print(f"   - Kỹ thuật: {techniques_str}")
            if activity.methods_content:
                print(f"   - Nội dung PP ({len(activity.methods_content)} mục): {list(activity.methods_content.keys())}")
            if activity.techniques_content:
                print(f"   - Nội dung KT ({len(activity.techniques_content)} mục): {list(activity.techniques_content.keys())}")
            
            activities_info += f"""
### Hoạt động {idx}: {activity.activity_name}
- Loại hoạt động: {activity.activity_type}
- Chỉ mục nội dung: {activity.chi_muc or 'N/A'}
- Phương pháp dạy học được chọn: {methods_str}
- Kỹ thuật dạy học được chọn: {techniques_str}
"""
            
            # Tạo hướng dẫn cách tổ chức CHI TIẾT cho từng hoạt động
            if activity.selected_methods or activity.selected_techniques:
                teaching_instructions += f"""
═══════════════════════════════════════════════════════════════
🎯 HƯỚNG DẪN TỔ CHỨC CHO HOẠT ĐỘNG: {activity.activity_name.upper()}
═══════════════════════════════════════════════════════════════
"""
                # Thêm cách tổ chức phương pháp
                if activity.methods_content:
                    for method_name, content in activity.methods_content.items():
                        if content:
                            teaching_instructions += f"""
📘 PHƯƠNG PHÁP: {method_name}
   ➤ Áp dụng tại: {activity.activity_name}
   ➤ Cách tổ chức:
{content}

"""
                
                # Thêm cách tổ chức kỹ thuật
                if activity.techniques_content:
                    for tech_name, content in activity.techniques_content.items():
                        if content:
                            teaching_instructions += f"""
📗 KỸ THUẬT: {tech_name}
   ➤ Áp dụng tại: {activity.activity_name}
   ➤ Cách tổ chức:
{content}

"""
        
        # DEBUG: Hiển thị tổng hợp hướng dẫn phương pháp/kỹ thuật
        if teaching_instructions:
            print("\n" + "="*80)
            print("📚 NỘI DUNG PHƯƠNG PHÁP/KỸ THUẬT TRUYỀN VÀO PROMPT:")
            print("="*80)
            print(teaching_instructions[:2000] + "..." if len(teaching_instructions) > 2000 else teaching_instructions)
            print("="*80)
            print(f"📊 Tổng độ dài: {len(teaching_instructions)} ký tự")
            print("="*80 + "\n")
        else:
            print("\n⚠️ Không có phương pháp/kỹ thuật nào được chọn cho các hoạt động!\n")
        
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
            # DEBUG: Hiển thị nội dung năng lực phẩm chất được thêm vào prompt
            print("\n" + "="*80)
            print("📚 NỘI DUNG NĂNG LỰC PHẨM CHẤT TRUYỀN VÀO PROMPT LLM:")
            print("="*80)
            # Hiển thị đầy đủ nội dung (không cắt ngắn)
            print(reference_documents)
            print("="*80)
            print(f"📊 Tổng độ dài: {len(reference_documents)} ký tự")
            print("="*80 + "\n")
            
            docs_instruction = f"""
<tai_lieu_tham_khao>
{reference_documents}
</tai_lieu_tham_khao>
"""

        # Xử lý nội dung bài học từ SQLite (markdown)
        lesson_content_section = ""
        if markdown_content:
            # DEBUG: Hiển thị nội dung bài học được truyền vào prompt
            print("\n" + "="*80)
            print("📖 NỘI DUNG BÀI HỌC (MARKDOWN) TRUYỀN VÀO PROMPT LLM:")
            print("="*80)
            print(markdown_content[:1500] + "..." if len(markdown_content) > 1500 else markdown_content)
            print("="*80)
            print(f"📊 Tổng độ dài nội dung bài học: {len(markdown_content)} ký tự")
            print("="*80 + "\n")
            
            lesson_content_section = f"""
<noi_dung_bai_hoc_chi_tiet>
{markdown_content}
</noi_dung_bai_hoc_chi_tiet>

⚠️ NỘI DUNG BÀI HỌC CHI TIẾT: Sử dụng nội dung trên để thiết kế các hoạt động dạy học phù hợp.
Đây là nội dung sách giáo khoa của bài học, hãy tham khảo để tạo các hoạt động dạy học cụ thể.
"""
        else:
            print("\n" + "="*80)
            print("⚠️ KHÔNG TÌM THẤY NỘI DUNG BÀI HỌC (MARKDOWN) TRONG DATABASE!")
            print("="*80 + "\n")

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
            book_type=request.book_type
        )
        return prompt
    
    def _sanitize_json_response(self, raw_response: str) -> str:
        """Sanitize JSON response để fix các escape characters không hợp lệ"""
        import re
        
        # Fix các escape sequences không hợp lệ trong JSON
        # JSON chỉ cho phép: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
        # Các escape khác như \e, \s, \a, etc. không hợp lệ
        
        # Thay thế các backslash đơn trước các ký tự không phải escape hợp lệ
        # Pattern: backslash + ký tự không phải trong ["\\/bfnrtu]
        def fix_invalid_escape(match):
            char = match.group(1)
            # Nếu là ký tự escape hợp lệ, giữ nguyên
            if char in '"\\/bfnrtu':
                return match.group(0)
            # Nếu không hợp lệ, thay bằng double backslash hoặc bỏ backslash
            return char  # Bỏ backslash, giữ ký tự
        
        # Fix invalid escapes
        sanitized = re.sub(r'\\([^"\\/bfnrtu])', fix_invalid_escape, raw_response)
        
        # Cũng fix trường hợp \\ bị viết sai
        # Nhưng cẩn thận không làm hỏng \n, \t, etc.
        
        return sanitized
    
    def _parse_response_to_sections(
        self,
        raw_response: str,
        request: GenerateLessonPlanBuilderRequest,
        lesson_detail: LessonDetailResponse
    ) -> List[LessonPlanSection]:
        """Parse JSON response từ LLM thành các sections"""
        
        sections = []
        
        try:
            # Sanitize JSON response trước khi parse
            sanitized_response = self._sanitize_json_response(raw_response)
            
            # Parse JSON response
            data = json.loads(sanitized_response)
            
            if "sections" in data:
                for idx, item in enumerate(data["sections"]):
                    section_type = item.get("section_type", "unknown")
                    title = item.get("title", f"Section {idx + 1}")
                    content = item.get("content", "")
                    questions = item.get("questions", None)
                    
                    # Tạo section_id unique
                    if section_type == "phieu_hoc_tap":
                        # Đếm số phiếu học tập đã có
                        phieu_count = sum(1 for s in sections if s.section_type == "phieu_hoc_tap")
                        section_id = f"phieu_hoc_tap_{phieu_count + 1}"
                    else:
                        section_id = section_type
                    
                    # Xử lý đặc biệt cho trac_nghiem - có questions array
                    if section_type == "trac_nghiem" and questions:
                        # Tạo content từ questions để hiển thị đẹp trên UI
                        content_lines = []
                        for q_idx, q in enumerate(questions, 1):
                            content_lines.append(f"**Câu {q_idx}:** {q.get('question', '')}")
                            content_lines.append("")
                            content_lines.append(f"A. {q.get('A', '')}")
                            content_lines.append(f"B. {q.get('B', '')}")
                            content_lines.append(f"C. {q.get('C', '')}")
                            content_lines.append(f"D. {q.get('D', '')}")
                            # Đánh dấu đáp án đúng
                            answer = q.get('answer', '').upper()
                            content_lines.append(f"*Đáp án: {answer}*")
                            content_lines.append("")
                        content = "\n".join(content_lines)
                        
                        sections.append(LessonPlanSection(
                            section_id=section_id,
                            section_type=section_type,
                            title=title,
                            content=content,
                            questions=questions,
                            editable=True
                        ))
                    else:
                        # Lấy code_exercises nếu có (cho bài thực hành lập trình)
                        code_exercises = item.get("code_exercises", None)
                        
                        sections.append(LessonPlanSection(
                            section_id=section_id,
                            section_type=section_type,
                            title=title,
                            content=content,
                            code_exercises=code_exercises,
                            editable=True
                        ))
                    
        except json.JSONDecodeError as e:
            # Fallback 1: Thử parse với cách sanitize mạnh hơn
            print(f"JSON parse error: {e}. Trying aggressive sanitization...")
            
            try:
                # Cách sanitize mạnh hơn: decode các unicode escapes và re-encode
                import codecs
                # Thử replace tất cả invalid escapes bằng cách regex mạnh hơn
                import re
                
                # Tìm và fix tất cả backslash không hợp lệ
                def aggressive_fix(text):
                    result = []
                    i = 0
                    while i < len(text):
                        if text[i] == '\\' and i + 1 < len(text):
                            next_char = text[i + 1]
                            if next_char in '"\\/bfnrt':
                                result.append(text[i:i+2])
                                i += 2
                            elif next_char == 'u' and i + 5 < len(text):
                                # Check if it's a valid unicode escape
                                unicode_seq = text[i:i+6]
                                if re.match(r'\\u[0-9a-fA-F]{4}', unicode_seq):
                                    result.append(unicode_seq)
                                    i += 6
                                else:
                                    result.append(next_char)
                                    i += 2
                            else:
                                # Invalid escape - skip the backslash
                                result.append(next_char)
                                i += 2
                        else:
                            result.append(text[i])
                            i += 1
                    return ''.join(result)
                
                aggressive_sanitized = aggressive_fix(raw_response)
                data = json.loads(aggressive_sanitized)
                
                if "sections" in data:
                    for idx, item in enumerate(data["sections"]):
                        section_type = item.get("section_type", "unknown")
                        title = item.get("title", f"Section {idx + 1}")
                        content = item.get("content", "")
                        questions = item.get("questions", None)
                        
                        if section_type == "phieu_hoc_tap":
                            phieu_count = sum(1 for s in sections if s.section_type == "phieu_hoc_tap")
                            section_id = f"phieu_hoc_tap_{phieu_count + 1}"
                        else:
                            section_id = section_type
                        
                        code_exercises = item.get("code_exercises", None)
                        
                        sections.append(LessonPlanSection(
                            section_id=section_id,
                            section_type=section_type,
                            title=title,
                            content=content,
                            code_exercises=code_exercises,
                            questions=questions if section_type == "trac_nghiem" else None,
                            editable=True
                        ))
                    print(f"[DEBUG] Aggressive sanitization worked! Parsed {len(sections)} sections")
                        
            except json.JSONDecodeError as e2:
                print(f"Aggressive sanitization failed: {e2}. Falling back to marker parsing.")
                sections = self._parse_response_with_markers(raw_response, request, lesson_detail)
        
        # Nếu không parse được sections, tạo một section duy nhất
        if not sections:
            sections.append(LessonPlanSection(
                section_id="full_content",
                section_type="full",
                title="Kế hoạch bài dạy",
                content=raw_response,
                editable=True
            ))
        
        return sections
    
    def _parse_response_with_markers(
        self,
        raw_response: str,
        request: GenerateLessonPlanBuilderRequest,
        lesson_detail: LessonDetailResponse
    ) -> List[LessonPlanSection]:
        """Fallback: Parse response theo cách cũ dùng markers [SECTION:XXX]"""
        import re
        sections = []
        
        # Định nghĩa các section markers
        section_markers = [
            ("THONG_TIN_CHUNG", "Thông tin chung", "thong_tin_chung"),
            ("MUC_TIEU", "Mục tiêu bài học", "muc_tieu"),
            ("THIET_BI", "Thiết bị dạy học", "thiet_bi"),
            ("KHOI_DONG", "Hoạt động 1: Khởi động", "khoi_dong"),
            ("HINH_THANH_KIEN_THUC", "Hoạt động 2: Hình thành kiến thức mới", "hinh_thanh_kien_thuc"),
            ("LUYEN_TAP", "Hoạt động 3: Luyện tập", "luyen_tap"),
            ("VAN_DUNG", "Hoạt động 4: Vận dụng", "van_dung"),
            ("PHU_LUC", "Phụ lục", "phu_luc"),
            ("TRAC_NGHIEM", "Phụ lục: Trắc nghiệm", "trac_nghiem"),
        ]
        
        for idx, (marker_id, title, section_type) in enumerate(section_markers):
            marker = f"[SECTION:{marker_id}]"
            
            # Tìm vị trí bắt đầu
            start_pos = raw_response.find(marker)
            if start_pos == -1:
                # Thử tìm không có marker
                content = self._extract_section_by_title(raw_response, title)
            else:
                # Tìm vị trí kết thúc (marker tiếp theo hoặc cuối)
                end_pos = len(raw_response)
                for next_marker_id, _, _ in section_markers[idx + 1:]:
                    next_marker = f"[SECTION:{next_marker_id}]"
                    next_pos = raw_response.find(next_marker)
                    if next_pos != -1:
                        end_pos = next_pos
                        break
                
                content = raw_response[start_pos + len(marker):end_pos].strip()
                
                # Loại bỏ tất cả markers còn sót lại trong content
                import re
                content = re.sub(r'\[SECTION:[^\]]+\]', '', content).strip()
                # Loại bỏ các dấu --- thừa ở đầu/cuối
                content = content.strip('-').strip()
            
            # Skip PHU_LUC vì chỉ là wrapper container, các phiếu học tập sẽ được parse riêng
            if content and marker_id != "PHU_LUC":
                sections.append(LessonPlanSection(
                    section_id=marker_id.lower(),
                    section_type=section_type,
                    title=title,
                    content=content,
                    editable=True
                ))
        
        # Parse các PHIEU_HOC_TAP_X sections riêng biệt
        import re
        phieu_pattern = re.compile(r'\[SECTION:PHIEU_HOC_TAP_(\d+)\](.*?)(?=\[SECTION:PHIEU_HOC_TAP_\d+\]|\[SECTION:TRAC_NGHIEM\]|---\s*$|$)', re.DOTALL)
        for match in phieu_pattern.finditer(raw_response):
            phieu_num = match.group(1)
            phieu_content = match.group(2).strip()
            
            # Loại bỏ dấu --- ở đầu/cuối
            while phieu_content.startswith('---'):
                phieu_content = phieu_content[3:].strip()
            while phieu_content.endswith('---'):
                phieu_content = phieu_content[:-3].strip()
            
            if phieu_content:
                sections.append(LessonPlanSection(
                    section_id=f"phieu_hoc_tap_{phieu_num}",
                    section_type="phieu_hoc_tap",
                    title=f"Phiếu học tập số {phieu_num}",
                    content=phieu_content,
                    editable=True
                ))
        
        # Xử lý đặc biệt cho TRAC_NGHIEM: chỉ lấy phần câu hỏi trắc nghiệm thực sự
        # Tìm section TRAC_NGHIEM đã được parse
        for i, section in enumerate(sections):
            if section.section_type == "trac_nghiem":
                content = section.content
                
                # Tìm vị trí bắt đầu câu hỏi trắc nghiệm thực sự
                # Pattern: **Câu 1:** hoặc Câu 1: hoặc **Câu 1.**
                quiz_start_pattern = re.search(r'(\*\*)?Câu\s*1[:.]\*?\*?', content)
                
                if quiz_start_pattern:
                    # Chỉ lấy từ Câu 1 trở đi
                    quiz_content = content[quiz_start_pattern.start():].strip()
                    sections[i] = LessonPlanSection(
                        section_id=section.section_id,
                        section_type=section.section_type,
                        title=section.title,
                        content=quiz_content,
                        editable=True
                    )
                break
        
        # Parse phiếu học tập từ nội dung không có marker (fallback)
        # Tìm pattern: **PHIẾU HỌC TẬP SỐ X** hoặc PHIẾU HỌC TẬP SỐ X
        phieu_exists = any(s.section_type == "phieu_hoc_tap" for s in sections)
        if not phieu_exists:
            # Tìm trong toàn bộ raw_response
            phieu_fallback_pattern = re.compile(
                r'\*?\*?PHIẾU\s*HỌC\s*TẬP\s*(?:SỐ\s*)?(\d+)\*?\*?(.*?)(?=\*?\*?PHIẾU\s*HỌC\s*TẬP\s*(?:SỐ\s*)?\d+|\*?\*?Câu\s*1[:.]\*?\*?|$)',
                re.DOTALL | re.IGNORECASE
            )
            for match in phieu_fallback_pattern.finditer(raw_response):
                phieu_num = match.group(1)
                phieu_content = match.group(2).strip()
                
                # Loại bỏ dấu --- ở đầu/cuối
                while phieu_content.startswith('---'):
                    phieu_content = phieu_content[3:].strip()
                while phieu_content.endswith('---'):
                    phieu_content = phieu_content[:-3].strip()
                
                # Kiểm tra xem phiếu này đã tồn tại chưa
                existing_ids = [s.section_id for s in sections]
                if phieu_content and f"phieu_hoc_tap_{phieu_num}" not in existing_ids:
                    sections.append(LessonPlanSection(
                        section_id=f"phieu_hoc_tap_{phieu_num}",
                        section_type="phieu_hoc_tap",
                        title=f"Phiếu học tập số {phieu_num}",
                        content=phieu_content,
                        editable=True
                    ))
        
        # Nếu không parse được sections, tạo một section duy nhất
        if not sections:
            sections.append(LessonPlanSection(
                section_id="full_content",
                section_type="full",
                title="Kế hoạch bài dạy",
                content=raw_response,
                editable=True
            ))
        
        return sections
    
    def _extract_section_by_title(self, content: str, title: str) -> str:
        """Trích xuất nội dung section theo tiêu đề"""
        # Tìm tiêu đề trong nội dung
        import re
        
        # Các pattern có thể có
        patterns = [
            rf"##\s*{re.escape(title)}",
            rf"###\s*{re.escape(title)}",
            rf"\*\*{re.escape(title)}\*\*",
            rf"{re.escape(title)}:"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                start = match.start()
                # Tìm section tiếp theo
                next_section = re.search(r'\n##\s|\n###\s|\n\*\*[A-Z]', content[match.end():])
                if next_section:
                    end = match.end() + next_section.start()
                else:
                    end = len(content)
                return content[start:end].strip()
        
        return ""
    
    def improve_section(
        self,
        section_type: str,
        section_title: str,
        current_content: str,
        user_request: str,
        lesson_info: Dict[str, str],
        related_appendices: List[Dict] = None,
        reference_documents: Optional[str] = None
    ):
        """Cải thiện nội dung một section với AI, kèm theo phụ lục liên quan nếu có"""
        from app.schemas.lesson_plan_builder import ImproveSectionResponse, UpdatedAppendix
        from app.prompts import get_section_improvement_prompt
        
        # Xây dựng prompt cơ bản
        base_prompt = get_section_improvement_prompt(
            section_type=section_type,
            section_title=section_title,
            current_content=current_content,
            user_request=user_request,
            lesson_info=lesson_info
        )
        
        # Thêm tài liệu tham khảo nếu có (năng lực, phẩm chất, thiết bị)
        if reference_documents:
            base_prompt += f"""

═══════════════════════════════════════════════════════════════════
📚 TÀI LIỆU THAM KHẢO (NĂNG LỰC, PHẨM CHẤT, THIẾT BỊ)
═══════════════════════════════════════════════════════════════════
Sử dụng thông tin từ tài liệu tham khảo sau để cải thiện nội dung:

<tai_lieu_tham_khao>
{reference_documents}
</tai_lieu_tham_khao>
"""
        
        # Nếu có phụ lục liên quan, thêm vào prompt
        if related_appendices and len(related_appendices) > 0:
            appendix_context = "\n\n═══════════════════════════════════════════════════════════════════\n"
            appendix_context += "📎 PHỤ LỤC LIÊN QUAN (CẦN CẬP NHẬT ĐỒNG BỘ)\n"
            appendix_context += "═══════════════════════════════════════════════════════════════════\n"
            appendix_context += "Khi thay đổi nội dung hoạt động, CẦN CẬP NHẬT phụ lục liên quan để đồng bộ.\n\n"
            
            for appendix in related_appendices:
                appendix_context += f"--- {appendix.get('title', 'Phụ lục')} (ID: {appendix.get('section_id', '')}) ---\n"
                appendix_context += f"{appendix.get('content', '')}\n\n"
            
            appendix_context += """
═══════════════════════════════════════════════════════════════════
📤 OUTPUT FORMAT (BẮT BUỘC)
═══════════════════════════════════════════════════════════════════
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
            )
        except Exception as e:
            raise RuntimeError(f"Lỗi cải thiện section: {str(e)}")
    
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

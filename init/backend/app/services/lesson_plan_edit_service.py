"""
Service xử lý chỉnh sửa inline KHBD với AI.
Gồm 2 bước: suggest (đề xuất hướng sửa) và apply (thực hiện sửa).
"""
import json
import logging
import os
import re
from typing import Any

import google.generativeai as genai
from dotenv import load_dotenv
from neo4j import GraphDatabase

from app.prompts.lesson_plan_edit_suggest import (
    build_edit_suggest_prompt,
    get_edit_suggest_system_instruction,
)
from app.prompts.lesson_plan_edit_apply import (
    build_edit_apply_prompt,
    get_edit_apply_system_instruction,
)
from app.utils.prompt_sanitize import sanitize_prompt_input

logger = logging.getLogger("app.lesson_plan_edit")
load_dotenv()


class LessonPlanEditService:
    """Service cho chỉnh sửa inline KHBD."""

    def __init__(self) -> None:
        # Neo4j connection
        neo4j_uri = os.getenv("NEO4J_URI")
        if neo4j_uri:
            self.driver = GraphDatabase.driver(
                neo4j_uri,
                auth=(os.getenv("NEO4J_USERNAME"), os.getenv("NEO4J_PASSWORD")),
                connection_timeout=15,
                connection_acquisition_timeout=30,
                max_connection_pool_size=5,
            )
            self.neo4j_database = os.getenv("NEO4J_DATABASE", "neo4j")
        else:
            self.driver = None
            self.neo4j_database = "neo4j"

        # Cache PP/KTDH
        self._ppdh_ktdh_cache: str | None = None

        self.suggest_model = None
        self.apply_model = None
        self._suggest_model_name: str | None = None
        self._apply_model_name: str | None = None

        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            model_name = os.getenv("GEMINI_MODEL_LESSON_PLAN", "gemini-2.5-flash")
            self.configure_models(
                suggest_model_name=model_name,
                apply_model_name=model_name,
            )

    def configure_models(
        self,
        suggest_model_name: str | None = None,
        apply_model_name: str | None = None,
    ) -> None:
        if not os.getenv("GEMINI_API_KEY"):
            self.suggest_model = None
            self.apply_model = None
            self._suggest_model_name = None
            self._apply_model_name = None
            return

        target_suggest_model = (suggest_model_name or self._suggest_model_name or os.getenv("GEMINI_MODEL_LESSON_PLAN", "gemini-2.5-flash")).strip()
        target_apply_model = (apply_model_name or self._apply_model_name or target_suggest_model).strip()

        if not target_suggest_model:
            target_suggest_model = "gemini-2.5-flash"
        if not target_apply_model:
            target_apply_model = target_suggest_model

        if self.suggest_model is None or self._suggest_model_name != target_suggest_model:
            self.suggest_model = genai.GenerativeModel(
                model_name=target_suggest_model,
                system_instruction=get_edit_suggest_system_instruction(),
                generation_config={
                    "temperature": 0.4,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4096,
                    "response_mime_type": "application/json",
                },
            )
            self._suggest_model_name = target_suggest_model

        if self.apply_model is None or self._apply_model_name != target_apply_model:
            self.apply_model = genai.GenerativeModel(
                model_name=target_apply_model,
                system_instruction=get_edit_apply_system_instruction(),
                generation_config={
                    "temperature": 0.3,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 12288,
                    "response_mime_type": "application/json",
                },
            )
            self._apply_model_name = target_apply_model

    # ------------------------------------------------------------------
    # JSON parsing helpers
    # ------------------------------------------------------------------
    @staticmethod
    def _strip_code_fences(text: str) -> str:
        t = (text or "").strip()
        if t.startswith("```"):
            t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.IGNORECASE)
            t = re.sub(r"\s*```$", "", t)
        return t.strip()

    @staticmethod
    def _extract_balanced_json_fragment(text: str) -> str | None:
        """Extract first balanced JSON object/array fragment from text."""
        if not text:
            return None

        start_obj = text.find("{")
        start_arr = text.find("[")
        starts = [s for s in [start_obj, start_arr] if s != -1]
        if not starts:
            return None
        start = min(starts)

        in_string = False
        escape = False
        stack: list[str] = []
        opener_for = {'}': '{', ']': '['}

        for i in range(start, len(text)):
            ch = text[i]

            if escape:
                escape = False
                continue
            if ch == "\\" and in_string:
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
                continue

            if in_string:
                continue

            if ch in "[{":
                stack.append(ch)
            elif ch in "]}":
                if not stack or stack[-1] != opener_for[ch]:
                    return None
                stack.pop()
                if not stack:
                    return text[start : i + 1]

        return None

    @staticmethod
    def _repair_truncated_json(text: str) -> str:
        """Best-effort repair for truncated JSON by closing quotes/brackets."""
        t = text.strip()
        if not t:
            return t

        # Keep only plausible JSON tail from first object/array opener
        first_obj = t.find("{")
        first_arr = t.find("[")
        starts = [s for s in [first_obj, first_arr] if s != -1]
        if starts:
            t = t[min(starts):]

        in_string = False
        escape = False
        stack: list[str] = []

        for ch in t:
            if escape:
                escape = False
                continue
            if ch == "\\" and in_string:
                escape = True
                continue
            if ch == '"':
                in_string = not in_string
                continue
            if in_string:
                continue
            if ch in "[{":
                stack.append(ch)
            elif ch in "]}":
                if stack:
                    stack.pop()

        # Close open string if needed
        if in_string:
            t += '"'

        # Close open structures in reverse
        closer = {"{": "}", "[": "]"}
        for op in reversed(stack):
            t += closer[op]

        return t

    def _loads_llm_json(self, raw_text: str) -> dict[str, Any]:
        """Parse model JSON robustly, including wrapped/truncated outputs."""
        raw = self._strip_code_fences(raw_text)

        # 1) Direct parse
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

        # 2) Parse balanced fragment
        fragment = self._extract_balanced_json_fragment(raw)
        if fragment:
            try:
                parsed = json.loads(fragment)
                if isinstance(parsed, dict):
                    return parsed
            except Exception:
                pass

        # 3) Repair truncated JSON and parse
        repaired = self._repair_truncated_json(raw)
        parsed = json.loads(repaired)
        if not isinstance(parsed, dict):
            raise ValueError("LLM JSON phải là object")
        return parsed

    @staticmethod
    def _fallback_suggest(selected_text: str) -> dict[str, Any]:
        """Return safe fallback suggestions when model output is unusable."""
        lower = (selected_text or "").lower()
        if "khởi động" in lower:
            activity_type = "khoi_dong"
        elif "luyện tập" in lower:
            activity_type = "luyen_tap"
        elif "vận dụng" in lower:
            activity_type = "van_dung"
        else:
            activity_type = "hinh_thanh_kien_thuc"

        return {
            "analysis": {
                "activity_type": activity_type,
                "current_method": "Không rõ",
                "position": "khac",
                "issue": "Cần cụ thể hóa nội dung, sản phẩm và quy trình tổ chức để đồng bộ hơn.",
            },
            "suggestions": [
                {
                    "id": 1,
                    "type": "cai_thien",
                    "title": "Cụ thể hóa quy trình B1-B4",
                    "description": "Làm rõ vai trò GV/HS ở từng bước B1-B4, có thời lượng và sản phẩm rõ ràng.",
                },
                {
                    "id": 2,
                    "type": "cai_thien",
                    "title": "Đồng bộ b) c) d)",
                    "description": "Bảo đảm b) Nội dung, c) Sản phẩm và d) Tổ chức thực hiện khớp cùng một hình thức hoạt động.",
                },
                {
                    "id": 3,
                    "type": "doi_ky_thuat",
                    "title": "Đổi kỹ thuật tổ chức",
                    "description": "Đổi sang một kỹ thuật dạy học phù hợp mục tiêu, giữ nguyên kiến thức cốt lõi của hoạt động.",
                },
            ],
        }

    # ------------------------------------------------------------------
    # Truy xuất PP/KTDH từ Neo4j
    # ------------------------------------------------------------------
    def get_ppdh_ktdh_text(self) -> str:
        """Lấy danh sách PP + KTDH từ Neo4j, cache lại."""
        if self._ppdh_ktdh_cache is not None:
            return self._ppdh_ktdh_cache

        if not self.driver:
            self._ppdh_ktdh_cache = ""
            return ""

        lines = []
        try:
            with self.driver.session(database=self.neo4j_database) as session:
                # Phương pháp dạy học
                pp_result = session.run("""
                    MATCH (pp:PhuongPhapDayHoc)
                    RETURN pp.ten AS ten, pp.cach_tien_hanh AS cach_tien_hanh,
                           pp.uu_diem AS uu_diem, pp.nhuoc_diem AS nhuoc_diem
                    ORDER BY pp.ten
                """)
                lines.append("### PHƯƠNG PHÁP DẠY HỌC (từ cơ sở dữ liệu):")
                for rec in pp_result:
                    name = rec["ten"]
                    cth = rec.get("cach_tien_hanh") or ""
                    ud = rec.get("uu_diem") or ""
                    nd = rec.get("nhuoc_diem") or ""
                    lines.append(f"- **{name}**")
                    if cth.strip():
                        summary = cth.strip()[:300]
                        if len(cth.strip()) > 300:
                            summary += "..."
                        lines.append(f"  Cách tiến hành: {summary}")
                    if ud.strip():
                        ud_summary = ud.strip()[:200]
                        if len(ud.strip()) > 200:
                            ud_summary += "..."
                        lines.append(f"  Ưu điểm: {ud_summary}")
                    if nd.strip():
                        nd_summary = nd.strip()[:200]
                        if len(nd.strip()) > 200:
                            nd_summary += "..."
                        lines.append(f"  Nhược điểm: {nd_summary}")

                # Kỹ thuật dạy học
                kt_result = session.run("""
                    MATCH (kt:KyThuatDayHoc)
                    RETURN kt.ten AS ten, kt.cach_tien_hanh AS cach_tien_hanh,
                           kt.uu_diem AS uu_diem, kt.nhuoc_diem AS nhuoc_diem
                    ORDER BY kt.ten
                """)
                lines.append("\n### KỸ THUẬT DẠY HỌC (từ cơ sở dữ liệu):")
                for rec in kt_result:
                    name = rec["ten"]
                    cth = rec.get("cach_tien_hanh") or ""
                    ud = rec.get("uu_diem") or ""
                    nd = rec.get("nhuoc_diem") or ""
                    lines.append(f"- **{name}**")
                    if cth.strip():
                        summary = cth.strip()[:300]
                        if len(cth.strip()) > 300:
                            summary += "..."
                        lines.append(f"  Cách tiến hành: {summary}")
                    if ud.strip():
                        ud_summary = ud.strip()[:200]
                        if len(ud.strip()) > 200:
                            ud_summary += "..."
                        lines.append(f"  Ưu điểm: {ud_summary}")
                    if nd.strip():
                        nd_summary = nd.strip()[:200]
                        if len(nd.strip()) > 200:
                            nd_summary += "..."
                        lines.append(f"  Nhược điểm: {nd_summary}")

            self._ppdh_ktdh_cache = "\n".join(lines)
        except Exception as e:
            logger.error("Lỗi truy xuất PP/KTDH từ Neo4j: %s", e)
            self._ppdh_ktdh_cache = ""

        return self._ppdh_ktdh_cache

    # ------------------------------------------------------------------
    # STEP 1: Suggest
    # ------------------------------------------------------------------
    def suggest_edits(
        self,
        selected_text: str,
        full_lesson_plan: str,
    ) -> tuple[dict[str, Any], int]:
        """Phân tích đoạn text và đề xuất hướng chỉnh sửa.

        Returns:
            (parsed_response_dict, tokens_used)
        """
        safe_text = sanitize_prompt_input(selected_text, max_length=5000)
        safe_plan = sanitize_prompt_input(full_lesson_plan, max_length=30000)

        if not self.suggest_model:
            raise RuntimeError("Gemini model cho edit suggest chua duoc cau hinh")

        # Lấy PP/KTDH từ Neo4j
        ppdh_ktdh_data = self.get_ppdh_ktdh_text()

        prompt = build_edit_suggest_prompt(
            selected_text=safe_text,
            full_lesson_plan=safe_plan,
            ppdh_ktdh_data=ppdh_ktdh_data,
        )

        try:
            response = self.suggest_model.generate_content(prompt)
            tokens_used = 0
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                tokens_used = getattr(response.usage_metadata, "total_token_count", 0)
                logger.info("edit_suggest token usage: %d", tokens_used)

            raw = (response.text or "").strip()

            # Parse JSON robustly (handles truncated/wrapped JSON)
            parsed = self._loads_llm_json(raw)

            # Ensure required keys exist
            if not isinstance(parsed.get("analysis"), dict) or not isinstance(parsed.get("suggestions"), list):
                logger.warning("edit_suggest invalid structure, using fallback")
                parsed = self._fallback_suggest(safe_text)

            return parsed, tokens_used

        except json.JSONDecodeError as e:
            logger.error("edit_suggest JSON parse error: %s | raw=%s", e, raw[:500])
            return self._fallback_suggest(safe_text), tokens_used if 'tokens_used' in locals() else 0
        except Exception as e:
            logger.error("edit_suggest error: %s", e)
            # Graceful fallback to avoid breaking teacher flow
            return self._fallback_suggest(safe_text), tokens_used if 'tokens_used' in locals() else 0

    # ------------------------------------------------------------------
    # STEP 2: Apply
    # ------------------------------------------------------------------
    def apply_edit(
        self,
        selected_text: str,
        suggestion_type: str,
        suggestion_title: str,
        suggestion_description: str,
        full_lesson_plan: str,
    ) -> tuple[dict[str, Any], int]:
        """Thực hiện chỉnh sửa đoạn text theo hướng GV đã chọn.

        Returns:
            (parsed_response_dict, tokens_used)
            parsed_response_dict: {"edited_text": str, "related_changes": [...]}
        """
        safe_text = sanitize_prompt_input(selected_text, max_length=5000)
        safe_title = sanitize_prompt_input(suggestion_title, max_length=200)
        safe_desc = sanitize_prompt_input(suggestion_description, max_length=1000)
        safe_plan = sanitize_prompt_input(full_lesson_plan, max_length=30000)

        if not self.apply_model:
            raise RuntimeError("Gemini model cho edit apply chua duoc cau hinh")

        # Lấy PP/KTDH từ Neo4j
        ppdh_ktdh_data = self.get_ppdh_ktdh_text()

        prompt = build_edit_apply_prompt(
            selected_text=safe_text,
            suggestion_type=suggestion_type,
            suggestion_title=safe_title,
            suggestion_description=safe_desc,
            full_lesson_plan=safe_plan,
            ppdh_ktdh_data=ppdh_ktdh_data,
        )

        try:
            response = self.apply_model.generate_content(prompt)
            tokens_used = 0
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                tokens_used = getattr(response.usage_metadata, "total_token_count", 0)
                logger.info("edit_apply token usage: %d", tokens_used)

            raw = (response.text or "").strip()

            # Parse JSON response robustly
            parsed = self._loads_llm_json(raw)

            # Validate structure
            if "edited_text" not in parsed:
                raise ValueError("Response thiếu 'edited_text'")
            if "related_changes" not in parsed:
                parsed["related_changes"] = []

            return parsed, tokens_used

        except json.JSONDecodeError as e:
            logger.error("edit_apply JSON parse error: %s | raw=%s", e, raw[:500])
            # Fallback: return original selected text so user can continue
            return {"edited_text": safe_text, "related_changes": []}, tokens_used if 'tokens_used' in locals() else 0
        except Exception as e:
            logger.error("edit_apply error: %s", e)
            return {"edited_text": safe_text, "related_changes": []}, tokens_used if 'tokens_used' in locals() else 0


# Singleton
_edit_service: LessonPlanEditService | None = None


def get_lesson_plan_edit_service() -> LessonPlanEditService:
    global _edit_service
    if _edit_service is None:
        _edit_service = LessonPlanEditService()
    return _edit_service

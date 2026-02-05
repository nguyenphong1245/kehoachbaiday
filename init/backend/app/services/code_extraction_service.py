"""
Service trích xuất bài tập lập trình từ KHBD đã sinh.
Gọi Gemini LLM để đọc nội dung KHBD, tìm bài tập code,
và tạo test cases tự động.
"""
import os
import json
import logging
import time
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.prompts.code_exercise_extraction import (
    get_code_extraction_system_instruction,
    build_code_extraction_prompt,
)

load_dotenv()
logger = logging.getLogger(__name__)


class CodeExtractionService:
    """Service trích xuất bài tập code từ KHBD và tạo test cases"""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
                system_instruction=get_code_extraction_system_instruction(),
                generation_config={
                    "temperature": 0.1,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 8192,
                    "response_mime_type": "application/json",
                },
            )
        else:
            self.model = None
            logger.warning("GEMINI_API_KEY not set - code extraction disabled")

    def extract_exercises(
        self,
        lesson_plan_content: str,
        lesson_info: Optional[dict] = None,
    ) -> dict:
        """
        Phân tích KHBD và trích xuất bài tập lập trình + test cases.

        Args:
            lesson_plan_content: Nội dung KHBD (markdown, ghép các section lại,
                                 KHÔNG bao gồm phiếu học tập)
            lesson_info: Thông tin bài học (book_type, grade, topic, lesson_name)

        Returns:
            dict với cấu trúc:
            {
                "found": true/false,
                "exercises": [
                    {
                        "title": str,
                        "description": str,
                        "source_activity": str,
                        "language": str,
                        "starter_code": str,
                        "test_cases": [
                            {"input": str, "expected_output": str, "is_hidden": bool}
                        ]
                    }
                ],
                "reason": str (nếu found=false)
            }
        """
        if not self.model:
            raise RuntimeError("Gemini API chưa được cấu hình (thiếu GEMINI_API_KEY)")

        prompt = build_code_extraction_prompt(lesson_plan_content)

        try:
            start_time = time.time()
            response = self.model.generate_content(prompt)
            elapsed = time.time() - start_time

            raw = (response.text or "").strip()
            logger.info(
                f"Code extraction LLM response: {len(raw)} chars in {elapsed:.2f}s"
            )

            if not raw:
                logger.warning("LLM trả về response rỗng cho code extraction")
                return {
                    "found": False,
                    "exercises": [],
                    "reason": "LLM không trả về kết quả",
                }

            result = json.loads(raw)

            # Gắn thêm lesson_info vào mỗi exercise nếu có
            if lesson_info and result.get("found") and result.get("exercises"):
                for ex in result["exercises"]:
                    ex["lesson_info"] = lesson_info

            return result

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error in code extraction: {e}")
            logger.error(f"Raw response: {raw[:500]}")
            return {
                "found": False,
                "exercises": [],
                "reason": f"Lỗi parse JSON từ LLM: {str(e)}",
            }
        except Exception as e:
            logger.error(f"Code extraction error: {e}")
            return {
                "found": False,
                "exercises": [],
                "reason": f"Lỗi trích xuất: {str(e)}",
            }


# Singleton instance
_service: Optional[CodeExtractionService] = None


def get_code_extraction_service() -> CodeExtractionService:
    """Lấy singleton instance của CodeExtractionService"""
    global _service
    if _service is None:
        _service = CodeExtractionService()
    return _service

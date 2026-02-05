"""
Service gợi ý (hint) khi học sinh sai test case.
Gộp tất cả test case sai → gọi Gemini 1 lần → trả phân tích tổng hợp.
"""
import os
import logging
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

from app.services.chat_ai import _call_gemini_with_retry

logger = logging.getLogger(__name__)

load_dotenv()

HINT_SYSTEM_INSTRUCTION = (
    "Bạn là trợ lý dạy lập trình cho học sinh Việt Nam. "
    "Nhiệm vụ: phân tích code sai và cho GỢI Ý ngắn gọn giúp học sinh tự sửa. "
    "TUYỆT ĐỐI KHÔNG viết code sửa hay cho đáp án trực tiếp."
)


def _build_hint_prompt(
    problem_statement: str,
    language: str,
    student_code: str,
    failed_tests: list[dict],
) -> str:
    tests_text = ""
    for t in failed_tests:
        tests_text += (
            f"\n- Test {t['test_num']}:"
            f"\n  Input: {t['input']}"
            f"\n  Kết quả mong đợi: {t['expected_output']}"
            f"\n  Kết quả thực tế: {t['actual_output']}"
        )
        if t.get("error"):
            tests_text += f"\n  Lỗi: {t['error']}"

    return f"""BÀI TOÁN:
{problem_statement}

NGÔN NGỮ: {language}

CODE HỌC SINH:
```{language}
{student_code}
```

CÁC TEST CASE SAI ({len(failed_tests)} test):
{tests_text}

YÊU CẦU PHÂN TÍCH:
- Viết bằng tiếng Việt, ngắn gọn (tối đa 5-6 câu)
- Chỉ ra lỗi chính trong code (logic sai, thiếu xử lý edge case, sai cú pháp...)
- Gợi ý HƯỚNG sửa, KHÔNG viết code sửa
- Nếu lỗi cú pháp/runtime → chỉ ra dòng lỗi và gợi ý kiểm tra
- Nếu lỗi logic → gợi ý kiểm tra điều kiện nào, thử với input nào
- KHÔNG cho đáp án, KHÔNG viết lại code"""


class HintService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found")

        genai.configure(api_key=api_key)

        self.model = genai.GenerativeModel(
            model_name=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            system_instruction=HINT_SYSTEM_INSTRUCTION,
            generation_config={
                "temperature": 0.4,
                "top_p": 0.9,
                "max_output_tokens": 1024,
            },
        )

    async def generate_hint(
        self,
        problem_statement: str,
        language: str,
        student_code: str,
        failed_tests: list[dict],
    ) -> str:
        """Phân tích tổng hợp các test case sai, trả về gợi ý."""
        prompt = _build_hint_prompt(
            problem_statement=problem_statement,
            language=language,
            student_code=student_code,
            failed_tests=failed_tests,
        )

        try:
            contents = [{"role": "user", "parts": [prompt]}]
            response = await _call_gemini_with_retry(
                self.model.generate_content, contents
            )
            return response.text.strip()
        except Exception as e:
            logger.error("hint_service.generate_hint error=%s", e)
            return "Không thể tạo gợi ý lúc này. Vui lòng thử lại sau."


# Singleton
_hint_service: Optional[HintService] = None


def get_hint_service() -> HintService:
    global _hint_service
    if _hint_service is None:
        _hint_service = HintService()
    return _hint_service

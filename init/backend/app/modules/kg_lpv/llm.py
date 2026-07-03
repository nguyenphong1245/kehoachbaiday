"""Helper LLM dùng chung cho pipeline KG-LPV (tách đoạn, N2 critic, N3 judge, sửa lỗi).

Chữ ký chính — các task sau (N2/N3/repairer) tái dùng nguyên hàm này:

    async def generate_json(db, feature_key, prompt, *, timeout=300) -> tuple[dict, int]

Trả về `(parsed_json, tokens_used)`. Model được chọn qua
`admin_ai_model_registry.get_effective_model_for_feature(db, feature_key)`,
temperature cố định 0.2, `response_mime_type="application/json"`. Nếu JSON hỏng,
thử sửa (`response_parser`) rồi gọi lại model đúng 1 lần; hết lượt vẫn hỏng thì
raise `LlmJsonError`.
"""
import asyncio
import json
import os

import google.generativeai as genai
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import logger
from app.services.admin_ai_model_registry import get_effective_model_for_feature
from app.services.response_parser import repair_truncated_json, sanitize_json_response

_TEMPERATURE = 0.2
_MAX_ATTEMPTS = 2


class LlmJsonError(Exception):
    """AI không trả JSON hợp lệ theo schema sau khi đã thử sửa và gọi lại."""


def _build_model(model_name: str) -> "genai.GenerativeModel":
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Thiếu cấu hình GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config={
            "temperature": _TEMPERATURE,
            "response_mime_type": "application/json",
        },
    )


def _extract_tokens(response) -> int:
    if hasattr(response, "usage_metadata") and response.usage_metadata:
        return getattr(response.usage_metadata, "total_token_count", 0) or 0
    return 0


def _parse_json(raw: str) -> dict:
    sanitized = sanitize_json_response(raw)
    try:
        return json.loads(sanitized)
    except json.JSONDecodeError:
        repaired = repair_truncated_json(sanitized)
        if repaired:
            return json.loads(repaired)
        raise


async def generate_json(
    db: AsyncSession,
    feature_key: str,
    prompt: str,
    *,
    timeout: int = 300,
) -> tuple[dict, int]:
    """Gọi Gemini (JSON mode) theo model hiệu dụng của `feature_key`.

    Trả về `(parsed_json, tokens_used)`. Retry gọi lại model đúng 1 lần khi
    JSON không parse được sau khi đã sanitize/repair.
    """
    model_name = await get_effective_model_for_feature(db, feature_key)
    model = _build_model(model_name)
    loop = asyncio.get_running_loop()

    total_tokens = 0
    last_error: Exception | None = None

    for attempt in range(_MAX_ATTEMPTS):
        response = await asyncio.wait_for(
            loop.run_in_executor(None, model.generate_content, prompt),
            timeout=timeout,
        )
        total_tokens += _extract_tokens(response)
        raw = (response.text or "").strip()

        try:
            data = _parse_json(raw)
            return data, total_tokens
        except json.JSONDecodeError as exc:
            last_error = exc
            logger.warning(
                "kg_lpv.llm.json_parse_failed feature_key=%s attempt=%d error=%s",
                feature_key, attempt + 1, exc,
            )

    raise LlmJsonError(
        f"AI trả về JSON không hợp lệ cho feature '{feature_key}' sau {_MAX_ATTEMPTS} lượt thử: {last_error}"
    )

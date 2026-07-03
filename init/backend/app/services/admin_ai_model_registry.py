import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_ai_model_setting import AdminAIModelSetting

ALLOWED_GEMINI_MODELS: tuple[str, ...] = (
    "gemini-3-pro",
    "gemini-3-flash",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
)

MODEL_ALIASES: dict[str, str] = {
    "gemini-3-pro-preview": "gemini-3-pro",
    "gemini-3-flash-preview": "gemini-3-flash",
    "gemini-2.5-pro-preview": "gemini-2.5-pro",
    "gemini-2.5-flash-preview": "gemini-2.5-flash",
}

FEATURE_LESSON_PLAN_GENERATION = "lesson_plan_generation"
FEATURE_LESSON_PLAN_MINDMAP = "lesson_plan_mindmap"
FEATURE_LESSON_PLAN_EDIT = "lesson_plan_edit"
FEATURE_COMMENT_ANALYSIS = "comment_analysis"
FEATURE_CODE_EXTRACTION = "code_extraction"
FEATURE_KG_LPV_SEGMENTATION = "kg_lpv_segmentation"
FEATURE_KG_LPV_N2_CRITIC = "kg_lpv_n2_critic"

# Legacy keys kept for backward compatibility when reading old DB settings.
LEGACY_FEATURE_LESSON_PLAN_EDIT_SUGGEST = "lesson_plan_edit_suggest"
LEGACY_FEATURE_LESSON_PLAN_EDIT_APPLY = "lesson_plan_edit_apply"

FEATURE_CONFIGS: dict[str, dict[str, str]] = {
    FEATURE_LESSON_PLAN_GENERATION: {
        "label": "Soạn KHBD",
        "description": "Sinh KHBD chính (bao gồm generate và generate-stream).",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-flash",
    },
    FEATURE_LESSON_PLAN_MINDMAP: {
        "label": "Sơ đồ tư duy",
        "description": "Sinh sơ đồ tư duy cho hoạt động học.",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-flash",
    },
    FEATURE_LESSON_PLAN_EDIT: {
        "label": "Sửa từng phần KHBD",
        "description": "Luồng sửa từng phần: AI đề xuất và AI áp dụng theo lựa chọn của giáo viên.",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-flash",
    },
    FEATURE_COMMENT_ANALYSIS: {
        "label": "Phân tích nhận xét giáo viên",
        "description": "Phân tích comment để sinh teaching rules.",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-flash",
    },
    FEATURE_CODE_EXTRACTION: {
        "label": "Trích xuất bài tập code",
        "description": "Trích xuất bài tập lập trình từ KHBD.",
        "env_var": "GEMINI_MODEL",
        "default": "gemini-2.5-flash",
    },
    FEATURE_KG_LPV_SEGMENTATION: {
        "label": "KG-LPV: Tách đoạn KHBD",
        "description": "Bước 1 pipeline kiểm chứng KG-LPV: tách sâu section thành segment nguyên tử.",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-flash",
    },
    FEATURE_KG_LPV_N2_CRITIC: {
        "label": "KG-LPV: Phản biện N2",
        "description": "Bước 2b pipeline kiểm chứng KG-LPV: phản biện M2 (động từ) và M6 (mệnh đề kiến thức).",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-flash",
    },
}


def _normalize_model_name(model_name: str | None) -> str:
    raw = (model_name or "").strip()
    if not raw:
        return ""
    aliased = MODEL_ALIASES.get(raw, raw)
    return aliased


def _resolve_default_model(feature_key: str) -> str:
    config = FEATURE_CONFIGS[feature_key]
    env_model = os.getenv(config["env_var"], config["default"])
    normalized = _normalize_model_name(env_model)
    if normalized in ALLOWED_GEMINI_MODELS:
        return normalized
    return config["default"]


def is_supported_feature(feature_key: str) -> bool:
    return feature_key in FEATURE_CONFIGS


def is_allowed_model(model_name: str) -> bool:
    return _normalize_model_name(model_name) in ALLOWED_GEMINI_MODELS


async def get_effective_model_for_feature(db: AsyncSession, feature_key: str) -> str:
    if feature_key not in FEATURE_CONFIGS:
        raise ValueError(f"Unsupported AI feature: {feature_key}")

    row = await db.scalar(
        select(AdminAIModelSetting).where(AdminAIModelSetting.feature_key == feature_key)
    )
    if row:
        normalized = _normalize_model_name(row.model_name)
        if normalized in ALLOWED_GEMINI_MODELS:
            return normalized

    # Backward compatibility: if unified edit key has no explicit row yet,
    # reuse any existing legacy row value from suggest/apply keys.
    if feature_key == FEATURE_LESSON_PLAN_EDIT:
        legacy_rows = (
            await db.execute(
                select(AdminAIModelSetting).where(
                    AdminAIModelSetting.feature_key.in_(
                        [
                            LEGACY_FEATURE_LESSON_PLAN_EDIT_APPLY,
                            LEGACY_FEATURE_LESSON_PLAN_EDIT_SUGGEST,
                        ]
                    )
                )
            )
        ).scalars().all()
        for legacy in legacy_rows:
            normalized = _normalize_model_name(legacy.model_name)
            if normalized in ALLOWED_GEMINI_MODELS:
                return normalized

    return _resolve_default_model(feature_key)


async def get_all_effective_model_settings(db: AsyncSession) -> list[dict[str, str]]:
    rows = (await db.execute(select(AdminAIModelSetting))).scalars().all()
    by_feature = {r.feature_key: r for r in rows}

    result: list[dict[str, str]] = []
    for feature_key, config in FEATURE_CONFIGS.items():
        row = by_feature.get(feature_key)
        model_name = _resolve_default_model(feature_key)
        if row:
            normalized = _normalize_model_name(row.model_name)
            if normalized in ALLOWED_GEMINI_MODELS:
                model_name = normalized

        result.append(
            {
                "feature_key": feature_key,
                "feature_label": config["label"],
                "description": config["description"],
                "model_name": model_name,
            }
        )

    return result


async def upsert_model_settings(
    db: AsyncSession,
    settings_updates: dict[str, str],
    updated_by_admin_id: int,
) -> None:
    if not settings_updates:
        return

    for feature_key, model_name in settings_updates.items():
        if feature_key not in FEATURE_CONFIGS:
            raise ValueError(f"Unsupported AI feature: {feature_key}")

        normalized = _normalize_model_name(model_name)
        if normalized not in ALLOWED_GEMINI_MODELS:
            raise ValueError(f"Unsupported Gemini model: {model_name}")

        existing = await db.scalar(
            select(AdminAIModelSetting).where(AdminAIModelSetting.feature_key == feature_key)
        )
        if existing:
            existing.model_name = normalized
            existing.updated_by_admin_id = updated_by_admin_id
        else:
            db.add(
                AdminAIModelSetting(
                    feature_key=feature_key,
                    model_name=normalized,
                    updated_by_admin_id=updated_by_admin_id,
                )
            )

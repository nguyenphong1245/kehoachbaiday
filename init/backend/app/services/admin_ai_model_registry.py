import os

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin_ai_model_setting import AdminAIModelSetting
from app.models.ai_provider_credential import AiProviderCredential

ALLOWED_GEMINI_MODELS: tuple[str, ...] = (
    "gemini-3.5-flash",
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
FEATURE_KG_LPV_N3_JUDGE = "kg_lpv_n3_judge"
FEATURE_KG_LPV_REPAIR = "kg_lpv_repair"

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
    FEATURE_KG_LPV_N3_JUDGE: {
        "label": "KG-LPV: Phán xử N3",
        "description": "Bước 3 pipeline kiểm chứng KG-LPV: phán xử nguyên tử 6 trục nhất quán sư phạm (C1-C8).",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-pro",
    },
    FEATURE_KG_LPV_REPAIR: {
        "label": "KG-LPV: Sửa KHBD",
        "description": "Bước 4 pipeline kiểm chứng KG-LPV: sửa cục bộ đoạn lỗi theo finding + kiểm lại.",
        "env_var": "GEMINI_MODEL_LESSON_PLAN",
        "default": "gemini-2.5-flash",
    },
}


PROVIDER_GEMINI = "gemini"
PROVIDER_OPENAI = "openai"
PROVIDER_DEEPSEEK = "deepseek"

PROVIDERS: dict[str, dict] = {
    PROVIDER_GEMINI: {"label": "Google Gemini", "models": ALLOWED_GEMINI_MODELS, "base_url": None, "env_key": "GEMINI_API_KEY"},
    PROVIDER_OPENAI: {"label": "OpenAI", "models": ("gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"), "base_url": None, "env_key": "OPENAI_API_KEY"},
    PROVIDER_DEEPSEEK: {"label": "DeepSeek", "models": ("deepseek-chat",), "base_url": "https://api.deepseek.com", "env_key": "DEEPSEEK_API_KEY"},
}

MULTI_PROVIDER_FEATURES: set[str] = {
    FEATURE_KG_LPV_SEGMENTATION, FEATURE_KG_LPV_N2_CRITIC, FEATURE_KG_LPV_N3_JUDGE, FEATURE_KG_LPV_REPAIR,
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


def provider_allows_model(provider: str, model: str) -> bool:
    cfg = PROVIDERS.get(provider)
    if not cfg:
        return False
    name = _normalize_model_name(model) if provider == PROVIDER_GEMINI else (model or "").strip()
    return name in cfg["models"]


async def get_effective_provider_model(db: AsyncSession, feature_key: str) -> tuple[str, str]:
    """Trả (provider, model). Feature ngoài MULTI_PROVIDER_FEATURES luôn gemini."""
    if feature_key not in FEATURE_CONFIGS:
        raise ValueError(f"Unsupported AI feature: {feature_key}")
    if feature_key not in MULTI_PROVIDER_FEATURES:
        return PROVIDER_GEMINI, await get_effective_model_for_feature(db, feature_key)

    row = await db.scalar(
        select(AdminAIModelSetting).where(AdminAIModelSetting.feature_key == feature_key)
    )
    if row and row.provider in PROVIDERS and provider_allows_model(row.provider, row.model_name):
        model = _normalize_model_name(row.model_name) if row.provider == PROVIDER_GEMINI else row.model_name.strip()
        return row.provider, model
    return PROVIDER_GEMINI, _resolve_default_model(feature_key)


async def get_provider_credentials(db: AsyncSession, provider: str) -> tuple[str | None, str | None]:
    cfg = PROVIDERS.get(provider)
    if not cfg:
        raise ValueError(f"Unsupported provider: {provider}")
    row = await db.scalar(select(AiProviderCredential).where(AiProviderCredential.provider == provider))
    api_key = (row.api_key if row and row.api_key else None) or os.getenv(cfg["env_key"])
    base_url = (row.base_url if row and row.base_url else None) or cfg["base_url"]
    return api_key, base_url


async def set_provider_credential(
    db: AsyncSession,
    provider: str,
    api_key: str | None,
    base_url: str | None,
    admin_id: int,
) -> None:
    if provider not in PROVIDERS:
        raise ValueError(f"Unsupported provider: {provider}")
    row = await db.scalar(select(AiProviderCredential).where(AiProviderCredential.provider == provider))
    if row is None:
        row = AiProviderCredential(provider=provider)
        db.add(row)
    if api_key:  # bỏ trống = giữ key cũ
        row.api_key = api_key.strip()
    if base_url is not None:
        row.base_url = base_url.strip() or None
    row.updated_by_admin_id = admin_id


async def get_all_provider_status(db: AsyncSession) -> list[dict]:
    rows = {r.provider: r for r in (await db.execute(select(AiProviderCredential))).scalars().all()}
    out = []
    for provider, cfg in PROVIDERS.items():
        row = rows.get(provider)
        key = (row.api_key if row and row.api_key else None) or os.getenv(cfg["env_key"])
        out.append({
            "provider": provider,
            "label": cfg["label"],
            "configured": bool(key),
            "key_last4": key[-4:] if key else None,
            "base_url": (row.base_url if row and row.base_url else None) or cfg["base_url"],
            "models": list(cfg["models"]),
        })
    return out


async def get_all_effective_model_settings(db: AsyncSession) -> list[dict]:
    rows = (await db.execute(select(AdminAIModelSetting))).scalars().all()
    by_feature = {r.feature_key: r for r in rows}

    result: list[dict] = []
    for feature_key, config in FEATURE_CONFIGS.items():
        row = by_feature.get(feature_key)
        provider = PROVIDER_GEMINI
        model_name = _resolve_default_model(feature_key)
        if row:
            if feature_key in MULTI_PROVIDER_FEATURES and row.provider in PROVIDERS and provider_allows_model(row.provider, row.model_name):
                provider = row.provider
                model_name = row.model_name if row.provider != PROVIDER_GEMINI else _normalize_model_name(row.model_name)
            else:
                normalized = _normalize_model_name(row.model_name)
                if normalized in ALLOWED_GEMINI_MODELS:
                    model_name = normalized
        available = list(PROVIDERS) if feature_key in MULTI_PROVIDER_FEATURES else [PROVIDER_GEMINI]
        result.append({
            "feature_key": feature_key,
            "feature_label": config["label"],
            "description": config["description"],
            "provider": provider,
            "model_name": model_name,
            "available_providers": [{"value": p, "label": PROVIDERS[p]["label"]} for p in available],
            "models_by_provider": {p: list(PROVIDERS[p]["models"]) for p in available},
        })

    return result


async def upsert_model_settings(
    db: AsyncSession,
    settings_updates: dict[str, dict],
    updated_by_admin_id: int,
) -> None:
    if not settings_updates:
        return
    for feature_key, item in settings_updates.items():
        if feature_key not in FEATURE_CONFIGS:
            raise ValueError(f"Unsupported AI feature: {feature_key}")
        provider = item.get("provider") or PROVIDER_GEMINI
        model_name = item.get("model_name") or ""
        if feature_key not in MULTI_PROVIDER_FEATURES and provider != PROVIDER_GEMINI:
            raise ValueError(f"Feature '{feature_key}' chỉ hỗ trợ Gemini")
        if provider not in PROVIDERS:
            raise ValueError(f"Nhà cung cấp không hợp lệ: {provider}")
        if not provider_allows_model(provider, model_name):
            raise ValueError(f"Model '{model_name}' không hợp lệ cho {provider}")
        stored_model = _normalize_model_name(model_name) if provider == PROVIDER_GEMINI else model_name.strip()
        existing = await db.scalar(select(AdminAIModelSetting).where(AdminAIModelSetting.feature_key == feature_key))
        if existing:
            existing.provider = provider
            existing.model_name = stored_model
            existing.updated_by_admin_id = updated_by_admin_id
        else:
            db.add(AdminAIModelSetting(feature_key=feature_key, provider=provider, model_name=stored_model, updated_by_admin_id=updated_by_admin_id))

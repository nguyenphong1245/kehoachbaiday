# Đa nhà cung cấp AI cho KG-LPV — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho 4 feature LLM của KG-LPV (tách đoạn, N2, N3, sửa) chọn được nhà cung cấp AI (Gemini/OpenAI/DeepSeek) + model riêng từng feature, với API key quản lý ẩn trên trang admin.

**Architecture:** Thêm cột `provider` vào `admin_ai_model_settings` + bảng `ai_provider_credentials` (key ẩn). Registry mở rộng thành đa provider; `kg_lpv/llm.generate_json` dispatch Gemini (google-generativeai) hoặc OpenAI/DeepSeek (SDK `openai`, khác `base_url`). Trang admin thêm section khóa API + dropdown provider mỗi feature KG-LPV.

**Tech Stack:** FastAPI + async SQLAlchemy + Alembic + pytest (backend); React + Vite + TS + vitest (frontend); `google-generativeai` + `openai` SDK.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-06-kg-lpv-multi-provider-ai-design.md`.
- Real git root `d:\KL\WEB1`; git via `git -C d:/KL/WEB1`. KHÔNG stage `.superpowers/`. Bỏ qua repo lồng `init/.git`.
- Mọi lệnh test FOREGROUND; `tests/kg_lpv/` phải tự thoát (không treo). Mock genai + mock `openai` — không gọi mạng thật.
- Chỉ 4 feature KG-LPV được đổi provider: `kg_lpv_segmentation`, `kg_lpv_n2_critic`, `kg_lpv_n3_judge`, `kg_lpv_repair`. Feature khác **giữ nguyên** khóa Gemini.
- Providers: `gemini`, `openai`, `deepseek`. DeepSeek base_url `https://api.deepseek.com`.
- API **không bao giờ** trả API key đầy đủ — chỉ `key_last4` + trạng thái. Ô nhập key write-only.
- Key lưu plaintext trong DB (giới hạn đã chấp nhận). Không mã hóa at-rest.
- Chuỗi người dùng tiếng Việt. Log backend `kg_lpv.<action> key=value` / `admin.<action>`.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.

---

## File Structure

| File | Trách nhiệm | Task |
|---|---|---|
| `init/backend/app/models/admin_ai_model_setting.py` | +cột `provider` | MP1 |
| `init/backend/app/models/ai_provider_credential.py` | bảng key provider (mới) | MP1 |
| `init/backend/alembic/versions/050_*.py` | migration 2 thay đổi | MP1 |
| `init/backend/app/db/base.py` | đăng ký model mới | MP1 |
| `init/backend/app/services/admin_ai_model_registry.py` | PROVIDERS + hàm provider/model/credential | MP2 |
| `init/backend/app/api/routes/admin.py` | caller upsert (build shape mới) | MP2; providers endpoints | MP4 |
| `init/backend/app/schemas/admin.py` | +provider fields + provider schemas | MP2/MP4 |
| `init/backend/app/modules/kg_lpv/llm.py` | dispatch đa provider | MP3 |
| `init/backend/requirements.txt` | +`openai` | MP3 |
| `init/frontend/src/services/adminService.ts` + types | API providers + model settings +provider | MP5 |
| `init/frontend/src/pages/admin/AdminAIModelsPage.tsx` | UI key cards + provider dropdown | MP5 |

Thứ tự: MP1 → MP2 → MP3 → MP4 → MP5.

---

## Task MP1: Dữ liệu — cột `provider` + bảng `ai_provider_credentials`

**Files:**
- Modify: `init/backend/app/models/admin_ai_model_setting.py`
- Create: `init/backend/app/models/ai_provider_credential.py`
- Create: `init/backend/alembic/versions/050_ai_provider_and_model_provider.py`
- Modify: `init/backend/app/db/base.py` (`load_all_models`)
- Test: `init/backend/tests/kg_lpv/test_multi_provider_model.py`

**Interfaces:**
- Produces: `AdminAIModelSetting.provider` (str, default `"gemini"`); `AiProviderCredential{provider, api_key, base_url, updated_by_admin_id, updated_at}`.

- [ ] **Step 1: Thêm cột `provider` vào model**

`app/models/admin_ai_model_setting.py` — thêm sau `model_name`:
```python
    provider: str = Column(String(20), nullable=False, server_default="gemini")
```

- [ ] **Step 2: Tạo model `AiProviderCredential`**

Create `app/models/ai_provider_credential.py`:
```python
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func

from app.db.base import Base


class AiProviderCredential(Base):
    __tablename__ = "ai_provider_credentials"

    provider: str = Column(String(20), primary_key=True)  # gemini | openai | deepseek
    api_key: str | None = Column(Text, nullable=True)
    base_url: str | None = Column(String(255), nullable=True)
    updated_by_admin_id: int | None = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
```

- [ ] **Step 3: Đăng ký trong `load_all_models`**

`app/db/base.py` — thêm dòng import trong `load_all_models()`:
```python
    import app.models.ai_provider_credential  # noqa: F401
```
(`admin_ai_model_setting` đã được import sẵn.)

- [ ] **Step 4: Migration 050**

Create `alembic/versions/050_ai_provider_and_model_provider.py` (theo style `049`, `down_revision="049"`):
```python
"""Add provider to admin_ai_model_settings + create ai_provider_credentials."""
from alembic import op
import sqlalchemy as sa

revision = "050"
down_revision = "049"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "admin_ai_model_settings",
        sa.Column("provider", sa.String(length=20), nullable=False, server_default="gemini"),
    )
    op.create_table(
        "ai_provider_credentials",
        sa.Column("provider", sa.String(length=20), primary_key=True),
        sa.Column("api_key", sa.Text(), nullable=True),
        sa.Column("base_url", sa.String(length=255), nullable=True),
        sa.Column("updated_by_admin_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("ai_provider_credentials")
    op.drop_column("admin_ai_model_settings", "provider")
```

- [ ] **Step 5: Test model import + migration import**

Create `tests/kg_lpv/test_multi_provider_model.py`:
```python
def test_models_import_and_have_expected_columns():
    from app.models.admin_ai_model_setting import AdminAIModelSetting
    from app.models.ai_provider_credential import AiProviderCredential
    assert "provider" in AdminAIModelSetting.__table__.columns
    assert AdminAIModelSetting.__table__.columns["provider"].server_default is not None
    cols = set(AiProviderCredential.__table__.columns.keys())
    assert {"provider", "api_key", "base_url", "updated_by_admin_id", "updated_at"} <= cols
    assert AiProviderCredential.__table__.primary_key.columns.keys() == ["provider"]


def test_migration_050_imports():
    import importlib
    m = importlib.import_module("alembic.versions.050_ai_provider_and_model_provider")
    assert m.down_revision == "049"
```

- [ ] **Step 6: Chạy test**

Run (từ `init/backend`): `python -m pytest tests/kg_lpv/test_multi_provider_model.py -q -W ignore`
Expected: PASS. Rồi `python -c "import app.main"` → OK.

- [ ] **Step 7: Commit**

```bash
git -C d:/KL/WEB1 add init/backend/app/models/admin_ai_model_setting.py init/backend/app/models/ai_provider_credential.py init/backend/alembic/versions/050_ai_provider_and_model_provider.py init/backend/app/db/base.py init/backend/tests/kg_lpv/test_multi_provider_model.py
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): add provider column + ai_provider_credentials table (migration 050)"
```

---

## Task MP2: Registry đa provider + caller upsert

**Files:**
- Modify: `init/backend/app/services/admin_ai_model_registry.py`
- Modify: `init/backend/app/api/routes/admin.py` (`update_ai_model_settings` build shape mới — giữ app chạy)
- Modify: `init/backend/app/schemas/admin.py` (`AIModelFeatureSetting` +`provider`)
- Test: `init/backend/tests/kg_lpv/test_provider_registry.py`

**Interfaces:**
- Consumes: `AdminAIModelSetting` (+provider), `AiProviderCredential` (MP1), `FEATURE_CONFIGS`, `ALLOWED_GEMINI_MODELS`, `_normalize_model_name`, `_resolve_default_model`.
- Produces:
  - `PROVIDERS: dict[str, dict]`, `MULTI_PROVIDER_FEATURES: set[str]`
  - `provider_allows_model(provider: str, model: str) -> bool`
  - `get_effective_provider_model(db, feature_key) -> tuple[str, str]`  # (provider, model)
  - `get_provider_credentials(db, provider) -> tuple[str|None, str|None]`  # (api_key, base_url)
  - `set_provider_credential(db, provider, api_key: str|None, base_url: str|None, admin_id: int) -> None`
  - `get_all_provider_status(db) -> list[dict]`  # {provider, label, configured, key_last4, base_url}
  - `get_all_effective_model_settings(db)` giờ mỗi item thêm `provider`, `available_providers`, `models_by_provider`
  - `upsert_model_settings(db, updates: dict[str, dict], admin_id)`  # updates[feature] = {"provider","model_name"}

- [ ] **Step 1: Thêm PROVIDERS + hằng số**

`admin_ai_model_registry.py` — thêm sau `MODEL_ALIASES`:
```python
import os
from app.models.ai_provider_credential import AiProviderCredential

PROVIDER_GEMINI = "gemini"
PROVIDER_OPENAI = "openai"
PROVIDER_DEEPSEEK = "deepseek"

PROVIDERS: dict[str, dict] = {
    PROVIDER_GEMINI: {"label": "Google Gemini", "models": ALLOWED_GEMINI_MODELS, "base_url": None, "env_key": "GEMINI_API_KEY"},
    PROVIDER_OPENAI: {"label": "OpenAI", "models": ("gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini"), "base_url": None, "env_key": "OPENAI_API_KEY"},
    PROVIDER_DEEPSEEK: {"label": "DeepSeek", "models": ("deepseek-chat", "deepseek-reasoner"), "base_url": "https://api.deepseek.com", "env_key": "DEEPSEEK_API_KEY"},
}

MULTI_PROVIDER_FEATURES: set[str] = {
    FEATURE_KG_LPV_SEGMENTATION, FEATURE_KG_LPV_N2_CRITIC, FEATURE_KG_LPV_N3_JUDGE, FEATURE_KG_LPV_REPAIR,
}
```

- [ ] **Step 2: Thêm validate + resolve provider/model**

```python
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
```

- [ ] **Step 3: Credentials**

```python
async def get_provider_credentials(db: AsyncSession, provider: str) -> tuple[str | None, str | None]:
    cfg = PROVIDERS.get(provider)
    if not cfg:
        raise ValueError(f"Unsupported provider: {provider}")
    row = await db.scalar(select(AiProviderCredential).where(AiProviderCredential.provider == provider))
    api_key = (row.api_key if row and row.api_key else None) or os.getenv(cfg["env_key"])
    base_url = (row.base_url if row and row.base_url else None) or cfg["base_url"]
    return api_key, base_url


async def set_provider_credential(db, provider, api_key, base_url, admin_id) -> None:
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


async def get_all_provider_status(db) -> list[dict]:
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
```

- [ ] **Step 4: Cập nhật `get_all_effective_model_settings` + `upsert_model_settings`**

`get_all_effective_model_settings` — mỗi item thêm:
```python
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
```

`upsert_model_settings` — đổi chữ ký + validate:
```python
async def upsert_model_settings(db, settings_updates: dict[str, dict], updated_by_admin_id: int) -> None:
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
```

- [ ] **Step 5: Giữ admin.py chạy + schema `provider`**

`app/schemas/admin.py` — `AIModelFeatureSetting` thêm các trường:
```python
class AIModelFeatureSetting(BaseModel):
    feature_key: str
    feature_label: str
    description: str
    provider: str = "gemini"
    model_name: str
    available_providers: list[dict] = []
    models_by_provider: dict[str, list[str]] = {}
```

`app/api/routes/admin.py` `update_ai_model_settings` — đổi build `updates` (schema PUT chưa có provider ở MP2 → mặc định gemini):
```python
    updates = {item.feature_key: {"provider": getattr(item, "provider", "gemini") or "gemini", "model_name": item.model_name} for item in payload.settings}
```

- [ ] **Step 6: Test registry**

Create `tests/kg_lpv/test_provider_registry.py` (dùng `db_session` fixture của conftest):
```python
import os
import pytest
from app.models.admin_ai_model_setting import AdminAIModelSetting
from app.models.ai_provider_credential import AiProviderCredential
from app.services import admin_ai_model_registry as reg


def test_provider_allows_model():
    assert reg.provider_allows_model("openai", "gpt-4o")
    assert reg.provider_allows_model("deepseek", "deepseek-chat")
    assert reg.provider_allows_model("gemini", "gemini-2.5-pro")
    assert not reg.provider_allows_model("openai", "gemini-2.5-pro")
    assert not reg.provider_allows_model("bogus", "x")


async def test_effective_provider_model_defaults_gemini(db_session):
    p, m = await reg.get_effective_provider_model(db_session, reg.FEATURE_KG_LPV_N3_JUDGE)
    assert p == "gemini" and m  # default

async def test_effective_provider_model_reads_row(db_session):
    db_session.add(AdminAIModelSetting(feature_key=reg.FEATURE_KG_LPV_SEGMENTATION, provider="openai", model_name="gpt-4o-mini"))
    await db_session.flush()
    p, m = await reg.get_effective_provider_model(db_session, reg.FEATURE_KG_LPV_SEGMENTATION)
    assert (p, m) == ("openai", "gpt-4o-mini")

async def test_non_kglpv_feature_forced_gemini(db_session):
    p, _ = await reg.get_effective_provider_model(db_session, reg.FEATURE_LESSON_PLAN_GENERATION)
    assert p == "gemini"

async def test_credentials_db_then_env(db_session, monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "env-key")
    k, b = await reg.get_provider_credentials(db_session, "openai")
    assert k == "env-key" and b is None
    db_session.add(AiProviderCredential(provider="openai", api_key="db-key-abcd"))
    await db_session.flush()
    k, b = await reg.get_provider_credentials(db_session, "openai")
    assert k == "db-key-abcd"
    k2, b2 = await reg.get_provider_credentials(db_session, "deepseek")
    assert b2 == "https://api.deepseek.com"

async def test_status_masks_key(db_session):
    db_session.add(AiProviderCredential(provider="openai", api_key="secret12345"))
    await db_session.flush()
    st = {s["provider"]: s for s in await reg.get_all_provider_status(db_session)}
    assert st["openai"]["configured"] and st["openai"]["key_last4"] == "2345"
    assert "secret12345" not in str(st)

async def test_upsert_rejects_bad_model_and_non_kglpv_provider(db_session):
    with pytest.raises(ValueError):
        await reg.upsert_model_settings(db_session, {reg.FEATURE_KG_LPV_REPAIR: {"provider": "openai", "model_name": "nope"}}, 1)
    with pytest.raises(ValueError):
        await reg.upsert_model_settings(db_session, {reg.FEATURE_LESSON_PLAN_GENERATION: {"provider": "openai", "model_name": "gpt-4o"}}, 1)
```
(Nếu conftest chưa bật asyncio auto cho file mới, thêm `pytestmark = pytest.mark.asyncio` — kiểm tra cách các test async khác trong `tests/kg_lpv/` khai báo.)

- [ ] **Step 7: Chạy test + xác nhận app import**

Run: `python -m pytest tests/kg_lpv/test_provider_registry.py -q -W ignore` → PASS.
Run: `python -m pytest tests/kg_lpv/ -q -W ignore` → tất cả PASS, thoát sạch.
Run: `python -c "import app.main"` → OK.

- [ ] **Step 8: Commit**

```bash
git -C d:/KL/WEB1 add init/backend/app/services/admin_ai_model_registry.py init/backend/app/api/routes/admin.py init/backend/app/schemas/admin.py init/backend/tests/kg_lpv/test_provider_registry.py
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): multi-provider registry (providers, credentials, per-feature provider+model)"
```

---

## Task MP3: LLM dispatch đa provider

**Files:**
- Modify: `init/backend/app/modules/kg_lpv/llm.py`
- Modify: `init/backend/requirements.txt` (+`openai`)
- Test: `init/backend/tests/kg_lpv/test_llm_dispatch.py`

**Interfaces:**
- Consumes: `get_effective_provider_model`, `get_provider_credentials`, `PROVIDER_GEMINI` (MP2); `response_parser`.
- Produces: `generate_json(db, feature_key, prompt, *, timeout=300) -> tuple[dict, int]` (chữ ký KHÔNG đổi) nhưng dispatch theo provider.

- [ ] **Step 1: Thêm `openai` vào requirements**

`init/backend/requirements.txt` — thêm dòng:
```
openai>=1.30
```

- [ ] **Step 2: Viết test dispatch (mock cả 2 SDK)**

Create `tests/kg_lpv/test_llm_dispatch.py`:
```python
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.modules.kg_lpv import llm

pytestmark = pytest.mark.asyncio


async def test_gemini_path(db_session, monkeypatch):
    async def fake_eff(db, fk): return ("gemini", "gemini-2.5-flash")
    async def fake_cred(db, p): return ("gk", None)
    monkeypatch.setattr(llm, "get_effective_provider_model", fake_eff)
    monkeypatch.setattr(llm, "get_provider_credentials", fake_cred)
    resp = MagicMock(); resp.text = '{"ok": 1}'; resp.usage_metadata = MagicMock(total_token_count=12)
    model = MagicMock(); model.generate_content = MagicMock(return_value=resp)
    with patch.object(llm, "_build_gemini_model", return_value=model):
        data, tokens = await llm.generate_json(db_session, "kg_lpv_segmentation", "prompt")
    assert data == {"ok": 1} and tokens == 12


async def test_openai_path(db_session, monkeypatch):
    async def fake_eff(db, fk): return ("openai", "gpt-4o-mini")
    async def fake_cred(db, p): return ("ok-key", None)
    monkeypatch.setattr(llm, "get_effective_provider_model", fake_eff)
    monkeypatch.setattr(llm, "get_provider_credentials", fake_cred)
    msg = MagicMock(); msg.content = '{"ok": 2}'
    choice = MagicMock(); choice.message = msg
    completion = MagicMock(); completion.choices = [choice]; completion.usage = MagicMock(total_tokens=34)
    client = MagicMock(); client.chat.completions.create = AsyncMock(return_value=completion)
    with patch.object(llm, "_build_openai_client", return_value=client):
        data, tokens = await llm.generate_json(db_session, "kg_lpv_n3_judge", "prompt")
    assert data == {"ok": 2} and tokens == 34


async def test_missing_key_raises(db_session, monkeypatch):
    async def fake_eff(db, fk): return ("openai", "gpt-4o")
    async def fake_cred(db, p): return (None, None)
    monkeypatch.setattr(llm, "get_effective_provider_model", fake_eff)
    monkeypatch.setattr(llm, "get_provider_credentials", fake_cred)
    with pytest.raises(RuntimeError):
        await llm.generate_json(db_session, "kg_lpv_repair", "prompt")
```

- [ ] **Step 3: Chạy test — FAIL**

Run: `python -m pytest tests/kg_lpv/test_llm_dispatch.py -q -W ignore`
Expected: FAIL (`_build_gemini_model`/`_build_openai_client`/dispatch chưa có).

- [ ] **Step 4: Hiện thực dispatch trong `llm.py`**

Đổi import + tách builder, viết lại `generate_json`:
```python
from app.services.admin_ai_model_registry import (
    get_effective_provider_model, get_provider_credentials, PROVIDER_GEMINI,
)

def _build_gemini_model(model_name: str, api_key: str):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config={"temperature": _TEMPERATURE, "response_mime_type": "application/json"},
    )

def _build_openai_client(api_key: str, base_url: str | None):
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=api_key, base_url=base_url) if base_url else AsyncOpenAI(api_key=api_key)
```

`generate_json` (thay `_build_model` cũ — xóa hàm cũ, giữ `_extract_tokens`, `_parse_json`, `LlmJsonError`):
```python
async def generate_json(db, feature_key, prompt, *, timeout=300) -> tuple[dict, int]:
    provider, model_name = await get_effective_provider_model(db, feature_key)
    api_key, base_url = await get_provider_credentials(db, provider)
    if not api_key:
        raise RuntimeError(f"Thiếu API key cho nhà cung cấp: {provider}")

    total_tokens = 0
    last_error: Exception | None = None
    for attempt in range(_MAX_ATTEMPTS):
        if provider == PROVIDER_GEMINI:
            model = _build_gemini_model(model_name, api_key)
            loop = asyncio.get_running_loop()
            response = await asyncio.wait_for(loop.run_in_executor(None, model.generate_content, prompt), timeout=timeout)
            total_tokens += _extract_tokens(response)
            raw = (response.text or "").strip()
        else:
            client = _build_openai_client(api_key, base_url)
            completion = await asyncio.wait_for(
                client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=_TEMPERATURE,
                    response_format={"type": "json_object"},
                ),
                timeout=timeout,
            )
            total_tokens += (getattr(completion.usage, "total_tokens", 0) or 0) if completion.usage else 0
            raw = (completion.choices[0].message.content or "").strip()
        try:
            return _parse_json(raw), total_tokens
        except json.JSONDecodeError as exc:
            last_error = exc
            logger.warning("kg_lpv.llm.json_parse_failed feature_key=%s provider=%s attempt=%d error=%s", feature_key, provider, attempt + 1, exc)
    raise LlmJsonError(f"AI trả về JSON không hợp lệ cho feature '{feature_key}' ({provider}) sau {_MAX_ATTEMPTS} lượt: {last_error}")
```
Cập nhật docstring đầu file (bỏ "chỉ Gemini"). Xóa `_build_model` cũ + import `get_effective_model_for_feature` không còn dùng ở llm.py.

- [ ] **Step 5: Chạy test — PASS + không hồi quy**

Run: `python -m pytest tests/kg_lpv/test_llm_dispatch.py -q -W ignore` → PASS.
Run: `python -m pytest tests/kg_lpv/ -q -W ignore` → tất cả PASS, thoát sạch (các test verify/n2/n3 mock `generate_json` nên không đụng dispatch thật).
Run: `python -c "import app.main"` → OK.

- [ ] **Step 6: Commit**

```bash
git -C d:/KL/WEB1 add init/backend/app/modules/kg_lpv/llm.py init/backend/requirements.txt init/backend/tests/kg_lpv/test_llm_dispatch.py
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): generate_json dispatches Gemini/OpenAI/DeepSeek by provider"
```

---

## Task MP4: API admin — providers + model settings có provider

**Files:**
- Modify: `init/backend/app/schemas/admin.py`
- Modify: `init/backend/app/api/routes/admin.py`
- Test: `init/backend/tests/kg_lpv/test_provider_api.py`

**Interfaces:**
- Consumes: `get_all_provider_status`, `set_provider_credential`, `PROVIDERS`, `upsert_model_settings`, `get_all_effective_model_settings` (MP2).
- Produces:
  - `GET /api/v1/admin/ai-providers` → `list[AiProviderStatus]`
  - `PUT /api/v1/admin/ai-providers/{provider}` body `AiProviderUpdate{api_key?, base_url?}` → `AiProviderStatus`
  - `PUT /admin/ai-model-settings` item nhận `provider`
  - `GET /admin/ai-model-settings` trả `provider`, `available_providers`, `models_by_provider` (đã có ở MP2 schema)

- [ ] **Step 1: Schemas**

`app/schemas/admin.py` — thêm `provider` vào update item + schemas provider:
```python
class AIModelSettingUpdateItem(BaseModel):
    feature_key: str
    provider: str = "gemini"
    model_name: str

class AiProviderStatus(BaseModel):
    provider: str
    label: str
    configured: bool
    key_last4: str | None = None
    base_url: str | None = None
    models: list[str] = []

class AiProviderUpdate(BaseModel):
    api_key: str | None = None
    base_url: str | None = None
```

- [ ] **Step 2: Viết test API — FAIL trước**

Create `tests/kg_lpv/test_provider_api.py` (dùng fixture `admin_user`, client admin theo mẫu `test_admin.py`/`test_toggle.py`; đọc các file đó để lấy đúng cách tạo client admin + auth):
```python
import pytest
pytestmark = pytest.mark.asyncio

async def test_get_providers_masked(admin_client):
    r = await admin_client.get("/api/v1/admin/ai-providers")
    assert r.status_code == 200
    provs = {p["provider"]: p for p in r.json()}
    assert set(provs) == {"gemini", "openai", "deepseek"}
    assert "api_key" not in provs["openai"]  # không trả full key

async def test_put_provider_sets_key_masked(admin_client):
    r = await admin_client.put("/api/v1/admin/ai-providers/openai", json={"api_key": "sk-testkey7788"})
    assert r.status_code == 200
    assert r.json()["configured"] is True and r.json()["key_last4"] == "7788"

async def test_put_provider_invalid(admin_client):
    r = await admin_client.put("/api/v1/admin/ai-providers/bogus", json={"api_key": "x"})
    assert r.status_code in (400, 404)

async def test_put_model_settings_with_provider(admin_client):
    r = await admin_client.put("/api/v1/admin/ai-model-settings", json={"settings": [
        {"feature_key": "kg_lpv_n3_judge", "provider": "openai", "model_name": "gpt-4o"}]})
    assert r.status_code == 200
    row = next(s for s in r.json()["settings"] if s["feature_key"] == "kg_lpv_n3_judge")
    assert row["provider"] == "openai" and row["model_name"] == "gpt-4o"

async def test_non_admin_forbidden(kg_lpv_client, teacher_user):
    r = await kg_lpv_client.get("/api/v1/admin/ai-providers")
    assert r.status_code in (401, 403)
```
(Nếu không có `admin_client` fixture, tạo trong file test theo mẫu tạo `admin_user` + `AsyncClient` như các test admin hiện có.)

- [ ] **Step 3: Chạy test — FAIL**

Run: `python -m pytest tests/kg_lpv/test_provider_api.py -q -W ignore`
Expected: FAIL (endpoints chưa có).

- [ ] **Step 4: Endpoints trong `admin.py`**

Import thêm: `get_all_provider_status, set_provider_credential, PROVIDERS` từ registry; `AiProviderStatus, AiProviderUpdate` từ schemas. Sửa `update_ai_model_settings` build `updates` dùng `item.provider`:
```python
    updates = {item.feature_key: {"provider": item.provider, "model_name": item.model_name} for item in payload.settings}
```
Thêm 2 endpoint:
```python
@router.get("/ai-providers", response_model=list[AiProviderStatus], dependencies=[Depends(require_admin)])
@limiter.limit("30/minute")
async def get_ai_providers(request: Request, session: AsyncSession = Depends(get_db)):
    return await get_all_provider_status(session)


@router.put("/ai-providers/{provider}", response_model=AiProviderStatus, dependencies=[Depends(require_admin)])
@limiter.limit("10/minute")
async def update_ai_provider(request: Request, provider: str, payload: AiProviderUpdate,
                             current_user: User = Depends(get_current_user), session: AsyncSession = Depends(get_db)):
    if provider not in PROVIDERS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Nhà cung cấp không hợp lệ: {provider}")
    await set_provider_credential(session, provider, payload.api_key, payload.base_url, current_user.id)
    await session.commit()
    logger.info("admin.ai_provider_updated provider=%s by=%s", provider, current_user.id)
    statuses = {s["provider"]: s for s in await get_all_provider_status(session)}
    return statuses[provider]
```

- [ ] **Step 5: Chạy test — PASS**

Run: `python -m pytest tests/kg_lpv/test_provider_api.py -q -W ignore` → PASS.
Run: `python -m pytest tests/kg_lpv/ tests/test_admin.py -q -W ignore` → PASS, thoát sạch.

- [ ] **Step 6: Commit**

```bash
git -C d:/KL/WEB1 add init/backend/app/schemas/admin.py init/backend/app/api/routes/admin.py init/backend/tests/kg_lpv/test_provider_api.py
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): admin API for AI providers (keys masked) + provider in model settings"
```

---

## Task MP5: Frontend — thẻ khóa API + dropdown provider

**Files:**
- Modify: `init/frontend/src/services/adminService.ts` (+ types trong `services`/`types`)
- Modify: `init/frontend/src/pages/admin/AdminAIModelsPage.tsx`
- Test: `init/frontend/src/__tests__/admin/AdminAIModels.test.tsx` (tạo mới nếu chưa có)

**Interfaces:**
- Consumes: endpoints MP4.
- Produces: `getAiProviders()`, `updateAiProvider(provider, body)`; model-settings types với `provider`, `available_providers`, `models_by_provider`.

- [ ] **Step 1: Service + types**

`adminService.ts` — thêm:
```typescript
export interface AiProviderStatus { provider: string; label: string; configured: boolean; key_last4?: string | null; base_url?: string | null; models: string[]; }
export interface AiProviderUpdate { api_key?: string; base_url?: string; }

export const getAiProviders = async (): Promise<AiProviderStatus[]> => {
  const { data } = await api.get<AiProviderStatus[]>("/admin/ai-providers");
  return data;
};
export const updateAiProvider = async (provider: string, body: AiProviderUpdate): Promise<AiProviderStatus> => {
  const { data } = await api.put<AiProviderStatus>(`/admin/ai-providers/${provider}`, body);
  return data;
};
```
Cập nhật type của model-settings item (nơi khai báo `AIModelFeatureSetting`/tương đương): thêm `provider: string`, `available_providers: {value:string;label:string}[]`, `models_by_provider: Record<string,string[]>`. `updateAIModelSettings` gửi thêm `provider` mỗi item.

- [ ] **Step 2: UI — section khóa API**

`AdminAIModelsPage.tsx` — thêm state `providers` + `useEffect` gọi `getAiProviders()`. Render một card mỗi provider: nhãn, badge trạng thái (`configured ? "Đã cấu hình ····"+key_last4 : "Chưa cấu hình"`), ô input key write-only (`type="password"`, placeholder "Nhập key mới để thay, bỏ trống = giữ nguyên"), ô base_url (chỉ hiện cho deepseek/openai, prefill `base_url`), nút "Lưu" gọi `updateAiProvider(provider, {api_key: keyInput || undefined, base_url})` rồi refresh trạng thái. Match card/toggle styling hiện có của trang.

- [ ] **Step 3: UI — dropdown provider mỗi feature KG-LPV**

Trong vòng render `aiModelSettings.settings`: nếu `item.available_providers.length > 1`, render `<select>` provider (options = `available_providers`) trước `<select>` model; khi đổi provider → cập nhật model = phần tử đầu của `models_by_provider[newProvider]` nếu model hiện tại không thuộc list; `<select>` model dùng options `item.models_by_provider[item.provider]` thay cho `allowed_models` toàn cục. Lưu gửi `{feature_key, provider, model_name}`. Feature không đa provider giữ nguyên (chỉ model Gemini).

- [ ] **Step 4: Test (vitest)**

Create `src/__tests__/admin/AdminAIModels.test.tsx` — mock `@/services/adminService`:
- `getAiProviders` trả 3 provider (openai configured, key_last4 "7788") → card OpenAI hiện "Đã cấu hình ····7788"; nhập key + Lưu → `updateAiProvider("openai", {api_key: "..."} )` được gọi.
- feature `kg_lpv_n3_judge` có `available_providers=[gemini,openai,deepseek]` → đổi `<select>` provider sang "openai" → options model đổi thành `models_by_provider.openai`.
Match style test admin/hook hiện có; mock service, không gọi mạng.

- [ ] **Step 5: Verify**

Run (từ `init/frontend`): `npm run test -- --run src/__tests__/admin/AdminAIModels.test.tsx` → PASS.
Run: `npx tsc --noEmit` → 0 lỗi ở file đã đổi.
Run: `npm run test -- --run src/__tests__/kg-lpv` → không hồi quy.

- [ ] **Step 6: Commit**

```bash
git -C d:/KL/WEB1 add init/frontend/src/services/adminService.ts init/frontend/src/pages/admin/AdminAIModelsPage.tsx init/frontend/src/__tests__/admin/AdminAIModels.test.tsx
git -C d:/KL/WEB1 commit -m "feat(kg-lpv): admin UI for AI provider keys + per-feature provider dropdown"
```

---

## Self-Review (đối chiếu spec)

- ✅ §4.1 dữ liệu (provider column + ai_provider_credentials + migration 050) → MP1.
- ✅ §4.2 registry (PROVIDERS, get_effective_provider_model, get_provider_credentials, set_provider_credential, get_all_provider_status, upsert mới) → MP2.
- ✅ §4.3 llm dispatch + openai requirement → MP3.
- ✅ §4.4 API admin (ai-model-settings +provider, ai-providers GET/PUT masked) → MP2 (schema/GET) + MP4 (endpoints/PUT provider).
- ✅ §4.5 giữ get_effective_model_for_feature cho non-KG-LPV → MP2 (get_effective_provider_model gọi lại nó cho feature ngoài KG-LPV).
- ✅ §5 frontend (key cards + provider dropdown) → MP5.
- ✅ §6 xử lý lỗi (thiếu key → RuntimeError → job failed) → MP3 (raise) + cơ chế orchestrator sẵn có.
- ✅ §7 test backend + frontend → mỗi task có test.
- ✅ §8 YAGNI (non-KG-LPV gemini-only, không mã hóa, không per-user) → MULTI_PROVIDER_FEATURES giới hạn + upsert từ chối provider≠gemini cho feature ngoài.
- Type consistency: `get_effective_provider_model -> (provider, model)` dùng nhất quán MP2→MP3; `upsert_model_settings(db, dict[str,dict], admin_id)` dùng nhất quán MP2(caller)→MP4(caller); schema `provider`/`available_providers`/`models_by_provider` khớp FE MP5.

## Ghi chú rủi ro thực thi
- **openai chưa cài trong image/venv**: MP3 thêm requirements; test mock nên chạy được không cần cài, nhưng chạy thật cần `pip install` / rebuild backend image.
- **conftest asyncio**: kiểm cách các test async trong `tests/kg_lpv/` khai báo (auto mode hay `pytest.mark.asyncio`) và theo đúng để test mới không bị skip.
- **admin_client fixture**: có thể chưa tồn tại — tạo theo mẫu tạo `admin_user` + `AsyncClient` trong `tests/test_admin.py`/`tests/kg_lpv/test_toggle.py`.
- **DB migration khi deploy**: sau merge, chạy `alembic upgrade head` (SKIP_MIGRATIONS=true đang bật) để áp 050.

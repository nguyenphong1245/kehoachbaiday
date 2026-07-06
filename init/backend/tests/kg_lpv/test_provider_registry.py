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

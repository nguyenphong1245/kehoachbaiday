"""Test dispatch đa provider của generate_json (gemini vs openai/deepseek)."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.modules.kg_lpv import llm

pytestmark = pytest.mark.asyncio


async def test_gemini_path(db_session, monkeypatch):
    async def fake_eff(db, fk):
        return ("gemini", "gemini-2.5-flash")

    async def fake_cred(db, p):
        return ("gk", None)

    monkeypatch.setattr(llm, "get_effective_provider_model", fake_eff)
    monkeypatch.setattr(llm, "get_provider_credentials", fake_cred)
    resp = MagicMock()
    resp.text = '{"ok": 1}'
    resp.usage_metadata = MagicMock(total_token_count=12)
    model = MagicMock()
    model.generate_content = MagicMock(return_value=resp)
    with patch.object(llm, "_build_gemini_model", return_value=model):
        data, tokens = await llm.generate_json(db_session, "kg_lpv_segmentation", "prompt")
    assert data == {"ok": 1} and tokens == 12


async def test_openai_path(db_session, monkeypatch):
    async def fake_eff(db, fk):
        return ("openai", "gpt-4o-mini")

    async def fake_cred(db, p):
        return ("ok-key", None)

    monkeypatch.setattr(llm, "get_effective_provider_model", fake_eff)
    monkeypatch.setattr(llm, "get_provider_credentials", fake_cred)
    msg = MagicMock()
    msg.content = '{"ok": 2}'
    choice = MagicMock()
    choice.message = msg
    completion = MagicMock()
    completion.choices = [choice]
    completion.usage = MagicMock(total_tokens=34)
    client = MagicMock()
    client.chat.completions.create = AsyncMock(return_value=completion)
    with patch.object(llm, "_build_openai_client", return_value=client):
        data, tokens = await llm.generate_json(db_session, "kg_lpv_n3_judge", "prompt")
    assert data == {"ok": 2} and tokens == 34


async def test_missing_key_raises(db_session, monkeypatch):
    async def fake_eff(db, fk):
        return ("openai", "gpt-4o")

    async def fake_cred(db, p):
        return (None, None)

    monkeypatch.setattr(llm, "get_effective_provider_model", fake_eff)
    monkeypatch.setattr(llm, "get_provider_credentials", fake_cred)
    with pytest.raises(RuntimeError):
        await llm.generate_json(db_session, "kg_lpv_repair", "prompt")

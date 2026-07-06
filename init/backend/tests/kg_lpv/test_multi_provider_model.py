def test_models_import_and_have_expected_columns():
    from app.models.admin_ai_model_setting import AdminAIModelSetting
    from app.models.ai_provider_credential import AiProviderCredential
    assert "provider" in AdminAIModelSetting.__table__.columns
    assert AdminAIModelSetting.__table__.columns["provider"].server_default is not None
    cols = set(AiProviderCredential.__table__.columns.keys())
    assert {"provider", "api_key", "base_url", "updated_by_admin_id", "updated_at"} <= cols
    assert AiProviderCredential.__table__.primary_key.columns.keys() == ["provider"]


def test_migration_050_imports():
    import importlib.util
    from pathlib import Path

    path = (
        Path(__file__).resolve().parents[2]
        / "alembic"
        / "versions"
        / "050_ai_provider_and_model_provider.py"
    )
    spec = importlib.util.spec_from_file_location("migration_050", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    assert m.down_revision == "049"

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_v1_prefix: str = "/api/v1"
    project_name: str = "AuthApp"
    secret_key: str = "super-secret-key-change-me"
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"
    sql_database_url: str = "sqlite+aiosqlite:///./app.db"
    alembic_ini_path: str = "alembic.ini"
    email_verification_token_expire_minutes: int = 15
    password_reset_token_expire_minutes: int = 60
    frontend_base_url: str = "http://localhost:5173"
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    frontend_host: str = "127.0.0.1"
    frontend_port: int = 5173
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_use_tls: bool = True
    smtp_use_ssl: bool = False
    smtp_default_sender: str | None = None
    notification_admin_email: str | None = None
    # Chat AI provider settings
    chat_ai_provider: str | None = None  # 'gemini' or 'openai' or 'ollama'
    # Gemini
    gemini_api_key: str | None = None
    gemini_model: str | None = None
    # OpenAI
    openai_api_key: str | None = None
    openai_model: str | None = None
    # Ollama
    ollama_base_url: str | None = None
    ollama_model: str | None = None
    
    # MongoDB settings
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_database: str = "lesson_plans_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"  # Allow extra fields from .env file


@lru_cache
def get_settings() -> Settings:
    return Settings()

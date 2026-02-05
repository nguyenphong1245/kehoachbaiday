import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    api_v1_prefix: str = "/api/v1"
    project_name: str = "AuthApp"
    secret_key: str = "CHANGE-ME-IN-ENV-FILE"
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"
    sql_database_url: str
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

    # Piston API (self-hosted via Docker hoặc public API)
    piston_api_url: str = "http://localhost:2000/api/v2"

    # YouTube Data API v3 (tìm video bài giảng)
    youtube_api_key: str | None = None
    # Google Custom Search API (tìm ảnh minh họa)
    google_cse_api_key: str | None = None
    google_cse_cx: str | None = None

    # Refresh token & cookie settings
    refresh_token_expire_days: int = 30
    cookie_secure: bool = True  # Default True for security, set False only in dev
    cookie_samesite: str = "lax"  # "lax" or "strict" or "none"
    cookie_domain: str | None = None  # None = current domain

    # CORS origins (comma-separated in env, parsed to list)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # File upload limits
    max_file_size_mb: int = 5  # Maximum file upload size in MB

    # Internal API key for auto-submit and scheduled tasks
    internal_api_key: str = "CHANGE-ME-IN-ENV-FILE-INTERNAL-KEY"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS from comma-separated string to list."""
        if not self.cors_origins:
            return []
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return os.getenv("ENVIRONMENT", "development").lower() in ("development", "dev", "local")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"  # Allow extra fields from .env file


@lru_cache
def get_settings() -> Settings:
    return Settings()

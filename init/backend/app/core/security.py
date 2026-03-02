import hmac
from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import secrets

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import get_settings
from .logging import logger

pwd_context = CryptContext(
    schemes=["bcrypt", "pbkdf2_sha256"],
    deprecated=["pbkdf2_sha256"],
    bcrypt__rounds=12,
)


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode: Dict[str, Any] = {"sub": subject, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> str | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        subject: str | None = payload.get("sub")
        return subject
    except JWTError:
        return None

def get_password_hash(password: str) -> str:
    if not isinstance(password, str):
        password = str(password)
    pw_bytes = password.encode("utf-8")
    if len(pw_bytes) > 72:
        raise ValueError("Mật khẩu quá dài (tối đa 72 bytes)")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def verify_and_upgrade_password(plain_password: str, hashed_password: str) -> tuple[bool, str | None]:
    """Verify password and return upgraded hash if the current hash uses a deprecated scheme."""
    try:
        ok, new_hash = pwd_context.verify_and_update(plain_password, hashed_password)
        return ok, new_hash
    except Exception:
        return False, None

def create_refresh_token() -> str:
    """Generate a cryptographically random refresh token."""
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token for storage (SHA-256)."""
    import hashlib
    return hashlib.sha256(token.encode()).hexdigest()


def constant_time_compare(a: str, b: str) -> bool:
    """Constant-time string comparison to prevent timing attacks."""
    return hmac.compare_digest(a.encode(), b.encode())


def generate_secure_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)

def generate_otp_code(length: int = 6) -> str:
    """Generate a numeric OTP code using cryptographically secure random"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])
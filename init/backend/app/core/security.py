from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import secrets 

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import get_settings

pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")


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

    try:
        return pwd_context.hash(password)
    except Exception:
        return pwd_context.hash(password, scheme="pbkdf2_sha256")


def verify_password(plain_password: str, password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, password)
    except Exception:
        return False

def create_refresh_token() -> str:
    """Generate a cryptographically random refresh token."""
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token for storage (SHA-256)."""
    import hashlib
    return hashlib.sha256(token.encode()).hexdigest()


def generate_secure_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)

def generate_otp_code(length: int = 6) -> str:
    """Generate a numeric OTP code using cryptographically secure random"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])
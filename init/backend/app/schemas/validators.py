"""Shared validation functions for schemas."""


def validate_password(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Mật khẩu phải có ít nhất 8 ký tự")
    if len(v) > 50:
        raise ValueError("Mật khẩu không được quá 50 ký tự")
    if not any(c.isalpha() for c in v):
        raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ cái")
    if not any(c.isdigit() for c in v):
        raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ số")
    return v

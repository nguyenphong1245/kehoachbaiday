"""
Audit logging service for tracking security-relevant events.
"""
from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request

from app.models.audit_log import AuditLog
from app.core.logging import logger


async def log_audit_event(
    db: AsyncSession,
    action: str,
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[int] = None,
    details: Optional[dict[str, Any]] = None,
    request: Optional[Request] = None,
    result: str = "success",
    error_message: Optional[str] = None,
) -> AuditLog:
    """
    Log an audit event to the database.

    Common actions:
    - user.login, user.login_failed, user.logout
    - user.password_change, user.password_reset
    - user.role_change
    - data.create, data.update, data.delete
    - admin.user_update, admin.user_delete

    Args:
        db: Database session
        action: Type of action being logged
        user_id: ID of user performing the action (None for anonymous)
        resource_type: Type of resource being acted upon
        resource_id: ID of the resource
        details: Additional context about the action
        request: FastAPI request object (to extract IP and user agent)
        result: "success" or "failure"
        error_message: Error details if action failed

    Returns:
        The created AuditLog record
    """
    ip_address = None
    user_agent = None

    if request:
        # Get real IP from X-Forwarded-For header (for proxied requests)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()
        elif request.client:
            ip_address = request.client.host

        user_agent = request.headers.get("User-Agent", "")[:512]

    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
        result=result,
        error_message=error_message,
    )

    db.add(audit_log)
    await db.flush()

    logger.info(
        "audit.%s user_id=%s resource=%s:%s result=%s",
        action,
        user_id,
        resource_type,
        resource_id,
        result,
    )

    return audit_log


# Convenience functions for common events


async def log_login_success(
    db: AsyncSession,
    user_id: int,
    request: Optional[Request] = None,
    login_type: str = "teacher",
) -> AuditLog:
    """Log a successful login event."""
    return await log_audit_event(
        db=db,
        action="user.login",
        user_id=user_id,
        resource_type="user",
        resource_id=user_id,
        details={"login_type": login_type},
        request=request,
        result="success",
    )


async def log_login_failure(
    db: AsyncSession,
    email: str,
    request: Optional[Request] = None,
    reason: str = "invalid_credentials",
) -> AuditLog:
    """Log a failed login attempt."""
    return await log_audit_event(
        db=db,
        action="user.login_failed",
        user_id=None,
        resource_type="user",
        details={"email": email, "reason": reason},
        request=request,
        result="failure",
        error_message=reason,
    )


async def log_logout(
    db: AsyncSession,
    user_id: int,
    request: Optional[Request] = None,
) -> AuditLog:
    """Log a logout event."""
    return await log_audit_event(
        db=db,
        action="user.logout",
        user_id=user_id,
        resource_type="user",
        resource_id=user_id,
        request=request,
    )


async def log_password_change(
    db: AsyncSession,
    user_id: int,
    request: Optional[Request] = None,
    change_type: str = "change",  # "change" or "reset"
) -> AuditLog:
    """Log a password change or reset event."""
    return await log_audit_event(
        db=db,
        action=f"user.password_{change_type}",
        user_id=user_id,
        resource_type="user",
        resource_id=user_id,
        request=request,
    )


async def log_data_delete(
    db: AsyncSession,
    user_id: int,
    resource_type: str,
    resource_id: int,
    request: Optional[Request] = None,
    details: Optional[dict[str, Any]] = None,
) -> AuditLog:
    """Log a data deletion event."""
    return await log_audit_event(
        db=db,
        action="data.delete",
        user_id=user_id,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        request=request,
    )

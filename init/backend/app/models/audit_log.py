"""
Audit Log model for tracking important user actions and security events.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class AuditLog(Base):
    """
    Tracks important user actions for security auditing.

    Actions logged:
    - user.login / user.login_failed
    - user.logout
    - user.password_change
    - user.role_change
    - data.delete (lesson plans, worksheets, etc.)
    - admin.user_update
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Who performed the action (nullable for failed logins by unknown users)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Action type (e.g., "user.login", "user.password_change", "data.delete")
    action = Column(String(100), nullable=False, index=True)

    # Target resource type (e.g., "user", "lesson_plan", "worksheet")
    resource_type = Column(String(50), nullable=True)

    # Target resource ID (e.g., lesson_plan_id, user_id being modified)
    resource_id = Column(Integer, nullable=True)

    # Additional details about the action (stored as JSON)
    details = Column(JSONB, nullable=True)

    # IP address of the request
    ip_address = Column(String(45), nullable=True)  # IPv6 can be up to 45 chars

    # User agent string
    user_agent = Column(String(512), nullable=True)

    # Result of the action (success, failure, etc.)
    result = Column(String(20), nullable=False, default="success")

    # Error message if action failed
    error_message = Column(Text, nullable=True)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # Relationship to user
    user = relationship("User", backref="audit_logs")

    def __repr__(self):
        return f"<AuditLog {self.id}: {self.action} by user {self.user_id}>"

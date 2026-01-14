from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.association import role_permissions_table


class Permission(Base):
    __tablename__ = "permissions"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String(100), unique=True, nullable=False)
    description: str | None = Column(String(255), nullable=True)

    roles = relationship("Role", secondary=role_permissions_table, back_populates="permissions")

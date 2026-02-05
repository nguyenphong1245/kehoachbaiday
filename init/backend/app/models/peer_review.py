"""
PeerReviewRound & PeerReview Models - Đánh giá chéo
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class PeerReviewRound(Base):
    __tablename__ = "peer_review_rounds"

    id = Column(Integer, primary_key=True, autoincrement=True)
    assignment_id = Column(Integer, ForeignKey("class_assignments.id", ondelete="CASCADE"), unique=True, nullable=False)
    status = Column(String(20), server_default="pending")  # 'pending', 'active', 'completed'
    pairings = Column(JSON, server_default="[]")  # [{reviewer_id, reviewee_id}]
    activated_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    assignment = relationship("ClassAssignment", back_populates="peer_review_round")
    reviews = relationship("PeerReview", back_populates="round", cascade="all, delete-orphan")


class PeerReview(Base):
    __tablename__ = "peer_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    round_id = Column(Integer, ForeignKey("peer_review_rounds.id", ondelete="CASCADE"), nullable=False)
    reviewer_id = Column(Integer, nullable=False)  # group_work_session.id or individual_submission.id
    reviewee_id = Column(Integer, nullable=False)  # group_work_session.id or individual_submission.id
    reviewer_type = Column(String(20), nullable=False)  # 'group' | 'individual'

    # Actual reviewer user
    reviewer_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    comments = Column(JSON, server_default="{}")  # {"q1": "comment", "general": "..."}
    score = Column(Integer, nullable=True)  # 1-10
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    round = relationship("PeerReviewRound", back_populates="reviews")
    reviewer_user = relationship("User")

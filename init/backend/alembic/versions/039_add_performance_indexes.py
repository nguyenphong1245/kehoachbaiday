"""Add performance indexes for common queries

Revision ID: 039
Revises: 038
"""
from alembic import op

revision = "039"
down_revision = "038"


def upgrade() -> None:
    # Admin dashboard: count active/verified users
    op.create_index("ix_users_is_active", "users", ["is_active"])
    op.create_index("ix_users_is_verified", "users", ["is_verified"])

    # Student enrollment lookup
    op.create_index(
        "ix_class_student_user_classroom",
        "class_student",
        ["user_id", "classroom_id"],
    )

    # Assignment list by classroom
    op.create_index(
        "ix_class_assignments_classroom_active",
        "class_assignments",
        ["classroom_id", "is_active"],
    )

    # Individual submission lookup by assignment
    op.create_index(
        "ix_individual_submission_assignment",
        "individual_submission",
        ["assignment_id"],
    )

    # Group work session lookup by assignment
    op.create_index(
        "ix_group_work_session_assignment",
        "group_work_session",
        ["assignment_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_group_work_session_assignment", "group_work_session")
    op.drop_index("ix_individual_submission_assignment", "individual_submission")
    op.drop_index("ix_class_assignments_classroom_active", "class_assignments")
    op.drop_index("ix_class_student_user_classroom", "class_student")
    op.drop_index("ix_users_is_verified", "users")
    op.drop_index("ix_users_is_active", "users")

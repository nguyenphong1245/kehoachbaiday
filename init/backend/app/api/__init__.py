from fastapi import APIRouter

from app.api.routes import (
    admin,
    auth,
    roles,
    users,
    lesson_builder,
    shared_worksheets,
    shared_quizzes,
    code_exercises,
    classrooms,
    assignments,
    student,
    peer_review,
    guide_cards,
    lesson_plan_comments,
    teaching_rules,
)
from app.core.config import get_settings
from app.modules.kg_lpv.router import status_router as kg_lpv_status_router


def build_api_router() -> APIRouter:
    """Xây dựng api_router. Là 1 hàm (không phải biến module-level) để việc đăng
    ký có điều kiện của module KG-LPV đọc lại `settings.kg_lpv_enabled` mỗi lần
    ứng dụng được khởi tạo (xem app/main.py:get_app())."""
    router = APIRouter()

    # Admin routes
    router.include_router(admin.router, prefix="/admin", tags=["admin"])

    # Auth routes
    router.include_router(auth.router, prefix="/auth", tags=["auth"])

    # Roles routes
    router.include_router(roles.router, prefix="/roles", tags=["roles"])

    # Permissions routes
    router.include_router(roles.permissions_router, prefix="/permissions", tags=["permissions"])

    # User routes
    router.include_router(users.router, tags=["users"])

    # Lesson builder routes
    router.include_router(lesson_builder.router, prefix="/lesson-builder", tags=["lesson-builder"])

    # Shared worksheets routes
    router.include_router(shared_worksheets.router, tags=["shared-worksheets"])

    # Shared quizzes routes
    router.include_router(shared_quizzes.router, tags=["shared-quizzes"])

    # Code exercises routes
    router.include_router(code_exercises.router, tags=["code-exercises"])

    # Classrooms routes
    router.include_router(classrooms.router, prefix="/classrooms", tags=["classrooms"])

    # Assignments routes
    router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])

    # Student portal routes
    router.include_router(student.router, prefix="/student", tags=["student"])

    # Peer review routes
    router.include_router(peer_review.router, prefix="/peer-review", tags=["peer-review"])

    # Guide cards routes
    router.include_router(guide_cards.router, prefix="/guide-cards", tags=["guide-cards"])

    # Lesson plan comments routes (nhận xét GV trên KHBD)
    router.include_router(lesson_plan_comments.router, tags=["lesson-plan-comments"])

    # Teaching rules routes (quản lý quy tắc AI)
    router.include_router(teaching_rules.router, tags=["teaching-rules"])

    # KG-LPV: status luôn đăng ký (kể cả khi module tắt) để frontend có 1 nguồn duy nhất
    router.include_router(kg_lpv_status_router, prefix="/kg-lpv", tags=["kg-lpv"])

    # KG-LPV: router đầy đủ chỉ đăng ký khi tầng 2 (env) bật
    if get_settings().kg_lpv_enabled:
        from app.modules.kg_lpv.router import router as kg_lpv_router

        router.include_router(kg_lpv_router, prefix="/kg-lpv", tags=["kg-lpv"])

    return router

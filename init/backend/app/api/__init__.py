from fastapi import APIRouter

from app.api.routes import (
    admin,
    auth,
    roles,
    users,
    chat,
    lesson_builder,
    shared_worksheets,
    shared_quizzes,
    lesson_contents,
    code_exercises,
    classrooms,
    assignments,
    student,
    peer_review,
)

api_router = APIRouter()

# Admin routes
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Roles routes
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])

# Permissions routes
api_router.include_router(roles.permissions_router, prefix="/permissions", tags=["permissions"])

# User routes
api_router.include_router(users.router, tags=["users"])

# Chat routes
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

# Lesson builder routes
api_router.include_router(lesson_builder.router, prefix="/lesson-builder", tags=["lesson-builder"])

# Shared worksheets routes
api_router.include_router(shared_worksheets.router, tags=["shared-worksheets"])

# Shared quizzes routes
api_router.include_router(shared_quizzes.router, tags=["shared-quizzes"])

# Lesson contents (SGK) routes
api_router.include_router(lesson_contents.router, prefix="/lesson-contents", tags=["lesson-contents"])

# Code exercises routes
api_router.include_router(code_exercises.router, tags=["code-exercises"])

# Classrooms routes
api_router.include_router(classrooms.router, prefix="/classrooms", tags=["classrooms"])

# Assignments routes
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])

# Student portal routes
api_router.include_router(student.router, prefix="/student", tags=["student"])

# Peer review routes
api_router.include_router(peer_review.router, prefix="/peer-review", tags=["peer-review"])


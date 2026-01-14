from fastapi import APIRouter

from app.api.routes import (
    auth,
    roles,
    users,
    categories,
    documents,
    chat,
    lesson_builder,
    shared_worksheets,
    shared_quizzes,
    code_exercises,
    lesson_contents,
)

api_router = APIRouter()

# Auth routes
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Roles routes
api_router.include_router(roles.router, prefix="/roles", tags=["roles"])

# User routes
api_router.include_router(users.router, tags=["users"])

# Categories routes
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])

# Documents routes
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])

# Chat routes
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

# Lesson builder routes
api_router.include_router(lesson_builder.router, prefix="/lesson-builder", tags=["lesson-builder"])

# Shared worksheets routes
api_router.include_router(shared_worksheets.router, tags=["shared-worksheets"])

# Shared quizzes routes
api_router.include_router(shared_quizzes.router, tags=["shared-quizzes"])

# Code exercises routes
api_router.include_router(code_exercises.router, prefix="/code-exercises", tags=["code-exercises"])

# Lesson contents (SGK) routes
api_router.include_router(lesson_contents.router, prefix="/lesson-contents", tags=["lesson-contents"])

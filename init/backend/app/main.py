from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.api import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging, logger
from fastapi.middleware.cors import CORSMiddleware
import os


async def create_default_roles():
    """Tạo các roles mặc định nếu chưa tồn tại"""
    from sqlalchemy import select
    from app.db.session import AsyncSessionLocal
    from app.models.role import Role
    
    default_roles = [
        {"name": "admin", "description": "Quản trị viên hệ thống"},
        {"name": "teacher", "description": "Giáo viên"},
        {"name": "user", "description": "Người dùng thường"},
    ]
    
    async with AsyncSessionLocal() as session:
        for role_data in default_roles:
            result = await session.execute(select(Role).where(Role.name == role_data["name"]))
            existing = result.scalar_one_or_none()
            if not existing:
                role = Role(name=role_data["name"], description=role_data["description"])
                session.add(role)
                await session.commit()
                logger.info(f"✅ Created role: {role_data['name']}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_default_roles()
    logger.info("✅ Application started")
    
    yield
    
    # Shutdown
    logger.info("Application shutdown")


def get_app() -> FastAPI:
    configure_logging()
    settings = get_settings()
    application = FastAPI(title=settings.project_name, lifespan=lifespan)

    # CORS: Cho phép cả localhost và Vercel domain
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "https://khbd-ten.vercel.app",
        settings.frontend_base_url,
    ]
    
    application.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.middleware("http")
    async def log_requests(request: Request, call_next):
        logger.info("request.start path=%s method=%s", request.url.path, request.method)
        response = await call_next(request)
        logger.info("request.success path=%s method=%s status=%s", request.url.path, request.method, response.status_code)
        return response

    @application.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, exc: Exception):
        logger.exception("request.error")
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    @application.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = get_app()

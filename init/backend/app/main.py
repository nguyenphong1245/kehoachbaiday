from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging, logger
from fastapi.middleware.cors import CORSMiddleware


async def create_default_roles():
    """To cc roles mc nh nu cha tn ti"""
    from sqlalchemy import select
    from app.db.session import AsyncSessionLocal
    from app.models.role import Role

    default_roles = [
        {"name": "admin", "description": "Qun tr vin h thng"},
        {"name": "teacher", "description": "Gio vin"},
        {"name": "user", "description": "Ngi dng thng"},
        {"name": "student", "description": "Hc sinh"},
    ]

    async with AsyncSessionLocal() as session:
        for role_data in default_roles:
            result = await session.execute(select(Role).where(Role.name == role_data["name"]))
            existing = result.scalar_one_or_none()
            if not existing:
                role = Role(name=role_data["name"], description=role_data["description"])
                session.add(role)
                await session.commit()
                logger.info("Created role: %s", role_data["name"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - validate secret key
    _settings = get_settings()
    if "CHANGE-ME" in _settings.secret_key:
        logger.critical("SECRET_KEY chưa được đổi! Hãy đặt SECRET_KEY trong file .env")
        raise RuntimeError("SECRET_KEY chưa được cấu hình. Không thể khởi động ứng dụng.")

    await create_default_roles()

    # Initialize scheduler for auto-submit and peer review
    try:
        from app.services.assignment_scheduler import init_scheduler
        init_scheduler()
        logger.info("Assignment scheduler initialized")
    except Exception as e:
        logger.error("Failed to initialize scheduler: %s", e)

    logger.info(" Application started")

    yield

    # Shutdown - đóng kết nối đúng cách
    logger.info("Application shutting down...")

    # Shutdown scheduler
    try:
        from app.services.assignment_scheduler import shutdown_scheduler
        shutdown_scheduler()
        logger.info("Scheduler shut down")
    except Exception as e:
        logger.warning("Failed to shutdown scheduler: %s", e)

    # Đóng Neo4j driver
    try:
        from app.services.lesson_plan_builder_service import get_lesson_plan_builder_service
        service = get_lesson_plan_builder_service()
        service.close()
        logger.info("Neo4j driver closed")
    except Exception as e:
        logger.warning("Failed to close Neo4j driver: %s", e)

    # Đóng database engine
    try:
        from app.db.session import engine
        await engine.dispose()
        logger.info("Database engine disposed")
    except Exception as e:
        logger.warning("Failed to dispose database engine: %s", e)

    logger.info("Application shutdown complete")


def get_app() -> FastAPI:
    configure_logging()
    settings = get_settings()
    application = FastAPI(title=settings.project_name, lifespan=lifespan)

    # CORS: Load origins from config, with fallback defaults
    allowed_origins = settings.cors_origins_list
    # Add common development origins and frontend_base_url as fallback
    fallback_origins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        settings.frontend_base_url,
    ]
    for origin in fallback_origins:
        if origin and origin not in allowed_origins:
            allowed_origins.append(origin)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-CSRF-Token"],
    )

    @application.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # CSRF Protection middleware (double-submit cookie pattern)
    @application.middleware("http")
    async def csrf_protection(request: Request, call_next):
        # Skip CSRF check for safe methods and specific paths
        safe_methods = {"GET", "HEAD", "OPTIONS"}
        csrf_exempt_paths = {
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            f"{settings.api_v1_prefix}/auth/login",
            f"{settings.api_v1_prefix}/auth/student-login",
            f"{settings.api_v1_prefix}/auth/register",
            f"{settings.api_v1_prefix}/auth/refresh",
        }
        # Skip for WebSocket connections
        if request.scope.get("type") == "websocket":
            return await call_next(request)

        if request.method in safe_methods:
            return await call_next(request)

        if request.url.path in csrf_exempt_paths:
            return await call_next(request)

        # For state-changing requests, validate CSRF token
        csrf_cookie = request.cookies.get("csrf_token")
        csrf_header = request.headers.get("X-CSRF-Token")

        # Helper to add CORS headers to error responses
        def make_csrf_error_response(detail: str):
            origin = request.headers.get("origin", "")
            response = JSONResponse(
                status_code=403,
                content={"detail": detail}
            )
            # Add CORS headers if origin is allowed
            if origin in allowed_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Credentials"] = "true"
            return response

        if not csrf_cookie or not csrf_header:
            logger.warning(
                "csrf.missing path=%s method=%s cookie=%s header=%s",
                request.url.path, request.method,
                "present" if csrf_cookie else "missing",
                "present" if csrf_header else "missing"
            )
            return make_csrf_error_response("CSRF token missing")

        if csrf_cookie != csrf_header:
            logger.warning(
                "csrf.mismatch path=%s method=%s cookie_len=%d header_len=%d",
                request.url.path, request.method, len(csrf_cookie), len(csrf_header)
            )
            return make_csrf_error_response("CSRF token mismatch")

        return await call_next(request)

    # Helper to add CORS headers to error responses
    def add_cors_headers(request: Request, response: JSONResponse):
        origin = request.headers.get("origin", "")
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    @application.exception_handler(HTTPException)
    async def handle_http_exception(request: Request, exc: HTTPException):
        response = JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail}
        )
        return add_cors_headers(request, response)

    @application.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception):
        logger.exception("request.error")
        response = JSONResponse(status_code=500, content={"detail": "Internal server error"})
        return add_cors_headers(request, response)

    # Rate limiting
    from app.core.rate_limiter import limiter
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    application.include_router(api_router, prefix=settings.api_v1_prefix)

    # WebSocket routes (mounted directly, not under API prefix)
    from app.api.routes.ws_collaboration import router as ws_router
    application.include_router(ws_router)

    @application.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return application


app = get_app()

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# import models here to ensure metadata is correctly generated for Alembic
def load_all_models() -> None:
    import app.models.association  # noqa: F401
    import app.models.category  # noqa: F401
    import app.models.document  # noqa: F401
    import app.models.email_verification  # noqa: F401
    import app.models.password_reset  # noqa: F401
    import app.models.permission  # noqa: F401
    import app.models.profile  # noqa: F401
    import app.models.role  # noqa: F401
    import app.models.settings  # noqa: F401
    import app.models.user  # noqa: F401
    import app.models.chat_conversation  # noqa: F401
    import app.models.chat_message  # noqa: F401


load_all_models()

target_metadata = Base.metadata

__all__ = ["main"]

def create_app():
    from .main import get_app

    return get_app()

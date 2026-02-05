import json
import logging
import os
from datetime import datetime, timezone
from logging.config import dictConfig


class JSONFormatter(logging.Formatter):
    """JSON log formatter cho production (structured logging)."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry, ensure_ascii=False)


def configure_logging() -> None:
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    log_format = os.getenv("LOG_FORMAT", "text").lower()

    formatter = "json" if log_format == "json" else "standard"

    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "standard": {
                    "format": "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                },
                "json": {
                    "()": JSONFormatter,
                },
                "access": {
                    "format": "%(asctime)s | %(levelname)s | %(client_addr)s - %(request_line)s - %(status_code)s (%(process_time).2f ms)",
                },
            },
            "handlers": {
                "default": {
                    "class": "logging.StreamHandler",
                    "formatter": formatter,
                },
            },
            "loggers": {
                "uvicorn": {"handlers": ["default"], "level": "INFO"},
                "uvicorn.access": {"handlers": ["default"], "level": "INFO"},
                "app": {"handlers": ["default"], "level": log_level},
            },
        }
    )


logger = logging.getLogger("app")

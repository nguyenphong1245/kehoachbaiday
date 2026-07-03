"""Driver Neo4j KG-LPV — lazy singleton, chỉ đọc, không kết nối lúc import/startup."""

import time

from neo4j import GraphDatabase

from app.core.config import get_settings
from app.core.logging import logger
from app.modules.kg_lpv.config import GRAPH_HEALTH_CACHE_TTL_SECONDS


class KgLpvGraphClient:
    """Singleton lazy-init driver cho đồ thị tri thức KG-LPV (bolt riêng, pool nhỏ)."""

    def __init__(self) -> None:
        self._driver = None
        self._healthy_cache: bool | None = None
        self._healthy_cache_time: float = 0.0

    def _get_driver(self):
        if self._driver is not None:
            return self._driver

        settings = get_settings()
        if not settings.kg_lpv_neo4j_uri:
            return None

        try:
            self._driver = GraphDatabase.driver(
                settings.kg_lpv_neo4j_uri,
                auth=(settings.kg_lpv_neo4j_username, settings.kg_lpv_neo4j_password),
                connection_timeout=15,
                connection_acquisition_timeout=30,
                max_connection_pool_size=5,
            )
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("kg_lpv.graph_client.driver_init_failed error=%s", exc)
            self._driver = None

        return self._driver

    def is_healthy(self, force: bool = False) -> bool:
        """Chạy `RETURN 1` để kiểm tra kết nối, cache kết quả (TTL 60s). Không bao giờ raise."""
        now = time.monotonic()
        if not force and self._healthy_cache is not None:
            if (now - self._healthy_cache_time) < GRAPH_HEALTH_CACHE_TTL_SECONDS:
                return self._healthy_cache

        healthy = self._check_health()
        self._healthy_cache = healthy
        self._healthy_cache_time = now
        return healthy

    def _check_health(self) -> bool:
        try:
            driver = self._get_driver()
            if driver is None:
                return False
            settings = get_settings()
            with driver.session(database=settings.kg_lpv_neo4j_database) as session:
                session.run("RETURN 1").single()
            return True
        except Exception as exc:
            logger.warning("kg_lpv.graph_client.health_check_failed error=%s", exc)
            return False

    def close(self) -> None:
        if self._driver is not None:
            try:
                self._driver.close()
            except Exception as exc:  # pragma: no cover - defensive
                logger.warning("kg_lpv.graph_client.close_failed error=%s", exc)
            self._driver = None
        self._healthy_cache = None
        self._healthy_cache_time = 0.0


graph_client = KgLpvGraphClient()

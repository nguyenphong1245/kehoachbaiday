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

    def find_lesson_by_identity(
        self,
        lesson_id: str | None,
        grade: str | None,
        book_type: str | None,
        topic: str | None,
        lesson_name: str | None,
    ) -> dict | None:
        """Khớp đúng một `BaiHoc` trong cây `KhoiLop-[:CO_CHU_DE]->ChuDe-[:CO_BAI_HOC]->BaiHoc`.

        Ưu tiên khớp theo `ma_dinh_danh` (nếu có `lesson_id`); nếu không, thử
        khớp theo đường `KhoiLop.ten`/`ChuDe.ten`/`BaiHoc.ten` chính xác. Trả
        về dict phẳng (không rò rỉ driver) kèm nút cha `khoi_lop`/`chu_de` và
        4 trường vết xuất xứ, hoặc `None` nếu đồ thị chưa sẵn sàng / không có
        đỉnh khớp. `book_type` (ấn bản SGK) không thuộc cây chương trình
        (§5.2) nên không dùng để so khớp — chỉ truyền qua để log/đối chiếu ở
        tầng gọi nếu cần.
        """
        driver = self._get_driver()
        if driver is None:
            return None

        settings = get_settings()
        try:
            with driver.session(database=settings.kg_lpv_neo4j_database) as session:
                if lesson_id:
                    record = session.run(
                        """
                        MATCH (kl:KhoiLop)-[:CO_CHU_DE]->(cd:ChuDe)-[:CO_BAI_HOC]->(bh:BaiHoc {ma_dinh_danh: $lesson_id})
                        RETURN bh, kl, cd
                        LIMIT 1
                        """,
                        lesson_id=lesson_id,
                    ).single()
                else:
                    record = session.run(
                        """
                        MATCH (kl:KhoiLop)-[:CO_CHU_DE]->(cd:ChuDe)-[:CO_BAI_HOC]->(bh:BaiHoc)
                        WHERE ($grade IS NULL OR kl.ten CONTAINS $grade)
                          AND ($topic IS NULL OR cd.ten = $topic)
                          AND ($lesson_name IS NULL OR bh.ten = $lesson_name)
                        RETURN bh, kl, cd
                        LIMIT 1
                        """,
                        grade=grade,
                        topic=topic,
                        lesson_name=lesson_name,
                    ).single()
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("kg_lpv.graph_client.find_lesson_by_identity_failed error=%s", exc)
            return None

        if record is None:
            return None

        return self._bai_hoc_record_to_dict(record)

    def search_lessons_fuzzy(self, ten: str | None, grade: str | None = None, limit: int = 5) -> list[dict]:
        """Tìm các `BaiHoc` gần đúng theo tên qua fulltext index `baihoc_ten_fulltext`.

        Dùng khi khớp đúng thất bại — trả về ứng viên gần nhất (kèm `score`
        của Neo4j) làm bằng chứng cho finding D1. Trả `[]` nếu đồ thị chưa
        sẵn sàng, không có `ten`, hoặc không có ứng viên nào.
        """
        if not ten:
            return []

        driver = self._get_driver()
        if driver is None:
            return []

        settings = get_settings()
        try:
            with driver.session(database=settings.kg_lpv_neo4j_database) as session:
                records = session.run(
                    """
                    CALL db.index.fulltext.queryNodes('baihoc_ten_fulltext', $ten)
                    YIELD node, score
                    WHERE $grade IS NULL OR EXISTS {
                        MATCH (kl:KhoiLop)-[:CO_CHU_DE]->(:ChuDe)-[:CO_BAI_HOC]->(node)
                        WHERE kl.ten CONTAINS $grade
                    }
                    RETURN node, score
                    ORDER BY score DESC
                    LIMIT $limit
                    """,
                    ten=ten,
                    grade=grade,
                    limit=limit,
                )
                return [self._fulltext_record_to_dict(record) for record in records]
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("kg_lpv.graph_client.search_lessons_fuzzy_failed error=%s", exc)
            return []

    @staticmethod
    def _bai_hoc_record_to_dict(record) -> dict:
        bh = dict(record["bh"])
        kl = dict(record["kl"])
        cd = dict(record["cd"])
        return {
            "ma_dinh_danh": bh.get("ma_dinh_danh"),
            "ten": bh.get("ten"),
            "khoi_lop": {"ma_dinh_danh": kl.get("ma_dinh_danh"), "ten": kl.get("ten")},
            "chu_de": {"ma_dinh_danh": cd.get("ma_dinh_danh"), "ten": cd.get("ten")},
            "ma_nguon": bh.get("ma_nguon"),
            "so_ky_hieu": bh.get("so_ky_hieu"),
            "ngay_hieu_luc": bh.get("ngay_hieu_luc"),
            "vi_tri_trang": bh.get("vi_tri_trang"),
        }

    @staticmethod
    def _fulltext_record_to_dict(record) -> dict:
        node = dict(record["node"])
        return {
            "ma_dinh_danh": node.get("ma_dinh_danh"),
            "ten": node.get("ten"),
            "score": record["score"],
            "ma_nguon": node.get("ma_nguon"),
            "so_ky_hieu": node.get("so_ky_hieu"),
            "ngay_hieu_luc": node.get("ngay_hieu_luc"),
            "vi_tri_trang": node.get("vi_tri_trang"),
        }

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

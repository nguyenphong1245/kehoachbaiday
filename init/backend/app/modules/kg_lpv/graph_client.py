"""Driver Neo4j KG-LPV — lazy singleton, chỉ đọc, không kết nối lúc import/startup."""

import time

from neo4j import GraphDatabase

from app.core.config import get_settings
from app.core.logging import logger
from app.modules.kg_lpv.config import GRAPH_HEALTH_CACHE_TTL_SECONDS
from app.modules.kg_lpv.schemas import LessonContext


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

    def get_lesson_context(self, lesson_id: str | None, grade: str | None) -> LessonContext:
        """Truy hồi "gói ngữ cảnh bài học" (§9) — gọi ĐÚNG 1 LẦN mỗi job, N2 (Task
        5) và N3 (Task 6) dùng chung, không truy vấn lại đồ thị cho từng mã lỗi.

        Trả `LessonContext` rỗng (mọi danh sách `[]`, `lesson=None`) nếu đồ thị
        chưa sẵn sàng, thiếu `lesson_id`, hoặc truy vấn lỗi — không bao giờ raise
        (cùng quy ước phòng thủ với các phương thức khác của client này).
        """
        driver = self._get_driver()
        if driver is None or not lesson_id:
            return LessonContext()

        settings = get_settings()
        try:
            with driver.session(database=settings.kg_lpv_neo4j_database) as session:
                return LessonContext(
                    lesson=self._fetch_lesson(session, lesson_id),
                    yccd=self._fetch_yccd(session, lesson_id),
                    nang_luc_tin_hoc=self._fetch_all_nodes(session, "NangLucTinHoc"),
                    nang_luc_chung=self._fetch_all_nodes(session, "NangLucChung"),
                    pham_chat=self._fetch_all_nodes(session, "PhamChat"),
                    chi_bao_nls=self._fetch_chi_bao_nls(session, grade),
                    menh_de_kien_thuc=self._fetch_menh_de_kien_thuc(session, lesson_id),
                    dong_tu_nhan_thuc=self._fetch_dong_tu_nhan_thuc(session),
                )
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("kg_lpv.graph_client.get_lesson_context_failed lesson_id=%s error=%s", lesson_id, exc)
            return LessonContext()

    @staticmethod
    def _fetch_lesson(session, lesson_id: str) -> dict | None:
        record = session.run(
            "MATCH (bh:BaiHoc {ma_dinh_danh: $lesson_id}) RETURN bh", lesson_id=lesson_id
        ).single()
        return dict(record["bh"]) if record else None

    @staticmethod
    def _fetch_yccd(session, lesson_id: str) -> list[dict]:
        records = session.run(
            """
            MATCH (bh:BaiHoc {ma_dinh_danh: $lesson_id})-[:CO_YCCD]->(y:YCCD)
            OPTIONAL MATCH (y)-[:O_MUC]->(m:MucNhanThuc)
            RETURN y, m
            """,
            lesson_id=lesson_id,
        )
        result = []
        for record in records:
            y = dict(record["y"])
            m = dict(record["m"]) if record["m"] is not None else None
            result.append({**y, "muc_nhan_thuc": m})
        return result

    @staticmethod
    def _fetch_all_nodes(session, label: str) -> list[dict]:
        # `label` chỉ nhận 1 trong các hằng số nội bộ gọi cố định bên dưới
        # (không nội suy từ input người dùng) — an toàn tiêm Cypher.
        records = session.run(f"MATCH (n:{label}) RETURN n")
        return [dict(record["n"]) for record in records]

    @staticmethod
    def _fetch_chi_bao_nls(session, grade: str | None) -> list[dict]:
        records = session.run(
            """
            MATCH (cb:ChiBaoNLS)-[:AP_DUNG_CHO]->(kl:KhoiLop)
            WHERE $grade IS NULL OR kl.ten CONTAINS $grade OR kl.ma_dinh_danh ENDS WITH $grade
            OPTIONAL MATCH (cb)-[:CO_MUC_DO]->(md:MucDoNLS)
            RETURN cb, collect(md) AS muc_do_list
            """,
            grade=grade,
        )
        result = []
        for record in records:
            cb = dict(record["cb"])
            muc_do = [dict(md) for md in record["muc_do_list"] if md is not None]
            result.append({**cb, "muc_do": muc_do})
        return result

    @staticmethod
    def _fetch_menh_de_kien_thuc(session, lesson_id: str) -> list[dict]:
        records = session.run(
            """
            MATCH (m:MenhDeKienThuc)-[:THUOC]->(bh:BaiHoc {ma_dinh_danh: $lesson_id})
            RETURN m
            """,
            lesson_id=lesson_id,
        )
        return [dict(record["m"]) for record in records]

    @staticmethod
    def _fetch_dong_tu_nhan_thuc(session) -> dict:
        """Bảng động từ nhận thức (`DongTuNhanThuc`, §5.2). Quy ước thuộc tính node
        (do nhóm nghiên cứu curate theo lược đồ nạp liệu — xem `scripts/kg_lpv/README.md`):
        `dong_tu` (chuỗi động từ), `do_duoc` (bool đo lường được hay không), `bac`
        (mức nhận thức tương ứng — chỉ có ý nghĩa khi `do_duoc=true`, dùng đối chiếu M1).
        """
        records = session.run("MATCH (d:DongTuNhanThuc) RETURN d")
        do_duoc: list[dict] = []
        khong_do_duoc: list[str] = []
        for record in records:
            d = dict(record["d"])
            dong_tu = d.get("dong_tu")
            if not dong_tu:
                continue
            if d.get("do_duoc"):
                do_duoc.append({"dong_tu": dong_tu, "bac": d.get("bac")})
            else:
                khong_do_duoc.append(dong_tu)
        return {"do_duoc": do_duoc, "khong_do_duoc": khong_do_duoc}

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

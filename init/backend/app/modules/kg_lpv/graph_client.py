"""Driver Neo4j KG-LPV — lazy singleton, chỉ đọc, không kết nối lúc import/startup.

Truy vấn theo lược đồ ĐỒ THỊ HỆ THỐNG (đồ thị soạn KHBD, dùng chung): cây
`Lop-[:CO_CHU_DE]->ChuDe-[:CO_BAI_HOC]->BaiHoc`, khớp `BaiHoc` theo `elementId`
(chính là `saved_lesson_plans.lesson_id`). Bài học không có `ma_dinh_danh` —
`elementId` đóng vai trò định danh. Ngữ cảnh N2/N3 lấy từ `MucTieu`/`ChiMuc`/
`NangLucTinHoc`/`NangLucChung`/`PhamChat`/`ChiBao` của đồ thị hệ thống.
"""

import re
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
        """Khớp một `BaiHoc` trong đồ thị hệ thống (`Lop-[:CO_CHU_DE]->ChuDe-[:CO_BAI_HOC]->BaiHoc`).

        Ưu tiên khớp CHÍNH XÁC theo `elementId(bh)` (= `lesson_id` của KHBD); nếu
        không, thử theo đường `Lop.ten`/`ChuDe.ten`/`BaiHoc.ten`. Trả về dict phẳng
        (không rò rỉ driver) kèm nút cha `khoi_lop`/`chu_de` (`ma_dinh_danh` =
        elementId của bài), hoặc `None` nếu đồ thị chưa sẵn sàng / không có
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
                record = None
                # Ưu tiên khớp CHÍNH XÁC theo elementId (= saved_lesson_plans.lesson_id).
                if lesson_id:
                    record = session.run(
                        """
                        MATCH (bh:BaiHoc) WHERE elementId(bh) = $lesson_id
                        OPTIONAL MATCH (bh)-[:THUOC_LOP]->(l:Lop)
                        OPTIONAL MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe)
                        RETURN bh, l, cd
                        LIMIT 1
                        """,
                        lesson_id=lesson_id,
                    ).single()
                # Fallback: nếu elementId không khớp, thử khớp theo lớp/chủ đề/tên bài.
                if record is None:
                    record = session.run(
                        """
                        MATCH (bh:BaiHoc)
                        OPTIONAL MATCH (bh)-[:THUOC_LOP]->(l:Lop)
                        OPTIONAL MATCH (bh)-[:THUOC_CHU_DE]->(cd:ChuDe)
                        WITH bh, l, cd
                        WHERE ($grade IS NULL OR (l IS NOT NULL AND l.ten CONTAINS $grade))
                          AND ($topic IS NULL OR (cd IS NOT NULL AND cd.ten = $topic))
                          AND ($lesson_name IS NULL OR bh.ten = $lesson_name)
                        RETURN bh, l, cd
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
                # Đồ thị hệ thống không có fulltext index -> khớp gần đúng bằng CONTAINS.
                records = session.run(
                    """
                    MATCH (node:BaiHoc)
                    OPTIONAL MATCH (node)-[:THUOC_LOP]->(l:Lop)
                    WITH node, l
                    WHERE toLower(node.ten) CONTAINS toLower($ten)
                      AND ($grade IS NULL OR (l IS NOT NULL AND l.ten CONTAINS $grade))
                    RETURN node, 1.0 AS score
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
        bh_node = record["bh"]
        bh = dict(bh_node)
        lop = dict(record["l"]) if record["l"] is not None else {}
        cd = dict(record["cd"]) if record["cd"] is not None else {}
        return {
            "ma_dinh_danh": bh_node.element_id,  # đồ thị hệ thống không có ma_dinh_danh -> dùng elementId
            "ten": bh.get("ten"),
            "khoi_lop": {"ten": lop.get("ten")},
            "chu_de": {"ten": cd.get("ten")},
            "loai": bh.get("loai"),
        }

    @staticmethod
    def _fulltext_record_to_dict(record) -> dict:
        node = record["node"]
        n = dict(node)
        return {
            "ma_dinh_danh": node.element_id,
            "ten": n.get("ten"),
            "score": record["score"],
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
                    nang_luc_tin_hoc=self._fetch_nang_luc_tin_hoc(session),
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
            "MATCH (bh:BaiHoc) WHERE elementId(bh) = $lesson_id RETURN bh", lesson_id=lesson_id
        ).single()
        if not record:
            return None
        bh = dict(record["bh"])
        bh["ma_dinh_danh"] = record["bh"].element_id
        return bh

    @staticmethod
    def _fetch_yccd(session, lesson_id: str) -> list[dict]:
        """YCCĐ lấy từ `MucTieu` của bài (đồ thị hệ thống không có nhãn `YCCD`).
        Tách nội dung mục tiêu thành từng dòng làm 1 YCCĐ để M1 đối chiếu theo mục.
        `muc_nhan_thuc=None` vì đồ thị hệ thống không gắn bậc nhận thức."""
        record = session.run(
            "MATCH (bh:BaiHoc)-[:CO_MUC_TIEU]->(mt:MucTieu) WHERE elementId(bh) = $lesson_id RETURN mt",
            lesson_id=lesson_id,
        ).single()
        if not record:
            return []
        noi_dung = (dict(record["mt"]).get("noi_dung") or "").strip()
        result = []
        for line in re.split(r"[\n;]+", noi_dung):
            text = line.strip(" -•\t")
            if text:
                result.append({"ten": text, "muc_nhan_thuc": None})
        return result

    @staticmethod
    def _fetch_all_nodes(session, label: str) -> list[dict]:
        # `label` chỉ nhận 1 trong các hằng số nội bộ gọi cố định bên dưới
        # (không nội suy từ input người dùng) — an toàn tiêm Cypher.
        records = session.run(f"MATCH (n:{label}) RETURN n")
        return [dict(record["n"]) for record in records]

    @staticmethod
    def _fetch_nang_luc_tin_hoc(session) -> list[dict]:
        """Danh mục `NangLucTinHoc` — thêm `ma_nang_luc` (= `id`, dạng NLa..NLe) mà
        M3/N3 đối chiếu."""
        records = session.run("MATCH (n:NangLucTinHoc) RETURN n")
        out = []
        for record in records:
            n = dict(record["n"])
            out.append({**n, "ma_nang_luc": n.get("id")})
        return out

    @staticmethod
    def _fetch_chi_bao_nls(session, grade: str | None) -> list[dict]:
        """Chỉ báo NLS từ nhãn `ChiBao` của đồ thị hệ thống (không gắn khối lớp nên
        không lọc theo `grade`). `muc_do` để rỗng (đồ thị không curate mức độ)."""
        records = session.run("MATCH (cb:ChiBao) RETURN cb")
        result = []
        for record in records:
            cb = dict(record["cb"])
            result.append({"ma_chi_bao": cb.get("ma"), "noi_dung": cb.get("noi_dung"), "muc_do": []})
        return result

    @staticmethod
    def _fetch_menh_de_kien_thuc(session, lesson_id: str) -> list[dict]:
        """Mệnh đề kiến thức lấy từ `ChiMuc` (các mục nội dung của bài) trong đồ thị
        hệ thống — đồ thị không có nhãn `MenhDeKienThuc` riêng."""
        records = session.run(
            """
            MATCH (bh:BaiHoc)-[:CO_CHI_MUC]->(cm:ChiMuc) WHERE elementId(bh) = $lesson_id
            RETURN cm ORDER BY cm.thu_tu
            """,
            lesson_id=lesson_id,
        )
        out = []
        for record in records:
            cm = dict(record["cm"])
            ten = cm.get("tieu_de") or cm.get("noi_dung") or ""
            out.append({"ma_dinh_danh": cm.get("id"), "ten": ten, "ma_nguon": "SGK"})
        return out

    @staticmethod
    def _fetch_dong_tu_nhan_thuc(session) -> dict:
        """Đồ thị hệ thống không có bảng `DongTuNhanThuc` -> trả rỗng. M1 bỏ qua kiểm
        bậc động từ, M2 rơi xuống phán xử bằng LLM (đã có sẵn nhánh đó)."""
        return {"do_duoc": [], "khong_do_duoc": []}

    def get_method_procedures(self, method_names: list[str]) -> dict[str, list[dict]]:
        """Quy trình chuẩn (các bước) của phương pháp/kĩ thuật dạy học — dùng đối
        chiếu C7 (trục 5). Đồ thị hệ thống lưu quy trình dưới dạng văn bản
        (`PhuongPhapDayHoc.cach_tien_hanh`), KHÔNG tách thành node `BuocQuyTrinh`.
        Trả mỗi phương pháp = 1 "bước" chứa toàn bộ mô tả quy trình để N3 đối chiếu;
        phương pháp không có trong đồ thị đơn giản không xuất hiện (KHÔNG phải lỗi).
        Trả `{}` nếu đồ thị chưa sẵn sàng / danh sách rỗng / truy vấn lỗi.
        """
        if not method_names:
            return {}

        driver = self._get_driver()
        if driver is None:
            return {}

        settings = get_settings()
        try:
            with driver.session(database=settings.kg_lpv_neo4j_database) as session:
                records = session.run(
                    """
                    MATCH (pp)
                    WHERE (pp:PhuongPhapDayHoc OR pp:KyThuatDayHoc)
                      AND pp.ten IN $method_names AND pp.cach_tien_hanh IS NOT NULL
                    RETURN pp.ten AS ten, pp.cach_tien_hanh AS cach_tien_hanh
                    """,
                    method_names=method_names,
                )
                return {
                    record["ten"]: [{"thu_tu": 1, "noi_dung": record["cach_tien_hanh"]}]
                    for record in records
                }
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("kg_lpv.graph_client.get_method_procedures_failed error=%s", exc)
            return {}

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

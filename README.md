# KHBD - Hệ thống soạn Kế hoạch bài dạy Tin học THPT

KHBD là ứng dụng web hỗ trợ giáo viên Tin học THPT xây dựng kế hoạch bài dạy theo Chương trình GDPT 2018. Dự án kết hợp quản lý lớp học, bài tập, học liệu, bài kiểm tra, bài tập lập trình và các luồng hỗ trợ AI để giáo viên có thể soạn, lưu trữ, chia sẻ và tổ chức hoạt động học tập trong cùng một hệ thống.

## Video hướng dẫn

Xem video hướng dẫn sử dụng hệ thống tại: [https://youtu.be/syU5PJJVTT4](https://youtu.be/syU5PJJVTT4)

## Tính năng chính

- Xác thực người dùng, phân quyền theo vai trò `admin`, `teacher`, `user`, `student`.
- Soạn kế hoạch bài dạy với AI, lưu kế hoạch đã tạo và xem lại kế hoạch đã lưu.
- Quản lý phiếu học tập, câu hỏi trắc nghiệm, học liệu chia sẻ và bài tập lập trình.
- Chạy mã nguồn bài tập thông qua Piston code execution engine.
- Quản lý lớp học, học sinh, nhóm học tập, bài giao và cổng làm bài cho học sinh.
- Không gian làm việc cộng tác, nhận xét chéo cá nhân/nhóm và tự động xử lý một số tác vụ theo lịch.
- Trang quản trị người dùng, giáo viên, vai trò/quyền và cấu hình mô hình AI.
- Tích hợp Neo4j để lưu/truy vấn đồ thị nội dung bài học.
- Hỗ trợ email xác thực tài khoản, đặt lại mật khẩu, tìm video YouTube, tìm ảnh minh họa và chuyển đổi PDF nếu cấu hình thêm API tương ứng.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios |
| Backend | FastAPI, Python, SQLAlchemy async, Alembic, Pydantic |
| Database | PostgreSQL 16, Neo4j Community |
| AI | Google Gemini, OpenAI hoặc Ollama qua cấu hình môi trường |
| Code execution | Piston |
| Realtime | WebSocket |
| Testing | Pytest, Vitest, Testing Library |
| Deploy | Docker Compose, Nginx |

## Cấu trúc dự án

```text
WEB1/
├── .github/workflows/ci.yml       # CI cho backend, frontend test và frontend build
├── init/
│   ├── backend/                   # FastAPI application
│   │   ├── alembic/               # Database migrations
│   │   ├── app/
│   │   │   ├── api/               # API routers
│   │   │   ├── core/              # Config, logging, security, rate limit
│   │   │   ├── db/                # Database session
│   │   │   ├── models/            # SQLAlchemy models
│   │   │   ├── schemas/           # Pydantic schemas
│   │   │   ├── services/          # Business logic
│   │   │   └── main.py            # FastAPI entrypoint
│   │   ├── scripts/               # Data/import/Neo4j helper scripts
│   │   ├── tests/                 # Backend tests
│   │   ├── Dockerfile
│   │   ├── requirements.txt
│   │   └── requirements-dev.txt
│   ├── frontend/                  # React/Vite application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── contexts/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   ├── scripts/                   # Backup, logs, update scripts
│   └── docker-compose.yml         # PostgreSQL, Neo4j, backend, frontend, Piston
└── README.md
```

## Yêu cầu

- Docker Engine 24+ và Docker Compose v2 cho cách chạy khuyến nghị.
- Node.js 20+ nếu chạy frontend ở chế độ development.
- Python 3.12+ nếu chạy backend trực tiếp trên máy.
- PostgreSQL và Neo4j nếu không dùng Docker Compose.

## Chạy nhanh bằng Docker Compose

```bash
git clone <repository-url>
cd WEB1/init

cp .env.example .env
cp backend/.env.example backend/.env
```

Cập nhật tối thiểu các biến sau:

```env
# init/.env
POSTGRES_USER=khbd
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=khbd
FRONTEND_PORT=80
FRONTEND_BASE_URL=http://localhost
CORS_ORIGINS=http://localhost
COOKIE_SECURE=false
```

```env
# init/backend/.env
SECRET_KEY=replace-with-a-random-secret
INTERNAL_API_KEY=replace-with-a-random-internal-key
SQL_DATABASE_URL=postgresql+asyncpg://khbd:your_secure_password_here@postgres:5432/khbd
CHAT_AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
COOKIE_SECURE=false
CORS_ORIGINS=http://localhost,http://localhost:5173,http://127.0.0.1:5173
```

Tạo khóa ngẫu nhiên:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Khởi động toàn bộ hệ thống:

```bash
docker compose up -d --build
```

Sau khi container khởi động:

- Frontend: `http://localhost`
- Backend health check: `http://localhost:8000/health`
- Swagger/OpenAPI: `http://localhost:8000/docs`
- Neo4j Browser: `http://localhost:7474`

## Chạy development local

### Backend

```bash
cd init/backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements-dev.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Khi chạy backend local, cần có PostgreSQL, Neo4j và Piston đang hoạt động hoặc cấu hình các URL tương ứng trong `init/backend/.env`.
Với local ngoài Docker, `SQL_DATABASE_URL` thường dùng host `localhost`; với Docker Compose, backend dùng service name `postgres`.

### Frontend

```bash
cd init/frontend
cp .env.example .env
npm ci
npm run dev
```

Frontend development server mặc định chạy tại `http://localhost:5173` và gọi API qua `VITE_API_URL`, mặc định là `http://localhost:8000/api/v1`.

## Kiểm thử

Backend:

```bash
cd init/backend
pip install -r requirements-dev.txt
python -m pytest tests/ -v
```

Frontend:

```bash
cd init/frontend
npm ci
npm test
npx tsc --noEmit
npm run build
```

CI trong `.github/workflows/ci.yml` chạy backend tests, frontend tests, type check và frontend build trên pull request hoặc push vào nhánh `main`.

## Migrations

```bash
cd init/backend

# Tạo migration mới
alembic revision --autogenerate -m "describe change"

# Áp dụng migration
alembic upgrade head

# Rollback một migration
alembic downgrade -1
```

Khi chạy bằng Docker Compose, backend entrypoint tự chạy migration trừ khi đặt `SKIP_MIGRATIONS=true` trong `init/.env`.

## Lệnh quản trị Docker

```bash
cd init

# Xem trạng thái service
docker compose ps

# Xem logs
./scripts/logs.sh backend
./scripts/logs.sh frontend
./scripts/logs.sh all

# Backup database
./scripts/backup.sh

# Cập nhật sau khi pull code mới
./scripts/update.sh

# Restart
docker compose restart

# Dừng service
docker compose down

# Dừng và xóa volume dữ liệu
docker compose down -v
```

## API chính

Backend mount API version tại `/api/v1` và hiện có các nhóm route chính:

- `/auth`: đăng ký, đăng nhập, refresh token, xác thực email, đặt lại mật khẩu.
- `/admin`: chức năng quản trị hệ thống.
- `/roles`, `/permissions`, `/users`: người dùng, vai trò và phân quyền.
- `/lesson-builder`: tạo và quản lý kế hoạch bài dạy.
- `/classrooms`, `/assignments`, `/student`: lớp học, bài giao và cổng học sinh.
- `/peer-review`: nhận xét chéo.
- `/guide-cards`, `/teaching-rules`: hướng dẫn và quy tắc hỗ trợ AI.
- Các route chia sẻ phiếu học tập, quiz, bài tập lập trình và nhận xét kế hoạch bài dạy.

WebSocket được mount trực tiếp ngoài prefix API để phục vụ cộng tác realtime.

## KG-LPV — Kiểm chứng KHBD

Module kiểm chứng tự động kế hoạch bài dạy (KHBD) do AI sinh ra, đối chiếu với một đồ thị
tri thức Neo4j **riêng biệt** (chương trình GDPT 2018, TT 02/2025, CV 3456/5512...). Kiểm
chứng chạy nền theo 3 nhánh:

- **N1 — Định danh**: so khớp thuật toán (không dùng LLM) KHBD với đúng khối lớp/chủ đề/bài
  học trong cây chương trình → mã lỗi `D1`.
- **N2 — Đối chiếu chương trình**: mục tiêu, năng lực, phẩm chất, năng lực số khai báo có
  đúng và tồn tại trong chương trình chuẩn không → mã lỗi `M1`–`M6`.
- **N3 — Nhất quán sư phạm**: 6 trục nhất quán (mục tiêu ↔ hoạt động ↔ sản phẩm ↔ đánh giá,
  mức nhận thức, phương pháp/kĩ thuật dạy học, tiến trình & điều kiện triển khai) → mã lỗi
  `C1`–`C8`.

Tổng cộng **15 mã lỗi**, mỗi phát hiện đều kèm bằng chứng truy vết về đồ thị (mã văn bản, số
ký hiệu, ngày hiệu lực, vị trí trang) và giải thích tiếng Việt. Giáo viên có thể xem sổ lỗi,
bác bỏ từng phát hiện, hoặc yêu cầu sửa cục bộ + xem diff trước khi áp dụng vào KHBD.

### Bật/tắt 3 tầng

Module tắt hoàn toàn theo mặc định và có thể bật/tắt độc lập ở 3 tầng:

| Tầng | Cơ chế | Cần restart? |
|---|---|---|
| 1. Hạ tầng | Docker Compose profile `kg-lpv` cho service `neo4j-kglpv` | — (chọn lúc `docker compose up`) |
| 2. Tiến trình | Env `KG_LPV_ENABLED=true` trong `init/backend/.env` | Có |
| 3. Runtime | Cờ `feature_flags` (key `kg_lpv`) qua trang quản trị hoặc `PUT /api/v1/admin/feature-flags/kg_lpv` | Không |

Khi tắt (ở bất kỳ tầng nào): không kết nối đồ thị KG-LPV, các route `/api/v1/kg-lpv/*`
không hoạt động, frontend ẩn toàn bộ UI liên quan — ứng dụng chính không bị ảnh hưởng.

### Đồ thị KG-LPV riêng

Đồ thị KG-LPV là một instance Neo4j **tách biệt** khỏi Neo4j chính của ứng dụng (nội dung
bài học, cổng `7474`/`7687`):

- Browser: `http://localhost:7475`
- Bolt: `bolt://localhost:7688`
- Chỉ đọc (read-only) lúc runtime; dữ liệu chỉ được ghi offline qua script nạp liệu.

Khởi động đồ thị (không chạy nếu không truyền `--profile kg-lpv`):

```bash
cd init
docker compose --profile kg-lpv up -d neo4j-kglpv
```

Biến môi trường trong `init/backend/.env`: `KG_LPV_ENABLED`, `KG_LPV_NEO4J_URI`,
`KG_LPV_NEO4J_USERNAME`, `KG_LPV_NEO4J_PASSWORD`, `KG_LPV_NEO4J_DATABASE`.

### Nạp dữ liệu chuẩn vào đồ thị

N2/N3 chỉ đưa ra được phán xử có căn cứ khi đồ thị đã có dữ liệu chương trình. Script nạp
liệu nằm ở `init/backend/scripts/kg_lpv/` (xem `scripts/kg_lpv/README.md` để biết đầy đủ
lược đồ nạp liệu):

```bash
cd init/backend
cypher-shell -a bolt://localhost:7688 -u neo4j -p <mật khẩu> -f scripts/kg_lpv/schema.cypher
python scripts/kg_lpv/import_kg.py            # nạp scripts/kg_lpv/samples/ (dữ liệu mẫu)
python scripts/kg_lpv/validate_graph.py       # kiểm 100% vết xuất xứ + truy vấn mẫu
```

`import_kg.py` là idempotent (dùng `MERGE`) và từ chối mọi bản ghi thiếu vết xuất xứ (`ma_nguon`,
`so_ky_hieu`, `ngay_hieu_luc`, `vi_tri_trang`). Nếu đồ thị chưa có dữ liệu hoặc mất kết nối,
N2/N3 trả về nhiều phát hiện "không phán xử được" thay vì báo lỗi sai — module vẫn chạy được,
chỉ thiếu căn cứ đối chiếu.

## Bảo mật và cấu hình production

- Không commit file `.env` hoặc khóa API thật lên GitHub.
- Bắt buộc thay `SECRET_KEY` và `INTERNAL_API_KEY`; backend sẽ từ chối khởi động nếu vẫn chứa giá trị `CHANGE-ME`.
- Dùng mật khẩu PostgreSQL và Neo4j mạnh trong production.
- Khi dùng HTTPS, đặt `COOKIE_SECURE=true` và cấu hình `FRONTEND_BASE_URL`, `CORS_ORIGINS` đúng domain thật.
- Chỉ mở các API key cần dùng: Gemini/OpenAI/Ollama, SMTP, YouTube Data API, Google Custom Search, LlamaParse.
- Piston container chạy với `privileged: true`; nên triển khai trên hạ tầng tin cậy và giới hạn truy cập mạng phù hợp.

## Triển khai

Tài liệu triển khai chi tiết nằm trong:

- `init/DEPLOYMENT.md`
- `init/DEPLOY_GUIDE.md`

Luồng production cơ bản:

```bash
cd init
cp .env.example .env
cp backend/.env.example backend/.env
docker compose up -d --build
```

Nếu deploy lên server riêng, cập nhật domain trong `FRONTEND_BASE_URL`, `CORS_ORIGINS`, bật HTTPS và đặt `COOKIE_SECURE=true`.

## License

Dự án hiện chưa có file `LICENSE`. Nếu repository được công khai trên GitHub, hãy bổ sung giấy phép phù hợp trước khi cho phép người khác sử dụng hoặc phân phối lại mã nguồn.

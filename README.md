# KHBD - Hệ thống Soạn Kế hoạch Bài dạy Tin học THPT

Ứng dụng hỗ trợ giáo viên Tin học THPT soạn Kế hoạch bài dạy (Giáo án) theo Chương trình GDPT 2018, tích hợp AI (Google Gemini).

## 🚀 Công nghệ sử dụng

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, Alembic
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **AI**: Google Gemini API
- **Code Execution**: Piston
- **Deploy**: Docker, Docker Compose, Nginx

## 📋 Yêu cầu hệ thống

- Docker Engine 24+
- Docker Compose v2+
- Git

## 🐳 Triển khai với Docker (Production)

### 1. Clone repository

```bash
git clone <repository-url>
cd WEB1
```

### 2. Cấu hình môi trường

```bash
cd init

# Copy file cấu hình Docker Compose
cp .env.example .env

# Copy file cấu hình Backend
cp backend/.env.example backend/.env
```

### 3. Chỉnh sửa file cấu hình

**File `init/.env`** (Docker Compose):
```bash
# Đặt mật khẩu database mạnh
POSTGRES_PASSWORD=your_secure_password_here

# Cấu hình domain production (nếu có)
FRONTEND_BASE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
COOKIE_SECURE=true
```

**File `init/backend/.env`** (Backend):
```bash
# BẮT BUỘC: Generate secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=<paste-generated-key-here>

# BẮT BUỘC: Generate internal API key
python -c "import secrets; print(secrets.token_urlsafe(32))"
INTERNAL_API_KEY=<paste-generated-key-here>

# Database sẽ tự động kết nối với Docker PostgreSQL
SQL_DATABASE_URL=postgresql+asyncpg://khbd:your_password@postgres:5432/khbd

# BẮT BUỘC: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Email SMTP (tùy chọn - nếu cần xác thực email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 4. Deploy

```bash
# Chạy script deploy (tự động build và start)
chmod +x deploy.sh scripts/*.sh
./deploy.sh

# Hoặc chạy thủ công
docker compose up -d --build
```

### 5. Truy cập ứng dụng

- **Frontend**: http://your-server-ip (hoặc http://localhost nếu chạy local)
- **Backend API**: http://your-server-ip/api/v1/docs
- **Health Check**: http://your-server-ip/api/v1/health

## 🛠️ Các lệnh quản lý

```bash
# Xem logs
cd init
./scripts/logs.sh backend    # Backend logs
./scripts/logs.sh frontend   # Frontend logs
./scripts/logs.sh all        # All services

# Cập nhật khi có code mới
git pull
./scripts/update.sh

# Backup database
./scripts/backup.sh

# Restart services
docker compose restart

# Stop all services
docker compose down

# Stop và xóa volumes (CẢNH BÁO: Xóa database!)
docker compose down -v
```

## 💻 Phát triển Local (Development)

### Backend

```bash
cd init/backend

# Tạo virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# hoặc
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Chạy migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd init/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 📁 Cấu trúc dự án

```
WEB1/
├── init/
│   ├── backend/              # FastAPI backend
│   │   ├── app/
│   │   │   ├── api/          # API routes
│   │   │   ├── core/         # Core config, security
│   │   │   ├── db/           # Database
│   │   │   ├── models/       # SQLAlchemy models
│   │   │   ├── schemas/      # Pydantic schemas
│   │   │   └── services/     # Business logic
│   │   ├── alembic/          # Database migrations
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh
│   │   └── requirements.txt
│   │
│   ├── frontend/             # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   │
│   ├── scripts/              # Management scripts
│   │   ├── backup.sh
│   │   ├── logs.sh
│   │   └── update.sh
│   │
│   ├── docker-compose.yml    # Docker orchestration
│   ├── deploy.sh             # Deployment script
│   └── DEPLOYMENT.md         # Chi tiết deployment
│
└── README.md                 # File này
```

## 🔒 Bảo mật

- **KHÔNG** commit file `.env` chứa thông tin nhạy cảm
- **BẮT BUỘC** đổi `SECRET_KEY` và `INTERNAL_API_KEY` trong production
- Sử dụng mật khẩu database mạnh
- Bật HTTPS và set `COOKIE_SECURE=true` trong production
- Giới hạn CORS origins chỉ cho domain của bạn

## 📝 Migrations

```bash
# Tạo migration mới
cd init/backend
alembic revision --autogenerate -m "Description"

# Chạy migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🐛 Troubleshooting

### Backend không khởi động
- Kiểm tra logs: `./scripts/logs.sh backend`
- Đảm bảo đã set `SECRET_KEY` và không chứa "CHANGE-ME"
- Kiểm tra database connection

### Frontend không load
- Kiểm tra logs: `./scripts/logs.sh frontend`
- Đảm bảo backend đã start thành công
- Kiểm tra CORS settings

### Database connection failed
- Đảm bảo PostgreSQL container đang chạy: `docker ps`
- Kiểm tra password trong `.env` và `backend/.env` khớp nhau

## 📞 Hỗ trợ

Xem chi tiết tại [DEPLOYMENT.md](init/DEPLOYMENT.md)

## 📄 License

Dự án Khóa luận tốt nghiệp - Hệ thống hỗ trợ soạn Kế hoạch bài dạy Tin học THPT

---

**Lưu ý**: Đây là phiên bản production-ready. Đảm bảo đã cấu hình đầy đủ trước khi deploy.

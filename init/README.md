# Hệ thống Soạn Kế hoạch Bài dạy Tin học THPT

Ứng dụng hỗ trợ giáo viên Tin học THPT soạn Kế hoạch bài dạy (Giáo án) theo Chương trình GDPT 2018, tích hợp AI (Gemini) và cơ sở dữ liệu đồ thị Neo4j.

## Tính năng chính

### 🤖 Chat AI - Soạn giáo án thông minh
- Tích hợp **Gemini AI** để sinh Kế hoạch bài dạy chi tiết
- Truy vấn **Neo4j** để lấy dữ liệu bài học (lớp, chủ đề, mục tiêu, năng lực, chỉ mục, nội dung)
- Tìm kiếm ngữ nghĩa (**Semantic Search**) với embeddings
- Tham chiếu tài liệu từ PostgreSQL (năng lực chung, phẩm chất, thiết bị)

### 👤 Quản lý người dùng
- Đăng ký, đăng nhập với xác thực JWT
- Xác minh email qua SMTP
- Đặt lại mật khẩu
- Đổi mật khẩu
- Hồ sơ cá nhân và cài đặt (theme, ngôn ngữ)

### 🔐 Phân quyền RBAC
- Quản lý vai trò (Admin, Giáo viên, User)
- Quản lý quyền hạn chi tiết
- Gán vai trò cho người dùng

### 📁 Quản lý danh mục & tài liệu
- Tạo, sửa, xóa danh mục tài liệu
- Upload và quản lý tài liệu tham khảo
- Embeddings cho tìm kiếm ngữ nghĩa

---

## Công nghệ sử dụng

### Backend
- **FastAPI** - Framework Python async
- **SQLAlchemy** - ORM với PostgreSQL/SQLite
- **Neo4j** - Cơ sở dữ liệu đồ thị
- **Gemini AI** - Sinh nội dung giáo án
- **Alembic** - Database migrations
- **JWT** - Xác thực token
- **SMTP** - Gửi email

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

---

## Cấu trúc dự án

```
backend/
  app/
    api/routes/         # API endpoints
      auth.py           # Đăng ký, đăng nhập, xác minh email
      users.py          # Quản lý người dùng, đổi mật khẩu
      chat.py           # Chat AI, soạn giáo án
      lesson_plan.py    # Sinh kế hoạch bài dạy
      categories.py     # Quản lý danh mục
      documents.py      # Quản lý tài liệu
      roles.py          # Quản lý RBAC
    core/               # Config, security, logging
    db/                 # Database session
    models/             # SQLAlchemy models
    schemas/            # Pydantic schemas
    services/           # Business logic
      chat_ai.py        # Xử lý chat AI
      lesson_plan_generator.py  # Sinh giáo án với Gemini
      query_neo4j.py    # Truy vấn Neo4j
      semantic_lesson_search.py # Tìm kiếm ngữ nghĩa
      email_service.py  # Gửi email
  alembic/              # Database migrations
  requirements.txt

frontend/
  src/
    components/         # UI components
      chat/             # Chat interface
      admin/            # Admin console
      account/          # Account management
    contexts/           # React contexts (Theme, Toast)
    hooks/              # Custom hooks (useAuth, useChat, useRbacManagement)
    pages/              # Page views
      chat/             # Trang chat soạn giáo án
      admin/            # Quản trị hệ thống
      account/          # Tài khoản cá nhân
      auth/             # Đăng nhập, đăng ký
    services/           # API services
    types/              # TypeScript types
  package.json
```

---

## Cài đặt

### Backend

1. Tạo môi trường ảo Python:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # Linux/Mac
   ```

2. Cài đặt dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Cấu hình biến môi trường (`.env`):
   ```env
   # Database
   DATABASE_URL=sqlite+aiosqlite:///./app.db
   
   # JWT
   SECRET_KEY=your-secret-key
   
   # Gemini AI
   GEMINI_API_KEY=your-gemini-api-key
   GEMINI_MODEL=gemini-2.5-flash
   
   # Neo4j
   NEO4J_URI=bolt://localhost:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your-password
   
   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_USE_TLS=true
   SMTP_DEFAULT_SENDER=your-email@gmail.com
   
   # Frontend
   FRONTEND_BASE_URL=http://localhost:5173
   ```

4. Chạy migrations:
   ```bash
   alembic upgrade head
   ```

5. Khởi động server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend

1. Cài đặt dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Cấu hình `.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. Khởi động dev server:
   ```bash
   npm run dev
   ```

Ứng dụng chạy tại: `http://localhost:5173`

---

## Triển khai (Deployment)

### Backend (Render)
- Cấu hình các biến môi trường trên Render dashboard
- Đặc biệt cấu hình SMTP cho gửi email

### Frontend (Vercel)
- Cấu hình `VITE_API_URL` trỏ đến backend URL

---

## API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/verify-email` | Xác minh email |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |
| POST | `/api/users/me/change-password` | Đổi mật khẩu |
| GET | `/api/users/me` | Lấy thông tin user |
| POST | `/api/chat/conversations` | Tạo cuộc hội thoại mới |
| POST | `/api/chat/conversations/{id}/messages` | Gửi tin nhắn |
| GET | `/api/chat/conversations` | Danh sách hội thoại |
| POST | `/api/lesson-plan/generate` | Sinh kế hoạch bài dạy |
| GET | `/api/categories` | Danh sách danh mục |
| GET | `/api/documents` | Danh sách tài liệu |
| GET | `/api/roles` | Danh sách vai trò |
| DELETE | `/api/users/{id}` | Xóa người dùng (Admin) |

---

## Tác giả

Dự án phát triển cho Khóa luận tốt nghiệp - Hệ thống hỗ trợ soạn Kế hoạch bài dạy Tin học THPT.

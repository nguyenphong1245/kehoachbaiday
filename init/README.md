# KHBD - Hệ thống Soạn Kế hoạch Bài dạy Tin học THPT

Ứng dụng hỗ trợ giáo viên Tin học THPT soạn Kế hoạch bài dạy (Giáo án) theo Chương trình GDPT 2018, tích hợp AI (Gemini).

## Công nghệ sử dụng

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy
- **Frontend**: React, TypeScript, TailwindCSS
- **AI**: Google Gemini
- **Deploy**: Docker, Nginx

## Triển khai với Docker

### Yêu cầu
- Docker Engine 24+
- Docker Compose v2

### Các bước triển khai

1. Copy file cấu hình:
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

2. Chỉnh sửa file `.env` và `backend/.env` với thông tin của bạn

3. Chạy deploy:
```bash
chmod +x deploy.sh scripts/*.sh
./deploy.sh
```

4. Truy cập ứng dụng tại: `http://your-server-ip`

## Các lệnh quản lý

```bash
# Xem logs
./scripts/logs.sh backend
./scripts/logs.sh all

# Cập nhật phiên bản mới
./scripts/update.sh

# Backup database
./scripts/backup.sh

# Restart services
docker compose restart
```

## Hướng dẫn chi tiết

Xem file [DEPLOYMENT.md](DEPLOYMENT.md) để biết hướng dẫn triển khai chi tiết.

## Tác giả

Dự án phát triển cho Khóa luận tốt nghiệp - Hệ thống hỗ trợ soạn Kế hoạch bài dạy Tin học THPT.

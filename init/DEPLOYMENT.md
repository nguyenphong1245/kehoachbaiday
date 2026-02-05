# Hướng Dẫn Deploy KHBD lên Server

## Yêu Cầu Server

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Tối thiểu 2GB (khuyến nghị 4GB)
- **CPU**: 2 cores+
- **Disk**: 20GB+
- **Docker**: Docker Engine 24+ và Docker Compose v2

---

## Phần 1: Cài Đặt Docker trên Server

### Ubuntu/Debian:
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user vào group docker (không cần sudo)
sudo usermod -aG docker $USER

# Logout và login lại để có hiệu lực
exit
# Sau đó SSH lại vào server

# Kiểm tra Docker
docker --version
docker compose version
```

### CentOS/RHEL:
```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

---

## Phần 2: Deploy Lần Đầu

### Bước 1: Tải code lên server

**Cách A: Sử dụng Git (khuyến nghị)**
```bash
# Trên server
cd /opt
sudo mkdir khbd && sudo chown $USER:$USER khbd
cd khbd

# Clone repository
git clone https://github.com/your-username/khbd.git .

# Hoặc nếu repo private:
git clone https://your-username:your-token@github.com/your-username/khbd.git .
```

**Cách B: Sử dụng SCP (từ máy local)**
```bash
# Trên máy local (Windows PowerShell hoặc Git Bash)
scp -r init/* user@your-server-ip:/opt/khbd/
```

### Bước 2: Cấu hình môi trường

```bash
cd /opt/khbd

# Copy file env mẫu
cp .env.example .env
cp backend/.env.example backend/.env

# Chỉnh sửa file .env (Docker Compose)
nano .env
```

**Nội dung file `.env` cần chỉnh:**
```env
# Database
POSTGRES_USER=khbd
POSTGRES_PASSWORD=Mat_Khau_Manh_123!

# Port frontend (mặc định 80)
FRONTEND_PORT=80

# Domain của bạn (quan trọng!)
FRONTEND_BASE_URL=https://khbd.yourdomain.com
CORS_ORIGINS=https://khbd.yourdomain.com

# Cookie (true nếu dùng HTTPS)
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

```bash
# Chỉnh sửa backend/.env
nano backend/.env
```

**Nội dung `backend/.env` cần chỉnh:**
```env
# Tạo secret key mới
SECRET_KEY=<chạy: python3 -c "import secrets; print(secrets.token_urlsafe(32)">

# Database (Docker sẽ override, nhưng cần có)
SQL_DATABASE_URL=postgresql+asyncpg://khbd:password@localhost:5432/khbd

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_DEFAULT_SENDER=your-email@gmail.com

# AI API Key
GEMINI_API_KEY=your-gemini-api-key

# Các cấu hình khác giữ nguyên...
```

### Bước 3: Chạy deploy

```bash
cd /opt/khbd

# Cấp quyền execute cho scripts
chmod +x deploy.sh scripts/*.sh

# Chạy deploy
./deploy.sh
```

### Bước 4: Kiểm tra

```bash
# Xem trạng thái services
docker compose ps

# Xem logs nếu có lỗi
./scripts/logs.sh backend
./scripts/logs.sh all
```

Truy cập: `http://your-server-ip` hoặc `http://your-domain.com`

---

## Phần 3: Cập Nhật Phiên Bản Mới

### Cách nhanh (dùng script):
```bash
cd /opt/khbd
./scripts/update.sh
```

### Cách thủ công:
```bash
cd /opt/khbd

# 1. Backup database
./scripts/backup.sh

# 2. Pull code mới
git pull origin main

# 3. Rebuild và restart
docker compose build --no-cache
docker compose up -d

# 4. Xem logs
./scripts/logs.sh backend
```

---

## Phần 4: Các Lệnh Quản Lý Thường Dùng

```bash
# ===== TRẠNG THÁI =====
docker compose ps                    # Xem trạng thái services
docker compose ps -a                 # Xem tất cả (bao gồm đã stop)

# ===== LOGS =====
./scripts/logs.sh backend           # Logs backend
./scripts/logs.sh frontend          # Logs frontend
./scripts/logs.sh postgres          # Logs database
./scripts/logs.sh all               # Tất cả logs

# ===== RESTART =====
docker compose restart              # Restart tất cả
docker compose restart backend      # Restart chỉ backend

# ===== STOP/START =====
docker compose stop                 # Dừng tất cả
docker compose start                # Khởi động lại
docker compose down                 # Dừng và xóa containers
docker compose up -d                # Khởi động

# ===== DATABASE =====
./scripts/backup.sh                 # Backup database

# Restore database từ backup:
cat backups/db_20240101_120000.sql | docker compose exec -T postgres psql -U khbd khbd

# Truy cập database:
docker compose exec postgres psql -U khbd khbd

# ===== CLEANUP =====
docker system prune -f              # Xóa images/containers không dùng
docker volume prune -f              # Xóa volumes không dùng (CẨN THẬN!)
```

---

## Phần 5: Cấu Hình HTTPS với Nginx Reverse Proxy

Nếu bạn muốn dùng HTTPS, cài đặt Nginx trên host:

```bash
# Cài Nginx và Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Tạo config nginx
sudo nano /etc/nginx/sites-available/khbd
```

Nội dung:
```nginx
server {
    listen 80;
    server_name khbd.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE support
        proxy_read_timeout 300s;
        proxy_buffering off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/khbd /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Cài SSL certificate
sudo certbot --nginx -d khbd.yourdomain.com

# Đổi port trong .env
FRONTEND_PORT=8080
COOKIE_SECURE=true

# Restart
docker compose up -d
```

---

## Phần 6: Troubleshooting

### Lỗi "permission denied"
```bash
sudo chown -R $USER:$USER /opt/khbd
chmod +x deploy.sh scripts/*.sh
```

### Lỗi "port already in use"
```bash
# Kiểm tra port đang dùng
sudo lsof -i :80
# Đổi FRONTEND_PORT trong .env sang port khác
```

### Backend không start
```bash
# Xem logs chi tiết
docker compose logs backend --tail=200

# Kiểm tra database connection
docker compose exec backend python -c "from app.db.session import engine; print('OK')"
```

### Database bị lỗi
```bash
# Reset database (MẤT DỮ LIỆU!)
docker compose down -v
docker compose up -d
```

### Cleanup khi hết dung lượng
```bash
# Xóa tất cả không dùng
docker system prune -af
docker volume prune -f
```

---

## Cấu Trúc Thư Mục

```
/opt/khbd/
├── .env                    # Config Docker Compose
├── docker-compose.yml      # Docker services
├── deploy.sh              # Script deploy lần đầu
├── backend/
│   ├── .env               # Config backend app
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
├── scripts/
│   ├── update.sh          # Cập nhật phiên bản
│   ├── backup.sh          # Backup database
│   └── logs.sh            # Xem logs
└── backups/               # Database backups
```

---

## Liên Hệ Hỗ Trợ

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub repository.

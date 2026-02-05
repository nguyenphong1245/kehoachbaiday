# Hướng dẫn Deploy lên Server

## 📋 Chuẩn bị Server

### Yêu cầu tối thiểu:
- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: 2GB (khuyến nghị 4GB+)
- **CPU**: 2 cores
- **Disk**: 20GB+
- **Network**: Có kết nối internet

### Cài đặt Docker và Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user vào docker group (để chạy docker không cần sudo)
sudo usermod -aG docker $USER

# Cài đặt Docker Compose
sudo apt install docker-compose-plugin -y

# Kiểm tra version
docker --version
docker compose version

# Logout và login lại để áp dụng group membership
```

## 🚀 Deploy Ứng Dụng

### Bước 1: Clone Repository

```bash
# Tạo thư mục cho project
mkdir -p ~/projects
cd ~/projects

# Clone repository
git clone https://github.com/nguyenphong1245/KHBD.git
cd KHBD/init
```

### Bước 2: Cấu hình Environment

```bash
# Copy file .env mẫu
cp .env.example .env
cp backend/.env.example backend/.env
```

#### Chỉnh sửa `init/.env`:

```bash
nano .env
```

Cập nhật các giá trị sau:

```env
# Database - ĐẶT MẬT KHẨU MẠNH!
POSTGRES_PASSWORD=your_very_strong_password_here_2025

# Production domain (nếu có domain)
FRONTEND_BASE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# Nếu có HTTPS
COOKIE_SECURE=true
```

#### Chỉnh sửa `backend/.env`:

```bash
nano backend/.env
```

**BẮT BUỘC** - Generate SECRET_KEY và INTERNAL_API_KEY:

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy kết quả vào SECRET_KEY

# Generate INTERNAL_API_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# Copy kết quả vào INTERNAL_API_KEY
```

Cập nhật các giá trị trong `backend/.env`:

```env
# CRITICAL - Phải thay đổi!
SECRET_KEY=<paste-generated-key-here>
INTERNAL_API_KEY=<paste-generated-key-here>

# Database URL - phải khớp với password trong init/.env
SQL_DATABASE_URL=postgresql+asyncpg://khbd:your_very_strong_password_here_2025@postgres:5432/khbd

# GEMINI API KEY - BẮT BUỘC
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio

# Email SMTP (optional - bỏ qua nếu không dùng)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
```

### Bước 3: Deploy

```bash
# Make scripts executable
chmod +x deploy.sh scripts/*.sh

# Deploy (build + start)
./deploy.sh

# Hoặc chạy thủ công
docker compose up -d --build
```

### Bước 4: Kiểm tra

```bash
# Xem logs
./scripts/logs.sh all

# Kiểm tra services đang chạy
docker ps

# Test health check
curl http://localhost/api/v1/health
# Kết quả: {"status":"ok"}
```

### Bước 5: Cấu hình Domain & HTTPS (Optional)

#### A. Nếu có domain và muốn dùng HTTPS:

1. **Cài đặt Nginx reverse proxy trên host**:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

2. **Tạo config Nginx**:

```bash
sudo nano /etc/nginx/sites-available/khbd
```

Nội dung:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

3. **Enable site và cài SSL**:

```bash
sudo ln -s /etc/nginx/sites-available/khbd /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Cài SSL certificate (Let's Encrypt - FREE)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

4. **Update `.env` để dùng HTTPS**:

```env
FRONTEND_BASE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
COOKIE_SECURE=true
```

5. **Restart services**:

```bash
docker compose restart
```

#### B. Nếu chỉ dùng IP (không có domain):

Truy cập: `http://your-server-ip`

## 🛠️ Quản lý Sau Deploy

### Xem Logs

```bash
# Xem logs backend
./scripts/logs.sh backend

# Xem logs frontend
./scripts/logs.sh frontend

# Xem logs tất cả services
./scripts/logs.sh all

# Follow logs realtime
docker compose logs -f backend
```

### Update Code Mới

```bash
# Pull code mới từ GitHub
git pull

# Update và rebuild
./scripts/update.sh

# Hoặc thủ công
docker compose down
docker compose up -d --build
```

### Backup Database

```bash
# Chạy backup script
./scripts/backup.sh

# Backup sẽ được lưu trong thư mục backups/
# File format: backup_YYYY-MM-DD_HH-MM-SS.sql
```

### Restore Database

```bash
# Stop backend
docker compose stop backend

# Restore từ backup file
docker compose exec postgres psql -U khbd -d khbd < backups/backup_2025-02-05_12-30-45.sql

# Start backend
docker compose start backend
```

### Restart Services

```bash
# Restart tất cả
docker compose restart

# Restart service cụ thể
docker compose restart backend
docker compose restart frontend
```

### Stop/Start Services

```bash
# Stop tất cả (giữ data)
docker compose stop

# Start lại
docker compose start

# Stop và xóa containers (GIỮ data)
docker compose down

# Stop và XÓA TOÀN BỘ data (CẢNH BÁO!)
docker compose down -v
```

## 🔒 Bảo mật Production

### 1. Firewall

```bash
# Chỉ mở cổng cần thiết
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Change Default Ports

Nếu muốn, có thể đổi port trong `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "8080:80"  # Thay vì 80:80
```

### 3. Regular Updates

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d
```

### 4. Monitor Logs

```bash
# Setup logrotate để tránh logs quá lớn
sudo nano /etc/logrotate.d/docker-compose
```

Nội dung:

```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
```

## 🐛 Troubleshooting

### Backend không start

```bash
# Xem logs chi tiết
docker compose logs backend

# Thường là do:
# 1. SECRET_KEY chưa đổi (có chứa "CHANGE-ME")
# 2. Database connection failed (sai password)
# 3. Thiếu GEMINI_API_KEY
```

### Database connection failed

```bash
# Kiểm tra PostgreSQL
docker compose logs postgres

# Kiểm tra password khớp nhau
grep POSTGRES_PASSWORD .env
grep SQL_DATABASE_URL backend/.env
```

### Port đã được sử dụng

```bash
# Kiểm tra process đang dùng port 80
sudo lsof -i :80

# Kill process hoặc đổi port trong docker-compose.yml
```

### Disk full

```bash
# Check disk space
df -h

# Clean unused Docker resources
docker system prune -a --volumes

# Xóa old images
docker image prune -a
```

## 📊 Monitoring

### Kiểm tra Resource Usage

```bash
# CPU, Memory usage của containers
docker stats

# Disk usage
docker system df
```

### Health Checks

```bash
# Check all services health
docker compose ps

# API health check
curl http://localhost/api/v1/health

# Database check
docker compose exec postgres pg_isready -U khbd
```

## 🎯 Best Practices

1. **Backup thường xuyên**: Chạy `./scripts/backup.sh` mỗi ngày
2. **Monitor logs**: Check logs định kỳ để phát hiện lỗi sớm
3. **Update code**: Pull code mới từ GitHub thường xuyên
4. **Bảo mật**: Luôn dùng HTTPS trong production
5. **Resource monitoring**: Theo dõi CPU, RAM, Disk

## 📞 Support

- GitHub Issues: https://github.com/nguyenphong1245/KHBD/issues
- Documentation: [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Chúc bạn deploy thành công! 🚀**

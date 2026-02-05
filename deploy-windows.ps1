# KHBD Deployment Script for Windows
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "KHBD Auto Deployment to Server" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$server = "14.225.204.15"
$username = "root"
$password = "ySoJnFdbsuU9bFOga5cP"

# Create deployment script
$deployScript = @'
#!/bin/bash
set -e
echo "Starting KHBD deployment..."

# Update system
apt update -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Install Docker Compose
apt install -y docker-compose-plugin

# Create project directory
mkdir -p /root/khbd-app
cd /root/khbd-app

# Clone repository
if [ -d ".git" ]; then
    git pull
else
    git clone https://github.com/nguyenphong1245/KHBD.git .
fi

cd init

# Generate secrets
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
INTERNAL_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")

# Create .env
cat > .env << EOF
POSTGRES_USER=khbd
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=khbd
FRONTEND_PORT=80
FRONTEND_BASE_URL=http://14.225.204.15
CORS_ORIGINS=http://14.225.204.15
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
EOF

# Create backend .env
cat > backend/.env << EOF
SECRET_KEY=$SECRET_KEY
INTERNAL_API_KEY=$INTERNAL_KEY
SQL_DATABASE_URL=postgresql+asyncpg://khbd:$DB_PASSWORD@postgres:5432/khbd
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_DAYS=30
EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES=30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=
FRONTEND_BASE_URL=http://14.225.204.15
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
CORS_ORIGINS=http://14.225.204.15
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_USE_TLS=true
SMTP_USE_SSL=false
SMTP_DEFAULT_SENDER=no-reply@khbd.local
NOTIFICATION_ADMIN_EMAIL=admin@khbd.local
CHAT_AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_MODEL_LESSON_PLAN=gemini-2.0-flash-exp
OPENAI_API_KEY=
OPENAI_MODEL=gpt-3.5-turbo
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
YOUTUBE_API_KEY=
GOOGLE_CSE_API_KEY=
GOOGLE_CSE_CX=
PISTON_API_URL=http://piston:2000/api/v2
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=
LOG_LEVEL=INFO
EOF

# Save credentials
cat > /root/khbd-credentials.txt << EOF
KHBD Credentials (Generated: $(date))
Database Password: $DB_PASSWORD
SECRET_KEY: $SECRET_KEY
INTERNAL_API_KEY: $INTERNAL_KEY
Frontend: http://14.225.204.15
Backend API: http://14.225.204.15/api/v1/docs
EOF

# Deploy
chmod +x deploy.sh scripts/*.sh 2>/dev/null || true
docker compose down 2>/dev/null || true
docker compose up -d --build

sleep 30
docker compose ps

echo ""
echo "========================================"
echo "✓ DEPLOYMENT COMPLETED!"
echo "========================================"
echo "Frontend: http://14.225.204.15"
echo "Backend API: http://14.225.204.15/api/v1/docs"
echo "Credentials: /root/khbd-credentials.txt"
echo ""
'@

Write-Host "Connecting to server $server..." -ForegroundColor Yellow
Write-Host ""

# Method 1: Using SSH with pipe
$deployScript | ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $username@$server "bash -s" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Cyan
    Write-Host "  Frontend: http://14.225.204.15" -ForegroundColor White
    Write-Host "  Backend API: http://14.225.204.15/api/v1/docs" -ForegroundColor White
    Write-Host "  Health Check: http://14.225.204.15/api/v1/health" -ForegroundColor White
    Write-Host ""
    Write-Host "Credentials saved on server: /root/khbd-credentials.txt" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Deployment failed. Check errors above." -ForegroundColor Red
}

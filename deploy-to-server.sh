#!/bin/bash
set -e

echo "=========================================="
echo "KHBD Auto Deployment Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# 1. Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# 2. Install Docker if not exists
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    print_status "Docker already installed"
fi

# 3. Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    print_status "Installing Docker Compose..."
    apt install -y docker-compose-plugin
else
    print_status "Docker Compose already installed"
fi

# 4. Install Git
if ! command -v git &> /dev/null; then
    print_status "Installing Git..."
    apt install -y git
else
    print_status "Git already installed"
fi

# 5. Create project directory
PROJECT_DIR="/root/khbd-app"
print_status "Setting up project directory: $PROJECT_DIR"

if [ -d "$PROJECT_DIR" ]; then
    print_warning "Directory exists. Backing up..."
    mv "$PROJECT_DIR" "${PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 6. Clone repository
print_status "Cloning repository from GitHub..."
git clone https://github.com/nguyenphong1245/KHBD.git .
cd init

# 7. Generate secrets
print_status "Generating secret keys..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
INTERNAL_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
DB_PASSWORD=$(python3 -c "import secrets; print(secrets.token_urlsafe(16))")

# 8. Create .env file
print_status "Creating Docker Compose .env file..."
cat > .env << EOF
# Database
POSTGRES_USER=khbd
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=khbd

# Frontend
FRONTEND_PORT=80

# Production Settings
FRONTEND_BASE_URL=http://14.225.204.15
CORS_ORIGINS=http://14.225.204.15
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
EOF

# 9. Create backend .env
print_status "Creating Backend .env file..."
cat > backend/.env << EOF
# ======================== REQUIRED ========================

SECRET_KEY=$SECRET_KEY
INTERNAL_API_KEY=$INTERNAL_KEY

# Database
SQL_DATABASE_URL=postgresql+asyncpg://khbd:$DB_PASSWORD@postgres:5432/khbd

# ======================== AUTHENTICATION ========================

ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_DAYS=30
EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES=30
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=60

COOKIE_SECURE=false
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=

# ======================== FRONTEND/BACKEND URLs ========================

FRONTEND_BASE_URL=http://14.225.204.15
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000

CORS_ORIGINS=http://14.225.204.15

# ======================== EMAIL (SMTP) - OPTIONAL ========================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_USE_TLS=true
SMTP_USE_SSL=false
SMTP_DEFAULT_SENDER=no-reply@khbd.local
NOTIFICATION_ADMIN_EMAIL=admin@khbd.local

# ======================== AI PROVIDERS ========================

CHAT_AI_PROVIDER=gemini

# IMPORTANT: Add your Gemini API key here!
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_MODEL_LESSON_PLAN=gemini-2.0-flash-exp

OPENAI_API_KEY=
OPENAI_MODEL=gpt-3.5-turbo

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# ======================== MEDIA SEARCH (Optional) ========================

YOUTUBE_API_KEY=
GOOGLE_CSE_API_KEY=
GOOGLE_CSE_CX=

# ======================== CODE EXECUTION ========================

PISTON_API_URL=http://piston:2000/api/v2

# ======================== NEO4J (Optional) ========================

NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=

# ======================== LOGGING ========================

LOG_LEVEL=INFO
EOF

# 10. Save credentials
print_status "Saving credentials to credentials.txt..."
cat > /root/khbd-credentials.txt << EOF
========================================
KHBD Application Credentials
========================================
Generated: $(date)

Database:
  Username: khbd
  Password: $DB_PASSWORD
  Database: khbd

Backend:
  SECRET_KEY: $SECRET_KEY
  INTERNAL_API_KEY: $INTERNAL_KEY

Access:
  Frontend: http://14.225.204.15
  Backend API: http://14.225.204.15/api/v1/docs
  Health Check: http://14.225.204.15/api/v1/health

IMPORTANT:
  - Keep this file secure!
  - Add your GEMINI_API_KEY in backend/.env
  - File location: /root/khbd-credentials.txt
========================================
EOF

# 11. Make scripts executable
print_status "Making scripts executable..."
chmod +x deploy.sh scripts/*.sh backup.sh 2>/dev/null || true

# 12. Deploy with Docker
print_status "Starting deployment with Docker Compose..."
print_warning "This may take 5-10 minutes for first build..."

docker compose down 2>/dev/null || true
docker compose up -d --build

# 13. Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# 14. Check service status
print_status "Checking service status..."
docker compose ps

echo ""
echo "=========================================="
echo -e "${GREEN}✓ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo "=========================================="
echo ""
echo "Access your application:"
echo "  → Frontend: http://14.225.204.15"
echo "  → Backend API Docs: http://14.225.204.15/api/v1/docs"
echo "  → Health Check: http://14.225.204.15/api/v1/health"
echo ""
echo "Credentials saved to: /root/khbd-credentials.txt"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "1. Add your GEMINI_API_KEY to: $PROJECT_DIR/init/backend/.env"
echo "2. Restart backend: cd $PROJECT_DIR/init && docker compose restart backend"
echo ""
echo "Management commands:"
echo "  cd $PROJECT_DIR/init"
echo "  ./scripts/logs.sh all        # View logs"
echo "  ./scripts/backup.sh          # Backup database"
echo "  docker compose restart       # Restart services"
echo ""
echo "=========================================="

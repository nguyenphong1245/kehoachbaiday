#!/bin/bash
# =============================================================
# KHBD Update Script - Cập nhật phiên bản mới
# =============================================================

set -e

cd "$(dirname "$0")/.."

echo "=========================================="
echo "   KHBD Update - Cập nhật phiên bản mới"
echo "=========================================="

# Backup database trước khi update
echo ""
echo "Step 1: Backup database..."
BACKUP_FILE="backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p backups
docker compose exec -T postgres pg_dump -U ${POSTGRES_USER:-khbd} ${POSTGRES_DB:-khbd} > "$BACKUP_FILE" 2>/dev/null || echo "Warning: Could not backup database"
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    echo "   Backup saved to: $BACKUP_FILE"
else
    echo "   Skipping backup (database may be empty or not running)"
    rm -f "$BACKUP_FILE"
fi

# Pull code mới (nếu dùng git)
if [ -d ".git" ]; then
    echo ""
    echo "Step 2: Pull latest code..."
    git pull origin main || git pull origin master
fi

# Rebuild và restart
echo ""
echo "Step 3: Rebuild images..."
docker compose build --no-cache backend frontend

echo ""
echo "Step 4: Restart services..."
docker compose up -d

echo ""
echo "Step 5: Waiting for services..."
sleep 10

# Cleanup old images
echo ""
echo "Step 6: Cleanup old images..."
docker image prune -f

echo ""
echo "=========================================="
echo "   Update Complete!"
echo "=========================================="
docker compose ps

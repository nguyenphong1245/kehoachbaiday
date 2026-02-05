#!/bin/bash
# PostgreSQL Backup Script cho KHBD
# Chạy: bash backup.sh
# Cron (hàng ngày lúc 2h sáng): 0 2 * * * cd /path/to/init && bash backup.sh

BACKUP_DIR="./backups"
CONTAINER_NAME="khbd-postgres"
DB_NAME="khbd"
DB_USER="khbd"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "[$(date)] Bắt đầu backup database $DB_NAME..."

docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ] && [ -s "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] Backup thành công: $BACKUP_FILE ($SIZE)"
else
    echo "[$(date)] Backup THẤT BẠI!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Xóa backup cũ hơn KEEP_DAYS ngày
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$KEEP_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
    echo "[$(date)] Đã xóa $DELETED backup cũ (>$KEEP_DAYS ngày)"
fi

echo "[$(date)] Hoàn tất."

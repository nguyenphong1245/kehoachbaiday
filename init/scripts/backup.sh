#!/bin/bash
# =============================================================
# KHBD Backup Script
# =============================================================

set -e

cd "$(dirname "$0")/.."

# Load env
export $(grep -v '^#' .env | xargs)

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."
docker compose exec -T postgres pg_dump -U ${POSTGRES_USER:-khbd} ${POSTGRES_DB:-khbd} > "$BACKUP_DIR/db_$TIMESTAMP.sql"

echo "Backup saved to: $BACKUP_DIR/db_$TIMESTAMP.sql"

# Keep only last 10 backups
echo "Cleaning old backups (keeping last 10)..."
ls -t "$BACKUP_DIR"/db_*.sql 2>/dev/null | tail -n +11 | xargs -r rm -f

echo "Done!"

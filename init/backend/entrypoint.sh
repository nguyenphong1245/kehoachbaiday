#!/bin/bash
set -euo pipefail

echo "Running database migrations..."
if ! alembic upgrade head; then
    echo "ERROR: Database migration failed. Check database connection and migration files."
    exit 1
fi

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

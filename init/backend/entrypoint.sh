#!/bin/bash
set -euo pipefail

# Skip migrations if SKIP_MIGRATIONS=true (useful when DB is already migrated)
if [ "${SKIP_MIGRATIONS:-false}" = "true" ]; then
    echo "Skipping database migrations (SKIP_MIGRATIONS=true)..."
else
    echo "Running database migrations..."
    if ! alembic upgrade head; then
        echo "ERROR: Database migration failed. Check database connection and migration files."
        echo "TIP: Set SKIP_MIGRATIONS=true if database is already migrated."
        exit 1
    fi
fi

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 --timeout-keep-alive 65 --limit-concurrency 50

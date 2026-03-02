#!/bin/bash
set -euo pipefail

echo "Skipping database migrations (manual mode)..."
echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 65 --limit-concurrency 100

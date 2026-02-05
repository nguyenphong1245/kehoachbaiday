#!/bin/bash
# =============================================================
# KHBD Logs Script
# =============================================================

cd "$(dirname "$0")/.."

SERVICE=${1:-""}

if [ -z "$SERVICE" ]; then
    echo "Usage: ./scripts/logs.sh [service]"
    echo ""
    echo "Services: backend, frontend, postgres, piston, all"
    echo ""
    echo "Examples:"
    echo "  ./scripts/logs.sh backend    # Xem logs backend"
    echo "  ./scripts/logs.sh all        # Xem tất cả logs"
    exit 0
fi

if [ "$SERVICE" == "all" ]; then
    docker compose logs -f --tail=100
else
    docker compose logs -f --tail=100 "$SERVICE"
fi

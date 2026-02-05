#!/bin/bash
# =============================================================
# KHBD Deployment Script
# =============================================================

set -e

echo "=========================================="
echo "   KHBD Docker Deployment"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please copy .env.example to .env and configure it first."
    exit 1
fi

# Check if backend/.env exists
if [ ! -f backend/.env ]; then
    echo "ERROR: backend/.env file not found!"
    echo "Please copy backend/.env.example to backend/.env and configure it."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

echo ""
echo "Step 1: Pulling latest images..."
docker compose pull postgres piston

echo ""
echo "Step 2: Building application images..."
docker compose build --no-cache

echo ""
echo "Step 3: Starting services..."
docker compose up -d

echo ""
echo "Step 4: Waiting for services to be healthy..."
sleep 10

# Check service status
echo ""
echo "Service Status:"
docker compose ps

echo ""
echo "=========================================="
echo "   Deployment Complete!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:${FRONTEND_PORT:-80}"
echo ""
echo "Useful commands:"
echo "  - View logs:     docker compose logs -f"
echo "  - Stop services: docker compose down"
echo "  - Restart:       docker compose restart"
echo ""

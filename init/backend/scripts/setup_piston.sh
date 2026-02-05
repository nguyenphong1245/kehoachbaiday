#!/bin/bash
# ============================================================
# Script cài đặt ngôn ngữ lập trình cho Piston self-hosted
# Chạy sau khi docker compose up -d
# ============================================================

PISTON_URL="http://localhost:2000"

echo "=== Đợi Piston API khởi động... ==="
for i in {1..30}; do
    if curl -s "$PISTON_URL/api/v2/runtimes" > /dev/null 2>&1; then
        echo "Piston API đã sẵn sàng!"
        break
    fi
    echo "  Đang đợi... ($i/30)"
    sleep 2
done

echo ""
echo "=== Cài đặt các ngôn ngữ lập trình ==="

# Python 3.10.0
echo ">>> Cài đặt Python 3.10.0..."
curl -s "$PISTON_URL/api/v2/packages" -d '{"language":"python","version":"3.10.0"}' -H "Content-Type: application/json"
echo ""

# JavaScript (Node.js) 18.15.0
echo ">>> Cài đặt JavaScript (Node.js) 18.15.0..."
curl -s "$PISTON_URL/api/v2/packages" -d '{"language":"javascript","version":"18.15.0"}' -H "Content-Type: application/json"
echo ""

# Java 15.0.2
echo ">>> Cài đặt Java 15.0.2..."
curl -s "$PISTON_URL/api/v2/packages" -d '{"language":"java","version":"15.0.2"}' -H "Content-Type: application/json"
echo ""

# C++ (GCC) 10.2.0
echo ">>> Cài đặt C++ (GCC) 10.2.0..."
curl -s "$PISTON_URL/api/v2/packages" -d '{"language":"c++","version":"10.2.0"}' -H "Content-Type: application/json"
echo ""

# C (GCC) 10.2.0
echo ">>> Cài đặt C (GCC) 10.2.0..."
curl -s "$PISTON_URL/api/v2/packages" -d '{"language":"c","version":"10.2.0"}' -H "Content-Type: application/json"
echo ""

echo ""
echo "=== Kiểm tra các ngôn ngữ đã cài ==="
curl -s "$PISTON_URL/api/v2/runtimes" | python3 -m json.tool 2>/dev/null || curl -s "$PISTON_URL/api/v2/runtimes"

echo ""
echo "=== Hoàn tất! ==="
echo "Piston API: $PISTON_URL/api/v2"
echo "Đặt PISTON_API_URL=$PISTON_URL/api/v2 trong file .env"

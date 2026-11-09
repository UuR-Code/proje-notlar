#!/bin/sh
set -e

echo "=== Proje Notları Container Başlatılıyor ==="

# Ensure data directory exists
mkdir -p /app/data

# Sync database schema with Prisma
echo "Prisma veritabanı şeması senkronize ediliyor..."
./node_modules/.bin/prisma db push --skip-generate || true

# Seed database on first launch
if [ ! -f "/app/data/.seeded" ]; then
  echo "Başlangıç verileri yükleniyor..."
  ./node_modules/.bin/tsx prisma/seed.ts || true
  touch /app/data/.seeded
fi

echo "Next.js sunucusu başlatılıyor (Port: ${PORT:-3000})..."
exec node server.js

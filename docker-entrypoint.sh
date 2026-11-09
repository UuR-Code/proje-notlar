#!/bin/sh
set -e

echo "=== Proje Notları Container Başlatılıyor ==="

# Ensure data directory exists with correct ownership
mkdir -p /app/data
chown -R nextjs:nodejs /app/data 2>/dev/null || true

# Sync database schema with Prisma
echo "Prisma veritabanı şeması senkronize ediliyor..."
su-exec nextjs ./node_modules/.bin/prisma db push --skip-generate || ./node_modules/.bin/prisma db push --skip-generate || true

# Seed database on first launch
if [ ! -f "/app/data/.seeded" ]; then
  echo "Başlangıç verileri yükleniyor..."
  if su-exec nextjs ./node_modules/.bin/tsx prisma/seed.ts; then
    touch /app/data/.seeded
    chown nextjs:nodejs /app/data/.seeded 2>/dev/null || true
  fi
fi

echo "Next.js sunucusu başlatılıyor (Port: ${PORT:-3000})..."
exec su-exec nextjs node server.js

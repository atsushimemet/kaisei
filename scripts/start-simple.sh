#!/bin/sh

echo "🚀 Starting Kaisei (Production Fast Mode)..."

# Prisma Client生成のみ
echo "🔧 Generating Prisma Client..."
npx prisma generate

# 即座にNext.jsアプリケーション起動（DB接続テストなし）
echo "🌟 Starting Next.js on port ${PORT:-3000}..."
exec node server.js
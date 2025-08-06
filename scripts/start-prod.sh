#!/bin/sh

echo "🚀 Starting Kaisei (Production Mode)..."

# 基本的な環境変数確認
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

# Prisma Client生成
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Next.jsアプリケーション起動
echo "🌟 Starting Next.js on port ${PORT:-3000}..."
exec node server.js
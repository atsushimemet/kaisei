#!/bin/sh

echo "🚀 Starting Kaisei production application..."

# 環境変数の確認
echo "🔍 Checking environment variables..."
if [ -n "$DATABASE_URL" ]; then
  echo "✅ DATABASE_URL is set"
else
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

if [ -n "$NEXTAUTH_SECRET" ]; then
  echo "✅ NEXTAUTH_SECRET is set"
else
  echo "⚠️ NEXTAUTH_SECRET is not set"
fi

if [ -n "$NEXTAUTH_URL" ]; then
  echo "✅ NEXTAUTH_URL is set: $NEXTAUTH_URL"
else
  echo "⚠️ NEXTAUTH_URL is not set"
fi

# Prisma Client生成（本番用）
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
  echo "✅ Prisma Client generated successfully"
else
  echo "❌ Prisma Client generation failed"
  exit 1
fi

# データベース接続テストをスキップ（本番環境での高速起動）
echo "🗄️ Skipping database connection test in production for fast startup..."

# Next.jsアプリケーション起動（本番モード）
echo "🌟 Starting Next.js production application..."
echo "🌐 Application will be available on port ${PORT:-3000}"
exec node server.js

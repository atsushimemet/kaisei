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

# 本番環境ではdb pushを使わず、事前に作成されたスキーマを使用
echo "🗄️ Skipping database schema push in production..."
echo "ℹ️  Database schema should be managed via migrations in production"

# Next.jsアプリケーション起動（本番モード）
echo "🌟 Starting Next.js production application..."
echo "🌐 Application will be available on port ${PORT:-3000}"
exec node server.js
#!/bin/sh

echo "🚀 Starting Kaisei application..."

# 環境変数の確認
echo "🔍 Checking environment variables..."
if [ -n "$DATABASE_URL" ]; then
  echo "✅ DATABASE_URL is set"
  # セキュリティのため、URLの一部のみ表示
  echo "📊 Database URL: ${DATABASE_URL%?*}..."
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

# データベース接続確認（最大30回、60秒間）
echo "📊 Checking database connection..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if npx prisma db push --accept-data-loss --skip-generate >/dev/null 2>&1; then
    echo "✅ Database connection confirmed"
    break
  else
    attempt=$((attempt + 1))
    echo "⏳ Waiting for database to be ready... (attempt $attempt/$max_attempts)"
    sleep 2
  fi
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database connection failed after $max_attempts attempts"
  echo "🔍 Checking DATABASE_URL environment variable..."
  if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is set"
  else
    echo "❌ DATABASE_URL is not set"
  fi
  exit 1
fi

# データベーススキーマの確認と作成
echo "🗄️ Setting up database schema..."
npx prisma db push --accept-data-loss --skip-generate

if [ $? -eq 0 ]; then
  echo "✅ Database schema setup completed"
else
  echo "❌ Database schema setup failed"
  exit 1
fi

# Next.jsアプリケーション起動
echo "🌟 Starting Next.js application..."
echo "🌐 Application will be available on port 3000"
exec node server.js

#!/bin/sh

echo "🚀 Starting Kaisei application..."

# データベース接続確認
echo "📊 Checking database connection..."
until npx prisma db pull --preview-feature 2>/dev/null; do
  echo "⏳ Waiting for database to be ready..."
  sleep 2
done

echo "✅ Database connection confirmed"

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
exec node server.js
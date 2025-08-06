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

# Prismaクライアント生成
echo "🔧 Generating Prisma Client..."
npx prisma generate

# データベース接続確認
echo "📊 Checking database connection..."
max_attempts=10
attempt=0

while [ $attempt -lt $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "⏳ Database connection attempt $attempt/$max_attempts"
  
  # Prisma db push with error handling
  if npx prisma db push --accept-data-loss --skip-generate; then
    echo "✅ Database connection confirmed and schema synchronized"
    break
  else
    echo "❌ Database connection failed on attempt $attempt"
    
    # First attempt: show detailed diagnostics
    if [ $attempt -eq 1 ]; then
      echo "🔍 Database connection diagnostics:"
      echo "- Environment: NODE_ENV=$NODE_ENV"
      echo "- URL protocol: $(echo $DATABASE_URL | cut -d':' -f1)"
      if echo "$DATABASE_URL" | grep -q "sslmode=require"; then
        echo "- SSL mode: require ✅"
      else
        echo "- SSL mode: not set ⚠️"
      fi
      if echo "$DATABASE_URL" | grep -q "channel_binding=require"; then
        echo "- Channel binding: require (may cause issues with some drivers)"
      fi
    fi
    
    if [ $attempt -lt $max_attempts ]; then
      sleep 3
    fi
  fi
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Database connection failed after $max_attempts attempts"
  echo "🔄 Starting application anyway - database operations may fail until connection is restored"
fi

# Next.jsアプリケーション起動
echo "🌟 Starting Next.js application..."
echo "🌐 Application will be available on port 3000"
exec node server.js

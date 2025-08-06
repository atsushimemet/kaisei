# 本番用Dockerfile (Render対応)
FROM node:20-alpine AS builder

# 必要なパッケージをインストール
RUN apk add --no-cache openssl

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./
COPY prisma ./prisma/

# 依存関係をインストール
RUN npm ci

# Prismaクライアント生成
RUN npx prisma generate

# ソースコードをコピー
COPY . .

# ビルド
RUN npm run build

# 本番環境
FROM node:20-alpine AS runner

# 必要なパッケージをインストール
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# 本番用スタートアップスクリプトをコピー
COPY scripts/start-simple.sh /app/start-simple.sh
RUN chmod +x /app/start-simple.sh

# 必要なファイルのみをコピー
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Prismaバイナリへのパスを追加
ENV PATH="/app/node_modules/.bin:$PATH"

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 本番用スタートアップスクリプトを実行
CMD ["/app/start-simple.sh"]
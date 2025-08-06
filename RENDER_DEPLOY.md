# Render デプロイ設定ガイド

## 概要
このドキュメントはRender.comでのデプロイ設定について説明します。

## Render設定

### Web Service設定
- **Build Command**: `npm run render:build`
- **Start Command**: `npm run render:start`
- **Environment**: `Node.js`
- **Node Version**: `20`

### Docker設定（代替）
- **Dockerfile**: ルートの`Dockerfile`を使用
- **Docker Build Context**: `.`

### 環境変数
以下の環境変数をRenderで設定してください：

- `DATABASE_URL`: Neon PostgreSQLの接続URL
- `NEXTAUTH_SECRET`: ランダムな秘密鍵（32文字以上）
- `NEXTAUTH_URL`: `https://your-app-name.onrender.com`
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID  
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

## トラブルシューティング

### データベース接続エラー
- DATABASE_URLが正しく設定されているか確認
- Neon PostgreSQLのコネクション制限を確認

### ビルドエラー
- Node.jsバージョンが20以上であることを確認
- package.jsonのpostinstallでprisma generateが実行されることを確認

### ポート関連エラー
- アプリケーションがPORT環境変数を使用していることを確認
- Next.jsがstandaloneモードでビルドされていることを確認

## ヘルスチェック
- エンドポイント: `/api/health`
- 成功時: 200 OK with JSON response
- 失敗時: 503 Service Unavailable

## パフォーマンス最適化
- standalone出力を使用してコンテナサイズを最小化
- 不要な依存関係を除外
- 静的アセットの効率的な配信
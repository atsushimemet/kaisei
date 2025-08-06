# Render デプロイトラブルシューティングガイド

## 今回の障害分析

### 問題の概要
2025-08-06のデプロイ失敗は以下の複合的な問題によるものでした：

1. **Dockerfileとrender.yamlの設定ミスマッチ**
2. **データベース接続タイムアウトによるアプリケーション起動ブロック**
3. **ポートバインディングの問題**

### 根本原因

#### 1. 設定ファイルの不整合
- `render.yaml`では`Dockerfile.prod`を指定していたが、実際の`Dockerfile`では異なるスタートアップスクリプトを参照
- 結果として、予期しないスクリプトが実行されていた

#### 2. データベース接続のブロッキング
- `start.sh`スクリプトでデータベース接続を30回（60秒間）試行
- この間、HTTPサーバーが起動されず、Renderのヘルスチェックが失敗
- `==> No open ports detected` エラーが発生

#### 3. ヘルスチェックエンドポイントの問題
- データベース接続失敗時にHTTPステータス503を返していた
- アプリケーション自体は健全でもデプロイが失敗扱いになっていた

## 解決済みの修正

### 1. Dockerfile設定の統一
```dockerfile
# render.yamlとDockerfileの整合性を確保
dockerfilePath: ./Dockerfile

# 正しいスタートアップスクリプトの指定
COPY scripts/start.sh /app/start.sh
CMD ["/app/start.sh"]
```

### 2. スタートアップスクリプトの改善
```bash
# データベース接続試行回数を短縮（5回、10秒）
max_attempts=5

# 接続失敗時でもアプリケーションを起動
if [ $attempt -eq $max_attempts ]; then
  echo "⚠️ Database connection failed - starting app anyway"
fi
```

### 3. ヘルスチェックエンドポイントの強化
```typescript
// データベース接続失敗時でもHTTP 200を返す
// アプリケーション自体の健全性を重視
return NextResponse.json({
  status: 'healthy',
  application: 'running',
  database: 'disconnected'
}, { status: 200 })
```

### 4. 必要な環境変数の追加
```yaml
- key: NEXTAUTH_TRUST_HOST
  value: true
```

## デプロイオプション

### オプション1: 標準デプロイ（推奨）
```yaml
# render.yaml
dockerfilePath: ./Dockerfile
```
- データベース接続を短時間試行してからアプリ起動
- 運用安定性と起動速度のバランス

### オプション2: 高速デプロイ（緊急時）
```yaml
# render.yaml
dockerfilePath: ./Dockerfile.simple
```
- データベース接続チェックをスキップ
- 最速でアプリケーション起動

## 今後の予防策

### 1. デプロイ前チェックリスト
- [ ] `render.yaml`とDockerfileの設定一致確認
- [ ] スタートアップスクリプトの存在確認
- [ ] 環境変数設定の確認
- [ ] ヘルスチェックエンドポイントのテスト

### 2. モニタリング強化
```bash
# デプロイログでの確認項目
- Docker build成功
- 環境変数設定確認ログ
- ヘルスチェック通過
- ポート3000でのリスニング開始
```

### 3. ローカルテスト
```bash
# 本番環境と同じDockerfileでテスト
docker build -f Dockerfile .
docker run -p 3000:3000 --env-file .env.production [image-id]
```

## 緊急時対応手順

### ステップ1: ヘルスチェック確認
```bash
curl https://kaisei.onrender.com/api/health
```

### ステップ2: ログ確認
Render Dashboard > Logs で以下を確認：
- 環境変数設定
- データベース接続状況
- アプリケーション起動状況

### ステップ3: 緊急デプロイ
必要に応じて`Dockerfile.simple`を使用：
```yaml
# render.yaml（一時的変更）
dockerfilePath: ./Dockerfile.simple
```

## 関連ドキュメント
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [RENDER_ENV_SETUP.md](./RENDER_ENV_SETUP.md)
- [Render Documentation](https://render.com/docs)
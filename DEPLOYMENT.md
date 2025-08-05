# Renderデプロイ手順（Docker）

## 事前準備

### 1. Renderアカウント作成
- [Render](https://render.com) でアカウントを作成
- GitHubアカウントと連携

### 2. PostgreSQLデータベース作成
1. Render Dashboardで「New +」→「PostgreSQL」を選択
2. Database Name: `kaisei-db`
3. User: `kaisei_user` (任意)
4. Region: `Oregon (US West)`
5. Plan: `Free`
6. 作成完了後、「External Database URL」をコピー

### 3. Webサービス作成（Docker）
1. Render Dashboardで「New +」→「Web Service」を選択
2. GitHubリポジトリ `atsushimemet/kaisei` を選択
3. Branch: `production-deploy`
4. 以下の設定を入力：
   - Name: `kaisei-app`
   - Environment: `Docker`
   - Region: `Oregon (US West)`
   - Branch: `production-deploy`
   - Dockerfile Path: `./Dockerfile.prod`
   - Docker Build Context: `./`

### 4. 環境変数設定
以下の環境変数を設定：

```
NODE_ENV=production
DATABASE_URL=[Step2でコピーしたPostgreSQL URL]
NEXTAUTH_URL=https://kaisei-app.onrender.com
NEXTAUTH_SECRET=[長いランダムな文字列を生成]
GOOGLE_CLIENT_ID=[Google Console OAuth Client ID]
GOOGLE_CLIENT_SECRET=[Google Console OAuth Client Secret]
GOOGLE_MAPS_API_KEY=[Google Maps API Key]
```

### 5. データベースマイグレーション
デプロイ後、Renderのシェルで以下を実行：
```bash
npx prisma db push
```

### 6. Google OAuth設定更新
Google Cloud Consoleで：
1. OAuth 2.0 クライアント設定を開く
2. 承認済みのリダイレクト URIに追加：
   - `https://kaisei-app.onrender.com/api/auth/callback/google`
3. 承認済みのJavaScript生成元に追加：
   - `https://kaisei-app.onrender.com`

## トラブルシューティング

### ビルドエラーが発生した場合
- `npm run build` をローカルで実行して事前確認
- TypeScriptエラーがないか確認

### データベース接続エラー
- `DATABASE_URL` が正しく設定されているか確認
- Prismaマイグレーションが実行されているか確認

### 認証エラー
- `NEXTAUTH_SECRET` が設定されているか確認
- Google OAuth設定が正しいか確認
- リダイレクトURLが正しく登録されているか確認

## 本番環境での確認事項
- [ ] アプリケーションが正常に起動する
- [ ] データベース接続が成功する
- [ ] Google認証が正常に動作する
- [ ] クイック精算が正常に動作する
- [ ] ログイン済みユーザーの精算が正常に動作する
- [ ] アクションボタン（コピー、ダウンロード、LINE共有）が正常に動作する
# Renderデプロイ手順（Docker + Neon Database）

## 事前準備

### 1. Renderアカウント作成
- [Render](https://render.com) でアカウントを作成
- GitHubアカウントと連携

### 2. Neonデータベース作成
1. [Neon](https://neon.tech) でアカウントを作成
2. 新しいプロジェクトを作成
3. Database Name: `kaisei`
4. Region: `Singapore (Asia Pacific)`
5. 作成完了後、Connection String（DATABASE_URL）をコピー
   - 形式例: `postgresql://username:password@ep-xxx.ap-southeast-1.aws.neon.tech/kaisei?sslmode=require`

### 3. Webサービス作成（Docker）
1. Render Dashboardで「New +」→「Web Service」を選択
2. GitHubリポジトリ `atsushimemet/kaisei` を選択
3. Branch: `main`
4. 以下の設定を入力：
   - Name: `kaisei`
   - Environment: `Docker`
   - Region: `Singapore (Southeast Asia)`
   - Branch: `main`
   - Dockerfile Path: `./Dockerfile.prod`
   - Docker Build Context: `./`

### 4. 環境変数設定
以下の環境変数を設定：

```
NODE_ENV=production
DATABASE_URL=[Step2でコピーしたNeon Database URL]
NEXTAUTH_URL=https://kaisei.onrender.com
NEXTAUTH_SECRET=[長いランダムな文字列を生成]
GOOGLE_CLIENT_ID=[Google Console OAuth Client ID]
GOOGLE_CLIENT_SECRET=[Google Console OAuth Client Secret]
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
   - `https://kaisei.onrender.com/api/auth/callback/google`
3. 承認済みのJavaScript生成元に追加：
   - `https://kaisei.onrender.com`

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
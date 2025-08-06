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
NEXTAUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=[Google Console OAuth Client ID]
GOOGLE_CLIENT_SECRET=[Google Console OAuth Client Secret]
```

**重要事項**:
- `NEXTAUTH_URL`は必ず`https://`で始まる正確なURLを設定してください
- `NEXTAUTH_TRUST_HOST=true`によりプロキシ環境でのHTTPS判定が正しく動作します
- 環境変数にスペースやtypoがないか十分に確認してください

### 5. データベースマイグレーション
**注意**: Renderの無料プランではシェルアクセスができないため、以下の方法でマイグレーションを実行します：

#### 方法1: ローカル環境からリモートDB接続
1. ローカル環境でNeonのDATABASE_URLを設定：
```bash
# .envファイルを作成
echo "DATABASE_URL=[NeonのConnection String]" > .env
```

2. ローカルでマイグレーション実行：
```bash
npx prisma db push
```

#### 方法2: 自動マイグレーション（推奨）
アプリケーションの`start`スクリプトで自動実行されます：
```bash
# package.json内で設定済み
"start": "prisma db push --accept-data-loss && next start"
```
- Renderでのデプロイ時に自動でデータベーススキーマを更新
- 初回デプロイでテーブルが自動作成される

#### 方法3: 手動での初回セットアップのみ必要な場合
上記の自動マイグレーションで十分ですが、事前にローカルでテストする場合：
```bash
# ローカルでNeon DBに接続してテーブル作成確認
DATABASE_URL="[NeonのURL]" npx prisma db push
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
- NeonデータベースのConnection Stringに`?sslmode=require`が含まれているか確認
- ローカル環境からNeonデータベースへの接続テスト：
  ```bash
  npx prisma db push --preview-feature
  ```
- 初回デプロイ時はPrismaが自動でテーブル作成を試行

### 認証エラー
- `NEXTAUTH_SECRET` が設定されているか確認
- Google OAuth設定が正しいか確認
- リダイレクトURLが正しく登録されているか確認

### スマートフォンブラウザでのログインループ問題
**問題**: ログイン後に認証画面に戻ってしまう現象

**原因**:
- `NEXTAUTH_URL` が本番環境のURLに設定されていない
- モバイルブラウザでのCookie設定の問題
- Google OAuth設定の不備

**解決策**:
1. **環境変数の確認**:
   - `NEXTAUTH_URL=https://kaisei.onrender.com` が**正確に**設定されているか確認
   - `NEXTAUTH_SECRET` が32文字以上の長い安全な文字列に設定されているか確認
   - 環境変数にtypoがないか確認（特にURLの末尾にスラッシュがないこと）

2. **Google Cloud Console設定**:
   - 承認済みリダイレクトURIに以下が**完全に一致**して登録されているか確認：
     - `https://kaisei.onrender.com/api/auth/callback/google`
   - 承認済みJavaScript生成元に以下が登録されているか確認：
     - `https://kaisei.onrender.com`

3. **プロキシ環境での追加確認**:
   - Render Dashboard > Environment で `NEXTAUTH_URL` が `https://` で始まっているか確認
   - アプリログで「trustHost: true」が有効になっているか確認
   - セキュアCookieが正しく設定されているか確認

4. **ブラウザキャッシュとCookieのクリア**:
   - ブラウザの設定からCookieとキャッシュをクリア
   - プライベートブラウジングモードでテスト
   - デベロッパーツールでCookie設定を確認

5. **デバッグ方法**:
   - Render Dashboardでアプリケーションログを確認
   - `X-Forwarded-Proto: https` ヘッダーが正しく設定されているか確認
   - セッションCookieの `Secure` フラグが設定されているか確認

## 本番環境での確認事項
- [ ] アプリケーションが正常に起動する
- [ ] データベース接続が成功する（自動マイグレーション）
- [ ] Google認証が正常に動作する
- [ ] クイック精算が正常に動作する
- [ ] ログイン済みユーザーの精算が正常に動作する
- [ ] アクションボタン（コピー、ダウンロード、LINE共有）が正常に動作する

## 重要な注意事項

### Render無料プランの制限
- **シェルアクセス不可**: 手動でのコマンド実行はできません
- **自動スリープ**: 15分間非アクティブで自動スリープ
- **750時間/月制限**: 月間実行時間に制限があります
- **コールドスタート**: スリープ後の初回アクセスは起動に時間がかかります

### データベース自動セットアップ
- 初回デプロイ時に`prisma db push`が自動実行されます
- データベーステーブルが存在しない場合、自動で作成されます
- `--accept-data-loss`フラグで開発時のデータ構造変更に対応

### トラブル対応
- デプロイログはRender Dashboardで確認可能
- データベース接続エラーの場合は環境変数を再確認
- マイグレーションエラーの場合は、ローカル環境で事前テスト推奨
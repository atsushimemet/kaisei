# Render環境でのNextAuth設定ガイド

## 必要な環境変数

Renderダッシュボードで以下の環境変数を設定してください：

### 必須環境変数

```bash
# Node.js環境
NODE_ENV=production

# NextAuth基本設定
NEXTAUTH_URL=https://your-app.onrender.com
NEXTAUTH_SECRET=your-secure-random-32-char-string

# プロキシ環境対応（NextAuth v4）
# NextAuth v4では自動設定されませんが、明示的に設定することを推奨
NEXTAUTH_TRUST_HOST=true

# Cookie domain設定（オプション）
# サブドメインでの認証が必要な場合のみ設定
# NEXTAUTH_DOMAIN=.onrender.com

# Google OAuth設定
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# データベース接続
DATABASE_URL=your-neon-postgresql-connection-string
```

## Render固有の注意点

### 1. HTTPSの自動検出
Renderは自動的にHTTPSを提供しますが、プロキシ環境のため以下が重要：
- `trustHost: true`の設定
- `X-Forwarded-Proto`ヘッダーの信頼

### 2. Cookie設定
- `__Secure-`プレフィックスはHTTPS環境でのみ有効
- `sameSite: 'lax'`はクロスサイトリクエストに対応

### 3. デバッグ方法
開発中にログを確認するには：
```bash
# Renderログでの確認項目
- NextAuth URL解決の確認
- Cookie設定の確認  
- プロキシヘッダーの受信確認
```

## トラブルシューティング

### よくある問題と解決策

1. **認証後にリダイレクトが失敗する**
   - `NEXTAUTH_URL`が正しく設定されているか確認
   - `trustHost: true`が設定されているか確認

2. **セッションが保持されない**
   - Cookie設定の`secure`フラグを確認
   - `useSecureCookies`の設定を確認

3. **CSRF Tokenエラー**
   - `csrfToken`のCookie設定を確認
   - `__Host-`プレフィックスの制約を確認

## 設定検証方法

以下のURLでNextAuthの設定を検証可能：
```
https://your-app.onrender.com/api/auth/providers
https://your-app.onrender.com/api/auth/session
```

## セキュリティ推奨事項

1. **NEXTAUTH_SECRET**は32文字以上のランダム文字列を使用
2. **HTTPSのみ**での運用を徹底
3. **Cookie設定**でのセキュリティオプション有効化
4. **CSP（Content Security Policy）**の設定検討
# Google OAuth設定確認 - 認証ループ解決

## 現在の問題
- NEXTAUTH_URLは正しく設定されている
- データベース接続も正常
- しかし、Redirectコールバックが無限ループしている

## 解決方法

### 1. Google Cloud Console設定確認

**承認済みのリダイレクトURI**に以下が**完全一致**で登録されているか確認：

```
http://localhost:3000/api/auth/callback/google
```

### 2. Docker環境特有の問題

Dockerコンテナ内からの接続の場合、以下も追加が必要な場合があります：

```
http://127.0.0.1:3000/api/auth/callback/google
http://0.0.0.0:3000/api/auth/callback/google
```

### 3. 承認済みのJavaScript生成元

```
http://localhost:3000
http://127.0.0.1:3000
```

## デバッグ手順

### 現在のコンテナ環境を確認
1. `http://localhost:3000/api/auth/debug` にアクセス
2. requestHostとrequestProtocolを確認

### Google認証フローを再テスト
1. Google認証ボタンをクリック
2. ブラウザのネットワークタブでリダイレクト先を確認
3. エラーが発生している場合、Google側でURIミスマッチエラーが表示される

## よくある問題

1. **URIの末尾スラッシュ**: `/api/auth/callback/google/` ❌
2. **プロトコルミス**: `https://localhost:3000` ❌ (ローカルはhttp)
3. **ポート番号抜け**: `http://localhost/api/auth/callback/google` ❌

## 確認コマンド
```bash
# 現在の環境確認
curl http://localhost:3000/api/auth/debug

# Dockerコンテナログでリダイレクト詳細確認  
docker logs kaisei-app-dev-1 --tail=20
```
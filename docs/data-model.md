# KAISEI データモデル設計ドキュメント

## 概要

このドキュメントでは、KAISEIアプリケーションで使用されるデータモデルの詳細な設計について説明します。PostgreSQLデータベースとPrisma ORMを使用した4つの主要エンティティとその関係性を定義しています。

---

## エンティティ関係図 (ER図)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           KAISEI データモデル関係図                             │
└──────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │      Event      │
                              │                 │
                              │ • id (PK)       │
                              │ • title         │
                              │ • eventDate     │
                              │ • createdAt     │
                              │ • updatedAt     │
                              └─────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │   Participant   │    │      Venue      │    │   Settlement    │
    │                 │    │                 │    │                 │
    │ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
    │ • eventId (FK)  │    │ • eventId (FK)  │    │ • eventId (FK)  │
    │ • nickname      │    │ • venueOrder    │    │ • participantId │
    │ • gender        │    │ • name          │    │   (FK)          │
    │ • role          │    │ • googleMapsUrl │    │ • amount        │
    │ • stayRange     │    │ • totalAmount   │    │ • paymentMethod │
    │ • createdAt     │    │ • paidBy        │    │ • status        │
    └─────────────────┘    │ • createdAt     │    │ • createdAt     │
                │          └─────────────────┘    │ • updatedAt     │
                │                                 └─────────────────┘
                │                                          ▲
                └──────────────────────────────────────────┘

関係性の説明:
• Event → Participant  : 1対多 (1つのイベントに複数の参加者)
• Event → Venue       : 1対多 (1つのイベントに複数の会場)
• Event → Settlement  : 1対多 (1つのイベントに複数の精算記録)
• Participant → Settlement : 1対多 (1人の参加者に複数の精算記録)
```

---

## データベーステーブル定義

### 1. events テーブル

飲み会イベントの基本情報を管理するメインテーブル

```
┌──────────────────────────────────────────────────────────┐
│                     events テーブル                        │
├──────────────┬─────────────┬────────────┬─────────────────┤
│ カラム名      │ データ型     │ 制約       │ 説明            │
├──────────────┼─────────────┼────────────┼─────────────────┤
│ id           │ INT         │ PK, AI     │ イベントID      │
│ title        │ VARCHAR     │ NOT NULL   │ 飲み会名        │
│ event_date   │ TIMESTAMP   │ NOT NULL   │ 開催日時        │
│ created_at   │ TIMESTAMP   │ DEFAULT    │ 作成日時        │
│ updated_at   │ TIMESTAMP   │ AUTO       │ 更新日時        │
└──────────────┴─────────────┴────────────┴─────────────────┘

制約説明:
• PK: Primary Key (主キー)
• AI: Auto Increment (自動採番)
• DEFAULT: デフォルト値 now()
• AUTO: 自動更新
```

### 2. participants テーブル

各イベントの参加者情報を管理

```
┌──────────────────────────────────────────────────────────┐
│                 participants テーブル                      │
├──────────────┬─────────────┬────────────┬─────────────────┤
│ カラム名      │ データ型     │ 制約       │ 説明            │
├──────────────┼─────────────┼────────────┼─────────────────┤
│ id           │ INT         │ PK, AI     │ 参加者ID        │
│ event_id     │ INT         │ FK, NN     │ イベントID      │
│ nickname     │ VARCHAR     │ NOT NULL   │ ニックネーム    │
│ gender       │ ENUM        │ NULLABLE   │ 性別            │
│ role         │ ENUM        │ NULLABLE   │ 役割            │
│ stay_range   │ JSON        │ NOT NULL   │ 滞在時間設定    │
│ created_at   │ TIMESTAMP   │ DEFAULT    │ 作成日時        │
└──────────────┴─────────────┴────────────┴─────────────────┘

外部キー制約:
• event_id → events.id (CASCADE DELETE)

ENUM値:
• gender: 'male', 'female', 'unspecified'
• role: 'senior', 'junior', 'flat'

stay_range JSON構造:
{
  "firstParty": 0.0-1.0,   // 1次会参加率
  "secondParty": 0.0-1.0,  // 2次会参加率  
  "thirdParty": 0.0-1.0    // 3次会参加率
}
```

### 3. venues テーブル

各次会の会場情報を管理

```
┌──────────────────────────────────────────────────────────┐
│                    venues テーブル                         │
├──────────────┬─────────────┬────────────┬─────────────────┤
│ カラム名      │ データ型     │ 制約       │ 説明            │
├──────────────┼─────────────┼────────────┼─────────────────┤
│ id           │ INT         │ PK, AI     │ 会場ID          │
│ event_id     │ INT         │ FK, NN     │ イベントID      │
│ venue_order  │ INT         │ NOT NULL   │ 次会順序        │
│ name         │ VARCHAR     │ NOT NULL   │ 店名            │
│ google_maps_url│ TEXT      │ NULLABLE   │ Googleマップ    │
│ total_amount │ INT         │ NOT NULL   │ 総金額(円)      │
│ paid_by      │ VARCHAR     │ NOT NULL   │ 支払者          │
│ created_at   │ TIMESTAMP   │ DEFAULT    │ 作成日時        │
└──────────────┴─────────────┴────────────┴─────────────────┘

外部キー制約:
• event_id → events.id (CASCADE DELETE)

ビジネスルール:
• venue_order: 1=1次会, 2=2次会, 3=3次会...
• paid_by: participants.nickname の値と対応
• total_amount: 税込み総額（円単位）
```

### 4. settlements テーブル

参加者ごとの精算情報を管理

```
┌──────────────────────────────────────────────────────────┐
│                 settlements テーブル                       │
├──────────────┬─────────────┬────────────┬─────────────────┤
│ カラム名      │ データ型     │ 制約       │ 説明            │
├──────────────┼─────────────┼────────────┼─────────────────┤
│ id           │ INT         │ PK, AI     │ 精算ID          │
│ event_id     │ INT         │ FK, NN     │ イベントID      │
│ participant_id│ INT        │ FK, NN     │ 参加者ID        │
│ amount       │ INT         │ NOT NULL   │ 精算金額(円)    │
│ payment_method│ VARCHAR    │ NULLABLE   │ 支払い方法      │
│ status       │ ENUM        │ DEFAULT    │ 精算ステータス  │
│ created_at   │ TIMESTAMP   │ DEFAULT    │ 作成日時        │
│ updated_at   │ TIMESTAMP   │ AUTO       │ 更新日時        │
└──────────────┴─────────────┴────────────┴─────────────────┘

外部キー制約:
• event_id → events.id (CASCADE DELETE)
• participant_id → participants.id (CASCADE DELETE)

ENUM値:
• status: 'PENDING', 'PAID', 'CANCELLED'

ビジネスルール:
• amount: 各参加者の最終的な負担金額
• payment_method: 'PayPay', 'LINEPay', '現金' など
• status: デフォルトは 'PENDING'
```

---

## データフロー図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        KAISEIデータフロー                                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. イベント作成フロー
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   UI入力    │───▶│   Event     │───▶│ データベース │
   │             │    │   作成      │    │   保存      │
   └─────────────┘    └─────────────┘    └─────────────┘

2. 参加者登録フロー  
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ 参加者情報   │───▶│ Participant │───▶│ 関連付け保存 │
   │ 入力        │    │ 作成        │    │ (event_id)  │
   └─────────────┘    └─────────────┘    └─────────────┘

3. 会場登録フロー
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ 会場・支払   │───▶│   Venue     │───▶│ 順序付き保存 │
   │ 情報入力     │    │   作成      │    │ (venue_order)│
   └─────────────┘    └─────────────┘    └─────────────┘

4. 精算計算・保存フロー
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │ 精算計算     │───▶│ Settlement  │───▶│ 個人別保存   │
   │ ロジック実行 │    │ 結果生成    │    │ (金額・状態) │
   └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 主要なクエリパターン

### 1. イベント詳細取得（関連データ含む）

```sql
-- Prismaでは以下のように記述
// event = await prisma.event.findUnique({
//   where: { id: eventId },
//   include: {
//     participants: true,
//     venues: { orderBy: { venueOrder: 'asc' } },
//     settlements: {
//       include: { participant: true }
//     }
//   }
// })

-- 実際のSQL
SELECT 
  e.*,
  p.*,
  v.*,
  s.*
FROM events e
LEFT JOIN participants p ON e.id = p.event_id
LEFT JOIN venues v ON e.id = v.event_id
LEFT JOIN settlements s ON e.id = s.event_id
WHERE e.id = ?
ORDER BY v.venue_order ASC;
```

### 2. 参加者別精算情報取得

```sql
-- 特定イベントの参加者ごとの精算状況
SELECT 
  p.nickname,
  p.gender,
  p.role,
  p.stay_range,
  s.amount,
  s.status,
  s.payment_method
FROM participants p
LEFT JOIN settlements s ON p.id = s.participant_id
WHERE p.event_id = ?
ORDER BY p.id;
```

### 3. 会場別支払い集計

```sql
-- 各会場での支払い状況
SELECT 
  v.venue_order,
  v.name,
  v.total_amount,
  v.paid_by,
  COUNT(s.id) as settlement_count,
  SUM(s.amount) as total_settlements
FROM venues v
LEFT JOIN settlements s ON v.event_id = s.event_id
WHERE v.event_id = ?
GROUP BY v.id
ORDER BY v.venue_order;
```

---

## データ整合性とビジネスルール

### 1. 必須データ整合性チェック

```
参加者チェック:
✓ 全参加者にニックネームが設定されている
✓ stay_range の合計が論理的（0.0 ≤ 各値 ≤ 1.0）
✓ 重複するニックネームが同一イベント内に存在しない

会場チェック:
✓ venue_order が連続している（1, 2, 3...）
✓ paid_by が実在する参加者のニックネームと一致
✓ total_amount が正の値である

精算チェック:
✓ 全参加者に対してSettlementレコードが存在
✓ amount の合計が全会場のtotal_amountと一致
✓ participant_id が実在する参加者を参照
```

### 2. カスケード削除の動作

```
Event削除時:
├─ 関連するParticipantを全て削除
├─ 関連するVenueを全て削除
├─ 関連するSettlementを全て削除
└─ 孤立したデータは残らない

Participant削除時:
└─ 関連するSettlementを全て削除
```

### 3. JSON フィールドの構造

```typescript
// stay_range フィールドの型定義
interface StayRange {
  firstParty: number;   // 0.0 ~ 1.0
  secondParty: number;  // 0.0 ~ 1.0  
  thirdParty: number;   // 0.0 ~ 1.0
}

// 例: 1次会全参加、2次会半分参加、3次会不参加
{
  "firstParty": 1.0,
  "secondParty": 0.5,
  "thirdParty": 0.0
}
```

---

## パフォーマンス考慮事項

### 1. インデックス戦略

```sql
-- 推奨インデックス
CREATE INDEX idx_participants_event_id ON participants(event_id);
CREATE INDEX idx_venues_event_id_order ON venues(event_id, venue_order);
CREATE INDEX idx_settlements_event_id ON settlements(event_id);
CREATE INDEX idx_settlements_participant_id ON settlements(participant_id);
CREATE INDEX idx_settlements_status ON settlements(status);
```

### 2. クエリ最適化

- **N+1問題の回避**: Prismaのincludeを使用した一括取得
- **適切な索引**: 外部キーと検索条件に対するインデックス
- **データ量制限**: 大量データに対するページネーション実装

### 3. データサイズ見積もり

```
想定データ量（月間100イベント想定）:
├─ Events: 100レコード/月 × 12月 = 1,200レコード/年
├─ Participants: 100イベント × 平均4人 = 400レコード/月
├─ Venues: 100イベント × 平均2会場 = 200レコード/月
└─ Settlements: 400参加者 = 400レコード/月

年間総レコード数: 約2,400レコード（軽量）
```

---

## まとめ

KAISEIのデータモデルは、飲み会の精算業務に特化したシンプルかつ効率的な設計となっています。4つの主要エンティティ間の明確な関係性により、複雑な精算計算を支える堅牢なデータ基盤を提供しています。
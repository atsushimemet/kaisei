-- KAISEI データベース初期化SQL

-- 飲み会テーブル
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 参加者テーブル
CREATE TABLE IF NOT EXISTS participants (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    nickname VARCHAR(100) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'unspecified')),
    role VARCHAR(20) CHECK (role IN ('senior', 'junior', 'flat')),
    stay_range JSONB NOT NULL, -- 滞在範囲をJSONで保存
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- お店テーブル
CREATE TABLE IF NOT EXISTS venues (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    venue_order INTEGER NOT NULL, -- 1次会、2次会などの順序
    name VARCHAR(255) NOT NULL,
    google_maps_url TEXT,
    total_amount INTEGER NOT NULL,
    payment_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 精算結果テーブル
CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_venues_event_id ON venues(event_id);
CREATE INDEX IF NOT EXISTS idx_settlements_event_id ON settlements(event_id);
CREATE INDEX IF NOT EXISTS idx_settlements_participant_id ON settlements(participant_id); 

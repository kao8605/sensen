-- Migration number: 0002  2026-08-21
-- Tables used by the local SenSen data import.

ALTER TABLE users ADD COLUMN external_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);

ALTER TABLE products ADD COLUMN metadata_json TEXT;

CREATE TABLE IF NOT EXISTS user_addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    label TEXT,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    zip TEXT,
    is_default INTEGER NOT NULL DEFAULT 1,
    payload_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    value REAL NOT NULL DEFAULT 0,
    min_amount REAL NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'latest-news',
    excerpt TEXT,
    content TEXT,
    image_key TEXT,
    publish_at TEXT,
    is_published INTEGER NOT NULL DEFAULT 1,
    payload_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS legacy_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    source_key TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (entity_type, source_key)
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user
ON user_addresses(user_id);

CREATE INDEX IF NOT EXISTS idx_news_category
ON news(category);

CREATE INDEX IF NOT EXISTS idx_news_published
ON news(is_published, publish_at);

CREATE INDEX IF NOT EXISTS idx_legacy_records_type
ON legacy_records(entity_type);

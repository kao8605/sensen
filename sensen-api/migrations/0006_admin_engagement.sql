-- Migration number: 0006  2026-08-22
-- Admin data, order tracking and public engagement records.

ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE orders ADD COLUMN tracking_number TEXT;

CREATE TABLE IF NOT EXISTS engagement_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_engagement_records_type
ON engagement_records(record_type, created_at);

UPDATE users
SET role = COALESCE((
    SELECT json_extract(l.payload_json, '$.role')
    FROM legacy_records l
    WHERE l.entity_type = 'user_auth'
      AND l.source_key = users.external_id
), 'customer')
WHERE external_id IS NOT NULL;

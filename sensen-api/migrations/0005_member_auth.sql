-- Migration number: 0005  2026-08-22
-- Member authentication and persistent sessions used by the member center.

ALTER TABLE users ADD COLUMN phone TEXT;
ALTER TABLE users ADD COLUMN password_salt TEXT;
ALTER TABLE users ADD COLUMN password_hash TEXT;

CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user
ON sessions(user_id);

-- Existing local users keep the PBKDF2 credentials imported into legacy_records.
UPDATE users
SET password_salt = (
        SELECT json_extract(l.payload_json, '$.salt')
        FROM legacy_records l
        WHERE l.entity_type = 'user_auth'
          AND l.source_key = users.external_id
    ),
    password_hash = (
        SELECT json_extract(l.payload_json, '$.passwordHash')
        FROM legacy_records l
        WHERE l.entity_type = 'user_auth'
          AND l.source_key = users.external_id
    )
WHERE external_id IS NOT NULL;

UPDATE users
SET phone = (
    SELECT ua.phone
    FROM user_addresses ua
    WHERE ua.user_id = users.id
    ORDER BY ua.is_default DESC, ua.id ASC
    LIMIT 1
)
WHERE phone IS NULL;

-- Migration number: 0003  2026-08-21
-- Guest cart storage used by the storefront Worker.

CREATE TABLE IF NOT EXISTS cart_items (
    guest_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (guest_id, product_id),
    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cart_items_guest
ON cart_items(guest_id);

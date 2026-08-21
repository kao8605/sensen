-- Migration number: 0004  2026-08-21
-- Guest checkout information stored on orders.

ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_email TEXT;
ALTER TABLE orders ADD COLUMN customer_phone TEXT;
ALTER TABLE orders ADD COLUMN shipping_method TEXT NOT NULL DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN shipping_address TEXT;
ALTER TABLE orders ADD COLUMN fulfillment_date TEXT;
ALTER TABLE orders ADD COLUMN customer_note TEXT;
ALTER TABLE orders ADD COLUMN shipping_fee INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_amount INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_customer_email
ON orders(customer_email);

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(import.meta.dirname, '..', '..');
const dbPath = path.join(root, 'sensen-backend', 'data', 'db.json');
const productsPath = path.join(root, 'sensen-backend', 'data', 'sensen-products.json');
const outputPath = path.resolve(process.argv[2] || path.join(root, 'sensen-api', 'tmp-local-import.sql'));

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const sourceProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const sqlString = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return "'" + String(value).replaceAll("'", "''") + "'";
};

const sqlNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : String(fallback);
};

const sqlBoolean = (value) => value ? '1' : '0';

const normalizeImageKey = (value) => {
  const image = String(value || '').trim();
  if (!image) return null;
  const match = image.match(/(?:https?:\/\/[^/]+)?\/?(?:assets\/images\/)?([^?#]+)$/i);
  return match ? 'images/' + match[1] : image.replace(/^\//, '');
};

const slugify = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\u3400-\u9fff]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'uncategorized';

const effectiveProducts = new Map(sourceProducts.map((product) => [String(product.id), { ...product }]));
for (const [id, override] of Object.entries(db.productOverrides || {})) {
  if (effectiveProducts.has(id)) effectiveProducts.set(id, { ...effectiveProducts.get(id), ...override });
}
for (const product of db.productAdditions || []) {
  effectiveProducts.set(String(product.id), { ...product });
}
for (const id of db.deletedProducts || []) effectiveProducts.delete(String(id));

const products = [...effectiveProducts.values()].map((product) => {
  const price = Number(product.priceValue || String(product.price || '').replace(/[^0-9.]/g, '')) || 0;
  return {
    ...product,
    id: String(product.id || slugify(product.title)),
    title: String(product.title || product.name || '未命名商品'),
    cat: String(product.cat || '未分類'),
    price,
    quantity: Math.max(0, Number(product.quantity ?? 0)),
    day: Math.max(0, Number(product.day || 5)),
    imageKey: normalizeImageKey(product.img),
    published: product.published !== false,
  };
});

const categories = [...new Map(products.map((product) => [slugify(product.cat), product.cat])).entries()];
const lines = [
  '-- Generated from sensen-backend/data/db.json and sensen-products.json.',
  '-- Generated at ' + new Date().toISOString(),
  'PRAGMA foreign_keys = ON;',
  'DELETE FROM product_images;',
  'DELETE FROM products;',
  'DELETE FROM categories;',
  'DELETE FROM user_addresses;',
  'DELETE FROM users;',
  'DELETE FROM coupons;',
  'DELETE FROM news;',
  'DELETE FROM legacy_records;',
];

for (const [slug, name] of categories) {
  lines.push(`INSERT INTO categories (name, slug) VALUES (${sqlString(name)}, ${sqlString(slug)});`);
}

const importedEmails = new Set();
for (const user of db.users || []) {
  const externalId = String(user.id || '');
  const sourceEmail = String(user.email || '').trim().toLowerCase();
  const email = sourceEmail && !importedEmails.has(sourceEmail) ? sourceEmail : null;
  if (email) importedEmails.add(email);
  const role = String(user.role || (user.isAdmin ? 'admin' : 'customer'));
  const createdAt = user.createdAt || null;
  const payload = JSON.stringify({ salt: user.salt || '', passwordHash: user.passwordHash || '' });
  lines.push(`INSERT INTO users (external_id, name, email, created_at, updated_at) VALUES (${sqlString(externalId)}, ${sqlString(user.name || '')}, ${sqlString(email)}, COALESCE(${sqlString(createdAt)}, CURRENT_TIMESTAMP), COALESCE(${sqlString(createdAt)}, CURRENT_TIMESTAMP));`);
  lines.push(`INSERT INTO legacy_records (entity_type, source_key, payload_json) VALUES ('user_auth', ${sqlString(externalId)}, ${sqlString(JSON.stringify({ role, isAdmin: user.isAdmin === true, ...JSON.parse(payload) }))});`);

  if (user.address && typeof user.address === 'object') {
    const address = user.address;
    lines.push(`INSERT INTO user_addresses (user_id, label, full_name, phone, address, city, zip, payload_json) VALUES ((SELECT id FROM users WHERE external_id = ${sqlString(externalId)}), 'default', ${sqlString(address.fullName || user.name || '')}, ${sqlString(address.phone || user.phone || '')}, ${sqlString(address.address || '')}, ${sqlString(address.city || '')}, ${sqlString(address.zip || '')}, ${sqlString(JSON.stringify(address))});`);
  }
}

for (const product of products) {
  const metadata = { ...product };
  delete metadata.title;
  delete metadata.cat;
  delete metadata.price;
  delete metadata.quantity;
  delete metadata.imageKey;
  delete metadata.published;
  delete metadata.id;
  lines.push(`INSERT INTO products (category_id, name, slug, description, price, stock, image_key, is_active, metadata_json) VALUES ((SELECT id FROM categories WHERE slug = ${sqlString(slugify(product.cat))}), ${sqlString(product.title)}, ${sqlString(product.id)}, ${sqlString(product.desc || '')}, ${sqlNumber(product.price)}, ${sqlNumber(product.quantity)}, ${sqlString(product.imageKey)}, ${sqlBoolean(product.published)}, ${sqlString(JSON.stringify(metadata))});`);
  if (product.imageKey) {
    lines.push(`INSERT INTO product_images (product_id, image_key, sort_order, is_primary) VALUES ((SELECT id FROM products WHERE slug = ${sqlString(product.id)}), ${sqlString(product.imageKey)}, 0, 1);`);
  }
}

for (const coupon of db.coupons || []) {
  lines.push(`INSERT INTO coupons (code, label, type, value, min_amount, enabled, updated_at) VALUES (${sqlString(String(coupon.code || '').trim().toUpperCase())}, ${sqlString(coupon.label || '')}, ${sqlString(coupon.type || 'percent')}, ${sqlNumber(coupon.value)}, ${sqlNumber(coupon.min)}, ${sqlBoolean(coupon.enabled !== false)}, COALESCE(${sqlString(coupon.updatedAt)}, CURRENT_TIMESTAMP));`);
}

for (const article of db.news || []) {
  const id = String(article.id || 'news-' + Date.now());
  const title = String(article.title || '未命名文章');
  const slug = String(article.slug || article.id || slugify(title));
  lines.push(`INSERT INTO news (id, title, slug, category, excerpt, content, image_key, publish_at, is_published, payload_json, created_at, updated_at) VALUES (${sqlString(id)}, ${sqlString(title)}, ${sqlString(slug)}, ${sqlString(article.category || 'latest-news')}, ${sqlString(article.excerpt || '')}, ${sqlString(article.content || '')}, ${sqlString(normalizeImageKey(article.image))}, ${sqlString(article.publishAt || article.createdAt)}, ${sqlBoolean(article.published !== false)}, ${sqlString(JSON.stringify(article))}, COALESCE(${sqlString(article.createdAt)}, CURRENT_TIMESTAMP), COALESCE(${sqlString(article.updatedAt || article.createdAt)}, CURRENT_TIMESTAMP));`);
}

const persistentLegacyCollections = [
  ['product_override', db.productOverrides || {}],
  ['deleted_product', db.deletedProducts || []],
  ['reservation', db.reservations || []],
  ['message', db.messages || []],
  ['subscriber', db.subscribers || []],
  ['search', db.searches || []],
  ['line_ticket', db.lineTickets || []],
];
for (const [entityType, collection] of persistentLegacyCollections) {
  if (Array.isArray(collection)) {
    collection.forEach((record, index) => {
      const sourceKey = String(record?.id || record?.code || index);
      lines.push(`INSERT INTO legacy_records (entity_type, source_key, payload_json) VALUES (${sqlString(entityType)}, ${sqlString(sourceKey)}, ${sqlString(JSON.stringify(record))});`);
    });
  } else {
    for (const [sourceKey, record] of Object.entries(collection)) {
      lines.push(`INSERT INTO legacy_records (entity_type, source_key, payload_json) VALUES (${sqlString(entityType)}, ${sqlString(sourceKey)}, ${sqlString(JSON.stringify(record))});`);
    }
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, lines.join('\n') + '\n');
console.log(JSON.stringify({ outputPath, products: products.length, users: (db.users || []).length, coupons: (db.coupons || []).length, news: (db.news || []).length, categories: categories.length }, null, 2));

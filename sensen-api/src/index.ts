const JSON_CONTENT_TYPE = "application/json; charset=utf-8";
const GUEST_COOKIE = "sensen_guest";

type ProductRow = {
  db_id: number;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  image_key: string | null;
  is_active: number;
  category: string | null;
  metadata_json: string | null;
};

type StoreProduct = {
  id: string;
  title: string;
  cat: string;
  price: string;
  priceValue: number;
  quantity: number;
  day: string;
  img: string;
  desc: string;
  published: boolean;
};

const getGuestId = (request: Request) => {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)sensen_guest=([^;]+)/);
  return match?.[1] || crypto.randomUUID();
};

const responseHeaders = (request: Request, extra: Record<string, string> = {}) => {
  const origin = request.headers.get("Origin");
  return {
    "Content-Type": JSON_CONTENT_TYPE,
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
    ...extra,
  };
};

const json = (request: Request, body: unknown, status = 200, guestId?: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: responseHeaders(request, guestId ? {
      "Set-Cookie": `${GUEST_COOKIE}=${encodeURIComponent(guestId)}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax; Secure`,
    } : {}),
  });

const parseBody = async (request: Request) => {
  try {
    return await request.json() as Record<string, unknown>;
  } catch {
    return {};
  }
};

const productFromRow = (row: ProductRow): StoreProduct => {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = row.metadata_json ? JSON.parse(row.metadata_json) : {};
  } catch {
    metadata = {};
  }
  const priceValue = Number(row.price || 0);
  const imageKey = String(row.image_key || "").replace(/^images\//, "");
  return {
    id: row.slug,
    title: row.title,
    cat: row.category || String(metadata.cat || "未分類"),
    price: `$${priceValue.toFixed(2)}`,
    priceValue,
    quantity: Math.max(0, Number(row.stock || 0)),
    day: String(metadata.day || 5),
    img: imageKey ? `/assets/images/${imageKey}` : "",
    desc: row.description || String(metadata.desc || ""),
    published: row.is_active === 1,
  };
};

const productSelect = `
  SELECT
    p.id AS db_id,
    p.slug,
    p.name AS title,
    p.description,
    p.price,
    p.stock,
    p.image_key,
    p.is_active,
    c.name AS category,
    p.metadata_json
  FROM products p
`;

const findProduct = async (env: Env, value: string) => {
  if (!value) return null;
  const row = await env.DB.prepare(`${productSelect}
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1 AND (p.slug = ?1 OR p.name = ?1)
    LIMIT 1`).bind(value).first<ProductRow>();
  return row || null;
};

const cartSummary = async (env: Env, guestId: string) => {
  const result = await env.DB.prepare(`${productSelect}
    LEFT JOIN categories c ON c.id = p.category_id
    INNER JOIN cart_items ci ON ci.product_id = p.id
    WHERE ci.guest_id = ?1 AND p.is_active = 1
    ORDER BY ci.created_at ASC`).bind(guestId).all<ProductRow & { quantity: number }>();
  const items = result.results.map((row) => ({
    ...productFromRow(row),
    qty: Math.max(1, Number(row.quantity || 1)),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.priceValue * item.qty, 0);
  const leadDays = items.reduce((max, item) => Math.max(max, Number(item.day || 5)), 0);
  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    total: Number(subtotal.toFixed(2)),
    leadDays,
  };
};

const imageResponse = async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const requestedKey = url.pathname.slice("/images/".length);
  if (!requestedKey || requestedKey.split("/").includes("..")) {
    return json(request, { error: "圖片路徑無效。" }, 400);
  }

  const object = await env.BUCKET.get("images/" + requestedKey);
  if (!object) return json(request, { error: "找不到圖片。" }, 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", headers.get("cache-control") || "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
};

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: responseHeaders(request) });
    }

    try {
      if (url.pathname === "/health" && request.method === "GET") {
        const result = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        return json(request, { ok: result?.ok === 1, database: "connected" });
      }

      if (url.pathname === "/api/products" && request.method === "GET") {
        const result = await env.DB.prepare(`${productSelect}
          LEFT JOIN categories c ON c.id = p.category_id
          WHERE p.is_active = 1 ORDER BY p.id DESC`).all<ProductRow>();
        return json(request, { products: result.results.map(productFromRow) });
      }

      if (url.pathname === "/api/cart" && request.method === "GET") {
        const guestId = getGuestId(request);
        return json(request, await cartSummary(env, guestId), 200, guestId);
      }

      if (url.pathname === "/api/cart/add" && request.method === "POST") {
        const body = await parseBody(request);
        const lookup = String(body.productId || body.title || "").trim();
        const product = await findProduct(env, lookup);
        if (!product) return json(request, { error: "找不到此商品，請重新整理商品頁。" }, 404);

        const guestId = getGuestId(request);
        const quantity = Math.min(99, Math.max(1, Number(body.qty || 1)));
        await env.DB.prepare(`
          INSERT INTO cart_items (guest_id, product_id, quantity)
          VALUES (?1, ?2, ?3)
          ON CONFLICT (guest_id, product_id)
          DO UPDATE SET quantity = quantity + excluded.quantity, updated_at = CURRENT_TIMESTAMP
        `).bind(guestId, product.db_id, quantity).run();
        return json(request, await cartSummary(env, guestId), 200, guestId);
      }

      if (url.pathname === "/api/cart/item" && (request.method === "PATCH" || request.method === "DELETE")) {
        const body = await parseBody(request);
        const lookup = String(body.productId || "").trim();
        const product = await findProduct(env, lookup);
        if (!product) return json(request, { error: "購物車商品不存在。" }, 404);
        const guestId = getGuestId(request);
        const quantity = Number(body.qty || 0);
        if (request.method === "DELETE" || quantity <= 0) {
          await env.DB.prepare("DELETE FROM cart_items WHERE guest_id = ?1 AND product_id = ?2").bind(guestId, product.db_id).run();
        } else {
          await env.DB.prepare("UPDATE cart_items SET quantity = ?1, updated_at = CURRENT_TIMESTAMP WHERE guest_id = ?2 AND product_id = ?3").bind(Math.min(99, quantity), guestId, product.db_id).run();
        }
        return json(request, await cartSummary(env, guestId), 200, guestId);
      }

      if (url.pathname === "/api/cart/quote" && request.method === "POST") {
        const body = await parseBody(request);
        const guestId = getGuestId(request);
        const cart = await cartSummary(env, guestId);
        const shippingMethod = String(body.shippingMethod || "pickup");
        const shippingFee = shippingMethod === "frozen" ? 240 : shippingMethod === "home" ? 120 : 0;
        return json(request, {
          ...cart,
          shippingMethod,
          shippingFee,
          total: Number((cart.subtotal + shippingFee).toFixed(2)),
          discount: 0,
        }, 200, guestId);
      }

      if (url.pathname.startsWith("/images/") && request.method === "GET") {
        return imageResponse(request, env);
      }

      if (url.pathname.startsWith("/api/") || url.pathname === "/health") {
        return json(request, { error: "找不到 API 路徑。" }, 404);
      }

      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status === 404) {
        return json(request, { error: "找不到 API 路徑。" }, 404);
      }
      return assetResponse;
    } catch (error) {
      console.error("Worker request failed", error);
      return json(request, { error: "服務暫時無法處理請求。" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

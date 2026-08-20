const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: JSON_HEADERS });

const imageResponse = async (request: Request, env: Env) => {
  const url = new URL(request.url);
  const requestedKey = url.pathname.slice("/images/".length);
  if (!requestedKey || requestedKey.split("/").includes("..")) {
    return json({ error: "圖片路徑無效。" }, 400);
  }

  const object = await env.BUCKET.get("images/" + requestedKey);
  if (!object) return json({ error: "找不到圖片。" }, 404);

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
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    if (request.method !== "GET") {
      return json({ error: "目前只支援 GET。" }, 405);
    }

    try {
      if (url.pathname === "/") {
        const result = await env.DB
          .prepare("SELECT * FROM products")
          .all();
        const image = await env.BUCKET.get("images/cake-2024-11.png");

        return json({
          products: result.results,
          imageExists: Boolean(image),
        });
      }

      if (url.pathname === "/health") {
        const result = await env.DB.prepare("SELECT 1 AS ok").first<{ ok: number }>();
        return json({ ok: result?.ok === 1, database: "connected" });
      }

      if (url.pathname === "/api/products") {
        const result = await env.DB
          .prepare("SELECT * FROM products WHERE is_active = 1 ORDER BY id DESC")
          .all();
        return json(result.results);
      }

      if (url.pathname.startsWith("/images/")) {
        return imageResponse(request, env);
      }

      return json({ error: "找不到 API 路徑。" }, 404);
    } catch (error) {
      console.error("Worker request failed", error);
      return json({ error: "服務暫時無法處理請求。" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

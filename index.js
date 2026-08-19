const http = require("http");
const fs = require("fs");
const path = require("path");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;
const root = __dirname;
const API_PORT = Number(process.env.API_PORT) || 8081;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || HOST}`);
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
    const proxy = http.request({ hostname: HOST, port: API_PORT, path: url.pathname + url.search, method: request.method, headers: { ...request.headers, host: `${HOST}:${API_PORT}` } }, (apiResponse) => {
      response.writeHead(apiResponse.statusCode || 502, apiResponse.headers);
      apiResponse.pipe(response);
    });
    proxy.on("error", () => { response.writeHead(503, { "Content-Type": "application/json; charset=utf-8" }); response.end(JSON.stringify({ error: "森森後端 API 尚未啟動。" })); });
    request.pipe(proxy);
    return;
  }
  const siteRoot = path.join(root, "site");
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("網址編碼無效");
    return;
  }
  const safePath = decodedPath.replace(/^\/+/, "");
  const candidates = url.pathname.endsWith("/")
    ? [path.join(siteRoot, safePath, "index.html")]
    : [
        path.join(siteRoot, safePath),
        path.join(siteRoot, safePath, "index.html"),
      ];
  const fallbackRoutes = {
    "/crawl-results.json": path.join(root, "data", "crawl", "crawl-results.json"),
    "/crawl-results.csv": path.join(root, "data", "crawl", "crawl-results.csv"),
  };
  const filePath = fallbackRoutes[url.pathname] || candidates.find((candidate) => {
    const relative = path.relative(siteRoot, candidate);
    return !relative.startsWith("..") && !path.isAbsolute(relative) && isFile(candidate);
  });

  if (!filePath) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("找不到頁面");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("無法讀取檔案");
      return;
    }
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(content);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`連接埠 ${PORT} 已被使用，請改用 PORT=3001 npm start`);
  } else {
    console.error(error.message);
  }
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`森森點心坊本地整站已啟動：http://${HOST}:${PORT}`);
  console.log("按 Ctrl+C 可停止伺服器");
});

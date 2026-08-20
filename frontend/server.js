const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || process.env.FRONTEND_PORT || 3000);
const API_HOST = process.env.API_HOST || HOST;
const API_PORT = Number(process.env.API_PORT || 8081);
const ROOT = path.resolve(__dirname, '..');
const SITE_ROOT = path.join(ROOT, 'site');
const ADMIN_ROOT = path.join(__dirname, 'admin');
const CRAWL_ROOT = path.join(ROOT, 'data', 'crawl');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.eot': 'application/vnd.ms-fontobject',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function safeFilePath(baseRoot, relativePath) {
  const resolved = path.resolve(baseRoot, relativePath.replace(/^\/+/, ''));
  const relative = path.relative(baseRoot, resolved);
  return relative.startsWith('..') || path.isAbsolute(relative) ? null : resolved;
}

function fileForRoute(urlPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch {
    return null;
  }

  const isAdmin = decodedPath === '/admin' || decodedPath.startsWith('/admin/');
  const baseRoot = isAdmin ? ADMIN_ROOT : SITE_ROOT;
  const relativePath = isAdmin ? decodedPath.replace(/^\/admin/, '') : decodedPath;
  const cleanPath = relativePath || '/';
  const candidates = cleanPath.endsWith('/')
    ? [path.join(baseRoot, cleanPath, 'index.html')]
    : [path.join(baseRoot, cleanPath), path.join(baseRoot, cleanPath, 'index.html')];

  return candidates.map(candidate => safeFilePath(baseRoot, path.relative(baseRoot, candidate)))
    .find(candidate => candidate && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

function proxyApi(request, response, url) {
  const proxy = http.request({
    hostname: API_HOST,
    port: API_PORT,
    path: url.pathname + url.search,
    method: request.method,
    headers: { ...request.headers, host: `${API_HOST}:${API_PORT}` }
  }, apiResponse => {
    response.writeHead(apiResponse.statusCode || 502, apiResponse.headers);
    apiResponse.pipe(response);
  });
  proxy.on('error', () => {
    if (!response.headersSent) response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: '森森後端 API 尚未啟動。' }));
  });
  request.pipe(proxy);
}

function serveFile(response, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('無法讀取檔案');
      return;
    }
    response.writeHead(200, {
      'Content-Type': CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || HOST}`);
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return proxyApi(request, response, url);

  const fallbackRoutes = {
    '/crawl-results.json': path.join(CRAWL_ROOT, 'crawl-results.json'),
    '/crawl-results.csv': path.join(CRAWL_ROOT, 'crawl-results.csv')
  };
  const filePath = fallbackRoutes[url.pathname] || fileForRoute(url.pathname);
  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('找不到頁面');
    return;
  }
  serveFile(response, filePath);
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') console.error(`前端連接埠 ${PORT} 已被使用，請改用 FRONTEND_PORT=3001`);
  else console.error(error.message);
  process.exitCode = 1;
});

server.listen(PORT, HOST, () => {
  console.log(`森森前端服務 running at http://${HOST}:${PORT}`);
  console.log(`API 代理目標：http://${API_HOST}:${API_PORT}`);
});

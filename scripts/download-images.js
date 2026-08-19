const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { execFile } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SITE_DIR = path.join(ROOT, "site");
const IMAGE_DIR = path.join(ROOT, "data", "images");
const MAP_FILE = path.join(IMAGE_DIR, "image-map.json");
const CONCURRENCY = 6;
const { extensionFor, nameForSource } = require("./image-names");

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.href;
  } catch {
    return "";
  }
}

function requestBuffer(target, redirects = 0) {
  const nativeRequest = new Promise((resolve, reject) => {
    let url;
    try { url = new URL(target); } catch (error) { reject(error); return; }
    const client = url.protocol === "https:" ? https : http;
    const request = client.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 sensen-local-asset-downloader" },
      timeout: 30000,
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location && redirects < 5) {
        response.resume();
        requestBuffer(new URL(response.headers.location, url).href, redirects + 1).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: response.headers["content-type"] || "" }));
    });
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("timeout")));
  });
  return nativeRequest.catch(() => requestBufferWithCurl(target));
}

function requestBufferWithCurl(target) {
  return new Promise((resolve, reject) => {
    execFile("curl", ["-L", "--fail", "--silent", "--show-error", "--max-time", "60", "-A", "Mozilla/5.0 sensen-local-asset-downloader", target], {
      encoding: null,
      maxBuffer: 50 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      if (error) {
        const message = Buffer.isBuffer(stderr) ? stderr.toString("utf8").trim() : String(stderr || "").trim();
        reject(new Error(message || error.message));
        return;
      }
      resolve({ buffer: stdout, contentType: "" });
    });
  });
}

function collectSources() {
  const sources = new Set();
  function scan(filePath) {
    const text = fs.readFileSync(filePath, "utf8");
    for (const match of text.matchAll(/data-image-source="([^"]+)"/g)) sources.add(normalizeUrl(match[1]));
    for (const match of text.matchAll(/url\((?:"|')?(https?:\/\/[^)"']+)(?:"|')?\)/g)) sources.add(normalizeUrl(match[1]));
  }
  function walk(directory) {
    for (const name of fs.readdirSync(directory)) {
      const filePath = path.join(directory, name);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) walk(filePath);
      else if (/\.(html|css)$/i.test(name)) scan(filePath);
    }
  }
  walk(SITE_DIR);
  sources.delete("");
  return [...sources].sort();
}

async function main() {
  if (!fs.existsSync(SITE_DIR)) throw new Error("找不到 site/，請先執行 npm run build");
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, "utf8")) : {};
  const sources = collectSources();
  let cursor = 0;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const usedNames = new Set(Object.values(map));
  async function worker() {
    while (cursor < sources.length) {
      const source = sources[cursor++];
      if (map[source] && fs.existsSync(path.join(IMAGE_DIR, map[source]))) {
        skipped++;
        continue;
      }
      try {
        const result = await requestBuffer(source);
        const filename = nameForSource(source, result.contentType, downloaded + 1, usedNames);
        fs.writeFileSync(path.join(IMAGE_DIR, filename), result.buffer);
        map[source] = filename;
        downloaded++;
        process.stdout.write(`OK ${downloaded}/${sources.length} ${source}\n`);
      } catch (error) {
        failed++;
        process.stdout.write(`FAIL ${source} — ${error.message}\n`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));
  console.log(`Downloaded ${downloaded}, skipped ${skipped}, failed ${failed}. Map: ${path.relative(ROOT, MAP_FILE)}`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });

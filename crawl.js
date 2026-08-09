const https = require("https");
const http = require("http");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");

const BASE = "https://www.sensen.com.tw";
const baseHost = new URL(BASE).hostname;

const MAX_PAGES = 500;
const CONCURRENCY = 6;
const DELAY_MS = 300;

const SKIP_EXT = /\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot|otf|pdf|zip|rar|mp4|mp3|avi|mov|webm|doc|docx|xls|xlsx|ppt|pptx|xml|json|txt|map)$/i;

const visited = new Set();
const enqueued = new Set([BASE.replace(/\/+$/, "")]);
const results = [];
const queue = [BASE];

let savedCount = 0;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function saveResults() {
  const sorted = [...results].sort((a, b) => a.url.localeCompare(b.url));
  fs.writeFileSync(path.join(__dirname, "crawl-results.json"), JSON.stringify(sorted, null, 2));
  const csv = ["url,status,title,link_count",
    ...sorted.map((r) => `"${r.url}",${r.status},"${(r.title || "").replace(/"/g, '""')}",${r.links || 0}`),
  ].join("\n");
  fs.writeFileSync(path.join(__dirname, "crawl-results.csv"), csv);
  savedCount++;
}

function fetchWithRedirects(target, redirects = 0) {
  return new Promise((resolve) => {
    let url;
    try { url = new URL(target); } catch { resolve({ status: 0, error: "invalid url", body: "" }); return; }
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
      },
      timeout: 20000,
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        resolve(fetchWithRedirects(next, redirects + 1));
        return;
      }
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (body += c));
      res.on("end", () => resolve({ status: res.statusCode, body, finalUrl: url.href }));
    });
    req.on("error", (e) => resolve({ status: 0, error: e.message, body: "" }));
    req.on("timeout", () => { req.destroy(); resolve({ status: 0, error: "timeout", body: "" }); });
  });
}

function extractLinks(baseUrl, body) {
  const links = new Set();
  const re = /href\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(body)) !== null) {
    let raw = m[1].trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("javascript:") || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    let abs;
    try { abs = new URL(raw, baseUrl).href; } catch { continue; }
    let u;
    try { u = new URL(abs); } catch { continue; }
    if (u.hostname !== baseHost) continue;
    abs = abs.split("#")[0];
    if (SKIP_EXT.test(abs)) continue;
    if (abs.endsWith("/")) abs = abs.slice(0, -1);
    links.add(abs);
  }
  return [...links];
}

function extractTitle(body) {
  const m = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/&#8211;|&#8217;|&amp;|&nbsp;/g, (x) => ({ "&#8211;": "–", "&#8217;": "’", "&amp;": "&", "&nbsp;": " " }[x])).trim() : "";
}

function isHtml(body) {
  return /<html|<!doctype/i.test(body.slice(0, 200));
}

let totalProcessed = 0;

async function worker() {
  while (true) {
    if (results.length >= MAX_PAGES) break;
    const url = queue.shift();
    if (!url) { await sleep(50); if (queue.length === 0) break; continue; }
    const norm = url.replace(/\/+$/, "");
    if (visited.has(norm)) continue;
    visited.add(norm);
    totalProcessed++;

    const { status, body, error, finalUrl } = await fetchWithRedirects(url);
    if (error) {
      results.push({ url: norm, status, title: "", error, links: 0 });
      process.stdout.write(`X ${norm} (${error})\n`);
    } else {
      let title = "";
      let linkCount = 0;
      if (body && isHtml(body)) {
        title = extractTitle(body);
        const links = extractLinks(finalUrl || url, body);
        linkCount = links.length;
        for (const l of links) {
          const ln = l.replace(/\/+$/, "");
          if (!visited.has(ln) && !enqueued.has(ln) && results.length + queue.length < MAX_PAGES * 2) {
            enqueued.add(ln);
            queue.push(ln);
          }
        }
      }
      results.push({ url: norm, status, title, links: linkCount });
      process.stdout.write(`OK [${status}] ${norm} — ${title} (${linkCount} links)\n`);
    }

    if (results.length % 20 === 0) saveResults();
    await sleep(DELAY_MS);
  }
}

(async () => {
  process.stdout.write(`Crawling ${BASE} (max ${MAX_PAGES} pages)...\n\n`);
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) workers.push(worker());
  await Promise.all(workers);

  saveResults();
  const ok = results.filter((r) => r.status === 200).length;
  const redir = results.filter((r) => [301, 302, 303, 307, 308].includes(r.status)).length;
  const err = results.filter((r) => r.status !== 200 && ![301, 302, 303, 307, 308].includes(r.status)).length;
  process.stdout.write(`\nDone. ${results.length} pages saved.\nOK: ${ok}  Redirect: ${redir}  Error: ${err}\nFiles: crawl-results.json, crawl-results.csv\n`);
})();

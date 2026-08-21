const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "site");
const IMAGE_DATA_DIR = path.join(ROOT, "data", "images");
const IMAGE_MAP_FILE = path.join(IMAGE_DATA_DIR, "image-map.json");
const CRAWL_FILE = path.join(ROOT, ".firecrawl", "sensen-full-crawl.json");
const FALLBACK_FILE = path.join(ROOT, "data", "crawl", "crawl-results.json");
const WP_FILES = [
  path.join(ROOT, ".firecrawl", "wp-pages.json"),
  path.join(ROOT, ".firecrawl", "wp-posts.json"),
  path.join(ROOT, ".firecrawl", "wp-posts-2.json"),
  path.join(ROOT, ".firecrawl", "wp-portfolio.json"),
];
const WORDPRESS_EXPORT_FILES = [
  path.join(ROOT, "data", "wordpress", "WordPress.2026-08-09.xml"),
  path.join(ROOT, "data", "wordpress", "WordPress.2026-08-09 (2).xml"),
];
const MISSING_URLS_FILE = path.join(ROOT, ".firecrawl", "missing-urls.txt");
const EXTRA_MARKDOWN_PAGES = [
  ["https://www.sensen.com.tw/latest-news/森森吐司/", "latest-detail-1.md"],
  ["https://www.sensen.com.tw/latest-news/歐包系列/", "latest-detail-2.md"],
  ["https://www.sensen.com.tw/new-arrival/草莓甜心-3/", "latest-detail-3.md"],
  ["https://www.sensen.com.tw/new-arrival/bebuilder-1845/", "latest-detail-4.md"],
  ["https://www.sensen.com.tw/latest-news/2025母親節蛋糕預購開跑/", "latest-detail-5.md"],
  ["https://www.sensen.com.tw/latest-news/2024新春禮盒/", "latest-detail-6.md"],
  ["https://www.sensen.com.tw/latest-news/餐盒menu/", "latest-detail-7.md"],
  ["https://www.sensen.com.tw/new-arrival/西點禮盒/", "latest-detail-8.md"],
  ["https://www.sensen.com.tw/latest-news/2023中秋dm/", "latest-detail-9.md"],
  ["https://www.sensen.com.tw/latest-news/bebuilder-1930/", "latest-detail-10.md"],
  ["https://www.sensen.com.tw/latest-news/2024母親節蛋糕/", "latest-detail-11.md"],
];
const SOURCE_ORIGIN = "https://www.sensen.com.tw";
const HOME_SLIDES = [
  ["/assets/images/image-photo-4.jpg", "SenSen Bakery bread promotion"],
  ["/assets/images/image-photo-6.jpg", "SenSen Bakery coffee promotion"],
  ["/assets/images/image-photo-1.jpg", "SenSen Bakery store information"],
  ["/assets/images/image-photo-2.jpg", "SenSen Bakery seasonal products"],
  ["/assets/images/image-photo-5.jpg", "SenSen Bakery announcement"],
];

const BIRTHDAY_CAKE_PATH = "/產品介紹/生日蛋糕-下方有dm供下載-264";
const CATERING_PATH = "/精緻外燴-355";
const BOSTON_PIE_PATH = "/頂家彌月/波士頓派系列";

const CAKE_SECTIONS = [
  {
    eyebrow: "BIRTHDAY CAKE",
    title: "生日蛋糕 (下方有DM供下載)",
    icon: "/assets/images/icon-cake.png",
    products: [
      ["綠寶石萊思克<br>(季節限定)", "10", "cake-2024-11.png", "/product-item/%e7%b6%a0%e5%af%b6%e7%9f%b3%e8%90%8a%e6%80%9d%e5%85%8b%e5%ad%a3%e7%af%80%e9%99%90%e5%ae%9a-1870/"],
      ["草莓萊思克(季<br>節限定)", "17", "cake-2024-10.png", "/product-item/%e8%8d%89%e8%8e%93%e8%90%8a%e6%80%9d%e5%85%8b%e5%ad%a3%e7%af%80%e9%99%90%e5%ae%9a-1868/"],
      ["焦糖派對", "31", "cake-2024-1.png", "/product-item/%e7%84%a6%e7%b3%96%e6%b4%be%e5%b0%8d-732/"],
      ["古拉瓦", "14", "cake-21.png", "/product-item/%e5%8f%a4%e6%8b%89%e7%93%a6/"],
      ["百香洋梨", "25", "cake-2024-2.png", "/product-item/%e7%99%be%e9%a6%99%e6%b4%8b%e6%a2%a8-728/"],
      ["繽紛世界", "34", "cake-2020-12.png", "/product-item/%e7%b9%bd%e7%b4%9b%e4%b8%96%e7%95%8c/"],
      ["摩卡", "16", "cake-15-2.png", "/product-item/%e6%91%a9%e5%8d%a1/"],
      ["榛果脆心巧思", "10", "cake-13-1.png", "/product-item/%e6%a6%9b%e6%9e%9c%e8%84%86%e5%bf%83%e5%b7%a7%e6%80%9d/"],
      ["黑森林", "17", "cake-2020-4.png", "/product-item/%e9%bb%91%e6%a3%ae%e6%9e%97/"],
      ["雪芙蕾", "20", "cake-11.png", "/product-item/%e9%9b%aa%e8%8a%99%e8%95%be/"],
    ],
    loadMore: true,
  },
  {
    eyebrow: "CARTOON SHAPE CAKE",
    title: "造型蛋糕",
    products: [
      ["蜘蛛人", "8", "dsc03882.png", "/product-item/%e8%9c%98%e8%9b%9b%e4%ba%ba-1157/"],
      ["北極熊", "11", "cake-2020-9.png", "/product-item/%e5%8c%97%e6%a5%b5%e7%86%8a/"],
      ["喜八柴柴", "5", "cake-2024-3.png", "/product-item/%e5%96%9c%e5%85%ab%e6%9f%b4%e6%9f%b4-259/"],
      ["拉拉熊", "5", "cake-cartoon-6.png", "/product-item/%e6%8b%89%e6%8b%89%e7%86%8a/"],
      ["皮卡丘", "9", "cake-2024-5.png", "/product-item/%e7%9a%ae%e5%8d%a1%e4%b8%98/"],
      ["可愛兔", "5", "cake-cartoon-2-2.png", "/product-item/%e5%8f%af%e6%84%9b%e5%85%94/"],
    ],
  },
  {
    eyebrow: "ICE CREAM CAKE",
    title: "冰淇淋蛋糕",
    products: [
      ["OREO", "36", "cake-2024-15.png", "/product-item/oreo%e5%86%b0%e6%b7%87%e6%b7%8b%e8%9b%8b%e7%b3%95-1878/"],
      ["黃色小鴨", "23", "cake-2024-14.png", "/product-item/%e9%bb%83%e8%89%b2%e5%b0%8f%e9%b4%a8-1876/"],
      ["莓麗朵", "24", "cake-2024-12.png", "/product-item/%e8%8e%93%e9%ba%97%e6%9c%b5-245/"],
      ["黑爵士", "22", "cake-2024-13.png", "/product-item/%e9%bb%91%e7%88%b5%e5%a3%ab-207/"],
    ],
  },
];

const NAV_ITEMS = [
  ["關於森森", "/%e9%97%9c%e6%96%bc%e6%a3%ae%e6%a3%ae/"],
  ["最新消息", "/%e6%9c%80%e6%96%b0%e6%b6%88%e6%81%af/"],
  ["產品介紹", "/%e7%94%a2%e5%93%81%e4%bb%8b%e7%b4%b9/%e7%94%9f%e6%97%a5%e8%9b%8b%e7%b3%95-%e4%b8%8b%e6%96%b9%e6%9c%89dm%e4%be%9b%e4%b8%8b%e8%bc%89-264/"],
  ["酒會/茶會", "/%e7%b2%be%e7%b7%bb%e5%a4%96%e7%87%b4-355/"],
  ["頂家彌月", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e6%b3%a2%e5%a3%ab%e9%a0%93%e6%b4%be%e7%b3%bb%e5%88%97/"],
  ["常見問題", "/%e5%b8%b8%e8%a6%8b%e5%95%8f%e9%a1%8c/"],
  ["門市資訊", "/%e9%96%80%e5%b8%82%e8%b3%87%e8%a8%8a/"],
  ["連絡我們", "/contact/"],
];

const BRANDED_HERO_PATHS = new Set([
  "/關於森森",
  "/最新消息",
  "/產品介紹",
  "/產品介紹/生日蛋糕-下方有dm供下載-264",
  "/精緻外燴-355",
  "/頂家彌月",
  "/頂家彌月/波士頓派系列",
  "/常見問題",
  "/門市資訊",
  "/contact",
  "/產品介紹/伴手禮",
  "/森森咖啡",
]);

const NAV_CHILDREN = new Map([
  ["產品介紹", [
    ["生日蛋糕", "/%e7%94%a2%e5%93%81%e4%bb%8b%e7%b4%b9/%e7%94%9f%e6%97%a5%e8%9b%8b%e7%b3%95-%e4%b8%8b%e6%96%b9%e6%9c%89dm%e4%be%9b%e4%b8%8b%e8%bc%89-264/"],
    ["伴手禮", "/%e7%94%a2%e5%93%81%e4%bb%8b%e7%b4%b9/%e4%bc%b4%e6%89%8b%e7%a6%ae/"],
    ["飲品 MENU", "/%e6%a3%ae%e6%a3%ae%e5%92%96%e5%95%a1/"],
  ]],
  ["酒會/茶會", [
    ["精緻外燴", "/%e7%b2%be%e7%b7%bb%e5%a4%96%e7%87%b4-355/"],
    ["茶會點心", "/%e8%8c%b6%e6%9c%83%e9%bb%9e%e5%bf%83-tea-party/"],
  ]],
  ["頂家彌月", [
    ["彌月試吃申請", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/taste_apply/"],
    ["波士頓派系列", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e6%b3%a2%e5%a3%ab%e9%a0%93%e6%b4%be%e7%b3%bb%e5%88%97/"],
    ["大熊/小熊禮盒", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e5%a4%a7%e7%86%8a-%e5%b0%8f%e7%86%8a%e7%a6%ae%e7%9b%92/"],
    ["圓圓派", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e5%9c%93%e5%9c%93%e6%b4%be-744/"],
    ["鄉村乳酪禮盒", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e9%a6%99%e6%9d%91%e4%b9%b3%e9%85%aa%e7%a6%ae%e7%9b%92/"],
    ["長條蛋糕", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e5%bd%8c%e6%9c%88%e9%95%b7%e6%a2%9d%e8%9b%8b%e7%b3%95/"],
    ["搭配單品", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e6%90%ad%e9%85%8d%e5%96%ae%e5%93%81/"],
    ["彌月謝卡", "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e5%bd%8c%e6%9c%88%e8%ac%9d%e5%8d%a1/"],
  ]],
]);

const STORE_MODULE_PAGES = [
  { url: "https://www.sensen.com.tw/customer/admin/", title: "會員登入" },
  { url: "https://www.sensen.com.tw/customer/admin/backup/", title: "會員後台" },
  { url: "https://www.sensen.com.tw/cart/", title: "購物車" },
  { url: "https://www.sensen.com.tw/checkout/", title: "結帳" },
  { url: "https://www.sensen.com.tw/orders/", title: "我的訂單" },
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeCrawlPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.pages)) return payload.pages;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function decodeEntities(value) {
  return String(value)
    .replace(/&#(\d+);/g, (match, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (match, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&nbsp;/g, " ");
}

function stripTags(value) {
  return decodeEntities(String(value).replace(/<[^>]*>/g, "")).trim();
}

function readWordPressPages() {
  const records = [];
  for (const filePath of WP_FILES) {
    if (!fs.existsSync(filePath)) continue;
    const payload = readJson(filePath);
    if (!Array.isArray(payload)) continue;
    for (const item of payload) {
      if (!item.link || !isVisiblePage(item.link)) continue;
      records.push({
        url: item.link,
        title: stripTags(item.title?.rendered || item.slug || "森森點心坊"),
        html: wpContentForItem(item),
        imageSource: item._embedded?.["wp:featuredmedia"]?.[0]?.source_url || firstImageSource(item.content?.rendered),
        source: "wordpress-api",
        date: item.date,
      });
    }
  }
  return records;
}

function xmlValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return "";
  const value = match[1].trim();
  const cdata = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return cdata ? cdata[1] : decodeEntities(value);
}

function xmlPostMeta(item, key) {
  for (const match of item.matchAll(/<wp:postmeta\b[\s\S]*?<\/wp:postmeta>/g)) {
    if (xmlValue(match[0], "wp:meta_key") === key) return xmlValue(match[0], "wp:meta_value");
  }
  return "";
}

function builderHtmlFromItem(item) {
  const rawObject = xmlPostMeta(item, "mfn-page-object");
  if (!rawObject) return { html: "", image: false };
  let object;
  try {
    object = JSON.parse(rawObject);
  } catch {
    return { html: "", image: false };
  }

  const blocks = [];
  const seen = new Set();
  const images = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (value.attr?.src) images.push(String(value.attr.src));
    if (typeof value.attr?.content === "string") {
      const content = value.attr.content.trim();
      const title = String(value.attr.title || "").trim();
      const key = `${title}\n${content}`.replace(/\s+/g, " ");
      if (content && !seen.has(key) && !(title === "內容" && content === title)) {
        seen.add(key);
        if (content === title && title) {
          blocks.push(`<h3>${escapeHtml(title)}</h3>`);
        } else if (/^\s*</.test(content)) {
          blocks.push(content);
        } else {
          blocks.push(`<p>${escapeHtml(content)}</p>`);
        }
      }
    }
    if (Array.isArray(value)) value.forEach(visit);
    else Object.entries(value).forEach(([key, child]) => {
      if (key !== "content") visit(child);
    });
  };
  visit(object);
  const imageSource = images.find((src) =>
    /\.(?:jpg|jpeg|png|gif|webp)(?:[?#]|$)/i.test(src)
    && !/(?:icon-|logo|bar-|whitewall|headtitle|appicon)/i.test(src),
  );
  return {
    html: `${imageSource ? imageSlotHtml({ source: imageSource, className: "product-image" }) : ""}${blocks.join("\n")}`,
    image: Boolean(imageSource),
    imageSource: imageSource || "",
  };
}

function readWordPressExport() {
  const records = [];
  for (const filePath of WORDPRESS_EXPORT_FILES) {
    if (!fs.existsSync(filePath)) continue;
    const xml = fs.readFileSync(filePath, "utf8");
    const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/g)].map((match) => match[0]);
    const attachmentUrls = new Map();
    for (const item of items) {
      if (xmlValue(item, "wp:post_type") !== "attachment") continue;
      const id = xmlValue(item, "wp:post_id");
      const attachmentUrl = xmlValue(item, "wp:attachment_url");
      if (id && attachmentUrl) attachmentUrls.set(id, attachmentUrl);
    }
    for (const item of items) {
      const postType = xmlValue(item, "wp:post_type");
      if (!["post", "page", "portfolio"].includes(postType) || xmlValue(item, "wp:status") !== "publish") continue;
      const rawUrl = xmlValue(item, "link");
      const url = rawUrl.replace(/^http:\/\/(?:www\.)?sensen\.com\.tw/i, SOURCE_ORIGIN);
      if (!url || !isVisiblePage(url)) continue;
      const title = xmlValue(item, "title") || xmlValue(item, "wp:post_name") || "森森點心坊";
      const rawHtml = xmlValue(item, "content:encoded") || xmlValue(item, "description");
      const builder = postType === "post" ? { html: "", image: false } : builderHtmlFromItem(item);
      const html = (rawHtml || builder.html).replace(/<!--[\s\S]*?-->/g, "").trim();
      const hasThumbnail = /<wp:meta_key><!\[CDATA\[_thumbnail_id\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[\d+\]\]><\/wp:meta_value>/.test(item);
      const thumbnailId = xmlPostMeta(item, "_thumbnail_id");
      const thumbnailSource = thumbnailId ? attachmentUrls.get(thumbnailId) : "";
      const imageSource = thumbnailSource || builder.imageSource || firstImageSource(html);
      const imagePrefix = hasThumbnail && !html.includes("image-slot")
        ? imageSlotHtml({ source: imageSource, className: "product-image" })
        : "";
      const terms = [...item.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/g)]
        .map((term) => {
          const value = term[1].trim();
          const cdata = value.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
          return cdata ? cdata[1] : decodeEntities(value);
        })
        .filter(Boolean);
      records.push({
        url,
        title,
        html: `${imagePrefix}${html}${terms.length ? `<p class="terms">${terms.map(escapeHtml).join(" / ")}</p>` : ""}`,
        imageSource,
        source: `wordpress-export-${postType}`,
        date: xmlValue(item, "wp:post_date") || xmlValue(item, "pubDate"),
      });
    }
  }
  return records;
}

function firecrawlMarkdownFileForUrl(url) {
  const parsed = new URL(url);
  const rawPath = parsed.pathname.replace(/\/+$/, "");
  const suffix = rawPath ? rawPath.replace(/\//g, "-") : "";
  return path.join(ROOT, ".firecrawl", `${parsed.hostname.replace(/^www\./, "")}${suffix}.md`);
}

function readSupplementalMarkdownPages() {
  const missingPages = fs.existsSync(MISSING_URLS_FILE)
    ? fs.readFileSync(MISSING_URLS_FILE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url) => [url, firecrawlMarkdownFileForUrl(url)])
    : [];
  const sources = [...missingPages, ...EXTRA_MARKDOWN_PAGES.map(([url, file]) => [url, path.join(ROOT, ".firecrawl", file)])];
  return sources.map(([url, filePath]) => {
      if (!fs.existsSync(filePath)) return null;
      return {
        url,
        title: titleFromMarkdown(fs.readFileSync(filePath, "utf8")) || "森森點心坊",
        markdown: fs.readFileSync(filePath, "utf8"),
        source: "firecrawl-supplemental",
      };
    })
    .filter(Boolean);
}

function titleFromMarkdown(markdown) {
  const heading = markdown.match(/^#\s+(.+)$/m) || markdown.match(/^##\s+(.+)$/m);
  return heading ? heading[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim() : "";
}

function wpContentForItem(item) {
  const content = item.content?.rendered || "";
  const excerpt = item.excerpt?.rendered || "";
  const media = item._embedded?.["wp:featuredmedia"]?.[0];
  const terms = (item._embedded?.["wp:term"] || []).flat().map((term) => term.name).filter(Boolean);
  const pieces = [];

  if (media) {
    pieces.push(imageSlotHtml({ source: media.source_url, className: "product-image" }));
  }
  if (content.trim()) {
    pieces.push(content);
  } else if (excerpt.trim()) {
    pieces.push(excerpt);
  }
  if (terms.length) {
    pieces.push(`<p class="terms">${terms.map(escapeHtml).join(" / ")}</p>`);
  }
  return pieces.join("\n");
}

function imageSlotHtml({ source = "", label = "圖片預留位", className = "" } = {}) {
  const classes = ["image-slot", className].filter(Boolean).join(" ");
  const sourceAttr = source ? ` data-image-source="${escapeAttr(source)}"` : "";
  const localFile = localImageFile(source);
  const body = localFile
    ? `<img src="/assets/images/${escapeAttr(localFile)}" alt="${escapeAttr(label)}">`
    : `<span>${escapeHtml(label)}</span>`;
  return `<div class="${classes}"${sourceAttr}>${body}</div>`;
}

function localImageFile(source) {
  if (!source || !fs.existsSync(IMAGE_MAP_FILE)) return "";
  try {
    const map = JSON.parse(fs.readFileSync(IMAGE_MAP_FILE, "utf8"));
    const requested = String(source).split("#")[0];
    const direct = map[requested] || map[String(source)];
    if (direct && fs.existsSync(path.join(IMAGE_DATA_DIR, direct))) return direct;

    // WordPress exports sometimes contain an already-local path instead of
    // the original URL. Preserve the downloaded asset in that case.
    const localPrefix = "/assets/images/";
    if (requested.startsWith(localPrefix)) {
      const localName = decodeURIComponent(requested.slice(localPrefix.length)).split("/").pop();
      if (localName && fs.existsSync(path.join(IMAGE_DATA_DIR, localName))) return localName;
    }

    // Treat http/https and percent-encoded variants of the same WordPress
    // pathname as equivalent. This handles old content that mixes protocols
    // and HTML/XML exports that encode the filename differently.
    let requestedPath = "";
    try { requestedPath = decodeURIComponent(new URL(requested).pathname); } catch {}
    if (requestedPath) {
      for (const [url, filename] of Object.entries(map)) {
        try {
          if (decodeURIComponent(new URL(url).pathname) === requestedPath
            && fs.existsSync(path.join(IMAGE_DATA_DIR, filename))) return filename;
        } catch {}
      }
    }
    return "";
  } catch {
    return "";
  }
}

function firstImageSource(value) {
  const text = String(value || "");
  const markdown = text.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/i);
  if (markdown) return markdown[1];
  const html = text.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
  return html ? html[1] : "";
}

function isVisiblePage(url) {
  try {
    const parsed = new URL(url);
    if (parsed.origin !== SOURCE_ORIGIN) return false;
    if (parsed.pathname.startsWith("/wp-json")) return false;
    if (parsed.pathname.includes("xmlrpc.php")) return false;
    if (parsed.pathname.includes("/feed")) return false;
    if (parsed.pathname.match(/\.(jpg|jpeg|png|gif|webp|pdf|zip|xml)$/i)) return false;
    return true;
  } catch {
    return false;
  }
}

function isLatestNewsPaginationPath(localPath) {
  return /^\/(?:最新消息|latest-news)\/page\/\d+$/i.test(localPath);
}

function localPathFromUrl(url) {
  const parsed = new URL(url);
  const pathname = decodeURI(parsed.pathname).replace(/\/+$/, "");
  return pathname || "/";
}

function htmlFileForLocalPath(localPath) {
  if (localPath === "/") return path.join(OUT_DIR, "index.html");
  const clean = localPath.replace(/^\/+/, "");
  return path.join(OUT_DIR, clean, "index.html");
}

function routeHref(urlOrPath) {
  try {
    const parsed = new URL(urlOrPath, SOURCE_ORIGIN);
    if (parsed.origin !== SOURCE_ORIGIN) return urlOrPath;
    const localPath = localPathFromUrl(parsed.href);
    if (localPath.startsWith("/author/")) return "/%e6%9c%80%e6%96%b0%e6%b6%88%e6%81%af/";
    if (localPath === "/頂家彌月/彌月試吃申請") return "/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/taste_apply/";
    if (localPath.startsWith("/wp-content/")) return "#";
    return localPath;
  } catch {
    return urlOrPath;
  }
}

function titleFromPage(page) {
  return page.title || page.metadata?.title || "森森點心坊";
}

function markdownFromPage(page) {
  return page.markdown || page.content || page.text || "";
}

function readableContentLength(value, isMarkdown = false) {
  let content = String(value || "");
  if (isMarkdown) {
    content = stripNoise(content).split(/\nShare\b/i)[0];
    content = content
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  } else {
    content = stripTags(content);
  }
  return content
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[\s*_`#|\\]+/g, "")
    .length;
}

function contentScore(page) {
  return Math.max(
    readableContentLength(markdownFromPage(page), true),
    readableContentLength(page.html, false),
  );
}

function mergePage(existing, incoming) {
  if (!existing) return incoming;
  const better = contentScore(incoming) > contentScore(existing) ? incoming : existing;
  const other = better === incoming ? existing : incoming;
  return {
    ...other,
    ...better,
    title: titleFromPage(better) || titleFromPage(other),
    url: better.url || other.url,
    markdown: markdownFromPage(better),
    html: better.html || "",
    source: better.source || other.source,
  };
}

function stripNoise(markdown) {
  const primaryHeading = markdown.search(/^#\s+.+$/m);
  const content = primaryHeading > 0 ? markdown.slice(primaryHeading) : markdown;
  return content
    .replace(/\[mobile menu\]\([^)]+\)/gi, "")
    .replace(/\[previous slide\]\([^)]+\)/gi, "")
    .replace(/\[next slide\]\([^)]+\)/gi, "")
    .replace(/\[Toggle submenu\]\([^)]+\)/gi, "")
    .replace(/\[menu close icon\]\([^)]+\)/gi, "")
    .replace(/\[Back to top icon\]\([^)]+\)/gi, "")
    .replace(/Do you like it\?\s*\[[^\]]*\]\([^)]+\)/gi, "")
    .replace(/\nFacebook\s*\n[\s\S]*$/i, "")
    .replace(/\n©\s*2018[\s\S]*$/i, "")
    .replace(/reCAPTCHA[\s\S]*$/i, "")
    .trim();
}

function inlineMarkdown(text) {
  const links = [];
  const source = String(text).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, target) => {
    const href = target.replace(/\s+["'][^"']*["']\s*$/, "").trim();
    const cleanLabel = label.replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim() || "更多";
    const token = `\u0000${links.length}\u0000`;
    links.push(/\.(?:jpg|jpeg|png|gif|webp)(?:\?|#|$)/i.test(href)
      ? escapeHtml(cleanLabel)
      : `<a href="${escapeAttr(routeHref(href))}">${escapeHtml(cleanLabel)}</a>`);
    return token;
  });
  return escapeHtml(source)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\u0000(\d+)\u0000/g, (match, index) => links[Number(index)]);
}

function markdownToHtml(markdown) {
  const lines = stripNoise(markdown).split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = [];
  let imageSlots = [];

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  }

  function flushImages() {
    if (!imageSlots.length) return;
    blocks.push(`<div class="image-grid">${imageSlots.map((source) => imageSlotHtml({ source })).join("")}</div>`);
    imageSlots = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const image = line.match(/^!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)
      || line.match(/^\[!\[[^\]]*\]\((https?:\/\/[^)]+)\)\]\((?:https?:\/\/[^)]+)\)/);
    if (image && /\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i.test(image[1])) {
      flushParagraph();
      flushList();
      if (/\/((icon|bar|whitewall|home-icon)[^/]*)\.(jpg|jpeg|png|gif|webp)/i.test(image[1])) {
        flushImages();
        const localFile = localImageFile(image[1]);
        blocks.push(`<div class="image-icon-slot" data-image-source="${escapeAttr(image[1])}">${localFile ? `<img src="/assets/images/${escapeAttr(localFile)}" alt="圖片預留位">` : "<span>圖片預留位</span>"}</div>`);
      } else {
        imageSlots.push(image[1]);
      }
      continue;
    }

    flushImages();

    if (/^(?:\*\s*){3,}$/.test(line) || /^-{3,}$/.test(line)) {
      flushParagraph();
      flushList();
      blocks.push("<hr>");
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length + 1, 5);
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushImages();
  return blocks.join("\n");
}

function createIndex(pages) {
  const groups = new Map();
  for (const page of pages) {
    const localPath = localPathFromUrl(page.url);
    const first = localPath.split("/").filter(Boolean)[0] || "首頁";
    if (!groups.has(first)) groups.set(first, []);
    groups.get(first).push(page);
  }

  return [...groups.entries()].map(([group, items]) => `
    <section class="directory-group">
      <h2>${escapeHtml(decodeURIComponent(group))}</h2>
      <div class="directory-grid">
        ${items.map((page) => `<a class="directory-card" href="${escapeAttr(localPathFromUrl(page.url))}">
          <span>${escapeHtml(titleFromPage(page))}</span>
          <small>${escapeHtml(decodeURI(localPathFromUrl(page.url)))}</small>
        </a>`).join("")}
      </div>
    </section>`).join("");
}

function layout({ title, pathLabel, content, isHome = false, isAbout = false, hasBrandedHero = false, heroSource = "/assets/images/headtitle-bg2.jpg", showHero = true }) {
  const checkoutStyle = pathLabel === "/checkout" ? '<link rel="stylesheet" href="/assets/checkout.css">' : "";
  const isBirthdayCakePage = title.includes("生日蛋糕") && title.includes("DM");
  const nav = NAV_ITEMS.map(([label, href]) => {
    const children = NAV_CHILDREN.get(label) || [];
    const childMenu = children.length
      ? `<div class="submenu">${children.map(([childLabel, childHref]) => `<a href="${childHref}">${childLabel}</a>`).join("")}</div>`
      : "";
    return `<div class="menu-item"><a href="${href}">${label}${children.length ? " <span class=\"menu-arrow\">⌄</span>" : ""}</a>${childMenu}</div>`;
  }).join("");
  const heroImage = hasBrandedHero
    ? imageSlotHtml({ source: heroSource, label: "頁首背景圖片" })
    : `<div class="image-slot"><span>頁首圖片預留位</span></div>`;
  const heroTitle = title.replace(/\s+–\s+森森點心坊$/, "");
  const heroTitleHtml = isBirthdayCakePage
    ? `<a class="cake-hero-scroll" href="#cake-dm">${escapeHtml(heroTitle)}</a>`
    : escapeHtml(heroTitle);
  const hero = isHome || !showHero ? "" : `<section class="page-hero${hasBrandedHero ? " about-hero" : ""}">
      <div class="hero-banner">${heroImage}<div class="hero-banner-title"><p>${escapeHtml(pathLabel)}</p><h1>${heroTitleHtml}</h1></div></div>
    </section>`;
  const homeScript = isHome ? `<script>
(() => {
  const carousel = document.querySelector("[data-home-carousel]");
  if (!carousel) return;
  const track = carousel.querySelector(".carousel-track");
  const slides = [...track.querySelectorAll("[data-carousel-slide]")];
  const dots = [...document.querySelectorAll("[data-carousel-dot]")];
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  if (slides.length < 2) return;
  const slideCount = slides.length;
  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slideCount - 1].cloneNode(true);
  [firstClone, lastClone].forEach((slide) => {
    slide.classList.remove("is-active");
    slide.removeAttribute("data-carousel-slide");
    slide.setAttribute("aria-hidden", "true");
  });
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);
  let current = 0;
  let timer;
  let isMoving = false;
  const normalized = (index) => (index + slideCount) % slideCount;
  const setTransition = (enabled) => {
    track.style.transition = enabled ? "" : "none";
  };
  const setPosition = (index) => {
    track.style.transform = "translateX(-" + ((index + 1) * 100) + "%)";
  };
  const updateState = (index) => {
    const active = normalized(index);
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
      dot.setAttribute("aria-selected", i === active ? "true" : "false");
    });
  };
  const jumpTo = (index) => {
    current = index;
    setTransition(false);
    setPosition(current);
    updateState(current);
    track.getBoundingClientRect();
    setTransition(true);
  };
  const show = (index) => {
    if (isMoving) return;
    isMoving = true;
    current = index;
    setTransition(true);
    setPosition(current);
    updateState(current);
  };
  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    if (current >= slideCount) jumpTo(0);
    if (current < 0) jumpTo(slideCount - 1);
    isMoving = false;
  });
  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(current + 1), 5000);
  };
  previous?.addEventListener("click", () => { show(current - 1); restart(); });
  next?.addEventListener("click", () => { show(current + 1); restart(); });
  dots.forEach((dot, i) => dot.addEventListener("click", () => {
    if (current === slideCount - 1 && i === 0) show(slideCount);
    else if (current === 0 && i === slideCount - 1) show(-1);
    else show(i);
    restart();
  }));
  carousel.addEventListener("mouseenter", () => window.clearInterval(timer));
  carousel.addEventListener("mouseleave", restart);
  jumpTo(0);
  restart();
})();
</script>` : "";
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/assets/site.css">
  ${checkoutStyle}
</head>
<body>
  <header class="site-header">
    <nav class="nav" aria-label="主選單">
      <a class="brand" href="/" aria-label="森森點心坊首頁"><img class="brand-logo" src="/assets/images/logo.png" alt="森森點心坊 SenSen Bakery"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="開啟主選單"><span></span><span></span><span></span></button>
      <div class="menu" id="site-menu">${nav}<div class="mobile-nav-actions" aria-label="森森會員功能">
        <a class="mobile-nav-action" href="/customer/admin/"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5"></path></svg><span>會員中心</span></a>
        <button class="mobile-nav-action cart-trigger" type="button" aria-controls="sensen-cart-drawer" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H6"></path><circle cx="10" cy="20" r="1"></circle><circle cx="17" cy="20" r="1"></circle></svg><span>購物車</span><b class="cart-count" aria-live="polite">0</b></button>
        <a class="mobile-nav-action" href="/admin/"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 9h8M8 13h5M8 17h3"></path></svg><span>員工後台</span></a>
      </div><a class="mobile-menu-social" href="https://www.facebook.com/sensenbakery/" target="_blank" rel="noreferrer" aria-label="Facebook">f</a></div>
      <div class="nav-actions" aria-label="森森會員功能">
        <a class="nav-action" href="/customer/admin/" aria-label="客戶後台" title="客戶後台"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.8-3.3 3.1-5 7-5s6.2 1.7 7 5"></path></svg></a>
        <button class="nav-action cart-trigger" type="button" aria-controls="sensen-cart-drawer" aria-expanded="false" aria-label="開啟購物車" title="購物車"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L20 8H6"></path><circle cx="10" cy="20" r="1"></circle><circle cx="17" cy="20" r="1"></circle></svg><span class="cart-count" aria-live="polite">0</span></button>
        <a class="nav-action" href="/admin/" aria-label="森森員工後台" title="森森員工後台"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M8 9h8M8 13h5M8 17h3"></path></svg></a>
      </div>
    </nav>
  </header>
  <main class="${isHome ? "home-main" : `page-main${isAbout ? " about-page" : ""}`}">
    ${hero}
    ${content}
  </main>
  ${homeScript}
  <script>
  (() => {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector("#site-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.setAttribute("aria-label", expanded ? "開啟主選單" : "關閉主選單");
      menu.classList.toggle("is-open", !expanded);
    });
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "開啟主選單");
        menu.classList.remove("is-open");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "開啟主選單");
        menu.classList.remove("is-open");
        toggle.focus();
      }
    });
  })();
  </script>
  <footer class="footer">© 2018 - 2026 森森點心坊. All Rights Reserved. | Design by <a href="https://www.aq-webdesign.com/index.html" target="_blank" rel="noreferrer">A.Q.webdesign</a>. | <a href="https://www.sensen.com.tw/%e9%9a%b1%e7%A7%81%e6%ac%8a%e6%a2%9d%e6%ac%be/">隱私權政策</a></footer>
  <div class="sensen-cart-overlay" id="sensen-cart-overlay" hidden></div>
  <aside class="sensen-cart-drawer" id="sensen-cart-drawer" aria-label="購物車" aria-hidden="true"><div class="sensen-cart-head"><h2>購物車</h2><button class="sensen-cart-close" type="button" aria-label="關閉購物車">×</button></div><div class="sensen-cart-body"><p data-cart-message>載入中…</p><div data-cart-items></div><div class="sensen-cart-fields" data-cart-options hidden><label>優惠碼<div class="sensen-cart-coupon-row"><input data-cart-coupon type="text" placeholder="輸入優惠碼" autocomplete="off"><button class="sensen-cart-coupon-apply" type="button" data-cart-apply-coupon>套用</button></div></label><label>Pickup date（取貨日期）<input data-cart-pickup type="date"></label><small data-cart-date-hint></small><p class="sensen-cart-quote-message" data-cart-quote-message role="status"></p></div></div><div class="sensen-cart-foot"><div class="sensen-cart-price-lines" data-cart-price-lines hidden><div><span>小計</span><strong data-cart-subtotal>$0.00</strong></div><div data-cart-discount-row hidden><span>折扣</span><strong data-cart-discount>-$0.00</strong></div><div class="is-total"><span>合計</span><strong data-cart-total>$0.00</strong></div></div><a class="button" href="/checkout/">結帳</a><a class="sensen-cart-secondary" href="/customer/admin/">前往會員中心</a></div></aside>
  <script src="/assets/cart-drawer.js"></script>
</body>
</html>`;
}

function homeContent(pages) {
  const news = pages
    .filter((page) => /\/(latest-news|new-arrival)\//.test(localPathFromUrl(page.url)))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 3);
  const newsCards = news.map((page) => `<a class="home-news-card" href="${escapeAttr(localPathFromUrl(page.url))}">
      ${imageSlotHtml({ source: page.imageSource || firstImageSource(markdownFromPage(page) || page.html) })}<small>${escapeHtml((page.date || "").slice(0, 10))}</small><h3>${escapeHtml(titleFromPage(page))}</h3><span>更多</span>
    </a>`).join("");
  const giftTiles = [
    ["/assets/images/macadamia-nut-tart.jpg", "夏威夷豆塔"],
    ["/assets/images/pork-floss-pastry.jpg", "肉鬆餅"],
    ["/assets/images/palmiers-fb3.jpg", "蝴蝶酥"],
    ["/assets/images/almond-layer-pastry-1.jpg", "杏仁千層酥"],
    ["/assets/images/sun-cake-thumbnail-copy.jpg", "經典奶油餅"],
    ["/assets/images/egg-roll-1.jpg", "手工蛋捲"],
    ["/assets/images/assorted-cookies.jpg", "綜合餅乾"],
    ["/assets/images/sandwich-7-2.jpg", "三明治點心"],
  ].map(([source, label]) => `<a class="gift-tile" href="/%e7%94%a2%e5%93%81%e4%bb%8b%e7%b4%b9/%e4%bc%b4%e6%89%8b%e7%a6%ae/" aria-label="${escapeAttr(label)}"><img src="${escapeAttr(source)}" alt="${escapeAttr(label)}"></a>`).join("");
  const slides = HOME_SLIDES.map(([source, label], index) => `<div class="carousel-slide${index === 0 ? " is-active" : ""}" data-carousel-slide>
      ${imageSlotHtml({ source, label })}
    </div>`).join("");
  const dots = HOME_SLIDES.map(([, label], index) => `<button type="button" class="slider-dot${index === 0 ? " is-active" : ""}" data-carousel-dot aria-label="顯示第 ${index + 1} 張輪播圖片" aria-selected="${index === 0 ? "true" : "false"}"></button>`).join("");
  return `<section class="home-copy">
    <div class="hero-split">
      <div class="home-carousel" data-home-carousel aria-label="首頁輪播">
        <div class="carousel-track">${slides}</div>
        <button type="button" class="carousel-control previous" data-carousel-previous aria-label="上一張">‹</button>
        <button type="button" class="carousel-control next" data-carousel-next aria-label="下一張">›</button>
      </div>
    </div><div class="slider-dots" role="tablist" aria-label="首頁輪播控制項">${dots}</div>
  </section>
  <section class="home-intro"><div><h2>享受</h2><h3>嘴角上揚的幸福</h3><span class="wheat-mark">✦</span><p>Fresh, healthy and delicious.</p><p>Sensen always thinks about you.</p></div>
    <div class="quick-links">
      <a aria-label="生日蛋糕" href="/%e7%94%a2%e5%93%81%e4%bb%8b%e7%b4%b9/%e7%94%9f%e6%97%a5%e8%9b%8b%e7%b3%95-%e4%b8%8b%e6%96%b9%e6%9c%89dm%e4%be%9b%e4%b8%8b%e8%bc%89-264/">${imageSlotHtml({ source: "https://www.sensen.com.tw/wp-content/uploads/2024/11/%E9%A6%96%E9%A0%81%E5%9C%96%E7%89%87-1.jpg", label: "Birthday Cake" })}<span>Birthday Cake</span><strong>生日蛋糕</strong><span class="card-arrow" aria-hidden="true">→</span></a>
      <a aria-label="彌月禮盒" href="/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/%e6%b3%a2%e5%a3%ab%e9%a0%93%e6%b4%be%e7%b3%bb%e5%88%97/">${imageSlotHtml({ source: "https://www.sensen.com.tw/wp-content/uploads/2024/11/%E6%A3%ae%E6%A3%ae%E9%A6%96%e9%A0%81-2.jpg", label: "Baby Gift Box" })}<span>Baby Gift Box</span><strong>彌月禮盒</strong><span class="card-arrow" aria-hidden="true">→</span></a>
      <a aria-label="酒會茶會" href="/%e7%b2%be%e7%b7%bb%e5%a4%96%e7%87%b4-355/">${imageSlotHtml({ source: "https://www.sensen.com.tw/wp-content/uploads/2018/11/home-service-3.jpg", label: "Catering" })}<span>Catering</span><strong>酒會/茶會</strong><span class="card-arrow" aria-hidden="true">→</span></a>
    </div>
  </section>
  <section class="home-taste"><div class="image-slot"><span>彌月試吃圖片預留位</span></div><div><h2>彌月試吃申請</h2><p class="eyebrow">TOP HOUSE &amp; SENSEN BAKERY</p><p>無論您是懷孕中的媽咪或是寶寶剛誕生，都感謝您給予機會選擇森森彌月蛋糕，讓我們與您一同分享這份幸福的喜悅！(產前產後均可申請。產前建議懷孕35週以上的媽咪唷!)</p><a class="button" href="/%e9%a0%82%e5%ae%b6%e5%bd%8c%e6%9c%88/taste_apply/">線上申請</a></div></section>
  <section class="home-section"><div class="section-heading"><div><p class="eyebrow">latest news</p><h2>最新消息</h2></div><a href="/%e6%9c%80%e6%96%b0%e6%b6%88%e6%81%af/">更多訊息</a></div><div class="home-news-grid">${newsCards}</div></section>
  <section class="gift-section"><div class="gift-copy"><img class="gift-icon" src="/assets/images/home-icon-giftbox.png" alt="" aria-hidden="true"><h2>精選伴手禮</h2><p>各式經典組合<br>多樣化的選擇<br>吃進嘴裡都是幸福的味道</p><a class="button" href="/%e7%94%a2%e5%93%81%e4%bb%8b%e7%b4%b9/%e4%bc%b4%e6%89%8b%e7%a6%ae/">更多伴手禮</a></div><div class="gift-mosaic">${giftTiles}</div></section>
  <section class="home-catering"><div class="catering-copy"><div class="catering-panel"><div class="catering-title-row"><img class="catering-icon" src="/assets/images/home-icon-cutlery.png" alt="" aria-hidden="true"><div><h2>酒會/外燴服務</h2><p>嚴選食材。精心烹調。味覺饗宴</p></div></div><span class="catering-wave" aria-hidden="true"></span><a class="button" href="/%e7%b2%be%e7%b7%bb%e5%a4%96%e7%87%b4-355/">了解更多 <span aria-hidden="true">›</span></a></div></div><div class="catering-images"><a class="catering-card buffet" href="/%e7%b2%be%e7%b7%bb%e5%a4%96%e7%87%b4-355/">${imageSlotHtml({ source: "/assets/images/home-buffet.jpg", label: "Buffet" })}<div class="catering-card-copy"><span>Buffet</span><strong>精緻外燴</strong><small>菜單下載</small><em aria-hidden="true">⌄</em></div></a><a class="catering-card tea-party" href="/%e8%8c%b6%e6%9c%83%e9%bb%9e%e5%bf%83-tea-party/">${imageSlotHtml({ source: "/assets/images/home-catering.jpg", label: "Tea Party" })}<div class="catering-card-copy"><span>Tea Party</span><strong>茶會點心</strong><small>菜單下載</small><em aria-hidden="true">⌄</em></div></a></div></section>
  <section class="home-stores"><div class="store-grid"><a class="store-card" href="https://goo.gl/maps/WQFSnvZ8iP22" target="_blank" rel="noreferrer"><span class="store-divider" aria-hidden="true"></span><strong>澄和店</strong><span class="store-line">三民區澄和路78號</span><span class="store-line">07-3816662</span><span class="store-pin" aria-hidden="true"></span></a><a class="store-card" href="https://goo.gl/maps/EZFqqQPeh6z" target="_blank" rel="noreferrer"><span class="store-divider" aria-hidden="true"></span><strong>新富店</strong><span class="store-line">鳳山區新富路276號</span><span class="store-line">07-7675992</span><span class="store-pin" aria-hidden="true"></span></a><a class="store-card" href="https://goo.gl/maps/rYLh32wnRdm" target="_blank" rel="noreferrer"><span class="store-divider" aria-hidden="true"></span><strong>博愛店</strong><span class="store-line">鳳山區博愛路219號</span><span class="store-line">07-7993070</span><span class="store-pin" aria-hidden="true"></span></a><a class="store-card" href="https://goo.gl/maps/5hoEqTmHsuF2" target="_blank" rel="noreferrer"><span class="store-divider" aria-hidden="true"></span><strong>文龍店</strong><span class="store-line">鳳山區文龍東路336號</span><span class="store-line">07-7335812</span><span class="store-pin" aria-hidden="true"></span></a></div></section>`;
}

function aboutContent() {
  return `<section class="about-content">
    <img class="about-wheat" src="/assets/images/icon-wheat.png" alt="" aria-hidden="true">
    <div class="about-inner">
      <div class="about-photo-grid">
        <figure class="about-photo about-photo-flavor">
          <img src="/assets/images/about-1.jpg" alt="剛出爐的麵包">
        </figure>
        <figure class="about-photo about-photo-ingredients">
          <img src="/assets/images/about-2.jpg" alt="雞蛋、麵粉與烘焙食材">
        </figure>
      </div>
      <div class="about-copy">
        <h2>品質保證，森森始終為您設想</h2>
        <h3>嘴角上揚的幸福</h3>
        <p>自2001年成立第一家森森歐式點心坊門市，經歷消費者的種種考驗與指導建議<br>下，獲得每一位消費者的青睞，並在2003年成立第二家森森歐式點心坊分店來<br>為大家服務，以滿足不斷口碑相傳的顧客。陸續再成立第三、第四家分店在鳳<br>山區域為大家服務。</p>
      </div>
    </div>
    <section class="about-flavor">
      <div class="about-flavor-inner">
        <img class="about-flavor-icons" src="/assets/images/about-3.png" alt="新鮮、健康、美味">
        <div class="about-flavor-copy">
          <h2>每一口都是幸福的滋味</h2>
          <p>為了維持優良品質，我們在每個小細節都相當注意。而每項商品也都是限量推<br>出，為了就是讓您感受每一口都是幸福的滋味。</p>
        </div>
      </div>
    </section>
    <section class="about-more">
      <img class="about-more-mark" src="/assets/images/about-4.png" alt="" aria-hidden="true">
      <h2>豐富多樣的選擇，嘴角上揚的幸福。</h2>
      <div class="about-actions">
        <a href="/%E9%96%80%E5%B8%82%E8%B3%87%E8%A8%8A/">門市據點</a>
        <a href="https://www.facebook.com/sensenbakery/" target="_blank" rel="noreferrer">Facebook</a>
      </div>
    </section>
  </section>`;
}

function birthdayCakeContent() {
  const sectionHtml = CAKE_SECTIONS.map((section, index) => {
    const iconHtml = section.icon
      ? `<img class="cake-section-icon" src="${escapeAttr(section.icon)}" alt="" aria-hidden="true">`
      : "";
    const cards = section.products.map(([name, likes, image, href]) => `<article class="cake-product-card" data-cake-like-id="${escapeAttr(href)}">
        <a class="cake-product-card-link" href="${escapeAttr(href)}">
          <span class="cake-product-image">
            <img src="/assets/images/${escapeAttr(image)}" alt="${escapeAttr(name.replace(/<br>/g, ""))}">
          </span>
        </a>
        <div class="cake-product-meta">
          <a class="cake-product-title-link" href="${escapeAttr(href)}"><span class="cake-product-title">${name}</span></a>
          <button class="cake-likes" type="button" data-cake-like data-default-likes="${escapeAttr(likes)}" aria-label="喜歡此蛋糕">
            <span class="cake-heart" aria-hidden="true">♡</span><span data-cake-like-count>${escapeHtml(likes)}</span>
          </button>
          <button class="cake-add-cart" type="button" data-add-cart-title="${escapeAttr(name.replace(/<br>/g, "").replace(/\(季節限定\)/g, "（季節限定）"))}">加入購物車</button>
        </div>
      </article>`).join("");
    const loadMore = section.loadMore
      ? `<div class="cake-load-more"><a href="/%e7%94%a2%e5%93%81%e4%bb%8b%e7%b4%b9/%e7%94%9f%e6%97%a5%e8%9b%8b%e7%b3%95-%e4%b8%8b%e6%96%b9%e6%9c%89dm%e4%be%9b%e4%b8%8b%e8%bc%89-264/page/2/">▪▪ Load more</a></div>`
      : "";
    const headingText = index === 0
      ? ""
      : `<p>${escapeHtml(section.eyebrow)}</p>
        <h2>${escapeHtml(section.title)}</h2>`;
    return `<section class="cake-category ${index === 0 ? "is-first" : ""}">
      <div class="cake-category-heading">
        ${iconHtml}
        ${headingText}
      </div>
      <div class="cake-product-grid">${cards}</div>
      ${loadMore}
    </section>`;
  }).join("");

  return `<section class="cake-page">
    ${sectionHtml}
    <section class="cake-dm" id="cake-dm">
      <a href="https://drive.google.com/file/d/1QW07oLnBIAq4wa2NuMnL7oZZvS-uu0je/view" class="cake-dm-link" target="_blank" rel="noreferrer">生日蛋糕DM下載 <span aria-hidden="true">→</span></a>
      <a class="cake-dm-icon" href="https://drive.google.com/file/d/1QW07oLnBIAq4wa2NuMnL7oZZvS-uu0je/view" target="_blank" rel="noreferrer" aria-label="開啟生日蛋糕 DM"><span class="cake-dm-book" aria-hidden="true"></span></a>
      <p>森森不定期推出各式新品蛋糕，歡迎關注我們的FB。</p>
    </section>
  </section>
  <script>
  (() => {
    const storageKey = "sensen-cake-likes";
    let liked = {};
    try { liked = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (error) {}
    document.querySelectorAll("[data-cake-like]").forEach((button) => {
      const card = button.closest("[data-cake-like-id]");
      const id = card?.dataset.cakeLikeId;
      const count = button.querySelector("[data-cake-like-count]");
      const defaultLikes = Number(button.dataset.defaultLikes || 0);
      const update = () => {
        const isLiked = Boolean(liked[id]);
        count.textContent = String(defaultLikes + (isLiked ? 1 : 0));
        button.classList.toggle("is-liked", isLiked);
        button.setAttribute("aria-pressed", String(isLiked));
        button.setAttribute("aria-label", isLiked ? "取消喜歡此蛋糕" : "喜歡此蛋糕");
      };
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        liked[id] = !liked[id];
        try { localStorage.setItem(storageKey, JSON.stringify(liked)); } catch (error) {}
        update();
      });
      update();
    });
  })();
  (() => {
    document.querySelectorAll("[data-add-cart-title]").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const original = button.textContent;
        button.disabled = true;
        button.textContent = "加入中…";
        try {
          const response = await fetch("/api/cart/add", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: button.dataset.addCartTitle, qty: 1 }) });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "加入購物車失敗。");
          button.textContent = "已加入購物車";
          document.querySelector(".cart-trigger")?.click();
        } catch (error) {
          button.textContent = error.message;
          window.setTimeout(() => { button.textContent = original; }, 1800);
        } finally {
          button.disabled = false;
        }
      });
    });
  })();
  </script>`;
}

const CATERING_SECTIONS = [
  ["MAIN COURSE", "主食及肉類", [
    "buffet-main-meal-8.jpg", "buffet-main-meal-11.jpg", "buffet-main-meal-12.jpg",
    "buffet-main-meal-3.jpg", "buffet-main-meal-4.jpg", "buffet-main-meal-13.jpg",
    "buffet-main-meal-6.jpg", "buffet-main-meal-5.jpg", "buffet-main-meal-12-2.jpg",
  ]],
  ["SEAFOOD", "海鮮類", [
    "buffet-seafood-9.jpg", "buffet-seafood-10.jpg", "buffet-seafood-1.jpg",
    "buffet-seafood-2.jpg", "buffet-seafood-3.jpg", "yellow-sea-fresh.jpg", "sea.png",
  ]],
  ["VEGETARIAN FOOD", "素食類", ["rice.jpg"]],
  ["FRIED FOOD & OTHER", "炸物小點類", ["buffet-snacks-3.jpg", "buffet-snacks-1.jpg", "buffet-snacks-2.jpg"]],
];

function cateringContent() {
  const sections = CATERING_SECTIONS.map(([eyebrow, title, images]) => `
    <section class="catering-category">
      <div class="catering-category-heading"><p>${escapeHtml(eyebrow)}</p><h2>${escapeHtml(title)}</h2></div>
      <div class="catering-product-grid">${images.map((image) => `<div class="catering-product"><img src="/assets/images/${escapeAttr(image)}" alt="${escapeAttr(title)}餐點"></div>`).join("")}</div>
    </section>`).join("");
  return `<section class="catering-page">
    <section class="catering-intro">
      <img class="catering-intro-icon" src="/assets/images/icon-cutlery.png" alt="" aria-hidden="true">
      <p class="catering-intro-eyebrow">Catering Service</p>
      <h1>嚴選食材。精心烹調。味覺饗宴</h1>
      <p class="catering-intro-copy">節慶與親友同事公司聚餐、商務會議與媒體公關活動<br>用心帶給您新鮮與美味的餐點，實惠的價格，美味可口的精緻菜色，森森是你最佳的選擇</p>
      <a class="catering-menu-download" href="https://docs.google.com/spreadsheets/d/1KrLWkMaNHhZr7AmkgCZ4WQcbLzb99YAB/edit?gid=703529566#gid=703529566" target="_blank" rel="noreferrer"><span class="catering-menu-book" aria-hidden="true"></span>外燴菜單下載</a>
    </section>
    ${sections}
    <section class="catering-note"><span class="catering-note-icon" aria-hidden="true"></span><p>※ <strong>完整菜單請下載最上方檔案連結</strong>，圖片為參考圖，產品請以實物為主。<strong>菜色照片會陸續更新。</strong></p></section>
    <section class="catering-inquiry" aria-labelledby="catering-inquiry-title">
      <div class="catering-inquiry-heading">
        <p>Inquiry</p>
        <h2 id="catering-inquiry-title">外燴詢價專區</h2>
        <span>請留下活動需求，森森團隊將盡快與您聯繫。</span>
      </div>
      <form class="catering-inquiry-form" data-catering-inquiry novalidate>
        <label class="catering-inquiry-field">
          <span>姓名 <b>*</b></span>
          <input name="name" type="text" placeholder="請輸入姓名" autocomplete="name" required>
        </label>
        <label class="catering-inquiry-field">
          <span>電話 <b>*</b></span>
          <input name="phone" type="tel" placeholder="請輸入聯絡電話" autocomplete="tel" required>
        </label>
        <label class="catering-inquiry-field">
          <span>Email <b>*</b></span>
          <input name="email" type="email" placeholder="you@email.com" autocomplete="email" required>
        </label>
        <label class="catering-inquiry-field">
          <span>預計人數 <b>*</b></span>
          <select name="guests" required>
            <option value="">請選擇人數</option>
            <option>2–10 人</option>
            <option>11–30 人</option>
            <option>31–50 人</option>
            <option>51–100 人</option>
            <option>101 人以上</option>
          </select>
        </label>
        <label class="catering-inquiry-field">
          <span>日期 <b>*</b></span>
          <input name="date" type="date" required>
        </label>
        <label class="catering-inquiry-field">
          <span>時間 <b>*</b></span>
          <select name="time" required>
            <option value="">請選擇時間</option>
            <option>上午 09:00</option>
            <option>上午 10:00</option>
            <option>上午 11:00</option>
            <option>下午 01:00</option>
            <option>下午 02:00</option>
            <option>下午 03:00</option>
            <option>下午 04:00</option>
            <option>下午 05:00</option>
          </select>
        </label>
        <label class="catering-inquiry-field catering-inquiry-field-wide">
          <span>特殊需求</span>
          <textarea name="specialRequests" placeholder="過敏、飲食需求、活動場合或其他需求……"></textarea>
        </label>
        <div class="catering-inquiry-actions">
          <p class="catering-inquiry-message" data-inquiry-message role="status" aria-live="polite"></p>
          <button class="catering-inquiry-submit" type="submit">送出詢價</button>
        </div>
      </form>
    </section>
    <section class="catering-stores">
      <div class="catering-stores-panel">
        <a class="catering-store" href="https://goo.gl/maps/3oxsrUzT22G2" target="_blank" rel="noreferrer"><span class="catering-store-line" aria-hidden="true"></span><strong>澄和店</strong><span>三民區澄和路78號</span><span>07-3816662</span><i class="catering-store-pin" aria-hidden="true"></i></a>
        <a class="catering-store" href="https://goo.gl/maps/JptBgTTquh92" target="_blank" rel="noreferrer"><span class="catering-store-line" aria-hidden="true"></span><strong>新富店</strong><span>鳳山區新富路276號</span><span>07-7675992</span><i class="catering-store-pin" aria-hidden="true"></i></a>
        <a class="catering-store" href="https://goo.gl/maps/Wea9v9dtqCs" target="_blank" rel="noreferrer"><span class="catering-store-line" aria-hidden="true"></span><strong>博愛店</strong><span>鳳山區博愛路219號</span><span>07-7993070</span><i class="catering-store-pin" aria-hidden="true"></i></a>
        <a class="catering-store" href="https://goo.gl/maps/NpDLVEYQHAk" target="_blank" rel="noreferrer"><span class="catering-store-line" aria-hidden="true"></span><strong>文龍店</strong><span>鳳山區文龍東路336號</span><span>07-7335812</span><i class="catering-store-pin" aria-hidden="true"></i></a>
      </div>
    </section>
    <script>
    (() => {
      const form = document.querySelector("[data-catering-inquiry]");
      if (!form) return;
      const message = form.querySelector("[data-inquiry-message]");
      const button = form.querySelector("button[type=submit]");
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const originalLabel = button.textContent;
        button.disabled = true;
        button.textContent = "送出中…";
        message.textContent = "";
        const value = (name) => form.elements[name]?.value.trim() || "";
        const payload = {
          name: value("name"),
          phone: value("phone"),
          email: value("email"),
          subject: "外燴詢價",
          message: [
            "預計人數：" + value("guests"),
            "活動日期：" + value("date"),
            "活動時間：" + value("time"),
            "特殊需求：" + (value("specialRequests") || "無")
          ].join("\\n")
        };
        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "送出失敗，請稍後再試。");
          form.reset();
          message.className = "catering-inquiry-message is-success";
          message.textContent = "詢價資料已送出，謝謝您！森森團隊將盡快與您聯繫。";
        } catch (error) {
          message.className = "catering-inquiry-message is-error";
          message.textContent = error.message;
        } finally {
          button.disabled = false;
          button.textContent = originalLabel;
        }
      });
    })();
    </script>
  </section>`;
}

const BOSTON_GIFTS = [
  ["boston-pa1.jpg", "PA1", "9吋波士頓派×1、油飯8兩×1、紅蛋×2"],
  ["boston-pa2.jpg", "PA2", "9吋波士頓派×1、小檸檬×1、KT蛋糕×1、手工餅乾×1"],
  ["boston-pa3.png", "PA3", "9吋波士頓派×1、草莓大福×3"],
  ["boston-pa4.png", "PA4", "9吋波士頓派×1、草莓大理石×1"],
];

function bostonPieContent() {
  const giftCards = BOSTON_GIFTS.map(([image, label, description]) => `
    <article class="boston-gift-card">
      <img src="/assets/images/${escapeAttr(image)}" alt="${escapeAttr(label)}彌月禮盒">
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(description)}</p>
    </article>`).join("");
  return `<section class="boston-page">
    <section class="boston-product-feature">
      <div class="boston-product-visual"><img src="/assets/images/poston-cream-pie-1.png" alt="波士頓鮮奶派與禮盒"></div>
      <div class="boston-product-copy">
        <p class="boston-product-kicker">6倍乳</p>
        <h2>波士頓鮮奶派</h2>
        <p class="boston-product-english">Boston Cream Pie</p>
        <p class="boston-product-description">將鮮奶中去除83%的水，留下的精華爽口不甜<br>膩且富有細緻的口感。</p>
        <hr>
        <p class="boston-product-spec">波士頓派尺寸：9吋(23cm±10%)<br>印刷包裝：手繪水彩風格&amp;禮盒霧模搭配高質感<br>Pantone金屬色側邊。手提式紙盒設計，恕不<br>另外提供袋子</p>
        <img class="boston-vegetarian-badge" src="/assets/images/icon-vlml.png" alt="奶蛋素">
      </div>
    </section>
    <section class="boston-gift-section" id="boston-gifts">
      <h2>波士頓彌月禮盒系列</h2>
      <div class="boston-gift-grid">${giftCards}</div>
    </section>
    <section class="boston-dm" id="boston-dm">
      <a href="https://drive.google.com/file/d/1TJ37PaOoP-FWIeEDpldMbflZhHqvNIuZ/view" target="_blank" rel="noreferrer" class="boston-dm-title"><strong>彌月禮盒DM下載</strong><span>⟶</span></a>
      <a href="https://drive.google.com/file/d/1TJ37PaOoP-FWIeEDpldMbflZhHqvNIuZ/view" target="_blank" rel="noreferrer" class="boston-dm-icon" aria-label="查看彌月禮盒 DM"><span class="boston-dm-book" aria-hidden="true"></span></a>
      <p>完整商品資訊及價格，請參閱彌月商品目錄!</p>
    </section>
  </section>`;
}

const SOUVENIR_PRODUCTS = [
  ["豆塔禮盒", "/product-item/豆塔禮盒", "photo-2.jpg", 9],
  ["森森肉鬆餅", "/product-item/森森肉鬆餅", "pork-floss-pastry-4.jpg", 17],
  ["法式蝴蝶酥", "/product-item/法式蝴蝶酥-1657", "palmiers-2.jpg", 8],
  ["杏仁千層酥", "/product-item/鈕扣牛軋餅", "almond-layer-pastry.jpg", 10],
  ["經典奶油餅禮盒", "/product-item/太陽餅禮盒", "sun-cake-thumbnail-copy.jpg", 6],
  ["手工蛋捲", "/product-item/手工蛋捲", "egg-roll-2.jpg", 4],
  ["鈕釦牛軋餅", "/product-item/鈕扣餅乾", "button-nougat-pastry-inside-page-3-1.jpg", 7],
  ["達克瓦茲禮盒", "/product-item/鳳梨酥禮盒", "dacquoise.jpg", 4],
  ["土鳳梨酥禮盒", "/product-item/土鳳梨酥禮盒", "pineapple-cake-copy.jpg", 7],
  ["日式大福禮盒", "/product-item/日式大福禮盒", "daifuku-3.jpg", 10],
];

function souvenirPageContent() {
  const cards = SOUVENIR_PRODUCTS.map(([title, href, image, likes]) => `<article class="souvenir-card"><a class="souvenir-card-link" href="${escapeAttr(href)}"><img src="/assets/images/${escapeAttr(image)}" alt="${escapeAttr(title)}"><div class="souvenir-card-meta"><h2>${escapeHtml(title)}</h2><span class="souvenir-likes" aria-label="收藏 ${likes} 次"><span aria-hidden="true">♡</span> ${likes}</span></div></a><button class="souvenir-add-cart" type="button" data-souvenir-add-cart="${escapeAttr(title)}">加入購物車</button></article>`).join("");
  return `<section class="souvenir-page"><section class="souvenir-products"><img class="souvenir-icon" src="/assets/images/icon-cupcake.png" alt=""><div class="souvenir-grid">${cards}</div></section></section>
  <script>
  (() => {
    document.querySelectorAll("[data-souvenir-add-cart]").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const original = button.textContent;
        button.disabled = true;
        button.textContent = "加入中…";
        try {
          const response = await fetch("/api/cart/add", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: button.dataset.souvenirAddCart, qty: 1 }) });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "加入購物車失敗。");
          button.textContent = "已加入購物車";
          document.querySelector(".cart-trigger")?.click();
        } catch (error) {
          button.textContent = error.message;
          window.setTimeout(() => { button.textContent = original; }, 1800);
        } finally {
          button.disabled = false;
        }
      });
    });
  })();
  </script>`;
}

function coffeePageContent() {
  return `<section class="coffee-page"><section class="coffee-menu-section"><img class="coffee-page-icon" src="/assets/images/icon-coffee.png" alt="" aria-hidden="true"><div class="coffee-menu-grid"><img src="/assets/images/coffee-menu-1.jpg" alt="森森咖啡菜單：咖啡與氣泡飲"><img src="/assets/images/coffee-menu-2.jpg" alt="森森咖啡菜單：茶飲與奶茶"></div></section></section>`;
}

function customerPageContent(route = "login") {
  const isDashboard = route === "dashboard";
  const loginHidden = isDashboard ? " hidden" : "";
  const appHidden = isDashboard ? "" : " hidden";
  return `<section class="account-shell" data-store-account data-account-route="${route}">
    <div class="account-layout">
      <aside class="account-sidebar">
        <a class="account-brand" href="/"><span class="account-brand-mark">S</span><span><b>森森點心坊</b><small>會員中心</small></span></a>
        <div class="account-user-card"><span class="account-avatar">S</span><div><strong data-sidebar-user>會員您好</strong><small>SenSen Bakery</small></div></div>
        <button class="account-menu-toggle" type="button" aria-expanded="false" aria-controls="account-navigation"><span class="account-menu-icon" aria-hidden="true"><i></i><i></i><i></i></span><span>會員選單</span><b>⌄</b></button>
        <nav class="account-nav" id="account-navigation" aria-label="會員功能">
          <a class="account-side-link" href="/"><span>⌂</span>首頁</a>
          <a class="account-side-link" href="/產品介紹/生日蛋糕-下方有dm供下載-264/"><span>▦</span>產品介紹</a>
          <a class="account-side-link" href="/聯絡我們/"><span>◎</span>聯絡我們</a>
          <span class="account-side-divider"></span>
          <button type="button" data-account-tab="overview" class="active"><span>▦</span>帳戶總覽</button>
          <button type="button" data-account-tab="orders"><span>☷</span>我的訂單 <em data-sidebar-order-count></em></button>
          <button type="button" data-account-tab="address"><span>⌖</span>收件地址</button>
          <button type="button" data-account-tab="profile"><span>●</span>會員資料</button>
          <a class="account-side-link account-mobile-store-link" href="/"><span>↩</span>返回森森官網</a>
          <button type="button" class="account-mobile-logout" data-account-logout><span>↪</span>登出</button>
        </nav>
        <div class="account-sidebar-footer"><a href="/">返回森森官網</a><button type="button" data-account-logout>登出</button></div>
      </aside>
      <div class="account-content">
        <div class="account-topbar"><span>會員中心 / <b data-account-title>帳戶總覽</b></span></div>
        <div id="account-message" role="status"></div>
        <div data-account-panel="login" class="account-auth-grid"${loginHidden}>
          <section class="account-login-card"><h1><span></span>Login</h1><form class="account-form" data-account-login><label>Username or email address <b>*</b><input name="login" type="text" required autocomplete="username"></label><label>Password <b>*</b><input name="password" type="password" required autocomplete="current-password"></label><div class="account-auth-actions"><button class="save-btn" type="submit">Log in</button><a class="account-line-btn" href="/auth/line"><span>LINE</span> 使用 LINE 登入</a></div></form></section>
          <section class="account-login-card"><h1><span></span>Register</h1><form class="account-form" data-account-register><label>Full Name <b>*</b><input name="name" required autocomplete="name"></label><label>Email address <b>*</b><input name="email" type="email" required autocomplete="email"></label><label>Phone<input name="phone" type="tel" autocomplete="tel"></label><label>Password <b>*</b><input name="password" type="password" minlength="6" required autocomplete="new-password"></label><div class="account-auth-actions"><button class="save-btn" type="submit">Register</button></div></form></section>
        </div>
        <div data-account-panel="app"${appHidden}><div class="account-heading"><p class="account-kicker">MEMBER DASHBOARD</p><h1>歡迎回來，<span data-user-name></span></h1><p class="account-desc" data-user-email></p></div><section class="content-section account-overview-section" data-account-section="overview"><div class="section-title"><div><p class="account-kicker">ACTIVITY</p><h2>Recent Orders</h2></div><button type="button" data-account-tab-link="orders">查看全部訂單</button></div><div data-account-orders></div></section><div class="account-lower-grid"><section class="content-section account-preview-card"><h2>Saved Address</h2><p data-address-preview>尚未儲存收件地址。</p><button type="button" data-account-tab-link="address">編輯地址</button></section><section class="content-section account-preview-card"><h2>物流 Shipping</h2><p>查看取貨日期與訂單物流狀態。</p><button type="button" data-account-tab-link="orders">查看訂單</button></section></div><section class="content-section" data-account-section="profile" hidden><div class="section-title"><div><p class="account-kicker">ACCOUNT</p><h2>會員資料</h2></div></div><form class="account-form" data-profile-form><label>姓名<input name="name" required></label><label>電子信箱<input name="email" type="email" required></label><label>電話<input name="phone"></label><button class="save-btn" type="submit">儲存資料</button></form></section><section class="content-section" data-account-section="address" hidden><div class="section-title"><div><p class="account-kicker">DELIVERY</p><h2>收件地址</h2></div></div><form class="account-form" data-address-form><label>收件人<input name="fullName"></label><label>電話<input name="phone"></label><label>地址<input name="address"></label><label>城市<input name="city"></label><label>郵遞區號<input name="zip"></label><button class="save-btn" type="submit">儲存地址</button></form></section><section class="content-section" data-account-section="orders" hidden><div class="section-title"><div><p class="account-kicker">HISTORY</p><h2>我的訂單</h2></div></div><div data-account-orders-full></div></section></div>
      </div>
    </div>
  </section>
  <script>${accountScript()}</script>`;
}

function cartPageContent() {
  return `<section class="store-page"><div class="store-page-card"><p class="eyebrow">SENSEN BAKERY</p><h1>購物車</h1><div data-full-cart><p>載入中…</p></div><div class="store-page-actions"><a class="button" href="/產品介紹/生日蛋糕-下方有dm供下載-264/">繼續選購</a><a class="button" href="/customer/admin/">前往會員中心</a></div></div></section>${cartPageScript()}`;
}

function checkoutPageContent() {
  return `<section class="checkout-hero"><div class="checkout-hero-inner"><p class="eyebrow">SENSEN BAKERY</p><h1>Checkout</h1><p>完成森森點心坊的訂單。</p></div></section>
    <section class="checkout-layout" data-checkout-page>
      <div class="checkout-main">
        <section class="checkout-details-panel"><p class="eyebrow">ORDER INFORMATION</p><h2>Your Details</h2><div class="checkout-form-grid">
          <label class="checkout-field">姓名 *<input data-checkout-name autocomplete="name" required placeholder="請輸入姓名"></label><label class="checkout-field">電子信箱 *<input data-checkout-email type="email" autocomplete="email" required placeholder="請輸入電子信箱"></label><label class="checkout-field">聯絡電話 *<input data-checkout-phone type="tel" autocomplete="tel" required placeholder="請輸入聯絡電話"></label><label class="checkout-field">物流方式 *<select data-checkout-shipping><option value="pickup">門市自取（免運）</option><option value="home">宅配（$120）</option><option value="frozen">冷凍宅配（$240）</option></select></label><label class="checkout-field checkout-field-wide">國家／地區 *<select data-checkout-country><option>Taiwan</option></select></label>
          <label class="checkout-field checkout-field-wide">地址<input data-checkout-address autocomplete="street-address" placeholder="請輸入地址"></label><div class="checkout-delivery-fields checkout-field-wide" data-checkout-delivery-fields hidden><label class="checkout-field">縣市／區域<input data-checkout-city autocomplete="address-level2" placeholder="例如：台北市"></label><label class="checkout-field">郵遞區號<input data-checkout-zip autocomplete="postal-code" placeholder="郵遞區號"></label></div>
          <label class="checkout-field checkout-field-wide">給店家的備註<textarea data-checkout-note rows="4" placeholder="例如：蛋糕牌文字、配送提醒"></textarea></label>
        </div><p class="checkout-account-hint">需要修改姓名、地址或電話？請返回會員中心的 Account Details / Addresses 更新。</p><p class="checkout-form-message" data-checkout-submit-message role="status"></p><button class="checkout-submit checkout-submit-mobile" type="button" data-checkout-submit>確認訂單</button></section>
      </div>
      <aside class="checkout-sidebar"><section class="checkout-order-card"><div class="checkout-card-heading"><h2>Your Order</h2><a href="/cart/">✎ 編輯購物車</a></div><div class="checkout-coupon"><input data-checkout-coupon type="text" placeholder="優惠碼" autocomplete="off"><button type="button" data-checkout-apply-coupon>套用優惠碼</button></div><p class="checkout-form-message" data-checkout-quote-message role="status"></p><div class="checkout-items" data-checkout-items><p>載入中…</p></div><div class="checkout-pickup-card"><span class="checkout-calendar" aria-hidden="true">▣</span><div><span>Pickup date</span><strong data-checkout-pickup-label>載入中…</strong></div><input data-checkout-pickup type="date" required aria-label="取貨／配送日期"></div><div class="checkout-summary"><div><span>商品小計</span><strong data-checkout-subtotal>$0.00</strong></div><div><span>運費</span><strong data-checkout-shipping-fee>$0.00</strong></div><div data-checkout-discount-row hidden><span>折扣</span><strong data-checkout-discount>-$0.00</strong></div><div class="checkout-total"><span>Total</span><strong data-checkout-total>$0.00</strong></div></div><section class="checkout-payment-note"><h3>Payment</h3><strong>Secure payment</strong><p>付款資料由金流服務商處理，森森點心坊不會儲存信用卡敏感資料。</p><p>目前會先建立訂單；正式啟用金流服務後，付款方式會在此安全完成。</p></section><p class="checkout-form-message" data-checkout-submit-message-secondary role="status"></p><button class="checkout-submit" type="button" data-checkout-submit>確認訂單</button><a class="checkout-back" href="/cart/">返回購物車</a></section></aside>
    </section>${checkoutPageScript()}`;
}

function ordersPageContent() {
  return `<section class="store-page"><div class="store-page-card"><p class="eyebrow">SENSEN BAKERY</p><h1>我的訂單</h1><div data-orders-page><p>載入中…</p></div><a class="button" href="/customer/admin/">返回會員中心</a></div></section>${ordersPageScript()}`;
}

function accountScript() {
  return `(() => {
    const api = async (path, options = {}) => { const response = await fetch(path, { ...options, credentials: "include", headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}) } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "操作失敗。"); return data; };
    const root = document.querySelector("[data-store-account]"), message = document.querySelector("#account-message"), login = document.querySelector("[data-account-panel=login]"), app = document.querySelector("[data-account-panel=app]"), loginForm = document.querySelector("[data-account-login]"), registerForm = document.querySelector("[data-account-register]"), profileForm = document.querySelector("[data-profile-form]"), addressForm = document.querySelector("[data-address-form]"); let user = null, orders = [];
    const showMessage = (text, error = false) => { message.textContent = text || ""; message.className = text ? (error ? "account-error" : "account-success") : ""; };
    const escapeHtml = value => String(value ?? "").replace(/[&<>\"']/g, char => char === "&" ? "&amp;" : char === "<" ? "&lt;" : char === ">" ? "&gt;" : char === String.fromCharCode(34) ? "&quot;" : "&#39;");
    const statusLabels = { pending: "待付款", processing: "處理中", shipped: "已出貨", completed: "已完成", cancelled: "已取消", created: "已建立" };
    const shippingLabels = { pickup: "門市自取", home: "宅配", frozen: "冷凍宅配" };
    const formatOrderDate = value => value ? String(value).replace("T", " ").slice(0, 16) : "";
    const renderOrders = target => { target.innerHTML = orders.length ? orders.map(order => { const details = [shippingLabels[order.shippingMethod] || order.shippingMethod || "", formatOrderDate(order.fulfillmentDate) ? "日期：" + formatOrderDate(order.fulfillmentDate) : "", order.trackingNumber ? "物流單號：" + order.trackingNumber : ""].filter(Boolean); return '<div class="order-row"><div class="order-row-main"><b>#' + escapeHtml(String(order.id).slice(0, 12)) + '</b>' + (details.length ? '<small class="order-details">' + escapeHtml(details.join(" · ")) + '</small>' : '') + '</div><span class="status">' + escapeHtml(statusLabels[order.status] || order.status || "已建立") + '</span><strong>$' + Number(order.total || 0).toFixed(2) + '</strong></div>'; }).join("") : "<p>目前沒有訂單。</p>"; };
    const render = data => { user = data.user; orders = data.orders || []; login.hidden = true; app.hidden = false; document.querySelector("[data-user-name]").textContent = user.name || "會員"; document.querySelector("[data-sidebar-user]").textContent = user.name || "會員您好"; document.querySelector("[data-user-email]").textContent = user.email || ""; document.querySelector("[data-sidebar-order-count]").textContent = orders.length ? "(" + orders.length + ")" : ""; profileForm.elements.name.value = user.name || ""; profileForm.elements.email.value = user.email || ""; profileForm.elements.phone.value = user.phone || ""; const address = data.address || {}; ["fullName", "phone", "address", "city", "zip"].forEach(key => { addressForm.elements[key].value = address[key] || ""; }); const addressText = [address.address, address.city, address.zip].filter(Boolean).join("，"); document.querySelector("[data-address-preview]").textContent = addressText || "尚未儲存收件地址。"; renderOrders(document.querySelector("[data-account-orders]")); renderOrders(document.querySelector("[data-account-orders-full]")); api("/api/cart").then(cart => { const count = (cart.items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0); document.querySelectorAll("[data-cart-count]").forEach(item => { item.textContent = count; }); }); };
    const load = async (showError = false) => { try { const me = await api("/api/me"); const ordersData = await api("/api/orders"); render({ ...me, ...ordersData }); return true; } catch (error) { login.hidden = false; app.hidden = true; if (showError) showMessage(error.message, true); return false; } };
    loginForm.addEventListener("submit", async event => { event.preventDefault(); const form = new FormData(event.currentTarget), button = event.currentTarget.querySelector("button[type=submit]"); button.disabled = true; button.textContent = "登入中…"; showMessage(""); try { await api("/api/login", { method: "POST", body: JSON.stringify({ login: String(form.get("login") || "").trim(), password: form.get("password") }) }); window.location.assign("/customer/admin/backup/"); } catch (error) { showMessage(error.message, true); button.disabled = false; button.textContent = "Log in"; } });
    registerForm.addEventListener("submit", async event => { event.preventDefault(); const form = new FormData(event.currentTarget), button = event.currentTarget.querySelector("button[type=submit]"); button.disabled = true; button.textContent = "註冊中…"; showMessage(""); try { await api("/api/register", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) }); window.location.assign("/customer/admin/backup/"); } catch (error) { showMessage(error.message, true); button.disabled = false; button.textContent = "Register"; } });
    profileForm.addEventListener("submit", async event => { event.preventDefault(); try { const data = await api("/api/me", { method: "PUT", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); showMessage("會員資料已更新。"); user = data.user; document.querySelector("[data-user-name]").textContent = user.name || "會員"; document.querySelector("[data-sidebar-user]").textContent = user.name || "會員您好"; } catch (error) { showMessage(error.message, true); } });
    addressForm.addEventListener("submit", async event => { event.preventDefault(); try { await api("/api/address", { method: "PUT", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); showMessage("收件地址已更新。"); } catch (error) { showMessage(error.message, true); } });
    const switchTab = tab => { document.querySelectorAll("[data-account-tab]").forEach(item => item.classList.toggle("active", item.dataset.accountTab === tab)); document.querySelectorAll("[data-account-section]").forEach(section => { section.hidden = section.dataset.accountSection !== tab; }); const labels = { overview: "帳戶總覽", profile: "會員資料", address: "收件地址", orders: "我的訂單" }; document.querySelector("[data-account-title]").textContent = labels[tab] || labels.overview; };
    document.querySelectorAll("[data-account-tab], [data-account-tab-link]").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.accountTab || button.dataset.accountTabLink)));
    const accountMenuToggle = document.querySelector(".account-menu-toggle"), accountNav = document.querySelector(".account-nav");
    accountMenuToggle?.addEventListener("click", () => { const isOpen = accountMenuToggle.getAttribute("aria-expanded") === "true"; accountMenuToggle.setAttribute("aria-expanded", String(!isOpen)); accountNav.classList.toggle("is-open", !isOpen); });
    document.querySelectorAll(".account-nav [data-account-tab]").forEach(button => button.addEventListener("click", () => { if (window.matchMedia("(max-width: 760px)").matches) { accountMenuToggle.setAttribute("aria-expanded", "false"); accountNav.classList.remove("is-open"); } }));
    document.querySelectorAll("[data-account-logout]").forEach(button => button.addEventListener("click", async () => { button.disabled = true; await api("/api/logout", { method: "POST" }); window.location.assign("/customer/admin/"); })); if (root.dataset.accountRoute === "dashboard") load(true); else api("/api/me").then(() => window.location.assign("/customer/admin/backup/")).catch(() => {});
  })();`;
}

function cartPageScript() {
  return '<script src="/assets/cart-page.js"></script>';
}

function checkoutPageScript() {
  return '<script src="/assets/checkout-page.js"></script>';
}

function ordersPageScript() {
  return '<script src="/assets/orders-page.js"></script>';
}

function contactPageContent() {
  return `<section class="content contact-page">
    <div class="contact-page-card">
      <p class="contact-page-kicker">SENSEN BAKERY</p>
      <h1>聯絡我們</h1>
      <p>如果您有訂購、外燴或其他服務需求，歡迎留下資料，森森團隊會盡快與您聯繫。</p>
      <form class="contact-page-form" data-contact-form>
        <label>姓名 *<input name="name" required autocomplete="name"></label>
        <label>Email *<input name="email" type="email" required autocomplete="email"></label>
        <label>電話<input name="phone" autocomplete="tel"></label>
        <label>主旨<input name="subject" value="聯絡我們"></label>
        <label class="contact-page-wide">需求內容 *<textarea name="message" rows="6" required></textarea></label>
        <p class="contact-page-message" data-contact-message role="status" aria-live="polite"></p>
        <button type="submit">送出訊息</button>
      </form>
    </div>
    <script>
    (() => {
      const form = document.querySelector('[data-contact-form]');
      if (!form) return;
      const message = form.querySelector('[data-contact-message]');
      const button = form.querySelector('button[type="submit"]');
      form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        button.disabled = true;
        message.textContent = '送出中…';
        const value = name => form.elements[name]?.value.trim() || '';
        try {
          const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: value('name'), email: value('email'), phone: value('phone'), subject: value('subject'), message: value('message') }) });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || '送出失敗，請稍後再試。');
          form.reset();
          message.className = 'contact-page-message is-success';
          message.textContent = data.message || '訊息已送出。';
        } catch (error) {
          message.className = 'contact-page-message is-error';
          message.textContent = error.message;
        } finally {
          button.disabled = false;
        }
      });
    })();
    </script>
  </section>`;
}

function pageContent(page) {
  const localPath = localPathFromUrl(page.url);
  if (localPath === "/關於森森") {
    return aboutContent();
  }
  if (localPath === BIRTHDAY_CAKE_PATH) {
    return birthdayCakeContent();
  }
  if (localPath === CATERING_PATH) {
    return cateringContent();
  }
  if (localPath === BOSTON_PIE_PATH) {
    return bostonPieContent();
  }
  if (localPath === "/產品介紹/伴手禮") {
    return souvenirPageContent();
  }
  if (localPath === "/森森咖啡") {
    return coffeePageContent();
  }
  if (localPath === "/最新消息") {
    return latestNewsContent(page);
  }
  if (localPath === "/聯絡我們") {
    return contactPageContent();
  }
  if (localPath === "/customer/admin") return customerPageContent("login");
  if (localPath === "/customer/admin/backup") return customerPageContent("dashboard");
  if (localPath === "/customer") return customerPageContent("login");
  if (localPath === "/cart") return cartPageContent();
  if (localPath === "/checkout") return checkoutPageContent();
  if (localPath === "/orders") return ordersPageContent();

  const markdown = markdownFromPage(page);
  if (markdown.trim()) {
    const visibleMarkdown = localPath === "/最新消息"
      ? removeLatestNewsPagination(markdown)
      : markdown;
    return `<section class="content">${decorateMonthDmContent(markdownToHtml(visibleMarkdown))}</section>`;
  }
  if (page.html && page.html.trim()) {
    return `<section class="content">${decorateMonthDmContent(sanitizeWordPressHtml(page.html))}</section>`;
  }
  if (!markdown.trim()) {
    return `<section class="content"><div class="empty">此頁在爬取結果中沒有正文，已依標題建立本地頁面。</div></section>`;
  }
  return "";
}

function latestNewsContent(page) {
  const filters = [
    ["全部", "all", true],
    ["季節限定", "season-only"],
    ["新品上市", "new-arrival"],
    ["最新消息", "latest-news"],
    ["森森飲品", "sensen-coffee"],
  ];
  const filterHtml = filters.map(([label, value, active]) => `<button class="latest-news-filter${active ? " is-active" : ""}" type="button" data-news-filter="${escapeAttr(value)}" aria-pressed="${active ? "true" : "false"}">${escapeHtml(label)}</button>`).join("");
  return `<section class="latest-news-page" data-latest-news-page aria-labelledby="latest-news-heading">
    <h2 class="latest-news-sr-only" id="latest-news-heading">最新消息</h2>
    <img class="latest-news-icon" src="/assets/images/icon-wheat.png" alt="" aria-hidden="true">
    <nav class="latest-news-filters" aria-label="最新消息分類">${filterHtml}</nav>
    <div class="latest-news-grid" data-news-list aria-live="polite"><p class="latest-news-empty">載入最新消息中…</p></div>
    <script src="/assets/latest-news.js"></script>
  </section>`;
}

function latestNewsArticleContent() {
  return `<section class="latest-news-article-page" data-latest-news-article-page aria-labelledby="latest-news-article-title">
    <a class="latest-news-article-back" href="/最新消息/">← 返回最新消息</a>
    <div class="latest-news-article-shell">
      <p class="latest-news-article-status" data-article-status role="status">載入文章中…</p>
      <div class="latest-news-article-image" data-article-image></div>
      <div class="latest-news-article-copy">
        <p class="latest-news-card-date" data-article-date></p>
        <p class="latest-news-article-category" data-article-category></p>
        <h1 id="latest-news-article-title" data-article-title>最新消息</h1>
        <div class="latest-news-article-content" data-article-content></div>
      </div>
    </div>
    <script src="/assets/latest-news-article.js"></script>
  </section>`;
}

function removeLatestNewsPagination(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const paginationIndex = lines.findIndex((line) =>
    /^\[\d+\]\([^)]+\)(?:\s+\[\d+\]\([^)]+\))+\s*$/.test(line.trim()),
  );
  if (paginationIndex < 0) return markdown;
  const nextContent = lines.slice(paginationIndex + 1).find((line) => line.trim());
  if (!nextContent || !/^\[下一頁\]/.test(nextContent.trim())) return markdown;
  return lines.slice(0, paginationIndex).join("\n");
}

function decorateMonthDmContent(html) {
  return html
    .replace(/<h4>\s*彌月禮盒DM下載\s*⟶\s*<\/h4>/gi, '<p class="month-dm-download"><a href="https://drive.google.com/file/d/1TJ37PaOoP-FWIeEDpldMbflZhHqvNIuZ/view" target="_blank" rel="noreferrer">彌月禮盒DM下載 ⟶</a></p>')
    .replace(/<p>\s*完整商品資訊及價格，請參閱彌月商品目錄!\s*<\/p>/gi, '<p class="month-dm-note">完整商品資訊及價格，請參閱彌月商品目錄!</p>');
}

function sanitizeWordPressHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<a\b[^>]*>\s*<img\b([^>]*)>\s*<\/a>/gi, (match, attrs) => imageSlotHtml({ source: htmlAttribute(attrs, "src") }))
    .replace(/<img\b([^>]*)>/gi, (match, attrs) => imageSlotHtml({ source: htmlAttribute(attrs, "src") }))
    .replace(/<figure\b[^>]*>/gi, `<figure>`)
    .replace(/<h4>\s*彌月禮盒DM下載\s*⟶\s*<\/h4>/gi, '<p class="month-dm-download"><a href="https://drive.google.com/file/d/1TJ37PaOoP-FWIeEDpldMbflZhHqvNIuZ/view" target="_blank" rel="noreferrer">彌月禮盒DM下載 ⟶</a></p>')
    .replace(/<p>\s*完整商品資訊及價格，請參閱彌月商品目錄!\s*<\/p>/gi, '<p class="month-dm-note">完整商品資訊及價格，請參閱彌月商品目錄!</p>')
    .replace(/\s(?:src|srcset|sizes|data-(?!image-source\b)[\w-]+)=("[^"]*"|'[^']*')/gi, "")
    .replace(/href=(["'])(https?:\/\/www\.sensen\.com\.tw[^"']*)\1/gi, (match, quote, href) => `href=${quote}${escapeAttr(routeHref(href))}${quote}`)
    .replace(/href=(["'])https?:\/\/www\.sensen\.com\.tw\/?\1/gi, `href="/"`)
    .replace(/class=(["'])([^"']*)\1/gi, (match, quote, classes) => {
      const keep = classes.split(/\s+/).filter((name) => name === "image-slot" || name === "product-image" || name === "month-dm-download" || name === "month-dm-note");
      return keep.length ? `class=${quote}${keep.join(" ")}${quote}` : "";
    })
    .replace(/style=(["'])[^"']*\1/gi, "")
    .replace(/width=(["'])[^"']*\1/gi, "")
    .replace(/height=(["'])[^"']*\1/gi, "");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function htmlAttribute(attributes, name) {
  const match = String(attributes || "").match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? match[1] : "";
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyHomeFallback() {
  const indexFile = path.join(ROOT, "index.html");
  if (fs.existsSync(indexFile)) {
    fs.copyFileSync(indexFile, path.join(OUT_DIR, "standalone-home.html"));
  }
}

function main() {
  const crawlPages = fs.existsSync(CRAWL_FILE)
    ? normalizeCrawlPayload(readJson(CRAWL_FILE))
    : [];
  const fallbackPages = fs.existsSync(FALLBACK_FILE) ? readJson(FALLBACK_FILE) : [];
  const wpPages = readWordPressPages();
  const wpExportPages = readWordPressExport();
  const supplementalPages = readSupplementalMarkdownPages();
  const sourcePages = [
    ...STORE_MODULE_PAGES.map((page) => ({ ...page, source: "sensen-store-module" })),
    { url: "https://www.sensen.com.tw/聯絡我們/", title: "聯絡我們", html: "", source: "sensen-store-module" },
    ...wpPages,
    ...crawlPages.map((page) => ({ ...page, source: "firecrawl-crawl" })),
    ...supplementalPages,
    ...wpExportPages,
    ...fallbackPages.map((page) => ({ ...page, source: "legacy-crawl" })),
  ];

  const pageMap = new Map();
  sourcePages
    .map((page) => ({ ...page, url: page.url || page.metadata?.sourceURL || page.metadata?.url }))
    .filter((page) => page.url && (page.source === "sensen-store-module" || isVisiblePage(page.url)))
    .filter((page) => !isLatestNewsPaginationPath(localPathFromUrl(page.url)))
    .forEach((page) => {
      const key = localPathFromUrl(page.url).toLocaleLowerCase();
      pageMap.set(key, mergePage(pageMap.get(key), page));
    });

  const pages = [...pageMap.values()]
    .sort((a, b) => localPathFromUrl(a.url).localeCompare(localPathFromUrl(b.url), "zh-Hant"));

  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT_DIR, "assets"), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "site.css"), path.join(OUT_DIR, "assets", "site.css"));
  fs.copyFileSync(path.join(__dirname, "cart-drawer.js"), path.join(OUT_DIR, "assets", "cart-drawer.js"));
  fs.copyFileSync(path.join(__dirname, "cart-page.js"), path.join(OUT_DIR, "assets", "cart-page.js"));
  fs.copyFileSync(path.join(__dirname, "checkout-page.js"), path.join(OUT_DIR, "assets", "checkout-page.js"));
  fs.copyFileSync(path.join(__dirname, "checkout.css"), path.join(OUT_DIR, "assets", "checkout.css"));
  fs.copyFileSync(path.join(__dirname, "orders-page.js"), path.join(OUT_DIR, "assets", "orders-page.js"));
  fs.copyFileSync(path.join(__dirname, "latest-news.js"), path.join(OUT_DIR, "assets", "latest-news.js"));
  fs.copyFileSync(path.join(__dirname, "latest-news-article.js"), path.join(OUT_DIR, "assets", "latest-news-article.js"));
  if (fs.existsSync(IMAGE_DATA_DIR)) {
    fs.cpSync(IMAGE_DATA_DIR, path.join(OUT_DIR, "assets", "images"), { recursive: true });
  }
  const adminFrontendDir = path.join(ROOT, "frontend", "admin");
  if (fs.existsSync(adminFrontendDir)) {
    fs.cpSync(adminFrontendDir, path.join(OUT_DIR, "admin"), { recursive: true });
  }

  const home = pages.find((page) => localPathFromUrl(page.url) === "/") || pages[0];
  for (const page of pages) {
    const localPath = localPathFromUrl(page.url);
    const isAboutPage = localPath === "/關於森森" || localPath === "/產品介紹/伴手禮" || localPath === "/森森咖啡";
    const filePath = htmlFileForLocalPath(localPath);
    ensureDir(filePath);
    const content = localPath === "/" ? homeContent(pages) : pageContent(page);
    fs.writeFileSync(filePath, layout({
      title: titleFromPage(page),
      pathLabel: decodeURI(localPath),
      content,
      isHome: localPath === "/",
      isAbout: isAboutPage,
      hasBrandedHero: BRANDED_HERO_PATHS.has(localPath) && localPath !== CATERING_PATH,
      showHero: localPath !== CATERING_PATH && localPath !== "/聯絡我們" && localPath !== "/checkout" && localPath !== "/customer" && localPath !== "/customer/admin" && localPath !== "/customer/admin/backup",
      heroSource: localPath === BIRTHDAY_CAKE_PATH ? "/assets/images/headtitle-bg3.jpg" : localPath === BOSTON_PIE_PATH ? "/assets/images/headtitle-bg8.jpg" : localPath === "/森森咖啡" ? "/assets/images/cafe-coffee-restaurant-cup-food-drink-1008643-pxhere-2.jpg" : "/assets/images/headtitle-bg2.jpg",
    }));
  }

  if (!home || localPathFromUrl(home.url) !== "/") {
    fs.writeFileSync(path.join(OUT_DIR, "index.html"), layout({
      title: "森森點心坊",
      pathLabel: "/",
      content: homeContent(pages),
      isHome: true,
    }));
  }

  fs.writeFileSync(path.join(OUT_DIR, "site-map.html"), layout({
    title: "全站頁面",
    pathLabel: "/site-map.html",
    content: `<section class="directory"><h2>全站頁面</h2><p>以下為本地複製出的站內頁面索引。圖片皆以預留位呈現。</p>${createIndex(pages)}</section>`,
  }));

  const latestNewsArticleFile = path.join(OUT_DIR, "latest-news", "article", "index.html");
  ensureDir(latestNewsArticleFile);
  fs.writeFileSync(latestNewsArticleFile, layout({
    title: "最新消息",
    pathLabel: "/最新消息文章",
    content: latestNewsArticleContent(),
    showHero: false,
  }));

  const privacyFile = path.join(OUT_DIR, "隱私權條款", "index.html");
  ensureDir(privacyFile);
  const privacyHtml = layout({
    title: "隱私權政策",
    pathLabel: "/隱私權條款",
    content: `<section class="content"><h2>隱私權政策</h2><p>森森點心坊重視您的隱私，本站僅在提供服務與聯絡回覆所需範圍內使用資料。</p></section>`,
  });
  fs.writeFileSync(privacyFile, privacyHtml);
  const privacyAlias = path.join(OUT_DIR, "隱私權條件", "index.html");
  ensureDir(privacyAlias);
  fs.writeFileSync(privacyAlias, privacyHtml);

  copyHomeFallback();
  fs.writeFileSync(path.join(OUT_DIR, "site-map.json"), JSON.stringify(pages.map((page) => ({
    title: titleFromPage(page),
    url: page.url,
    path: localPathFromUrl(page.url),
  })), null, 2));

  console.log(`Built ${pages.length} pages in ${path.relative(ROOT, OUT_DIR)}`);
}

main();

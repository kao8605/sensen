const path = require("path");

// Common product and campaign terms used in the original Chinese filenames.
// The fallback keeps any existing English filename intact, while these terms
// make the renamed assets useful when browsing the image directory manually.
const PHRASES = [
  ["母親節蛋糕", "mothers-day-cake"],
  ["父親節快樂", "fathers-day"],
  ["情人節蛋糕", "valentines-day-cake"],
  ["生日蛋糕", "birthday-cake"],
  ["千層蛋糕", "layer-cake"],
  ["太陽餅", "sun-cake"],
  ["鳳梨酥", "pineapple-cake"],
  ["蝴蝶酥", "palmiers"],
  ["杏仁千層酥", "almond-layer-pastry"],
  ["杏仁酥", "almond-pastry"],
  ["法式核桃", "french-walnut"],
  ["千層酥", "mille-feuille"],
  ["義式小餐包", "italian-mini-bun"],
  ["扁可頌", "flat-croissant"],
  ["單條", "single-piece"],
  ["如意發糕", "lucky-rice-cake"],
  ["集點卡", "loyalty-card"],
  ["多多", "yogurt-drink"],
  ["小熊", "little-bear"],
  ["大熊", "big-bear"],
  ["澄和", "cheng-he"],
  ["油飯", "savory-rice"],
  ["紅龜", "red-turtle"],
  ["洋菓子", "japanese-pastry"],
  ["達可瓦茲", "dacquoise"],
  ["達克", "dacquoise"],
  ["肉鬆餅", "pork-floss-pastry"],
  ["鈕釦牛軋餅", "button-nougat-pastry"],
  ["鈕釦", "button"],
  ["肉鬆麵包", "pork-floss-bread"],
  ["三明治", "sandwich"],
  ["鬆餅", "pancake"],
  ["蛋糕", "cake"],
  ["麵包", "bread"],
  ["餅乾", "cookies"],
  ["餅", "pastry"],
  ["大福", "daifuku"],
  ["布丁燒", "custard-pudding"],
  ["檸檬塔", "lemon-tart"],
  ["檸檬之戀", "lemon-love"],
  ["檸檬老奶奶", "lemon-grandma"],
  ["芒果慕斯", "mango-mousse"],
  ["水果三明治", "fruit-sandwich"],
  ["水果泡芙", "fruit-puff"],
  ["紫羅蘭蛋糕", "violet-cake"],
  ["綜合餅乾", "assorted-cookies"],
  ["芋泥三明治", "taro-sandwich"],
  ["羅宋麵包", "russian-bread"],
  ["陽光三明治", "sunshine-sandwich"],
  ["珍珠脆糖小泡芙", "pearl-crunch-puff"],
  ["松露奶酥小餐包", "truffle-milk-bun"],
  ["花生麻糬", "peanut-mochi"],
  ["酒釀桂圓", "wine-longan"],
  ["芝士奶黃", "cheese-custard"],
  ["法式蝴蝶酥", "french-palmiers"],
  ["比利時巧克力", "belgian-chocolate"],
  ["芋頭奶黃", "taro-custard"],
  ["黑糖涼菓子", "brown-sugar-jelly"],
  ["帕瑪森德腸", "parmesan-sausage"],
  ["草莓大理石", "strawberry-marble"],
  ["經典巧克力", "classic-chocolate"],
  ["藍莓天使", "blueberry-angel"],
  ["栗子燒", "chestnut-cake"],
  ["桂花烏龍", "osmanthus-oolong"],
  ["芒果", "mango"],
  ["草莓", "strawberry"],
  ["藍莓", "blueberry"],
  ["葡萄", "grape"],
  ["桂圓", "longan"],
  ["巧克力", "chocolate"],
  ["奶黃", "custard"],
  ["奶酥", "milk-butter"],
  ["乳酪", "cheese"],
  ["咖啡", "coffee"],
  ["茶", "tea"],
  ["餐盒", "meal-box"],
  ["禮盒", "gift-box"],
  ["彌月", "full-month"],
  ["新年", "new-year"],
  ["聖誕", "christmas"],
  ["夏威夷", "hawaiian"],
  ["封面", "cover"],
  ["背面", "back"],
  ["正面", "front"],
  ["內圖", "inside"],
  ["內頁", "inside-page"],
  ["小圖", "thumbnail"],
  ["大福", "daifuku"],
  ["森森", "sensen"],
];

const CHARACTERS = {
  愛: "love", 幸: "happiness", 福: "fortune", 兒: "child", 童: "child",
  牛: "nougat", 軋: "nougat", 鈕: "button", 釦: "button", 盒: "box",
  果: "fruit", 汁: "juice", 香: "fragrant", 檸: "lemon", 檬: "lemon",
  經: "classic", 典: "classic", 輕: "light", 新: "new", 舊: "old",
  綜: "mixed", 合: "mixed", 花: "flower", 生: "fresh", 日: "day",
  月: "month", 年: "year", 版: "version", 號: "number", 處: "style",
  目: "menu", 錄: "menu", 甜: "sweet", 鹹: "savory", 芝: "cheese",
  士: "cheese", 脆: "crispy", 糖: "candy", 泡: "puff", 芙: "puff",
  玫: "rose", 瑰: "rose", 玉: "jade", 米: "rice", 紫: "purple",
  羅: "taro", 蘭: "orchid", 芋: "taro", 堡: "burger", 雞: "chicken",
  魚: "fish", 海: "sea", 鮮: "fresh", 蔬: "vegetable", 菜: "vegetable",
  松: "pine", 露: "truffle", 酒: "wine", 桂: "cinnamon", 烏: "oolong",
  龍: "longan", 莓: "berry", 藥: "herb", 乳: "milk", 黃: "yellow",
};

function decodeFilename(url) {
  try {
    return decodeURIComponent(path.basename(new URL(url).pathname));
  } catch {
    return "";
  }
}

function extensionFor(url, contentType = "") {
  let ext = "";
  try { ext = path.extname(new URL(url).pathname).toLowerCase(); } catch {}
  if (/^\.(jpe?g|png|gif|webp|svg|avif)$/i.test(ext)) return ext === ".jpeg" ? ".jpg" : ext;
  const match = String(contentType).match(/image\/(jpeg|png|gif|webp|svg\+xml|avif)/i);
  return match ? `.${match[1].replace("svg+xml", "svg")}` : ".img";
}

function normalizeSlug(value) {
  return value
    .replace(/\.(jpe?g|png|gif|webp|svg|avif)$/i, "")
    .replace(/[-_ ](?:\d+x\d+|scaled)$/i, "")
    .replace(/(?:拷貝|副本|copy)/gi, "copy")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function sourceStem(source, index = 1) {
  if (source.includes("fbcdn.net/images/emoji")) {
    const raw = decodeFilename(source).replace(/\.[^.]+$/, "");
    return `facebook-emoji-${raw || index}`;
  }
  let value = decodeFilename(source).replace(/\.[^.]+$/, "");
  value = value.replace(/(?:拷貝|副本)/g, "-copy-");
  for (const [from, to] of PHRASES) value = value.split(from).join(`-${to}-`);
  value = value.replace(/[\u4e00-\u9fff]/g, (character) => CHARACTERS[character] ? `-${CHARACTERS[character]}-` : "-");
  let slug = normalizeSlug(value);
  if (!slug || slug === "photo") slug = `bakery-photo-${index}`;
  if (/^\d/.test(slug)) slug = `photo-${slug}`;
  return slug;
}

function nameForSource(source, contentType = "", index = 1, used = new Set()) {
  const ext = extensionFor(source, contentType);
  const stem = sourceStem(source, index);
  let candidate = `${stem}${ext}`;
  let counter = 2;
  while (used.has(candidate)) candidate = `${stem}-${counter++}${ext}`;
  used.add(candidate);
  return candidate;
}

module.exports = { extensionFor, nameForSource };

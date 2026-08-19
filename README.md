# sensen

森森點心坊的本機靜態整站版本。

目前會從爬取結果、WordPress API 與 `WordPress.2026-08-09.xml`、`WordPress.2026-08-09 (2).xml` 匯出資料建立本地頁面。森森網站使用 BeBuilder，文章正文會整合 API 與 WordPress 匯出內容，再以渲染後爬取結果補足；圖片會下載到 `data/images/`，並由頁面使用本機圖片檔。

## 開啟方式

需要先安裝 Node.js，接著在此資料夾執行：

```bash
npm start
```

看到啟動訊息後，用瀏覽器開啟 <http://127.0.0.1:3000>。

## 重新產生整站

```bash
npm run build
```

產生結果會放在 `site/`，並由 `npm start` 提供瀏覽。

## 重新下載圖片

```bash
npm run download-images
```

圖片來源對照表會寫入 `data/images/image-map.json`。

圖片檔名會依原始網址及產品用途產生可讀的英文名稱；若要重新整理既有圖片名稱，可執行：

```bash
npm run rename-images
```

## 重新爬取網址狀態

```bash
npm run crawl
```

爬取結果會寫入 `data/crawl/crawl-results.json` 和 `data/crawl/crawl-results.csv`。WordPress 匯出檔集中放在 `data/wordpress/`，原始 Firecrawl 資料集中放在 `.firecrawl/`。

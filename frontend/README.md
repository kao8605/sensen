# 森森前端

這個資料夾是森森網站的前端服務邊界：

- `server.js` 提供 `site/` 的顧客頁面與 `admin/` 的員工後台頁面。
- `/api/*` 只透過代理轉送至 `sensen-backend`，前端不直接讀取後端資料檔案。
- `admin/` 是管理介面的靜態前端檔案，管理權限由後端 `/api/admin/*` API 驗證。

```bash
npm run build
npm start
```

預設前端位址：`http://127.0.0.1:3000`。

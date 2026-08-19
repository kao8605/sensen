# Employee backend module

此資料夾是從 `dashboardsample` 複製出的完整員工後台，可獨立安裝與建置：

```bash
npm install
npm run build
```

主要頁面：`signin.html`、`signup.html`、`index.html`、`inventory.html`、`reports.html`、`create-product.html`。

`src/assets/js/admin-api.js` 集中管理產品、訂單、客戶、優惠碼、摘要與互動資料。部署到其他網站時，設定 `VITE_API_BASE_URL`，並提供 `/api/admin/*` API；後端必須在所有 `/api/admin/*` 路由驗證 admin role。

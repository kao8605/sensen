# Customer backend module

可移植的會員／客戶後台功能，包含註冊、登入、登出、會員資料、地址、訂單、物流與付款紀錄顯示。

- `frontend/customer-api.js`：會員 API client。
- `frontend/CustomerDashboard.jsx`：最小可用會員後台元件；完整 Patria 版面仍保留在 `Patria/src/App.jsx`，可依品牌重新套版。
- `backend/README.md`：後端路由與資料需求。

主站目前使用 cookie session。搬到其他網站時，可沿用 session middleware，或把 client 的 `credentials` 改成 token 方案。

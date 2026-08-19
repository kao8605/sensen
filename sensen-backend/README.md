# 森森官網專用後端

此後端專屬森森官網，包含：

- `/api/cart`：購物車、訪客購物車、數量調整
- `/api/login`、`/api/register`、`/api/me`：森森會員
- `/api/orders`、`/api/checkout`：森森訂單與結帳
- `/api/admin/*`：森森員工後台
- `/admin/`：森森員工後台頁面

啟動：

```bash
cd sensen-backend
node server.js
```

預設 API 位址：`http://127.0.0.1:8081`。

結帳支援門市自取、宅配（$120）與冷凍宅配（$240），訂單物流狀態可由員工後台更新。若要實際寄送訂單確認信，請設定環境變數：

```bash
RESEND_API_KEY=re_xxx
ORDER_EMAIL_FROM="森森點心坊 <orders@your-domain.com>"
```

未設定 `RESEND_API_KEY` 時，訂單仍會建立，但確認信狀態會標記為待設定，不會假裝已寄出。

本地員工後台測試帳號：

- Email：`admin@sensen.local`
- Password：`SensenAdmin2026!`
- 後台：`http://127.0.0.1:8081/admin/signin.html`
- 門市管理：`http://127.0.0.1:8081/admin/store-management.html`

正式環境請登入後更換密碼，並勿將此組測試帳號公開使用。

此資料夾有自己的 `data/db.json`、`data/products.json` 與 `public/admin`，不依賴 Patria。

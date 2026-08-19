# Cart module

可移植的購物車功能，包含訪客／會員購物車、數量調整、刪除、優惠碼與結帳流程。

## 前端

- `frontend/cart-api.js`：可設定 `apiBaseUrl` 的 API client。
- `frontend/CartDrawer.jsx`：最小可用購物車抽屜元件，可套用自己的 CSS。

```js
import { createCartApi } from "./cart-api.js";
const cartApi = createCartApi({ apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "" });
```

## 後端介面

主站目前已提供：`GET /api/cart`、`POST /api/cart/add`、`PATCH /api/cart/item`、`DELETE /api/cart/item`、`GET /api/coupons`、`POST /api/checkout`。

搬到其他網站時，保留這些路徑或在 API gateway 做對應即可。購物車資料需要 `guestCarts`、`userCarts` 與訂單資料表／集合。

# Customer backend contract

需要提供以下 API：

| Method | Path | 用途 |
| --- | --- | --- |
| POST | `/api/register` | 建立客戶帳戶 |
| POST | `/api/login` | 客戶／員工登入 |
| POST | `/api/logout` | 清除 session |
| GET | `/api/me` | 取得目前會員 |
| PUT | `/api/me` | 更新姓名、Email、電話、密碼 |
| PUT/DELETE | `/api/address` | 儲存／刪除地址 |
| GET | `/api/orders` | 取得目前會員訂單 |

後端必須依 session user id 過濾 `/api/orders`，不得讓客戶讀取其他會員訂單。

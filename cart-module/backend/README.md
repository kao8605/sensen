# Cart backend adapter

目前實作位於 `Patria/server.js` 的 cart／checkout routes。此資料夾先放可移植介面規格，避免直接複製整個 monolithic server。

必備資料：`guestCarts`、`userCarts`、`orders`、`coupons`。登入或註冊時要合併 guest cart 到會員 cart；結帳時要驗證登入、取貨日期、庫存／備貨天數與優惠碼。

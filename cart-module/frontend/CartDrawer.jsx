import { useEffect, useState } from "react";

export function CartDrawer({ api, open, onClose, onCheckout }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");

  const refresh = () => api.getCart().then(setCart).catch((err) => setError(err.message));
  useEffect(() => { if (open) refresh(); }, [open]);

  async function update(item, qty) {
    try { setCart(await api.update(item.id, qty)); } catch (err) { setError(err.message); }
  }

  if (!open) return null;
  return <div className="cart-module-overlay" onClick={(event) => event.target === event.currentTarget && onClose?.()}>
    <aside className="cart-module-drawer" aria-label="Shopping cart">
      <button type="button" onClick={onClose} aria-label="Close cart">×</button>
      <h2>Your cart</h2>
      {!cart.items.length && <p>Your cart is empty.</p>}
      {cart.items.map((item) => <div className="cart-module-item" key={item.id}>
        <img src={item.img} alt="" />
        <div><strong>{item.title}</strong><span>${Number(item.priceValue || 0).toFixed(2)}</span>
          <div><button type="button" onClick={() => update(item, item.qty - 1)}>-</button><span>{item.qty}</span><button type="button" onClick={() => update(item, item.qty + 1)}>+</button></div>
        </div>
      </div>)}
      {error && <p role="alert">{error}</p>}
      <strong>Total ${Number(cart.total || 0).toFixed(2)}</strong>
      <button type="button" disabled={!cart.items.length} onClick={() => onCheckout?.(cart)}>Checkout</button>
    </aside>
  </div>;
}

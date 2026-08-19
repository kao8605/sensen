import { useEffect, useState } from "react";

export function CustomerDashboard({ api, onClose }) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.me().then((data) => { setUser(data.user); return api.orders(); }).then((data) => setOrders(data.orders || [])).catch((err) => setError(err.message)); }, []);
  if (error) return <section className="customer-module"><p role="alert">{error}</p></section>;
  if (!user) return <section className="customer-module"><p>Loading account…</p></section>;
  return <section className="customer-module" aria-label="Customer account">
    <button type="button" onClick={onClose}>Back to store</button>
    <h1>Welcome back, {user.name}</h1>
    <p>{user.email}</p>
    <h2>Recent orders</h2>
    {orders.length ? orders.map((order) => <div className="customer-module-order" key={order.id}><strong>#{order.id}</strong><span>{order.status}</span><b>${Number(order.total || 0).toFixed(2)}</b></div>) : <p>No orders yet.</p>}
  </section>;
}

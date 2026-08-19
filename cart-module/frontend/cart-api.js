/**
 * Portable cart API client.
 * Change apiBaseUrl when the module is mounted on another site.
 */
export function createCartApi({ apiBaseUrl = "" } = {}) {
  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Cart request failed.");
    return data;
  };

  return {
    getCart: () => request("/api/cart"),
    getCoupons: () => request("/api/coupons"),
    add: (productId, qty = 1) => request("/api/cart/add", { method: "POST", body: JSON.stringify({ productId, qty }) }),
    update: (productId, qty) => request("/api/cart/item", { method: "PATCH", body: JSON.stringify({ productId, qty }) }),
    remove: (productId) => request("/api/cart/item", { method: "DELETE", body: JSON.stringify({ productId }) }),
    checkout: (fulfillmentDate, couponCode = "") => request("/api/checkout", { method: "POST", body: JSON.stringify({ fulfillmentDate, couponCode }) }),
  };
}

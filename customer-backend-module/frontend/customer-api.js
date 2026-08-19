/** Portable customer account API client. */
export function createCustomerApi({ apiBaseUrl = "" } = {}) {
  const request = async (path, options = {}) => {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      credentials: "include",
      headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Customer request failed.");
    return data;
  };
  return {
    me: () => request("/api/me"),
    login: (login, password) => request("/api/login", { method: "POST", body: JSON.stringify({ login, password }) }),
    register: (payload) => request("/api/register", { method: "POST", body: JSON.stringify(payload) }),
    logout: () => request("/api/logout", { method: "POST" }),
    updateProfile: (payload) => request("/api/me", { method: "PUT", body: JSON.stringify(payload) }),
    updateAddress: (payload) => request("/api/address", { method: "PUT", body: JSON.stringify(payload) }),
    removeAddress: () => request("/api/address", { method: "DELETE" }),
    orders: () => request("/api/orders"),
  };
}

(() => {
  const root = document.querySelector('[data-orders-page]');
  if (!root) return;
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const labels = { created: '訂單已建立', processing: '準備中', shipped: '配送中', ready_for_pickup: '可取貨', completed: '已完成', picked_up: '已取貨', cancelled: '已取消' };
  const render = order => {
    const status = String(order.status || 'created').toLowerCase();
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    const timeline = history.length ? '<ol class="order-timeline">' + history.map(event => '<li class="' + (event.status === status ? 'is-current' : '') + '"><b>' + escapeHtml(labels[event.status] || event.status || '更新') + '</b><small>' + escapeHtml(new Date(event.at).toLocaleString('zh-TW')) + '</small></li>').join('') + '</ol>' : '';
    const tracking = order.trackingNumber ? '<p class="order-tracking">貨運單號：<strong>' + escapeHtml(order.trackingNumber) + '</strong></p>' : '<p class="order-tracking">貨運單號：尚未提供</p>';
    return '<article class="order-detail-card"><div class="order-detail-head"><div><b>#' + escapeHtml(order.id) + '</b><small>' + escapeHtml(order.shippingLabel || '門市自取') + ' · ' + escapeHtml(order.fulfillmentDate || '') + '</small></div><strong>$' + Number(order.total || 0).toFixed(2) + '</strong></div><p class="order-status-line">目前狀態：<span class="status">' + escapeHtml(labels[status] || order.status || '已建立') + '</span></p>' + tracking + timeline + '</article>';
  };
  fetch('/api/orders', { credentials: 'include' }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || '請先登入會員中心。'); root.innerHTML = data.orders?.length ? data.orders.slice().reverse().map(render).join('') : '<p>目前沒有訂單。</p>'; }).catch(error => { root.innerHTML = '<p class="account-error">' + escapeHtml(error.message) + '</p>'; });
})();

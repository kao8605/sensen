(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => '$' + Number(value || 0).toFixed(2);
  const formatAddress = address => {
    if (!address) return '尚未儲存地址';
    if (typeof address === 'string') return address || '尚未儲存地址';
    const location = [address.zip, address.city, address.address].filter(Boolean).join(' ');
    return [address.fullName, location].filter(Boolean).join(' · ') || '尚未儲存地址';
  };
  const labels = { created: '訂單已建立', pending_payment: '待付款', processing: '處理中', shipped: '已出貨', ready_for_pickup: '待取貨', completed: '已完成', picked_up: '已取貨', cancelled: '取消' };
  const api = async (path, options = {}) => { const response = await fetch(path, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || '操作失敗。'); return data; };
  let orders = [], customers = [];
  const orderDialog = $('#order-dialog');
  const customerDialog = $('#customer-dialog');
  const message = text => { $('#global-message').textContent = text || ''; };

  function renderOrders() {
    const query = $('#order-search').value.trim().toLowerCase();
    const status = $('#order-status-filter').value;
    const from = $('#order-date-from').value;
    const to = $('#order-date-to').value;
    const filtered = orders.filter(order => (!query || [order.id, order.customer?.name, order.customer?.email].join(' ').toLowerCase().includes(query)) && (!status || String(order.status || '') === status) && (!from || String(order.createdAt || '').slice(0, 10) >= from) && (!to || String(order.createdAt || '').slice(0, 10) <= to));
    $('#order-count').textContent = `${filtered.length} / ${orders.length} 筆訂單`;
    $('#order-table').innerHTML = filtered.length ? filtered.map(order => `<tr><td><button class="btn btn-link p-0 fw-bold" data-view-order="${escapeHtml(order.id)}">#${escapeHtml(order.id)}</button><small class="d-block text-secondary">${escapeHtml(new Date(order.createdAt || 0).toLocaleString('zh-TW'))}</small></td><td>${escapeHtml(order.customer?.name || '會員')}<small class="d-block text-secondary">${escapeHtml(order.customer?.email || '')}</small></td><td>${escapeHtml(order.shippingLabel || '門市自取')}<small class="d-block text-secondary">${escapeHtml(order.trackingNumber || '無單號')}</small></td><td>${money(order.total)}</td><td><span class="badge text-bg-light">${escapeHtml(labels[order.status] || order.status || '已建立')}</span></td><td class="text-end"><button class="btn btn-sm btn-outline-primary" data-view-order="${escapeHtml(order.id)}">檢視</button></td></tr>`).join('') : '<tr><td colspan="6" class="text-secondary py-4">沒有符合條件的訂單。</td></tr>';
    $$('[data-view-order]').forEach(button => button.addEventListener('click', () => openOrder(orders.find(item => item.id === button.dataset.viewOrder))));
  }

  function openOrder(order) {
    if (!order) return;
    const form = $('#order-form');
    form.elements.orderId.value = order.id;
    form.elements.status.value = order.status || 'processing';
    form.elements.trackingNumber.value = order.trackingNumber || '';
    form.elements.notify.checked = false;
    $('#order-detail-content').innerHTML = `<div class="row g-3"><div class="col-md-6"><h6>客戶資料</h6><p class="mb-1">${escapeHtml(order.customer?.name || '會員')}</p><p class="mb-1"><a href="mailto:${escapeHtml(order.customer?.email || '')}">${escapeHtml(order.customer?.email || '')}</a></p><p>${escapeHtml(order.customer?.phone || '—')}</p></div><div class="col-md-6"><h6>配送資訊</h6><p class="mb-1">${escapeHtml(order.shippingLabel || '門市自取')} · ${escapeHtml(order.fulfillmentDate || '')}</p><p>${order.shippingAddress ? escapeHtml([order.shippingAddress.zip, order.shippingAddress.city, order.shippingAddress.address].filter(Boolean).join(' ')) : '門市取貨'}</p></div></div><h6>商品明細</h6><div class="table-responsive"><table class="table table-sm"><tbody>${(order.items || []).map(item => `<tr><td>${escapeHtml(item.title)}</td><td>× ${Number(item.qty || 0)}</td><td class="text-end">${money(Number(item.priceValue || 0) * Number(item.qty || 0))}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2">商品小計</th><th class="text-end">${money(order.subtotal)}</th></tr><tr><th colspan="2">運費</th><th class="text-end">${money(order.shippingFee)}</th></tr><tr><th colspan="2">合計</th><th class="text-end">${money(order.total)}</th></tr></tfoot></table></div><div class="alert alert-light mb-0"><strong>客戶備註：</strong>${escapeHtml(order.customerNote || '無')}</div>`;
    orderDialog.showModal();
  }

  function renderCustomers() {
    $('#customer-table').innerHTML = customers.length ? customers.map(customer => `<tr><td><button class="btn btn-link p-0" data-view-customer="${escapeHtml(customer.id)}">${escapeHtml(customer.name || '未命名')}</button></td><td>${escapeHtml(customer.email)}</td><td>${escapeHtml(customer.phone || '—')}</td><td class="customer-address-cell">${escapeHtml(formatAddress(customer.address))}</td><td>${Number(customer.orderCount || 0)}</td><td>${money(customer.totalSpent)}</td><td><button class="btn btn-sm btn-outline-primary" data-view-customer="${escapeHtml(customer.id)}">消費紀錄</button></td></tr>`).join('') : '<tr><td colspan="7" class="text-secondary">目前沒有客戶。</td></tr>';
    $$('[data-view-customer]').forEach(button => button.addEventListener('click', () => openCustomer(button.dataset.viewCustomer)));
  }

  async function openCustomer(id) {
    const data = await api('/api/admin/customers?id=' + encodeURIComponent(id));
    const customer = data.customer;
    const address = customer.address;
    $('#customer-detail').innerHTML = `<h5>${escapeHtml(customer.name || '未命名')}</h5><p class="text-secondary mb-3">${escapeHtml(customer.email)} · ${escapeHtml(customer.phone || '未填寫電話')}</p><div class="customer-address-panel mb-3"><div class="d-flex align-items-center gap-2 mb-2"><i class="ti ti-map-pin text-primary"></i><strong>會員地址</strong></div><p class="mb-1">${escapeHtml(formatAddress(address))}</p>${address?.phone ? `<small class="text-secondary">地址電話：${escapeHtml(address.phone)}</small>` : ''}</div><p>訂單 ${customer.orderCount} 筆｜累計消費 ${money(customer.totalSpent)}</p><hr><h6>歷史訂單</h6>${data.orders.length ? data.orders.map(order => `<div class="d-flex justify-content-between border-bottom py-2"><span>#${escapeHtml(order.id)} · ${escapeHtml(labels[order.status] || order.status)}</span><strong>${money(order.total)}</strong></div>`).join('') : '<p class="text-secondary">尚無訂單。</p>'}`;
    customerDialog.showModal();
  }

  const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  function exportOrders(format) {
    const rows = [['訂單編號', '日期', '客戶', 'Email', '電話', '物流方式', '物流單號', '狀態', '小計', '運費', '總額', '客戶備註']];
    orders.forEach(order => rows.push([order.id, order.createdAt, order.customer?.name, order.customer?.email, order.customer?.phone, order.shippingLabel, order.trackingNumber, labels[order.status] || order.status, order.subtotal, order.shippingFee, order.total, order.customerNote]));
    const csv = '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const blob = format === 'xls' ? new Blob(['<meta charset="utf-8"><table><tr>' + rows.map(row => row.map(value => '<td>' + escapeHtml(value) + '</td>').join('')).join('</tr><tr>') + '</tr></table>'], { type: 'application/vnd.ms-excel' }) : new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'sensen-orders.' + (format === 'xls' ? 'xls' : 'csv'); link.click(); URL.revokeObjectURL(link.href);
  }

  async function loadOrders() { const data = await api('/api/admin/orders'); orders = data.orders || []; renderOrders(); }
  async function loadCustomers() { const data = await api('/api/admin/customers'); customers = data.customers || []; renderCustomers(); }
  $('#order-form').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; try { const data = await api('/api/admin/orders/status', { method: 'PATCH', body: JSON.stringify({ orderId: form.elements.orderId.value, status: form.elements.status.value, trackingNumber: form.elements.trackingNumber.value.trim(), notify: form.elements.notify.checked }) }); orderDialog.close(); message(data.order?.shippingNotification?.status === 'pending' ? '訂單已更新；寄信服務尚未設定。' : '訂單已更新。'); await loadOrders(); } catch (error) { $('#order-form-message').textContent = error.message; } });
  $('#order-search').addEventListener('input', renderOrders); $('#order-status-filter').addEventListener('change', renderOrders); $('#order-date-from').addEventListener('change', renderOrders); $('#order-date-to').addEventListener('change', renderOrders);
  $('#export-csv').addEventListener('click', () => exportOrders('csv')); $('#export-xls').addEventListener('click', () => exportOrders('xls')); $('#refresh-all').addEventListener('click', async () => { await Promise.all([loadOrders(), loadCustomers()]); message('資料已更新。'); });
  Promise.all([loadOrders(), loadCustomers()]).catch(error => { $('#load-error').hidden = false; $('#load-error').textContent = error.message; });
})();

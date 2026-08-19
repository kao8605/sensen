(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => '$' + Number(value || 0).toFixed(2);
  const statusLabels = { created: '訂單已建立', pending_payment: '待付款', processing: '處理中', shipped: '已出貨', ready_for_pickup: '待取貨', completed: '已完成', picked_up: '已取貨', cancelled: '取消' };
  const api = async (path, options = {}) => { const response = await fetch(path, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || '操作失敗。'); return data; };
  let products = [], orders = [], customers = [];

  const productDialog = $('#product-dialog');
  const orderDialog = $('#order-dialog');
  const customerDialog = $('#customer-dialog');
  const setMessage = (selector, message, error = false) => { const node = $(selector); if (node) { node.textContent = message || ''; node.className = message ? (error ? 'text-danger small' : 'text-success small') : 'small'; } };

  function renderProductFilters() {
    const category = $('#product-category-filter');
    const current = category.value;
    category.innerHTML = '<option value="">全部分類</option>' + [...new Set(products.map(item => item.cat).filter(Boolean))].sort().map(value => '<option>' + escapeHtml(value) + '</option>').join('');
    category.value = current;
  }

  function renderProducts() {
    const query = $('#product-search').value.trim().toLowerCase();
    const category = $('#product-category-filter').value;
    const visibility = $('#product-visibility-filter').value;
    const filtered = products.filter(item => (!query || [item.title, item.sku, item.spec, item.cat].join(' ').toLowerCase().includes(query)) && (!category || item.cat === category) && (!visibility || (visibility === 'published' ? item.published !== false : item.published === false)));
    $('#product-count').textContent = `${filtered.length} / ${products.length} 項商品`;
    $('#product-table').innerHTML = filtered.length ? filtered.map(item => `<tr><td><strong>${escapeHtml(item.title)}</strong><small class="d-block text-secondary">${escapeHtml(item.sku || item.id)}</small></td><td>${escapeHtml(item.cat || '')}</td><td>${escapeHtml(item.spec || '—')}</td><td>${money(item.priceValue)}</td><td class="${Number(item.quantity || 0) < 10 ? 'text-danger fw-bold' : ''}">${Number(item.quantity || 0)}</td><td><span class="badge ${item.published === false ? 'text-bg-secondary' : 'text-bg-success'}">${item.published === false ? '下架' : '上架'}</span></td><td class="text-end"><button class="btn btn-sm btn-outline-primary me-1" data-edit-product="${escapeHtml(item.id)}">編輯</button><button class="btn btn-sm btn-outline-secondary me-1" data-toggle-product="${escapeHtml(item.id)}">${item.published === false ? '上架' : '下架'}</button><button class="btn btn-sm btn-outline-danger" data-delete-product="${escapeHtml(item.id)}">刪除</button></td></tr>`).join('') : '<tr><td colspan="7" class="text-secondary py-4">沒有符合條件的商品。</td></tr>';
    $$('[data-edit-product]').forEach(button => button.addEventListener('click', () => openProduct(products.find(item => item.id === button.dataset.editProduct))));
    $$('[data-toggle-product]').forEach(button => button.addEventListener('click', async () => { const item = products.find(product => product.id === button.dataset.toggleProduct); if (!item) return; await api('/api/admin/products', { method: 'PATCH', body: JSON.stringify({ id: item.id, published: item.published === false }) }); await loadProducts(); }));
    $$('[data-delete-product]').forEach(button => button.addEventListener('click', async () => { const item = products.find(product => product.id === button.dataset.deleteProduct); if (!item || !window.confirm(`確定刪除「${item.title}」？`)) return; await api('/api/admin/products', { method: 'DELETE', body: JSON.stringify({ id: item.id }) }); await loadProducts(); }));
  }

  function openProduct(product = null) {
    const form = $('#product-form');
    form.reset();
    $('#product-dialog-title').textContent = product ? '編輯商品' : '新增商品';
    form.elements.id.value = product?.id || '';
    form.elements.title.value = product?.title || '';
    form.elements.sku.value = product?.sku || '';
    form.elements.cat.value = product?.cat || '';
    form.elements.spec.value = product?.spec || '';
    form.elements.priceValue.value = product?.priceValue ?? '';
    form.elements.quantity.value = product?.quantity ?? 0;
    form.elements.day.value = product?.day || 5;
    form.elements.img.value = product?.img || '';
    form.elements.desc.value = product?.desc || '';
    form.elements.published.checked = product?.published !== false;
    setMessage('#product-form-message', '');
    productDialog.showModal();
  }

  async function loadProducts() {
    const data = await api('/api/admin/products');
    products = data.products || [];
    renderProductFilters(); renderProducts();
  }

  function renderOrders() {
    const query = $('#order-search').value.trim().toLowerCase();
    const status = $('#order-status-filter').value;
    const from = $('#order-date-from').value;
    const to = $('#order-date-to').value;
    const filtered = orders.filter(order => (!query || [order.id, order.customer?.name, order.customer?.email].join(' ').toLowerCase().includes(query)) && (!status || String(order.status || '') === status) && (!from || String(order.createdAt || '').slice(0, 10) >= from) && (!to || String(order.createdAt || '').slice(0, 10) <= to));
    $('#order-count').textContent = `${filtered.length} / ${orders.length} 筆訂單`;
    $('#order-table').innerHTML = filtered.length ? filtered.map(order => `<tr><td><button class="btn btn-link p-0 fw-bold" data-view-order="${escapeHtml(order.id)}">#${escapeHtml(order.id)}</button><small class="d-block text-secondary">${escapeHtml(new Date(order.createdAt || 0).toLocaleString('zh-TW'))}</small></td><td>${escapeHtml(order.customer?.name || '會員')}<small class="d-block text-secondary">${escapeHtml(order.customer?.email || '')}</small></td><td>${escapeHtml(order.shippingLabel || '門市自取')}<small class="d-block text-secondary">${escapeHtml(order.trackingNumber || '無單號')}</small></td><td>${money(order.total)}</td><td><span class="badge text-bg-light">${escapeHtml(statusLabels[order.status] || order.status || '已建立')}</span></td><td class="text-end"><button class="btn btn-sm btn-outline-primary" data-view-order="${escapeHtml(order.id)}">檢視</button></td></tr>`).join('') : '<tr><td colspan="6" class="text-secondary py-4">沒有符合條件的訂單。</td></tr>';
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
    $('#customer-table').innerHTML = customers.length ? customers.map(customer => `<tr><td><button class="btn btn-link p-0" data-view-customer="${escapeHtml(customer.id)}">${escapeHtml(customer.name || '未命名')}</button></td><td>${escapeHtml(customer.email)}</td><td>${escapeHtml(customer.phone || '—')}</td><td>${Number(customer.orderCount || 0)}</td><td>${money(customer.totalSpent)}</td><td><button class="btn btn-sm btn-outline-primary" data-view-customer="${escapeHtml(customer.id)}">消費紀錄</button></td></tr>`).join('') : '<tr><td colspan="6" class="text-secondary">目前沒有客戶。</td></tr>';
    $$('[data-view-customer]').forEach(button => button.addEventListener('click', () => openCustomer(button.dataset.viewCustomer)));
  }

  async function openCustomer(id) {
    const data = await api('/api/admin/customers?id=' + encodeURIComponent(id));
    const customer = data.customer;
    $('#customer-detail').innerHTML = `<h5>${escapeHtml(customer.name || '未命名')}</h5><p class="text-secondary mb-2">${escapeHtml(customer.email)} · ${escapeHtml(customer.phone || '未填寫電話')}</p><p>訂單 ${customer.orderCount} 筆｜累計消費 ${money(customer.totalSpent)}</p><hr><h6>歷史訂單</h6>${data.orders.length ? data.orders.map(order => `<div class="d-flex justify-content-between border-bottom py-2"><span>#${escapeHtml(order.id)} · ${escapeHtml(statusLabels[order.status] || order.status)}</span><strong>${money(order.total)}</strong></div>`).join('') : '<p class="text-secondary">尚無訂單。</p>'}`;
    customerDialog.showModal();
  }

  const csvCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
  function exportOrders(format) {
    const rows = [['訂單編號', '日期', '客戶', 'Email', '電話', '物流方式', '物流單號', '狀態', '小計', '運費', '總額', '客戶備註']];
    orders.forEach(order => rows.push([order.id, order.createdAt, order.customer?.name, order.customer?.email, order.customer?.phone, order.shippingLabel, order.trackingNumber, statusLabels[order.status] || order.status, order.subtotal, order.shippingFee, order.total, order.customerNote]));
    const csv = '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const blob = format === 'xls' ? new Blob(['<meta charset="utf-8"><table><tr>' + rows.map(row => row.map(value => '<td>' + escapeHtml(value) + '</td>').join('')).join('</tr><tr>') + '</tr></table>'], { type: 'application/vnd.ms-excel' }) : new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'sensen-orders.' + (format === 'xls' ? 'xls' : 'csv'); link.click(); URL.revokeObjectURL(link.href);
  }

  $('#product-form').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); const payload = { ...data, priceValue: Number(data.priceValue), quantity: Number(data.quantity), published: form.elements.published.checked }; try { await api('/api/admin/products' + (data.id ? '' : ''), { method: data.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) }); productDialog.close(); await loadProducts(); } catch (error) { setMessage('#product-form-message', error.message, true); } });
  $('#order-form').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; try { const data = await api('/api/admin/orders/status', { method: 'PATCH', body: JSON.stringify({ orderId: form.elements.orderId.value, status: form.elements.status.value, trackingNumber: form.elements.trackingNumber.value.trim(), notify: form.elements.notify.checked }) }); orderDialog.close(); setMessage('#global-message', data.order?.shippingNotification?.status === 'pending' ? '訂單已更新；寄信服務尚未設定。' : '訂單已更新。'); await loadOrders(); } catch (error) { setMessage('#order-form-message', error.message, true); } });
  $('#product-search').addEventListener('input', renderProducts); $('#product-category-filter').addEventListener('change', renderProducts); $('#product-visibility-filter').addEventListener('change', renderProducts); $('#order-search').addEventListener('input', renderOrders); $('#order-status-filter').addEventListener('change', renderOrders); $('#order-date-from').addEventListener('change', renderOrders); $('#order-date-to').addEventListener('change', renderOrders);
  $('#add-product').addEventListener('click', () => openProduct()); $('#export-csv').addEventListener('click', () => exportOrders('csv')); $('#export-xls').addEventListener('click', () => exportOrders('xls'));
  $('#refresh-all').addEventListener('click', async () => { await Promise.all([loadProducts(), loadOrders(), loadCustomers()]); setMessage('#global-message', '資料已更新。'); });
  $('#load-error').hidden = true;
  async function loadOrders() { const data = await api('/api/admin/orders'); orders = data.orders || []; renderOrders(); }
  async function loadCustomers() { const data = await api('/api/admin/customers'); customers = data.customers || []; renderCustomers(); }
  Promise.all([loadProducts(), loadOrders(), loadCustomers()]).catch(error => { $('#load-error').hidden = false; $('#load-error').textContent = error.message; });
})();

(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => '$' + Number(value || 0).toFixed(2);
  const api = async (path, options = {}) => { const response = await fetch(path, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) } }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || '操作失敗。'); return data; };
  let products = [];
  const dialog = $('#inventory-product-dialog');

  function renderFilters() {
    const category = $('#inventory-category-filter');
    const current = category.value;
    category.innerHTML = '<option value="">全部分類</option>' + [...new Set(products.map(item => item.cat).filter(Boolean))].sort().map(item => '<option>' + escapeHtml(item) + '</option>').join('');
    category.value = current;
  }

  function render() {
    const query = $('#inventory-product-search').value.trim().toLowerCase();
    const category = $('#inventory-category-filter').value;
    const visibility = $('#inventory-visibility-filter').value;
    const filtered = products.filter(item => (!query || [item.title, item.sku, item.spec, item.cat].join(' ').toLowerCase().includes(query)) && (!category || item.cat === category) && (!visibility || (visibility === 'published' ? item.published !== false : item.published === false)));
    $('[data-admin-table="inventory"]').innerHTML = filtered.length ? filtered.map(item => `<tr class="align-middle"><td><strong>${escapeHtml(item.title)}</strong><small class="d-block text-secondary">${escapeHtml(item.day || '')} 天製作</small></td><td>${escapeHtml(item.sku || item.id)}</td><td>${escapeHtml(item.cat || '')}</td><td>${escapeHtml(item.spec || '—')}</td><td>${money(item.priceValue)}</td><td class="${Number(item.quantity || 0) < 10 ? 'text-danger fw-bold' : ''}">${Number(item.quantity || 0)}</td><td><span class="badge ${item.published === false ? 'text-bg-secondary' : 'text-bg-success'}">${item.published === false ? '下架' : '上架'}</span></td><td><button type="button" class="btn btn-sm btn-outline-primary me-1" data-inventory-edit="${escapeHtml(item.id)}">編輯</button><button type="button" class="btn btn-sm btn-outline-secondary me-1" data-inventory-toggle="${escapeHtml(item.id)}">${item.published === false ? '上架' : '下架'}</button><button type="button" class="btn btn-sm btn-outline-danger" data-inventory-delete="${escapeHtml(item.id)}">刪除</button></td></tr>`).join('') : '<tr><td colspan="8" class="text-secondary py-4">沒有符合條件的商品。</td></tr>';
    $$('[data-inventory-edit]').forEach(button => button.addEventListener('click', () => open(products.find(item => item.id === button.dataset.inventoryEdit))));
    $$('[data-inventory-toggle]').forEach(button => button.addEventListener('click', async () => { const item = products.find(product => product.id === button.dataset.inventoryToggle); if (!item) return; await api('/api/admin/products', { method: 'PATCH', body: JSON.stringify({ id: item.id, published: item.published === false }) }); await load(); }));
    $$('[data-inventory-delete]').forEach(button => button.addEventListener('click', async () => { const item = products.find(product => product.id === button.dataset.inventoryDelete); if (!item || !window.confirm(`確定刪除「${item.title}」？`)) return; await api('/api/admin/products', { method: 'DELETE', body: JSON.stringify({ id: item.id }) }); await load(); }));
  }

  function open(product = null) {
    const form = $('#inventory-product-form');
    form.reset();
    $('#inventory-dialog-title').textContent = product ? '編輯商品' : '新增商品';
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
    $('#inventory-product-message').textContent = '';
    dialog.showModal();
  }

  async function load() { const data = await api('/api/admin/products'); products = data.products || []; renderFilters(); render(); }
  $('#inventory-product-search').addEventListener('input', render); $('#inventory-category-filter').addEventListener('change', render); $('#inventory-visibility-filter').addEventListener('change', render);
  $('#inventory-product-form').addEventListener('submit', async event => { event.preventDefault(); const form = event.currentTarget; const data = Object.fromEntries(new FormData(form)); try { await api('/api/admin/products', { method: data.id ? 'PATCH' : 'POST', body: JSON.stringify({ ...data, priceValue: Number(data.priceValue), quantity: Number(data.quantity), published: form.elements.published.checked }) }); dialog.close(); await load(); } catch (error) { $('#inventory-product-message').textContent = error.message; $('#inventory-product-message').className = 'text-danger small'; } });
  window.addEventListener('load', () => load().catch(error => { const status = $('[data-inventory-excel-status]'); if (status) status.textContent = error.message; }));
})();

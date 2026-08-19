(() => {
  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const money = value => '$' + Number(value || 0).toFixed(2);
  const api = async (path, options = {}) => {
    const response = await fetch(path, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '優惠碼操作失敗。');
    return data;
  };

  let coupons = [];
  const message = (text, type = 'success') => {
    const element = $('#coupon-message');
    element.className = `text-${type} small mb-3`;
    element.textContent = text || '';
  };

  const valueLabel = coupon => coupon.type === 'fixed' ? money(coupon.value) : `${Number(coupon.value || 0)}%`;

  function renderCoupons() {
    $('#coupon-count').textContent = coupons.length;
    $('#coupon-table').innerHTML = coupons.length ? coupons.map(coupon => `<tr><td><strong>${escapeHtml(coupon.code)}</strong><small class="d-block text-secondary">${escapeHtml(coupon.label || '未填寫說明')}</small></td><td>${coupon.type === 'fixed' ? '固定金額' : '百分比折扣'}</td><td>${valueLabel(coupon)}</td><td>${money(coupon.min)}</td><td><span class="badge ${coupon.enabled ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">${coupon.enabled ? '啟用中' : '已停用'}</span></td><td class="text-end"><button type="button" class="btn btn-sm btn-light me-1" data-coupon-toggle="${escapeHtml(coupon.code)}">${coupon.enabled ? '停用' : '啟用'}</button><button type="button" class="btn btn-sm btn-light link-danger" data-coupon-delete="${escapeHtml(coupon.code)}"><i class="ti ti-trash"></i><span class="visually-hidden">刪除</span></button></td></tr>`).join('') : '<tr><td colspan="6" class="text-secondary py-4">目前沒有優惠碼。</td></tr>';
  }

  async function loadCoupons() {
    const data = await api('/api/admin/coupons');
    coupons = data.coupons || [];
    renderCoupons();
  }

  $('#discount-form').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector('[type="submit"]');
    const status = $('#coupon-form-status');
    const formData = new FormData(form);
    submit.disabled = true;
    status.className = 'small mb-0 mt-3 text-secondary';
    status.textContent = '儲存中…';
    try {
      const data = await api('/api/admin/coupons', { method: 'POST', body: JSON.stringify({ code: formData.get('code'), label: formData.get('label'), type: formData.get('type'), value: Number(formData.get('value')), min: Number(formData.get('min')), enabled: formData.get('enabled') === 'on' }) });
      form.reset();
      form.querySelector('[name="enabled"]').checked = true;
      status.className = 'small mb-0 mt-3 text-success';
      status.textContent = `${data.coupon.code} 已新增並同步至前台。`;
      await loadCoupons();
    } catch (error) {
      status.className = 'small mb-0 mt-3 text-danger';
      status.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });

  $('#coupon-table').addEventListener('click', async event => {
    const toggle = event.target.closest('[data-coupon-toggle]');
    const remove = event.target.closest('[data-coupon-delete]');
    const code = toggle?.dataset.couponToggle || remove?.dataset.couponDelete;
    if (!code) return;
    try {
      if (remove && !window.confirm(`確定刪除優惠碼 ${code}？`)) return;
      const data = await api('/api/admin/coupons', { method: remove ? 'DELETE' : 'PATCH', body: JSON.stringify(remove ? { code } : { code, enabled: !coupons.find(coupon => coupon.code === code)?.enabled }) });
      coupons = data.coupons || [];
      renderCoupons();
      message(remove ? `${code} 已刪除。` : `${code} 狀態已更新。`);
    } catch (error) {
      message(error.message, 'danger');
    }
  });

  loadCoupons().catch(error => { $('#coupon-error').hidden = false; $('#coupon-error').textContent = error.message; });
})();

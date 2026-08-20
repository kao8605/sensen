(() => {
  const table = document.querySelector('[data-admin-table="dashboard-coupons"]');
  if (!table) return;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  fetch('/api/admin/coupons', { credentials: 'include', headers: { Accept: 'application/json' } })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('優惠碼資料尚未連線。')))
    .then(data => {
      const coupons = data.coupons || [];
      table.innerHTML = coupons.length ? coupons.slice(0, 5).map(coupon => `<tr><td><strong>${escapeHtml(coupon.code)}</strong></td><td class="text-end"><span class="badge ${coupon.enabled ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">${coupon.enabled ? '啟用中' : '已停用'}</span></td></tr>`).join('') : '<tr><td colspan="2" class="text-secondary">目前沒有優惠碼。</td></tr>';
    })
    .catch(error => {
      table.innerHTML = `<tr><td colspan="2" class="text-secondary">${escapeHtml(error.message)}</td></tr>`;
    });
})();

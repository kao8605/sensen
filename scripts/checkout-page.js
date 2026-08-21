(() => {
  const root = document.querySelector('[data-checkout-page]');
  if (!root) return;

  const money = value => '$' + Number(value || 0).toFixed(2);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const api = async (path, options = {}) => {
    const response = await fetch(path, { ...options, credentials: 'include', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '操作失敗。');
    return data;
  };
  const toIsoDate = date => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  const saved = key => localStorage.getItem(key) || '';
  const setMessage = (selector, text, error = false) => root.querySelectorAll(selector).forEach(element => { element.textContent = text || ''; element.className = 'checkout-form-message' + (text ? (error ? ' is-error' : ' is-success') : ''); });
  const fields = {
    name: root.querySelector('[data-checkout-name]'), email: root.querySelector('[data-checkout-email]'), phone: root.querySelector('[data-checkout-phone]'),
    shipping: root.querySelector('[data-checkout-shipping]'), delivery: root.querySelector('[data-checkout-delivery-fields]'), address: root.querySelector('[data-checkout-address]'), city: root.querySelector('[data-checkout-city]'), zip: root.querySelector('[data-checkout-zip]'),
    pickup: root.querySelector('[data-checkout-pickup]'), pickupLabel: root.querySelector('[data-checkout-pickup-label]'), note: root.querySelector('[data-checkout-note]'), coupon: root.querySelector('[data-checkout-coupon]')
  };
  const save = () => {
    localStorage.setItem('sensen-cart-shipping', fields.shipping.value);
    localStorage.setItem('sensen-cart-coupon', fields.coupon.value.trim().toUpperCase());
    localStorage.setItem('sensen-cart-pickup', fields.pickup.value);
  };
  const renderItems = items => {
    root.querySelector('[data-checkout-items]').innerHTML = items.length ? items.map(item => '<div class="checkout-item"><span>' + escapeHtml(item.title || '商品') + ' × ' + Number(item.qty || 0) + '</span><span>' + money(Number(item.priceValue || 0) * Number(item.qty || 0)) + '</span></div>').join('') : '<p>目前購物車是空的。</p>';
  };
  const renderQuote = data => {
    root.querySelector('[data-checkout-subtotal]').textContent = money(data.subtotal);
    root.querySelector('[data-checkout-shipping-fee]').textContent = money(data.shippingFee);
    root.querySelector('[data-checkout-discount-row]').hidden = !Number(data.discount);
    root.querySelector('[data-checkout-discount]').textContent = '-' + money(data.discount);
    root.querySelector('[data-checkout-total]').textContent = money(data.total);
  };
  const syncDateLabel = () => { fields.pickupLabel.textContent = fields.pickup.value || '請選擇日期'; save(); };
  const syncDeliveryFields = () => {
    const isPickup = fields.shipping.value === 'pickup';
    fields.delivery.hidden = isPickup;
    fields.address.disabled = isPickup;
    fields.address.placeholder = isPickup ? '宅配時填寫地址' : '請輸入地址';
    fields.address.setAttribute('aria-disabled', String(isPickup));
    save();
  };
  const fillProfile = async () => {
    try {
      const data = await api('/api/me');
      const user = data.user || {};
      const address = data.address || {};
      if (!fields.name.value) fields.name.value = user.name || address.fullName || '';
      if (!fields.email.value) fields.email.value = user.email || '';
      if (!fields.phone.value) fields.phone.value = user.phone || address.phone || '';
      if (fields.address && !fields.address.value) fields.address.value = address.address || '';
      if (fields.city && !fields.city.value) fields.city.value = address.city || '';
      if (fields.zip && !fields.zip.value) fields.zip.value = address.zip || '';
    } catch (_) { /* 登入狀態由送出訂單時檢查 */ }
  };
  const quote = async () => {
    setMessage('[data-checkout-quote-message]', '');
    try {
      const data = await api('/api/cart/quote', { method: 'POST', body: JSON.stringify({ couponCode: fields.coupon.value.trim(), shippingMethod: fields.shipping.value }) });
      renderQuote(data); save();
    } catch (error) { setMessage('[data-checkout-quote-message]', error.message, true); }
  };
  const submit = async button => {
    setMessage('[data-checkout-submit-message]', ''); setMessage('[data-checkout-submit-message-secondary]', '');
    if (!fields.name.value.trim() || !fields.email.value.trim() || !fields.phone.value.trim()) { setMessage('[data-checkout-submit-message]', '請先填寫姓名、電子信箱與聯絡電話。', true); return; }
    if (!fields.pickup.value) { setMessage('[data-checkout-submit-message]', '請選擇取貨／配送日期。', true); return; }
    if (fields.shipping.value !== 'pickup' && (!fields.address.value.trim() || !fields.phone.value.trim())) { setMessage('[data-checkout-submit-message]', '宅配訂單請先填寫收件地址與電話。', true); return; }
    root.querySelectorAll('[data-checkout-submit]').forEach(item => { item.disabled = true; item.textContent = '送出中…'; });
    try {
      const data = await api('/api/checkout', { method: 'POST', body: JSON.stringify({ name: fields.name.value.trim(), email: fields.email.value.trim(), phone: fields.phone.value.trim(), fulfillmentDate: fields.pickup.value, couponCode: fields.coupon.value.trim(), shippingMethod: fields.shipping.value, shippingAddress: { fullName: fields.name.value.trim(), phone: fields.phone.value.trim(), address: fields.address?.value.trim() || '', city: fields.city?.value.trim() || '', zip: fields.zip?.value.trim() || '' }, customerNote: fields.note.value.trim() }) });
      localStorage.removeItem('sensen-cart-coupon'); localStorage.removeItem('sensen-cart-pickup'); localStorage.removeItem('sensen-cart-shipping');
      const emailText = data.email?.status === 'sent' ? '訂單確認信已寄至 ' + escapeHtml(data.email.recipient) + '。' : data.email?.status === 'pending' ? '訂單已建立；確認信寄送服務尚未設定。' : '';
      const card = root.querySelector('.checkout-order-card');
      card.innerHTML = '<div class="checkout-order-success"><h2>訂單已建立</h2><p>訂單編號：<strong>#' + escapeHtml(data.order?.id || '') + '</strong></p><p>' + emailText + '</p><p>目前狀態：訂單已建立。你可以到 <a href="https://sensen.jinfeng8605.workers.dev/customer/admin/backup/">會員中心</a> 查看物流狀態。</p></div>';
      setMessage('[data-checkout-submit-message]', '訂單已建立。', false);
    } catch (error) {
      setMessage('[data-checkout-submit-message]', error.message, true);
      root.querySelectorAll('[data-checkout-submit]').forEach(item => { item.disabled = false; item.textContent = '確認訂單'; });
    }
  };

  const load = async () => {
    const cart = await api('/api/cart');
    if (!cart.items?.length) { root.querySelector('[data-checkout-items]').innerHTML = '<p>目前購物車是空的，請先返回購物車選購商品。</p>'; root.querySelectorAll('[data-checkout-submit]').forEach(button => { button.disabled = true; }); return; }
    renderItems(cart.items);
    const method = saved('sensen-cart-shipping');
    fields.shipping.value = ['pickup', 'home', 'frozen'].includes(method) ? method : 'pickup';
    fields.coupon.value = saved('sensen-cart-coupon');
    const minDate = new Date(); minDate.setHours(0, 0, 0, 0); minDate.setDate(minDate.getDate() + Number(cart.leadDays || 5));
    fields.pickup.min = toIsoDate(minDate);
    const savedDate = saved('sensen-cart-pickup');
    fields.pickup.value = savedDate >= fields.pickup.min ? savedDate : fields.pickup.min;
    fields.pickup.title = '依購物車內最長製作時間計算，最早可選 ' + fields.pickup.min;
    syncDateLabel(); syncDeliveryFields(); await fillProfile(); await quote();
  };
  fields.shipping.addEventListener('change', () => { syncDeliveryFields(); quote(); });
  fields.coupon.addEventListener('input', () => setMessage('[data-checkout-quote-message]', ''));
  root.querySelector('[data-checkout-apply-coupon]').addEventListener('click', quote);
  fields.pickup.addEventListener('change', syncDateLabel);
  root.querySelectorAll('[data-checkout-submit]').forEach(button => button.addEventListener('click', () => submit(button)));
  load().catch(error => { setMessage('[data-checkout-quote-message]', error.message, true); });
})();

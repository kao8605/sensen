(() => {
  const drawer = document.querySelector('#sensen-cart-drawer');
  const overlay = document.querySelector('#sensen-cart-overlay');
  const triggers = [...document.querySelectorAll('.cart-trigger')];
  if (!drawer || !overlay || !triggers.length) return;
  const itemsEl = drawer.querySelector('[data-cart-items]');
  const messageEl = drawer.querySelector('[data-cart-message]');
  const optionsEl = drawer.querySelector('[data-cart-options]');
  const priceLinesEl = drawer.querySelector('[data-cart-price-lines]');
  const couponInput = drawer.querySelector('[data-cart-coupon]');
  const pickupInput = drawer.querySelector('[data-cart-pickup]');
  const dateHintEl = drawer.querySelector('[data-cart-date-hint]');
  const quoteMessageEl = drawer.querySelector('[data-cart-quote-message]');
  const subtotalEl = drawer.querySelector('[data-cart-subtotal]');
  const discountRowEl = drawer.querySelector('[data-cart-discount-row]');
  const discountEl = drawer.querySelector('[data-cart-discount]');
  const totalEl = drawer.querySelector('[data-cart-total]');
  const money = (value) => `$${Number(value || 0).toFixed(2)}`;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const toIsoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const saveFields = () => {
    localStorage.setItem('sensen-cart-coupon', couponInput.value.trim().toUpperCase());
    localStorage.setItem('sensen-cart-pickup', pickupInput.value);
  };
  const showQuoteMessage = (text, error = false) => {
    quoteMessageEl.textContent = text || '';
    quoteMessageEl.className = text ? (error ? 'sensen-cart-quote-message cart-form-error' : 'sensen-cart-quote-message cart-form-success') : 'sensen-cart-quote-message';
  };
  const applyQuote = async (cart) => {
    showQuoteMessage('');
    try {
      const response = await fetch('/api/cart/quote', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponInput.value.trim() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || '優惠碼套用失敗。');
      subtotalEl.textContent = money(data.subtotal);
      discountRowEl.hidden = !Number(data.discount);
      discountEl.textContent = `-${money(data.discount)}`;
      totalEl.textContent = money(data.total);
      if (couponInput.value.trim()) showQuoteMessage('優惠碼已套用。');
      saveFields();
    } catch (error) {
      discountRowEl.hidden = true;
      totalEl.textContent = money(cart.total);
      showQuoteMessage(error.message, true);
    }
  };
  async function loadCart() {
    try {
      const response = await fetch('/api/cart', { credentials: 'include' });
      if (!response.ok) throw new Error('森森購物車後端尚未啟動。');
      const cart = await response.json();
      const products = cart.items || [];
      const count = products.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      triggers.forEach((trigger) => trigger.querySelector('.cart-count')?.replaceChildren(String(count)));
      messageEl.hidden = products.length > 0;
      messageEl.textContent = products.length ? '' : '目前購物車是空的。';
      optionsEl.hidden = !products.length;
      priceLinesEl.hidden = !products.length;
      subtotalEl.textContent = money(cart.subtotal ?? cart.total);
      discountRowEl.hidden = true;
      totalEl.textContent = money(cart.total);
      couponInput.value = localStorage.getItem('sensen-cart-coupon') || '';
      const minDate = new Date();
      minDate.setHours(0, 0, 0, 0);
      minDate.setDate(minDate.getDate() + Number(cart.leadDays || 5));
      pickupInput.min = toIsoDate(minDate);
      const savedPickup = localStorage.getItem('sensen-cart-pickup') || '';
      pickupInput.value = savedPickup >= pickupInput.min ? savedPickup : pickupInput.min;
      dateHintEl.textContent = products.length ? `最早可取貨日期：${pickupInput.min}（依購物車內最長製作時間計算）` : '';
      saveFields();
      itemsEl.innerHTML = products.map((item) => `<article class="sensen-cart-item"><img src="${escapeHtml(item.img || '')}" alt=""><div><h3>${escapeHtml(item.title || '商品')}</h3><small>${escapeHtml(item.cat || '')} · ${money(item.priceValue)} · 製作時間 ${Number(item.day || 5)} 天</small><div class="sensen-cart-qty"><button type="button" data-cart-id="${escapeHtml(item.id)}" data-cart-qty="${Number(item.qty) - 1}">−</button><b>${Number(item.qty)}</b><button type="button" data-cart-id="${escapeHtml(item.id)}" data-cart-qty="${Number(item.qty) + 1}">＋</button></div></div><strong>${money(Number(item.priceValue || 0) * Number(item.qty || 0))}</strong></article>`).join('');
      if (products.length && couponInput.value.trim()) await applyQuote(cart);
    } catch (error) {
      messageEl.hidden = false;
      messageEl.textContent = error.message;
      itemsEl.innerHTML = '';
      optionsEl.hidden = true;
      priceLinesEl.hidden = true;
      totalEl.textContent = '$0.00';
      triggers.forEach((trigger) => trigger.querySelector('.cart-count')?.replaceChildren('0'));
    }
  }
  const toggle = (open) => { drawer.classList.toggle('is-open', open); overlay.classList.toggle('is-open', open); overlay.hidden = !open; drawer.setAttribute('aria-hidden', String(!open)); triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(open))); document.body.classList.toggle('cart-drawer-open', open); if (open) loadCart(); };
  triggers.forEach((trigger) => trigger.addEventListener('click', () => toggle(!drawer.classList.contains('is-open'))));
  drawer.querySelector('.sensen-cart-close').addEventListener('click', () => toggle(false));
  overlay.addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') toggle(false); });
  drawer.querySelector('[data-cart-apply-coupon]').addEventListener('click', async () => {
    const response = await fetch('/api/cart', { credentials: 'include' });
    if (response.ok) await applyQuote(await response.json());
  });
  couponInput.addEventListener('input', () => showQuoteMessage(''));
  couponInput.addEventListener('change', saveFields);
  pickupInput.addEventListener('change', saveFields);
  itemsEl.addEventListener('click', async (event) => { const button = event.target.closest('[data-cart-id]'); if (!button) return; await fetch('/api/cart/item', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: button.dataset.cartId, qty: Number(button.dataset.cartQty) }) }); loadCart(); });
})();

(() => {
  const page = document.querySelector('[data-latest-news-page]');
  if (!page) return;

  const list = page.querySelector('[data-news-list]');
  const buttons = [...page.querySelectorAll('[data-news-filter]')];
  let articles = [];
  let activeFilter = 'all';

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  const imageUrl = value => {
    const image = String(value || '').trim();
    if (!image) return '';
    if (/^(https?:|data:|\/)/i.test(image)) return image;
    return '/assets/images/' + image.replace(/^\.\//, '').replace(/^assets\/images\//, '');
  };

  const formatDate = value => {
    const date = new Date(value || 0);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const render = () => {
    const visible = activeFilter === 'all'
      ? articles
      : articles.filter(article => article.category === activeFilter);

    if (!visible.length) {
      list.innerHTML = '<p class="latest-news-empty">目前沒有符合條件的最新消息。</p>';
      return;
    }

    list.innerHTML = visible.map(article => {
      const image = imageUrl(article.image);
      const imageMarkup = image
        ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(article.title)}" loading="lazy">`
        : '<div class="latest-news-card-placeholder" aria-hidden="true">森森點心坊</div>';
      const description = article.excerpt || article.content || '';
      return `<article class="latest-news-card" data-news-category="${escapeHtml(article.category)}">
        <a class="latest-news-card-link" href="/latest-news/article/?id=${escapeHtml(encodeURIComponent(article.id))}" aria-label="查看${escapeHtml(article.title)}完整內容">
          <div class="latest-news-card-media">
            <div class="latest-news-card-image">${imageMarkup}</div>
          </div>
          <div class="latest-news-card-copy">
            <p class="latest-news-card-date"><span aria-hidden="true">◷</span>${escapeHtml(formatDate(article.publishAt || article.createdAt))}</p>
            <h2>${escapeHtml(article.title)}</h2>
            <p class="latest-news-card-excerpt">${escapeHtml(description)}</p>
            <span class="latest-news-card-readmore">查看完整內容 <span aria-hidden="true">→</span></span>
          </div>
        </a>
      </article>`;
    }).join('');
  };

  buttons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.newsFilter || 'all';
    buttons.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    render();
  }));

  fetch('/api/news', { credentials: 'include', headers: { Accept: 'application/json' } })
    .then(response => {
      if (!response.ok) throw new Error('Unable to load news.');
      return response.json();
    })
    .then(data => {
      articles = Array.isArray(data.news) ? data.news : [];
      render();
    })
    .catch(() => {
      list.innerHTML = '<p class="latest-news-empty">目前沒有最新消息。</p>';
    });
})();

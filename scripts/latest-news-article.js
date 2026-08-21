(() => {
  const page = document.querySelector('[data-latest-news-article-page]');
  if (!page) return;

  const status = page.querySelector('[data-article-status]');
  const imageContainer = page.querySelector('[data-article-image]');
  const date = page.querySelector('[data-article-date]');
  const category = page.querySelector('[data-article-category]');
  const title = page.querySelector('[data-article-title]');
  const content = page.querySelector('[data-article-content]');
  const categoryLabels = {
    'season-only': '季節限定',
    'new-arrival': '新品上市',
    'latest-news': '最新消息',
    'sensen-coffee': '森森飲品'
  };

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
    const parsed = new Date(value || 0);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const plainTextToHtml = value => escapeHtml(value).replace(/\r?\n/g, '<br>');
  const articleId = new URLSearchParams(window.location.search).get('id');

  const showError = message => {
    status.textContent = message;
    status.classList.add('is-error');
  };

  if (!articleId) {
    showError('找不到這則最新消息。');
    return;
  }

  fetch('/api/news?id=' + encodeURIComponent(articleId), {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  })
    .then(response => {
      if (!response.ok) throw new Error('目前無法載入這則最新消息。');
      return response.json();
    })
    .then(data => {
      const article = Array.isArray(data.news) ? data.news[0] : null;
      if (!article) throw new Error('找不到這則最新消息，可能已下架或不存在。');

      status.hidden = true;
      document.title = article.title + ' – 森森點心坊';
      title.textContent = article.title || '最新消息';
      date.innerHTML = '<span aria-hidden="true">◷</span>' + escapeHtml(formatDate(article.publishAt || article.createdAt));
      category.textContent = categoryLabels[article.category] || article.category || '最新消息';
      content.innerHTML = plainTextToHtml(article.content || article.excerpt || '目前沒有文章內容。');

      const image = imageUrl(article.image);
      if (image) {
        imageContainer.innerHTML = '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(article.title) + '">';
      } else {
        imageContainer.hidden = true;
      }
    })
    .catch(error => showError(error.message || '目前無法載入這則最新消息。'));
})();

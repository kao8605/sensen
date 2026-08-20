(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const form = $('#news-form');
  const message = $('#news-message');
  const items = $('[data-news-items]');
  let articles = [];

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  const api = async (path, options = {}) => {
    const response = await fetch(path, {
      ...options,
      credentials: 'include',
      headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || '操作失敗。');
    return data;
  };

  const setMessage = (text, type = '') => {
    message.textContent = text;
    message.className = type === 'error' ? 'text-danger small mb-3' : type === 'success' ? 'text-success small mb-3' : 'text-secondary small mb-3';
  };

  const toInputDate = value => {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return '';
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const toIsoDate = value => {
    if (!value) return new Date().toISOString();
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  };

  const imageUrl = value => {
    const image = String(value || '').trim();
    if (!image) return '';
    if (/^(https?:|data:|\/)/i.test(image)) return image;
    return '/assets/images/' + image.replace(/^\.\//, '').replace(/^assets\/images\//, '');
  };

  function renderPreview() {
    const title = form.elements.title.value.trim() || '文章標題預覽';
    const excerpt = form.elements.excerpt.value.trim() || form.elements.content.value.trim() || '內容摘要會顯示在這裡。';
    const image = imageUrl(form.elements.image.value);
    $('[data-preview-title]').textContent = title;
    $('[data-preview-excerpt]').textContent = excerpt.slice(0, 120);
    const media = $('[data-preview-media]');
    media.innerHTML = image ? `<img src="${escapeHtml(image)}" alt="">` : '尚未設定封面圖片';
  }

  function resetForm() {
    form.reset();
    form.elements.id.value = '';
    form.elements.status.value = 'draft';
    form.elements.category.value = 'latest-news';
    form.elements.publishAt.value = toInputDate();
    $('#news-title').focus();
    renderPreview();
    setMessage('準備新增文章。');
  }

  function openArticle(article) {
    form.elements.id.value = article.id || '';
    form.elements.title.value = article.title || '';
    form.elements.content.value = article.content || '';
    form.elements.excerpt.value = article.excerpt || '';
    form.elements.image.value = article.image || '';
    form.elements.status.value = article.status || 'draft';
    form.elements.category.value = article.category || 'latest-news';
    form.elements.publishAt.value = toInputDate(article.publishAt || article.createdAt);
    renderPreview();
    setMessage('正在編輯「' + article.title + '」。');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderList() {
    if (!articles.length) {
      items.innerHTML = '<p class="text-secondary mb-0">目前沒有文章，請先新增一篇。</p>';
      return;
    }
    items.innerHTML = articles.map(article => `<div class="news-list-item">
      <div><strong>${escapeHtml(article.title || '未命名文章')}</strong><small>${escapeHtml(article.category || '最新消息')} · ${article.status === 'published' ? '已發布' : '草稿'} · ${escapeHtml(String(article.publishAt || '').slice(0, 10))}</small></div>
      <div class="news-list-item-actions"><button class="btn btn-sm btn-outline-primary" type="button" data-edit-news="${escapeHtml(article.id)}">編輯</button><button class="btn btn-sm btn-outline-danger" type="button" data-delete-news="${escapeHtml(article.id)}">刪除</button></div>
    </div>`).join('');
    $$('[data-edit-news]').forEach(button => button.addEventListener('click', () => {
      const article = articles.find(item => item.id === button.dataset.editNews);
      if (article) openArticle(article);
    }));
    $$('[data-delete-news]').forEach(button => button.addEventListener('click', async () => {
      const article = articles.find(item => item.id === button.dataset.deleteNews);
      if (!article || !window.confirm(`確定刪除「${article.title}」？`)) return;
      try {
        await api('/api/admin/news', { method: 'DELETE', body: JSON.stringify({ id: article.id }) });
        if (form.elements.id.value === article.id) resetForm();
        await loadArticles();
        setMessage('文章已刪除。', 'success');
      } catch (error) { setMessage(error.message, 'error'); }
    }));
  }

  async function loadArticles() {
    const data = await api('/api/admin/news');
    articles = data.news || [];
    renderList();
  }

  async function save(status) {
    const data = Object.fromEntries(new FormData(form));
    const payload = {
      id: data.id,
      title: data.title.trim(),
      content: data.content.trim(),
      excerpt: data.excerpt.trim(),
      image: data.image.trim(),
      category: data.category,
      status,
      publishAt: toIsoDate(data.publishAt)
    };
    if (!payload.title) return setMessage('請先輸入文章標題。', 'error');
    try {
      const result = await api('/api/admin/news', { method: payload.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
      openArticle(result.news);
      await loadArticles();
      setMessage(status === 'published' ? '文章已發布，前台重新整理後即可看到。' : '草稿已儲存。', 'success');
    } catch (error) { setMessage(error.message, 'error'); }
  }

  form.elements.title.addEventListener('input', renderPreview);
  form.elements.content.addEventListener('input', renderPreview);
  form.elements.excerpt.addEventListener('input', renderPreview);
  form.elements.image.addEventListener('input', renderPreview);
  $('[data-new-article]').addEventListener('click', resetForm);
  $('[data-save-draft]').addEventListener('click', () => save('draft'));
  $('[data-publish]').addEventListener('click', () => save('published'));
  $('[data-refresh]').addEventListener('click', () => loadArticles().catch(error => setMessage(error.message, 'error')));

  resetForm();
  loadArticles().catch(error => {
    setMessage(error.message + ' 請先登入管理員帳號。', 'error');
    items.innerHTML = '<p class="text-danger mb-0">無法讀取文章。請確認已登入後台。</p>';
  });
})();

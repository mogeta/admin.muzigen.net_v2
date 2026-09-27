// Keep this module identical in the public blog and admin repositories.
export function parseGallery(value) {
  try {
    const data = JSON.parse(value);
    if (data.version !== 1 || !Array.isArray(data.images) || !data.images.length || data.images.length > 200) return null;
    const safeUrl = (url) => {
      if (typeof url !== 'string') return false;
      try { return new URL(url).protocol === 'https:'; } catch { return false; }
    };
    if (!data.images.every((img) => img && safeUrl(img.src) && safeUrl(img.thumbnail) && typeof img.alt === 'string')) return null;
    return data;
  } catch { return null; }
}

export function rehypeGallery() {
  const element = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
  return (tree) => {
    const walk = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        const code = child.tagName === 'pre' && child.children?.find((entry) => entry.tagName === 'code');
        if (code?.properties?.className?.includes('language-gallery')) {
          const data = parseGallery(code.children.map((entry) => entry.value || '').join(''));
          if (data) return element('div', { className: ['photo-gallery'], 'data-gallery': '' }, data.images.map((img) =>
            element('a', { href: img.src, className: ['photo-gallery-item'], 'data-gallery-image': '', 'aria-label': img.alt || '写真を拡大' }, [
              element('img', { src: img.thumbnail, alt: img.alt, loading: 'lazy', decoding: 'async', width: 480, height: 480 })
            ])
          ));
          return element('p', { role: 'status' }, [{ type: 'text', value: 'ギャラリーの形式が正しくありません。画像URLとデータを確認してください。' }]);
        }
        walk(child);
        return child;
      });
    };
    walk(tree);
  };
}

export function mountGalleries(root) {
  let dialog;
  let links = [];
  let index = 0;
  let opener;
  let previousOverflow = '';
  const close = () => dialog?.close();
  const onClick = (event) => {
    const anchor = event.target.closest?.('[data-gallery-image]');
    if (!anchor || !root.contains(anchor) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    links = Array.from(anchor.closest('[data-gallery]').querySelectorAll('[data-gallery-image]'));
    index = links.indexOf(anchor);
    opener = anchor;
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'photo-lightbox';
      dialog.setAttribute('aria-label', '写真の拡大表示');
      dialog.innerHTML = '<button type="button" class="photo-close" aria-label="閉じる">×</button><button type="button" class="photo-prev" aria-label="前の写真">‹</button><figure><img alt=""><figcaption aria-live="polite"></figcaption></figure><button type="button" class="photo-next" aria-label="次の写真">›</button>';
      document.body.append(dialog);
      dialog.querySelector('.photo-close').onclick = close;
      dialog.querySelector('.photo-prev').onclick = () => show(index - 1);
      dialog.querySelector('.photo-next').onclick = () => show(index + 1);
      dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(index + (e.key === 'ArrowLeft' ? -1 : 1)); }
      });
      dialog.addEventListener('close', () => {
        document.body.style.overflow = previousOverflow;
        dialog.querySelector('img').removeAttribute('src');
        opener?.focus();
      });
    }
    show(index);
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('.photo-close').focus();
  };
  const show = (next) => {
    index = (next + links.length) % links.length;
    const img = dialog.querySelector('img');
    img.src = links[index].href;
    img.alt = links[index].querySelector('img').alt;
    dialog.querySelector('figcaption').textContent = `${index + 1} / ${links.length}${img.alt ? ` — ${img.alt}` : ''}`;
    dialog.querySelector('.photo-prev').hidden = links.length < 2;
    dialog.querySelector('.photo-next').hidden = links.length < 2;
  };
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('click', onClick);
    if (dialog?.open) { dialog.close(); document.body.style.overflow = previousOverflow; }
    dialog?.remove();
  };
}

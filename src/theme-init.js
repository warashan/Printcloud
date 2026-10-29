/* PrintCloud DS — aplica tema antes del CSS para evitar flash inicial. */
(() => {
  try {
    if (localStorage.getItem('printcloud-ds-sidebar') === 'collapsed') {
      document.documentElement.dataset.sidebar = 'collapsed';
    }
  } catch (_) {}
  const storageKey = 'printcloud-ds-appearance';
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  let selected = 'light';
  try {
    const saved = localStorage.getItem(storageKey);
    selected = saved === 'system' ? (media?.matches ? 'dark' : 'light') : saved || 'light';
  } catch (_) {}
  if (!['light', 'dark'].includes(selected)) selected = 'light';
  try { localStorage.setItem(storageKey, selected); } catch (_) {}
  const apply = () => document.documentElement.setAttribute('data-theme', selected);
  apply();
  window.PCTheme = {
    get: () => selected,
    set(value) {
      if (!['light', 'dark'].includes(value)) return;
      selected = value;
      try { localStorage.setItem(storageKey, value); } catch (_) {}
      apply();
      document.dispatchEvent(new CustomEvent('pc:themechange', { detail: { preference: selected, resolved: document.documentElement.dataset.theme } }));
    }
  };
})();

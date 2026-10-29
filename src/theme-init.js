/* PrintCloud DS — aplica tema antes del CSS para evitar flash inicial. */
(() => {
  const storageKey = 'printcloud-ds-appearance';
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  let selected = 'system';
  try { selected = localStorage.getItem(storageKey) || 'system'; } catch (_) {}
  if (!['system', 'light', 'dark'].includes(selected)) selected = 'system';
  const apply = () => document.documentElement.setAttribute('data-theme', selected === 'system' ? (media?.matches ? 'dark' : 'light') : selected);
  apply();
  window.PCTheme = {
    get: () => selected,
    set(value) {
      if (!['system', 'light', 'dark'].includes(value)) return;
      selected = value;
      try { localStorage.setItem(storageKey, value); } catch (_) {}
      apply();
      document.dispatchEvent(new CustomEvent('pc:themechange', { detail: { preference: selected, resolved: document.documentElement.dataset.theme } }));
    }
  };
  media?.addEventListener?.('change', () => { if (selected === 'system') apply(); });
})();

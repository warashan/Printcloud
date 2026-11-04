/* Aplica la preferencia antes del CSS. «Sistema» se conserva y sigue al SO. */
(() => {
  try { if(localStorage.getItem('printcloud-ds-sidebar')==='collapsed')document.documentElement.dataset.sidebar='collapsed'; } catch (_) {}
  const key='printcloud-ds-appearance';
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  let selected='light';
  try {const value=localStorage.getItem(key);if(['light','dark','system'].includes(value))selected=value;} catch (_) {}
  const apply=()=>{
    const resolved=selected==='system'?(media.matches?'dark':'light'):selected;
    document.documentElement.dataset.theme=resolved;
    document.dispatchEvent(new CustomEvent('pc:themechange',{detail:{preference:selected,resolved}}));
  };
  window.PCTheme={get:()=>selected,set(value){if(!['light','dark','system'].includes(value))return;selected=value;try{localStorage.setItem(key,value);}catch(_){}apply();}};
  media.addEventListener('change',()=>{if(selected==='system')apply();});
  apply();
})();

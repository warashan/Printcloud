/* PrintCloud DS — interacciones de DEMOSTRACIÓN, sin servicios, backend ni impresión. */
(() => {
  'use strict';
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const spanish = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

  function toast(message, tone = 'info') {
    const zone = $('#toastZone');
    if (!zone) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeftColor = tone === 'success' ? '#279269' : tone === 'warning' ? '#b48522' : tone === 'danger' ? '#ba3e58' : '#3c759f';
    const content = document.createElement('div');
    content.style.flex = '1';
    content.textContent = message;
    const close = document.createElement('button');
    close.className = 'alert-dismiss';
    close.setAttribute('aria-label', 'Cerrar notificación');
    close.textContent = '×';
    close.addEventListener('click', () => t.remove());
    t.setAttribute('role', 'status');
    t.append(content, close);
    zone.append(t);
    // WCAG 2.2: no autodescartar mensajes que una persona aún podría leer.
    // El usuario puede cerrar la notificación explícitamente.
  }
  window.PCToast = toast;

  $$('[data-theme-choice]').forEach(btn => {
    btn.addEventListener('click', () => window.PCTheme?.set(btn.dataset.themeChoice));
  });
  const syncTheme = () => $$('[data-theme-choice]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.themeChoice === window.PCTheme?.get())));
  syncTheme();
  document.addEventListener('pc:themechange', syncTheme);

  /* Menú móvil: diálogo lateral con foco gestionado, cierre y retorno al disparador. */
  const sidebar = $('#sidebar');
  const overlay = $('#mobileOverlay');
  const menu = $('#menuToggle');
  const sidebarClose = $('#sidebarClose');
  const isMobile = () => window.matchMedia('(max-width: 840px)').matches;
  const focusables = () => $$('.sidebar a[href], .sidebar button:not([disabled]), .sidebar summary');
  const closeMobile = (restore = true) => {
    const wasOpen = sidebar?.classList.contains('is-open');
    sidebar?.classList.remove('is-open');
    overlay?.classList.remove('is-open');
    sidebar?.removeAttribute('aria-modal');
    sidebar?.removeAttribute('role');
    menu?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-nav-open');
    if (isMobile() && sidebar) sidebar.inert = true;
    if (wasOpen && restore) menu?.focus();
  };
  const openMobile = () => {
    if (!sidebar || !isMobile()) return;
    sidebar.inert = false;
    sidebar.classList.add('is-open');
    overlay?.classList.add('is-open');
    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    menu?.setAttribute('aria-expanded','true');
    document.body.classList.add('mobile-nav-open');
    requestAnimationFrame(() => sidebarClose?.focus());
  };
  const syncNav = () => {
    if (!sidebar) return;
    if (isMobile()) {if (!sidebar.classList.contains('is-open'))sidebar.inert=true;}
    else {sidebar.inert=false;closeMobile(false);}
  };
  menu?.addEventListener('click', () => sidebar?.classList.contains('is-open') ? closeMobile() : openMobile());
  sidebarClose?.addEventListener('click', () => closeMobile());
  overlay?.addEventListener('click', () => closeMobile());
  window.addEventListener('resize', syncNav);
  window.addEventListener('keydown', e => {
    if (!sidebar?.classList.contains('is-open')) return;
    if (e.key === 'Escape') {e.preventDefault();closeMobile();return;}
    if (e.key === 'Tab') {
      const items = focusables().filter(el => !el.closest('details:not([open]) .subitem'));
      const first=items[0], last=items[items.length-1];
      if (e.shiftKey && document.activeElement===first) {e.preventDefault();last?.focus();}
      else if (!e.shiftKey && document.activeElement===last) {e.preventDefault();first?.focus();}
    }
  });
  syncNav();

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const temp = document.createElement('textarea');
      temp.value = text; temp.style.position='fixed';temp.style.opacity='0';
      document.body.append(temp);temp.select();
      try { document.execCommand('copy'); } catch (_) {}
      temp.remove();
    }
    toast(`Copiado: ${text}`, 'success');
  }
  $$('[data-copy]').forEach(btn=>btn.addEventListener('click',()=>copy(btn.dataset.copy)));
  const iconSearch = $('#iconSearch');
  iconSearch?.addEventListener('input', () => {
    const query = iconSearch.value.trim().toLowerCase();
    const items = $$('.icon-cell');let n=0;
    items.forEach(item => {const show=item.dataset.copy.toLowerCase().includes(query);item.hidden=!show;if(show)n++;});
    if ($('#iconCount')) $('#iconCount').textContent=spanish(n,'ícono encontrado','íconos encontrados');
  });

  /* Formularios: validación de presencia, no se realiza validación de RUT ni envío real. */
  const demoForm = $('#demoForm');
  const resetForm = () => {
    demoForm?.reset();
    ['rut','folio'].forEach(id => {const f=$('#'+id);f?.removeAttribute('aria-invalid');const err=$('#'+id+'Error');if(err) err.hidden=true;});
    if($('#formFeedback')) $('#formFeedback').textContent='';
  };
  $('#formReset')?.addEventListener('click',resetForm);
  $('#formSubmit')?.addEventListener('click', () => {
    let valid=true;let firstInvalid=null;
    ['rut','folio'].forEach(id => {
      const f=$('#'+id); if(!f) return;
      const bad=!f.value.trim();f.setAttribute('aria-invalid',String(bad));
      const err=$('#'+id+'Error'); if(err) err.hidden=!bad;
      if(bad){valid=false;firstInvalid ??= f;}
    });
    if($('#formFeedback')) $('#formFeedback').textContent=valid ? 'Campos obligatorios presentes. Esta es una validación visual, no una solicitud enviada.' : 'Completa los campos marcados para continuar.';
    if(!valid)firstInvalid?.focus();
    toast(valid ? 'Validación visual completada. No se envió ningún dato.' : 'Faltan campos obligatorios.',valid?'success':'warning');
  });
  demoForm?.addEventListener('submit', e=>e.preventDefault());

  /* Wizard / stepper */
  const stepTitles=['Identificación del estudiante','Captura fotográfica','Validación de la información','Revisión y confirmación','Preparación de impresión'];
  const stepTexts=['Verifica RUT, nombres y tipo de solicitud antes de continuar.','Captura la fotografía según los criterios técnicos establecidos.','Comprueba documentación, identidad y calidad de la imagen.','Revisa la solicitud completa y confirma los datos.','Consulta el estado de la impresora antes de emitir. Esta demo no imprime.'];
  const stepContent=[
    '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label class="label">RUT de ejemplo</label><input class="field" value="12.345.678-9" readonly></div><div><label class="label">Solicitud</label><input class="field" value="SOL-2026-0042" readonly></div></div>',
    '<div class="alert alert-info"><div><strong class="alert-title">Captura no conectada</strong><p class="alert-text">En esta biblioteca solo se muestra la etapa. La cámara se integra exclusivamente en el sistema funcional.</p></div></div>',
    '<div class="flex flex-wrap gap-2"><span class="badge badge-success">Datos completos</span><span class="badge badge-success">Documento registrado</span><span class="badge badge-warning">Fotografía de ejemplo</span></div>',
    '<div class="surface" style="padding:18px;box-shadow:none"><div class="card-title">Resumen de solicitud</div><p class="card-detail">SOL-2026-0042 · Reposición centralizada · Oficina Valparaíso</p></div>',
    '<div class="alert alert-warning"><div><strong class="alert-title">Impresión deshabilitada en el prototipo</strong><p class="alert-text">No se envían trabajos de impresión ni se accede a hardware.</p></div></div>'
  ];
  let currentStep=0;
  const drawStep=()=>{
    const next=$('#stepNext');if(!next)return;
    $$('#stepper [data-step-item]').forEach((node,i)=>{
      node.classList.toggle('current',i===currentStep);node.classList.toggle('done',i<currentStep);
      const dot=$('.step-dot',node);if(dot) dot.textContent=i<currentStep?'✓':String(i+1);
      if (i===currentStep)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
    });
    $('#stepTitle').textContent=stepTitles[currentStep];
    $('#stepText').textContent=stepTexts[currentStep];
    $('#stepEyebrow').textContent=`Paso ${String(currentStep+1).padStart(2,'0')} / 05`;
    $('#stepBadge').textContent=`Etapa ${currentStep+1} de 5`;
    $('#stepStage').innerHTML=stepContent[currentStep];
    $$('#stepStage input').forEach((el,i) => {el.id='stepField'+i;const label=el.closest('div')?.querySelector('label');if(label)label.htmlFor=el.id;});
    $('#stepPrev').disabled=currentStep===0;
    next.textContent=currentStep===4?'Finalizar demostración':'Siguiente →';
  };
  $('#stepPrev')?.addEventListener('click',()=>{currentStep=Math.max(0,currentStep-1);drawStep()});
  $('#stepNext')?.addEventListener('click',()=>{if(currentStep===4){toast('Flujo de demostración completado. No se envió a imprimir.','success');return;}currentStep++;drawStep();});
  $('#stepReset')?.addEventListener('click',()=>{currentStep=0;drawStep();});
  drawStep();

  /* Dialog nativo. showModal() gestiona focus trap y Escape */
  $$('[data-open-dialog]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.openDialog)?.showModal()));
  $$('[data-close-dialog]').forEach(btn=>btn.addEventListener('click',()=>btn.closest('dialog')?.close()));
  $$('[data-demo-confirm]').forEach(btn=>btn.addEventListener('click',()=>{btn.closest('dialog')?.close();toast(btn.dataset.demoConfirm,'success');}));
  $$('dialog.dialog').forEach(dialog=>dialog.addEventListener('click', e=>{if(e.target===dialog)dialog.close()}));

  /* Tablas: filtro, orden, paginación y selección locales */
  const tbody=$('#tableBody');
  if(tbody){
    const rows=$$('tr[data-code]',tbody);let page=1;let reverse=false;
    const refresh=()=>{
      const query=($('#tableSearch')?.value||'').trim().toLowerCase();
      const status=$('#tableStatus')?.value||'';
      const selected=rows.filter(row=>[row.dataset.code,row.children[2].textContent,row.children[3].textContent].some(text=>text.toLowerCase().includes(query))&&(!status||row.dataset.status===status)).sort((a,b)=>reverse?b.dataset.code.localeCompare(a.dataset.code):a.dataset.code.localeCompare(b.dataset.code));
      const size=Number($('#pageSize').value)||10;const pages=Math.max(1,Math.ceil(selected.length/size));page=Math.min(page,pages);
      rows.forEach(row=>row.hidden=true);
      selected.slice((page-1)*size,page*size).forEach(row=>{row.hidden=false;tbody.append(row);});
      const pager=$('#tablePagination');pager.replaceChildren();
      function pageButton(label,n,disabled,active){const b=document.createElement('button');b.className='page-btn';b.textContent=label;b.disabled=disabled;b.type='button';b.setAttribute('aria-label',label==='‹'?'Página anterior':label==='›'?'Página siguiente':'Página '+label);if(active)b.setAttribute('aria-current','page');b.addEventListener('click',()=>{page=n;refresh();});pager.append(b);}
      pageButton('‹',page-1,page===1,false);
      for(let n=1;n<=pages;n++) pageButton(String(n),n,false,n===page);
      pageButton('›',page+1,page===pages,false);
      const start=selected.length?(page-1)*size+1:0;const end=Math.min(page*size,selected.length);
      $('#tableCount').textContent=`Mostrando ${start}–${end} de ${selected.length}`;
      $('#tableEmpty').hidden=selected.length!==0;
      $('#selectAll').checked=false;
    };
    $('#tableSearch')?.addEventListener('input',()=>{page=1;refresh()});
    $('#tableStatus')?.addEventListener('change',()=>{page=1;refresh()});
    $('#pageSize')?.addEventListener('change',()=>{page=1;refresh()});
    $('#sortCode')?.addEventListener('click',()=>{reverse=!reverse;const th=$('#sortCode')?.closest('th');if(th)th.setAttribute('aria-sort',reverse?'descending':'ascending');refresh();});
    $('#selectAll')?.addEventListener('change',e=>{$$('tr:not([hidden]) .table-select',tbody).forEach(el=>el.checked=e.target.checked)});
    tbody.addEventListener('click',e=>{const btn=e.target.closest('.table-detail');if(btn)toast(`Detalle de ${btn.dataset.code} (demostración).`,'info');});
    $('#exportTable')?.addEventListener('click',()=>toast('Exportación no disponible: datos de demostración.','info'));
    refresh();
  }

  /* Buscador avanzado */
  const searchDemo=$('#searchDemo');
  if(searchDemo){
    const items=$$('.search-result');
    function filterResults(){
      const term=$('#searchTerm').value.trim().toLowerCase();const type=$('#searchType').value;const status=$('#searchStatus').value;
      let count=0;items.forEach(item=>{
        const found=[item.dataset.code,item.dataset.kind,item.dataset.office].some(v=>v.toLowerCase().includes(term));
        const show=found&&(!type||item.dataset.kind===type)&&(!status||item.dataset.status===status);
        item.hidden=!show;if(show)count++;
      });
      $('#searchCount').textContent=spanish(count,'solicitud encontrada','solicitudes encontradas');
      $('#searchEmpty').hidden=count!==0;
      const chips=$('#activeFilters');chips.replaceChildren();
      for(const value of [term&&`Texto: ${term}`,type&&`Tipo: ${type}`,status&&`Estado: ${status}`].filter(Boolean)){
        const ch=document.createElement('span');ch.className='filter-chip';ch.textContent=value;chips.append(ch);
      }
    }
    searchDemo.addEventListener('submit',e=>{e.preventDefault();filterResults()});
    $('#searchTerm').addEventListener('input',filterResults);
    $('#searchType').addEventListener('change',filterResults);
    $('#searchStatus').addEventListener('change',filterResults);
    $('#searchClear').addEventListener('click',()=>{$('#searchTerm').value='';$('#searchType').value='';$('#searchStatus').value='';filterResults();});
    window.addEventListener('keydown',e=>{
      if(e.key==='/'&&!(e.target.closest('input,textarea,select,[contenteditable]'))){e.preventDefault();$('#searchTerm').focus();}
    });
    filterResults();
  }

  $$('[data-dismiss-alert]').forEach(button=>button.addEventListener('click',()=>button.closest('.alert')?.remove()));
  const toastText={success:'La operación de prueba finalizó correctamente.',info:'Se ha generado una notificación informativa.',warning:'Revisa la información antes de continuar.',danger:'No fue posible completar la acción de demostración.'};
  $$('[data-toast]').forEach(button=>button.addEventListener('click',()=>toast(toastText[button.dataset.toast],button.dataset.toast)));

  /* Login visual: NO simula autenticación exitosa ni guarda credenciales. */
  const loginForm=$('#loginDemo');
  $('#togglePassword')?.addEventListener('click',()=>{
    const p=$('#loginPassword');p.type=p.type==='password'?'text':'password';
    $('#togglePassword').setAttribute('aria-label',p.type==='password'?'Mostrar contraseña':'Ocultar contraseña');
    $('#togglePassword').setAttribute('aria-pressed',String(p.type==='text'));
  });
  loginForm?.addEventListener('submit',e=>{
    e.preventDefault();const valid=$('#loginUser').value.trim()&&$('#loginPassword').value.trim();
    const info=$('#loginFeedback');
    info.textContent=valid?'Interfaz validada. Esta pantalla no realiza autenticación real.':'Ingresa un usuario y una contraseña para comprobar el formulario.';
    info.style.color=valid?'var(--ds-succ)':'var(--ds-danger)';
    ['loginUser','loginPassword'].forEach(id=>{const field=$('#'+id);if(field)field.setAttribute('aria-invalid',String(!field.value.trim()));});
    if(!valid) ($('#loginUser').value.trim()?$('#loginPassword'):$('#loginUser')).focus();
    if(valid)toast('Demostración visual: no se ha iniciado sesión.','info');
  });
})();

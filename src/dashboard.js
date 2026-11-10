/* Dashboard de demostración: datos locales y acciones sin conexión a servicios. */
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  if (!$('#dashboardOverview')) return;
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const anchor = new Date('2026-11-10T12:00:00Z');
  const formatDate = date => new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(date);
  const offices = ['Santiago', 'Valparaíso', 'Viña del Mar', 'Quilpué'];
  const states = [
    { name: 'Pendiente', badge: 'badge-neutral', color: 'var(--dashboard-pending)' },
    { name: 'En revisión', badge: 'badge-warning', color: 'var(--dashboard-review)' },
    { name: 'Lista para imprimir', badge: 'badge-info', color: 'var(--dashboard-ready)' },
    { name: 'Impresa', badge: 'badge-success', color: 'var(--dashboard-printed)' },
    { name: 'Con observaciones', badge: 'badge-danger', color: 'var(--dashboard-observed)' }
  ];
  const requests = [];
  for (let day = 0; day < 14; day++) {
    offices.forEach((office, officeIndex) => {
      const quantity = 1 + (day * 3 + officeIndex * 2 + day % 3) % 5;
      for (let n = 0; n < quantity; n++) {
        const date = new Date(anchor); date.setUTCDate(date.getUTCDate() - day);
        requests.push({ code: `SOL-2026-${String(1001 + requests.length).padStart(4, '0')}`, office, day, date,
          type: ['Reposición centralizada', 'Reposición in situ', 'Revalidación'][(day + officeIndex + n) % 3],
          state: states[(day + officeIndex + n) % states.length] });
      }
    });
  }
  let overview = [], tableResults = [], stateFilter = '', page = 1;
  const pageSize = 5;
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const renderTable = () => {
    const term = normalize($('#dashboardSearch').value.trim());
    tableResults = overview.filter(item => (!stateFilter || item.state.name === stateFilter)
      && [item.code, item.office, item.type, item.state.name].some(value => normalize(value).includes(term)));
    const pages = Math.max(1, Math.ceil(tableResults.length / pageSize)); page = Math.min(page, pages);
    const body = $('#dashboardRows'); body.replaceChildren();
    tableResults.slice((page - 1) * pageSize, page * pageSize).forEach(item => {
      const row = document.createElement('tr');
      const code = element('td'); code.append(element('strong', item.code, 'table-strong'), element('small', item.type, 'dashboard-row-type'));
      const state = element('td'); state.append(element('span', item.state.name, `badge ${item.state.badge}`));
      const action = element('td'); const button = element('button', 'Ver detalle', 'dashboard-detail-button');
      button.type = 'button'; button.dataset.dashboardDetail = item.code; button.setAttribute('aria-label', `Ver detalle de ${item.code}`); action.append(button);
      row.append(code, element('td', item.office), state, element('td', formatDate(item.date)), action); body.append(row);
    });
    const total = tableResults.length;
    $('#dashboardCount').textContent = `Mostrando ${total ? (page - 1) * pageSize + 1 : 0}–${Math.min(page * pageSize, total)} de ${total} solicitudes`;
    $('#dashboardPage').textContent = `${page} de ${pages}`;
    $('#dashboardPrev').disabled = page === 1;
    $('#dashboardNext').disabled = page === pages;
    $('#dashboardEmpty').hidden = total > 0;
    $$('[data-dashboard-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.dashboardFilter === stateFilter)));
  };
  const renderOverview = (announce = false) => {
    const days = Number($('#dashboardPeriod').value), office = $('#dashboardOffice').value;
    overview = requests.filter(item => item.day < days && (!office || item.office === office));
    const first = new Date(anchor); first.setUTCDate(first.getUTCDate() - days + 1);
    $('#dashboardRange').textContent = `${formatDate(first)} – ${formatDate(anchor)} 2026`;
    const counts = states.map(state => overview.filter(item => item.state === state).length);
    const metrics = { total: overview.length, review: counts[1], ready: counts[2], printed: counts[3] };
    $$('[data-dashboard-metric]').forEach(node => { node.textContent = metrics[node.dataset.dashboardMetric].toLocaleString('es-CL'); });
    const series = Array.from({ length: days }, (_, i) => {
      const day = days - i - 1, date = new Date(anchor); date.setUTCDate(date.getUTCDate() - day);
      return { date, count: overview.filter(item => item.day === day).length };
    });
    const max = Math.max(1, ...series.map(day => day.count));
    const chart = $('#dashboardBars'); chart.replaceChildren(); chart.style.setProperty('--dashboard-days', days);
    chart.setAttribute('aria-label', `Solicitudes por día: ${series.map(day => `${formatDate(day.date)}, ${day.count}`).join('; ')}.`);
    const chartData = $('#dashboardChartData'); chartData.replaceChildren();
    series.forEach(day => {
      const column = element('div', undefined, 'dashboard-bar-column'); column.setAttribute('aria-hidden', 'true');
      const track = element('div', undefined, 'dashboard-bar-track'); const fill = element('div', undefined, 'dashboard-bar-fill');
      fill.style.height = `${day.count / max * 100}%`; track.append(fill);
      column.append(element('span', String(day.count), 'dashboard-bar-value'), track, element('span', String(day.date.getUTCDate()).padStart(2, '0'), 'dashboard-bar-label')); chart.append(column);
      const row = element('tr'); row.append(element('td', formatDate(day.date)), element('td', String(day.count))); chartData.append(row);
    });
    const list = $('#dashboardStates'); list.replaceChildren(); let accumulated = 0;
    const segments = states.map((state, i) => {
      const start = accumulated; accumulated += overview.length ? counts[i] / overview.length * 100 : 0;
      const row = element('li'); const label = element('span', undefined, 'dashboard-state-label');
      const swatch = element('span', undefined, 'dashboard-state-swatch'); swatch.style.background = state.color; swatch.setAttribute('aria-hidden', 'true');
      label.append(swatch, element('span', state.name));
      const amount = element('span', `${counts[i]} · ${overview.length ? Math.round(counts[i] / overview.length * 100) : 0}%`, 'dashboard-state-amount');
      row.append(label, amount); list.append(row);
      return `${state.color} ${start}% ${accumulated}%`;
    });
    $('#dashboardDonut').style.background = overview.length ? `conic-gradient(${segments.join(',')})` : 'var(--ds-border)';
    $('#dashboardDonutTotal').textContent = String(overview.length);
    $('#dashboardAttentionCount').textContent = String(counts[4]); $('#dashboardAttention').disabled = counts[4] === 0;
    const timeline = $('#dashboardTimeline'); timeline.replaceChildren();
    overview.slice(0, 3).forEach(item => {
      const row = element('li'); row.append(element('strong', item.state.name), element('span', item.code), element('small', `${item.office} · ${formatDate(item.date)}`)); timeline.append(row);
    });
    page = 1; renderTable();
    if (announce) $('#dashboardStatus').textContent = `Resumen actualizado: ${overview.length} solicitudes. ${office || 'Todas las oficinas'}. Período de ${days} días de ejemplo.`;
  };
  const reset = () => {
    $('#dashboardOffice').value = ''; $('#dashboardPeriod').value = '7'; $('#dashboardSearch').value = ''; stateFilter = ''; renderOverview(true);
  };
  ['dashboardOffice', 'dashboardPeriod'].forEach(id => $(`#${id}`).addEventListener('change', () => renderOverview(true)));
  $('#dashboardSearch').addEventListener('input', () => { page = 1; renderTable(); });
  $$('[data-dashboard-filter]').forEach(button => button.addEventListener('click', () => { stateFilter = button.dataset.dashboardFilter; page = 1; renderTable(); }));
  $('#dashboardPrev').addEventListener('click', () => { page--; renderTable(); if ($('#dashboardPrev').disabled) $('#dashboardNext').focus(); });
  $('#dashboardNext').addEventListener('click', () => { page++; renderTable(); if ($('#dashboardNext').disabled) $('#dashboardPrev').focus(); });
  $('#dashboardReset').addEventListener('click', reset);
  $('#dashboardEmptyReset').addEventListener('click', () => { reset(); $('#dashboardSearch').focus(); });
  $('#dashboardAttention').addEventListener('click', () => { stateFilter = 'Con observaciones'; $('#dashboardSearch').value = ''; page = 1; renderTable(); $('#dashboardRecentTitle').focus(); });
  $('#dashboardRefresh').addEventListener('click', () => {
    $('#dashboardRefresh').disabled = true; $('#dashboardOverview').setAttribute('aria-busy', 'true'); $('#dashboardLoading').hidden = false;
    window.setTimeout(() => {
      renderOverview(true); $('#dashboardRefresh').disabled = false; $('#dashboardOverview').setAttribute('aria-busy', 'false'); $('#dashboardLoading').hidden = true;
      $('#dashboardUpdated').textContent = 'Resumen de demostración actualizado';
      window.PCToast?.('Resumen actualizado con datos de demostración.', 'success');
    }, 650);
  });
  let detailTrigger;
  $('#dashboardRows').addEventListener('click', event => {
    const trigger = event.target.closest('[data-dashboard-detail]'); if (!trigger) return;
    const item = requests.find(item => item.code === trigger.dataset.dashboardDetail); if (!item) return;
    detailTrigger = trigger; $('#dashboardDetailTitle').textContent = item.code;
    const fields = $('#dashboardDetailFields'); fields.replaceChildren();
    [['Tipo', item.type], ['Oficina', item.office], ['Estado', item.state.name], ['Fecha', formatDate(item.date)]].forEach(([key, value]) => fields.append(element('dt', key), element('dd', value)));
    const current = item.state.name === 'Impresa' ? 3 : item.state.name === 'Lista para imprimir' ? 2 : item.state.name === 'Pendiente' ? 0 : 1;
    const steps = $('#dashboardDetailSteps'); steps.replaceChildren();
    ['Registro', 'Revisión', 'Preparación', 'Impresión'].forEach((label, i) => {
      const step = element('li'); const dot = element('span', i < current ? '✓' : String(i + 1)); dot.setAttribute('aria-hidden', 'true');
      step.append(dot, element('small', label)); if (i === current) step.setAttribute('aria-current', 'step'); if (i < current) step.classList.add('is-done'); steps.append(step);
    });
    $('#dashboardDetail').showModal();
  });
  $('#dashboardDetail').addEventListener('close', () => { if (detailTrigger?.isConnected) detailTrigger.focus(); });
  renderOverview();
})();

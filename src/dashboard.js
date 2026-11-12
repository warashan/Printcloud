/* Vista Centralizado de demostración: no consulta servicios ni modifica tarjetas reales. */
(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  if (!$('#dashboardOverview')) return;
  const M = globalThis.PCDashboardModel;
  const fixture = M.makeFixture();
  const settingsKey = 'printcloud-centralizado-settings-v1', utmKey = 'printcloud-centralizado-utm-v1';
  let settings = M.defaultSettings(), utm = { ...fixture.utm };
  try { const saved = JSON.parse(localStorage.getItem(settingsKey)); if (M.validateSettings(saved)) settings = saved; } catch (_) {}
  try {
    const saved = JSON.parse(localStorage.getItem(utmKey));
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) Object.entries(saved).forEach(([month, row]) => {
      if (M.validMonth(month) && Number.isInteger(row?.value) && row.value > 0 && row.value <= 10000000) {
        if (row.source === 'Referencia de captura · demo' && fixture.utm[month]?.value === row.value) return;
        utm[month] = { value: row.value, source: 'Ingresado en demo' };
      }
    });
  } catch (_) {}
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } };
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const number = value => Number(value).toLocaleString('es-CL', { maximumFractionDigits: 4 });
  const money = value => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
  const dateLabel = date => new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(M.parseDate(date));
  const shortDate = date => `${date.slice(8, 10)}/${date.slice(5, 7)}`;
  const monthLabel = month => new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(M.parseDate(`${month}-01`));
  const el = (tag, text, className) => {
    const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node;
  };
  const error = (id, message, focus) => { $(id).textContent = message; if (focus) focus.focus(); };
  let filters = { from: '2026-11-01', to: '2026-11-30', branch: '' }, summary;
  let trackingPage = 1, overduePage = 1, visibleOverdue = [], detailTrigger;
  const trackingSize = 6, overdueSize = 6;
  const pagination = (prefix, page, size, total) => {
    const pages = Math.max(1, Math.ceil(total / size));
    $(`#${prefix}Count`).textContent = `Mostrando ${total ? (page - 1) * size + 1 : 0}–${Math.min(page * size, total)} de ${total}`;
    $(`#${prefix}Page`).textContent = `${page} de ${pages}`;
    $(`#${prefix}Prev`).disabled = page <= 1; $(`#${prefix}Next`).disabled = page >= pages;
    $(`#${prefix}Count`).closest('.dashboard-table-footer').hidden = total === 0;
  };
  const renderTracking = () => {
    const rows = summary.tracking; trackingPage = Math.min(trackingPage, Math.max(1, Math.ceil(rows.length / trackingSize)));
    const body = $('#dashboardTrackingRows'); body.replaceChildren();
    rows.slice((trackingPage - 1) * trackingSize, trackingPage * trackingSize).forEach(item => {
      const row = el('tr'); row.append(el('td', dateLabel(item.date)), el('td', number(item.total)), el('td', number(item.printed)), el('td', number(item.enveloped)));
      const progress = el('td'), percent = item.total ? Math.round(item.printed / item.total * 100) : 0;
      const meter = el('progress'); meter.max = item.total || 1; meter.value = item.printed; meter.setAttribute('aria-label', `Impresas el ${dateLabel(item.date)}`);
      progress.append(meter, el('span', `${percent}%`, 'ops-progress-label')); row.append(progress); body.append(row);
    });
    $$('[data-tracking-metric]').forEach(node => { node.textContent = number(summary.tracked[node.dataset.trackingMetric]); });
    $('#dashboardTrackingEmpty').hidden = rows.length > 0;
    pagination('dashboardTracking', trackingPage, trackingSize, rows.length);
  };
  const svgElement = (tag, attrs = {}, text) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value)); if (text !== undefined) node.textContent = text; return node;
  };
  const renderDaily = () => {
    const series = summary.daily, width = Math.max(760, series.length * 22 + 70), height = 270;
    const left = 42, right = 15, top = 18, bottom = 38, chartHeight = height - top - bottom;
    const max = Math.max(0, ...series.flatMap(row => [row.printed, row.pending, row.waste]));
    const step = Math.max(1, Math.ceil(max / 4)), limit = max <= 1 ? 1 : step * 4;
    const svg = svgElement('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `Estado por fecha de recepción: ${summary.printed} impresas vigentes, ${summary.pending} pendientes y ${summary.waste} mermas oficiales. Datos completos en la tabla.` });
    svg.classList.add('ops-chart-svg'); svg.style.minWidth = `${width}px`;
    for (let value = 0; value <= limit; value += max <= 1 ? 1 : step) {
      const y = top + chartHeight - value / limit * chartHeight;
      svg.append(svgElement('line', { x1: left, x2: width - right, y1: y, y2: y, class: 'ops-chart-grid' }), svgElement('text', { x: left - 8, y: y + 4, 'text-anchor': 'end', class: 'ops-chart-tick' }, number(value)));
    }
    const groupWidth = (width - left - right) / series.length, barWidth = Math.min(13, groupWidth / 4.2);
    series.forEach((row, index) => {
      const x = left + index * groupWidth + groupWidth / 2;
      ['printed', 'pending', 'waste'].forEach((key, i) => {
        if (!row[key]) return;
        const h = row[key] / limit * chartHeight;
        const rect = svgElement('rect', { x: x + (i - 1.5) * barWidth, y: top + chartHeight - h, width: Math.max(1, barWidth - 1), height: h, rx: 2, class: `ops-chart-bar ops-color-${key}`, 'data-series': key });
        rect.append(svgElement('title', {}, `${dateLabel(row.date)}: ${row[key]} ${key === 'printed' ? 'impresas' : key === 'pending' ? 'pendientes' : 'mermas'}`)); svg.append(rect);
      });
      if (index % Math.max(1, Math.ceil(series.length / 15)) === 0) svg.append(svgElement('text', { x, y: height - 14, 'text-anchor': 'middle', class: 'ops-chart-tick' }, shortDate(row.date)));
    });
    $('#dashboardReceiptChart').replaceChildren(svg);
    const body = $('#dashboardDailyRows'); body.replaceChildren();
    series.forEach(item => { const row = el('tr'); row.append(el('td', dateLabel(item.date)), el('td', number(item.printed)), el('td', number(item.pending)), el('td', number(item.waste))); body.append(row); });
    $('#dashboardDailyTotal').textContent = `${number(summary.total)} solicitudes recibidas`;
    $('#dashboardDailyEmpty').hidden = summary.total > 0 || summary.waste > 0;
  };
  const renderBranches = () => {
    const chart = $('#dashboardBranchChart'), body = $('#dashboardBranchRows'); chart.replaceChildren(); body.replaceChildren();
    const max = Math.max(1, ...summary.branches.map(row => row.total));
    summary.branches.forEach(item => {
      const row = el('div', undefined, 'ops-branch-row'), bars = el('div', undefined, 'ops-branch-bars'); bars.setAttribute('aria-hidden', 'true');
      ['total', 'pending'].forEach(key => { const track = el('div', undefined, 'ops-branch-track'), fill = el('span', undefined, `ops-branch-fill ops-color-${key}`); fill.style.width = `${item[key] / max * 100}%`; track.append(fill); bars.append(track); });
      row.append(el('span', item.branch, 'ops-branch-label'), bars, el('span', `${item.total} / ${item.pending}`, 'ops-branch-value'));
      row.setAttribute('aria-label', `${item.branch}: ${item.total} solicitudes, ${item.pending} pendientes`); chart.append(row);
      const tableRow = el('tr'); tableRow.append(el('td', item.branch), el('td', number(item.total)), el('td', number(item.pending))); body.append(tableRow);
    });
  };
  const renderOverdue = () => {
    const term = normalize($('#dashboardSearch').value.trim());
    visibleOverdue = summary.overdue.filter(row => [row.request.code, row.request.branch].some(value => normalize(value).includes(term)));
    overduePage = Math.min(overduePage, Math.max(1, Math.ceil(visibleOverdue.length / overdueSize)));
    $('#dashboardOverdueBadge').textContent = `${number(summary.overdue.length)} ${summary.overdue.length === 1 ? 'solicitud' : 'solicitudes'}`;
    const body = $('#dashboardOverdueRows'); body.replaceChildren();
    visibleOverdue.slice((overduePage - 1) * overdueSize, overduePage * overdueSize).forEach(item => {
      const row = el('tr'), code = el('td'); code.append(el('strong', item.request.code, 'table-strong'), el('small', item.request.branch, 'dashboard-row-type'));
      const delay = el('td'); delay.append(el('span', `${number(item.days)} ${item.days === 1 ? 'día' : 'días'}`, 'badge badge-danger'));
      const amount = el('td'); amount.append(el('strong', `${number(item.amount)} UTM`), el('small', item.clp === null ? 'Conversión pendiente' : money(item.clp), 'dashboard-row-type'));
      const action = el('td'), button = el('button', 'Ver detalle', 'dashboard-detail-button'); button.type = 'button'; button.dataset.dashboardDetail = item.request.code; button.setAttribute('aria-label', `Ver detalle de ${item.request.code}`); action.append(button);
      row.append(code, el('td', dateLabel(item.request.received)), el('td', dateLabel(item.due)), delay, amount, action); body.append(row);
    });
    $('#dashboardOverdueTable').closest('.data-wrap').hidden = !visibleOverdue.length;
    $('#dashboardOverdueEmpty').hidden = visibleOverdue.length > 0;
    $('#dashboardOverdueEmpty strong').textContent = summary.overdue.length && !visibleOverdue.length ? 'No hay coincidencias para la búsqueda.' : 'No hay solicitudes pendientes atrasadas.';
    $('#dashboardOverdueEmptyHint').textContent = summary.overdue.length ? 'Prueba con otro código o sucursal.' : 'Puedes ampliar el rango con «Últimos 90 días» para explorar otros estados de la demostración.';
    $('#dashboardExport').disabled = !visibleOverdue.length;
    pagination('dashboardOverdue', overduePage, overdueSize, visibleOverdue.length);
  };
  const renderUtm = () => {
    const body = $('#dashboardUtmRows'); body.replaceChildren();
    Object.entries(utm).sort(([a], [b]) => a.localeCompare(b)).forEach(([month, row]) => {
      const tr = el('tr'), action = el('td'), button = el('button', 'Editar', 'dashboard-detail-button'); button.type = 'button'; button.dataset.utmEdit = month; button.setAttribute('aria-label', `Editar UTM de ${monthLabel(month)}`); action.append(button);
      tr.append(el('td', monthLabel(month)), el('td', money(row.value)), el('td', row.source), action); body.append(tr);
    });
  };
  const render = (announce = false) => {
    summary = M.buildSummary(fixture, filters, settings, utm, $('#dashboardScenario').value === 'empty');
    $('#dashboardRange').textContent = `${dateLabel(filters.from)} – ${dateLabel(filters.to)}`;
    $$('[data-dashboard-metric]').forEach(node => { const key = node.dataset.dashboardMetric; node.textContent = key === 'fine' ? `${number(summary.totalFine)} UTM` : number(summary[key]); });
    $('#dashboardMetricNote-stock').textContent = `Stock actual${filters.branch ? ` de ${filters.branch}` : ''}, independiente del rango`;
    $('#dashboardMetricNote-fine').textContent = summary.clp === null ? 'Equivalente en CLP: conversión pendiente' : `Equivalente: ${money(summary.clp)} CLP`;
    $('#dashboardConversionAlert').hidden = !summary.missingMonths.length;
    $('#dashboardConversionNote').textContent = summary.missingMonths.length ? `Falta un valor UTM de demostración para ${summary.missingMonths.map(monthLabel).join(', ')}. Las multas en UTM sí están calculadas.` : '';
    renderTracking(); renderDaily(); renderBranches(); renderOverdue(); renderUtm();
    if (announce) $('#dashboardStatus').textContent = `Resumen actualizado: ${summary.total} solicitudes, ${summary.pending} pendientes y ${summary.overdue.length} con atraso. ${filters.branch || 'Todas las sucursales'}.`;
  };
  const applyFilters = () => {
    const from = $('#dashboardFrom').value, to = $('#dashboardTo').value;
    if (!M.parseDate(from)) { error('#dashboardFilterError', 'Selecciona una fecha inicial válida.', $('#dashboardFrom')); return false; }
    if (!M.parseDate(to) || to < from) { error('#dashboardFilterError', 'La fecha final debe ser igual o posterior a la inicial.', $('#dashboardTo')); return false; }
    if ((M.parseDate(to) - M.parseDate(from)) / 86400000 > 365) { error('#dashboardFilterError', 'Selecciona un rango de hasta 366 días.', $('#dashboardTo')); return false; }
    $('#dashboardFilterError').textContent = ''; filters = { from, to, branch: $('#dashboardOffice').value }; trackingPage = 1; overduePage = 1; render(true); return true;
  };
  fixture.branches.forEach(branch => { const option = el('option', branch); option.value = branch; $('#dashboardOffice').append(option); });
  $('#dashboardFilters').addEventListener('submit', event => { event.preventDefault(); applyFilters(); });
  $('#dashboardCurrentMonth').addEventListener('click', () => { $('#dashboardFrom').value = '2026-11-01'; $('#dashboardTo').value = '2026-11-30'; applyFilters(); });
  $('#dashboardLast90').addEventListener('click', () => { $('#dashboardFrom').value = M.shiftDate(fixture.asOf, -89); $('#dashboardTo').value = fixture.asOf; applyFilters(); });
  $('#dashboardScenario').addEventListener('change', () => { trackingPage = 1; overduePage = 1; render(true); });
  $('#dashboardSearch').addEventListener('input', () => { overduePage = 1; renderOverdue(); });
  [['dashboardTracking', () => trackingPage, value => { trackingPage = value; }, renderTracking], ['dashboardOverdue', () => overduePage, value => { overduePage = value; }, renderOverdue]].forEach(([prefix, get, set, draw]) => {
    ['Prev', 'Next'].forEach(direction => $(`#${prefix}${direction}`).addEventListener('click', () => { set(get() + (direction === 'Next' ? 1 : -1)); draw(); if ($(`#${prefix}${direction}`).disabled) $(`#${prefix}${direction === 'Next' ? 'Prev' : 'Next'}`).focus(); }));
  });
  const populateSettings = () => { $('#dashboardSlaDays').value = settings.days; $('#dashboardSlaRate').value = settings.rate; $('#dashboardHolidays').value = settings.holidays.join('\n'); $('#dashboardConversion').value = settings.conversion; };
  $('#dashboardSlaForm').addEventListener('submit', event => {
    event.preventDefault();
    const days = Number($('#dashboardSlaDays').value), rate = Number($('#dashboardSlaRate').value);
    const holidays = [...new Set($('#dashboardHolidays').value.split(/\r?\n/).map(value => value.trim()).filter(Boolean))];
    if (!$('#dashboardSlaDays').value || !Number.isInteger(days) || days < 1 || days > 365) { error('#dashboardSlaError', 'Ingresa un plazo entre 1 y 365 días hábiles.', $('#dashboardSlaDays')); return; }
    if (!$('#dashboardSlaRate').value || !Number.isFinite(rate) || rate < 0 || rate > 100) { error('#dashboardSlaError', 'Ingresa una tarifa diaria entre 0 y 100 UTM.', $('#dashboardSlaRate')); return; }
    if (holidays.length > 366 || holidays.some(date => !M.parseDate(date))) { error('#dashboardSlaError', 'Revisa los feriados. Usa fechas reales en formato AAAA-MM-DD, una por línea.', $('#dashboardHolidays')); return; }
    const candidate = { days, rate, holidays, conversion: $('#dashboardConversion').value }; if (!M.validateSettings(candidate)) return;
    settings = candidate; const saved = save(settingsKey, settings); $('#dashboardSlaError').textContent = ''; render(true);
    $('#dashboardSlaStatus').textContent = saved ? 'Configuración guardada en este navegador.' : 'Configuración aplicada en esta pestaña; el navegador no permitió guardarla.';
    window.PCToast?.('Configuración de demostración actualizada.', 'success');
  });
  $('#dashboardSlaReset').addEventListener('click', () => { settings = M.defaultSettings(); const saved = save(settingsKey, settings); populateSettings(); $('#dashboardSlaError').textContent = ''; $('#dashboardSlaStatus').textContent = saved ? 'Parámetros de demostración restablecidos.' : 'Parámetros restablecidos en esta pestaña.'; render(true); });
  $('#dashboardUtmForm').addEventListener('submit', event => {
    event.preventDefault(); const month = $('#dashboardUtmMonth').value, value = Number($('#dashboardUtmValue').value);
    if (!M.validMonth(month)) { error('#dashboardUtmError', 'Selecciona un mes válido.', $('#dashboardUtmMonth')); return; }
    if (!$('#dashboardUtmValue').value || !Number.isInteger(value) || value < 1 || value > 10000000) { error('#dashboardUtmError', 'Ingresa un valor entero entre $1 y $10.000.000 CLP.', $('#dashboardUtmValue')); return; }
    utm[month] = { value, source: 'Ingresado en demo' }; const saved = save(utmKey, Object.fromEntries(Object.entries(utm).filter(([, row]) => row.source === 'Ingresado en demo'))); $('#dashboardUtmError').textContent = ''; render(true);
    $('#dashboardUtmStatus').textContent = saved ? `UTM de ${monthLabel(month)} guardada en este navegador.` : 'UTM aplicada en esta pestaña; no se pudo guardar en el navegador.';
    window.PCToast?.('Valor UTM de demostración actualizado.', 'success');
  });
  $('#dashboardUtmRows').addEventListener('click', event => { const button = event.target.closest('[data-utm-edit]'); if (!button) return; $('#dashboardUtmMonth').value = button.dataset.utmEdit; $('#dashboardUtmValue').value = utm[button.dataset.utmEdit].value; $('#dashboardUtmValue').focus(); });
  $('#dashboardCompleteUtm').addEventListener('click', () => { $('#dashboardUtmPanel').open = true; $('#dashboardUtmMonth').value = summary.missingMonths[0]; $('#dashboardUtmValue').value = ''; $('#dashboardUtmValue').focus(); });
  $('#dashboardRefresh').addEventListener('click', () => {
    $('#dashboardRefresh').disabled = true; $('#dashboardRefresh').classList.add('is-loading'); $('#dashboardOverview').setAttribute('aria-busy', 'true'); $('#dashboardStatus').textContent = 'Actualizando resumen de demostración.';
    window.setTimeout(() => { render(true); $('#dashboardRefresh').disabled = false; $('#dashboardRefresh').classList.remove('is-loading'); $('#dashboardOverview').setAttribute('aria-busy', 'false'); window.PCToast?.('Resumen Centralizado actualizado con datos de demostración.', 'success'); }, 500);
  });
  $('#dashboardExport').addEventListener('click', () => {
    if (!visibleOverdue.length) return;
    const cell = value => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [['Solicitud', 'Sucursal', 'Recepción', 'Vencimiento', 'Atraso hábil', 'Multa UTM', 'Mes UTM', 'Equivalente CLP'], ...visibleOverdue.map(row => [row.request.code, row.request.branch, row.request.received, row.due, row.days, row.amount, row.month, row.clp === null ? 'Conversión pendiente' : row.clp])];
    const blob = new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob), link = el('a'); link.href = url; link.download = 'PrintCloud-pendientes-centralizado-demo.csv'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    window.PCToast?.(`Exportadas ${visibleOverdue.length} solicitudes de demostración.`, 'success');
  });
  $('#dashboardOverdueRows').addEventListener('click', event => {
    const trigger = event.target.closest('[data-dashboard-detail]'); if (!trigger) return;
    const row = summary.overdue.find(row => row.request.code === trigger.dataset.dashboardDetail); if (!row) return;
    detailTrigger = trigger; $('#dashboardDetailTitle').textContent = row.request.code;
    const request = row.request, state = M.physicalState(request, fixture.asOf), fields = $('#dashboardDetailFields'); fields.replaceChildren();
    [['Tipo', request.type], ['Sucursal', request.branch], ['Solicitud', dateLabel(request.requested)], ['Recepción', dateLabel(request.received)], ['Tarjeta', state.printed ? 'Impresa vigente' : 'Pendiente de tarjeta vigente'], ['Vencimiento', dateLabel(row.due)], ['Atraso hábil', `${row.days} días`], ['Estimación', `${number(row.amount)} UTM`], ['Mes de conversión', monthLabel(row.month)], ['Equivalente CLP', row.clp === null ? 'Conversión pendiente' : money(row.clp)]].forEach(([key, value]) => fields.append(el('dt', key), el('dd', value)));
    const steps = $('#dashboardDetailSteps'); steps.replaceChildren(); const current = state.enveloped ? 2 : state.printed ? 1 : 0;
    ['Solicitud', 'Impresión', 'Ensobrado'].forEach((label, index) => { const step = el('li'); step.append(el('span', index < current ? '✓' : String(index + 1)), el('small', label)); if (index === current) step.setAttribute('aria-current', 'step'); if (index < current) step.classList.add('is-done'); steps.append(step); });
    $('#dashboardDetail').showModal();
  });
  $('#dashboardDetail').addEventListener('close', () => { if (detailTrigger?.isConnected) detailTrigger.focus(); });
  populateSettings(); render();
})();

/* Modelo puro del escenario Centralizado. No implementa reglas contractuales productivas. */
(() => {
  const DAY = 86400000;
  const iso = date => date.toISOString().slice(0, 10);
  const parseDate = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && iso(date) === value ? date : null;
  };
  const shiftDate = (value, days) => iso(new Date(parseDate(value).getTime() + days * DAY));
  const isBusinessDay = (date, holidays = []) => {
    const day = parseDate(date)?.getUTCDay();
    return day !== undefined && day !== 0 && day !== 6 && !holidays.includes(date);
  };
  const addBusinessDays = (from, quantity, holidays = []) => {
    if (!parseDate(from) || !Number.isInteger(quantity) || quantity < 0 || quantity > 365) throw new Error('Plazo inválido');
    let date = from, count = 0;
    while (count < quantity) { date = shiftDate(date, 1); if (isBusinessDay(date, holidays)) count++; }
    return date;
  };
  const businessDaysBetween = (from, to, holidays = []) => {
    if (!parseDate(from) || !parseDate(to) || from >= to) return 0;
    let days = 0;
    for (let date = shiftDate(from, 1); date <= to; date = shiftDate(date, 1)) if (isBusinessDay(date, holidays)) days++;
    return days;
  };
  const normalizeId = value => String(value || '').trim().toUpperCase();
  const physicalState = (request, asOf) => {
    const card = request.card;
    const printed = Boolean(card && card.active && card.folio && normalizeId(card.requestId) === normalizeId(request.code)
      && ['assigned', 'enveloped'].includes(card.status) && parseDate(card.assignedAt) && card.assignedAt <= asOf);
    const enveloped = Boolean(printed && card.status === 'enveloped' && card.envelopeId
      && request.envelope?.id === card.envelopeId && normalizeId(request.envelope.member) === normalizeId(request.code)
      && parseDate(card.envelopedAt) && card.envelopedAt >= card.assignedAt && card.envelopedAt <= asOf);
    return { printed, enveloped, pending: !printed };
  };
  const defaultSettings = () => ({ days: 20, rate: 1, holidays: [], conversion: 'application' });
  const validateSettings = value => Boolean(value && Number.isInteger(value.days) && value.days >= 1 && value.days <= 365
    && Number.isFinite(value.rate) && value.rate >= 0 && value.rate <= 100
    && Array.isArray(value.holidays) && value.holidays.length <= 366 && value.holidays.every(date => Boolean(parseDate(date)))
    && ['application', 'received', 'deadline'].includes(value.conversion));
  const validMonth = value => typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  const lateInfo = (request, asOf, settings, utm) => {
    const due = addBusinessDays(request.received, settings.days, settings.holidays);
    const days = physicalState(request, asOf).pending ? businessDaysBetween(due, asOf, settings.holidays) : 0;
    const amount = Math.round(days * settings.rate * 10000) / 10000;
    const month = (settings.conversion === 'received' ? request.received : settings.conversion === 'deadline' ? due : asOf).slice(0, 7);
    const rate = utm[month]?.value;
    const clp = amount === 0 ? 0 : Number.isFinite(rate) && rate > 0 ? Math.round(amount * rate) : null;
    return { due, days, amount, month, clp };
  };
  const makeFixture = () => {
    const asOf = '2026-11-12';
    const branches = ['Antofagasta', 'Concepción', 'Coquimbo', 'La Serena', 'Ovalle', 'Puerto Montt', 'Santiago Demo', 'Talca', 'Valdivia', 'Valparaíso', 'Valparaíso Demo', 'Viña del Mar'];
    const stock = [45, 62, 38, 44, 29, 63, 90, 46, 52, 72, 40, 83];
    const requests = [], waste = [];
    for (let offset = 0; offset < 60; offset++) {
      const received = shiftDate(asOf, -offset);
      for (let n = 0; n < 2 + offset % 4; n++) {
        const index = requests.length;
        const code = `CEN-2026-${String(index + 1).padStart(4, '0')}`;
        const branch = branches[(offset * 3 + n) % branches.length];
        const request = { code, branch, requested: shiftDate(received, -(index % 3)), received,
          type: index % 2 ? 'Reposición' : 'Solicitud nueva', card: null, envelope: null };
        const state = index % 6;
        if ([1, 2, 3, 5].includes(state)) {
          request.card = { folio: `TNE-${String(800000 + index)}`, active: true, requestId: state === 5 ? 'OTRA-SOLICITUD' : code,
            status: state === 2 ? 'enveloped' : 'assigned', assignedAt: received };
          if (state === 2) {
            request.card.envelopeId = `SOB-${index}`; request.card.envelopedAt = received;
            request.envelope = { id: `SOB-${index}`, member: ` ${code.toLowerCase()} ` };
          }
        }
        if (state === 4) {
          request.card = { folio: `TNE-${800000 + index}`, active: false, requestId: code, status: 'waste', assignedAt: received };
          waste.push({ requestId: code, branch, date: received < shiftDate(asOf, -2) ? shiftDate(received, 2) : asOf, folio: request.card.folio });
        }
        requests.push(request);
      }
    }
    const values = [69751, 69611, 69889, 69889, 70588, 71506, 71649, 71649, 71721, 72151];
    const utm = Object.fromEntries(values.map((value, index) => [`2026-${String(index + 1).padStart(2, '0')}`, { value, source: 'Referencia de captura · demo' }]));
    return { asOf, branches, stock, requests, waste, utm };
  };
  const buildSummary = (fixture, filters, settings, utm, empty = false) => {
    if (!parseDate(filters.from) || !parseDate(filters.to) || filters.to < filters.from
      || (parseDate(filters.to) - parseDate(filters.from)) / DAY > 365) throw new Error('Rango de fechas inválido');
    const matchesBranch = row => !filters.branch || row.branch === filters.branch;
    const inRange = date => date >= filters.from && date <= filters.to;
    const requests = empty ? [] : fixture.requests;
    const received = requests.filter(row => matchesBranch(row) && inRange(row.received));
    const tracked = requests.filter(row => matchesBranch(row) && inRange(row.requested));
    const waste = empty ? [] : fixture.waste.filter(row => matchesBranch(row) && inRange(row.date));
    const stats = rows => rows.reduce((out, row) => {
      const state = physicalState(row, fixture.asOf); out.total++; out.printed += Number(state.printed); out.enveloped += Number(state.enveloped); out.pending += Number(state.pending); return out;
    }, { total: 0, printed: 0, enveloped: 0, pending: 0 });
    const daily = [];
    for (let date = filters.from; date <= filters.to; date = shiftDate(date, 1)) {
      const stat = stats(received.filter(row => row.received === date));
      daily.push({ date, ...stat, waste: waste.filter(row => row.date === date).length });
    }
    const tracking = [...new Set(tracked.map(row => row.requested))].sort().reverse().map(date => ({ date, ...stats(tracked.filter(row => row.requested === date)) }));
    const branches = fixture.branches.filter(branch => !filters.branch || branch === filters.branch).map(branch => ({ branch, ...stats(received.filter(row => row.branch === branch)) }));
    const overdue = received.map(request => ({ request, ...lateInfo(request, fixture.asOf, settings, utm) })).filter(row => row.days > 0).sort((a, b) => b.days - a.days || a.request.code.localeCompare(b.request.code));
    const totalFine = Math.round(overdue.reduce((sum, row) => sum + row.amount, 0) * 10000) / 10000;
    const missingMonths = [...new Set(overdue.filter(row => row.clp === null).map(row => row.month))];
    return { received, ...stats(received), stock: fixture.stock.reduce((sum, value, index) => sum + (!filters.branch || fixture.branches[index] === filters.branch ? value : 0), 0), waste: waste.length,
      tracked: stats(tracked), tracking, daily, branches, overdue, totalFine, missingMonths,
      clp: missingMonths.length ? null : overdue.reduce((sum, row) => sum + row.clp, 0) };
  };
  globalThis.PCDashboardModel = Object.freeze({ iso, parseDate, shiftDate, isBusinessDay, addBusinessDays, businessDaysBetween, physicalState, defaultSettings, validateSettings, validMonth, lateInfo, makeFixture, buildSummary });
})();

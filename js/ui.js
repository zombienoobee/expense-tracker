// ─── UI Controller — v2.0.0 ───────────────────────────────────────────────────
// Sprint 2: Dashboard with charts, Entries tab, 5-tab nav

const MONTHS     = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUSES = {
  paid:      { label: 'Paid',      class: 'status-paid',      next: 'scheduled' },
  scheduled: { label: 'Scheduled', class: 'status-scheduled', next: 'pending'   },
  pending:   { label: 'Pending',   class: 'status-pending',   next: 'cancelled' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled', next: 'na'        },
  na:        { label: 'N/A',       class: 'status-na',        next: 'paid'      },
};

const CAT_COLORS = {
  groceries_food: '#c8a96e',
  subscriptions:  '#6b9fd4',
  auto_transport: '#8fbf8a',
  health_copay:   '#d46b6b',
  utilities_tech: '#9b8fd4',
  charity_giving: '#d4a46b',
  housing:        '#6bbfd4',
  home_personal:  '#d46b9b',
};

const APP_VERSION = 'v2.0.0';
const APP_DATE    = '2026-05-10';

let _state = {
  view:         'dashboard',
  year:         2026,
  month:        new Date().getMonth(),
  filterModule: 'all',
};

let _charts = { donut: null, bar: null };

// ── Show/hide screens ─────────────────────────────────────────────────────────
function showSignIn() {
  document.getElementById('screen-signin').style.display = 'flex';
  document.getElementById('screen-app').style.display   = 'none';
}

function showApp() {
  document.getElementById('screen-signin').style.display = 'none';
  document.getElementById('screen-app').style.display    = 'block';
  renderAll();
}

// ── Master render ─────────────────────────────────────────────────────────────
function renderAll() {
  renderSummaryCards();
  renderNav();
  renderCurrentView();
}

// ── Summary cards (always visible) ───────────────────────────────────────────
function renderSummaryCards() {
  const entries  = window.AppDrive.getExpenses();
  const monthStr = `${_state.year}-${String(_state.month + 1).padStart(2,'0')}`;
  const active   = entries.filter(e =>
    e.date === monthStr && e.amount && e.status !== 'na' && e.status !== 'cancelled'
  );
  const personal  = active.filter(e => e.module === 'personal' ).reduce((s,e) => s+(e.amount||0), 0);
  const household = active.filter(e => e.module === 'household').reduce((s,e) => s+(e.amount||0), 0);
  const ytd = entries.filter(e => {
    const [y,m] = e.date.split('-').map(Number);
    return y === _state.year && m <= (_state.month+1) && e.amount && e.status !== 'na' && e.status !== 'cancelled';
  }).reduce((s,e) => s+(e.amount||0), 0);

  const fmt = n => '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById('card-personal').textContent  = fmt(personal);
  document.getElementById('card-household').textContent = fmt(household);
  document.getElementById('card-total').textContent     = fmt(personal+household);
  document.getElementById('card-ytd').textContent       = fmt(ytd);
  document.getElementById('month-label').textContent    = MONTHS[_state.month]+' '+_state.year;
}

// ── Route to current view ─────────────────────────────────────────────────────
function renderCurrentView() {
  // Hide ALL views first
  ['view-dashboard','view-entries','view-personal','view-household','view-settings']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

  // Show only the active view
  const active = document.getElementById('view-' + _state.view);
  if (active) active.style.display = 'block';

  // Render content for active view
  switch (_state.view) {
    case 'dashboard':  renderDashboard();        break;
    case 'entries':    renderEntries('all');      break;
    case 'personal':   renderEntries('personal'); break;
    case 'household':  renderEntries('household');break;
    case 'settings':   renderSettings();          break;
  }
}

// ── Dashboard — charts ────────────────────────────────────────────────────────
function renderDashboard() {
  const entries = window.AppDrive.getExpenses();
  renderDonutChart(entries);
  renderBarChart(entries);
}

function renderDonutChart(entries) {
  const monthStr = `${_state.year}-${String(_state.month+1).padStart(2,'0')}`;
  const active   = entries.filter(e =>
    e.date === monthStr && e.amount > 0 && e.status !== 'na' && e.status !== 'cancelled'
  );

  // Aggregate by category
  const catTotals = {};
  active.forEach(e => {
    catTotals[e.category] = (catTotals[e.category]||0) + (e.amount||0);
  });

  const cats   = Object.keys(catTotals).filter(k => catTotals[k] > 0);
  const values = cats.map(k => catTotals[k]);
  const colors = cats.map(k => CAT_COLORS[k] || '#888');
  const labels = cats.map(k => (window.CATEGORIES[k]||{label:k}).label);
  const total  = values.reduce((s,v) => s+v, 0);

  const canvas = document.getElementById('chart-donut');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (_charts.donut) { _charts.donut.destroy(); _charts.donut = null; }

  _charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderColor: '#0f0f0f', borderWidth: 3, hoverOffset: 6 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: $${ctx.raw.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} (${((ctx.raw/total)*100).toFixed(1)}%)`
          },
          backgroundColor: '#1a1a1a',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0ece4',
          bodyColor: '#9a9690',
          padding: 10,
        }
      }
    }
  });

  // Render legend
  const legend = document.getElementById('donut-legend');
  if (!legend) return;
  legend.innerHTML = cats.map((k,i) => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${colors[i]}"></span>
      <span class="legend-label">${labels[i]}</span>
      <span class="legend-val">$${values[i].toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
    </div>`).join('');
}

function renderBarChart(entries) {
  const canvas = document.getElementById('chart-bar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Monthly totals for the year — exclude cancelled/na
  const monthlyData = MONTHS_SHORT.map((_, mi) => {
    const ms = `${_state.year}-${String(mi+1).padStart(2,'0')}`;
    return entries
      .filter(e => e.date === ms && e.amount > 0 && e.status !== 'na' && e.status !== 'cancelled')
      .reduce((s,e) => s+(e.amount||0), 0);
  });

  // Split personal vs household
  const personalData = MONTHS_SHORT.map((_, mi) => {
    const ms = `${_state.year}-${String(mi+1).padStart(2,'0')}`;
    return entries
      .filter(e => e.date === ms && e.module === 'personal' && e.amount > 0 && e.status !== 'na' && e.status !== 'cancelled')
      .reduce((s,e) => s+(e.amount||0), 0);
  });
  const householdData = MONTHS_SHORT.map((_, mi) => {
    const ms = `${_state.year}-${String(mi+1).padStart(2,'0')}`;
    return entries
      .filter(e => e.date === ms && e.module === 'household' && e.amount > 0 && e.status !== 'na' && e.status !== 'cancelled')
      .reduce((s,e) => s+(e.amount||0), 0);
  });

  if (_charts.bar) { _charts.bar.destroy(); _charts.bar = null; }

  _charts.bar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS_SHORT,
      datasets: [
        {
          label: 'Personal',
          data: personalData,
          backgroundColor: 'rgba(107,159,212,0.75)',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Household',
          data: householdData,
          backgroundColor: 'rgba(143,191,138,0.75)',
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          stacked: true,
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#5a5754', font: { size: 11, family: 'DM Sans' } },
        },
        y: {
          stacked: true,
          grid: { color: 'rgba(255,255,255,0.06)' },
          ticks: {
            color: '#5a5754',
            font: { size: 11, family: 'DM Mono' },
            callback: v => '$'+v.toLocaleString()
          },
          border: { dash: [4,4] }
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: { color: '#9a9690', font: { size: 11, family: 'DM Sans' }, boxWidth: 10, boxHeight: 10, borderRadius: 3, useBorderRadius: true, padding: 16 }
        },
        tooltip: {
          backgroundColor: '#1a1a1a',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0ece4',
          bodyColor: '#9a9690',
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`
          }
        }
      }
    }
  });
}

// ── Entries list ──────────────────────────────────────────────────────────────
function renderEntries(moduleFilter) {
  const listId  = 'list-'+_state.view;
  const list    = document.getElementById(listId);
  if (!list) return;

  const entries  = window.AppDrive.getExpenses();
  const monthStr = `${_state.year}-${String(_state.month+1).padStart(2,'0')}`;
  let filtered   = entries.filter(e => e.date === monthStr);

  if (moduleFilter !== 'all') filtered = filtered.filter(e => e.module === moduleFilter);
  if (_state.filterModule !== 'all' && _state.view === 'entries')
    filtered = filtered.filter(e => e.module === _state.filterModule);

  // Show all meaningful entries
  filtered = filtered.filter(e =>
    e.amount > 0 || e.status === 'paid' || e.status === 'scheduled' ||
    e.status === 'cancelled' || e.status === 'na' || e.notes
  );

  if (!filtered.length) {
    list.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--color-text-tertiary);font-size:13px;">No entries for ${MONTHS[_state.month]}</div>`;
    return;
  }

  const grouped = {};
  filtered.forEach(e => { if(!grouped[e.category]) grouped[e.category]=[]; grouped[e.category].push(e); });

  let html = '';
  Object.entries(grouped).forEach(([cat, items]) => {
    const catInfo  = window.CATEGORIES[cat] || { label:cat, icon:'ti-circle' };
    const catTotal = items.filter(e => e.status !== 'cancelled' && e.status !== 'na').reduce((s,e) => s+(e.amount||0),0);
    const dotColor = CAT_COLORS[cat] || '#888';
    html += `<div class="cat-group">
      <div class="cat-group-header">
        <span><span class="cat-dot" style="background:${dotColor}"></span>${catInfo.label}</span>
        <span>$${catTotal.toFixed(2)}</span>
      </div>`;
    items.forEach(e => {
      const st  = STATUSES[e.status] || STATUSES.pending;
      const mod = e.module === 'household'
        ? '<span class="mod-tag mod-household">household</span>'
        : '<span class="mod-tag mod-personal">personal</span>';
      const amt = e.amount > 0 ? '$'+e.amount.toFixed(2) : '—';
      html += `<div class="expense-row" data-id="${e.id}">
        <div class="expense-name">${e.name} ${mod}</div>
        <div class="expense-right">
          <span class="expense-amt">${amt}</span>
          <span class="status-pill ${st.class}" onclick="cycleStatus('${e.id}')" title="Tap to cycle">${st.label}</span>
          <button class="edit-btn" onclick="openEdit('${e.id}')" aria-label="Edit ${e.name}"><i class="ti ti-edit"></i></button>
        </div>
      </div>`;
    });
    html += '</div>';
  });
  list.innerHTML = html;
}

// ── Settings ──────────────────────────────────────────────────────────────────
function renderSettings() {
  const el = document.getElementById('view-settings');
  if (!el) return;
  const meta    = window.AppDrive.getMeta();
  const entries = window.AppDrive.getExpenses();
  const lastSync = meta.last_sync ? new Date(meta.last_sync).toLocaleString() : 'Never';
  el.innerHTML = `
    <div class="settings-wrap">
      <div class="settings-section">
        <div class="settings-label">App</div>
        <div class="settings-row"><span>Name</span><span>Mizaniya</span></div>
        <div class="settings-row"><span>Version</span><span class="settings-val">${APP_VERSION}</span></div>
        <div class="settings-row"><span>Released</span><span>${APP_DATE}</span></div>
        <div class="settings-row"><span>Last synced</span><span>${lastSync}</span></div>
      </div>
      <div class="settings-section">
        <div class="settings-label">Data</div>
        <div class="settings-row"><span>Total entries</span><span>${entries.length}</span></div>
        <div class="settings-row"><span>Paid entries</span><span>${entries.filter(e=>e.status==='paid').length}</span></div>
        <div class="settings-row"><span>Years tracked</span><span>${(meta.years||[2026]).join(', ')}</span></div>
        <div class="settings-row"><span>Storage</span><span>Google Drive</span></div>
      </div>
      <div class="settings-section">
        <div class="settings-label">Version history</div>
        <div class="settings-row ver-row"><span>v2.0.0</span><span>Sprint 2 — dashboard charts, 5-tab nav</span></div>
        <div class="settings-row ver-row"><span>v1.3.0</span><span>All entries visible, working nav, settings</span></div>
        <div class="settings-row ver-row"><span>v1.2.0</span><span>5 statuses, status picker in edit modal</span></div>
        <div class="settings-row ver-row"><span>v1.1.0</span><span>Security hardening, zero data in code</span></div>
        <div class="settings-row ver-row"><span>v1.0.0</span><span>Sprint 1 — initial launch</span></div>
      </div>
      <div class="settings-section">
        <div class="settings-label">Account</div>
        <div class="settings-row"><span>Session</span>
          <button class="settings-btn-danger" onclick="window.AppAuth.signOut()">Sign out</button>
        </div>
      </div>
    </div>`;
}

// ── Renewal alerts ────────────────────────────────────────────────────────────
function renderRenewalAlerts() {
  const recurring    = window.AppDrive.getRecurring();
  const currentMonth = _state.month + 1;
  const alerts       = recurring.filter(r => r.renewal_month === currentMonth && r.active);
  const container    = document.getElementById('renewal-alerts');
  if (!container) return;
  if (!alerts.length) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  container.innerHTML = `<div class="alerts-label"><i class="ti ti-bell" aria-hidden="true"></i> Renewal decisions due this month</div>` +
    alerts.map(r => `<div class="alert-item">
      <span>${r.name}</span>
      <span class="alert-amt">$${r.amount.toFixed(2)}/yr</span>
      <button class="alert-btn renew"  onclick="setRenewal('${r.id}',true)">Renew</button>
      <button class="alert-btn cancel" onclick="setRenewal('${r.id}',false)">Cancel</button>
    </div>`).join('');
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function renderNav() {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const a = document.querySelector(`.nav-btn[data-view="${_state.view}"]`);
  if (a) a.classList.add('active');
}

function setView(view) {
  _state.view         = view;
  _state.filterModule = 'all';
  renderAll();
  renderRenewalAlerts();
}

// ── Status cycle ──────────────────────────────────────────────────────────────
async function cycleStatus(id) {
  const entry = window.AppDrive.getExpenses().find(e => e.id === id);
  if (!entry) return;
  await window.AppDrive.updateEntry(id, { status: (STATUSES[entry.status]||STATUSES.pending).next });
  renderAll();
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function openEdit(id) {
  const entry = window.AppDrive.getExpenses().find(e => e.id === id);
  if (!entry) return;
  document.getElementById('edit-id').value     = id;
  document.getElementById('edit-name').value   = entry.name;
  document.getElementById('edit-amount').value = entry.amount ?? '';
  document.getElementById('edit-notes').value  = entry.notes  || '';
  document.getElementById('edit-status').value = entry.status || 'pending';
  document.getElementById('edit-modal').style.display = 'flex';
}

async function saveEdit() {
  const id     = document.getElementById('edit-id').value;
  const amount = parseFloat(document.getElementById('edit-amount').value);
  const notes  = document.getElementById('edit-notes').value.trim();
  const status = document.getElementById('edit-status').value;
  await window.AppDrive.updateEntry(id, {
    amount: isNaN(amount) ? null : amount,
    notes:  notes || null,
    status,
  });
  closeEdit();
  renderAll();
}

function closeEdit() { document.getElementById('edit-modal').style.display = 'none'; }

// ── Other ─────────────────────────────────────────────────────────────────────
function changeMonth(delta) {
  _state.month = (_state.month + delta + 12) % 12;
  renderAll();
  renderRenewalAlerts();
}

function setFilter(module) {
  _state.filterModule = module;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`.filter-btn[data-mod="${module}"]`);
  if (btn) btn.classList.add('active');
  renderEntries('all');
}

async function setRenewal(id, renew) {
  await window.AppDrive.saveRecurring(
    window.AppDrive.getRecurring().map(r => r.id === id ? {...r, active: renew} : r)
  );
  renderRenewalAlerts();
}

window.AppUI = {
  showSignIn, showApp, renderAll,
  setView, cycleStatus, openEdit, saveEdit, closeEdit,
  changeMonth, setFilter, setRenewal,
};

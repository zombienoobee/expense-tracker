// ─── UI Controller — v1.3.0 ───────────────────────────────────────────────────
// Fixes: show all entries, working nav, settings/version screen

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const STATUSES = {
  paid:      { label: 'Paid',      class: 'status-paid',      next: 'scheduled' },
  scheduled: { label: 'Scheduled', class: 'status-scheduled', next: 'pending'   },
  pending:   { label: 'Pending',   class: 'status-pending',   next: 'cancelled' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled', next: 'na'        },
  na:        { label: 'N/A',       class: 'status-na',        next: 'paid'      },
};

const APP_VERSION = 'v1.3.0';
const APP_DATE    = '2026-05-09';

let _state = {
  view:         'dashboard',
  year:         2026,
  month:        new Date().getMonth(),
  filterModule: 'all',
  filterCat:    'all',
};

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
  renderExpenseList();
  renderRenewalAlerts();
  renderNav();
  renderView();
}

// ── Summary cards ─────────────────────────────────────────────────────────────
function renderSummaryCards() {
  const entries  = window.AppDrive.getExpenses();
  const monthStr = `${_state.year}-${String(_state.month + 1).padStart(2,'0')}`;
  const active   = entries.filter(e =>
    e.date === monthStr &&
    e.amount !== null &&
    e.status !== 'na' &&
    e.status !== 'cancelled'
  );
  const personal  = active.filter(e => e.module === 'personal' ).reduce((s,e) => s + (e.amount||0), 0);
  const household = active.filter(e => e.module === 'household').reduce((s,e) => s + (e.amount||0), 0);
  const total     = personal + household;

  const ytd = entries.filter(e => {
    const [y,m] = e.date.split('-').map(Number);
    return y === _state.year && m <= (_state.month + 1) &&
           e.amount !== null && e.status !== 'na' && e.status !== 'cancelled';
  }).reduce((s,e) => s + (e.amount||0), 0);

  const fmt = n => '$' + n.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
  document.getElementById('card-personal').textContent  = fmt(personal);
  document.getElementById('card-household').textContent = fmt(household);
  document.getElementById('card-total').textContent     = fmt(total);
  document.getElementById('card-ytd').textContent       = fmt(ytd);
  document.getElementById('month-label').textContent    = MONTHS[_state.month] + ' ' + _state.year;
}

// ── Expense list ──────────────────────────────────────────────────────────────
function renderExpenseList() {
  const entries  = window.AppDrive.getExpenses();
  const monthStr = `${_state.year}-${String(_state.month + 1).padStart(2,'0')}`;

  // Apply view filter
  let viewModule = 'all';
  if (_state.view === 'personal')  viewModule = 'personal';
  if (_state.view === 'household') viewModule = 'household';

  let filtered = entries.filter(e => e.date === monthStr);
  if (viewModule !== 'all')           filtered = filtered.filter(e => e.module === viewModule);
  if (_state.filterModule !== 'all')  filtered = filtered.filter(e => e.module === _state.filterModule);

  // Show ALL entries — only hide if amount is 0 AND status is pending (truly empty, not entered yet)
  // Always show: paid, scheduled, cancelled, na, entries with notes, entries with amounts
  filtered = filtered.filter(e =>
    e.amount > 0 ||
    e.status === 'paid'      ||
    e.status === 'scheduled' ||
    e.status === 'cancelled' ||
    e.status === 'na'        ||
    e.notes
  );

  const list = document.getElementById('expense-list');
  if (!list) return;

  if (!filtered.length) {
    list.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--color-text-tertiary);font-size:13px;">No entries for ${MONTHS[_state.month]}</div>`;
    return;
  }

  // Group by category
  const grouped = {};
  filtered.forEach(e => {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  });

  let html = '';
  Object.entries(grouped).forEach(([cat, items]) => {
    const catInfo  = window.CATEGORIES[cat] || { label: cat, icon: 'ti-circle' };
    const catTotal = items
      .filter(e => e.status !== 'cancelled' && e.status !== 'na')
      .reduce((s,e) => s + (e.amount||0), 0);
    html += `<div class="cat-group">
      <div class="cat-group-header">
        <span><i class="ti ${catInfo.icon}" aria-hidden="true"></i> ${catInfo.label}</span>
        <span>$${catTotal.toFixed(2)}</span>
      </div>`;
    items.forEach(e => {
      const st  = STATUSES[e.status] || STATUSES.pending;
      const mod = e.module === 'household'
        ? '<span class="mod-tag mod-household">household</span>'
        : '<span class="mod-tag mod-personal">personal</span>';
      const amt = e.amount !== null && e.amount > 0 ? '$' + e.amount.toFixed(2) : '—';
      html += `<div class="expense-row" data-id="${e.id}">
        <div class="expense-name">${e.name} ${mod}</div>
        <div class="expense-right">
          <span class="expense-amt">${amt}</span>
          <span class="status-pill ${st.class}" onclick="cycleStatus('${e.id}')" title="Tap to cycle status">${st.label}</span>
          <button class="edit-btn" onclick="openEdit('${e.id}')" aria-label="Edit ${e.name}"><i class="ti ti-edit"></i></button>
        </div>
      </div>`;
    });
    html += '</div>';
  });

  list.innerHTML = html;
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

// ── View switching ────────────────────────────────────────────────────────────
function renderView() {
  const sections = ['view-dashboard', 'view-personal', 'view-household', 'view-settings'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Dashboard and expense list always visible for dashboard/personal/household
  const expenseWrap = document.getElementById('expense-list-section');
  const dashCards   = document.getElementById('dashboard-cards');
  const settingsEl  = document.getElementById('view-settings');

  if (_state.view === 'settings') {
    if (expenseWrap) expenseWrap.style.display = 'none';
    if (dashCards)   dashCards.style.display   = 'none';
    renderSettings();
    if (settingsEl)  settingsEl.style.display  = 'block';
  } else {
    if (expenseWrap) expenseWrap.style.display = 'block';
    if (dashCards)   dashCards.style.display   = 'grid';
    if (settingsEl)  settingsEl.style.display  = 'none';
    renderExpenseList();
  }
}

function renderSettings() {
  const el = document.getElementById('view-settings');
  if (!el) return;
  const meta    = window.AppDrive.getMeta();
  const entries = window.AppDrive.getExpenses();
  const totalEntries   = entries.length;
  const paidEntries    = entries.filter(e => e.status === 'paid').length;
  const lastSync       = meta.last_sync ? new Date(meta.last_sync).toLocaleString() : 'Never';

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
        <div class="settings-row"><span>Total entries</span><span>${totalEntries}</span></div>
        <div class="settings-row"><span>Paid entries</span><span>${paidEntries}</span></div>
        <div class="settings-row"><span>Years tracked</span><span>${(meta.years||[2026]).join(', ')}</span></div>
        <div class="settings-row"><span>Storage</span><span>Google Drive</span></div>
      </div>
      <div class="settings-section">
        <div class="settings-label">Version history</div>
        <div class="settings-row ver-row"><span>v1.3.0</span><span>All entries visible, nav, settings</span></div>
        <div class="settings-row ver-row"><span>v1.2.0</span><span>5 statuses, status picker</span></div>
        <div class="settings-row ver-row"><span>v1.1.0</span><span>Security hardening, zero data in code</span></div>
        <div class="settings-row ver-row"><span>v1.0.0</span><span>Sprint 1 — initial launch</span></div>
      </div>
      <div class="settings-section">
        <div class="settings-label">Account</div>
        <div class="settings-row">
          <span>Session</span>
          <button class="settings-btn-danger" onclick="window.AppAuth.signOut()">Sign out</button>
        </div>
      </div>
    </div>`;
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function renderNav() {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const active = document.querySelector(`.nav-btn[data-view="${_state.view}"]`);
  if (active) active.classList.add('active');
}

function setView(view) {
  _state.view = view;
  // Reset filter when switching views
  _state.filterModule = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.filter-btn[data-mod="all"]');
  if (allBtn) allBtn.classList.add('active');
  renderAll();
}

// ── Status cycle ──────────────────────────────────────────────────────────────
async function cycleStatus(id) {
  const entry = window.AppDrive.getExpenses().find(e => e.id === id);
  if (!entry) return;
  const next = (STATUSES[entry.status] || STATUSES.pending).next;
  await window.AppDrive.updateEntry(id, { status: next });
  renderExpenseList();
  renderSummaryCards();
}

// ── Edit modal ────────────────────────────────────────────────────────────────
function openEdit(id) {
  const entry = window.AppDrive.getExpenses().find(e => e.id === id);
  if (!entry) return;
  document.getElementById('edit-id').value     = id;
  document.getElementById('edit-name').value   = entry.name;
  document.getElementById('edit-amount').value = entry.amount ?? '';
  document.getElementById('edit-notes').value  = entry.notes || '';
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
    status: status,
  });
  closeEdit();
  renderAll();
}

function closeEdit() {
  document.getElementById('edit-modal').style.display = 'none';
}

// ── Other ─────────────────────────────────────────────────────────────────────
function changeMonth(delta) {
  _state.month = (_state.month + delta + 12) % 12;
  renderAll();
}

function setFilter(module) {
  _state.filterModule = module;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.filter-btn[data-mod="${module}"]`).classList.add('active');
  renderExpenseList();
}

async function setRenewal(id, renew) {
  await window.AppDrive.saveRecurring(
    window.AppDrive.getRecurring().map(r => r.id === id ? { ...r, active: renew } : r)
  );
  renderRenewalAlerts();
  renderExpenseList();
}

window.AppUI = {
  showSignIn, showApp, renderAll,
  setView, cycleStatus, openEdit, saveEdit, closeEdit,
  changeMonth, setFilter, setRenewal,
};

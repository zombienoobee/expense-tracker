// ─── UI Controller — v1.2.0 ───────────────────────────────────────────────────
// 5 statuses: paid | scheduled | pending | cancelled | na

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const STATUSES = {
  paid:      { label: 'Paid',      class: 'status-paid',      next: 'scheduled' },
  scheduled: { label: 'Scheduled', class: 'status-scheduled', next: 'pending'   },
  pending:   { label: 'Pending',   class: 'status-pending',   next: 'cancelled' },
  cancelled: { label: 'Cancelled', class: 'status-cancelled', next: 'na'        },
  na:        { label: 'N/A',       class: 'status-na',        next: 'paid'      },
};

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
  document.getElementById('screen-app').style.display = 'none';
}

function showApp() {
  document.getElementById('screen-signin').style.display = 'none';
  document.getElementById('screen-app').style.display = 'block';
  renderAll();
}

// ── Master render ─────────────────────────────────────────────────────────────
function renderAll() {
  renderSummaryCards();
  renderExpenseList();
  renderRenewalAlerts();
  renderNav();
}

// ── Summary cards ─────────────────────────────────────────────────────────────
function renderSummaryCards() {
  const entries  = window.AppDrive.getExpenses();
  const monthStr = `${_state.year}-${String(_state.month + 1).padStart(2,'0')}`;
  const monthEntries = entries.filter(e => e.date === monthStr && e.amount !== null && e.status !== 'na' && e.status !== 'cancelled');

  const personal  = monthEntries.filter(e => e.module === 'personal' ).reduce((s,e) => s + (e.amount||0), 0);
  const household = monthEntries.filter(e => e.module === 'household').reduce((s,e) => s + (e.amount||0), 0);
  const total     = personal + household;

  const ytdEntries = entries.filter(e => {
    const [y,m] = e.date.split('-').map(Number);
    return y === _state.year && m <= (_state.month + 1) && e.amount !== null && e.status !== 'na' && e.status !== 'cancelled';
  });
  const ytd = ytdEntries.reduce((s,e) => s + (e.amount||0), 0);

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
  let filtered   = entries.filter(e => e.date === monthStr);

  if (_state.filterModule !== 'all') filtered = filtered.filter(e => e.module === _state.filterModule);
  if (_state.filterCat    !== 'all') filtered = filtered.filter(e => e.category === _state.filterCat);

  // Hide zero/null entries unless cancelled, na, or has notes
  filtered = filtered.filter(e =>
    (e.amount !== null && e.amount !== 0) ||
    e.status === 'cancelled' ||
    e.status === 'na' ||
    e.notes
  );

  const list = document.getElementById('expense-list');
  if (!filtered.length) {
    list.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--color-text-tertiary);font-size:13px;">No entries for ${MONTHS[_state.month]}</div>`;
    return;
  }

  const grouped = {};
  filtered.forEach(e => {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  });

  let html = '';
  Object.entries(grouped).forEach(([cat, items]) => {
    const catInfo  = window.CATEGORIES[cat] || { label: cat, icon: 'ti-circle' };
    const catTotal = items.filter(e => e.status !== 'cancelled' && e.status !== 'na').reduce((s,e) => s + (e.amount||0), 0);
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
      const amt = e.amount !== null ? '$' + e.amount.toFixed(2) : '—';
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
  const active = document.querySelector(`.nav-btn[data-view="${_state.view}"]`);
  if (active) active.classList.add('active');
}

// ── Cycle status (tap on pill) ────────────────────────────────────────────────
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
  document.getElementById('edit-id').value        = id;
  document.getElementById('edit-name').value      = entry.name;
  document.getElementById('edit-amount').value    = entry.amount ?? '';
  document.getElementById('edit-notes').value     = entry.notes || '';
  document.getElementById('edit-status').value    = entry.status || 'pending';
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

// ── Other actions ─────────────────────────────────────────────────────────────
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
  cycleStatus, openEdit, saveEdit, closeEdit,
  changeMonth, setFilter, setRenewal,
};

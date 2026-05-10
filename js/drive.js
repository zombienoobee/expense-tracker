// ─── Google Drive appdata CRUD ────────────────────────────────────────────────
// All files stored in appDataFolder — invisible to user in Drive UI,
// only accessible by this app, only by the authenticated user.

const FILE_NAMES = {
  expenses: 'expenses.json',
  recurring: 'recurring.json',
  meta: 'meta.json',
};

let _cache = { expenses: null, recurring: null, meta: null };

// ── Find a file by name in appDataFolder ──────────────────────────────────────
async function findFile(name) {
  await window.AppAuth.ensureToken();
  const res = await gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    fields: 'files(id, name)',
    q: `name='${name}'`,
  });
  const files = res.result.files;
  return files && files.length > 0 ? files[0].id : null;
}

// ── Read a JSON file from Drive ───────────────────────────────────────────────
async function readFile(name) {
  await window.AppAuth.ensureToken();
  const fileId = await findFile(name);
  if (!fileId) return null;
  const res = await gapi.client.drive.files.get({
    fileId,
    alt: 'media',
  });
  return typeof res.result === 'string' ? JSON.parse(res.result) : res.result;
}

// ── Write (create or update) a JSON file on Drive ────────────────────────────
async function writeFile(name, data) {
  await window.AppAuth.ensureToken();
  const body = JSON.stringify(data, null, 2);
  const blob = new Blob([body], { type: 'application/json' });
  const existingId = await findFile(name);

  const metadata = { name, parents: existingId ? undefined : ['appDataFolder'] };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const token = gapi.client.getToken().access_token;
  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const method = existingId ? 'PATCH' : 'POST';
  await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: form });

  // Update cache
  _cache[name.replace('.json', '')] = data;
}

// ── Load all data or seed if first run ───────────────────────────────────────
async function loadOrInit() {
  try {
    const [expenses, recurring, meta] = await Promise.all([
      readFile(FILE_NAMES.expenses),
      readFile(FILE_NAMES.recurring),
      readFile(FILE_NAMES.meta),
    ]);

    if (!expenses || !recurring || !meta) {
      // First run — seed from migration data
      const seed = window.buildSeedData();
      await Promise.all([
        writeFile(FILE_NAMES.expenses, seed.entries),
        writeFile(FILE_NAMES.recurring, seed.recurring),
        writeFile(FILE_NAMES.meta, seed.meta),
      ]);
      _cache = { expenses: seed.entries, recurring: seed.recurring, meta: seed.meta };
    } else {
      _cache = { expenses, recurring, meta };
    }
  } catch(e) {
    console.error('Drive load error:', e);
    // Fallback to seed data for demo
    const seed = window.buildSeedData();
    _cache = { expenses: seed.entries, recurring: seed.recurring, meta: seed.meta };
  }
  return _cache;
}

// ── CRUD helpers ──────────────────────────────────────────────────────────────
function getExpenses() { return _cache.expenses || []; }
function getRecurring() { return _cache.recurring || []; }
function getMeta() { return _cache.meta || {}; }

async function saveExpenses(entries) {
  _cache.expenses = entries;
  await writeFile(FILE_NAMES.expenses, entries);
}

async function saveRecurring(items) {
  _cache.recurring = items;
  await writeFile(FILE_NAMES.recurring, items);
}

async function updateMeta(patch) {
  _cache.meta = { ..._cache.meta, ...patch, last_sync: new Date().toISOString() };
  await writeFile(FILE_NAMES.meta, _cache.meta);
}

// ── Update a single expense entry ─────────────────────────────────────────────
async function updateEntry(id, patch) {
  const entries = getExpenses();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return;
  entries[idx] = { ...entries[idx], ...patch };
  await saveExpenses(entries);
  return entries[idx];
}

// ── Add a new expense entry ───────────────────────────────────────────────────
async function addEntry(entry) {
  const entries = getExpenses();
  const newEntry = {
    id: 'e' + Date.now(),
    ...entry,
    status: entry.status || 'pending',
    notes: entry.notes || null,
    renewal_date: entry.renewal_date || null,
  };
  entries.push(newEntry);
  await saveExpenses(entries);
  return newEntry;
}

window.AppDrive = {
  loadOrInit, getExpenses, getRecurring, getMeta,
  saveExpenses, saveRecurring, updateMeta,
  updateEntry, addEntry,
};

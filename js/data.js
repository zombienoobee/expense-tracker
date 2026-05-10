// ─── Schema & Categories ─────────────────────────────────────────────────────
// v2.1.0 — 11 categories, corrected frequencies, Zoya removed

const CATEGORIES = {
  streaming:      { label: 'Streaming',         icon: 'ti-device-tv',          module: 'personal'  },
  memberships:    { label: 'Memberships',        icon: 'ti-id-badge',           module: 'personal'  },
  utilities_tech: { label: 'Utilities & Tech',   icon: 'ti-wifi',               module: 'personal'  },
  insurance:      { label: 'Insurance',          icon: 'ti-shield-check',       module: 'personal'  },
  auto_transport: { label: 'Auto & Transport',   icon: 'ti-car',                module: 'personal'  },
  charity_giving: { label: 'Charity & Giving',   icon: 'ti-hand-heart',         module: 'personal'  },
  health_copay:   { label: 'Health & Wellbeing', icon: 'ti-heart-rate-monitor', module: 'personal'  },
  housing:        { label: 'Housing',            icon: 'ti-home',               module: 'household' },
  groceries:      { label: 'Groceries',          icon: 'ti-shopping-cart',      module: 'personal'  },
  shopping:       { label: 'Shopping',           icon: 'ti-basket',             module: 'personal'  },
  credit_cards:   { label: 'Credit Card Bills',  icon: 'ti-credit-card',        module: 'household' },
};

const STATUS  = { paid: 'paid', scheduled: 'scheduled', pending: 'pending', cancelled: 'cancelled', na: 'na' };
const MODULES = { personal: 'personal', household: 'household' };
const CC      = { CITI: 'CITI', BOA: 'BOA', CHASE: 'CHASE' };

// ─── Category map — every expense name → category ─────────────────────────────
const EXPENSE_CATEGORY_MAP = {
  // Streaming
  'Netflix': 'streaming', 'HBO Max': 'streaming', 'MGM+': 'streaming',
  'QTV+': 'streaming', 'STARZ': 'streaming', 'YouTube': 'streaming', 'Spotify': 'streaming',
  // Memberships
  'Costco Membership': 'memberships', 'Amazon Prime': 'memberships',
  'Walmart+': 'memberships', 'Playstation+': 'memberships',
  'Frontier WildPass': 'memberships', 'Frontier Discount Den': 'memberships',
  'EBRPD': 'memberships', 'CDFW': 'memberships',
  // Utilities & Tech
  'Internet': 'utilities_tech', 'ATT': 'utilities_tech', 'ChatGPT': 'utilities_tech',
  'ClaudeGPT': 'utilities_tech', 'iCloud+': 'utilities_tech',
  'Norton': 'utilities_tech', 'TurboTax': 'utilities_tech', 'WSJ+': 'utilities_tech',
  // Insurance
  'AllState Car': 'insurance', 'Renter Insurance': 'insurance', 'AAA': 'insurance',
  // Auto & Transport
  'Gas': 'auto_transport', 'Car Registration': 'auto_transport',
  'Oil Change': 'auto_transport', 'Car Wash': 'auto_transport',
  'SMOG': 'auto_transport', 'Uber': 'auto_transport',
  // Charity & Giving
  'Sadaqa': 'charity_giving', 'Zakat': 'charity_giving',
  'Fitra': 'charity_giving', 'Qurbani': 'charity_giving',
  // Health & Wellbeing
  'Kaiser': 'health_copay', 'mfsusa': 'health_copay', 'Fitness+': 'health_copay',
  // Housing
  'Rent': 'housing', 'PGE': 'housing', 'Water': 'housing',
  'Sewerage': 'housing', 'Garbage': 'housing', 'Service Fee': 'housing',
  'Laundry': 'housing',
  // Groceries
  'Costco': 'groceries', 'Amazon': 'groceries', 'Walmart': 'groceries',
  'Desi Store': 'groceries', 'Venison': 'groceries', 'Beef': 'groceries',
  'Qeema': 'groceries', 'Chicken': 'groceries', 'Fish': 'groceries',
  // Shopping
  'Temu': 'shopping', 'Home Depot': 'shopping', 'MajicJack': 'shopping',
  'Apple Pay': 'shopping',
  // Credit Cards
  'CITI': 'credit_cards', 'BOA': 'credit_cards', 'CHASE': 'credit_cards',
};

// ─── Empty first-run structure ────────────────────────────────────────────────
function buildEmptyData() {
  return {
    entries:   [],
    recurring: buildRecurring(),
    meta: {
      version:       '2.1.0',
      years:         [2026],
      last_sync:     new Date().toISOString(),
      notifications: [],
      div_target:    43000,
      seeded:        false,
    },
  };
}

// ─── Recurring items — corrected frequencies ──────────────────────────────────
function buildRecurring() {
  return [
    // ── Streaming ──────────────────────────────────────────────────────────
    { id:'r001', name:'Netflix',              category:'streaming',      module:'personal',  amount:7.99,   frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r002', name:'HBO Max',              category:'streaming',      module:'personal',  amount:2.99,   frequency:'monthly', renewal_month:11,   active:true,  cc:null, notes:'Cancel before Nov if price jumps' },
    { id:'r003', name:'MGM+',                 category:'streaming',      module:'personal',  amount:1.99,   frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r004', name:'QTV+',                 category:'streaming',      module:'personal',  amount:0,      frequency:'yearly',  renewal_month:9,    active:true,  cc:null, notes:'Renewal decision in September' },
    { id:'r005', name:'STARZ',                category:'streaming',      module:'personal',  amount:0,      frequency:'yearly',  renewal_month:11,   active:true,  cc:null, notes:'Cancel Nov — wait for discount offer' },
    { id:'r006', name:'YouTube',              category:'streaming',      module:'personal',  amount:0,      frequency:'monthly', renewal_month:null, active:false, cc:null, notes:null },
    { id:'r007', name:'Spotify',              category:'streaming',      module:'personal',  amount:0,      frequency:'yearly',  renewal_month:null, active:false, cc:null, notes:null },
    // ── Memberships ────────────────────────────────────────────────────────
    { id:'r010', name:'Costco Membership',    category:'memberships',    module:'personal',  amount:130,    frequency:'yearly',  renewal_month:10,   active:true,  cc:null, notes:null },
    { id:'r011', name:'Amazon Prime',         category:'memberships',    module:'personal',  amount:153.94, frequency:'yearly',  renewal_month:6,    active:true,  cc:null, notes:null },
    { id:'r012', name:'Walmart+',             category:'memberships',    module:'personal',  amount:108.54, frequency:'yearly',  renewal_month:10,   active:true,  cc:null, notes:null },
    { id:'r013', name:'Playstation+',         category:'memberships',    module:'personal',  amount:89.99,  frequency:'yearly',  renewal_month:4,    active:true,  cc:null, notes:null },
    { id:'r014', name:'Frontier WildPass',    category:'memberships',    module:'personal',  amount:0,      frequency:'yearly',  renewal_month:null, active:true,  cc:null, notes:'Keeping — blackout dates improved' },
    { id:'r015', name:'Frontier Discount Den',category:'memberships',    module:'personal',  amount:0,      frequency:'yearly',  renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r016', name:'EBRPD',                category:'memberships',    module:'personal',  amount:0,      frequency:'yearly',  renewal_month:9,    active:true,  cc:null, notes:'East Bay Regional Park fee' },
    { id:'r017', name:'CDFW',                 category:'memberships',    module:'personal',  amount:24.39,  frequency:'yearly',  renewal_month:5,    active:true,  cc:null, notes:'Hunting/fishing license' },
    // ── Utilities & Tech ───────────────────────────────────────────────────
    { id:'r020', name:'Internet',             category:'utilities_tech', module:'personal',  amount:45,     frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r021', name:'ATT',                  category:'utilities_tech', module:'personal',  amount:302.02, frequency:'yearly',  renewal_month:4,    active:true,  cc:null, notes:'Pre-paid yearly — paid April' },
    { id:'r022', name:'ChatGPT',              category:'utilities_tech', module:'personal',  amount:20,     frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r023', name:'ClaudeGPT',            category:'utilities_tech', module:'personal',  amount:200,    frequency:'yearly',  renewal_month:2,    active:true,  cc:null, notes:null },
    { id:'r024', name:'iCloud+',              category:'utilities_tech', module:'personal',  amount:1,      frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r025', name:'Norton',               category:'utilities_tech', module:'personal',  amount:159.99, frequency:'yearly',  renewal_month:10,   active:true,  cc:null, notes:'Norton Antivirus' },
    { id:'r026', name:'TurboTax',             category:'utilities_tech', module:'personal',  amount:82.99,  frequency:'yearly',  renewal_month:3,    active:true,  cc:null, notes:null },
    { id:'r027', name:'WSJ+',                 category:'utilities_tech', module:'personal',  amount:6,      frequency:'monthly', renewal_month:7,    active:false, cc:null, notes:'Cancel before July — price jumps' },
    // ── Insurance ──────────────────────────────────────────────────────────
    { id:'r030', name:'AllState Car',         category:'insurance',      module:'personal',  amount:739.53, frequency:'6monthly',renewal_month:6,    active:true,  cc:null, notes:'Every 6 months — Jun & Dec' },
    { id:'r031', name:'Renter Insurance',     category:'insurance',      module:'household', amount:224,    frequency:'yearly',  renewal_month:1,    active:true,  cc:null, notes:null },
    { id:'r032', name:'AAA',                  category:'insurance',      module:'personal',  amount:124.99, frequency:'yearly',  renewal_month:7,    active:true,  cc:null, notes:null },
    // ── Auto & Transport ───────────────────────────────────────────────────
    { id:'r040', name:'Car Registration',     category:'auto_transport', module:'personal',  amount:183,    frequency:'yearly',  renewal_month:5,    active:true,  cc:null, notes:null },
    // ── Charity & Giving ───────────────────────────────────────────────────
    { id:'r050', name:'Sadaqa',               category:'charity_giving', module:'personal',  amount:180,    frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:'Monthly charity — ongoing' },
    { id:'r051', name:'Zakat',                category:'charity_giving', module:'personal',  amount:0,      frequency:'asneeded',renewal_month:null, active:true,  cc:null, notes:'Free-form — pay what you can each month' },
    { id:'r052', name:'Fitra',                category:'charity_giving', module:'personal',  amount:0,      frequency:'yearly',  renewal_month:null, active:true,  cc:null, notes:'Yearly obligation' },
    { id:'r053', name:'Qurbani',              category:'charity_giving', module:'personal',  amount:0,      frequency:'yearly',  renewal_month:null, active:true,  cc:null, notes:'Yearly obligation' },
    // ── Health & Wellbeing ─────────────────────────────────────────────────
    { id:'r060', name:'Kaiser',               category:'health_copay',   module:'personal',  amount:0,      frequency:'asneeded',renewal_month:null, active:true,  cc:null, notes:'Co-pay / OOP only — not insurance premium' },
    { id:'r061', name:'mfsusa',               category:'health_copay',   module:'personal',  amount:0,      frequency:'asneeded',renewal_month:null, active:true,  cc:null, notes:'Co-op funeral membership' },
    { id:'r062', name:'Fitness+',             category:'health_copay',   module:'personal',  amount:0,      frequency:'yearly',  renewal_month:null, active:false, cc:null, notes:'Not purchased yet — future' },
    // ── Housing ────────────────────────────────────────────────────────────
    { id:'r070', name:'Rent',                 category:'housing',        module:'household', amount:2114,   frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r071', name:'PGE',                  category:'housing',        module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r072', name:'Water',                category:'housing',        module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r073', name:'Sewerage',             category:'housing',        module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r074', name:'Garbage',              category:'housing',        module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r075', name:'Service Fee',          category:'housing',        module:'household', amount:5.65,   frequency:'monthly', renewal_month:null, active:true,  cc:null, notes:null },
    { id:'r076', name:'Laundry',              category:'housing',        module:'household', amount:0,      frequency:'asneeded',renewal_month:null, active:true,  cc:null, notes:null },
  ];
}

window.CATEGORIES          = CATEGORIES;
window.EXPENSE_CATEGORY_MAP = EXPENSE_CATEGORY_MAP;
window.STATUS              = STATUS;
window.MODULES             = MODULES;
window.CC                  = CC;
window.buildEmptyData      = buildEmptyData;
window.buildRecurring      = buildRecurring;

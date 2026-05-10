// ─── Schema & Categories ─────────────────────────────────────────────────────

const CATEGORIES = {
  groceries_food:   { label: 'Groceries & Food',     icon: 'ti-shopping-cart', module: 'personal' },
  subscriptions:    { label: 'Subscriptions',         icon: 'ti-device-tv',     module: 'personal' },
  auto_transport:   { label: 'Auto & Transport',      icon: 'ti-car',           module: 'personal' },
  health_copay:     { label: 'Health (co-pay/OOP)',   icon: 'ti-heart-rate-monitor', module: 'personal' },
  utilities_tech:   { label: 'Utilities & Tech',      icon: 'ti-wifi',          module: 'both' },
  charity_giving:   { label: 'Charity & Giving',      icon: 'ti-hand-heart',    module: 'personal' },
  housing:          { label: 'Housing',               icon: 'ti-home',          module: 'household' },
  home_personal:    { label: 'Home & Personal',       icon: 'ti-hanger',        module: 'household' },
};

const STATUS = { paid: 'paid', pending: 'pending', cancelled: 'cancelled' };
const MODULES = { personal: 'personal', household: 'household' };
const CC = { CITI: 'CITI', BOA: 'BOA', CHASE: 'CHASE' };

// ─── Seed Data — migrated from US_2026 + Sheet9 ───────────────────────────────

function buildSeedData() {
  const year = 2026;
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  // recurring items (from both sheets)
  const recurring = [
    { id:'r001', name:'Sadaqa',          category:'charity_giving',  module:'personal',  amount:180,    frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r002', name:'Internet',        category:'utilities_tech',  module:'personal',  amount:45,     frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r003', name:'HBO Max',         category:'subscriptions',   module:'personal',  amount:2.99,   frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r004', name:'ChatGPT',         category:'utilities_tech',  module:'personal',  amount:20,     frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r005', name:'ClaudeGPT',       category:'utilities_tech',  module:'personal',  amount:200,    frequency:'annual',  renewal_month:2,    active:true,  cc:null },
    { id:'r006', name:'WSJ+',            category:'subscriptions',   module:'personal',  amount:6,      frequency:'monthly', renewal_month:null, active:false, cc:null },
    { id:'r007', name:'Netflix',         category:'subscriptions',   module:'personal',  amount:7.99,   frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r008', name:'QTV+',            category:'subscriptions',   module:'personal',  amount:0,      frequency:'monthly', renewal_month:null, active:false, cc:null },
    { id:'r009', name:'MGM+',            category:'subscriptions',   module:'personal',  amount:1.99,   frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r010', name:'STARZ',           category:'subscriptions',   module:'personal',  amount:0,      frequency:'monthly', renewal_month:null, active:false, cc:null },
    { id:'r011', name:'Playstation+',    category:'subscriptions',   module:'personal',  amount:89.99,  frequency:'annual',  renewal_month:4,    active:true,  cc:null },
    { id:'r012', name:'Spotify',         category:'subscriptions',   module:'personal',  amount:0,      frequency:'monthly', renewal_month:null, active:false, cc:null },
    { id:'r013', name:'iCloud+',         category:'utilities_tech',  module:'personal',  amount:1,      frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r014', name:'Norton',          category:'utilities_tech',  module:'personal',  amount:159.99, frequency:'annual',  renewal_month:1,    active:true,  cc:null },
    { id:'r015', name:'Walmart+',        category:'subscriptions',   module:'personal',  amount:108.54, frequency:'annual',  renewal_month:10,   active:true,  cc:null },
    { id:'r016', name:'Fitness+',        category:'subscriptions',   module:'personal',  amount:0,      frequency:'annual',  renewal_month:9,    active:false, cc:null },
    { id:'r017', name:'AAA',             category:'auto_transport',  module:'personal',  amount:124.99, frequency:'annual',  renewal_month:7,    active:true,  cc:null },
    { id:'r018', name:'AllState',        category:'auto_transport',  module:'personal',  amount:0,      frequency:'annual',  renewal_month:6,    active:true,  cc:null },
    { id:'r019', name:'Kaiser',          category:'health_copay',    module:'personal',  amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r020', name:'TurboTax',        category:'utilities_tech',  module:'personal',  amount:82.99,  frequency:'annual',  renewal_month:3,    active:true,  cc:null },
    { id:'r021', name:'Zoya',            category:'home_personal',   module:'personal',  amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r022', name:'EBRPD',           category:'utilities_tech',  module:'personal',  amount:0,      frequency:'annual',  renewal_month:9,    active:true,  cc:null },
    { id:'r023', name:'cdfw',            category:'auto_transport',  module:'personal',  amount:24.39,  frequency:'annual',  renewal_month:5,    active:true,  cc:null },
    // Household recurring
    { id:'r030', name:'Rent',            category:'housing',         module:'household', amount:2114,   frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r031', name:'Garbage',         category:'housing',         module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r032', name:'Sewerage',        category:'housing',         module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r033', name:'Water',           category:'housing',         module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r034', name:'Service Fee',     category:'housing',         module:'household', amount:5.65,   frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r035', name:'PGE',             category:'housing',         module:'household', amount:0,      frequency:'monthly', renewal_month:null, active:true,  cc:null },
    { id:'r036', name:'Renter Insurance',category:'housing',         module:'household', amount:224,    frequency:'annual',  renewal_month:1,    active:true,  cc:null },
  ];

  // monthly expense entries — personal (US_2026)
  const personalData = {
    January:   { Costco:0, Amazon:0, Qurbani:0, Gas:80.65, ChatGPT:20, ClaudeGPT:null, Sadaqa:180, Internet:43, 'Car Registration':0, 'WSJ+':6, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:7.99, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:345, Spotify:99, cdfw:0, AllState:224, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':0, SMOG:0, mfsusa:30.81, TurboTax:null, Norton:0, Venison:159.99, Beef:0, Qeema:0, Chicken:94.71, Fish:0, 'Desi Store':0 },
    February:  { Costco:0, Amazon:0, Qurbani:0, Gas:0, ChatGPT:20, ClaudeGPT:200, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':6, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':1.99, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:2033.44, Spotify:0, cdfw:0, AllState:0, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':0, SMOG:0, mfsusa:30.55, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    March:     { Costco:0, Amazon:0, Qurbani:0, Gas:61.29, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':6, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':1.99, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:null, Spotify:0, cdfw:0, AllState:0, AAA:0, Laundry:15, 'Oil Change':90, 'iCloud+':1, EBRPD:0, 'Car Wash':0, SMOG:0, mfsusa:29.18, TurboTax:82.99, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    April:     { Costco:0, Amazon:0, Qurbani:0, Gas:0, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':6, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':89.99, 'Walmart+':0, Frontier:null, ATT:302.02, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:715.03, Spotify:0, cdfw:0, AllState:0, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':10, SMOG:0, mfsusa:38.77, TurboTax:120, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    May:       { Costco:0, Amazon:0, Qurbani:162, Gas:64.7, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':183, 'WSJ+':6, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:24, Spotify:0, cdfw:24.39, AllState:0, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':0, SMOG:0, mfsusa:8.13, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    June:      { Costco:0, Amazon:153.94, Qurbani:0, Gas:0, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':6, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:11.67, Spotify:0, cdfw:0, AllState:739.53, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:300, 'Car Wash':0, SMOG:0, mfsusa:0, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    July:      { Costco:0, Amazon:0, Qurbani:0, Gas:0, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':null, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:0, Spotify:0, cdfw:0, AllState:0, AAA:124.99, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':0, SMOG:0, mfsusa:10.68, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    August:    { Costco:0, Amazon:0, Qurbani:0, Gas:54.91, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':0, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':89.99, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:0, Spotify:0, cdfw:0, AllState:0, AAA:0, Laundry:15, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':10, SMOG:0, mfsusa:18.34, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    September: { Costco:0, Amazon:0, Qurbani:0, Gas:0, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':0, 'QTV+':99, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:11.66, Spotify:0, cdfw:0, AllState:0, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':0, SMOG:0, mfsusa:17.21, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    October:   { Costco:130, Amazon:0, Qurbani:0, Gas:0, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':0, 'QTV+':0, 'HBO Max':2.99, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':108.54, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:11.66, Spotify:0, cdfw:0, AllState:0, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':10, SMOG:0, mfsusa:17.41, TurboTax:null, Norton:160, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    November:  { Costco:0, Amazon:0, Qurbani:0, Gas:0, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':0, 'QTV+':0, 'HBO Max':null, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':0, Zoya:0, Kaiser:0, Spotify:0, cdfw:0, AllState:0, AAA:0, Laundry:11, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':0, SMOG:0, mfsusa:25, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
    December:  { Costco:0, Amazon:0, Qurbani:0, Gas:0, ChatGPT:0, ClaudeGPT:null, Sadaqa:180, Internet:45, 'Car Registration':0, 'WSJ+':0, 'QTV+':0, 'HBO Max':0, YouTube:null, Netflix:0, 'MGM+':null, STARZ:null, 'Playstation+':0, 'Walmart+':0, Frontier:null, ATT:null, Uber:0, 'Fitness+':null, Zoya:0, Kaiser:11.67, Spotify:0, cdfw:0, AllState:743.59, AAA:0, Laundry:0, 'Oil Change':0, 'iCloud+':1, EBRPD:0, 'Car Wash':null, SMOG:0, mfsusa:0, TurboTax:null, Norton:0, Venison:null, Beef:0, Qeema:0, Chicken:0, Fish:0, 'Desi Store':0 },
  };

  // monthly household data (Sheet9)
  const householdData = {
    January:   { Rent:2114, Garbage:69.19, Sewerage:29.95, Water:31.58, 'Service Fee':4.47, PGE:168.41, 'Renter Insurance':224 },
    February:  { Rent:2114, Garbage:45.38, Sewerage:29.65, Water:31.27, 'Service Fee':5.65, PGE:207.53, 'Renter Insurance':0 },
    March:     { Rent:2114, Garbage:46.58, Sewerage:29.23, Water:27.54, 'Service Fee':5.65, PGE:181.52, 'Renter Insurance':0 },
    April:     { Rent:2114, Garbage:51.63, Sewerage:30.12, Water:28.37, 'Service Fee':5.65, PGE:122.41, 'Renter Insurance':0 },
    May:       { Rent:2114, Garbage:46.05, Sewerage:30.22, Water:33.49, 'Service Fee':5.65, PGE:92.55,  'Renter Insurance':0 },
    June:      { Rent:2114, Garbage:71.61, Sewerage:27.89, Water:26.2,  'Service Fee':5.65, PGE:138.45, 'Renter Insurance':0 },
    July:      { Rent:2114, Garbage:72.80, Sewerage:27.86, Water:26.17, 'Service Fee':5.65, PGE:131.66, 'Renter Insurance':0 },
    August:    { Rent:2114, Garbage:69.61, Sewerage:27.32, Water:26.1,  'Service Fee':5.65, PGE:138,    'Renter Insurance':0 },
    September: { Rent:2114, Garbage:72.87, Sewerage:27.42, Water:26.21, 'Service Fee':5.65, PGE:136.27, 'Renter Insurance':0 },
    October:   { Rent:2114, Garbage:69.97, Sewerage:28.99, Water:29.62, 'Service Fee':5.65, PGE:150,    'Renter Insurance':0 },
    November:  { Rent:2114, Garbage:52.78, Sewerage:36.86, Water:38.55, 'Service Fee':5.65, PGE:150,    'Renter Insurance':0 },
    December:  { Rent:2114, Garbage:55,    Sewerage:30,    Water:30,    'Service Fee':5.65, PGE:150,    'Renter Insurance':0 },
  };

  // Map personal expenses to category
  const expenseCategoryMap = {
    Costco:'groceries_food', Amazon:'groceries_food', Qurbani:'charity_giving',
    Gas:'auto_transport', ChatGPT:'utilities_tech', ClaudeGPT:'utilities_tech',
    Sadaqa:'charity_giving', Internet:'utilities_tech', 'Car Registration':'auto_transport',
    'WSJ+':'subscriptions', 'QTV+':'subscriptions', 'HBO Max':'subscriptions',
    YouTube:'subscriptions', Netflix:'subscriptions', 'MGM+':'subscriptions',
    STARZ:'subscriptions', 'Playstation+':'subscriptions', 'Walmart+':'subscriptions',
    Frontier:'utilities_tech', ATT:'utilities_tech', Uber:'auto_transport',
    'Fitness+':'subscriptions', Zoya:'home_personal', Kaiser:'health_copay',
    Spotify:'subscriptions', cdfw:'auto_transport', AllState:'auto_transport',
    AAA:'auto_transport', Laundry:'home_personal', 'Oil Change':'auto_transport',
    'iCloud+':'utilities_tech', EBRPD:'utilities_tech', 'Car Wash':'auto_transport',
    SMOG:'auto_transport', mfsusa:'health_copay', TurboTax:'utilities_tech',
    Norton:'utilities_tech', Venison:'groceries_food', Beef:'groceries_food',
    Qeema:'groceries_food', Chicken:'groceries_food', Fish:'groceries_food',
    'Desi Store':'groceries_food',
  };

  const householdCategoryMap = {
    Rent:'housing', Garbage:'housing', Sewerage:'housing', Water:'housing',
    'Service Fee':'housing', PGE:'housing', 'Renter Insurance':'housing',
  };

  // Build expense entries
  const entries = [];
  let idx = 1;
  months.forEach((month, mi) => {
    const monthStr = `${year}-${String(mi+1).padStart(2,'0')}`;
    // personal
    const pd = personalData[month] || {};
    Object.entries(pd).forEach(([name, amount]) => {
      entries.push({
        id: `e${String(idx++).padStart(4,'0')}`,
        date: monthStr,
        name,
        category: expenseCategoryMap[name] || 'home_personal',
        module: 'personal',
        amount: amount,
        status: amount !== null && amount > 0 ? 'paid' : (amount === null ? 'pending' : 'paid'),
        renewal_date: null,
        notes: null,
      });
    });
    // household
    const hd = householdData[month] || {};
    Object.entries(hd).forEach(([name, amount]) => {
      entries.push({
        id: `e${String(idx++).padStart(4,'0')}`,
        date: monthStr,
        name,
        category: householdCategoryMap[name] || 'housing',
        module: 'household',
        amount: amount,
        status: amount !== null && amount > 0 ? 'paid' : 'pending',
        renewal_date: null,
        notes: null,
      });
    });
  });

  const meta = {
    version: '1.0.0',
    years: [2026],
    last_sync: new Date().toISOString(),
    notifications: [],
    div_target: 43000,
  };

  return { entries, recurring, meta };
}

window.CATEGORIES = CATEGORIES;
window.STATUS = STATUS;
window.MODULES = MODULES;
window.CC = CC;
window.buildSeedData = buildSeedData;

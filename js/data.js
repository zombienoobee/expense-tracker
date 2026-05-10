// ─── Schema & Categories ─────────────────────────────────────────────────────
// v1.1.0 — Zero personal data in codebase. All data lives in Google Drive only.

const CATEGORIES = {
  groceries_food: { label: 'Groceries & Food',    icon: 'ti-shopping-cart',      module: 'personal'  },
  subscriptions:  { label: 'Subscriptions',        icon: 'ti-device-tv',          module: 'personal'  },
  auto_transport: { label: 'Auto & Transport',     icon: 'ti-car',                module: 'personal'  },
  health_copay:   { label: 'Health (co-pay/OOP)',  icon: 'ti-heart-rate-monitor', module: 'personal'  },
  utilities_tech: { label: 'Utilities & Tech',     icon: 'ti-wifi',               module: 'both'      },
  charity_giving: { label: 'Charity & Giving',     icon: 'ti-hand-heart',         module: 'personal'  },
  housing:        { label: 'Housing',              icon: 'ti-home',               module: 'household' },
  home_personal:  { label: 'Home & Personal',      icon: 'ti-hanger',             module: 'household' },
};

const STATUS  = { paid: 'paid', pending: 'pending', cancelled: 'cancelled' };
const MODULES = { personal: 'personal', household: 'household' };
const CC      = { CITI: 'CITI', BOA: 'BOA', CHASE: 'CHASE' };

// ─── Empty first-run structure ────────────────────────────────────────────────
// Called by drive.js when NO data exists in Google Drive yet (brand new install).
// Returns empty arrays — user must run the import tool (import.html) to populate.

function buildEmptyData() {
  return {
    entries:   [],
    recurring: [],
    meta: {
      version:       '1.1.0',
      years:         [new Date().getFullYear()],
      last_sync:     new Date().toISOString(),
      notifications: [],
      div_target:    0,
      seeded:        false,
    },
  };
}

window.CATEGORIES = CATEGORIES;
window.STATUS     = STATUS;
window.MODULES    = MODULES;
window.CC         = CC;
window.buildEmptyData = buildEmptyData;

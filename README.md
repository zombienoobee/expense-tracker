# Expense Tracker — Personal PWA
> Private · Google Drive backed · Mobile + Desktop · Version controlled

## Version history
| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-05-09 | Sprint 1 — initial build. Auth, data migration, expense list, mark paid, edit amounts, renewal alerts |

## Stack
- **Frontend**: Vanilla HTML/CSS/JS — no framework, no build step
- **Storage**: Google Drive `appDataFolder` (private, only accessible by this app + your account)
- **Auth**: Google OAuth 2.0 with silent token refresh
- **Offline**: Service Worker caches app shell
- **PWA**: Installable on phone home screen and desktop

## Setup (one-time)

### 1. Google Cloud Console
1. Go to https://console.cloud.google.com
2. Create a new project: "Expense Tracker"
3. Enable **Google Drive API**
4. Go to **APIs & Services → Credentials → Create OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorised JavaScript origins: add your hosting URL (e.g. `https://yourusername.github.io`)
7. Copy the **Client ID**

### 2. Add your Client ID
Open `js/auth.js` and replace:
```
CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
```
with your actual Client ID.

### 3. Deploy
**Option A — GitHub Pages (free)**
1. Push this folder to a GitHub repo
2. Go to repo Settings → Pages → Source: main branch / root
3. Your app is live at `https://yourusername.github.io/expense-tracker`

**Option B — Local testing**
Use any static server, e.g.:
```bash
npx serve .
```

## File structure
```
expense-tracker/
├── index.html          # App shell
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (offline)
├── css/
│   └── app.css         # All styles
└── js/
    ├── data.js         # Schema, categories, seed/migration data
    ├── auth.js         # Google OAuth2
    ├── drive.js        # Google Drive CRUD
    └── ui.js           # UI controller
```

## Data structure (Google Drive appDataFolder)
```
expenses.json    — all expense entries (both modules)
recurring.json   — recurring items with renewal dates
meta.json        — app version, years, notification queue
```

## Adding a new year
The app auto-detects years from `meta.json`. To add 2027:
1. In `meta.json` add `"2027"` to the `years` array
2. The app will create blank month entries for that year

## Rollback procedure
Since all data is in Google Drive JSON files:
1. Open Google Drive → Settings → Manage apps → Expense Tracker
2. Files are versioned by Drive's built-in revision history
3. To restore: right-click the file → Manage versions

## Planned sprints
- **Sprint 2**: Dashboard charts, category breakdown, year-over-year comparison
- **Sprint 3**: Forecasting, budget targets, trend analysis
- **Sprint 4+**: DIV retirement visualization, notification system

// ─── Google OAuth2 + Drive Auth ──────────────────────────────────────────────
// Replace CLIENT_ID with your own from Google Cloud Console
// Scopes: drive.appdata = private app folder only accessible by this app

const AUTH_CONFIG = {
  CLIENT_ID: '819202299407-8iajo49ndgo4tb0furlu5qm1c04dkjf1.apps.googleusercontent.com',
  SCOPES: 'https://www.googleapis.com/auth/drive.appdata',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
};

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
  gapi.load('client', async () => {
    await gapi.client.init({ discoveryDocs: [AUTH_CONFIG.DISCOVERY_DOC] });
    gapiInited = true;
    maybeEnableSignIn();
  });
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: AUTH_CONFIG.CLIENT_ID,
    scope: AUTH_CONFIG.SCOPES,
    callback: async (resp) => {
      if (resp.error) { console.error(resp); return; }
      // Persist token expiry
      const expiresAt = Date.now() + (resp.expires_in * 1000) - 60000;
      localStorage.setItem('gapi_token_expiry', expiresAt);
      await window.AppDrive.loadOrInit();
      window.AppUI.showApp();
    },
  });
  gisInited = true;
  maybeEnableSignIn();
}

function maybeEnableSignIn() {
  if (!gapiInited || !gisInited) return;
  // Auto-sign-in if token still valid
  const expiry = parseInt(localStorage.getItem('gapi_token_expiry') || '0');
  if (Date.now() < expiry && gapi.client.getToken()) {
    window.AppDrive.loadOrInit().then(() => window.AppUI.showApp());
  } else {
    window.AppUI.showSignIn();
  }
}

function signIn() {
  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

function signOut() {
  const token = gapi.client.getToken();
  if (token) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    localStorage.removeItem('gapi_token_expiry');
  }
  window.AppUI.showSignIn();
}

// Silent refresh — called before Drive operations
async function ensureToken() {
  const expiry = parseInt(localStorage.getItem('gapi_token_expiry') || '0');
  if (Date.now() >= expiry) {
    await new Promise(resolve => {
      tokenClient.callback = async (resp) => {
        if (!resp.error) {
          const expiresAt = Date.now() + (resp.expires_in * 1000) - 60000;
          localStorage.setItem('gapi_token_expiry', expiresAt);
        }
        resolve();
      };
      tokenClient.requestAccessToken({ prompt: '' });
    });
  }
}

window.AppAuth = { gapiLoaded, gisLoaded, signIn, signOut, ensureToken };

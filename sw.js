const CACHE = 'expense-tracker-v1.0.0';
const ASSETS = [
  '/expense-tracker/',
  '/expense-tracker/index.html',
  '/expense-tracker/css/app.css',
  '/expense-tracker/js/app.js',
  '/expense-tracker/js/auth.js',
  '/expense-tracker/js/drive.js',
  '/expense-tracker/js/data.js',
  '/expense-tracker/js/ui.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

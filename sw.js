/* Service worker — 100% offline + controlled updates.
 * CACHE name carries the build hash, so each deploy gets a fresh cache and
 * old caches are purged on activate. The page requests hash-versioned asset
 * URLs (?v=<hash>), which this worker precaches, so a new build can never be
 * served stale code from the HTTP cache. */
const BUILD_HASH = '__BUILD_HASH__';
const CACHE = 'dua-omra-' + BUILD_HASH;
const V = '?v=' + BUILD_HASH;

// Hash-versioned app shell (must match the URLs index.html requests).
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest' + V,
  './css/fonts.css' + V,
  './css/styles.css' + V,
  './js/vendor/vue.global.prod.js' + V,
  './js/data.js' + V,
  './js/cats.js' + V,
  './js/app.js' + V,
  // Fonts and icons are referenced without a version query.
  './fonts/amiri-arabic-400.woff2',
  './fonts/amiri-arabic-700.woff2',
  './fonts/amiri-latin-400.woff2',
  './fonts/amiri-latin-700.woff2',
  './fonts/amiri-latin-ext-400.woff2',
  './fonts/amiri-latin-ext-700.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  // Do NOT skipWaiting here: a new version waits until the user taps "update".
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// The page asks the waiting worker to take over immediately.
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigation (the HTML document): network-first so new builds load promptly,
  // fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Same-origin static assets: cache-first (hash-versioned URLs are immutable).
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        });
      })
    );
    return;
  }

  // Cross-origin: just try the network (the app ships no external resources).
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});

const CACHE_VERSION = 'v1';
const APP_CACHE = `app-shell-${CACHE_VERSION}`;
const TILE_CACHE = `tile-cache-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  'index.html',
  'css/leaflet.css',
  'css/modern-ui.css',
  'css/map-extensions.css',
  'js/leaflet.js',
  'js/app-modern.js',
  'manifest.json'
];

// Maximum tile entries to keep
const MAX_TILE_ENTRIES = 300;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(k => k.indexOf(CACHE_VERSION) === -1).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const deleteCount = keys.length - maxItems;
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i]);
    }
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Strategy for OSM tiles (cache-first with size limit)
  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.match(/\/(tiles?|v\d)\//) ) {
    event.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const resp = await fetch(event.request);
          if (resp && resp.status === 200) cache.put(event.request, resp.clone());
          trimCache(TILE_CACHE, MAX_TILE_ENTRIES);
          return resp;
        } catch (err) {
          return caches.match('offline.html');
        }
      })
    );
    return;
  }

  // Network-first for API/data, fallback to cache
  if (event.request.method === 'GET' && (event.request.destination === '' || event.request.destination === 'document' || event.request.destination === 'script' || event.request.destination === 'style' || event.request.destination === 'image')) {
    event.respondWith(
      fetch(event.request).then((resp) => {
        // update app shell cache for navigations/resources
        if (event.request.mode === 'navigate' || event.request.destination === 'document') {
          caches.open(APP_CACHE).then((cache) => cache.put(event.request, resp.clone()));
        }
        return resp;
      }).catch(() => caches.match(event.request).then((r) => r || caches.match('./')))
    );
    return;
  }

  // Default: try cache, then network
  event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'CLEAR_TILE_CACHE') {
    caches.delete(TILE_CACHE);
  }
});
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('sig-senegal-cache').then(function(cache) {
        return cache.addAll([
        'index.html',
        './',
        'css/fontawesome-all.min.css',
        'css/leaflet.css',
        'js/app-modern.js',
        'images/',
        'icons/icon-192x192.svg',
        'icons/icon-512x512.svg',
        'icons/icon-192x192.png',
        'icons/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
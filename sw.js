const CACHE_VERSION = 'v1';
const APP_CACHE = `app-shell-${CACHE_VERSION}`;
const TILE_CACHE = `tile-cache-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  'index.html',
  'offline.html',
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
  /* Workbox-based service worker
     - precache app shell
     - runtime cache for OSM tiles with expiration
     - network-first for navigations with offline fallback
  */

  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

  if (workbox) {
    workbox.setConfig({debug: false});

    // Precaching important assets
    workbox.precaching.precacheAndRoute([
      {url:'/', revision: null},
      {url:'index.html', revision: null},
      {url:'offline.html', revision: null},
      {url:'css/leaflet.css', revision: null},
      {url:'css/modern-ui.css', revision: null},
      {url:'css/map-extensions.css', revision: null},
      {url:'css/pwa-mobile.css', revision: null},
      {url:'js/leaflet.js', revision: null},
      {url:'js/app-modern.js', revision: null},
      {url:'js/gps-control.js', revision: null},
      {url:'manifest.json', revision: null},
      {url:'icons/icon-192x192.png', revision: null},
      {url:'icons/icon-512x512.png', revision: null}
    ], {ignoreURLParametersMatching: [/.*/]});

    // Navigation route: network-first, fallback to offline.html
    workbox.routing.registerRoute(
      ({request}) => request.mode === 'navigate',
      new workbox.strategies.NetworkFirst({
        cacheName: 'pages-cache',
        plugins: [new workbox.expiration.ExpirationPlugin({maxEntries:50})]
      })
    );

    // Static resources: stale-while-revalidate
    workbox.routing.registerRoute(
      ({request}) => ['script','style','image','font'].includes(request.destination),
      new workbox.strategies.StaleWhileRevalidate({cacheName: 'static-resources', plugins: [new workbox.expiration.ExpirationPlugin({maxEntries:100})]})
    );

    // OSM tiles: cache-first with expiration and cacheable response
    workbox.routing.registerRoute(
      ({url}) => url.hostname.includes('tile.openstreetmap.org') || url.pathname.match(/\/(tiles?|v\d)\//),
      new workbox.strategies.CacheFirst({
        cacheName: 'osm-tiles',
        plugins: [
          new workbox.expiration.ExpirationPlugin({maxEntries:600, maxAgeSeconds: 30*24*60*60}),
          new workbox.cacheableResponse.CacheableResponsePlugin({statuses:[0,200]})
        ]
      })
    );

    // Fallback handler for failed navigation
    self.addEventListener('fetch', (event) => {
      if (event.request.mode === 'navigate') {
        event.respondWith(
          fetch(event.request).catch(() => caches.match('offline.html'))
        );
      }
    });

    // Message handlers
    self.addEventListener('message', (event) => {
      if (!event.data) return;
      if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
      if (event.data.type === 'CLEAR_TILE_CACHE') caches.delete('osm-tiles');
    });

  } else {
    console.error('Workbox failed to load');
  }
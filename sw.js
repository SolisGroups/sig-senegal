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
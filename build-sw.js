const {generateSW} = require('workbox-build');
const path = require('path');

(async () => {
  try {
    const swDest = path.join(process.cwd(), 'sw.js');
    const {count, size, warnings} = await generateSW({
      swDest,
      globDirectory: process.cwd(),
      globPatterns: [
        'index.html',
        'offline.html',
        'css/**/*.css',
        'js/**/*.js',
        'css/images/*.png',
        'css/images/*.gif',
        'images/*.gif',
        'images/*.png',
        'webfonts/*',
        'legend/*.png',
        'data/*.js'
      ],
      maximumFileSizeToCacheInBytes: 15000000,
      navigateFallback: 'offline.html',
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: ({url}) => url.hostname.includes('tile.openstreetmap.org'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'osm-tiles',
            expiration: {maxEntries: 600, maxAgeSeconds: 30 * 24 * 60 * 60},
            cacheableResponse: {statuses: [0, 200]}
          }
        },
        {
          urlPattern: /\/data\/.*\.js/,
          handler: 'StaleWhileRevalidate',
          options: {cacheName: 'data-files'}
        }
      ]
    });

    if (warnings && warnings.length) {
      console.warn('Workbox warnings:', warnings);
    }
    console.log(`Generated ${swDest}, which will precache ${count} files, totaling ${size} bytes.`);
  } catch (err) {
    console.error('Failed to generate service worker with Workbox:', err);
    process.exit(1);
  }
})();

const CACHE_NAME = 'heatmap-cache-v4';
const urlsToCache = [
  './',
  'index.html',
  'heat_map.html',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // CRITICAL: NEVER intercept POST requests or sync endpoint. Let them go straight to network.
  if (event.request.method !== 'GET' || event.request.url.includes('script.google.com')) {
    return;
  }

  // Use Network-First for HTML files 
  if (event.request.mode === 'navigate' || event.request.url.includes('.html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache-First for other assets (manifest, icons, etc)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

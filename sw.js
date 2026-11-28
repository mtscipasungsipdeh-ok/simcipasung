const CACHE_NAME = 'simcipasung-shell-v2';
const SHELL_ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_ASSETS).catch(function() {
        return Promise.resolve();
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  const reqUrl = event.request.url;
  if (reqUrl.indexOf('script.google.com') > -1 || reqUrl.indexOf('googleusercontent.com') > -1) {
    return;
  }

  // Selalu ambil file HTML terbaru langsung dari GitHub Pages (anti-cache lama)
  if (event.request.mode === 'navigate' || reqUrl.endsWith('.html') || reqUrl.endsWith('/')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

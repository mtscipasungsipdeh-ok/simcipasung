const CACHE_NAME = 'simcipasung-shell-v1';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_ASSETS).catch(function() {
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const reqUrl = event.request.url;
  // Jangan cache permintaan dinamis ke server Google Apps Script
  if (reqUrl.indexOf('script.google.com') > -1 || reqUrl.indexOf('googleusercontent.com') > -1) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
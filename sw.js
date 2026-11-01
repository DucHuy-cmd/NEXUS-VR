// NEXUS VR Service Worker for Offline Caching & PWA Support
const CACHE_NAME = 'nexus-vr-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './shop.html',
  './product.html',
  './cart.html',
  './checkout.html',
  './orders.html',
  './about.html',
  './contact.html',
  './manifest.json',
  './assets/css/global.css',
  './assets/css/variables.css',
  './assets/css/reset.css',
  './assets/images/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Ignore API requests from cache
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

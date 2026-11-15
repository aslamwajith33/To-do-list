// DAYFLOW - Progressive Web Application Service Worker
const CACHE_NAME = 'dayflow-v1.0.2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/css/main.css',
  '/css/components.css',
  '/css/views.css',
  '/js/app.js',
  '/js/store.js',
  '/js/gamification.js',
  '/js/quotes.js',
  '/js/icons.js',
  '/js/audio.js',
  '/js/confetti.js',
  '/js/charts.js',
  '/js/views/dashboardView.js',
  '/js/views/plannerView.js',
  '/js/views/bucketView.js',
  '/js/views/streakView.js',
  '/js/views/analyticsView.js',
  '/js/views/settingsView.js',
  '/assets/icons/icon-72.png',
  '/assets/icons/icon-96.png',
  '/assets/icons/icon-128.png',
  '/assets/icons/icon-144.png',
  '/assets/icons/icon-152.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-384.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-512.png'
];

// Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[DAYFLOW ServiceWorker] Pre-caching offline shell');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[DAYFLOW ServiceWorker] Removing outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First for static assets, Network-First for HTML navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Non-GET requests (e.g. POST) pass through
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // HTML navigation: Network first falling back to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/') || caches.match(request);
        })
    );
    return;
  }

  // Static Assets (JS, CSS, Images, Icons): Cache first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next load (Stale-While-Revalidate)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, networkResponse);
            });
          }
        }).catch(() => {/* Offline: safe to ignore */});

        return cachedResponse;
      }

      // Not in cache: fetch from network
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});


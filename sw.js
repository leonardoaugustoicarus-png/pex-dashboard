const CACHE_NAME = 'pex-dashboard-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache critical assets
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network first strategy for data, Cache first for assets could be implemented here.
  // For this basic version, we use Stale-While-Revalidate logic or simple Cache Fallback.
  
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Clone request for fetch
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check for valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache new response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                 // Do not cache Firestore requests to ensure real-time data
                 if (!event.request.url.includes('firestore.googleapis.com')) {
                    cache.put(event.request, responseToCache);
                 }
              });

            return response;
          }
        );
      })
  );
});
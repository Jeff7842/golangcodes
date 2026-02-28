const CACHE_NAME = 'golangcodes-cache-v1';

// We initially cache just the bare minimum needed to show an offline UI or install prompt
const urlsToCache = [
    '/',
    '/static/golangcodeslogo.jpeg',
    '/static/gopher.webp',
    '/static/main.js',
    '/static/storage.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    // Pass-through strategy for now, simply fetching from network.
    // The service worker exists primarily to satisfy PWA installability requirements initially.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

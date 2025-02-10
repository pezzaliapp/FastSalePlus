const CACHE_NAME = "fastsale-cache-v1";
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icon/FastSale-192.png",
    "./icon/FastSale-512.png"
];

// Installazione del Service Worker e caching dei file essenziali
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log("Caching dei file essenziali...");
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Attivazione e pulizia delle vecchie cache
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cache => cache !== CACHE_NAME)
                          .map(cache => caches.delete(cache))
            );
        })
    );
    self.clients.claim();
});

// Intercettazione delle richieste di rete e gestione della cache
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(() => {
                if (event.request.destination === "document") {
                    return caches.match("./index.html");
                }
            })
    );
});

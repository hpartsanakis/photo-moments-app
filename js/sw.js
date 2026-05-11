// =========================
// PHOTO MOMENTS APP
// SERVICE WORKER
// =========================

// Cache version
const CACHE_NAME = "photo-moments-cache-v1";

// Files to cache
const APP_ASSETS = [
  "./",
  "./index.html",

  "./css/style.css",

  "./js/script.js",
  "./js/image-db.js",

  "./manifest.json",

  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

// =========================
// INSTALL
// =========================

self.addEventListener("install", (event) => {
  console.log("Service Worker installed");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_ASSETS);
    }),
  );

  self.skipWaiting();
});

// =========================
// ACTIVATE
// =========================

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );

  self.clients.claim();
});

// =========================
// FETCH
// =========================

self.addEventListener("fetch", (event) => {
  // Ignore non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Clone response
          const responseClone =
            networkResponse.clone();

          // Save to cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(
              event.request,
              responseClone,
            );
          });

          return networkResponse;
        })
        .catch(() => {
          // Optional offline fallback
          if (
            event.request.destination ===
            "document"
          ) {
            return caches.match(
              "./index.html",
            );
          }
        });
    }),
  );
});
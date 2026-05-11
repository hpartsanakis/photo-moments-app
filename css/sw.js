// =========================
// PHOTO MOMENTS SERVICE WORKER
// =========================

const CACHE_NAME = "photo-moments-v1";

const APP_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/script.js",
  "/manifest.json",

  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// =========================
// INSTALL
// =========================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_ASSETS);
    }),
  );
});

// =========================
// FETCH
// =========================

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

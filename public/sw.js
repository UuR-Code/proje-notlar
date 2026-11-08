// Service Worker for Proje Notları PWA
const CACHE_NAME = "proje-notlar-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Pass through non-GET and API requests directly to network
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((res) => {
        if (res) return res;
        return caches.match("/");
      });
    })
  );
});

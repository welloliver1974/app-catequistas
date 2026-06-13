const CACHE = "app-catequistas-v3"

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
]

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  const url = new URL(event.request.url)

  if (
    event.request.mode === "navigate" ||
    url.origin !== self.location.origin
  ) {
    return
  }

  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    )
    return
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

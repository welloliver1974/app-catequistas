const CACHE = "app-catequistas-v1"

const STATIC_ASSETS = [
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE).then((cache) => {
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, clone)
          }
        })
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
})

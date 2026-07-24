const CACHE = "app-catequistas-v4"

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

// ─── Push Notifications ──────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "App Catequistas", body: "", icon: "/icons/icon-192.svg", badge: "/icons/icon-192.svg", data: {} }
  try {
    const payload = event.data?.json()
    if (payload) data = { ...data, ...payload }
  } catch {}

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    vibrate: [200, 100, 200],
    tag: "catequistas-push",
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url || "/presenca"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const matchingClient = windowClients.find((c) => c.url.includes(self.location.host))
      if (matchingClient) {
        return matchingClient.focus()
      }
      return clients.openWindow(url)
    })
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => clients.claim())
  )
})

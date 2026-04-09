const CACHE_NAME = 'livesign-display-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS)
      })
  )
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Handle display routes specially
  if (event.request.url.includes('/display/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If fetch succeeds, cache the response
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // If fetch fails, try to serve from cache
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response
              }
              // If not in cache, return offline page
              return caches.match('/offline.html')
            })
        })
    )
    return
  }

  // Handle image requests (cache first strategy)
  if (event.request.url.includes('/storage/v1/object/public/content/') ||
      event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response
          }
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone)
                  })
              }
              return response
            })
        })
        .catch(() => {
          // Return a placeholder image if available
          return caches.match('/images/placeholder.png')
        })
    )
    return
  }

  // For all other requests, try network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
      })
  )
})
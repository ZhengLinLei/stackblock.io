//GET VERSION
const CACHE_VERSION = "1.0.0";
const CURRENT_CACHE = `sbio-v${CACHE_VERSION}`;
let filesToCache = [
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap",
  "./css/style.css",
  "./source/ico.ico",
  "./source/ico.png",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js",
  "https://cdn.jsdelivr.net/npm/party-js@latest/bundle/party.min.js",
  "./js/script.min.js"
];
//INSTALL
self.addEventListener("install", eo => {
  console.log("Installing service worker");
  eo.waitUntil(
    caches.open(CURRENT_CACHE)
      .then(cache => {
        console.log("Caching...")
        cache.addAll(filesToCache);
      })
  );
});
// on activation we clean up the previously registered service workers
self.addEventListener('activate', evt => {
  console.log("Activating service worker");
  evt.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CURRENT_CACHE) {
            console.log("Deleting old cache");
            return caches.delete(cacheName);
          }
        })
      )
    })
  );
});
const updateCache = request => {
  if (!request.url.includes(".woff")) {
    caches.open(CURRENT_CACHE)
      .then(cache => {
        cache.match(request)
          .then(response => {
            if (response) {
              fetch(request)
                .then(res => {
                  cache.put(request, res.clone());
                });
            }
          })
      })
  }
}

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CURRENT_CACHE)
      .then(cache => {
        return cache.match(event.request.url)
          .then(response => {
            return (response) ? response : fetch(event.request);
          })
      })
      .catch(err => {
        return caches.open(CURRENT_CACHE)
          .then(cache => {
            return cache.match('./offline');
          })
      })
  );
  updateCache(event.request);
});
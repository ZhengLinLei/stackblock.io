//GET VERSION
const CACHE_VERSION = "1.0.6-b1";
const CURRENT_CACHE = `sbio-v${CACHE_VERSION}`;
let filesToCache = [
  "./manifest.json",
  "https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500&display=swap",
  "https://fonts.gstatic.com/s/sourcecodepro/v23/HI_SiYsKILxRpg3hIP6sJ7fM7PqlPevWnsUnxg.woff2",
  "./css/style.css",
  "./img/ico.ico",
  "./img/ico.png",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/cannon.js/0.6.2/cannon.min.js",
  "https://cdn.jsdelivr.net/npm/party-js@latest/bundle/party.min.js",
  "./js/script.min.js",
  `./sw.js?v=${CACHE_VERSION}`,
  "./js/pwa/pwa.min.js",
  // "./js/lib/png2share.min.js",
  "./index.html",
  "./",
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

const updateRequest = (request, response) => {
  if (!request.url.includes(".woff")) {
    caches.open(CURRENT_CACHE)
    .then(cache => {
      cache.match(request)
        .then(res => {
          if (res) {
            cache.put(request, response);
          }
        })
    })
  }
}

self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      if(navigator.onLine) {
        // Fetch the resource from the network. And update cache.
        const response = await fetch(event.request);

        if (response) {
          updateRequest(event.request, response.clone());
        }

        return response;
      }

      // Otherwise return cache if error found or item not found 
      // Ask for refresh the page
      return await caches.match(event.request);
    })()
  );
});